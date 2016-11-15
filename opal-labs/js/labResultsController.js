var myApp = angular.module('myApp');
myApp.controller('LabResultsController', ['LabResults','RequestToServer','$scope','$timeout','EncryptionService', function (LabResults,RequestToServer, $scope,$timeout,EncryptionService) {
    console.log('heelo');
    Highcharts.theme = {
   colors: ['#2b908f', '#90ee7e', '#f45b5b', '#7798BF', '#aaeeee', '#ff0066', '#eeaaee',
      '#55BF3B', '#DF5353', '#7798BF', '#aaeeee'],
   chart: {
      backgroundColor: {
         linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
         stops: [
            [0, '#2a2a2b'],
            [1, '#3e3e40']
         ]
      },
      style: {
         fontFamily: '\'Unica One\', sans-serif'
      },
      plotBorderColor: '#606063'
   },
   title: {
      style: {
         color: '#E0E0E3',
         textTransform: 'uppercase',
         fontSize: '20px'
      }
   },
   subtitle: {
      style: {
         color: '#E0E0E3',
         textTransform: 'uppercase'
      }
   },
   xAxis: {
      gridLineColor: '#707073',
      labels: {
         style: {
            color: '#E0E0E3'
         }
      },
      lineColor: '#707073',
      minorGridLineColor: '#505053',
      tickColor: '#707073',
      title: {
         style: {
            color: '#A0A0A3'

         }
      }
   },
   yAxis: {
      gridLineColor: '#707073',
      labels: {
         style: {
            color: '#E0E0E3'
         }
      },
      lineColor: '#707073',
      minorGridLineColor: '#505053',
      tickColor: '#707073',
      tickWidth: 1,
      title: {
         style: {
            color: '#A0A0A3'
         }
      }
   },
   tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      style: {
         color: '#F0F0F0'
      }
   },
   plotOptions: {
      series: {
         dataLabels: {
            color: '#B0B0B3'
         },
         marker: {
            lineColor: '#333'
         }
      },
      boxplot: {
         fillColor: '#505053'
      },
      candlestick: {
         lineColor: 'white'
      },
      errorbar: {
         color: 'white'
      }
   },
   legend: {
      itemStyle: {
         color: '#E0E0E3'
      },
      itemHoverStyle: {
         color: '#FFF'
      },
      itemHiddenStyle: {
         color: '#606063'
      }
   },
   credits: {
      style: {
         color: '#666'
      }
   },
   labels: {
      style: {
         color: '#707073'
      }
   },

   drilldown: {
      activeAxisLabelStyle: {
         color: '#F0F0F3'
      },
      activeDataLabelStyle: {
         color: '#F0F0F3'
      }
   },

   navigation: {
      buttonOptions: {
         symbolStroke: '#DDDDDD',
         theme: {
            fill: '#505053'
         }
      }
   },

   // scroll charts
   rangeSelector: {
      buttonTheme: {
         fill: '#505053',
         stroke: '#000000',
         style: {
            color: '#CCC'
         },
         states: {
            hover: {
               fill: '#707073',
               stroke: '#000000',
               style: {
                  color: 'white'
               }
            },
            select: {
               fill: '#000003',
               stroke: '#000000',
               style: {
                  color: 'white'
               }
            }
         }
      },
      inputBoxBorderColor: '#505053',
      inputStyle: {
         backgroundColor: '#333',
         color: 'silver'
      },
      labelStyle: {
         color: 'silver'
      }
   },

   navigator: {
      handles: {
         backgroundColor: '#666',
         borderColor: '#AAA'
      },
      outlineColor: '#CCC',
      maskFill: 'rgba(255,255,255,0.1)',
      series: {
         color: '#7798BF',
         lineColor: '#A6C7ED'
      },
      xAxis: {
         gridLineColor: '#505053'
      }
   },

   scrollbar: {
      barBackgroundColor: '#808083',
      barBorderColor: '#808083',
      buttonArrowColor: '#CCC',
      buttonBackgroundColor: '#606063',
      buttonBorderColor: '#606063',
      rifleColor: '#FFF',
      trackBackgroundColor: '#404043',
      trackBorderColor: '#404043'
   },

   // special colors for some of the
   legendBackgroundColor: 'rgba(0, 0, 0, 0.5)',
   background2: '#505053',
   dataLabelsColor: '#B0B0B3',
   textColor: '#C0C0C0',
   contrastTextColor: '#F0F0F3',
   maskColor: 'rgba(255,255,255,0.3)'
};

// Apply the theme
Highcharts.setOptions(Highcharts.theme);
  $scope.load = function($done) {
    RequestToServer.sendRequest('Refresh','LabTests');
    $timeout(function() {
      loadInfo();
          $done();
    }, 3000);
  };
  function loadInfo(){
    UpdateUI.UpdateSection('LabTests').then(function()
    {
      init();
    });
 }
 function managePage(event)
 {
   console.log('hello');
 }
  // var backbutton = navi.getDeviceBackButtonHandler();
  // console.log(backbutton);
    // Constants
    var DATE_TAB = 'Date';
    var ALL_TESTS_TAB = 'AllTests';
    var GROUPS_TAB = 'Groups';
    var FAVORITES_TAB = 'Favorites';

   function init()
   {
        $scope.selectedLabResults = undefined;
        $scope.selectedTest = undefined;

        // Flags for defining various views
        $scope.isNotificationView = undefined;
        $scope.isTestsView = undefined;
        $scope.isSpecificTestView = undefined;
        $scope.isTimeView = undefined;

        $scope.isListView = undefined;
        $scope.isTimeViewAll = undefined;

        $scope.isGroupsListView = undefined;
        $scope.isTestsViewGroups = undefined;
        $scope.isTimeViewGroups = undefined;

        $scope.isListViewFavorites = undefined;
        $scope.isTimeViewFavorites = undefined;


        $scope.testResultsByDate = LabResults.getTestResultsByDate();
        $scope.testResultsByType = LabResults.getTestResultsByType();
        $scope.testResultsByCategory = LabResults.getTestResultsByCategory();
   }



    $scope.goToTestsView = function(testResult, testDate, testCategory) {
      console.log('asdas');
      if (testResult) {
        $scope.selectedLabResults = testResult;
        $scope.testDate = testDate;
      }
      if(testCategory) {
        $scope.selectedCategory = testCategory;
      }

      // Update title
      $scope.title = 'Lab Results - ' + $scope.testDate;

      if ($scope.radioModel === DATE_TAB){
        $scope.isNotificationView = false;
        $scope.isTestsView = true;
        $scope.isSpecificTestView = false;
        $scope.isTimeView = false;
      }
    };

    $scope.goToSpecificTestView = function(test) {
      if (test) {
        $scope.selectedTest = test;
        $scope.testName = test.ComponentName;
        $scope.testValue = test.TestValue;
      }

      // Update title
      $scope.title = $scope.selectedTest.FacComponentName;

      $scope.isNotificationView = false;
      $scope.isTestsView = false;
      $scope.isSpecificTestView = true;
      $scope.isTimeView = false;

      var maxNorm = [];
      var minNorm = [];
      var result = [];
      for (var i=0; i<100; i++) {
        maxNorm.push({x: i, y: $scope.selectedTest.MaxNorm});
        minNorm.push({x: i, y: $scope.selectedTest.MinNorm});
      }
      for (var i=20; i<80; i++){
        result.push({x: i, y: $scope.selectedTest.TestValue});
      }

      $scope.data = [
        {
          values: maxNorm,
          key: 'Max Norm',
          color: '#000000',
          area: false
        },
        {
          values: minNorm,
          key: 'Min Norm',
          color: '#000000',
          area: false
        },{
          key: 'Result',
          values: result,
          color: '#ff7f0e',
          area: true
        }
      ];
    };

    $scope.goToTimeView = function(testName) {
      if($scope.radioModel === DATE_TAB) {
        $scope.isNotificationView = false;
        $scope.isTestsView = false;
        $scope.isSpecificTestView = false;
        $scope.isTimeView = true;
      } else if($scope.radioModel === ALL_TESTS_TAB) {
        $scope.isListView = false;
        $scope.isTimeViewAll = true;
      } else if($scope.radioModel === FAVORITES_TAB) {
        $scope.isListViewFavorites = false;
        $scope.isTimeViewFavorites = true;
      }

      $scope.testInformation = $scope.testResultsByType[testName].testResults[0];
      $scope.title = testName;
      var testResults = $scope.testResultsByType[testName].testResults;
      $scope.historicViewTestResult = $scope.testResultsByType[testName].testResults;

      // Chart
      $scope.data = [{
        key: 'Data',
        values: []
      }];
      for (var i=0; i<testResults.length; i++) {
        $scope.data[0].values[i] = {
          x: i,
          y: testResults[i].TestValue
        };
      }
    };

    $scope.goBack = function() {
      // DATE tab
      if ($scope.isTestsView) {
        $scope.goToNotificationView();
      } else if($scope.isSpecificTestView) {
        $scope.goToTestsView();
      } else if($scope.isTimeView) {
        $scope.goToSpecificTestView();

      // ALL TESTS tab
      } else if($scope.isTimeViewAll) {
        $scope.goToNotificationView();

        // FAVORITES tab
      } else if($scope.isTimeViewFavorites) {
        $scope.goToNotificationView();
      }
    };



    $scope.$watch('radioModel',function(){
           // selectTestResultsToLoad();
    });
}]);
myApp.controller('AllTestsController',['$scope','$timeout','LabResults',function($scope,$timeout,LabResults){
  //Enter code here!!
    $scope.testResultsByCategory = LabResults.getTestResultsByCategory();
    $scope.testResultsByType = LabResults.getTestResultsArrayByType();
    console.log($scope.testResultsByType);
  }]);
