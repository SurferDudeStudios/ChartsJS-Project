// JavaScript Document - ChartsJS-Project
// Requires https://www.chartjs.org to be included

//json url - absolute url of JSON source - must be same server
var jsonURL = '';

//Global variables
var altKeyHeight = [900, 1036, 1036, 928, 1036];
var amendChartData = true;
var animationTime = 500;
var chartDiameter = 120;
var chartContainerHeights = [180,260,385,260,270];
var bandHeightMobile = (chartDiameter - 20);
var desktopView = true;
var firstLoad = true;
var keyHeight = [];
var logHeights = [86,86,86,86,220];
var mobileBreakPoint = 991;
var rawKey = {};
var tab1Animation = false;
var tab3Animation = false;
//Tooltips disable = false, enable = true
Chart.defaults.global.tooltips.enabled = false;

//Document ready
$(document).ready(function () {
  //Prep the page ahead of loading the charts
  $(".loadingContainer").show();
  $("#chartsjs-application").hide();
  $("#chartsjs-application-menu").hide();	
  //Get the profile charts key from json
  setChartColours();
  //Build the key heights array
  buildkeyHeightArray();
  //Check for url parameters and action them
  var activeProfile = activeTabHandler(checkUrlParameters());
  //Switch to the correct pane and handle menu changes
  changeMenuSelect(activeProfile);
  changeMenuTop(activeProfile);
  profileGuideLoad(activeProfile);
  //Check and set the desktopView variable if necessay
  if (checkIsMobile()) {
    desktopView = false;
    resetContainerHeight(returnTabID(activeProfile));
  };
  amendLayoutHandler();
  //Switch out the loader for the chartsjs application
  $(".loadingContainer").hide();
  $("#chartsjs-application-menu").show();
  $("#chartsjs-application").show();
  animationHandler();
});
//End of Document ready function

//User actions
// if in tab mode
$('ul.nav-list li a').click(function (event) {
  //If the window is larger than mobile and the tab is not already selected
  if (checkIsDesktop()) {
    var navPane = this.getAttribute('aria-controls');
    if (returnActiveMenu() != navPane) {
	  firstLoad = false;
      profileTransitionDesktop(navPane);
	  animateChartContainerHeight(returnTabID(navPane));
    };
  };
});

// if in select mode
$("select.chartsjs-application-select").change(function (event) {
  //If the window is smaller than mobile and the tab is not already selected
  if (checkIsMobile()) {
    var navPane = this.value
    if (returnActiveMenu() != navPane) {
	  firstLoad = false;
      profileTransitionMobile(navPane);
    };
  };
});

//Handle window resizing
$(window).on('resize', function () {
  //The viewport has changed from desktop to mobile
  var tab = activeTabHandler(checkUrlParameters());
  if (windowWidthCheck() && desktopView) {
	firstLoad = false;
    desktopView = false;
    removeStyleContent();
	removeParentStyle();
	profileTransitionMobile(tab);
  };
  //The viewport has changed from mobile to desktop
  if (!windowWidthCheck() && !desktopView) {
	firstLoad = false;
    desktopView = true;
    removeStyleContent();
	removeParentStyle();
	profileTransitionDesktop(tab);
	animateChartContainerHeight(returnTabID(navPane));
  };
});
//End of user actions

//Functions - animations at bottom
//handle the active tab
function activeTabHandler(theTab) {
  if (typeof theTab == 'undefined' || theTab == false) {
    theTab = 'tab1';
  };
  return theTab;
};

//Amend layout Handler
function amendLayoutHandler() {
  var activeProfile = activeTabHandler(checkUrlParameters());
  var activeID = returnTabID(activeProfile);
  switch (activeProfile) {
    //animation for Aegon
    case "tab1":
      animateToPlace(activeID);
	  animateGuideImageIn(logHeights[activeID]);
      break;
      //animation for Defaqto
    case "tab2":
      animateToPlace(activeID);
	  animateGuideImageIn(logHeights[activeID]);
      break;
      //animation for Dynamic planner
    case "tab3":
      animateToPlace(activeID);
	  animateGuideImageIn(logHeights[activeID]);
      break;
      //animation for Finametrica
    case "tab4":
      animateToPlace(activeID);
	  animateGuideImageIn(logHeights[activeID]);
	  animateBestFitLabel(1);
      break;
      //animation for Synaptic
    case "tab5":
      animateToPlace(activeID);
	  animateGuideImageIn(logHeights[activeID]);
      break;
      //Default animation
    default:
      animateToPlace(activeID);
	  animateGuideImageIn(86);
  };
  animateHideDefaultTabKey(activeID);
};

