/*
 *Code by David Herrera May 20, 2015
 *Github: dherre3
 *Email:davidfherrerar@gmail.com
 */
(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('QuestionnairesListController', QuestionnairesListController);

    QuestionnairesListController.$inject = [
        'Questionnaires', 'NavigatorParameters', '$timeout', 'UserPreferences', '$window'
    ];

    /* @ngInject */
    function QuestionnairesListController(Questionnaires, NavigatorParameters, $timeout, UserPreferences, $window) {
        var vm = this;
        var questionnaireSerNum;
        var navigatorName = NavigatorParameters.getNavigatorName();

        vm.loading = true;
        vm.current_type = 'new';

        vm.language = UserPreferences.getLanguage().toUpperCase();
        vm.getDesiredQuestionnaires = getDesiredQuestionnaires;
        vm.goToQuestionnaire = goToQuestionnaire;
        vm.refreshQuestionnairesList = refreshQuestionnairesList;

        activate();

        ////////////////////

        /************************
         * PRIVATE FUNCTIONS
         ***********************/

        function activate(){

            if (ons.platform.isIOS()) {
                var tabbar = document.getElementById("questionnairesNavbar");
                tabbar.style.marginTop = "63px";
            }

            if(!Questionnaires.isEmpty() && !Questionnaires.needsRefreshing()){
                vm.questionnaires = Questionnaires.getPatientQuestionnaires().Questionnaires;
                vm.patientQuestionnaires = Questionnaires.getPatientQuestionnaires().PatientQuestionnaires;
                getDesiredQuestionnaires('new');
                getBadgeNumbers();
                vm.loading = false;
                return;
            }

            Questionnaires.requestQuestionnaires()
                .then(function () {
                        vm.questionnaires = Questionnaires.getPatientQuestionnaires().Questionnaires;
                        vm.patientQuestionnaires = Questionnaires.getPatientQuestionnaires().PatientQuestionnaires;
                        getDesiredQuestionnaires('new');
                        getBadgeNumbers();
                        vm.loading = false;
                    },
                    function(error){
                        vm.loading = false;
                    });


            if(typeof personalNavigator !== 'undefined'){
                 personalNavigator.on('postpop', popPost);
            }
        }

        function getBadgeNumbers () {
            for (var key in vm.patientQuestionnaires) {
                var questionnaireSerNum = vm.patientQuestionnaires[key].QuestionnaireSerNum;
                if ((!isQuestionnaireComplete(vm.patientQuestionnaires[key])) && (!Questionnaires.isQuestionnaireInProgress(questionnaireSerNum))) {
                    if (!vm.numQuestionnairesNew) {
                        vm.numQuestionnairesNew = 1;
                    } else {
                        vm.numQuestionnairesNew = vm.numQuestionnairesNew + 1;
                    }
                }
                if ((!isQuestionnaireComplete(vm.patientQuestionnaires[key])) && (Questionnaires.isQuestionnaireInProgress(questionnaireSerNum))) {
                    if (!vm.numQuestionnairesInProgress) {
                        vm.numQuestionnairesInProgress = 1;
                    } else {
                        vm.numQuestionnairesInProgress = vm.numQuestionnairesInProgress + 1;
                    }
                }
            }
        }

        function isQuestionnaireComplete (patientQuestionnaire) {
            return patientQuestionnaire.CompletedFlag !== "0";
        }

        function setQuestionnaireAnswersObject(object) {

            var oneQuestionnaireAnswer = {};
            if (!object) {
                return;
            }
            var answers = object.Answers;

            vm.answers = {};
            for(var key in answers) {
                oneQuestionnaireAnswer[key] = answers[key];
            }
            return oneQuestionnaireAnswer;
        }


        function popPost() {
            $timeout(function() {
                vm.refreshQuestionnairesList();
                getBadgeNumbers();
            });
        }


        /************************
         * PUBLIC FUNCTIONS
         ***********************/

        function getDesiredQuestionnaires (type) {
            vm.current_type = type;
            vm.desiredQuestionnaires = [];

            if (type === 'completed') {
                for (var key in vm.patientQuestionnaires) {
                    if (isQuestionnaireComplete(vm.patientQuestionnaires[key])) {
                        vm.desiredQuestionnaires.push(vm.patientQuestionnaires[key]);
                    }
                }
                vm.isAnswered = "Questionnaires Completed";
                vm.clickedText = "completed";

                vm.desiredQuestionnaires.sort(function(a, b) {

                    // TODO: USE EXTERNAL HELPER WHEN CALLING SORT FUNCTION

                    return new Date(b.CompletionDate) - new Date(a.CompletionDate);
                });
            } else if (type === 'new') {
                for (var key in vm.patientQuestionnaires) {
                    questionnaireSerNum = vm.patientQuestionnaires[key].QuestionnaireSerNum;
                    // if ((!isQuestionnaireComplete(vm.patientQuestionnaires[key])) && (!Questionnaires.isQuestionnaireInProgress(questionnaireSerNum))) {
                    //     vm.desiredQuestionnaires.push(vm.patientQuestionnaires[key]);
                    // }
                    // TEMPORARY CHANGE: While the 'In progress' tab is not working and has been removed,
                    //   we don't want in progress questionnaires to vanish from the new questionnaires list. -SB
                    if (!isQuestionnaireComplete(vm.patientQuestionnaires[key])) {
                        vm.desiredQuestionnaires.push(vm.patientQuestionnaires[key]);
                    }
                }
                vm.isAnswered = "New Questionnaires";
                vm.clickedText = 'new';

                vm.desiredQuestionnaires.sort(function(a, b) {

                    // TODO: USE EXTERNAL HELPER WHEN CALLING SORT FUNCTION

                    return new Date(b.DateAdded) - new Date(a.DateAdded);
                });
            } else if (type === 'progress') {
                for (var key in vm.patientQuestionnaires) {
                    questionnaireSerNum = vm.patientQuestionnaires[key].QuestionnaireSerNum;
                    if ((!isQuestionnaireComplete(vm.patientQuestionnaires[key])) && (Questionnaires.isQuestionnaireInProgress(questionnaireSerNum))) {
                        vm.desiredQuestionnaires.push(vm.patientQuestionnaires[key]);
                    }
                }
                vm.isAnswered = "Questionnaires In Progress";
                vm.clickedText = 'progress';
            }
        }

        function goToQuestionnaire(patientQuestionnaire, questionnaireDBSerNum, questionnaireSerNum) {

            if(!(isQuestionnaireComplete(patientQuestionnaire))) {
                NavigatorParameters.setParameters({DBSerNum: questionnaireDBSerNum, SerNum: questionnaireSerNum, Tab: vm.current_type});
                $window[navigatorName].pushPage('views/personal/questionnaires/questionnaires.html', {param:questionnaireDBSerNum, QuestionnaireSerNum:questionnaireSerNum},{ animation : 'slide' });
                // NavigatorParameters.setParameters({Navigator:'personalNavigator', DBSerNum: questionnaireDBSerNum, SerNum: questionnaireSerNum});
                // personalNavigator.pushPage('views/personal/questionnaires/questionnaires.html', {param:questionnaireDBSerNum, QuestionnaireSerNum:questionnaireSerNum},{ animation : 'slide' });
            } else {
                NavigatorParameters.setParameters({DBSerNum: questionnaireDBSerNum, SerNum: questionnaireSerNum, Tab: vm.current_type});
                $window[navigatorName].pushPage('views/personal/questionnaires/answeredQuestionnaire.html', {param:questionnaireDBSerNum, QuestionnaireSerNum:questionnaireSerNum},{ animation : 'slide' });
                // NavigatorParameters.setParameters({Navigator:'personalNavigator', DBSerNum: questionnaireDBSerNum, SerNum: questionnaireSerNum});
                // personalNavigator.pushPage('views/personal/questionnaires/answeredQuestionnaire.html', {param:questionnaireDBSerNum, QuestionnaireSerNum:questionnaireSerNum},{ animation : 'slide' });
            }
        }

        function refreshQuestionnairesList() {

            if (!vm.isAnswered) {
                getDesiredQuestionnaires('new');
            } else {
                getDesiredQuestionnaires(vm.clickedText);
            }
        }
    }
})();
