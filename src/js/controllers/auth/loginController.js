/*
 * Filename     :   loginController.js
 * Description  :   Controller in charge of the login process using FireBase as the authentication API.
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   May 20, 2015
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */

import { CancelledPromiseError } from "../../models/utility/cancelled-promise-error";

/**
 *  @ngdoc controller
 *  @name MUHCApp.controllers: LoginController
 *  @description
 *  Controller in charge of the login process using FireBase as the authentication API.
 */
(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['$filter', '$rootScope', '$scope', '$state', '$timeout', '$window', 'CleanUp',
        'ConcurrentLogin', 'Constants', 'DeviceIdentifiers', 'EncryptionService', 'Firebase',
        'Navigator', 'Params', 'Toast', 'UserAuthorizationInfo', 'UserHospitalPreferences',
        'UserPreferences', 'UUID'];

    /* @ngInject */
    function LoginController($filter, $rootScope, $scope, $state, $timeout, $window, CleanUp,
                             ConcurrentLogin, Constants, DeviceIdentifiers, EncryptionService, Firebase,
                             Navigator, Params, Toast, UserAuthorizationInfo, UserHospitalPreferences,
                             UserPreferences, UUID) {

        var vm = this;

        var sameUser = false;
        var savedEmail;

        /**
         * @ngdoc property
         * @name loading
         * @propertyOf LoginController
         * @returns boolean
         * @description used by the controller to disable the login button when sending login request
         */
        vm.loading = false;

        /**
         * @ngdoc property
         * @name email
         * @propertyOf LoginController
         * @returns string
         * @description binds the user's input for their email to the controller
         */
        vm.email = "";

        /**
         * @ngdoc property
         * @name password
         * @propertyOf LoginController
         * @returns string
         * @description binds the user's input for their password to the controller
         */
        vm.password = "";

        /**
         * @ngdoc property
         * @name alert
         * @propertyOf LoginController
         * @returns object
         * @description stores the alert type and message to be displayed to the user if an error were to occur
         */
        vm.alert = {
            type: null,
            message: null
        };

        /**
         * @ngdoc property
         * @name trusted
         * @propertyOf LoginController
         * @returns boolean
         * @description binds to the switch in the login form and determines whether user data should be saved to phone
         */
        vm.trusted = false;

        /**
         * @description Promise that can be cancelled if the user leaves the page (to cancel any in-progress untrusted login attempt).
         * @type {{promise: Promise, cancel: function} | undefined}
         */
        vm.untrustedPromise = undefined;

        /**
         * @description Promise that can be cancelled if the user leaves the page (to cancel any in-progress trusted login attempt).
         * @type {{promise: Promise, cancel: function} | undefined}
         */
        vm.trustedPromise = undefined;

        /**
         * @description Tracks whether the login attempt on this page has been successful; used to decide whether to cancel login on destruction of the controller.
         * @type {boolean}
         */
        vm.attemptSuccessful = false;

        vm.cancelLoginAttempt = cancelLoginAttempt;
        vm.clearErrors = clearErrors;
        vm.submit = submit;
        vm.goToReset = goToReset;
        vm.isThereSelectedHospital = isThereSelectedHospital;

        activate();

        //////////////////////////////////

        /*************************
         *  PRIVATE FUNCTIONS
         *************************/

        function activate(){
            clearErrors();
            bindEvents();
            //Obtain email from localStorage and show that email
            savedEmail = $window.localStorage.getItem('Email');
            if(savedEmail) vm.email = savedEmail;

            // Switch for trusting device
            $timeout(function(){
                vm.trusted = !!($window.localStorage.getItem("deviceID"));
            });
        }

        function bindEvents() {
            let navigator = Navigator.getNavigator();

            // On destroy, cancel any unfinished in-progress login attempt
            $scope.$on('$destroy', () => {
                // Avoid cancelling login when the attempt was successful and we're destroying the controller to go to the next page
                if (!vm.attemptSuccessful) cancelLoginAttempt();

                // Remove event listener
                navigator.off('prepop');
            });

            // Reset loading when cancelling from the security question screen
            navigator.on('prepop', function () {
                vm.loading = false;
            });
        }

        /**
         * @ngdoc function
         * @name authHandler
         * @methodOf MUHCApp.controllers.LoginController
         * @param firebaseUserCredential Firebase UserCredential object returned after login
         * @description
         * Receives an authenticated FireBase User Object and handles the next step of the logging process
         * which involves determining whether or not the user is handed off to the security question process.
         */
        async function authHandler(firebaseUserCredential) {
            CleanUp.clear();

            let firebaseUser = firebaseUserCredential.user;

            //Set the authorized user once we get confirmation from FireBase that the inputted credentials are valid
            UserAuthorizationInfo.setUserAuthData(firebaseUser.uid, EncryptionService.hash(vm.password), undefined, vm.email, vm.trusted);

            //This is for the user case where a user gets logged out automatically by the app after 5 minutes of inactivity.
            //Ideally the Patient info should stay dormant on the phone for a pre-determined period of time, not indefinitely.
            //So the time of last activity is stored in local storage here and when the user is timed out, so that once 10 minute goes by
            //The patient info is cleared from the phone.
            var lastActive = new Date();
            lastActive = lastActive.getTime();

            let authenticationToLocalStorage = {
                UserName: firebaseUser.uid,
                Email: vm.email,
                LastActive: lastActive,
            };

            $window.sessionStorage.setItem('UserAuthorizationInfo', JSON.stringify(authenticationToLocalStorage));
            $window.localStorage.setItem('Email', vm.email);
            if (ons.platform.isAndroid() || ons.platform.isIOS()) {
                $window.localStorage.setItem('Password', vm.password);
            }

            $window.localStorage.setItem("Language", UserPreferences.getLanguage());
            // If user sets not trusted remove the local storage as to not continue to the next part which skips the security question
            if (!vm.trusted) {
                $window.localStorage.removeItem('Email');
                $window.localStorage.removeItem('Password');
                $window.localStorage.removeItem("deviceID");
                $window.localStorage.removeItem(EncryptionService.getStorageKey());
                $window.localStorage.removeItem('hospital');
            }

            var deviceID = localStorage.getItem("deviceID");

            //if the device was a previously trusted device, and is still set to trusted...
            if (deviceID && sameUser) loginAsTrustedUser(deviceID);
            else loginAsUntrustedUser();
        }

        /**
         * @ngdoc function
         * @name loginAsTrustedUser
         * @methodOf MUHCApp.controllers.LoginController
         * @param deviceID a string containing the user's device ID
         * @description
         * If a user has been deemed as trusted, then this allows them to skip the security question process and go straight to loading screen
         */
        function loginAsTrustedUser(deviceID){
            const warnTrustedError = (error) => { console.warn("An error occurred while logging in as trusted; now attempting to log in as untrusted.", error) };

            try {
                var ans = EncryptionService.decryptDataWithKey($window.localStorage.getItem(EncryptionService.getStorageKey()), UserAuthorizationInfo.getPassword());
                EncryptionService.setSecurityAns(ans);

                // Now that we know that both the password and security answer are hashed, we can create our encryption hash
                EncryptionService.generateEncryptionHash();
            }
            catch (error) {
                // If there's something wrong with the stored trusted info, log in as untrusted instead
                warnTrustedError(error);
                loginAsUntrustedUser(deviceID);
                return;
            }

            UUID.setUUID(deviceID);
            
            vm.trustedPromise = DeviceIdentifiers.sendDeviceIdentifiersToServer();

            vm.trustedPromise.promise.then(() => {
                vm.attemptSuccessful = true;
                $state.go('loading');
            }).catch(error => {
                if (error instanceof CancelledPromiseError) {
                    // Cancelled on purpose: nothing additional to do here
                    console.warn(error);
                }
                else if (error.Code === Params.REQUEST.CODE.ENCRYPTION_ERROR || error.code === "PERMISSION_DENIED" ) {
                    warnTrustedError(error);
                    loginAsUntrustedUser(deviceID);
                }
                else {
                    console.error('Error sending identifiers to server during trusted login');
                    Firebase.signOut();
                    handleError(error);
                }
            });
        }

        /**
         * @ngdoc function
         * @name loginAsUntrustedUser
         * @methodOf MUHCApp.controllers.LoginController
         * @param deviceID a string containing the user's device ID
         * @description
         * If a user has been deemed as untrusted, then this takes the user to the security question process
         */
        function loginAsUntrustedUser(deviceID){
            // If the deviceID exists use it, otherwise generate a new one
            if (!deviceID){
                UUID.setUUID(UUID.generate());
            } else {
                // This will allow the trusted login to work when switching between hospitals
                UUID.setUUID(deviceID);
            }

            //send new device ID which maps to a security question in the backend
            vm.untrustedPromise = DeviceIdentifiers.sendFirstTimeIdentifierToServer();

            vm.untrustedPromise.promise.then(response => {
                vm.attemptSuccessful = true;
                initNavigator.pushPage('./views/login/security-question.html', {
                    securityQuestion: response.Data.securityQuestion,
                    trusted: vm.trusted,
                });
            }).catch(error => {
                if (error instanceof CancelledPromiseError) {
                    // Cancelled on purpose: nothing additional to do here
                    console.warn(error);
                }
                else {
                    $timeout(() => {
                        console.error('Error sending identifiers to server during untrusted login');
                        vm.loading = false;
                        Firebase.signOut();
                        handleError(error);
                    });
                }
            });
        }

        /**
         * @ngdoc function
         * @name handleError
         * @methodOf MUHCApp.controllers.LoginController
         * @param error an error object
         * @description
         * Evaluates the error object it receives and displays the appropriate error message to the user
         */
        function handleError(error)
        {
            console.error(error);
            let code = error.code ? error.code : error.Code;
            vm.loading = false;

            switch (code) {
                case Params.invalidEmail:
                case Params.invalidPassword:
                case Params.invalidUser:
                    $timeout(function(){
                        vm.alert.type = Params.alertTypeDanger;
                        vm.alert.message= "INVALID_EMAIL_OR_PWD";
                    });
                    break;
                case Params.largeNumberOfRequests:
                    $timeout(function (){
                        vm.alert.type = Params.alertTypeDanger;
                        vm.alert.message = "TOO_MANY_REQUESTS";
                    });
                    break;
                case Params.userDisabled:
                    $timeout(function (){
                        vm.alert.type = Params.alertTypeDanger;
                        vm.alert.message = "USER_DISABLED";
                    });
                    break;
                case Params.networkRequestFailure:
                    $timeout(function(){
                        vm.alert.type = Params.alertTypeDanger;
                        vm.alert.message = "ERROR_NETWORK";
                    });
                    break;
                case Params.REQUEST.CODE.ENCRYPTION_ERROR:
                    $timeout(function(){
                        vm.alert.type = Params.alertTypeDanger;
                        vm.alert.message = "PASSWORD_SERVER_ERROR";
                    });
                    break;
                default:
                    $timeout(function(){
                        vm.alert.type = Params.alertTypeDanger;
                        vm.alert.message = "ERROR_GENERIC";
                    });
            }
        }

        /*************************
         *  PUBLIC METHODS
         *************************/

        /**
         * @ngdoc method
         * @name clearErrors
         * @methodOf MUHCApp.controllers.LoginController
         * @description
         * Clears errors
         */
        function clearErrors(){
            $timeout(function(){
                vm.alert.type = null;
                vm.alert.message = null;
            });
        }

        /**
         * @desc Used when the user leaves the page to cancel an in-progress login attempt.
         */
        function cancelLoginAttempt() {
            Firebase.signOut();

            /*
             * Cancel any in-progress promise when leaving the page.
             * This fixes a bug where a first attempt made to an invalid hospital would time out after leaving the page.
             * In particular, it could time out after a successful login at a valid hospital, leading to errors.
             */
            let promises = [vm.trustedPromise, vm.untrustedPromise];
            promises.forEach(promise => {
                if (promise && typeof promise.cancel === 'function') {
                    promise.cancel();
                }
            });

            vm.loading = false;
        }

        /**
         * @ngdoc method
         * @name submit
         * @methodOf MUHCApp.controllers.LoginController
         * @description
         * Validates a user's credentials using FireBase's API and then takes the user to the next steps
         */
        function submit() {
            clearErrors();

            if (!vm.email || vm.email === '') {
                handleError({code: Params.invalidEmail});

            } else if (!vm.password || vm.password === '') {
                handleError({code: Params.invalidPassword});

            } else {
                vm.loading = true;
                if(savedEmail === vm.email) sameUser = true;
                Firebase.signInWithEmailAndPassword(vm.email, vm.password).then(authHandler).catch(handleError);
            }
        }

        /**
         * @ngdoc method
         * @name goToReset
         * @methodOf MUHCApp.controllers.LoginController
         * @description
         * Brings user to password reset screen
         */
        function goToReset(){
            cancelLoginAttempt();
            initNavigator.pushPage('./views/login/forgot-password.html', {});
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
