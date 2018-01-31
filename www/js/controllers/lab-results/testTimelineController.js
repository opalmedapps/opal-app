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
        var language;

        vm.about = about;
        vm.noUrl = false;

        activate();

        /////////////////////////////

        function activate(){
            configureViewModel();
            bindEvents();
            configureChart(testResults);
        }

        function about(){
            if (vm.url.length > 0) {
                disclaimer.show();
                if (Constants.app) {
                    cordova.InAppBrowser.open(vm.url, '_blank', 'location=yes');
                } else {
                    window.open(vm.url);
                }
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

            language = UserPreferences.getLanguage().toUpperCase();

            // if Sorted by Date, use vm.selectedTest.URL_EN to access URL_EN. If sorted by Type, use test.testResults[0].URL_EN
            if (language === 'EN')
                vm.url = vm.selectedTest.URL_EN || ((test.testResults === undefined) ? "" : test.testResults[0].URL_EN);
            else
                vm.url = vm.selectedTest.URL_FR || ((test.testResults === undefined) ? "" : test.testResults[0].URL_FR);

<<<<<<< HEAD
            //vm.url = (language === 'EN') ? (vm.selectedTest.URL_EN || test.testResults[0].URL_EN) : (vm.selectedTest.URL_FR || test.testResults[0].URL_FR);

=======
>>>>>>> bug-issues
            if (vm.url.length <= 0) vm.noUrl = true;

            max = vm.selectedTest.MaxNorm || test.testResults[0].MaxNorm;
            min = vm.selectedTest.MinNorm || test.testResults[0].MinNorm;
            vm.maxNorm = max;
            vm.minNorm = min;

            vm.unit = vm.selectedTest.UnitDescription || test.testResults[0].UnitDescription;
            unit = '(' + vm.unit + ')';
            vm.testValue = page.options.param.TestValue;
            vm.information = undefined;

            vm.testResultsByType = LabResults.getTestResultsByType();

            testResults = vm.testResultsByType[vm.title].testResults;
            vm.historicViewTestResult = vm.testResultsByType[vm.title].testResults;

            vm.testResultsByDateArray = LabResults.getTestResultsArrayByDate();

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

            // Configuring the font size for the chart to be the same as the user defined font
            var fontSize = UserPreferences.getFontSize();
            var fontSizeText = fontSize.charAt(0).toUpperCase() + fontSize.slice(1);
            var elem = document.querySelector('.fontDesc' + fontSizeText);
            var style = getComputedStyle(elem);
            fontSize = style.fontSize;
            var zoomTextFont = fontSize;

            // Computing the position of the range buttons depending on the client width
            var buttonWidth;
            if (fontSizeText == "Xlarge") {
                buttonWidth = document.body.clientWidth - 320;
                zoomTextFont = "16px";
            }
            else if (fontSizeText == "Large") buttonWidth = document.body.clientWidth - 280;
            else buttonWidth = document.body.clientWidth - 240;

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
                        thousandsSep: ' ',
                        rangeSelectorFrom: "Du",
                        rangeSelectorTo: "au",
                        rangeSelectorZoom: ''
                    },
                    rangeSelector: {
                        buttons: [{
                            type: 'month',
                            count: 1,
                            text: '1m'
                        }, {
                            type: 'month',
                            count: 3,
                            text: '3m'
                        }, {
                            type: 'month',
                            count: 6,
                            text: '6m'
                        }, {
                            type: 'year',
                            count: 1,
                            text: '1a'
                        }, {
                            type: 'all',
                            text: 'Tout'
                        }]
                    }
                });
                Highcharts.dateFormat('%e%a');
            }
            else {
                Highcharts.setOptions({
                    lang: {
                        months: [ "January" , "February" , "March" , "April" , "May" ,
                            "June" , "July" , "August" , "September" , "October" , "November" , "December"],
                        weekdays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                        shortMonths: [ "Jan" , "Feb" , "Mar" , "Apr" , "May" , "Jun" ,
                            "Jul" , "Aug" , "Sep" , "Oct" , "Nov" , "Dec"],
                        decimalPoint: '.',
                        downloadPNG: 'Download PNG image',
                        downloadJPEG: 'Download JPEG image',
                        downloadPDF: 'Download PDF document',
                        downloadSVG: 'Download SVG vector image',
                        exportButtonTitle: 'Graphics export',
                        loading: 'Loading...',
                        printChart: 'Print chart',
                        resetZoom: 'Reset zoom',
                        resetZoomTitle: 'Reset zoom level 1:1',
                        thousandsSep: ' ',
                        rangeSelectorFrom: 'From',
                        rangeSelectorTo: 'To',
                        rangeSelectorZoom: ''
                    },
                    rangeSelector: {
                        buttons: [{
                            type: 'month',
                            count: 1,
                            text: '1m'
                        }, {
                            type: 'month',
                            count: 3,
                            text: '3m'
                        }, {
                            type: 'month',
                            count: 6,
                            text: '6m'
                        },  {
                            type: 'year',
                            count: 1,
                            text: '1y'
                        }, {
                            type: 'all',
                            text: 'All'
                        }]
                    }
                });
                Highcharts.dateFormat('%e%a');
            }

            vm.chartOptions = {
                rangeSelector: {
                    selected: 1,
                    buttonTheme: {
                        width: 'auto',
                        style: {
                            fontSize: fontSize
                        }
                    },
                    labelStyle: {
                        height: fontSize,
                        fontSize: zoomTextFont
                    },
                    buttonPosition: {
                        x: buttonWidth,
                        y: 10
                    }
                },
                chart: {
                    // Explicitly tell the width and height of a chart
                    // type: 'spline',
                    width: windowWidth,
                    height: null
                },
                xAxis: {
                    type: 'datetime',
                    dateTimeLabelFormats: { // don't display the dummy year
                        month: '%e %b',
                        year: '%b  %y'
                    },
                    minTickInterval: 3600*24*30*1000,//time in milliseconds
                    minRange: 3600*24*30*1000,
                    ordinal: false, //this sets the fixed time formats
                    // title: {
                    //     text: 'Date',
                    //     style: {
                    //         fontSize: fontSize
                    //     }
                    // },
                    labels: {
                        rotation: 0,
                        style: {
                            fontSize: fontSize,
                            textOverflow: false
                        }
                    }
                },
                yAxis: {
                    max: maxChart,
                    min: minChart,
                    title: {
                        align: 'high',
                        text: unit,
                        style: {
                            'text-anchor': 'start'
                        },
                        rotation: 0,
                        y: -10,
                        reserveSpace: false
                    },
                    opposite: false,
                    // plotLines: [{
                    //     color: 'rgba(246, 54, 92, 0.53)',
                    //     value: max,
                    //     dashStyle: 'Solid',
                    //     width: 2
                    // },{
                    //     color: 'rgba(246, 54, 92, 0.53)',
                    //     value: min,
                    //     dashStyle: 'Solid',
                    //     width: 2
                    // }],
                    labels: {
                        style: {
                            fontSize: fontSize,
                            textOverflow: "ellipsis"
                        }
                    }
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
