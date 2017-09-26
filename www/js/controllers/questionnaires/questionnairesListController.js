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
        'Questionnaires', 'NavigatorParameters', '$timeout'
    ];

    /* @ngInject */
    function QuestionnairesListController(Questionnaires, NavigatorParameters, $timeout) {
        var vm = this;
        var questionnaireSerNum;

        vm.loading = true;
        vm.current_type = 'new';

        vm.getDesiredQuestionnaires = getDesiredQuestionnaires;
        vm.goToQuestionnaire = goToQuestionnaire;
        vm.refreshQuestionnairesList = refreshQuestionnairesList;

        activate();

        ////////////////////

        /************************
         * PRIVATE FUNCTIONS
         ***********************/

        function activate(){

            console.log('activated');

            if(!Questionnaires.isEmpty()){
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


            personalNavigator.on('postpop', popPost);
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
            return patientQuestionnaire.CompletedFlag !== 0;
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
            } else if (type === 'new') {
                for (var key in vm.patientQuestionnaires) {
                    questionnaireSerNum = vm.patientQuestionnaires[key].QuestionnaireSerNum;
                    if ((!isQuestionnaireComplete(vm.patientQuestionnaires[key])) && (!Questionnaires.isQuestionnaireInProgress(questionnaireSerNum))) {
                        vm.desiredQuestionnaires.push(vm.patientQuestionnaires[key]);
                    }
                }
                vm.isAnswered = "New Questionnaires";
                vm.clickedText = 'new';
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
            console.log('triggered');

            if(!(isQuestionnaireComplete(patientQuestionnaire))) {

                NavigatorParameters.setParameters({Navigator:'personalNavigator', DBSerNum: questionnaireDBSerNum, SerNum: questionnaireSerNum});
                personalNavigator.pushPage('views/personal/questionnaires/questionnaires.html', {param:questionnaireDBSerNum, QuestionnaireSerNum:questionnaireSerNum},{ animation : 'slide' });
            } else {



                NavigatorParameters.setParameters({Navigator:'personalNavigator', DBSerNum: questionnaireDBSerNum, SerNum: questionnaireSerNum});
                personalNavigator.pushPage('views/personal/questionnaires/answeredQuestionnaire.html', {param:questionnaireDBSerNum, QuestionnaireSerNum:questionnaireSerNum},{ animation : 'slide' });
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
