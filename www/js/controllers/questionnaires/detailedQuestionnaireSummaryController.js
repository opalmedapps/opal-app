// entitySummaryController

var app = angular.module('MUHCApp');
app.controller('detailedQuestionnaireSummaryController', [
    '$scope',
    '$rootScope',
    'Questionnaires',
    'UserPreferences',
    '$location',
    'NavigatorParameters',
    '$anchorScroll',
    '$filter',
    '$timeout',
    function ($scope, $rootScope, Questionnaires, UserPreferences, $location, NavigatorParameters, $anchorScroll, $filter, $timeout) {
        $scope.loading = true;

        var vm = this;
        vm.historicalQuestionnaires = [];
        vm.importantInfo = [];
        vm.expandTotalScore = false;
        vm.expandedQuestionLists = [];

        activate();

        function activate() {
            var params = NavigatorParameters.getParameters();
            vm.questionnaire = params.questionnaire;
            Questionnaires.requestHistoricalQuestionnaires(vm.questionnaire.questionnaire_ser_num)
                .then(function () {
                    vm.historicalQuestionnaires = Questionnaires.getHistoricalQuestionnaires();
                    for (var section in vm.historicalQuestionnaires.sections) {
                        vm.historicalQuestionnaires.sections[section].expandSectionScores = false;
                        vm.expandedQuestionLists[section] = false;
                        for (var question in vm.historicalQuestionnaires.sections[section].questions) {
                            vm.historicalQuestionnaires.sections[section].questions[question].expandQuestionScores = false;
                        }
                    }
                    console.log(vm.historicalQuestionnaires);
                    // importantInfo();
                    configureCharts();
                    vm.expandTotalScore = true;
                    $scope.loading = false;
                });
        }

        function importantInfo() {
            //Same for either questionnaire section because it's out of 100!
            //flag results that are 70% or higher
            // Flag results whose values have changed by 50% or 75%
            vm.questionnaireScores = vm.historicalQuestionnaires.scoresForQuestionnaire;
            var i = vm.questionnaireScores.length - 1;
            if (vm.questionnaireScores[i] >= 70) {
                vm.importantInfo.push("Current section score is " + vm.questionnaireScores[i] + ".");
            }
            if (vm.questionnaireScores[i] - vm.questionnaireScores[i - 1] >= 50) {
                vm.importantInfo.push("Section score increased by 50% since last timepoint.");
            }
            else if (vm.questionnaireScores[i] - vm.questionnaireScores[i - 1] <= -50) {
                vm.importantInfo.push("Section score improved by 50% since last timepoint.");
            }
            if (vm.questionnaireScores[i] - vm.questionnaireScores[i - 1] >= 75) {
                vm.importantInfo.push("Section score increased by 75% within two timepoints.");
            }
            else if (vm.questionnaireScores[i] - vm.questionnaireScores[i - 1] <= -75) {
                vm.importantInfo.push("Section score improved by 75% within two timepoints.");
            }
            if (vm.questionnaireScores[i] - vm.questionnaireScores[0] >= 50) {
                vm.importantInfo.push("Section score increased by 50% since initial assessment.");
            }
            else if (vm.questionnaireScores[i] - vm.questionnaireScores[0] <= -50) {
                vm.importantInfo.push("Section score increased by 50% since initial assessment.");
            }

            if (vm.importantInfo.length === 0) {
                vm.importantInfo.push("There are no significant score changes to report.");
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

        vm.toggleExpandTotalScore = function () {
            vm.expandTotalScore = !vm.expandTotalScore; //toggle between true and false
        };

        vm.toggleExpandSectionScore = function (section, sectionListId) {
            vm.historicalQuestionnaires.sections[section.section_ser_num].expandSectionScores = !section.expandSectionScores;
            if (vm.historicalQuestionnaires.sections[section.section_ser_num].expandSectionScores === false) {
                vm.expandedQuestionLists[section.section_ser_num] = false;
                for (var i = 0; i < vm.historicalQuestionnaires.sections[section.section_ser_num].questions.length; i++) {
                    vm.historicalQuestionnaires.sections[section.section_ser_num].questions[i].expandQuestionScores = false;
                }
            }
            $location.hash(sectionListId);
            $anchorScroll();
        };

        vm.toggleExpandQuestionScore = function (sectionId, question, chartId) {
            vm.historicalQuestionnaires.sections[sectionId].questions[question.question_ser_num].expandQuestionScores = !question.expandQuestionScores; //toggle between true and false
            $location.hash(chartId);
            $anchorScroll();
        };

        vm.toggleExpandQuestionList = function (id, questionListId) {
            vm.expandedQuestionLists[id] = !vm.expandedQuestionLists[id];
            for (var question in vm.historicalQuestionnaires.sections[id].questions) {
                vm.historicalQuestionnaires.sections[id].questions[question].expandQuestionScores = false;
            }

            $location.hash(questionListId);
            $anchorScroll();
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
            var questionnaireScores = [];
            for (var item in scope.data) {
                var dateScore = [];  //array to store pairs of [date, score]
                dateScore[0] = Date.parse(scope.data[item].last_updated);
                dateScore[1] = parseFloat(scope.data[item].score);
                questionnaireScores.push(dateScore);
            }
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
                    data: questionnaireScores,
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