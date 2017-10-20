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
        'UUID', 'UserAuthorizationInfo', '$state', 'DeviceIdentifiers', 'NavigatorParameters', '$scope'];

    /* @ngInject */
    function SecurityQuestionController($window, $timeout, ResetPassword, RequestToServer, EncryptionService, UUID,
                                        UserAuthorizationInfo, $state, DeviceIdentifiers, NavigatorParameters, $scope) {

        var vm = this;
        var deviceID;
        var passwordReset;
        var parameters = {};
        var trusted;

        /**
         * @ngdoc property
         * @name attempts
         * @propertyOf SecurityQuestionController
         * @returns int
         * @description used by the controller to only allow 3 security question attempts
         */
        vm.attempts= 0;

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
        vm.invalidCode=false;

        /**
         * @ngdoc property
         * @name passwordReset
         * @propertyOf SecurityQuestionController
         * @returns boolean
         * @description determines which back button to show
         */
        vm.passwordReset = false;

        vm.submitAnswer = submitAnswer;
        vm.clearErrors = clearErrors;
        vm.goToInit = goToInit;
        vm.goToReset = goToReset;

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

            // this checks whether or not the security question is being asked in order to log the user in or to trigger a password reset request
            if (parameters.passwordReset){

                passwordReset = parameters.passwordReset;
                vm.passwordReset = passwordReset;

                ResetPassword.verifyLinkCode(parameters.url)
                    .then(function (email) {
                        UserAuthorizationInfo.setEmail(email);
                        return DeviceIdentifiers.sendDevicePasswordRequest(email);
                    })
                    .then(function (response) {
                        $timeout(function() {
                            vm.Question = response.Data.securityQuestion.securityQuestion_EN + " / " + response.Data.securityQuestion.securityQuestion_FR;
                        });
                    })
                    .catch(handleError);
            } else {
                vm.Question = parameters.securityQuestion;
            }

            // In case someone presses back button, need to remove the deviceID and security answer.
            $scope.initNavigator.once('prepop', function () {
                removeUserData();
            });
        }

        /**
         * @ngdoc function
         * @name handleSuccess
         * @methodOf MUHCApp.controllers.SecurityQuestionController
         * @param key encryption hash
         * @description
         * Handles verified security question answer that returns in success. Brings user to the loading page.
         */
        function handleSuccess(key){
            if (trusted){
                $window.localStorage.setItem("deviceID",deviceID);
                $window.localStorage.setItem(UserAuthorizationInfo.getUsername()+"/securityAns", EncryptionService.encryptWithKey(key, UserAuthorizationInfo.getPassword()).toString());
            }

            EncryptionService.setSecurityAns(key);
            EncryptionService.generateEncryptionHash();

            if(passwordReset){
                EncryptionService.generateTempEncryptionHash(EncryptionService.hash(vm.ssn.toUpperCase()), key);
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
            $timeout(function(){
                vm.alert.type='danger';
                switch (error.Code){
                    case "auth/expired-action-Code":
                    case "auth/invalid-action-Code":
                        vm.invalidCode=true;
                        modal.show();
                        break;
                    case "auth/user-disabled":
                        vm.alert.content = "USER_DISABLED";
                        break;
                    case "auth/user-not-found":
                        vm.alert.content = "INVALID_USER";
                        break;
                    case "3":
                        vm.alert.content = "OUTOFTRIES";
                        break;
                    case "corrupted-data":
                        vm.alert.content = "CONTACTHOSPITAL";
                        break;
                    case "wrong-answer":
                        vm.alert.content="ERRORANSWERNOTMATCH";
                        break;
                    default:
                        vm.alert.content="INTERNETERROR";
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
            if (!answer || (!vm.ssn && passwordReset)) {
                vm.alert.type = 'danger';
                vm.alert.content = 'ENTERANANSWER';

            } else {
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
                    SSN: vm.ssn,
                    Trusted: trusted,
                    PasswordReset: passwordReset || false
                };

                RequestToServer.sendRequestWithResponse('VerifyAnswer',parameterObject, key, firebaseRequestField, firebaseResponseField).then(function(data)
                {
                    vm.submitting = false;
                    if(data.Data.AnswerVerified === "true") {
                        handleSuccess(key)
                    } else if(data.Data.AnswerVerified === "false"){
                        removeUserData();
                        handleError({Code: "wrong-answer"});
                    } else{
                        handleError({Code: ""});
                    }
                })
                .catch(function(error)
                {
                    vm.submitting = false;
                    removeUserData();
                    if(error.Reason && error.Reason.toLowerCase().indexOf('malformed utf-8') !== -1) {
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
    }
})();