myApp.controller('FavoritesTestsController',['$scope','$timeout','LabResults',function($scope,$timeout,LabResults){
  //Enter code here!!
  $scope.testResultsByCategory = LabResults.getTestResultsByCategory();
  $scope.testResultsByType = LabResults.getTestResultsByType();
  $scope.testsReceived = 'Your lab results are in';


}]);
myApp.controller('ByDateTestsController',['$scope','$timeout','LabResults','$filter',function($scope,$timeout,LabResults,$filter){
  //Enter code here!!
  $scope.handleBackButton = function(event)
  {
  console.log('ng');
  };
 
  $scope.goToTest = function(testResultByDate)
  {
      console.log(testResultByDate);
      navi.pushPage('./views/personal/lab-results/test-view.html',{data:testResultByDate});

  };

  //Initializing option
  $scope.radioModel='All';

  $scope.testResultsByDateArray=LabResults.getTestResultsArrayByDate();
  $scope.selectedTests=$scope.testResultsByDateArray;
  //$scope.testResultsByDate = LabResults.getTestResultsByDate();
  $scope.testsReceived = 'Lab results';
  /*$scope.$watch('radioModel',function(){
    console.log('inside');
      $scope.selectedTests=$filter('filterDateLabTests')($scope.testResultsByDateArray, $scope.radioModel);
    });*/
}]);


