(function () {
    'use strict';

    /**
     * @name AnsweredQuestionnaireController
     * @desc This is the controller for src/views/personal/questionnaires/answeredQuestionnaire.html
     *      It is responsible of displaying the questionnaire summary page, regardless of the questionnaire being completed or not
     */

    angular
        .module('MUHCApp')
        .controller('AnsweredQuestionnaireController', AnsweredQuestionnaireController);

    AnsweredQuestionnaireController.$inject = [
        '$filter',
        '$timeout',
        'Firebase',
        'NativeNotification',
        'NavigatorParameters',
        'Params',
        'ProfileSelector',
        'Questionnaires',
        'Studies'
    ];

    /* @ngInject */
    function AnsweredQuestionnaireController($filter, $timeout, Firebase, NativeNotification, NavigatorParameters, Params, ProfileSelector, Questionnaires, Studies) {
        // Note: this file has many exceptions / hard coding to obey the desired inconsistent functionality

        var vm = this;

        // local constants
        const NON_EXISTING_ANSWER = Params.QUESTIONNAIRE_DISPLAY_STRING.NON_EXISTING_ANSWER;

        // variables for controller
        let purpose = 'default';
        let navigator = null;
        let navigatorName = '';

        // constants for the view and controller
        vm.allowedStatus = Params.QUESTIONNAIRE_DB_STATUS_CONVENTIONS;
        vm.allowedType = Params.QUESTIONNAIRE_DB_TYPE_CONVENTIONS;
        vm.answerSavedInDBValidStatus = Params.ANSWER_SAVED_IN_DB_STATUS;

        // variables that can be seen from view, sorted alphabetically
        vm.consentStatus = null;
        vm.hasDescription = false;
        vm.isConsent = false;
        vm.loadingQuestionnaire = true;     // the loading circle for one questionnaire
        vm.loadingSubmitQuestionnaire = false;  // the loading circle for saving questionnaire
        vm.password = '';   // the password that the user may enter for consent form
        vm.questionnaire = {};  // the questionnaire itself
        vm.requirePassword = false;     // determine whether the password is required for submission or not
        vm.submitAllowed = false;   // if all questions are completed, then the user is allowed to submit.
        vm.submitButtonText = '';
        vm.submitInstructions = '';

        // functions that can be seen from view, sorted alphabetically
        vm.editQuestion = editQuestion;
        vm.questionOnClick = questionOnClick;
        vm.submitQuestionnaire = submitQuestionnaire;
        vm.updateRequirePassword = updateRequirePassword
        vm.isInvalidAnswerForQuestion = isInvalidAnswerForQuestion;
        vm.isValidAnswerForQuestionAndNotSlider = isValidAnswerForQuestionAndNotSlider;
        vm.isValidAnswerForQuestionAndSlider = isValidAnswerForQuestionAndSlider;

        activate();

        ////////////////

        function activate() {
            navigator = NavigatorParameters.getNavigator();
            navigatorName = NavigatorParameters.getNavigatorName();

            let params = NavigatorParameters.getParameters();

            if (!params.hasOwnProperty('answerQuestionnaireId')){
                vm.loadingQuestionnaire = false;

                handleLoadQuestionnaireErr();
            }

            Questionnaires.requestQuestionnaire(params.answerQuestionnaireId)
                .then(function(){
                    $timeout(function(){
                        vm.questionnaire = Questionnaires.getCurrentQuestionnaire();

                        // verify if we are waiting to save an answer
                        if (Questionnaires.isWaitingForSavingAnswer()){
                            setTimeout(init, vm.answerSavedInDBValidStatus.ANSWER_SAVING_WAITING_TIME);
                        }else{
                            // process the answers and check if submit is allowed.
                            init();
                        }

                        vm.loadingQuestionnaire = false;
                    });
                })
                .catch(function(){
                    $timeout(function(){
                        vm.loadingQuestionnaire = false;

                        handleLoadQuestionnaireErr();
                    });
                });
        }

        /**
         * @name editQuestion
         * @desc this public function is used for sending the question to be edited back to the carousel page.
         * @param {int} sIndex the index of the section which the question belongs to
         * @param {int} qIndex the index of the question to be edited
         */
        function editQuestion(sIndex, qIndex) {

            NavigatorParameters.setParameters({
                Navigator: navigatorName,
                sectionIndex: sIndex,
                questionIndex: qIndex,
                editQuestion: true,
                answerQuestionnaireId: vm.questionnaire.qp_ser_num,
                questionnairePurpose: purpose
            });
            navigator.replacePage('views/personal/questionnaires/questionnaires.html', {animation: 'slide'});
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
                        Studies.updateConsentStatus(vm.questionnaire.questionnaire_id, 'declined', patient_uuid);
                    }
                    else if (vm.isConsent && vm.requirePassword) {
                        Studies.updateConsentStatus(vm.questionnaire.questionnaire_id, 'opalConsented', patient_uuid);
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

                    NavigatorParameters.setParameters({Navigator: navigatorName, questionnairePurpose: purpose});
                    navigator.replacePage('views/personal/questionnaires/questionnaireCompletedConfirmation.html', {animation: 'slide'});
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
                                if (!vm.questionnaire.sections[i].questions[j].patient_answer.answer[k].hasOwnProperty('answer_value')){

                                    vm.questionnaire.sections[i].questions[j].patient_answer.answer[k].answer_value = NON_EXISTING_ANSWER;
                                    vm.submitAllowed = false;
                                    handleLoadQuestionnaireErr();
                                }

                                // this check is separated because slider and textbox do not need this property and will not have it if the user has just filled the question out
                                if (!vm.questionnaire.sections[i].questions[j].patient_answer.answer[k].hasOwnProperty('answer_option_text')){
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
         *          green if the questionnaire is not completed and the question do have a valid answer
         *          white if the questionnaire is completed or otherwise
         * @param {int} status the status of the questionnaire
         * @param {object} question the question itself
         */
        function setQuestionStyle(status, question){
            if (status !== vm.allowedStatus.COMPLETED_QUESTIONNAIRE_STATUS){
                if (question.optional === '0' && question.patient_answer.is_defined !== vm.answerSavedInDBValidStatus.ANSWER_SAVED_CONFIRMED){
                    question.style = {
                        'background-color': '#d9534f',
                    }
                } else {
                    question.style = {
                        'background-color': '#5cd65c',
                    }
                }
            } else {
                question.style = {
                    'background-color': 'white',
                }
            }
        }

        /**
         * @name handleLoadQuestionnaireErr
         * @desc shows a notification to the user in case a request to server fails to load the questionnaire
         *      and move the user back to the previous page
         */
        function handleLoadQuestionnaireErr() {
            // go to the questionnaire list page if there is an error
            NavigatorParameters.setParameters({Navigator: navigatorName});
            navigator.popPage();

            NativeNotification.showNotificationAlert($filter('translate')("SERVERERRORALERT"));
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
                NavigatorParameters.setParameters({ Navigator: navigatorName });
                navigator.popPage();

                NativeNotification.showNotificationAlert($filter('translate')("TOO_MANY_REQUESTS_CONSENT"));
            } else {
                vm.loadingSubmitQuestionnaire = false;

                // go to the questionnaire list page if there is an error
                NavigatorParameters.setParameters({ Navigator: navigatorName });
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

        /**
         * @name isInvalidAnswerForQuestion
         * @desc Non completed questionnaire and invalid answer for the question
         * @returns {boolean}
         */
         function isInvalidAnswerForQuestion(question) {
            return vm.questionnaire.status !== vm.allowedStatus.COMPLETED_QUESTIONNAIRE_STATUS
                && question.optional === '0'
                && question.patient_answer.is_defined !== vm.answerSavedInDBValidStatus.ANSWER_SAVED_CONFIRMED
        }

        /**
         * @name isValidAnswerForQuestionAndNotSlider
         * @desc Non completed questionnaire, valid answer for the question, and not slider
         * @returns {boolean}
         */
         function isValidAnswerForQuestionAndNotSlider(question) {
            return vm.questionnaire.status !== vm.allowedStatus.COMPLETED_QUESTIONNAIRE_STATUS
                && question.type_id !== vm.allowedType.SLIDER_TYPE_ID
                && (question.optional !== '0' || question.patient_answer.is_defined === vm.answerSavedInDBValidStatus.ANSWER_SAVED_CONFIRMED);
        }

        /**
         * @name isValidAnswerForQuestionAndSlider
         * @desc Non completed questionnaire, valid answer for the question, and slider
         * @returns {boolean}
         */
        function isValidAnswerForQuestionAndSlider(question) {
            return vm.questionnaire.status !== vm.allowedStatus.COMPLETED_QUESTIONNAIRE_STATUS
                && question.type_id === vm.allowedType.SLIDER_TYPE_ID
                && (question.optional !== '0' || question.patient_answer.is_defined === vm.answerSavedInDBValidStatus.ANSWER_SAVED_CONFIRMED);
        }

    }

})();

