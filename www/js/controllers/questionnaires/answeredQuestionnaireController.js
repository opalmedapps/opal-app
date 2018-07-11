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
        vm.temporaryAnswer={};
        vm.setTempAnswer = setTempAnswer;

        // vm.toggleAnswer = toggleAnswer;

        activate();
        ///////////////////

        function activate() {
            var params = NavigatorParameters.getParameters();
            vm.questionnaire = params.questionnaire;
            console.log("activate() answeredQuestionnaire");
            console.log(vm.questionnaire);
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

        function setTempAnswer(question) {
            console.log("setTempAnswer ");
            console.log(Object(question));
            var elem = {};
                if(question.question_type_category_key == 'checkbox') {
                for (var i = 0; i < question.patient_answer.length; i++) {
                    var temp = question.options.filter(elem => elem.answer_option_ser_num == question.patient_answer[0].CheckboxAnswerOptionSerNum);
                    vm.temporaryAnswer = Object.assign({},vm.temporaryAnswer,temp);
                    console.log("temporaryAnswer");
                    console.log(Object(vm.temporaryAnswer));
                }
            } else { // multiple choice
                for (var i = 0; i < question.options.length; i++) {
                    if(question.options[i].answer_option_ser_num == question.patient_answer[0].MCAnswerOptionSerNum){
                        question.temporaryAnswer = question.options[i];
                        console.log("---------------------------------------------");
                        console.log("temporaryAnswer " + i);
                        console.log(Object(vm.temporaryAnswer));
                    }
                }
            }

        }

    }
})();