// globalHistoryController
// 需要service QuestionnaireScores

var app = angular.module('MUHCApp');
app.controller('sectionScoreHistoryController', ['$scope', '$rootScope', 'Questionnaires', 'UserPreferences', '$location', 'NavigatorParameters', '$filter', '$timeout', function($scope, $rootScope, Questionnaires, UserPreferences, $location, NavigatorParameters, $filter, $timeout) {

    $scope.loading = true;

    var vm = this;
    vm.importantInfo = [];
    vm.algorithms = []; // {ser_num, nickname, version}
    vm.chart = {};
    activate();

    function activate() {
        $scope.line = false;
        $scope.histogram = false;
        var default_alg = {ser_num: "default", title: $filter('translate')("Default"), nickname: $filter('translate')("Default")};
        $scope.algo = "default";
        var params = NavigatorParameters.getParameters();
        // var entity = params.entity;
        // var scoresForSection = params.scoresForSection;
        // vm.entity = {ser_num: entity.ser_num, title: entity.title, nickname: entity.nickname};
        // vm.section = {ser_num: section.ser_num, title: section.title};
        // vm.algorithms = [default_alg].concat(params.algorithms);
        vm.scoresForSection = params.scoresForSection;
        vm.sectionTitle  = params.sectionTitle;
        console.log(vm.algorithms);
        importantInfo();
        configureCharts();
        $scope.loading = false;
        // Questionnaires.requestSectionScores(entity.ser_num, section.ser_num, default_alg.ser_num)
        //     .then(function () {
        //             // Possible modification:
        //             // if the total score of a questionnaire is not 100
        //             vm.scores = Questionnaires.getScores();
        //             importantInfo();
        //             configureCharts();
        //             $scope.loading = false;
        //         }
        //     );

    }

    vm.switchAlg = function(alg) {
        $scope.algo = alg;
        console.log($scope.algo);
        console.log(alg);
        $scope.loading = true;
        Questionnaires.requestEntityScores(vm.entity.ser_num, $scope.algo)
            .then(function () {

                    // Possible modification:
                    // if the total score of a questionnaire is not 100

                    vm.scores = Questionnaires.getScores();
                    console.log(vm.scores);
                    importantInfo();
                    $scope.loading = false;
                }
            );
    };

    vm.setLine = function() {
        drawLineChart();
    };

    vm.setHistogram = function() {
        drawHistogram();
    };

    vm.exportChart = function() {
        var d = new Date();
        var timestr = d.getFullYear()+"_"+d.getMonth()+"_"+d.getDate()+"_"+d.getHours()+"_"+d.getMinutes()+"_"+d.getSeconds();
        var algstr = $("select option:selected").text();
        var nicknamestr = (vm.entity.nickname+"_"+vm.section.title+"_"+algstr).replace(new RegExp(' ',"g"), '_');
        // PROBLEM: it goes through external server, offline export does not work here. Maybe try a local exporting server.

        vm.chart.exportChart({
            type: 'application/pdf',
            filename: nicknamestr+"_"+timestr,
            sourceHeight: 500,
            sourceWidth:750
        },{
            xAxis: {
                labels: {
                    fontSize: '30px'
                }
            },
            yAxis: {
                labels: {
                    fontSize: '30px'
                }
            }
        });
    }

    function importantInfo () {
        //Same for either questionnaire section because it's out of 100!
        //flag results that are 70% or higher
        // Flag results whose values have changed by 50% or 75%
        var i = vm.scoresForSection.length-1;
        if (vm.scoresForSection[i] >= 70) {
            note = "Current section score is " + vm.scoresForSection[i] + "." ;
            vm.importantInfo.push(note);
        }
        if(vm.scoresForSection[i] - vm.scoresForSection[i-1] >= 50){
            note = "Section score increased by 50% since last timepoint.";
            vm.importantInfo.push(note);
        }
        else if(vm.scoresForSection[i] - vm.scoresForSection[i-1] <= -50) {
            note = "Section score improved by 50% since last timepoint.";
            vm.importantInfo.push(note);
        }
        if(vm.scoresForSection[i] - vm.scoresForSection[i-1] >= 75) {
            note = "Section score increased by 75% within two timepoints.";
            vm.importantInfo.push(note);
        }
        else if(vm.scoresForSection[i] - vm.scoresForSection[i-1] <= -75) {
            note = "Section score improved by 75% within two timepoints.";
            vm.importantInfo.push(note);
        }
        if(vm.scoresForSection[i] - vm.scoresForSection[0] >= 50) {
            note = "Section score increased by 50% since initial assessment.";
            vm.importantInfo.push(note);
        }
        else if(vm.scoresForSection[i] - vm.scoresForSection[0] <= -50) {
            note = "Section score increased by 50% since initial assessment.";
            vm.importantInfo.push(note);
        }

        if (importantInfo.length == 0) {
            vm.importantInfo = [];
            note = "There are no significant score changes to report.";
            vm.importantInfo.push(note);
        }
    }

    function configureCharts() {

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

        Highcharts.setOptions({
            lang: {
                //Zoom replaced with Date Range
                rangeSelectorZoom:''
            }
        });
    }

    function drawLineChart() {

        var reformedData = [];
        for(var i = 0; i < vm.scoresForSection.length; i++)
        {
            var dv = [];  //array to store pairs of [date, testResult]
            dv[0] = Date.parse(vm.scoresForSection[i].last_updated);  //dateArray[0] = most recent date
            dv[1] = parseFloat(vm.scoresForSection[i].score);
            reformedData.push(dv);
        }

        console.log(reformedData);
        /*********************************************
         * FINDING THE MAX AND MIN VALUES FOR CHARTING
         *********************************************/
        var maxChart = 100;
        var minChart = 0;

        windowWidth = $(window).width();

        vm.chart = new Highcharts.stockChart({
            rangeSelector: {
                enabled: true,
                //select all as default button
                selected: 4,
                buttonSpacing: 14,
                buttons: [{
                    type: 'month',
                    count: 1,
                    text: '1month'
                }, {
                    type: 'month',
                    count: 3,
                    text: '3month'
                }, {
                    type: 'month',
                    count: 6,
                    text: '6month'
                }, {
                    type: 'year',
                    count: 1,
                    text: '1year'
                }, {
                    type: 'all',
                    text: 'All'
                }],
                buttonTheme: {
                    width: null
                }
            },
            chart: {
                renderTo: 'chartArea',
                // Explicitly tell the width and height of a chart
                width: windowWidth,
                height: null,
                zoomType: 'xy'
            },
            exporting: {
                enabled: true,
                buttons: {
                    contextButton: {
                        enabled: false
                        //menuItems: ['downloadJPEG','downloadPDF','downloadPNG','downloadSVG','separator','printChart']
                    }
                }
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: { // don't display the dummy year
                    month: '%e. %b',
                    year: '%b'
                },
                title: {
                    text: 'Date'
                },
                labels: {
                    style: {
                        fontSize: '15px'
                    }
                }
            },
            yAxis: {
                max: maxChart,
                min: minChart,
                title: {
                    text: '\%'
                },
                opposite: false,
                tickInterval: 10,
                labels: {
                    style: {
                        fontSize: '15px'
                    }
                }
            },
            title: {
                text: vm.sectionTitle,
                align: 'center',
            },
            plotOptions: {
                series: {
                    fillOpacity: 0.1
                }
            },
            series: [{
                name: 'Score',
                data: reformedData,
                marker: {
                    enabled: true,
                    radius: 3
                },
                type: 'area',
                color: 'rgba(21, 148, 187, 0.65)',
                pointWidth: 100,
                tooltip: {
                    valueDecimals: 0
                }
            }]
        });

    }

    function drawHistogram() {
        // Chart

        // reform data.
        // count for data in different range.
        var reformedData = [0,0,0,0,0,0,0,0,0,0];
        for(var i = 0; i < vm.scoresForSection.length; i++)
        {
            var category = Math.floor(vm.scoresForSection[i].score / 10);
            switch(category) {
                case 0:
                    reformedData[0]++;
                    break;
                case 1:
                    reformedData[1]++;
                    break;
                case 2:
                    reformedData[2]++;
                    break;
                case 3:
                    reformedData[3]++;
                    break;
                case 4:
                    reformedData[4]++;
                    break;
                case 5:
                    reformedData[5]++;
                    break;
                case 6:
                    reformedData[6]++;
                    break;
                case 7:
                    reformedData[7]++;
                    break;
                case 8:
                    reformedData[8]++;
                    break;
                case 9:
                    reformedData[9]++;
                    break;
                default:
                    break;
            }
        }

        console.log(reformedData);

        windowWidth = $(window).width();

        vm.chartOptions = {};
        vm.chart = new Highcharts.Chart({
            rangeSelector: {
                enabled: false
            },
            navigator: {
                enabled: false
            },
            scrollbar: {
                enabled: false
            },
            legend: {
                enabled: false
            },
            chart: {
                renderTo: 'chartArea',
                type: 'column',
                // Explicitly tell the width and height of a chart
                width: windowWidth,
                height: null,
                zoomType: 'x'
            },
            exporting: {
                enabled: true,
                buttons: {
                    contextButton: {
                        enabled: false
                        //menuItems: ['downloadJPEG','downloadPDF','downloadPNG','downloadSVG','separator','printChart']
                    }
                }
            },

            xAxis: {
                type: 'category',
                categories: [
                    '0-9',
                    '10-19',
                    '20-29',
                    '30-39',
                    '40-49',
                    '50-59',
                    '60-69',
                    '70-79',
                    '80-89',
                    '90-100'
                ],
                title: {
                    text: '\%'
                },
                labels: {
                    style: {
                        fontSize: '15px'
                    }
                }
            },
            series: [{
                type: 'column',
                data: reformedData
            }],
            yAxis: {
                title: 'times',
                labels: {
                    style: {
                        fontSize: '15px'
                    }
                }
            },

            plotOptions: {
                series: {
                    pointPadding: 0,
                    groupPadding: 0,
                    borderWidth: 0,
                    shadow: false,
                    animation: false,
                    fillOpacity: 0.1
                }
            },

            title: {
                text: vm.sectionTitle,
                align: 'center',
            }
        });
    }

}]);