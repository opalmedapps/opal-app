// entitySummaryController

var app = angular.module('MUHCApp');
app.controller('detailedQuestionnaireSummaryController', [
    '$scope',
    '$rootScope',
    'Questionnaires',
    '$location',
    'NavigatorParameters',
    '$timeout',
    function ($scope, $rootScope, Questionnaires, $location, NavigatorParameters, $timeout) {
        $scope.loading = true;

        var vm = this;
        // vm.entity.sections.question
        // vm.goToGlobalScoreHistory()
        // vm.goToSectionScoreHistory(section)
        // vm.goToQuestionScoreHistory(question)
        activate();

        function activate() {
            var params = NavigatorParameters.getParameters();
            vm.questionnaire = params.questionnaire;
            Questionnaires.requestHistoricalQuestionnaires(vm.questionnaire.title)
                .then(function () {
                    vm.historicalQuestionnaires = Questionnaires.getHistoricalQuestionnaires();
                    console.log(vm.historicalQuestionnaires);
                    $scope.loading = false;
                });

            // Questionnaires.requestAlgorithms(vm.entity.ser_num)
            //     .then(function () {
            //             vm.algorithms = Questionnaires.getAlgorithms();
            //             $scope.loading = false;
            //         }
            //     );
        }

        vm.goToGlobalScoreHistory = function () {
            NavigatorParameters.setParameters({
                Navigator: 'personalNavigator',
                questionnaireScores: vm.historicalQuestionnaires.scoresForQuestionnaire,
                questionnaireNickname: vm.questionnaire.nickname
                // algorithms: vm.algorithms
            });
            personalNavigator.pushPage('views/personal/questionnaires/globalScoreHistory.html', {animation: 'slide'});
        };

        vm.goToSectionScoreHistory = function (selectedSection) {
            NavigatorParameters.setParameters({
                Navigator: 'personalNavigator',
                scoresForSection: selectedSection.scoresForSection,
                sectionTitle: selectedSection.title
                // entity: vm.entity,
                // section: selectedSection,
                // algorithms: vm.algorithms
            });
            personalNavigator.pushPage('views/personal/questionnaires/sectionScoreHistory.html', {animation: 'slide'});
        };

        vm.goToQuestionScoreHistory = function (selectedSection, selectedQuestion) {
            NavigatorParameters.setParameters({
                Navigator: 'personalNavigator',
                scoresForQuestion: selectedQuestion.scoresForQuestion,
                questionLabel: selectedQuestion.text,
                question: selectedQuestion
                // entity: vm.entity,
                // section: selectedSection,
                // algorithms: vm.algorithms
            });
            personalNavigator.pushPage('views/personal/questionnaires/questionScoreHistory.html', {animation: 'slide'});
        };
    }]);