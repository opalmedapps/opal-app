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

    TestTimelineController.$inject = ['$rootScope','$scope','$timeout','LabResults','$filter','UserPreferences', 'Logger', 'Constants'];

    /* @ngInject */
    function TestTimelineController($rootScope, $scope, $timeout, LabResults, $filter, UserPreferences, Logger, Constants) {

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
        var chartSelectedDateRangeDefault = 4; // Default to use for the date range (0,1,2,3,4 = 1m,3m,6m,1y,All)

        vm.about = about;
        vm.gotoUrl = gotoUrl;
        vm.noUrl = false;

        activate();

        /////////////////////////////

        function activate(){
            configureViewModel();
            bindEvents();
            configureChart();
        }

        function about(){
            if (vm.url.length > 0) {
                disclaimerModal.show();
            }
        }

        function gotoUrl() {
            if (Constants.app) {
                cordova.InAppBrowser.open(vm.url, '_blank', 'location=yes');
            } else {
                window.open(vm.url);
            }

        }

        function bindEvents(){
            // Event binding that doesn't require controller variables should be done in lineChartDirective.js.
            // Event binding that does require controller variables should be done here.
        }

        function configureViewModel(){
            page = personalNavigator.getCurrentPage();
            test = page.options.param;

            vm.selectedTest = test;
            //vm.testName = test.ComponentName || test.testResults[0].ComponentName;
            vm.title = vm.selectedTest.FacComponentName || vm.selectedTest.testName;

            language = UserPreferences.getLanguage().toUpperCase();

            // if Sorted by Date, use vm.selectedTest.URL_EN to access URL_EN. If sorted by Type, use test.testResults[0].URL_EN
            if (language === 'EN')
                vm.url = vm.selectedTest.URL_EN || ((test.testResults === undefined) ? "" : test.testResults[0].URL_EN);
            else
                vm.url = vm.selectedTest.URL_FR || ((test.testResults === undefined) ? "" : test.testResults[0].URL_FR);
            
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

            // If there is no Date Range stored in $rootScope memory, set it to the default.
            // Note: special check for 0, because a Date Range of 0 is a valid range. -SB
            if (!$rootScope.chartSelectedDateRange && $rootScope.chartSelectedDateRange != 0) {
                $rootScope.chartSelectedDateRange = chartSelectedDateRangeDefault;
            }
        }

        /**
         * This is to save the user's choice of Date Range on the chart (1m, 3m, 6m, 1y, All).
         * This event is triggered (through HighCharts) when the user Clicks on a Date Range (1m, 3m, 6m, 1y, All) on the chart
         * @param e (event)
         */
        function afterSetExtremes(e) {
            // Only process the event e if it contains a rangeSelectorButton.
            // Otherwise, it is not relevant to this function.
            if(e && e.rangeSelectorButton && e.rangeSelectorButton.text) {

                var current_selection = e.rangeSelectorButton.text;

                if (current_selection === '1m') {
                    $rootScope.chartSelectedDateRange = 0;
                }
                else if (current_selection === '3m') {
                    $rootScope.chartSelectedDateRange = 1;
                }
                else if (current_selection === '6m') {
                    $rootScope.chartSelectedDateRange = 2;
                }
                else if (current_selection === '1y') {
                    $rootScope.chartSelectedDateRange = 3;
                }
                else if (current_selection === 'All') {
                    $rootScope.chartSelectedDateRange = 4;
                }
                else {
                    console.log('Error: invalid range selector button with text '+current_selection);
                }
            }
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

            /**
             * Make sure it is sorted....
             */

            reformedData.sort(function(a,b){
                return a[0] - b[0]
            });

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
            vm.recentDate = Date.parse(testResults[testResults.length-1].TestDateFormat);
            windowWidth = $(window).width();

            // Configuring the font size for the chart to be the same as the user defined font
            var fontSize = UserPreferences.getFontSize();
            var fontSizeText = fontSize.charAt(0).toUpperCase() + fontSize.slice(1);
            var elem = document.querySelector('.fontDesc' + fontSizeText);
            var style = getComputedStyle(elem);
            fontSize = style.fontSize;
            var zoomTextFont = fontSize;

            /* Computing the position of the range buttons depending on the text size.
             * The best result was produced by 70 px for all font sizes. The if statements were left for
             * future customization.
             */
            var buttonPositionX;
            if (fontSizeText == "Xlarge") {
                buttonPositionX = 70;
                zoomTextFont = "16px";
            }
            else if (fontSizeText == "Large") {
                buttonPositionX = 70;
            }
            else if (fontSizeText == "Medium") {
                buttonPositionX = 70;
            }
            else{
                buttonPositionX = 70; // Default
            }

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
                            'août', 'sept.', 'oct.', 'nov.', 'déc.'],
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
                    xAxis: {
                        events: {
                            afterSetExtremes: afterSetExtremes
                        }
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
                    xAxis: {
                        events: {
                            afterSetExtremes: afterSetExtremes
                       }
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
                    selected: $rootScope.chartSelectedDateRange,
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
                        // align: "right", // This feature will be available after updating Highcharts.
                        x: buttonPositionX,
                        y: 10
                    },
                    // Disable the date box input (from <date> to <date>) which causes display problems.
                    inputEnabled: false
                },
                navigator: {
                    margin: 5,
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
                        month: '%e %b %y',
                        year: '%e %b %y'
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
                        y : 20,
                        rotation: -35,
                        align: 'right',
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
