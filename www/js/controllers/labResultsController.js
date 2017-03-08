var myApp = angular.module('MUHCApp');
myApp.controller('LabResultsControllerCopy', ['RequestToServer','Notifications', 'UpdateUI', '$scope', '$timeout','$rootScope', 'UserPreferences', 'LabResults', '$q', function (RequestToServer, Notifications, UpdateUI, $scope,$timeout,$rootScope, UserPreferences, LabResults, $q) {


    $scope.loading = true;

    $scope.load = function($done) {
        LabResults.setTestResults().then(function () {
            $done();
        }).catch(function (error) {
            $done();
            console.log(error);
        });
    };

    activate()
        .then(function () {

            $scope.testResultsByDate = LabResults.getTestResultsArrayByDate();
            console.log($scope.testResultsByDate);
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
    var max = test.MaxNorm;
    var min = test.MinNorm;
    $scope.unit = $scope.selectedTest.UnitDescription;
    var u = "Results ("+$scope.unit+")";
    $scope.testValue = page.options.param.TestValue;
    $scope.information = undefined;

    $scope.url = 'https://labtestsonline.org/map/aindex/SearchForm?Search='+$scope.title+'&action_ProcessSphinxSearchForm=Go';

    $scope.testResultsByType = LabResults.getTestResultsByType();

    var testResults = $scope.testResultsByType[$scope.title].testResults;
    $scope.historicViewTestResult = $scope.testResultsByType[$scope.title].testResults;

    $scope.testResultsByDateArray = LabResults.getTestResultsArrayByDate();

    // Chart
    $scope.data = [{
        key: 'Data',
        values: []
    }];

    var reformedData = [];
    for(var i=0; i<testResults.length; i++)
    {
        var dv = [];  //array to store pairs of [date, testResult]
        dv[0] = Date.parse(testResults[i].TestDateFormat);  //dateArray[0] = most recent date
        dv[1] = parseFloat(testResults[i].TestValue);
        reformedData.push(dv);
    }
    console.log(reformedData);

    $scope.recentValue = parseFloat(testResults[testResults.length-1].TestValue);
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
            opposite: false,
            plotLines: [{
                color: 'rgba(246, 54, 92, 0.53)',
                value: max,
                dashStyle: 'Solid',
                width: 2
            },{
                color: 'rgba(246, 54, 92, 0.53)',
                value: min,
                dashStyle: 'Solid',
                width: 2
            }]
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
            pointWidth: 100,
            tooltip: {
                valueDecimals: 2
            }
        }]
    };
}]);