//Change the url parameter in select mode
function appendURL(val) {
  var url = "";
  if (checkUrlParameters()) {
    url = window.location.href;
    url = url.slice(0, url.indexOf('#'));
  }
  window.location = url + '#' + val;
};

//Clean up canvas id - remove any spaces
function canvasID(id) {
  return id.split(" ").join("-").toLowerCase();
};

//Build the key height array
function buildkeyHeightArray() {
  $.getJSON(jsonURL, function (profiles) {
    var obj = jQuery.parseJSON(JSON.stringify(profiles));
    $.each(obj.profiles, function (i) {
      //Build the keyHeight array
      keyHeight[i] = obj.profiles[i].profile_key_height;
    });
  });
};

//Handle the caveat change
function caveatChange(profileCharts, id) {
  var caveat = profileCharts[id].profile_caveat;
  $('#chart-caveat p:first').html(caveat);
};

//Change the data-chart-value attribute of the charts
function changeChartsDataBandValue(keyInfo) {
  $.each(keyInfo.profile_charts, function (i) {
    $('.chart-canvas:eq(' + i + ')').attr('data-chart-value', keyInfo.profile_charts[i].profile_chart_band);
  });
};

//Handle the select / option change
function changeMenuSelect(tab) {
  var selectedTab = $('select.chartsjs-application-select').val();
  //If there is a selected tab
  if (selectedTab) {
    //If there is a selected tab and it is not the new tab
    if (tab != selectedTab) {
      $('select.chartsjs-application-select').val(tab);
    };
  } else {
    $('select.chartsjs-application-select').val(tab);
  };
};

//Handle the top menu change
function changeMenuTop(tab) {
  $("ul.nav-list li a").attr('aria-selected', 'false').parent().removeClass('active');
  $("#chartsjs-application-menu a[aria-controls|='" + tab + "']").attr('aria-selected', 'true').parent().addClass('active');
};

//Build the pie chart js
function chartBuild(chartID, chartName, rawChartData) {
  //check the chart data for 0 value and remove it from array
  var zeroCheckArray = zeroCheck(rawChartData);
  var chartData = handleChartData(zeroCheckArray[0]);
  var labels = labelCheck(zeroCheckArray[1]);
  var brands = zeroCheckArray[2];

  var ctx = document.getElementById(chartID).getContext('2d');
  var myChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        label: chartName,
        data: chartData,
        backgroundColor: brands,
        borderColor: '#ffffff',
        borderWidth: 1
      }]
    },
    options: {
      cutoutPercentage: 75,
      legend: {
        display: false
      },
      elements: {
        center: {
          text: chartName,
          color: '#333333', //Default black
          fontStyle: 'ss_rg', //Default Arial
          sidePadding: 15 //Default 20 (as a percentage)
        }
      },
      tooltips: {
        callbacks: {
          label: function (tooltipItem, data) {
            return data['labels'][tooltipItem['index']] + ': ' + data['datasets'][0]['data'][tooltipItem['index']] + '%';
          }
        }
      },
    }
  });
};

//Handle the chart guide Build
function chartGuideBuild(chartProfiles, id) {
  var output = paneKeyMaster(chartProfiles, id);
  $('#profile-key').html(output);
  var newText = chartProfiles.profile_name;
  $('#chart-guide img').attr('src', chartProfiles.profile_logo);
};

