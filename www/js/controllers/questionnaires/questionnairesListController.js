var app = angular.module('MUHCApp');
app.controller('questionnairesListController', [
    '$scope',
    '$rootScope',
    'Questionnaires',
    '$location',
    'NavigatorParameters',
    '$timeout',
    function ($scope, $rootScope, Questionnaires, $location, NavigatorParameters, $timeout) {

        $scope.loading = true;

        activate();

        function activate() {
            NavigatorParameters.setParameters({'Navigator': 'personalNavigator'});
            NavigatorParameters.setNavigator(personalNavigator);

            Questionnaires.requestQuestionnaires()
                .then(function () {
                    $scope.newQuestionnaireList = Questionnaires.getQuestionnaires('New');
                    $scope.inProgressQuestionnaireList = Questionnaires.getQuestionnaires('In Progress');
                    $scope.completedQuestionnaireList = Questionnaires.getQuestionnaires('Completed');
                    $scope.summaryQuestionnaireList = [];
                    var questionnairesByName = Questionnaires.getByQuestionnaireName();
                    for(var quest in questionnairesByName) {
                        $scope.summaryQuestionnaireList.push(questionnairesByName[quest]);
                    }
                    $scope.loading = false;
                });
        }

    $scope.goToQuestionnaire = function(selectedQuestionnaire) {
        var questionnaireToReturn = {};
        console.log("selectedQuestionnaire: ");
        console.log(selectedQuestionnaire);
        Questionnaires.requestQuestionnaire(selectedQuestionnaire.qp_ser_num)
            .then(function() {
                questionnaireToReturn = Questionnaires.getQuestionnaire();
                console.log("questionnaireToReturn: ");
                console.log(questionnaireToReturn);
                NavigatorParameters.setParameters({Navigator:'personalNavigator', questionnaire: questionnaireToReturn});
                personalNavigator.pushPage('views/personal/questionnaires/questionnaires.html',{ animation : 'slide' });
            });
    };

    $scope.goToQuestionnaireSummary = function(selectedQuestionnaire) {
        var questionnaireToReturn = {};
        Questionnaires.requestQuestionnaire(selectedQuestionnaire.qp_ser_num)
            .then(function() {
                questionnaireToReturn = Questionnaires.getQuestionnaire();
                NavigatorParameters.setParameters({
                    Navigator: 'personalNavigator',
                    questionnaire: questionnaireToReturn
                });
                personalNavigator.pushPage('views/personal/questionnaires/answeredQuestionnaire.html', {animation: 'slide'});
            });
    };

        // go to historical summary page of the selected questionnaire entity
        $scope.goToHistoricalSummary = function (selectedQuestionnaire) {
            NavigatorParameters.setParameters({Navigator: 'personalNavigator', questionnaire: selectedQuestionnaire});
            personalNavigator.pushPage('views/personal/questionnaires/questionnaireSummaryDetailed.html', {animation: 'slide'});
        };

        $scope.setNew = function () {
            $scope.new = true;
            $scope.progress = false;
            $scope.completed = false;
            $scope.summary = false;
        }

        $scope.setProgress = function () {
            $scope.new = false;
            $scope.progress = true;
            $scope.completed = false;
            $scope.summary = false;
        }

        $scope.setCompleted = function () {
            $scope.new = false;
            $scope.progress = false;
            $scope.completed = true;
            $scope.summary = false;
        }
        $scope.setSummary = function () {
            $scope.new = false;
            $scope.progress = false;
            $scope.completed = false;
            $scope.summary = true;
        }


        $scope.getQuestionnaireCount = function (type) {
            return Questionnaires.getQuestionnaireCount(type);
        };

    }]);
