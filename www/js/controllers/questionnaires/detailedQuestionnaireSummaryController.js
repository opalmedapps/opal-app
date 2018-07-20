// entitySummaryController

var app = angular.module('MUHCApp');
app.controller('detailedQuestionnaireSummaryController', [
    '$scope',
    '$rootScope',
    'Questionnaires',
    'UserPreferences',
    '$location',
    'NavigatorParameters',
    '$filter',
    '$timeout',
    function ($scope, $rootScope, Questionnaires, UserPreferences, $location, NavigatorParameters, $filter, $timeout) {
        $scope.loading = true;

        var vm = this;
        $scope.historicalQuestionnaires = [];
        vm.questionnaireScores = [];
        vm.importantInfo = [];
        vm.expandTotalScore = false;
        vm.expandedQuestionLists = [];
        vm.algorithms = []; // {ser_num, nickname, version}


        activate();

        function activate() {
            var default_alg = {
                ser_num: "default",
                title: $filter('translate')("Default"),
                nickname: $filter('translate')("Default")
            };
            $scope.algo = "default";
            var params = NavigatorParameters.getParameters();
            vm.questionnaire = params.questionnaire;
            Questionnaires.requestHistoricalQuestionnaires(vm.questionnaire.questionnaire_ser_num)
                .then(function () {
                    $scope.historicalQuestionnaires = Questionnaires.getHistoricalQuestionnaires();
                    vm.questionnaireScores = $scope.historicalQuestionnaires.scoresForQuestionnaire;
                    var questionnaireScores = [];
                    for (var questionnaire in $scope.historicalQuestionnaires.scoresForQuestionnaire) {
                        var dateScore = [];  //array to store pairs of [date, score]
                        dateScore[0] = Date.parse($scope.historicalQuestionnaires.scoresForQuestionnaire[questionnaire].last_updated);
                        dateScore[1] = parseFloat($scope.historicalQuestionnaires.scoresForQuestionnaire[questionnaire].score);
                        questionnaireScores.push(dateScore);
                    }
                    $scope.historicalQuestionnaires.scoresForQuestionnaire = questionnaireScores;

                    for (var section in $scope.historicalQuestionnaires.sections) {
                        var reformedData = [];
                        for (var i = 0; i < $scope.historicalQuestionnaires.sections[section].scoresForSection.length; i++) {
                            var dateScore = [];  //array to store pairs of [date, score]
                            dateScore[0] = Date.parse($scope.historicalQuestionnaires.sections[section].scoresForSection[i].last_updated);
                            dateScore[1] = parseFloat($scope.historicalQuestionnaires.sections[section].scoresForSection[i].score);
                            reformedData.push(dateScore);
                        }
                        $scope.historicalQuestionnaires.sections[section].scoresForSection = reformedData;
                        $scope.historicalQuestionnaires.sections[section].expandSectionScores = false;
                        vm.expandedQuestionLists[section] = false;
                        for (var question in $scope.historicalQuestionnaires.sections[section].questions) {
                            reformedData = [];
                            for (var j = 0; j < $scope.historicalQuestionnaires.sections[section].questions[question].scoresForQuestion.length; j++) {
                                var dateScore = [];  //array to store pairs of [date, score]
                                dateScore[0] = Date.parse($scope.historicalQuestionnaires.sections[section].questions[question].scoresForQuestion[j].last_updated);
                                dateScore[1] = parseFloat($scope.historicalQuestionnaires.sections[section].questions[question].scoresForQuestion[j].score);
                                reformedData.push(dateScore);
                            }
                            $scope.historicalQuestionnaires.sections[section].questions[question].scoresForQuestion = reformedData;
                            $scope.historicalQuestionnaires.sections[section].questions[question].expandQuestionScores = false;
                        }
                    }

                    console.log($scope.historicalQuestionnaires);
                    vm.algorithms = [default_alg].concat(params.algorithms);


                    // importantInfo();
                    configureCharts();
                    vm.expandTotalScore = true;
                    $scope.loading = false;
                });
        }

        vm.setLine = function (scores, title, id) {
            drawLineChart(scores, title, id);
        };


        vm.exportChart = function () {
            var d = new Date();
            var timestr = d.getFullYear() + "_" + d.getMonth() + "_" + d.getDate() + "_" + d.getHours() + "_" + d.getMinutes() + "_" + d.getSeconds();
            var algstr = $("select option:selected").text();
            var nicknamestr = (vm.entity.nickname + "_" + algstr).replace(new RegExp(' ', "g"), '_');
            // PROBLEM: it goes through external server, offline export does not work here. Maybe try a local exporting server.

            vm.chart.exportChart({
                type: 'application/pdf',
                filename: nicknamestr + "_" + timestr,
                sourceHeight: 500,
                sourceWidth: 750
            }, {
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
        };

        function importantInfo() {
            //Same for either questionnaire section because it's out of 100!
            //flag results that are 70% or higher
            // Flag results whose values have changed by 50% or 75%
            var i = vm.questionnaireScores.length - 1;
            if (vm.questionnaireScores[i] >= 70) {
                note = "Current section score is " + vm.questionnaireScores[i] + ".";
                vm.importantInfo.push(note);
            }
            if (vm.questionnaireScores[i] - vm.questionnaireScores[i - 1] >= 50) {
                note = "Section score increased by 50% since last timepoint.";
                vm.importantInfo.push(note);
            }
            else if (vm.questionnaireScores[i] - vm.questionnaireScores[i - 1] <= -50) {
                note = "Section score improved by 50% since last timepoint.";
                vm.importantInfo.push(note);
            }
            if (vm.questionnaireScores[i] - vm.questionnaireScores[i - 1] >= 75) {
                note = "Section score increased by 75% within two timepoints.";
                vm.importantInfo.push(note);
            }
            else if (vm.questionnaireScores[i] - vm.questionnaireScores[i - 1] <= -75) {
                note = "Section score improved by 75% within two timepoints.";
                vm.importantInfo.push(note);
            }
            if (vm.questionnaireScores[i] - vm.questionnaireScores[0] >= 50) {
                note = "Section score increased by 50% since initial assessment.";
                vm.importantInfo.push(note);
            }
            else if (vm.questionnaireScores[i] - vm.questionnaireScores[0] <= -50) {
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

            if (UserPreferences.getLanguage().toUpperCase() === 'FR') {
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
                    rangeSelectorZoom: ''
                }
            });
        }

        function drawLineChart(scores, title, id) {
            var reformedData = [];
            for (var i = 0; i < scores.length; i++) {
                var dv = [];  //array to store pairs of [date, testResult]
                dv[0] = Date.parse(scores[i].last_updated);  //dateArray[0] = most recent date
                dv[1] = parseFloat(scores[i].score);
                reformedData.push(dv);
            }

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
                    renderTo: id,
                    // Explicitly tell the width and height of a chart
                    width: windowWidth,
                    height: null,
                    zoomType: 'xy'
                },
                exporting: {
                    enabled: true,
                    buttons: {
                        contextButton: {
                            enabled: false,
                            // menuItems: ['downloadJPEG','downloadPDF','downloadPNG','downloadSVG','separator','printChart']
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
                    text: title,
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

        vm.toggleExpandTotalScore = function () {
            vm.expandTotalScore = !vm.expandTotalScore; //toggle between true and false
        };

        vm.toggleExpandSectionScore = function (section) {
            $scope.historicalQuestionnaires.sections[section.section_ser_num].expandSectionScores = !section.expandSectionScores;
            if ($scope.historicalQuestionnaires.sections[section.section_ser_num].expandSectionScores === false) {
                vm.expandedQuestionLists[section.section_ser_num] = false;
                for(var i = 0; i < $scope.historicalQuestionnaires.sections[section.section_ser_num].questions.length; i++) {
                    $scope.historicalQuestionnaires.sections[section.section_ser_num].questions[i].expandQuestionScores = false;
                }
            }
        };

        vm.toggleExpandQuestionScore = function (sectionId, question) {
            $scope.historicalQuestionnaires.sections[sectionId].questions[question.question_ser_num].expandQuestionScores = !question.expandQuestionScores;
            // vm.expandQuestionScore = !vm.expandQuestionScore; //toggle between true and false
        };

        vm.toggleExpandQuestionList = function(id) {
            vm.expandedQuestionLists[id] = !vm.expandedQuestionLists[id];
            for (var question in $scope.historicalQuestionnaires.sections[id].questions) {
                $scope.historicalQuestionnaires.sections[id].questions[question].expandQuestionScores = false;
            }
        }
    }]);


app.directive('hcLineChart', function () {
    return {
        restrict: 'E',
        template: '<div></div>',
        scope: {
            title: '@',
            data: '='
        },
        link: function (scope, element) {
            var windowWidth = $(window).width();
            Highcharts.stockChart(element[0], {
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
                    width: windowWidth,
                    height: null,
                    zoomType: 'xy'
                },
                exporting: {
                    enabled: true,
                    buttons: {
                        contextButton: {
                            fallbackToExportServer: false,
                            enabled: true,
                            menuItems: ['printChart', 'separator', 'downloadPNG', 'downloadJPEG','downloadPDF','downloadSVG']
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
                    max: 100,
                    min: 0,
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
                    text: scope.title,
                    align: 'center'
                },
                plotOptions: {
                    series: {
                        fillOpacity: 0.1
                    }
                },
                series: [{
                    showInNavigator: true,
                    name: 'Score',
                    data: scope.data,
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
    };
});