//Default content for the chart guide
function chartLabelBuild(keyInfo, id) {
  if (keyInfo.canvas_labels) {
    $.each(keyInfo.profile_charts, function (i) {
      var canavasDataBandValue = keyInfo.profile_charts[i].profile_chart_band;
	  if(checkIsDesktop()){
		  var output = "<p class='canvas-label'>" + canavasDataBandValue + "%</p>";
	  };
	  if(checkIsMobile()){
		  var output = "<p class='canvas-label'>" + canavasDataBandValue + "%</p>";
	  };
      $('.chart-canvas[data-chart-value|=' + canavasDataBandValue + ']').append(output);
    });
  };
};

//Default content for the chart guide
function chartLabelClear() {
  $('p.canvas-label').remove();
};

//Check for url parameters and acxtion them if required
function checkUrlParameters() {
  //Get the url parameter
  var pageURL = window.location.href;
  var tab = pageURL.split('#')[1];
  //If the parameter exists - check it is not undefined and exists
  if (typeof tab !== 'undefined' && checkParamExists(tab)) {
    return tab;
  } else {
    return false;
  };
};

//Check the menu for the tab id
function checkParamExists(tab) {
  if ($("#chartsjs-application-tool-menu a[aria-controls='" + tab + "']").length) {
    return true;
  } else {
    return false;
  };
};

//Function to check if in desktop view
function checkIsDesktop() {
  if (!windowWidthCheck()) {
    return true;
  } else {
    return false;
  };
};

//Function to check if in mobile view
function checkIsMobile() {
  if (windowWidthCheck()) {
    return true;
  } else {
    return false;
  };
};

//get the number of items in a band
function getNumberOfItems(bandName) {
  var returnNumber = $('.chart-canvas[data-chart-value="' + bandName + '"]').length;
  return returnNumber;
};

//get the number of items in a range
function getNumberOfItemsInRange(keyInfo) {
  var lowerRange = keyInfo[0].bottom;
  var UpperRange = keyInfo[0].top;
  var returnNumber = 0;
  $('.chart-canvas').each(function (i) {
    var theValue = $('.chart-canvas:eq(' + i + ')').attr('data-chart-value');
    if (theValue <= UpperRange && theValue >= lowerRange) {
      returnNumber++;
    };
  });
  return returnNumber;
};

//Handle and return the chart data
function handleChartData(chartData) {
  if (amendChartData) {
    //This function could be improved for better displlay of the chart data in the doughnut
    var amendedChartData = [];
    for (var i = 0; i < chartData.length; i++) {
      var theValue = chartData[i].toFixed(2);
      if (Math.floor(theValue) == theValue && $.isNumeric(theValue)) {
        theValue = Math.round(theValue);
      };
      amendedChartData.push(theValue);
    };
    return amendedChartData;
  } else {
    return chartData;
  };
};

//Check if the canvas title is a two word text
function hasWhiteSpace(s) {
  return s.indexOf(' ') >= 0;
};

//Handle discrepancies transitioning between tab1 and 3
function heightCheck(){
  var activeProfile = activeTabHandler(checkUrlParameters());
  var returnValue = "";
  var ccpc = $('.chart-canvas-parent-container').height();
  if (checkIsDesktop){
	if(activeProfile == 'tab3' && ccpc == 212){
	 returnValue = '+=165';
	}else if(activeProfile == 'tab1' || activeProfile == 'undefined'){
	 if(tab3Animation){
	    returnValue = 'fireAmend';
	 }else{
		returnValue = 'noAmend';
	 };
	}else{
	 returnValue = '+=120';
	};
  };
  return returnValue;
};

//Basic key build
function keyBasicBuild(keyInfo) {
  var itemsNum = getNumberOfItems(keyInfo);
  var activeProfile = activeTabHandler(checkUrlParameters());
  if (checkIsMobile()) {
    var bandStyle = 'height: ' + bandHeightMobile + 'px;';
    if (itemsNum == 0) {
      itemsNum = 1;
    };
    var bandLabelStyle = 'padding-top: '+((bandHeightMobile/2)-12)+'px;';
  };
  if (checkIsDesktop()) {
    var bandStyle = '';
    var bandLabelStyle = '';
  };
  if(activeProfile == 'tab1'){
	var bandClass = "band hidden"; 
  }else{
	var bandClass = "band";  
  };
  return '<div class="'+bandClass+'" style="' + bandStyle + '"><p class="band-label" style="' + bandLabelStyle + '">' + keyInfo + '</p></div>';
};

