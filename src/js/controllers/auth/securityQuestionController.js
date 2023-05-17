/*
 * Filename     :   securityQuestionController.js
 * Description  :   Controller that submits the user's security question to be validated by our servers
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   May 20, 2015
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source Code package.
 */

/**
 *  @ngdoc controller
 *  @name MUHCApp.controllers: SecurityQuestionController
 *  @requires '$scope', '$timeout', 'ResetPassword', 'RequestToServer', 'EncryptionService', 'UUID', 'UserAuthorizationInfo',
 *  '$state', 'Constants', 'DeviceIdentifiers', 'NavigatorParameters'
 *  @description
 *
 *  Controller that submits the user's security question to be validated by our servers. This leads to the generation of the user's encryption key.
 */
(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('SecurityQuestionController', SecurityQuestionController);

    SecurityQuestionController.$inject = ['$window', '$timeout', 'ResetPassword', 'RequestToServer', 'EncryptionService',
        'UUID', 'UserAuthorizationInfo', '$state', 'DeviceIdentifiers', 'NavigatorParameters', '$scope', 'Params',
        'UserHospitalPreferences'];

    /* @ngInject */
    function SecurityQuestionController($window, $timeout, ResetPassword, RequestToServer, EncryptionService, UUID,
                                        UserAuthorizationInfo, $state, DeviceIdentifiers, NavigatorParameters, $scope,
                                        Params, UserHospitalPreferences) {

        var vm = this;
        var deviceID;
        var passwordReset;
        var parameters = {};
        var trusted;

        /**
         * @ngdoc property
         * @name tooManyAttempts
         * @propertyOf SecurityQuestionController
         * @description Used to block the submit button after too many invalid security answer attempts.
         * @type {boolean}
         */
        vm.tooManyAttempts = false;

        /**
         * @ngdoc property
         * @name Question
         * @propertyOf SecurityQuestionController
         * @returns string
         * @description the security question to be displayed to the user
         */
        vm.Question = "";

        /**
         * @ngdoc property
         * @name alert
         * @propertyOf SecurityQuestionController
         * @returns object
         * @description alert object to be displayed to the user if an error occurs
         */
        vm.alert = {
            type: "",
            message: ""
        };

        /**
         * @ngdoc property
         * @name answer
         * @propertyOf SecurityQuestionController
         * @returns string
         * @description binds to form and represents the user's inputted answer
         */
        vm.answer = "";

        /**
         * @ngdoc property
         * @name invalidCode
         * @propertyOf SecurityQuestionController
         * @returns boolean
         * @description hides input div if set to true
         */
        vm.invalidCode = false;

        /**
         * @ngdoc property
         * @name passwordReset
         * @propertyOf SecurityQuestionController
         * @returns boolean
         * @description determines which back button to show
         */
        vm.passwordReset = false;

        /**
         * @ngdoc property
         * @name loading
         * @propertyOf SecurityQuestionController
         * @returns boolean
         * @description Toggles the loading spinner shown during password reset.
         */
        vm.loading = false;

        /**
	     * @ngdoc property
	     * @name alertShow
	     * @propertyOf SecurityQuestionController
	     * @returns boolean
	     * @description momentarily hides the button while submitting
	     */
	    vm.alertShow = true;

        vm.submitAnswer = submitAnswer;
        vm.clearErrors = clearErrors;
        vm.goToInit = goToInit;
        vm.goToReset = goToReset;
        vm.isThereSelectedHospital = isThereSelectedHospital;

        activate();

        //////////////////////////////////////////

        /************************************************
         *  PRIVATE FUNCTIONS
         ************************************************/

        function activate(){
            deviceID = UUID.getUUID();
            var nav = NavigatorParameters.getNavigator();
            parameters = nav.getCurrentPage().options;
            trusted = parameters.trusted;

            initializeData();

            bindEvents();
        }

        /**
         * @ngdoc function
         * @name initializeData
         * @methodOf MUHCApp.controllers.SecurityQuestionController
         * @description Fetches and sets the data for this controller. This function is called again after the postpop
         *              event (to attempt to load data after the user has chosen a hospital to target).
         */
        function initializeData() {
            // this checks whether or not the security question is being asked in order to log the user in or to trigger a password reset request
            if (parameters.passwordReset){

                vm.loading = true;
                passwordReset = parameters.passwordReset;
                vm.passwordReset = passwordReset;

                // Reset some controller variables to prevent old results or errors from showing when trying to load data again
                vm.tooManyAttempts = false;
                vm.Question = "";
                vm.alert = {
                    type: "",
                    message: ""
                };
                vm.invalidCode = false;
                vm.alertShow = true;

                // Only proceed with requests if the patient has selected a hospital; if not, wait for them to do so
                if (UserHospitalPreferences.isThereSelectedHospital()) {

                    ResetPassword.verifyLinkCode(parameters.url).then(function (email) {
                        UserAuthorizationInfo.setEmail(email);
                        return DeviceIdentifiers.sendDevicePasswordRequest(email);
                    })
                    .then(function (response) {
                        $timeout(function () {
                            vm.Question = response.Data.securityQuestion.securityQuestion_EN + " / " + response.Data.securityQuestion.securityQuestion_FR;
                            vm.loading = false;
                        });
                    })
                    .catch(function (error) {
                        vm.loading = false;
                        handleError(error);
                    });
                }
            } else {
                vm.Question = parameters.securityQuestion;
                angular.element(document).ready(function () {
                    const securityAnswer = document.getElementById('security_answer_input');
                    if (securityAnswer) {
                        securityAnswer.focus();
                    }
                });
            }
        }

        /**
         * @ngdoc function
         * @name bindEvents
         * @methodOf MUHCApp.controllers.SecurityQuestionController
         * @description Sets up event bindings for this controller.
         */
        function bindEvents() {
            // In case someone presses back button, need to remove the deviceID and security answer.
            $scope.initNavigator.on('prepop', function () {
                removeUserData();
            });

            // Re-launch data requests after selecting a different hospital and going back to this page
            $scope.initNavigator.on('postpop', function () {
                $timeout(function() {
                    if (vm.passwordReset) initializeData();
                });
            });

            // Remove the event listeners
            $scope.$on('$destroy', function() {
                $scope.initNavigator.off('prepop');
                $scope.initNavigator.off('postpop');
            });
        }

        /**
         * @ngdoc function
         * @name handleSuccess
         * @methodOf MUHCApp.controllers.SecurityQuestionController
         * @param {string} securityAnswerHash Hash of the user's security answer
         * @description
         * Handles verified security question answer that returns in success. Brings user to the loading page.
         */
        function handleSuccess(securityAnswerHash){
            if (trusted){
                $window.localStorage.setItem("deviceID",deviceID);
                $window.localStorage.setItem(UserAuthorizationInfo.getUsername()+"/securityAns", EncryptionService.encryptWithKey(securityAnswerHash, UserAuthorizationInfo.getPassword()).toString());
            }

            EncryptionService.setSecurityAns(securityAnswerHash);
            EncryptionService.generateEncryptionHash();

            if(passwordReset){
                $scope.initNavigator.pushPage('./views/login/new-password.html', {data: {oobCode: ResetPassword.getParameter("oobCode", parameters.url)}});
            }
            else {
                $state.go('loading');
            }
        }

        /**
         * @ngdoc function
         * @name handleError
         * @methodOf MUHCApp.controllers.SecurityQuestionController
         * @param error error object
         * @description
         * Handles errors in order to display the proper message to the user.
         */
        function handleError(error) {
            console.error(error);
            $timeout(function() {

                // This check prevents from handling old request timeouts that were followed by a successful re-attempt
                if (error.Response === "timeout" && vm.Question !== "") return;

                var code = (error.code)? error.code : error.Code;
                vm.alert.type = Params.alertTypeDanger;
                switch (code){
                    case Params.expiredActionCode:
                    case Params.invalidActionCode:
                        vm.invalidCode=true;
                        errormodal.show();
                        break;
                    case Params.userDisabled:
                        vm.alert.content = "USER_DISABLED";
                        break;
                    case Params.invalidUser:
                        vm.alert.content = "INVALID_USER";
                        break;
                    case 4:
                        vm.alert.content = "OUTOFTRIES";
                        vm.tooManyAttempts = true;
                        break;
                    case "corrupted-data":
                        vm.alert.content = "CONTACTHOSPITAL";
                        break;
                    case "wrong-answer":
                        vm.alert.content = "ERRORANSWERNOTMATCH";
                        break;
                    case "no-answer":
                        vm.alert.content = "ENTERANANSWER";
                        break;
                    default:
                        vm.alert.content = "ERROR_GENERIC";
                        break;
                }
            })
        }

        /**
         * @ngdoc function
         * @name removeUserData
         * @methodOf MUHCApp.controllers.SecurityQuestionController
         * @description
         * Removes user data from local storage
         */
        function removeUserData(){
            $window.localStorage.removeItem(UserAuthorizationInfo.getUsername()+"/deviceID");
            $window.localStorage.removeItem(UserAuthorizationInfo.getUsername()+"/securityAns");
        }

        /************************************************
         *  PUBLIC METHODS
         ************************************************/

        /**
         * @ngdoc method
         * @name clearErrors
         * @methodOf MUHCApp.controllers.SecurityQuestionController
         * @description
         * Clears errors
         */
        function clearErrors() {
            if(vm.alert.hasOwnProperty('type')) {
                delete vm.alert.type;
            }
            if(vm.alert.hasOwnProperty('content')) {
                delete vm.alert.content;
            }
        }

        /**
         * @ngdoc method
         * @name submitAnswer
         * @methodOf MUHCApp.controllers.SecurityQuestionController
         * @param answer user inputted answer string
         * @description
         * Sends request object containing user-inputted answer to our servers to be validated
         */
        function submitAnswer (answer) {
            clearErrors();

            if (!answer) {
                handleError({code: "no-answer"});
            } else {
                vm.alertShow = false;
                vm.submitting = true;

                answer = answer.toUpperCase();
                var hash = EncryptionService.hash(answer);

                //Sets up the proper request object based on use case
                var key = hash;
                var firebaseRequestField = passwordReset ? 'passwordResetRequests' : undefined;
                var firebaseResponseField = passwordReset ? 'passwordResetResponses' : undefined;
                var parameterObject = {
                    Question: vm.Question,
                    Answer: hash,
                    Trusted: trusted
                };

                if (passwordReset){
                    parameterObject['PasswordReset'] = true;
                } else {
                    parameterObject['Password'] = UserAuthorizationInfo.getPassword();
                }

                RequestToServer.sendRequestWithResponse('VerifyAnswer',parameterObject, key, firebaseRequestField, firebaseResponseField).then(function(data) {
	                vm.alertShow = true;
                    vm.submitting = false;
                    if(data.Data.AnswerVerified === "true") {
                        handleSuccess(key)
                    } else if(data.Data.AnswerVerified === "false"){
                        removeUserData();
                        handleError({Code: "wrong-answer"});
                    }else{
                        handleError({Code: ""});
                    }
                })
                .catch(function(error) {
	                vm.alertShow = true;
	                vm.submitting = false;
	                removeUserData();
                    if(error.hasOwnProperty('Reason') && error.Reason && error.Reason.toLowerCase().indexOf('malformed utf-8') !== -1) {
                        handleError({Code: "corrupted-data"});
                    } else {
                        handleError(error);
                    }

                });
            }
        }

        /**
         * @ngdoc method
         * @name goToInit
         * @methodOf MUHCApp.controllers.SecurityQuestionController
         * @description
         * Brings user to init screen
         */
        function goToInit(){
            initNavigator.resetToPage('./views/init/init-screen.html',{animation:'none'});
        }

        /**
         * @ngdoc method
         * @name goToReset
         * @methodOf MUHCApp.controllers.SecurityQuestionController
         * @description
         * Brings user to password reset screen
         */
        function goToReset(){
            initNavigator.pushPage('./views/login/forgot-password.html',{})
        }

        /**
         * @ngdoc method
         * @name isThereSelectedHospital
         * @methodOf MUHCApp.controllers.LoginController
         * @description Returns whether the user has already selected a hospital.
         * @returns {boolean} True if there is a hospital selected; false otherwise.
         */
        function isThereSelectedHospital() {
            return UserHospitalPreferences.isThereSelectedHospital();
        }
    }
})();
