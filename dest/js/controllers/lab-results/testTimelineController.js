/**
 * Created by PhpStorm.
 * User: James Brace
 * Date: 2017-09-18
 * Time: 3:17 PM
 */

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('TestTimelineController', TestTimelineController);

    TestTimelineController.$inject = ['$scope','$timeout','LabResults','$filter','UserPreferences', 'Logger', 'Constants'];

    /* @ngInject */
    function TestTimelineController($scope, $timeout, LabResults, $filter, UserPreferences, Logger, Constants) {

        var vm = this;
        var page;
        var test;
        var url = "";
        var windowWidth;
        var unit;
        var testResults;
        var max;
        var min;

        vm.about = about;

        activate();

        /////////////////////////////

        function activate(){
            configureViewModel();
            bindEvents();
            configureURL();
            configureChart(testResults);
        }

        function about(){
            if (Constants.app) {
                cordova.InAppBrowser.open(url, '_blank', 'location=yes');
            } else {
                window.open(url);
            }
        }

        function bindEvents(){
            $(window).on('resize.doResize', function () {
                var newWidth = $(window).width(),
                    updateStuffTimer;

                if(newWidth !== windowWidth) {
                    $timeout.cancel(updateStuffTimer);
                }

                updateStuffTimer = $timeout(function() {
                    // Update the attribute based on window.innerWidth
                    //Need a function here to resize the graph size
                }, 500);
            });

            $scope.$on('$destroy',function (){
                $(window).off('resize.doResize'); // remove the handler added earlier
            });

        }

        function configureViewModel(){

            page = personalNavigator.getCurrentPage();
            test = page.options.param;

            vm.selectedTest = test;
            vm.testName = test.ComponentName || test.testResults[0].ComponentName;
            vm.title = vm.selectedTest.FacComponentName || vm.selectedTest.testName;

            max = vm.selectedTest.MaxNorm || test.testResults[0].MaxNorm;
            min = vm.selectedTest.MinNorm || test.testResults[0].MinNorm;
            vm.maxNorm = max;
            vm.minNorm = min;

            vm.unit = vm.selectedTest.UnitDescription || test.testResults[0].UnitDescription;
            unit = $filter('translate')('RESULTS') + ' (' + vm.unit + ')';
            vm.testValue = page.options.param.TestValue;
            vm.information = undefined;

            vm.testResultsByType = LabResults.getTestResultsByType();

             testResults = vm.testResultsByType[vm.title].testResults;
            vm.historicViewTestResult = vm.testResultsByType[vm.title].testResults;

            vm.testResultsByDateArray = LabResults.getTestResultsArrayByDate();

            Logger.sendLog('Lab Results', test.ComponentName || test.testResults[0].ComponentName);

        }

        function configureURL(){
            ///////////////////////////////////////////////////////////////////////////////////////////////
            // TODO: THIS IS ONLY TEMPORARY TO BE ABLE TO DISPLAY FRENCH PAGES FOR ONLY WBC AND RBC

            if(vm.testName === "WBC"){
                url = "http://www.labtestsonline.fr/tests/num-ration-des-globules-blancs.html";
            }
            else if (vm.testName === "RBC"){
                url = "http://www.labtestsonline.fr/tests/num-ration-des-globules-rouges.html?tab=3";
            }
            else{
                url = 'https://labtestsonline.org/map/aindex/SearchForm?Search='+vm.title+'&action_ProcessSphinxSearchForm=Go';
            }
            ///////////////////////////////////////////////////////////////////////////////////////////////

        }

        function configureChart(){

            // Chart
            vm.data = [{
                key: 'Data',
                values: []
            }];

            var reformedData = [];
            for(var i=0; i< testResults.length; i++)
            {
                var dv = [];  //array to store pairs of [date, testResult]
                dv[0] = Date.parse(testResults[i].TestDateFormat);  //dateArray[0] = most recent date
                dv[1] = parseFloat(testResults[i].TestValue);
                reformedData.push(dv);
            }

            /*********************************************
             * FINDING THE MAX AND MIN VALUES FOR CHARTING
             *********************************************/

            var vals = reformedData.reduce(function(a, b) {
                return a.concat(b[1]);
            },[]);
            var maxChart = Math.max.apply(Math, vals)*1.05;
            var minChart = Math.min.apply(Math, vals)*0.95;


            /**********************************************/

            vm.recentValue = parseFloat(testResults[testResults.length-1].TestValue);
            windowWidth = $(window).width();

            // Sample options for first chart

            if (UserPreferences.getLanguage().toUpperCase() === 'FR')
            {
                Highcharts.setOptions({
                    lang: {
                        months: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
                            'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
                        weekdays: ['dimanche', 'lundi', 'lardi', 'mercredi',
                            'jeudi', 'vendredi', 'samedi'],
                        shortMonths: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juill.',
                            'août', 'sept.', 'oct.', 'nov.', 'déc'],
                        decimalPoint: ',',
                        downloadPNG: 'Télécharger en image PNG',
                        downloadJPEG: 'Télécharger en image JPEG',
                        downloadPDF: 'Télécharger en document PDF',
                        downloadSVG: 'Télécharger en document Vectoriel',
                        exportButtonTitle: 'Export du graphique',
                        loading: 'Chargement en cours...',
                        printChart: 'Imprimer le graphique',
                        resetZoom: 'Réinitialiser le zoom',
                        resetZoomTitle: 'Réinitialiser le zoom au niveau 1:1',
                        thousandsSep: ' '
                    }
                });
                Highcharts.dateFormat('%e%a');
            }


            vm.chartOptions = {
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
                    max: maxChart,
                    min: minChart,
                    title: {
                        text: unit
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
        }
    }
})();
