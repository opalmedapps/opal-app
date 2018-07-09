(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('AnsweredQuestionnaireController', AnsweredQuestionnaireController);

    AnsweredQuestionnaireController.$inject = [
        'Questionnaires', 'NavigatorParameters'
    ];

    /* @ngInject */
    function AnsweredQuestionnaireController(Questionnaires, NavigatorParameters) {
        var vm = this;
        vm.editQuestion = editQuestion;
        vm.submitQuestionnaire = submitQuestionnaire;
        vm.getScaleMaxValue = getScaleMaxValue;
        vm.getMaxOfSlider = getMaxOfSlider;

        // vm.toggleAnswer = toggleAnswer;

        activate();
        ///////////////////

        function activate() {
            var params = NavigatorParameters.getParameters();
            vm.questionnaire = params.questionnaire;
            vm.submitAllowed = true;
            for (var i=0; i<vm.questionnaire.sections.length; i++) {
                for (var j=0; j<vm.questionnaire.sections[i].questions.length; j++) {
                    if (vm.questionnaire.sections[i].questions[j].optional == 0 && vm.questionnaire.sections[i].questions[j].patient_answer.length == 0) {
                        console.log("Questionnaire can't be submitted because of question: ");
                        console.log(vm.questionnaire.sections[i].questions[j]);
                        vm.submitAllowed = false;
                        i = vm.questionnaire.sections.length;
                        break;
                    }
                }
            }
        }

        function submitQuestionnaire() {
            // mark questionnaire as finished
            console.log("submit request");
            Questionnaires.updateQuestionnaireStatus(vm.questionnaire.qp_ser_num, "Completed");
            vm.questionnaire.status = "Completed";
            NavigatorParameters.setParameters({Navigator:'personalNavigator'});
            personalNavigator.pushPage('views/personal/questionnaires/questionnairesList.html',{ animation : 'slide' });
        }

        function showAnswer(question) {
            question.showAnswer = true;
        }

        function editQuestion(sIndex, qIndex) {
            NavigatorParameters.setParameters({Navigator:'personalNavigator', questionnaire: vm.questionnaire, sectionIndex: sIndex, questionIndex: qIndex});
            personalNavigator.pushPage('views/personal/questionnaires/questionnaires.html',{ animation : 'slide' });
        }

        function getMaxOfSlider(question) {
            return question.options[0].max_value;
        }

        function getScaleMaxValue(question) {
            var keys = Object.keys(question.options);
            return question.options[keys[1]].text;
        }

    }
})();