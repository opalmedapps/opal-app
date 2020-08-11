(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('AnsweredQuestionnaireController', AnsweredQuestionnaireController);

    AnsweredQuestionnaireController.$inject = [
        'Questionnaires',
        'Params',
        'NavigatorParameters',
        '$filter',
        '$timeout',
        'FirebaseService'
    ];

    /* @ngInject */
    function AnsweredQuestionnaireController(Questionnaires, Params, NavigatorParameters, $filter, $timeout, FirebaseService) {
        // Note: this file has many exceptions / hard coding to obey the desired inconsistent functionality

        var vm = this;

        // local constants
        const NON_EXISTING_ANSWER = Params.QUESTIONNAIRE_DISPLAY_STRING.NON_EXISTING_ANSWER;

        // variables for controller
        let category = 'default';
        let navigator = null;
        let navigatorName = '';

        // constants for the view and controller
        vm.allowedStatus = Params.QUESTIONNAIRE_DB_STATUS_CONVENTIONS;
        vm.allowedType = Params.QUESTIONNAIRE_DB_TYPE_CONVENTIONS;
        vm.answerSavedInDBValidStatus = Params.ANSWER_SAVED_IN_DB_STATUS;

        // variables that can be seen from view, sorted alphabetically
        vm.backToListMessage = '';  // the message varies according to the questionnaire category
        vm.loadingQuestionnaire = true;     // the loading circle for one questionnaire
        vm.loadingSubmitQuestionnaire = false;  // the loading circle for saving questionnaire
        vm.pageTitle = '';  // the page title varies according to the questionnaire category
        vm.password = '';   // the password that the user may enter for consent form
        vm.questionnaire = {};  // the questionnaire itself
        vm.requirePassword = false;     // determine whether the password is required for submission or not
        vm.submitAllowed = false;   // if all questions are completed, then the user is allowed to submit.
        vm.thankMessage = '';    // the message varies according to the questionnaire category

        // functions that can be seen from view, sorted alphabetically
        vm.editQuestion = editQuestion;
        vm.questionOnClick = questionOnClick;
        vm.submitQuestionnaire = submitQuestionnaire;

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

                        setPageText(category);

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
         * @name setPageText
         * @desc set the page title and descriptions according to the questionnaire category requested
         *      if the category is not passed as an argument, the text will default to the default's translation
         * @param {string} category
         */
        function setPageText(category = 'default') {
            vm.pageTitle = $filter('translate')(Questionnaires.getQuestionnaireTitleByCategory(category));

            vm.backToListMessage = $filter('translate')(Questionnaires.getQuestionnaireBackToListByCategory(category));

            vm.thankMessage = $filter('translate')(Questionnaires.getQuestionnaireThankByCategory(category));
        }

        /**
         * @name editQuestion
         * @desc this public function is used for sending the question to be edited back to the carousel page.
         * @param sIndex {int} the index of the section which the question belongs to
         * @param qIndex {int} the index of the question to be edited
         */
        function editQuestion(sIndex, qIndex) {

            NavigatorParameters.setParameters({
                Navigator: navigatorName,
                sectionIndex: sIndex,
                questionIndex: qIndex,
                editQuestion: true,
                answerQuestionnaireId: vm.questionnaire.qp_ser_num
            });
            navigator.replacePage('views/personal/questionnaires/questionnaires.html', {animation: 'slide'});
        }

        /**
         * @name submitQuestionnaire
         * @desc this public function is used to submit the questionnaire by updating the status
         */
        function submitQuestionnaire(){
            vm.loadingSubmitQuestionnaire = true;

            verifyPassword(vm.requirePassword, vm.password)
                .then(function(){
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

                    NavigatorParameters.setParameters({Navigator: navigatorName, questionnaireCategory: category});
                    navigator.replacePage('views/personal/questionnaires/questionnaireCompletedConfirmation.html', {animation: 'slide'});

                })
                .catch(handleSubmitErr)
        }

        /**
         * @name questionOnClick
         * @desc this public function help the view to decide the appropriate behavior when the user clicks on a question
         * @param sIndex {int} the index of the section which the question belongs to
         * @param qIndex {int} the index of the question to be edited
         * @param question {object} the question object itself
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
         *      5) decide whether or not to prompt for the password depending on the questionnaire category
         */
        function init(){
            vm.submitAllowed = true;

            if (!vm.questionnaire.hasOwnProperty('questionnaire_category')) {
                vm.submitAllowed = false;
                handleLoadQuestionnaireErr();
            }

            category = vm.questionnaire.questionnaire_category;

            // this if for consent forms
            setRequirePassword(category);

            for (let i = 0; i < vm.questionnaire.sections.length; i++) {

                if (!vm.questionnaire.sections[i].hasOwnProperty('questions')){
                    vm.submitAllowed = false;
                    handleLoadQuestionnaireErr();
                }

                for (let j = 0; j < vm.questionnaire.sections[i].questions.length; j++) {

                    if (!vm.questionnaire.sections[i].questions[j].hasOwnProperty('patient_answer') ||
                        !vm.questionnaire.sections[i].questions[j].patient_answer.hasOwnProperty('is_defined') ||
                        !vm.questionnaire.sections[i].questions[j].hasOwnProperty('type_id') ||
                        !vm.questionnaire.sections[i].questions[j].hasOwnProperty('optional')){

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
         * @param question {object}
         */
        function resetShowAnswer(question){
            question.showAnswer = false;
        }

        /**
         * @name setQuestionStyle
         * @desc Set the question's style to display on the front end
         *      The question is of color:
         *          red if the questionnaire is not completed and the question does not have a valid answer
         *          green if the questionnaire is not completed and the question do have a valid answer
         *          white if the questionnaire is completed or otherwise
         * @param status {int} the status of the questionnaire
         * @param question {object} the question itself
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
        function handleLoadQuestionnaireErr (){
            // go to the questionnaire list page if there is an error
            NavigatorParameters.setParameters({Navigator: navigatorName});
            navigator.popPage();

            ons.notification.alert({
                message: $filter('translate')("SERVERERRORALERT"),
                modifier: (ons.platform.isAndroid())?'material':null
            })
        }

        /**
         * @name toggleShowHideAnswer
         * @desc this private function is used to switch the show / hide flag of a question
         * @param question
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
        function verifyPassword(requirePassword, password) {
            if (requirePassword) {
                const user = FirebaseService.getAuthenticationCredentials();
                const credential = firebase.auth.EmailAuthProvider.credential(user.email, vm.password);

                return user.reauthenticateWithCredential(credential);
            }

            return Promise.resolve();
        }

        /**
         * @name handleSubmitErr
         * @desc shows a notification to the user in case the submission fails
         * @param {Error} error
         */
        function handleSubmitErr(error) {
            if (error.code === Params.invalidPassword) {

                $timeout(function() {
                    vm.loadingSubmitQuestionnaire = false;

                    ons.notification.alert({
                        message: $filter('translate')(Params.invalidPasswordMessage),
                        modifier: (ons.platform.isAndroid()) ? 'material' : null
                    });
                });
            } else {
                vm.loadingSubmitQuestionnaire = false;

                // go to the questionnaire list page if there is an error
                NavigatorParameters.setParameters({Navigator: navigatorName});
                navigator.popPage();

                ons.notification.alert({
                    message: $filter('translate')("SERVER_ERROR_SUBMIT_QUESTIONNAIRE"),
                    modifier: (ons.platform.isAndroid()) ? 'material' : null
                })
            }
        }

        /**
         * @name setRequirePassword
         * @desc set the flag vm.requirePassword depending on category of the questionnaire
         * @param {string} category
         */
        function setRequirePassword(category) {
            vm.requirePassword = category.toLowerCase() === 'consent';
        }
    }

})();