//Key load for Dynamic / Defaqto and synaptic
function keyBuildStyle1(keyInfo, id) {
  changeChartsDataBandValue(keyInfo);
  var output = '';
  $.each(keyInfo.profile_bands, function (i) {
    $.each(keyInfo.profile_bands[i], function (j) {
      output += keyBasicBuild(keyInfo.profile_bands[i][j]);
    });
  });
  return output;
};

//Key load for Finametrica
function keyBuildTab4(keyInfo, id) {
  changeChartsDataBandValue(keyInfo);
  var output = '';
  $.each(keyInfo.profile_bands, function (i) {
    $.each(keyInfo.profile_bands[i], function (j) {
      var rangeTop = keyInfo.profile_bands[i][j][0].top;
      var rangeBottom = keyInfo.profile_bands[i][j][0].bottom;
      var rangeItemsNum = getNumberOfItemsInRange(keyInfo.profile_bands[i][j]);
      if (checkIsMobile()) {
        var valFirst = rangeBottom;
        var valSecond = rangeTop;
        var bandStyle = 'height: '+((chartDiameter)+10)+'px;';
        if (rangeItemsNum == 0) {
          rangeItemsNum = 1;
        };
        var bandLabelStyle = 'padding-top: '+((((chartDiameter)+10)/2)-18)+'px;';
      };
      if (checkIsDesktop()) {
        var valFirst = rangeBottom;
        var valSecond = rangeTop;
		var bandStyle = 'width: 14.285%;';
        var bandLabelStyle = '';
      };
      output += '<div class="band" style="' + bandStyle + '"><p class="band-label" style="' + bandLabelStyle + '">' + valFirst + " -  " + valSecond + '</p></div>';
    });
  });
  return output;
};

//Default Key load for Aegon / Dynamic / Defaqto and synaptic
function keyBuildStyleDefault(keyInfo, id) {
  changeChartsDataBandValue(keyInfo);
  var output = '';
  $.each(keyInfo.profile_bands, function (i) {
    $.each(keyInfo.profile_bands[i], function (j) {
      output += keyBasicBuild(keyInfo.profile_bands[i][j]);
    });
  });
  return output;
};

//Look up and return the chart name and colour
function keyNameColurLookup(rawChartName) {
  var chartName = rawChartName.replace('chart_', '');
  chartName = chartName.substr(0, 1).toUpperCase() + chartName.substr(1);
  chartName = chartName.split("_").join(" ");
  var chartColour = "";
  $.each(rawKey, function (key, value) {
    if (key == chartName) {
      chartColour = value;
    };
  });
  return [chartName, chartColour];
};

//Check and handle labels with more than one word
function labelCheck(label) {
  var lbl = [];
  for (var i = 0; i < label.length; i++) {
    lbl.push(label[i].split("_").join(" "));
  };
  return lbl;
};

//Master function for the profiles and chart build
function paneDataMaster(obj, id) {
  var profileID = obj[id].profile_id;
  var profileCharts = obj[id].profile_charts;
  $('#profile-name').html(obj[id].profile_name + ' profile chart');
  //Repeat to build the charts in the canvases
  populateCharts(profileCharts, profileID);
};

//Load the chart data
function paneKeyMaster(keyObject, id) {
  chartLabelClear();
  if (checkUrlParameters()) {
    $('#profile-key').removeClass('hidden');
  };
  var output = "";
  switch (id) {
    case 0:
      //Action for Aegon
      output = keyBuildStyleDefault(keyObject, id);
      chartLabelBuild(keyObject, id);
      break;
    case 1:
      //Action for Defaqto
      output = keyBuildStyle1(keyObject, id);
      chartLabelBuild(keyObject, id);
      break;
    case 2:
      //Action for Dynamic planner
      output = keyBuildStyle1(keyObject, id);
      chartLabelBuild(keyObject, id);
      break;
    case 3:
      //Action for Finametrica
      output = keyBuildTab4(keyObject, id);
      chartLabelBuild(keyObject, id);
      break;
    case 4:
      //Action for Synaptic
      output = keyBuildStyle1(keyObject, id);
      chartLabelBuild(keyObject, id);
      break;
    default:
      //Action for Aegon - should not be required
      output = keyBuildStyleDefault(keyObject, id);
      chartLabelBuild(keyObject, id);
  };
  $('#' + keyObject.profile_id + '-profile-key').html(output);
  return output;
};

