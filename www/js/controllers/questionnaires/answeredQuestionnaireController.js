//
//  Created by David Herrera on 2016-06-15.
//  Modified Lee Dennis Summer 2016
//

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('AnsweredQuestionnaireController', AnsweredQuestionnaireController);

    AnsweredQuestionnaireController.$inject = [
        'Questionnaires', 'NavigatorParameters', 'UserPreferences'
    ];

    /* @ngInject */
    function AnsweredQuestionnaireController(Questionnaires, NavigatorParameters, UserPreferences) {
        var vm = this;

        vm.language = UserPreferences.getLanguage().toUpperCase();
        vm.chooseAction = chooseAction;
        vm.showAnswer = showAnswer;
        vm.showAnswerReview = showAnswerReview;

        activate();
        ///////////////////

        function activate(){

            var params = NavigatorParameters.getParameters();
            vm.questionnaireSerNum = params.SerNum;
            vm.questionnaireDBSerNum = params.DBSerNum;
            vm.answers = [];

            var answersObject;
            vm.questionnaire = Questionnaires.getPatientQuestionnaires().Questionnaires[vm.questionnaireDBSerNum];
            vm.patientQuestionnaire = Questionnaires.getPatientQuestionnaires().PatientQuestionnaires[vm.questionnaireSerNum];
            vm.questionsObject = vm.questionnaire.Questions;
            vm.questions = [];

            for (var key in vm.questionsObject) {
                vm.questions.push(vm.questionsObject[key]);
            }


            if(!vm.patientQuestionnaire.Answers) {
                answersObject = Questionnaires.getQuestionnaireAnswers(vm.questionnaireSerNum).Answers;
            } else {
                answersObject = vm.patientQuestionnaire.Answers;
            }

            for (key in answersObject) {
                vm.answers.push(answersObject[key].Answer);
            }

            vm.answerToShow = new Array(vm.questions.length);
            vm.answerShown = [];

            for (var $i = 0; $i < vm.questions.length; $i++) {
                vm.answerShown[$i] = false;
            }
        }

        function chooseAction(index, oneQuestion) {
            if (!!vm.answers[index]) {
                if ((oneQuestion.QuestionType === 'SA') || (oneQuestion.QuestionType === 'Checkbox') || (oneQuestion.QuestionType === 'image')) {
                    showAnswer(index);
                }
            }
        }

        // Decides what answer to show. This is purely only for the 'eye' icon where the answer can be previewed.
        function showAnswer(index) {
            vm.answerShown[index] = !vm.answerShown[index];
            vm.animateShowAnswer = (vm.answerShown[index])?'animated fadeInDown':'animated fadeOutUp';
            if(vm.questions[index].QuestionType === 'Checkbox') {
                if (!vm.patientQuestionnaire.Answers) {
                    vm.checkboxString = '';
                    for (var val in vm.answers[index]) {
                        if (!!vm.answers[index][val]) {
                            if (vm.checkboxString === '') {
                                vm.checkboxString = vm.checkboxString + vm.answers[index][val];
                            } else {
                                vm.checkboxString = vm.checkboxString + ', ' + vm.answers[index][val];
                            }
                        }
                    }
                    vm.answerToShow[index] = vm.checkboxString;
                } else {
                    vm.answerToShow[index] = vm.answers[index];
                }
            } else if ((vm.questions[index].QuestionType === 'image') && (!!vm.answers[index] )) {
                vm.checkboxString = '';
                for (var x in vm.answers[index]) {
                    if ( vm.checkboxString === '') {
                        vm.checkboxString = vm.checkboxString + x + ': ' + vm.answers[index][x] + '/10';
                    } else {
                        vm.checkboxString = vm.checkboxString + ', ' + x + ': ' + vm.answers[index][x] + '/10';
                    }
                }
                vm.answerToShow[index] = vm.checkboxString;
            } else {
                vm.answerToShow[index] = vm.answers[index];
            }
        }

        function showAnswerReview(index) {
            showAnswer(index);
            return vm.answerToShow[index];
        }
    }
})();