myApp.controller('IndividualLabTestController',['$scope','$timeout',function($scope,$timeout){

  var test = navi.topPage.data;
  if (test.testResults) {
    $scope.selectedLabResults = test.testResults;
    $scope.testDate = test.testDate;
  }
  /*if(test.testCategory) {
    $scope.selectedCategory = testCategory;
  }*/

  // Update title
  $scope.title = 'Lab Results - ' + $scope.testDate;
  $scope.goToSpecificTestView=function(test)
  {
    navi.pushPage('./views/personal/lab-results/specific-test-component.html',{data:test});
  };
}]);

myApp.controller('SpecificTestComponentController',['$scope','$timeout',function($scope,$timeout){
  console.log('adas');


  var test = navi.topPage.data;
  console.log(test);
  $scope.selectedTest = test;
  $scope.testName = test.ComponentName;
  $scope.testValue = test.TestValue;
  // Update title
  $scope.title = $scope.selectedTest.FacComponentName;
  var maxNorm = [];
  var minNorm = [];
  var result = [];
  for (var i=0; i<100; i++) {
    maxNorm.push({x: i, y: $scope.selectedTest.MaxNorm});
    minNorm.push({x: i, y: $scope.selectedTest.MinNorm});
  }
  for (var i=20; i<80; i++){
    result.push({x: i, y: $scope.selectedTest.TestValue});
  }

  $scope.data = [
    {
      values: maxNorm,
      key: 'Max Norm',
      color: '#000000',
      area: false
    },
    {
      values: minNorm,
      key: 'Min Norm',
      color: '#000000',
      area: false
    }
    ,{
      key: 'Result',
      values: result,
      color: '#ff7f0e',
      area: true
    }
  ];
}]);
myApp.controller('TimelineTestComponentController',['$scope','$timeout','LabResults',function($scope,$timeout,LabResults){
  var testName = navi.topPage.data;
  console.log(' I am in timeline test');
  $scope.testResultsByType = LabResults.getTestResultsByType();
  $scope.testInformation = $scope.testResultsByType[testName].testResults[0];
  $scope.title = testName;
  var testResults = $scope.testResultsByType[testName].testResults;
  $scope.historicViewTestResult = $scope.testResultsByType[testName].testResults;

  $scope.goToTestList = function()
  {
     navi.pushPage('./views/personal/lab-results/specific-testlist-results.html',{data:{TestName:testName, TestInformation:$scope.testInformation,TestData:$scope.historicViewTestResult}});
  };
  console.log($scope.historicViewTestResult);
  //$filter()
  $scope.historicViewTestResult.sort(function(a,b)
  {
    return a.TestDateFormat - b.TestDateFormat;
  });
  var data = [];
  var lowest = Infinity;
  var highest = -Infinity;
  
  for(var i = 0;i<$scope.historicViewTestResult.length;i++)
  {
    var value = $scope.historicViewTestResult[i].TestValue;
    if(value<lowest) lowest = value;
    if(value>highest) highest = value;

    data.push([$scope.historicViewTestResult[i].TestDateFormat.getTime(),Number(value)]);
  }
  lowest = Math.min(lowest,$scope.testInformation.MinNorm );
  highest = Math.max(highest,$scope.testInformation.MaxNorm );
  console.log(data);
  // Sample options for first chart
  $scope.chartOptions = {};
     
            //$.getJSON('https://www.highcharts.com/samples/data/jsonp.php?filename=usdeur.json&callback=?', function (data) {
                $timeout(function()
            {
              console.log(data);
                 $scope.chartOptions = {
            chart: {
                zoomType: 'x'
            },
            title: {
                text: testName
            },
            // subtitle: {
            //     text: document.ontouchstart === undefined ?
            //             'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
            // },
            xAxis: {
                type: 'datetime'
            },
            yAxis: {
                min:lowest,
                max:highest,
                title: {
                    text: 'Test Value ('+ $scope.testInformation.UnitDescription+')'
                },
                plotLines: [{
                    value: $scope.testInformation.MinNorm,
                    color: 'blue',
                    dashStyle: 'shortdash',
                    width: 2,
                    label: {
                      style: {
                          color: 'white',
                      },
                        text: 'Min'
                    }
                }, {
                    value: $scope.testInformation.MaxNorm,
                    color: 'red',
                    dashStyle: 'shortdash',
                    width: 1,
                    label: {
                      style: {
                          color: 'white',
                      },
                        text: 'Max'
                    }
                }]
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                area: {
                    fillColor: {
                        linearGradient: {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1
                        },
                        stops: [
                            [0, Highcharts.getOptions().colors[0]],
                            [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
                    },
                    marker: {
                        radius: 3,
                        enabled:true
                    },
                    lineWidth: 1,
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    },
                    threshold: null
                }
            },

            series: [{
                type: 'area',
                name: testName,
                data: data
            }]
        }; 
            });
            //});
   
  // Chart
  $scope.data = [{
    key: 'Data',
    values: []
  }];
  for (var i=0; i<testResults.length; i++) {
    $scope.data[0].values[i] = {
      x: i,
      y: testResults[i].TestValue
    };
  }


}]);
 function handleBackButton()
  {
    console.log('on');
  }

  myApp.controller('TestListController',function($scope,$filter)
  {
    console.log(navi.topPage.data);
    $scope.testResults = navi.topPage.data;
    $scope.testResults.TestData = $filter('reverse')($scope.testResults.TestData );
    $scope.showIfFullYear = function(index)
    {
      if(index === 0) return true;
      var year1= $scope.testResults.TestData[index].TestDateFormat;
      var year2= $scope.testResults.TestData[index-1].TestDateFormat;
      return (year1.getFullYear()!== year2.getFullYear())? true:false;
    };
  });