//Populate the charts with data
function populateCharts(profileCharts, profileID) {
  $.each(profileCharts, function (i) {
    //Build each chart
    var profileChartComp = profileCharts[i].profile_chart_composition;
    var profileChartName = profileCharts[i].profile_chart_name;
    var profileChartBand = profileCharts[i].profile_chart_band;
    $.each(profileChartComp, function (j) {
      //build the chart using the chartBuild() function
      chartBuild(canvasID(profileChartName), profileChartName, profileChartComp[j]);
      $('#' + canvasID(profileChartName)).parent().attr('data-chart-value', profileChartBand);
    });
  });
};

//Handle the profile load
function profileGuideLoad(loadPane) {
  $.getJSON(jsonURL, function (profiles) {
    var obj = jQuery.parseJSON(JSON.stringify(profiles));
    var id = returnTabID(loadPane);
    //layout individual profile
	if(firstLoad){
	  paneDataMaster(obj.profiles, id);   
	};
    caveatChange(obj.profiles, id);
    //layout individual key and overwrite the existing
    chartGuideBuild(obj.profiles[id], id);
  });
};

//Handle the change in desktop mode
function profileTransitionDesktop(navPane) {
  event.preventDefault();
  animationReset(returnActiveMenu());
  transitionProfile(navPane);
  amendLayoutHandler();
  profileGuideLoad(navPane);
  animationHandler();
};

//Handle the change in mobile mode
function profileTransitionMobile(navPane) {
  event.preventDefault();
  animationReset(returnActiveMenu());
  transitionProfile(navPane);
  amendLayoutHandler();
  profileGuideLoad(navPane);
  resetContainerHeight(returnTabID(navPane));
  animationHandler();
};

//Remove layout for mobile view
function removeStyleContent() {
  $('.chart-canvas, .chart-guide, .chart-canvas-container, .chart-group').removeAttr('style');
  $('.chart-canvas:eq(6)').removeAttr('style');
};

//Remove parent style
function removeParentStyle() {
  $('.chart-canvas-parent-container, .profile-key-container').attr("style", "");
  $('.chart-canvas-parent-container, .profile-key-container').removeAttr('style');
};

//Reset the height of the profile container based on the key
function resetContainerHeight(id) {
  if (checkIsMobile()) {
    var theHeight = 0;
    if (typeof keyHeight[id] == 'undefined') {
      theHeight = setKeyHeightFirstLoad(id);
    } else {
      theHeight = keyHeight[id];
    };
    $('.chart-canvas-container, .chart-group').animate({height: theHeight},{'duration': animationTime,'queue': false});
  };
};

//Get the array id of a tab
function returnTabID(tab) {
  return (tab.substr(3) - 1);
};

//Get the id of the active pane
function returnActiveMenu() {
  var activeMenu = $('.tab.active a').attr('aria-controls');
  return activeMenu;
};

//Set the chart colours from JSON file
function setChartColours() {
  $.getJSON(jsonURL, function (chartKey) {
    var keyObj = jQuery.parseJSON(JSON.stringify(chartKey));
    $.each(keyObj.chartKey, function (i) {
      //Build the rawkey array
      $.each(keyObj.chartKey[i], function (j) {
        rawKey[j] = keyObj.chartKey[i][j];
      });
    });
  });
};

//Currently required for page load
//Asynchronous solution to be developed going forward
function setKeyHeightFirstLoad(id) {
  return altKeyHeight[id];
};

//Fade in for the chart guide and key
function transitionProfile(navPane) {
  if (navPane != returnActiveMenu()) {
    $('#chart-guide').fadeOut(0);
    $('#profile-key').fadeOut(0);
    //Handle menu changes
    changeMenuSelect(navPane);
    changeMenuTop(navPane);
    //Handle url changes
    appendURL(navPane);
    $('#chart-guide').fadeIn(animationTime);
    $('#profile-key').fadeIn(animationTime);
  };
};

