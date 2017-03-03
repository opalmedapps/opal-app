var myApp = angular.module('MUHCApp');
myApp.controller('LabResultsControllerCopy', ['RequestToServer','Notifications', 'UpdateUI', '$scope', '$timeout','$rootScope', 'UserPreferences', 'LabResults', '$q', function (RequestToServer, Notifications, UpdateUI, $scope,$timeout,$rootScope, UserPreferences, LabResults, $q) {

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
            $scope.init();
        });
    }
    // Constants
    var DATE_TAB = 'Date';
    var ALL_TESTS_TAB = 'AllTests';
    var GROUPS_TAB = 'Groups';
    var FAVORITES_TAB = 'Favorites';

    $scope.loading = true;

    activate()
        .then(function (response) {
            $scope.selectedLabResults = undefined;
            $scope.selectedTest = undefined;

            // Flags for defining various views
            $scope.isNotificationView = undefined;
            $scope.isTestsView = undefined;
            //$scope.isSpecificTestView = undefined;
            $scope.isTimeView = undefined;
            $scope.isTestInformationView = undefined;
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

            $scope.loading = false;
        })
        .catch(function (error) {
            $scope.loading = true;
        });



    function activate() {
        if(LabResults.getTestResults().length > 0){
            return $q.resolve();
        }
        return LabResults.setTestResults();
    }

    $scope.load = function($done) {
        refresh($done);
    }

    function refresh(done) {
        console.log(done);
        done == undefined ? done = function () {
            } : done;

        LabResults.setTestResults().then(function () {
            activate();
            done();
        }).catch(function (error) {
            console.log(error);
            done();
        });
        $timeout(function () {
            done();
        }, 5000);
    }

    $scope.init = function() {

        // DATE tab
        $scope.isNotificationView = true;
        $scope.isTestsView = false;
        //$scope.isSpecificTestView = false;
        $scope.isTimeView = false;
        // ALL tab
        $scope.isListView = true;
        $scope.isTimeViewAll = false;
        // FAVORITES tab
        $scope.isListViewFavorites = true;
        $scope.isTimeViewFavorites = false;
        // Initialize messages
        $scope.title = 'Lab Results';
        $scope.testsReceived = 'Lab results';

        // Start in DATE tab
        $scope.radioModel = 'Date';
    };

    $scope.goToNotificationView = function() {
        if($scope.radioModel === DATE_TAB) {
            $scope.isNotificationView = true;
            $scope.isTestsView = false;
            $scope.isSpecificTestView = false;
            $scope.isTimeView = false;
        } else if($scope.radioModel === ALL_TESTS_TAB) {
            $scope.isListView = true;
            $scope.isTimeViewAll = false;
        } else if($scope.radioModel === FAVORITES_TAB) {
            $scope.isListViewFavorites = true;
            $scope.isTimeViewFavorites = false;
        }
    };


    $scope.goToTestsView = function(testResult, testDate, testCategory) {
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

    //about this test
    $scope.goToTestInformationView = function(testName) {
        if(testName)
        {
            $scope.selectedTest = testName;
            $scope.testValue = testName.TestValue;
        }
        $scope.title = $scope.selectedTest.FacComponentName;
        $scope.isTestInformationView = true;
        $scope.isNotificationView = false;
        $scope.isTestsView = false;
        $scope.isTimeView = false;
        //$scope.isSpecificTestView = false;
    }
    /*
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
     //This graph is fu
     color: '#e242f4',
     area: false
     },
     {
     values: minNorm,
     key: 'Min Norm',
     color: '#000000',
     area: false
     },
     {
     key: 'Result',
     values: result,
     color: '#ff7f0e',
     area: true
     }
     ];
     };
     */
    /*
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
     */
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
}]);

myApp.controller('AllTestsController',['$scope','$timeout','LabResults',function($scope,$timeout,LabResults){

    $scope.testResultsByCategory = LabResults.getTestResultsByCategory();
    $scope.testResultsByType = LabResults.getTestResultsArrayByType();
}]);

myApp.controller('FavoritesTestsController',['$scope','$timeout','LabResults',function($scope,$timeout,LabResults){

    $scope.testResultsByCategory = LabResults.getTestResultsByCategory();
    $scope.testResultsByType = LabResults.getTestResultsByType();
    $scope.testsReceived = 'Your lab results are in';

}]);

myApp.controller('ByDateTestsController',['$scope','$timeout','LabResults','$filter',function($scope,$timeout,LabResults,$filter){
    //Initializing option

    $scope.radioModel='All';
    $scope.selectedTests=LabResults.getTestResultsArrayByDate();
    console.log($scope.selectedTests[0]);
    $scope.testsReceived = 'Lab results';

}]);

