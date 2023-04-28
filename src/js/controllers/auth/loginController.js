/*
 * Filename     :   loginController.js
 * Description  :   Controller in charge of the login process using FireBase as the authentication API.
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   May 20, 2015
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */

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

    LoginController.$inject = ['$timeout', '$state', 'UserAuthorizationInfo', '$filter','DeviceIdentifiers',
        'UserPreferences', 'Patient', 'Toast', 'UUID', 'Constants', 'EncryptionService', 'CleanUp', '$window', 'FirebaseService', '$rootScope', 'Params', 'UserHospitalPreferences'];

    /* @ngInject */
    function LoginController($timeout, $state, UserAuthorizationInfo, $filter, DeviceIdentifiers, UserPreferences, Patient, Toast, UUID, Constants, EncryptionService, CleanUp, $window, FirebaseService, $rootScope, Params, UserHospitalPreferences) {

        var vm = this;

        var patientSerNum = "";
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

        vm.clearErrors = clearErrors;
        vm.submit = submit;
        vm.goToInit = goToInit;
        vm.goToReset = goToReset;
        vm.isThereSelectedHospital = isThereSelectedHospital;

        activate();

        //////////////////////////////////

        /*************************
         *  PRIVATE FUNCTIONS
         *************************/

        function activate(){

            clearErrors();

            //Obtain email from localStorage and show that email
            savedEmail = $window.localStorage.getItem('Email');
            if(savedEmail) vm.email = savedEmail;

            patientSerNum = Patient.getPatientSerNum();

            // Switch for trusting device
            $timeout(function(){
                vm.trusted = !!($window.localStorage.getItem("deviceID"));
            });
        }

        /**
         * @ngdoc function
         * @name authHandler
         * @methodOf MUHCApp.controllers.LoginController
         * @param firebaseUser FireBase User Object
         * @description
         * Receives an authenticated FireBase User Object and handles the next step of the logging process
         * which involves determining whether or not the user is handed off to the security question process.
         */
        async function authHandler(firebaseUser) {
            CleanUp.clear();

            let sessionToken = await firebaseUser.getToken(true);

            /******************************************************************************************************
             * LOCKING OUT OF CONCURRENT USERS
             ******************************************************************************************************/
            // Save the current session token to the users "logged in users" node.
            // This is used to make sure that the user is only logged in for one session at a time.
            let refCurrentUser = FirebaseService.getDBRef(FirebaseService.getFirebaseChild('logged_in_users') + firebaseUser.uid);

            refCurrentUser.set({ 'Token' : sessionToken });

            // Evoke an observer function in mainController
            $rootScope.$emit("MonitorLoggedInUsers", firebaseUser.uid);
            /**************************************************************************************************** */


            //Set the authorized user once we get confirmation from FireBase that the inputted credentials are valid
            UserAuthorizationInfo.setUserAuthData(firebaseUser.uid, EncryptionService.hash(vm.password), undefined, sessionToken, vm.email, vm.trusted);


            //This is for the user case where a user gets logged out automatically by the app after 5 minutes of inactivity.
            //Ideally the Patient info should stay dormant on the phone for a pre-determined period of time, not indefinitely.
            //So the time of last activity is stored in local storage here and when the user is timed out, so that once 10 minute goes by
            //The patient info is cleared from the phone.
            var lastActive = new Date();
            lastActive = lastActive.getTime();

            var authenticationToLocalStorage={
                UserName:firebaseUser.uid,
                Email: vm.email,
            //    Password: vm.password,
                Token:sessionToken,
                LastActive: lastActive
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
                $window.localStorage.removeItem(UserAuthorizationInfo.getUsername()+"/securityAns");
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
                var ans = EncryptionService.decryptDataWithKey($window.localStorage.getItem(UserAuthorizationInfo.getUsername()+"/securityAns"), UserAuthorizationInfo.getPassword());
                EncryptionService.setSecurityAns(ans);

                // Now that we know that both the password and security answer are hashed, we can create our encryption hash
                EncryptionService.generateEncryptionHash();
            }
            catch(error) {
                // If there's something wrong with the stored trusted info, log in as untrusted instead
                warnTrustedError(error);
                loginAsUntrustedUser(deviceID);
                return;
            }

            UUID.setUUID(deviceID);
            DeviceIdentifiers.sendIdentifiersToServer().then(function () {
                $state.go('loading');
            })
            .catch(function (error) {
                if (error.Code === Params.REQUEST.CODE.ENCRYPTION_ERROR || error.code === "PERMISSION_DENIED" ) {
                    warnTrustedError(error);
                    loginAsUntrustedUser(deviceID);
                }
                else {
                    if (firebase.auth().currentUser) firebase.auth().signOut();
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
            //if using a web browers (via demo or testing)
            if (!Constants.app) UUID.setUUID(UUID.generate());

            //send new device ID which maps to a security question in the backend
            DeviceIdentifiers.sendFirstTimeIdentifierToServer()
                .then(function (response) {

                    vm.loading = false;
                    //if all goes well, take the user to be asked security question
                    var language = UserPreferences.getLanguage();

                    initNavigator.pushPage('./views/login/security-question.html', {
                        securityQuestion: response.Data.question,
                        trusted: vm.trusted
                    });
                })
                .catch(function (error) {
                    $timeout(function(){
                        vm.loading = false;
                        firebase.auth().signOut();
                        handleError(error);
                    });
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

                //the user is still logged in if this is present
                var authDetails = $window.sessionStorage.getItem('UserAuthorizationInfo');

                if(savedEmail === vm.email) sameUser = true;

                var stillActive = false;

                //if the user is still logged in and was active in the last 10 minutes, then we can skip the loading process and take the user straight to their information
                if (authDetails) {
                    var now = new Date();
                    now = now.getTime();
                    var tenMinutesAgo = now - Params.tenMinutesMilliSeconds;
                    authDetails = JSON.parse(authDetails);
                    stillActive = (authDetails.LastActive > tenMinutesAgo);
                }

                // Get the authentication state
                var myAuth = firebase.auth().currentUser;

                //If the user information is still on the phone, they are logged in, and were active in the past 10 minutes.. then skip the logging in and loading process entirely.
                if(myAuth && patientSerNum && stillActive && authDetails.Email === vm.email && vm.trusted){
                    firebase.auth().signInWithEmailAndPassword(vm.email, vm.password)
                        .then(function () {
                            localStorage.removeItem('locked');
                            $state.go('Home');
                        }).catch(handleError);
                } else{
                    //Otherwise follow the normal logging in use case
                    firebase.auth().signInWithEmailAndPassword(vm.email, vm.password).then(authHandler).catch(handleError);
                }
            }
        }

        /**
         * @ngdoc method
         * @name goToInit
         * @methodOf MUHCApp.controllers.LoginController
         * @description
         * Brings user to init screen
         */
        function goToInit(){
            initNavigator.popPage();
        }

        /**
         * @ngdoc method
         * @name goToReset
         * @methodOf MUHCApp.controllers.LoginController
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
