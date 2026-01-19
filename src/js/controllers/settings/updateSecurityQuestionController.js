// SPDX-FileCopyrightText: Copyright (C) 2020 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

import {SecurityQuestion} from "../../models/settings/SecurityQuestion";
import {SecurityAnswer} from "../../models/settings/SecurityAnswer";
import '../../../css/views/update-security-question.view.css';

(function(){
    'use strict';

    angular
        .module('OpalApp')
        .controller('UpdateSecurityQuestionController', UpdateSecurityQuestionController);

    UpdateSecurityQuestionController.$inject = [
        'Navigator',
        '$timeout',
        '$filter',
        'Params',
        'Firebase',
        'LogOutService',
        'RequestToServer',
        'EncryptionService'
    ];

    /* @ngInject */
    function UpdateSecurityQuestionController(Navigator, $timeout, $filter, Params,
                                              Firebase, LogOutService, RequestToServer, EncryptionService) {
        let vm = this;

        let navigator = null;

        // constants for controller
        const MIN_ANSWER_LENGTH = 3;    // the minimum length required for a security answer

        // variables seen from view
        vm.activeSecurityQuestionList = [];   // the list of security question without answers
        vm.loadingList = true;  // This is for loading the list of security questions / answers
        vm.min_answer_len = MIN_ANSWER_LENGTH;  // the minimum length required for a security answer
        vm.password = "";    // what the user inputs as the current password
        vm.passwordChanged = false;     // flag denoting whether the password has been changed
        vm.securityQuestionWithAnsList = [];    // the list of security question with answers
        vm.submitDisabled = true;       // flag denoting whether the submit button is disabled or not

        // functions that can be used from view
        vm.changeSecurityQuestion = changeSecurityQuestion;
        vm.evaluateSubmission = evaluateSubmission;
        vm.questionAlreadyUsed = questionAlreadyUsed;
        vm.securityQuestionAnswerChanged = securityQuestionAnswerChanged;
        vm.submit = submit;

        activate();

        ////////////////////////

        /**
         * activate
         * @desc fetch the list of active security questions and the list of security questions with answers from the backend,
         *      and initialize the latter for front-end use
         */
        function activate() {
            navigator = Navigator.getNavigator();

            RequestToServer.sendRequestWithResponse('SecurityQuestionAnswerList')
                .then(function(response){
                    $timeout(function(){
                        let securityQuestionList = response.data.securityQuestionList || [];
                        let activeSecurityQuestions = response.data.activeSecurityQuestions || [];

                        vm.activeSecurityQuestionList =
                            activeSecurityQuestions.map((securityQuestion) => new SecurityQuestion(securityQuestion));
                        vm.securityQuestionWithAnsList =
                            securityQuestionList.map((securityQuestionAnswer) => new SecurityAnswer(securityQuestionAnswer, $filter));

                        // Adds the currently used questions to the active question list; this allows the UI dropdowns to also display the currently used questions
                        // TODO enforce that users must change inactive questions to active ones
                        vm.activeSecurityQuestionList = buildSecurityQuestionOptionsList();

                        $timeout(function() {
                            vm.securityQuestionWithAnsList.map(entry => entry.question.questionText).forEach((chosenQuestion, questionIndex) => {
                                const optionIndex = vm.activeSecurityQuestionList.findIndex(entry => {
                                    return entry.questionText === chosenQuestion;
                                });
                                // Highlight and pre-select the questions already in use
                                $(`#question-${questionIndex}-option-${optionIndex}`).css({
                                    "background-color": "#D9F1F4",
                                }).prop('selected', true);
                            });
                            vm.loadingList = false;
                        });
                    })
                })
                .catch(function(err){
                    $timeout(function(){
                        console.error(err);
                        handleLoadSecurityQuestionListRequestErr();
                        vm.loadingList = false;
                    });
                })
        }

        /**
         * @description Builds a new list that contains all newly available security questions and all in-use security questions to populate the dropdowns.
         */
        function buildSecurityQuestionOptionsList() {
            let options = [];
            const allQuestions = [
                ...vm.activeSecurityQuestionList,
                ...vm.securityQuestionWithAnsList.map(entry => entry.question),
            ];

            // Only add non-duplicate questions to the final list
            allQuestions.forEach(question => {
                if (!options.find(option => option.questionText === question.questionText)) {
                    options.push(question);
                }
            })
            return options;
        }

        /**
         * evaluateSubmission
         * @desc toggles the vm.submitDisabled flag
         */
        function evaluateSubmission() {

            let allQuestionAnswered = true;
            let haveAQuestionAnswerModified = false;

            for (var i = 0; i < vm.securityQuestionWithAnsList.length; i++){
                let answerQuestionObj = vm.securityQuestionWithAnsList[i];

                // Is there any question or answer modified?
                if (answerQuestionObj.answerHasChanged || answerQuestionObj.questionHasChanged) {
                    haveAQuestionAnswerModified = true;
                }

                // Is there any expired question or question without answer?
                // (by default any item in the list securityQuestionWithAnsList has an answer already)
                // the only case that a question does not have an answer is when the question has been changed
                if ((!answerQuestionObj.answerHasChanged && answerQuestionObj.questionHasChanged) ||
                    (answerQuestionObj.answerHasChanged && answerQuestionObj.answer.length < MIN_ANSWER_LENGTH)) {
                    allQuestionAnswered = false;
                    break;
                }
            }

            vm.submitDisabled = !(vm.passwordChanged && vm.password.length > 0 &&
                allQuestionAnswered && haveAQuestionAnswerModified);
        }

        /**
         * @desc Processes the change from one security question to another, by updating the controller state.
         * @param {number} questionIndex The index of the question being changed, in securityQuestionWithAnsList.
         * @param {number} newQuestionChoiceIndex The index of the new chosen question, in activeSecurityQuestionList.
         */
        function changeSecurityQuestion(questionIndex, newQuestionChoiceIndex) {
            // Don't execute this function before the page is initialized
            if (!vm.activeSecurityQuestionList || vm.activeSecurityQuestionList.length === 0) return;

            vm.submitDisabled = true;

            const questionAnswerObj = vm.securityQuestionWithAnsList[questionIndex];
            const newQuestion = vm.activeSecurityQuestionList[newQuestionChoiceIndex];

            // Determine whether the question is new, or the user has just reset the dropdown to the original question
            questionAnswerObj.question = newQuestion;
            if (questionAnswerObj.oldQuestion.questionText === newQuestion.questionText) {
                questionAnswerObj.questionHasChanged = false;
                questionAnswerObj.oldAnswerPlaceholder = $filter('translate')('SECURITY_ANSWER_UPDATE_PLACEHOLDER');
            }
            else {
                questionAnswerObj.questionHasChanged = true;
                questionAnswerObj.oldAnswerPlaceholder = '';
            }

            // Re-initialize the answer once the question has been changed
            questionAnswerObj.answer = '';
            questionAnswerObj.answerHasChanged = false;
        }

        function questionAlreadyUsed(answerIndex) {
            // Don't execute this function before the page is initialized
            if (!vm.securityQuestionWithAnsList || vm.securityQuestionWithAnsList.length === 0) return;

            const currentQuestion = vm.securityQuestionWithAnsList[answerIndex].question;

            // Check all selected questions before this one
            for (let i = 0; i < answerIndex; i++) {
                const previousQuestion = vm.securityQuestionWithAnsList[i].question;
                if (currentQuestion.questionText === previousQuestion.questionText) {
                    vm.submitDisabled = true;
                    return true;
                }
            }
            return false;
        }

        /**
         * handleLoadSecurityQuestionListRequestErr
         * @desc show a notification to the user in case a request to server fails
         */
        function handleLoadSecurityQuestionListRequestErr (){
            navigator.popPage();

            ons.notification.alert({
                //message: 'Server problem: could not fetch data, try again later',
                message: $filter('translate')("SERVER_ERROR_ALERT"),
                modifier: (ons.platform.isAndroid())?'material':null
            })
        }

        /**
         * securityQuestionAnswerChanged
         * @desc function called when a security question's answer got changed, should not be called when the question is inactive
         * @param {object} questionAnswerObj
         */
        function securityQuestionAnswerChanged(questionAnswerObj) {
            questionAnswerObj.answerHasChanged = questionAnswerObj.answer.length > 0;

            evaluateSubmission();
        }

        /**
         * @description Re-authenticates the user with their old password, then sets their new security questions
         *              and answers on the server.
         * @returns {Promise<void>}
         */
        async function submit() {
            try {
                loadingSubmit.show();

                // Verify the user's password
                await Firebase.reauthenticateCurrentUser(vm.password);

                // If the password is correct (no error is thrown), send the request to the backend
                let params = {
                    'questionAnswerArr': formatSecurityQuestionWithAnsListForSubmission(vm.securityQuestionWithAnsList),
                };
                await RequestToServer.sendRequestWithResponse('UpdateSecurityQuestionAnswer', params);

                // Inform the user that the request was successful and force logout
                $timeout(function() {
                    loadingSubmit.hide();
                    successfulUpdateConfirmationAndLogout();
                });
            }
            catch (error) {
                $timeout(function() {
                    loadingSubmit.hide();
                    handleSubmitErr(error);
                });
            }
        }

        /**
         * handleSubmitErr
         * @desc shows a notification to the user in case the submission fails
         * @param {Error} error
         */
        function handleSubmitErr(error) {
            console.error(error);
            if (error.code === Params.invalidPassword) {

                ons.notification.alert({
                    message: $filter('translate')("INVALID_PASSWORD"),
                    modifier: (ons.platform.isAndroid())?'material':null
                });
            } else {

                ons.notification.alert({
                    message: $filter('translate')("SERVER_ERROR_MODIFY_SECURITY"),
                    modifier: (ons.platform.isAndroid())?'material':null
                });
            }
        }

        /**
         * successfulUpdateConfirmationAndLogout
         * @desc display a modal to confirm the successful update of security question and/or answer,
         *      logs the user out, and take the user to the init page
         */
        function successfulUpdateConfirmationAndLogout() {
            ons.notification.alert({
                message: $filter('translate')("SECURITY_QUESTION_ANSWER_UPDATE_SUCCESS"),
                modifier: (ons.platform.isAndroid())?'material':null,
                callback: function(idx) {
                    switch (idx) {
                        case 0:
                            $timeout(function() {
                                LogOutService.logOut(false);
                            });

                            break;
                    }
                }
            });
        }

        /**
         * formatSecurityQuestionWithAnsListForSubmission
         * @desc this function filters unchanged security question/answer pairs and changes the list into the a format desirable for the listener
         * @param {array} securityQuestionWithAnsList
         * @returns {[]} An array of objects with parameters: securityAnswerSerNum, answer, and questionSerNum
         */
        function formatSecurityQuestionWithAnsListForSubmission(securityQuestionWithAnsList) {
            let arrToBeSent = [];

            securityQuestionWithAnsList.forEach(function(answerQuestionObj) {

                // if neither question nor answer has changed, do not send to backend
                if (!answerQuestionObj.answerHasChanged && !answerQuestionObj.questionHasChanged) {
                    // this is the same as continue in normal for loops
                    return;
                }

                // answer is hashed in the objects of this array
                arrToBeSent.push({
                    question: answerQuestionObj.question.questionText,
                    questionId: answerQuestionObj.securityAnswerSerNum,
                    answer: EncryptionService.hash(answerQuestionObj.answer.toUpperCase()),
                });

            });

            return arrToBeSent;
        }
    }
})();