//for test-view.html
myApp.controller('IndividualLabTestController',['$scope','$timeout','LabResults',function($scope,$timeout,LabResults){
    var page = personalNavigator.getCurrentPage();
    var test = page.options.param;

    if (test.testResults) {
        $scope.selectedLabResults = test.testResults;
        $scope.testDate = test.testDate;
        $scope.testResultsByCategory = LabResults.getTestResultsByCategory();
        $scope.testResultsByType = LabResults.getTestResultsArrayByType();
    }

    // Update title
    $scope.title = 'Lab Results - ' + $scope.testDate;
    $scope.goToSpecificTestView=function(test)
    {
        personalNavigator.pushPage('./views/personal/lab-results/specific-test-component.html',{param:test});
    }
}]);

myApp.controller('TimelineTestComponentController',['$scope','$timeout','LabResults',function($scope,$timeout,LabResults)
{
    var page = personalNavigator.getCurrentPage();
    var test = page.options.param;

    $scope.selectedTest = test;
    $scope.testName = test.ComponentName;
    $scope.title = $scope.selectedTest.FacComponentName;
    $scope.maxNorm = $scope.selectedTest.MaxNorm;
    $scope.minNorm = $scope.selectedTest.MinNorm;
    $scope.unit = $scope.selectedTest.UnitDescription;
    var u = "Results ("+$scope.unit+")";
    $scope.testValue = page.options.param.TestValue;
    $scope.information = undefined;

    $scope.url = 'https://labtestsonline.org/map/aindex/SearchForm?Search='+$scope.title+'&action_ProcessSphinxSearchForm=Go';

    $scope.testResultsByType = LabResults.getTestResultsByType();

    var testResults = $scope.testResultsByType[$scope.title].testResults;
    $scope.historicViewTestResult = $scope.testResultsByType[$scope.title].testResults;

    $scope.testResultsByDateArray = LabResults.getTestResultsArrayByDate();

    var dateArray = [];
    for(var key in $scope.testResultsByDateArray)
    {
        dateArray.push($scope.testResultsByDateArray[key]);
    }

    // Chart
    $scope.data = [{
        key: 'Data',
        values: []
    }];

    var reformedData = [];
    var maxRange = [];
    var minRange = [];
    $scope.recentValue;

    for(i=0; i<testResults.length; i++)
    {
        var dv = [];  //array to store pairs of [date, testResult]
        var ma = [];  //array to store pairs of [date, maxrange]
        var mi = [];  //array to store pairs of [date, minrange]
        dv[0] = Date.parse(dateArray[testResults.length-i-1].testDate);  //dateArray[0] = most recent date
        dv[1] = parseFloat(testResults[testResults.length-i-1].TestValue);
        ma[0] = Date.parse(dateArray[testResults.length-i-1].testDate);
        ma[1] = parseFloat($scope.maxNorm);
        mi[0] = Date.parse(dateArray[testResults.length-i-1].testDate);
        mi[1] = parseFloat($scope.minNorm);
        reformedData.push(dv);
        maxRange.push(ma);
        minRange.push(mi);
    }

    $scope.recentValue = parseFloat(testResults[0].TestValue);
    var windowWidth = $(window).width();
    var windowHeight = $(window).height();

    $(window).on('resize.doResize', function () {
        var newWidth = $(window).width(),
            updateStuffTimer;

        if(newWidth !== windowWidth) {
            $timeout.cancel(updateStuffTimer);
        }

        updateStuffTimer = $timeout(function() {
            console.log("resize detected!"); // Update the attribute based on window.innerWidth
            //Need a function here to resize the graph size
        }, 500);
    });

    $scope.$on('$destroy',function (){
        $(window).off('resize.doResize'); // remove the handler added earlier
    });

    // Sample options for first chart
    $scope.chartOptions = {
        rangeSelector: {
            selected: 1
        },
        chart: {
            // Explicitly tell the width and height of a chart
            width: windowWidth,
            height: null
        },
        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: { // don't display the dummy year
                month: '%e. %b',
                year: '%b'
            },
            title: {
                text: 'Date'
            }
        },
        yAxis: {
            title: {
                text: u
            },
            opposite: false
        },
        plotOptions: {
            series: {
                fillOpacity: 0.1
            }
        },
        series: [{
            name: 'Result',
            data: reformedData,
            marker: {
                enabled: true,
                radius: 3
            },
            type: 'area',
            color: 'rgba(21, 148, 187, 0.65)',
            negativeColor: 'rgba(21, 148, 187, 0.4)',
            pointWidth: 100,
            tooltip: {
                valueDecimals: 2
            }
        },
            {
                name: 'Maximum Norm',
                data: maxRange,
                color: 'rgba(246, 54, 92, 0.53)',
                tooltip: {
                    valueDecimals: 2
                }
            },
            {
                name: 'Minimum Norm',
                data: minRange,
                color: 'rgba(246, 54, 92, 0.53)',
                tooltip: {
                    valueDecimals: 2
                }
            }]
    };
}]);
