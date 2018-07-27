// entitySummaryController

var app = angular.module('MUHCApp');
app.controller('questionnaireSummaryByAnswersController', [
    '$scope',
    '$rootScope',
    'Questionnaires',
    'UserPreferences',
    'HighChartService',
    '$location',
    'NavigatorParameters',
    '$anchorScroll',
    '$filter',
    '$timeout',
    function ($scope, $rootScope, Questionnaires, UserPreferences, HighChartService, $location, NavigatorParameters, $anchorScroll, $filter, $timeout) {
        $scope.loading = true;

        var vm = this;
        vm.historicalQuestionnaires = [];   // JSON with scores and answers for a specific type of questionnaire
        vm.expandSectinos = [];             // flags for expanding/collapsing sections and questions
        vm.chartOptions = [];               // preconfigured JSON for highcharts library
        vm.importantInfo = [];

        activate();

        function activate() {
            // fetch historical questionnaires data from service
            vm.historicalQuestionnaires = Questionnaires.getHistoricalQuestionnaires();
            prepareExpandableRows();
            configureCharts();
            $scope.loading = false;
        }

        // Initializing charts properties
        vm.initChartOptions = function (question) {

            vm.chartOptions = HighChartService.getJSONForColumnChart(
                question.title,
                question.answersForQuestion
            );
        };

        //toggle between true and false for section chart
        vm.toggleExpandSectionScore = function (sectionId, sectionListId) {
            vm.expandSectinos[sectionId].expandSectionScores = !vm.expandSectinos[sectionId].expandSectionScores;
            if (vm.expandSectinos[sectionId].expandSectionScores === false) {
                // collapse all questions
                for (var question in vm.expandSectinos[sectionId].questions) {
                    vm.expandSectinos[sectionId].questions[question].expandQuestionScores = false;
                }
            }
            // auto scroll to clicked row
            $location.hash(sectionListId);
            $anchorScroll();
        };

        //toggle between true and false for question chart
        vm.toggleExpandQuestionScore = function (sectionId, questionId, chartId) {
            vm.expandSectinos[sectionId].questions[questionId].expandQuestionScores = !vm.expandSectinos[sectionId].questions[questionId].expandQuestionScores;

            // auto scroll to clicked row
            $location.hash(chartId);
            $anchorScroll();
        };

        function prepareExpandableRows() {
            for (var section in vm.historicalQuestionnaires.sections) {
                vm.expandSectinos[section] = [];
                vm.expandSectinos[section].questions = [];
                for (var question in vm.historicalQuestionnaires.sections[section].questions) {
                    vm.expandSectinos[section].questions[question] = [];
                    vm.expandSectinos[section].questions[question].expandQuestionScores = false;
                }
            }
        }

        function configureCharts() {

            if (UserPreferences.getLanguage().toUpperCase() === 'FR') {
                Highcharts.setOptions(HighChartService.configureFrenchCharts());
                Highcharts.dateFormat('%e%a');
            }

            Highcharts.setOptions({
                lang: {
                    //Zoom replaced with Date Range
                    rangeSelectorZoom: ''
                }
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
    }]);