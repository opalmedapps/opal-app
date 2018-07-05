// questionHistoryController
// 需要service Questionnaires

var app = angular.module('MUHCApp');
app.controller('questionScoreHistoryController', ['$scope', '$rootScope', 'Questionnaires', 'UserPreferences', '$location', 'NavigatorParameters', '$filter', '$timeout', function($scope, $rootScope, Questionnaires, UserPreferences, $location, NavigatorParameters, $filter, $timeout) {

    $scope.loading = true;

    var vm = this;
    vm.importantInfo = [];
    vm.algorithms = []; // {ser_num, nickname, version}
    activate();

    function activate() {
        $scope.line = false;
        $scope.histogram = false;
        var default_alg = {ser_num: "default", title: $filter('translate')("Default"), nickname: $filter('translate')("Default")};
        $scope.algo = "default";
        var params = NavigatorParameters.getParameters();
        // var entity = params.entity;
        // var section = params.section;
        // var question = params.question;
        // vm.entity = {ser_num: entity.ser_num, title: entity.title, nickname: entity.nickname};
        // vm.section = {ser_num: section.ser_num, title: section.title};
        vm.question = params.question;
        // vm.algorithms = [default_alg].concat(params.algorithms);
        vm.scoresForQuestion = params.scoresForQuestion;
        vm.questionLabel = params.questionLabel;
        vm.min = 0;
        vm.max = 100;
        importantInfo();
        configureCharts();
        console.log(vm.algorithms);
        // get score history
        // still need to know: min max value of the options under a non-default scoring alg
        $scope.loading = false;

        // Questionnaires.requestQuestionScores(entity.ser_num, section.ser_num, question.ser_num, default_alg.ser_num)
        //     .then(function () {
        //         // process score data
        //         // {max, min, scores[]}
        //         vm.scores = Questionnaires.getScores();
        //
        //         vm.min = 0;
        //         vm.max = 100;
        //
        //         importantInfo();
        //         Questionnaires.requestQuestionAnswers(entity.ser_num, section.ser_num, question.ser_num)
        //             .then(function() {
        //                 // process option data
        //                 vm.answers = Questionnaires.getAnswers();
        //                 configureCharts();
        //                 $scope.loading = false;
        //             });
        //     });
    }

    vm.switchAlg = function(alg) {
        $scope.algo = alg;
        console.log($scope.algo);
        console.log(alg);
        $scope.loading = true;
        Questionnaires.requestQuestionScores(vm.entity.ser_num, vm.section.ser_num, vm.question.ser_num, $scope.algo)
            .then(function () {
                // get score data
                vm.scores = Questionnaires.getScores();
                // get min and max of option scores
                var minmax = Questionnaires.getMinmax();
                vm.min = minmax[0];
                vm.max = minmax[1];

                if ($scope.algo !== "default") {
                    importantInfo();
                }
                else {
                    vm.importantInfo = [];
                    // set min max value
                }

                $scope.loading = false;
            });
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
        var nicknamestr = (vm.entity.nickname+"_"+vm.question.text+"_"+algstr).replace(new RegExp(' ',"g"), '_');
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
        var i = vm.scoresForQuestion.length-1;
        if (vm.scoresForQuestion[i] >= 70) {
            note = "Current section score is " + vm.scoresForQuestion[i] + "." ;
            vm.importantInfo.push(note);
        }
        if(vm.scoresForQuestion[i] - vm.scoresForQuestion[i-1] >= 50){
            note = "Section score increased by 50% since last timepoint.";
            vm.importantInfo.push(note);
        }
        else if(vm.scoresForQuestion[i] - vm.scoresForQuestion[i-1] <= -50) {
            note = "Section score improved by 50% since last timepoint.";
            vm.importantInfo.push(note);
        }
        if(vm.scoresForQuestion[i] - vm.scoresForQuestion[i-1] >= 75) {
            note = "Section score increased by 75% within two timepoints.";
            vm.importantInfo.push(note);
        }
        else if(vm.scoresForQuestion[i] - vm.scoresForQuestion[i-1] <= -75) {
            note = "Section score improved by 75% within two timepoints.";
            vm.importantInfo.push(note);
        }
        if(vm.scoresForQuestion[i] - vm.scoresForQuestion[0] >= 50) {
            note = "Section score increased by 50% since initial assessment.";
            vm.importantInfo.push(note);
        }
        else if(vm.scoresForQuestion[i] - vm.scoresForQuestion[0] <= -50) {
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
        for(var i = 0; i < vm.scoresForQuestion.length; i++)
        {
            var dv = [];  //array to store pairs of [date, testResult]
            dv[0] = Date.parse(vm.scoresForQuestion[i].last_updated);  //dateArray[0] = most recent date
            dv[1] = parseFloat(vm.scoresForQuestion[i].score);
            reformedData.push(dv);
        }

        console.log(reformedData);

        windowWidth = $(window).width();

        // DIFFERENT MAX AND MIN!

        var maxChart = vm.max;
        var minChart = vm.min;

        var tickInterval;
        var range = vm.max - vm.min;
        if (range > 50) {
            tickInterval = 10;
        } else if (range > 20){
            tickInterval = 5;
        } else if (range > 10) {
            tickInterval = 2;
        } else {
            tickInterval = 1;
        }

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
                tickInterval: tickInterval,
                labels: {
                    style: {
                        fontSize: '15px'
                    }
                }
            },
            title: {
                text: (vm.question.position) + ". " + vm.question.text,
                align: 'left',
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
        // count for data in different options.

        // 这里，涉及到不同的questiontype的CATEGORY，
        // 如果是multiple choice, 按option数量来分，
        // 如果是scale, 按最大最小值来分
        var numOfColumns = 0;
        var categories = [];
        if (vm.question.questiontype == "Scale") {
            var m1 = parseInt(vm.question.options[0]);
            var m2 = parseInt(vm.question.options[1]);
            var min = Math.min(m1, m2);
            var max = Math.max(m1, m2);
            for (var i = min; i <= max; i++) {
                categories.push(i.toString());
            }
            numOfColumns = categories;
        }
        else {
            var options = vm.question.options;
            for (var i in options) {
                categories.push(options[i].text);
            }
            numOfColumns = categories.length;
        }

        var reformedData = [];
        for (var i = 0; i < numOfColumns; i++) {
            reformedData.push(0);
        }

        // fill reformedData
        // 需要提前拿到对应的分数！！！
        if (vm.question.questiontype == "Scale") {
            for(var i = 0; i < vm.answers.length; i++) {
                reformedData[categories.indexOf(vm.answers[i].scale_answer)]++;
            }
        }
        else {
            var options = vm.question.options;
            console.log(vm.answers);
            for(var i = 0; i < vm.answers.length; i++)
            {
                // 找到option ser_num对应的position
                for (var j in options) {
                    if (vm.answers[i].answeroption_ser_num == j) {
                        reformedData[options[j].position - 1]++;
                    }
                }
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
                categories: categories,
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
                text: vm.question.text,
                align: 'left',
            }
        });
    }


}]);