//Check the width of the window is not with in the diaganol range
function windowWidthCheck() {
  if ($(window).width() <= mobileBreakPoint) {
    return true;
  };
};

//function to check the chart data for 0 value and remove it from array
function zeroCheck(chartData) {
  //ChartData is JSON object
  var chartLabels = Object.keys(chartData);
  var chartValues = Object.values(chartData);
  var returnArray = [[],[],[]];
  //for the length of the chart data do something if it does not contain 0
  for (var i = 0; i < chartLabels.length; i++) {
    if (chartValues[i] !== 0) {
      var chartKey = keyNameColurLookup(chartLabels[i]);
      returnArray[0].push(chartValues[i]);
      returnArray[1].push(chartKey[0]);
      returnArray[2].push(chartKey[1]);
    };
  };
  return returnArray;
};

//Animations
//Handle animation of left for finemtrica
function animateChartContainerHeight(id) {
  if (checkIsDesktop()) {
	  var theHeight = chartContainerHeights[id];
	  $('.chart-canvas-parent-container').animate({height: theHeight},{'duration': animationTime,'queue': false});
  };
};

//Handle animation of left for finemtrica
function animateLeftFinemetrica() {
  var activeProfile = activeTabHandler(checkUrlParameters());
  if (checkIsMobile()) {
    if (activeProfile == 'tab4') {
      $('.chart-group').animate({right: 70},{'duration': animationTime,'queue': false});
    }else{
	  $('.chart-group').animate({right: 0},{'duration': animationTime,'queue': false});
	};
  };
};

//Handle animation to hide the aegon key
function animateHideDefaultTabKey(id) {
	if (checkIsDesktop()) {
		if(id == 0 && tab1Animation == false){
		  tab1Animation = true;
		  var theHeight = heightCheck();
		  $('.profile-key-container').animate({height: 0,paddingTop: 0},{'duration': animationTime,'queue': false});
		  $('.best-fit.hidden-sm.hidden-xs').animate({height: 0},{'duration': animationTime,'queue': false});
		  $('.chart-canvas-parent-container').animate({height: chartContainerHeights[0]},{'duration': animationTime,'queue': false});
		};
		if(tab1Animation == true){
		  tab1Animation = false;
		};
	};
};

//Animate the chart to json directed position
function animateToPlace(id) {
  var activeProfile = activeTabHandler(checkUrlParameters());
  if(activeProfile != 'tab4'){
    animateBestFitLabel(0);
  };
  $.getJSON(jsonURL, function (chartAnimation) {
    var obj = jQuery.parseJSON(JSON.stringify(chartAnimation));
    $.each(obj.profiles[id].profile_charts, function (i) {
      if (checkIsDesktop()) {
        var animationValue = obj.profiles[id].profile_charts[i].profile_chart_position_horizontal;
        animationValue = animationValue + '%';
      } else {
        var animationValue = obj.profiles[id].profile_charts[i].profile_chart_position;
      };
      var theCanvas = '.chart-canvas:eq(' + i + ')';
      if (checkIsDesktop()) {
        $(theCanvas).animate({right: animationValue},{'duration': animationTime,'queue': false});
      } else {
        $(theCanvas).animate({top: animationValue},{'duration': animationTime,'queue': false});
		animateLeftFinemetrica();
      };
    });
  });
};

//Handle the animation for dynamic
function animateTab3() {
    if (checkIsDesktop()) {
	  var theHeight = 391;
      $('.chart-canvas-parent-container').animate({top: '+=120',height: theHeight},{'duration': animationTime,'queue': false});
	  $('.chart-canvas-container').animate({backgroundPositionY:'+=118'},{'duration': animationTime,'queue': false});
      $('.profile-key-container, .best-fit, .chart-canvas:lt(6)').animate({top: '+=120'},{'duration': animationTime,'queue': false});
      $('.chart-canvas:eq(6)').animate({top: 0},{'duration': animationTime,'queue': false});
    };
	if (checkIsMobile()) {
	  $('.chart-canvas-parent-container, .profile-key-container').attr("style", "");
	  $('.chart-canvas:eq(6)').animate({right: 120},{'duration': animationTime,'queue': false});
    };
};

