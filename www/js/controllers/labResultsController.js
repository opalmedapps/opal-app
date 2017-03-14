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

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('CategoryLabTestController', CategoryLabTestController);

    CategoryLabTestController.$inject = ['LabResults'];

    /* @ngInject */
    function CategoryLabTestController(LabResults) {
        var vm = this;
        vm.title = 'CategoryLabTestController';
        vm.testResultsByCategory = null;

        activate();

        ////////////////

        function activate() {
            vm.testResultsByCategory = LabResults.getTestResultsByCategory();
            console.log(vm.testResultsByCategory);
            vm.testResultsByType = LabResults.getTestResultsArrayByType();
            console.log(vm.testResultsByType);
        }
    }

})();



//for test-view.html
myApp.controller('IndividualLabTestController',['$scope','$timeout','LabResults',function($scope,$timeout,LabResults){
    var page = personalNavigator.getCurrentPage();
    var test = page.options.param;

    if (test.testResults) {
        $scope.test = test;
        $scope.selectedLabResults = test.testResults;
        $scope.testDate = test.testDate;
        $scope.testResultsByCategory = LabResults.getTestResultsByCategory();

    }

    // Update title
    $scope.title = 'Lab Results - ' + $scope.testDate;
    $scope.goToSpecificTestView=function(test)
    {
        personalNavigator.pushPage('./views/personal/lab-results/specific-test-component.html',{param:test});
    }
}]);

myApp.controller('TimelineTestComponentController',['$scope','$timeout','LabResults','$filter','UserPreferences',
    function($scope,$timeout,LabResults,$filter,UserPreferences)
{
    var page = personalNavigator.getCurrentPage();
    var test = page.options.param;

    console.log(test);
    $scope.selectedTest = test;
    $scope.testName = test.ComponentName || test.testResults[0].ComponentName;
    $scope.title = $scope.selectedTest.FacComponentName || $scope.selectedTest.testName;

    var max = $scope.selectedTest.MaxNorm || test.testResults[0].MaxNorm;
    var min = $scope.selectedTest.MinNorm || test.testResults[0].MinNorm;
    $scope.maxNorm = max;
    $scope.minNorm = min;

    $scope.unit = $scope.selectedTest.UnitDescription || test.testResults[0].UnitDescription;
    var u = $filter('translate')('RESULTS') + '(' + $scope.unit + ')';
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

    if (UserPreferences.getLanguage() == 'FR')
    {
        Highcharts.setOptions({
            lang: {
                months: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
                    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
                weekdays: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi',
                    'Jeudi', 'Vendredi', 'Samedi'],
                shortMonths: ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil',
                    'Aout', 'Sept', 'Oct', 'Nov', 'Déc'],
                decimalPoint: ',',
                downloadPNG: 'Télécharger en image PNG',
                downloadJPEG: 'Télécharger en image JPEG',
                downloadPDF: 'Télécharger en document PDF',
                downloadSVG: 'Télécharger en document Vectoriel',
                exportButtonTitle: 'Export du graphique',
                loading: 'Chargement en cours...',
                printButtonTitle: 'Imprimer le graphique',
                resetZoom: 'Réinitialiser le zoom',
                resetZoomTitle: 'Réinitialiser le zoom au niveau 1:1',
                thousandsSep: ' ',
                decimalPoint: ','
            }
        });
    }


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
