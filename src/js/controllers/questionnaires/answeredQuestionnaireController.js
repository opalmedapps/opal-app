// SPDX-FileCopyrightText: Copyright (C) 2016 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

import '../../../css/views/answered-questionnaire.view.css';

(function () {
    'use strict';

    /**
     * @name AnsweredQuestionnaireController
     * @desc This is the controller for src/views/personal/questionnaires/answeredQuestionnaire.html
     *      It is responsible of displaying the questionnaire summary page, regardless of the questionnaire being completed or not
     */

    angular
        .module('OpalApp')
        .controller('AnsweredQuestionnaireController', AnsweredQuestionnaireController);

    AnsweredQuestionnaireController.$inject = [
        '$filter',
        '$scope',
        '$timeout',
        'Firebase',
        'NativeNotification',
        'Navigator',
        'Params',
        'ProfileSelector',
        'Questionnaires',
        'Studies',
        'User',
    ];

    /* @ngInject */
    function AnsweredQuestionnaireController($filter, $scope, $timeout, Firebase, NativeNotification, Navigator, Params,
                                             ProfileSelector, Questionnaires, Studies, User) {
        // Note: this file has many exceptions / hard coding to obey the desired inconsistent functionality

        var vm = this;

        // local constants
        const NON_EXISTING_ANSWER = Params.QUESTIONNAIRE_DISPLAY_STRING.NON_EXISTING_ANSWER;

        // variables for controller
        let purpose = 'default';
        let navigator = null;

        // constants for the view and controller
        vm.allowedStatus = Params.QUESTIONNAIRE_DB_STATUS_CONVENTIONS;
        vm.allowedType = Params.QUESTIONNAIRE_DB_TYPE_CONVENTIONS;
        vm.answerSavedInDBValidStatus = Params.ANSWER_SAVED_IN_DB_STATUS;

        // variables that can be seen from view, sorted alphabetically
        vm.consentStatus = null;
        vm.hasDescription = false;
        vm.isAnsweringAsSelf = false;  // Used to alter the display of the submission instructions
        vm.isConsent = false;
        vm.loadingQuestionnaire = true;     // the loading circle for one questionnaire
        vm.loadingSubmitQuestionnaire = false;  // the loading circle for saving questionnaire
        vm.password = '';   // the password that the user may enter for consent form
        vm.questionnaire = {};  // the questionnaire itself
        vm.requirePassword = false;     // determine whether the password is required for submission or not
        vm.submitAllowed = false;   // if all questions are completed, then the user is allowed to submit.
        vm.submitButtonText = '';
        vm.submitInstructions = '';
        vm.submittedByNames = {};  // Names used to show who's submitting the answers, and for which patient

        // functions that can be seen from view, sorted alphabetically
        vm.editQuestion = editQuestion;
        vm.questionOnClick = questionOnClick;
        vm.submitQuestionnaire = submitQuestionnaire;
        vm.updateRequirePassword = updateRequirePassword
        vm.isCompleted = () => vm.questionnaire.status === vm.allowedStatus.COMPLETED_QUESTIONNAIRE_STATUS;
        vm.isSlider = question => question.type_id === vm.allowedType.SLIDER_TYPE_ID;
        vm.isDefinedAnswer = question => question.patient_answer.is_defined === vm.answerSavedInDBValidStatus.ANSWER_SAVED_CONFIRMED;

        activate();

        ////////////////

        async function activate() {
            navigator = Navigator.getNavigator();
            let params = Navigator.getParameters();

            bindEvents();

            // TODO remove if unused
            const onceOnly = !!params?.onceOnly;

            // Get the user and patient names to display on the submission page
            vm.isAnsweringAsSelf = ProfileSelector.currentProfileIsSelf();
            let user = User.getUserInfo();
            let patient = ProfileSelector.getActiveProfile();
            vm.submittedByNames = {
                userName: `${user.first_name} ${user.last_name}`,
                patientName: `${patient.first_name} ${patient.last_name}`,
            };

            if (!params.hasOwnProperty('answerQuestionnaireId')){
                vm.loadingQuestionnaire = false;
                console.error('Navigator parameter "answerQuestionnaireId" is missing');
                handleLoadQuestionnaireErr();
                return;
            }

            try {
                await Questionnaires.requestQuestionnaire(params.answerQuestionnaireId);

                vm.questionnaire = Questionnaires.getCurrentQuestionnaire();

                // If the questionnaire still has "new" status (possible for once-only questionnaires), update it to "in progress"
                if (vm.questionnaire.status === vm.allowedStatus.NEW_QUESTIONNAIRE_STATUS) {
                    await Questionnaires.updateQuestionnaireStatus(
                        vm.questionnaire.qp_ser_num,
                        vm.allowedStatus.IN_PROGRESS_QUESTIONNAIRE_STATUS,
                        vm.questionnaire.status
                    );
                }

                // Verify if we are waiting to save an answer
                if (Questionnaires.isWaitingForSavingAnswer()) {
                    setTimeout(init, vm.answerSavedInDBValidStatus.ANSWER_SAVING_WAITING_TIME);
                }
                else {
                    // Process the answers and check if submitting is allowed
                    init();
                }
            }
            catch (error) {
                console.error(error);
                handleLoadQuestionnaireErr();
            }
            finally {
                vm.loadingQuestionnaire = false;
            }
        }

        function bindEvents() {
            $scope.$on('$destroy', () => {
                // Reload user profile if questionnaire was opened via Notifications tab,
                // and profile was implicitly changed.
                Navigator.reloadPreviousProfilePrepopHandler('notifications.html');
            });
        }

        /**
         * @name editQuestion
         * @desc this public function is used for sending the question to be edited back to the carousel page.
         * @param {int} sIndex the index of the section which the question belongs to
         * @param {int} qIndex the index of the question to be edited
         */
        function editQuestion(sIndex, qIndex) {
            navigator.replacePage('views/personal/questionnaires/questionnaires.html', {
                animation: 'slide', // OnsenUI
                sectionIndex: sIndex,
                questionIndex: qIndex,
                editQuestion: true,
                answerQuestionnaireId: vm.questionnaire.qp_ser_num,
                questionnairePurpose: purpose
            });
        }

        /**
         * @name submitQuestionnaire
         * @desc this public function is used to submit the questionnaire by updating the status
         */
        function submitQuestionnaire(){
            vm.loadingSubmitQuestionnaire = true;

            // mark questionnaire as finished
            verifyPassword(vm.requirePassword, vm.password)
                .then(function () {
                    // reauthenticateWithCredential will return undefined if it succeeds, otherwise will
                    // throw exception, so we do not need return value from it.
                    // see https://firebase.google.com/docs/auth/web/manage-users#re_authenticate_a_user

                    // Grab the patient uuid from the ProfileSelector
                    const patient_uuid = ProfileSelector.getActiveProfile().patient_uuid;

                    // Update consent status to opalConsented or declined
                    if (vm.isConsent && !vm.requirePassword) {
                        Studies.updateConsentStatus(vm.questionnaire.questionnaire_id, 'declined');
                    }
                    else if (vm.isConsent && vm.requirePassword) {
                        Studies.updateConsentStatus(vm.questionnaire.questionnaire_id, 'opalConsented');
                        // Trigger databank consent creation with additional check
                        const pattern = /(?=.*(databank|banque\s*de\s*données))(?=.*(consent|consentement))?.*/i;
                        if (vm.questionnaire.nickname && pattern.test(vm.questionnaire.nickname.toLowerCase())){
                            Studies.createDatabankConsent(patient_uuid, vm.questionnaire);
                        }
                    }

                    // mark questionnaire as finished
                    return Questionnaires.updateQuestionnaireStatus(
                        vm.questionnaire.qp_ser_num,
                        vm.allowedStatus.COMPLETED_QUESTIONNAIRE_STATUS,
                        vm.questionnaire.status
                    );
                })
                .then(function(){
                    vm.loadingSubmitQuestionnaire = false;

                    vm.questionnaire.status = vm.allowedStatus.COMPLETED_QUESTIONNAIRE_STATUS;

                    navigator.replacePage('views/personal/questionnaires/questionnaireCompletedConfirmation.html', {
                        animation: 'slide', // OnsenUI
                        questionnairePurpose: purpose
                    });
                })
                .catch(handleSubmitErr)
        }

        /**
         * @name questionOnClick
         * @desc this public function help the view to decide the appropriate behavior when the user clicks on a question
         * @param {int} sIndex the index of the section which the question belongs to
         * @param {int} qIndex the index of the question to be edited
         * @param {object} question the question object itself
         */
        function questionOnClick(sIndex, qIndex, question){
            /*
            Expected behavior when clicking on a question:
                if the questionnaire is completed:
                    if the question is a slider:
                        cannot be clicked, i.e. no reaction
                    else:
                        expand to show the answer
                else:
                    if the question has an invalid answer:
                        edit the question
                    else: (i.e. has a valid answer)
                        if the question is a slider:
                            edit the question
                        else:
                            expand the question
                            show the button for go to question
             */
            let status = vm.questionnaire.status;

            if (status !== vm.allowedStatus.COMPLETED_QUESTIONNAIRE_STATUS){
                // if invalid answer
                if (question.optional === '0' && question.patient_answer.is_defined !== vm.answerSavedInDBValidStatus.ANSWER_SAVED_CONFIRMED){
                    vm.editQuestion(sIndex, qIndex);
                } else {
                    // valid answer
                    if (question.type_id !== vm.allowedType.SLIDER_TYPE_ID){
                        toggleShowHideAnswer(question);
                    } else {
                        // slider type go directly to edit question
                        vm.editQuestion(sIndex, qIndex);
                    }
                }
            } else if (question.type_id !== vm.allowedType.SLIDER_TYPE_ID){
                // a completed question with a non-slider question type
                toggleShowHideAnswer(question);
            }
        }

        /*
        Private functions
         */

        /**
         * @name init
         * @desc this private function serves to
         *      1) checks some properties of the questionnaire object (all properties are checked in the service, here we only check what is needed)
         *      2) initialize the answers in case they do not exist due to the migration
         *      3) verify if the questionnaire is properly completed and ready to be submitted
         *      4) add / reset the show hide property of the question itself
         *      5) decide whether or not to prompt for the password depending on the questionnaire purpose
         */
        function init(){
            vm.submitAllowed = true;

            vm.hasDescription = vm.questionnaire.description !== '' && vm.questionnaire.description !== null && vm.questionnaire.description !== undefined;

            if (!vm.questionnaire.hasOwnProperty('questionnaire_purpose')) {
                vm.submitAllowed = false;
                handleLoadQuestionnaireErr();
            }

            purpose = vm.questionnaire.questionnaire_purpose.toLowerCase();
            vm.isConsent = purpose === 'consent';
            setPageText(purpose);

            // this if for consent forms
            // setRequirePassword(purpose);

            for (let i = 0; i < vm.questionnaire.sections.length; i++) {

                if (!vm.questionnaire.sections[i].hasOwnProperty('questions')){
                    vm.submitAllowed = false;
                    handleLoadQuestionnaireErr();
                }

                for (let j = 0; j < vm.questionnaire.sections[i].questions.length; j++) {

                    if (!vm.questionnaire.sections[i].questions[j].hasOwnProperty('patient_answer') ||
                        !vm.questionnaire.sections[i].questions[j].patient_answer.hasOwnProperty('is_defined') ||
                        !vm.questionnaire.sections[i].questions[j].hasOwnProperty('type_id') ||
                        !vm.questionnaire.sections[i].questions[j].hasOwnProperty('optional')
                    ) {
                        vm.submitAllowed = false;
                        handleLoadQuestionnaireErr();
                    }

                    if (!vm.questionnaire.sections[i].questions[j].patient_answer.hasOwnProperty('answer')) {
                        vm.questionnaire.sections[i].questions[j].patient_answer.answer = [];
                    }

                    if (!Array.isArray(vm.questionnaire.sections[i].questions[j].patient_answer.answer)){
                        vm.submitAllowed = false;
                        handleLoadQuestionnaireErr();
                    }

                    // if the question is complete (this is for when the migration does not migrate the answers)
                    if (vm.questionnaire.status === vm.allowedStatus.COMPLETED_QUESTIONNAIRE_STATUS && vm.questionnaire.sections[i].questions[j].patient_answer.is_defined === vm.answerSavedInDBValidStatus.ANSWER_SAVED_CONFIRMED){
                        if (vm.questionnaire.sections[i].questions[j].patient_answer.answer.length === 0){
                            vm.questionnaire.sections[i].questions[j].patient_answer.answer.push({
                                answer_value: NON_EXISTING_ANSWER,
                                answer_option_text: NON_EXISTING_ANSWER
                            })
                        }else{
                            // this loop will be only once except for checkbox
                            // this is to verify the properties in answer
                            for (let k = 0; k < vm.questionnaire.sections[i].questions[j].patient_answer.answer.length; k++){
                                if (!vm.questionnaire.sections[i].questions[j].patient_answer.answer[k].hasOwnProperty('answer_value')
                                    && vm.questionnaire.sections[i].questions[j].optional === "0"){

                                    vm.questionnaire.sections[i].questions[j].patient_answer.answer[k].answer_value = NON_EXISTING_ANSWER;
                                    vm.submitAllowed = false;
                                    handleLoadQuestionnaireErr();
                                }

                                // this check is separated because slider and textbox do not need this property and will not have it if the user has just filled the question out
                                if (!vm.questionnaire.sections[i].questions[j].patient_answer.answer[k].hasOwnProperty('answer_option_text')
                                    && vm.questionnaire.sections[i].questions[j].optional === "0"){

                                    vm.questionnaire.sections[i].questions[j].patient_answer.answer[k].answer_option_text = NON_EXISTING_ANSWER;
                                    vm.submitAllowed = false;
                                    handleLoadQuestionnaireErr();
                                }
                            }
                        }
                    }

                    // This is for in progress questionnaire, in the case where a question is not optional but there is no answer
                    if (vm.questionnaire.sections[i].questions[j].optional === '0' && vm.questionnaire.sections[i].questions[j].patient_answer.is_defined !== vm.answerSavedInDBValidStatus.ANSWER_SAVED_CONFIRMED) {
                        vm.submitAllowed = false;
                    }

                    // this is to add a property to the question itself for the show / hide feature of summary page
                    resetShowAnswer(vm.questionnaire.sections[i].questions[j]);

                    // this is to set the style on the question (for now just color)
                    setQuestionStyle(vm.questionnaire.status, vm.questionnaire.sections[i].questions[j]);
                }
            }

        }

        /**
         * @name resetShowAnswer
         * @desc this private function serves to add or reset the showAnswer property of a question which will be useful for the hide / show feature of the summary page
         *      Note that since the question is an object, it will change directly the question itself
         * @param {object} question
         */
        function resetShowAnswer(question){
            question.showAnswer = false;
        }

        /**
         * @name setPageText
         * @desc set the page text and descriptions according to the questionnaire purpose requested
         *      if the purpose is not passed as an argument, the text will default to the default's translation
         * @param {string} questionnairePurpose
         */
        function setPageText(questionnairePurpose = 'default') {
            vm.submitButtonText = $filter('translate')(Questionnaires.getQuestionnaireSubmitButtonByPurpose(questionnairePurpose));
            vm.submitInstructions = $filter('translate')(Questionnaires.getQuestionnaireSubmitInstructionByPurpose(questionnairePurpose));
        }

        /**
         * @name setQuestionStyle
         * @desc Set the question's style to display on the front end
         *      The question is of color:
         *          red if the questionnaire is not completed and the question does not have a valid answer
         *          green if the questionnaire is not completed and the question does have a valid (defined) answer
         *          white if the questionnaire is not completed and the question is unanswered but optional
         *          white if the questionnaire is completed or otherwise
         * @param {int} status the status of the questionnaire
         * @param {object} question the question itself
         */
        function setQuestionStyle(status, question) {
            const redBackground = { 'background-color': '#d9534f' }
            const whiteBackground = { 'background-color': 'white' }
            const greenBackground = { 'background-color': '#5cd65c' }
            const whiteLabel = { 'color': 'white' }
            const blueLabel = { 'color': '#2664ABCC' }

            if (status !== vm.allowedStatus.COMPLETED_QUESTIONNAIRE_STATUS){
                if (question.optional === '0' && question.patient_answer.is_defined !== vm.answerSavedInDBValidStatus.ANSWER_SAVED_CONFIRMED){
                    question.backgroundColor = redBackground;
                    question.labelColor = whiteLabel;
                }
                else if (question.optional === '1' && question.patient_answer.is_defined === '0') {
                    question.backgroundColor = whiteBackground;
                    question.labelColor = blueLabel;
                }
                else {
                    question.backgroundColor = greenBackground;
                    question.labelColor = whiteLabel;
                }
            }
            else {
                question.backgroundColor = whiteBackground;
                question.labelColor = blueLabel;
            }
        }

        /**
         * @name handleLoadQuestionnaireErr
         * @desc shows a notification to the user in case a request to server fails to load the questionnaire
         *      and move the user back to the previous page
         */
        function handleLoadQuestionnaireErr(error) {
            // go to the questionnaire list page if there is an error
            navigator.popPage();

            if (error?.Details === Params.BACKEND_ERROR_CODES.LOCKING_ERROR) {
                NativeNotification.showNotificationAlert(
                    $filter('translate')("QUESTIONNAIRE_LOCKING_ERROR"),
                    $filter('translate')("TITLE"),
                );
            }
            else if (error?.Details === Params.BACKEND_ERROR_CODES.NOT_ALLOWED_TO_ANSWER) {
                NativeNotification.showNotificationAlert(
                    $filter('translate')("QUESTIONNAIRE_NOT_ALLOWED_TO_ANSWER"),
                    $filter('translate')("TITLE"),
                );
            }
            else NativeNotification.showNotificationAlert($filter('translate')("SERVER_ERROR_ALERT"));
        }

        /**
         * @name toggleShowHideAnswer
         * @desc this private function is used to switch the show / hide flag of a question
         * @param {object} question
         */
        function toggleShowHideAnswer(question){
            question.showAnswer = !question.showAnswer
        }

        /**
         * @name verifyPassword
         * @desc verify whether the password entered is correct if it is required
         * @param {boolean} requirePassword
         * @param {string} password
         * @returns {firebase.Promise|Promise<void>}
         */
        async function verifyPassword(requirePassword, password) {
            if (requirePassword) await Firebase.reauthenticateCurrentUser(password);
        }

        /**
         * @name handleSubmitErr
         * @desc shows a notification to the user in case the submission fails
         * @param {Error} error
         */
        function handleSubmitErr(error) {
            if (error.code === Params.invalidPassword) {

                $timeout(function () {
                    vm.loadingSubmitQuestionnaire = false;

                    NativeNotification.showNotificationAlert($filter('translate')("INVALID_PASSWORD"));
                });
            } else if (error.code === Params.largeNumberOfRequests) {
                vm.loadingSubmitQuestionnaire = false;

                // go to the questionnaire list page if there is an error
                navigator.popPage();

                NativeNotification.showNotificationAlert($filter('translate')("TOO_MANY_REQUESTS_CONSENT"));
            } else {
                vm.loadingSubmitQuestionnaire = false;

                // go to the questionnaire list page if there is an error
                navigator.popPage();

                NativeNotification.showNotificationAlert($filter('translate')("SERVER_ERROR_SUBMIT_QUESTIONNAIRE"));
            }
        }

        /**
         * @name setRequirePassword
         * @desc set the flag vm.requirePassword depending on purpose of the questionnaire
         * @param {string} purpose
         */
        function setRequirePassword(purpose) {
            vm.requirePassword = purpose === 'consent';
        }

        function updateRequirePassword() {
            vm.requirePassword = purpose === 'consent' && vm.consentStatus === true;
        }
    }
})();