//Reverse the animation for dynamic
function reverseAnimateTab3() {
    if (checkIsDesktop()) {
	  $('.chart-canvas-parent-container').animate({top: '-=120',},{'duration': animationTime,'queue': false});
	  $('.chart-canvas-container').animate({backgroundPositionY:'-=118'},{'duration': animationTime,'queue': false});
    };
	if (checkIsMobile()) {
	  $('.chart-canvas:eq(6)').animate({right: 0},{'duration': animationTime,'queue': false});
    };
};

//animate the best fit label
function animateBestFitLabel(val) {
  $('.best-fit p').animate({opacity: val}, {'duration': animationTime,'queue': false});
};

//animation for the guide image / logo
function animateGuideImageIn(theHeight) {
  if(checkIsDesktop()){
   $('.chart-guide').animate({height: theHeight}, {'duration': animationTime,'queue': false});
  };
};

//animation master function
function animationHandler() {
  var activeProfile = activeTabHandler(checkUrlParameters());
  if (activeProfile == 'tab3') {
    tab3Animation = true;
    animateTab3();
  };
  if (activeProfile != 'tab3' && tab3Animation == true) {
    tab3Animation = false;
    reverseAnimateTab3();
  };
};

//animation master function
function animationReset(currentTab) {
  if(currentTab == 'tab3') {
	if(checkIsDesktop()){
	 $('.chart-canvas-parent-container').animate({top: '-=120',height: '-=120'}, {'duration': animationTime,'queue': false});
     $('.profile-key-container, .best-fit').animate({top: '-=120'},{'duration': animationTime,'queue': false});
     $('.chart-canvas').animate({top: 0}, {'duration': animationTime,'queue': false});
	};
  }else if(currentTab == 'tab4'){
	animateBestFitLabel(0); 
  }else{	   
  };
};

//Plugins
//Plug into handle the middle title of the chart
// https://stackoverflow.com/questions/20966817/how-to-add-text-inside-the-doughnut-chart-using-chart-js
Chart.pluginService.register({
  beforeDraw: function (chart) {
    if (chart.config.options.elements.center) {
      //Get ctx from string
      var ctx = chart.chart.ctx;

      //Get options from the center object in options
      var centerConfig = chart.config.options.elements.center;
      var fontStyle = centerConfig.fontStyle || 'Arial';
      var txt = centerConfig.text;
      var color = centerConfig.color || '#000000';
      var sidePadding = centerConfig.sidePadding || 20;
      var sidePaddingCalculated = (sidePadding / 100) * (chart.innerRadius * 2)
      //Start with a base font of 30px
      ctx.font = "30px " + fontStyle;

      //Get the width of the string and also the width of the element minus 10 to give it 5px side padding
      var stringWidth = ctx.measureText(txt).width;
      var elementWidth = (chart.innerRadius * 2) - sidePaddingCalculated;

      //Set font settings to draw it correctly.
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      var fontSizeToUse = 16;
      var chartx = chart.chartArea.left + chart.chartArea.right;
      var charty = chart.chartArea.top + chart.chartArea.bottom;
      ctx.font = fontSizeToUse + "px " + fontStyle;
		
	  ctx.beginPath();
      ctx.arc(((chartx) / 2), ((charty) / 2), 59, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.fillStyle = color;

      // Pick a new font size so it will not be larger than the height of label.
      if (hasWhiteSpace(txt)) {
        //split string into an array
        var lines = txt.split(' ');
        var centerX = ((chartx) / 2);
        var centerY = (((charty) / 2) - 6);
        //Draw text in center - use loop for array items
        for (var i = 0; i < lines.length; i++) {
          ctx.fillText(lines[i], centerX, centerY + (i * 16));
        };
      } else {
        var lines = txt;
        var centerX = ((chartx) / 2);
        var centerY = ((charty) / 2);
        //Draw text in center
        ctx.fillText(lines, centerX, centerY);
      };
    }
  }
});