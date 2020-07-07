import {SecurityQuestion} from "../../models/settings/SecurityQuestion";
import {SecurityAnswer} from "../../models/settings/SecurityAnswer";

(function(){
    'use strict';

    angular
        .module('MUHCApp')
        .controller('UpdateSecurityQuestionController', UpdateSecurityQuestionController);

    UpdateSecurityQuestionController.$inject = [
        'NavigatorParameters',
        '$timeout',
        '$filter',
        'UserPreferences',
        'Params',
        'FirebaseService',
        'LogOutService',
        'RequestToServer',
        'EncryptionService'
    ];

    /* @ngInject */
    function UpdateSecurityQuestionController(NavigatorParameters, $timeout, $filter, UserPreferences, Params,
                                              FirebaseService, LogOutService, RequestToServer, EncryptionService) {

        let vm = this;

        // variables for controller
        let lang = UserPreferences.getLanguage();
        let navigator = null;
        let navigatorName = '';

        // constants for controller
        const GET_SECURITY_QUESTION_AND_ANSWER_LIST_API = 'SecurityQuestionAnswerList';
        const MIN_ANSWER_LENGTH = 3;    // the minimum length required for a security answer
        const UPDATE_SECURITY_QUESTION_AND_ANSWER_API = 'UpdateSecurityQuestionAnswer';

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
        vm.displayQuestionName = displayQuestionName;
        vm.evaluateSubmission = evaluateSubmission;
        vm.filterQuestionList = filterQuestionList;
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
            navigator = NavigatorParameters.getNavigator();
            navigatorName = NavigatorParameters.getNavigatorName();

            RequestToServer.sendRequestWithResponse(GET_SECURITY_QUESTION_AND_ANSWER_LIST_API)
                .then(function(response){
                    $timeout(function(){

                        let activeSecurityQuestionList = response.data.activeSecurityQuestionList || [];
                        let securityQuestionWithAnsList = response.data.securityQuestionWithAnswerList || [];

                        vm.activeSecurityQuestionList =
                            activeSecurityQuestionList.map((securityQuestion) => new SecurityQuestion(securityQuestion));
                        vm.securityQuestionWithAnsList =
                            securityQuestionWithAnsList.map((securityQuestionAnswer) => new SecurityAnswer(securityQuestionAnswer));

                        vm.loadingList = false;
                    })
                })
                .catch(function(err){
                    $timeout(function(){
                        handleLoadSecurityQuestionListRequestErr();
                        vm.loadingList = false;
                    })
                })
        }

        /**
         * evaluateSubmission
         * @desc toggles the vm.submitDisabled flag
         */
        function evaluateSubmission() {

            let allQuestionActive = true;
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

                if (!answerQuestionObj.question.active){
                    allQuestionActive = false;
                    break;
                }
            }

            vm.submitDisabled = !(vm.passwordChanged && vm.password.length > 0 &&
                allQuestionActive && allQuestionAnswered && haveAQuestionAnswerModified);
        }

        /**
         * displayQuestionName
         * @desc gets the question text according to the language of the app
         * @param {object} question
         * @returns {string} the text of that question in the language of the app
         */
        function displayQuestionName(question){
            return question[`questionText_${lang}`];
        }

        /**
         * changeSecurityQuestion
         * @desc helps changing one security question to another
         * @param {object} questionAnswerObj an item in the list of securityQuestionWithAnsList which question is to be changed
         * @param {object} newQuestion the question to be changed to
         */
        function changeSecurityQuestion(questionAnswerObj, newQuestion){
            vm.submitDisabled = true;

            questionAnswerObj.questionHasChanged = true;
            questionAnswerObj.question = newQuestion;

            // re-initialize the answer once the question has been changed
            questionAnswerObj.answerHasChanged = false;
            questionAnswerObj.oldAnswerPlaceholder = '';
            questionAnswerObj.answer = '';
        }

        /**
         * filterQuestionList
         * @desc custom filter to be used on the list of question to be chosen by a user
         * @param {object} question
         * @returns {boolean}
         */
        function filterQuestionList(question){
            return question.securityQuestionSerNum !== vm.securityQuestionWithAnsList[0].question.securityQuestionSerNum &&
                question.securityQuestionSerNum !== vm.securityQuestionWithAnsList[1].question.securityQuestionSerNum &&
                question.securityQuestionSerNum !== vm.securityQuestionWithAnsList[2].question.securityQuestionSerNum;
        }

        /**
         * handleLoadSecurityQuestionListRequestErr
         * @desc show a notification to the user in case a request to server fails
         */
        function handleLoadSecurityQuestionListRequestErr (){
            NavigatorParameters.setParameters({Navigator: navigatorName});
            navigator.popPage();

            ons.notification.alert({
                //message: 'Server problem: could not fetch data, try again later',
                message: $filter('translate')("SERVERERRORALERT"),
                modifier: (ons.platform.isAndroid())?'material':null
            })
        }

        /**
         * securityQuestionAnswerChanged
         * @desc function called when a security question's answer got changed, should not be called when the question is inactive
         * @param {object} questionAnswerObj
         */
        function securityQuestionAnswerChanged(questionAnswerObj) {

            questionAnswerObj.answerHasChanged = true;

            evaluateSubmission();
        }

        /**
         * submit
         * @desc submit the form containing current password, modified security questions and their corresponding answers
         */
        function submit() {
            loadingSubmit.show();

            // verify password first
            const user = FirebaseService.getAuthenticationCredentials();
            const credential = firebase.auth.EmailAuthProvider.credential(user.email, vm.password);

            user.reauthenticateWithCredential(credential)
                .then(function(){
                    // if password is correct, send the request to backend
                    let params = {
                        'questionAnswerArr': formatSecurityQuestionWithAnsListForSubmission(vm.securityQuestionWithAnsList),
                    };

                    return RequestToServer.sendRequestWithResponse(UPDATE_SECURITY_QUESTION_AND_ANSWER_API, params);
                })
                .then(function(){
                    // confirm that the request has been successful and force logout
                    $timeout(function() {
                        loadingSubmit.hide();
                        successfulUpdateConfirmationAndLogout();
                    });
                })
                .catch(function(err) {
                    $timeout(function() {
                        loadingSubmit.hide();
                        handleSubmitErr(err);
                    });
                })
        }

        /**
         * handleSubmitErr
         * @desc shows a notification to the user in case the submission fails
         * @param {Error} error
         */
        function handleSubmitErr(error) {
            if (error.code === Params.invalidPassword) {

                ons.notification.alert({
                    message: $filter('translate')(Params.invalidPasswordMessage),
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
                    securityAnswerSerNum: answerQuestionObj.securityAnswerSerNum,
                    questionSerNum: answerQuestionObj.question.securityQuestionSerNum,
                    answer: EncryptionService.hash(answerQuestionObj.answer.toUpperCase()),
                });

            });

            return arrToBeSent;
        }
    }
})();