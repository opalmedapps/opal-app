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
 *
 *  Controller in charge of the login process using FireBase as the authentication API.
 */
(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['$timeout', '$state', 'UserAuthorizationInfo', '$filter','DeviceIdentifiers',
        'UserPreferences', 'Patient', 'NewsBanner', 'UUID', 'Constants', 'EncryptionService', 'CleanUp'];

    /* @ngInject */
    function LoginController($timeout, $state, UserAuthorizationInfo, $filter,DeviceIdentifiers, UserPreferences, Patient, NewsBanner, UUID, Constants, EncryptionService, CleanUp) {

        var vm = this;

        var patientSerNum = "";

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
         * @name error
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

        activate();
        //////////////////////////////////

        /*************************
         *  PRIVATE FUNCTIONS
         *************************/

        function activate(){

            clearErrors();

            if(!localStorage.getItem('locked')){
                $timeout(function () {
                    securityModal.show();
                },200);
            }

            //Obtain email from localStorage and show that email
            var savedEmail = window.localStorage.getItem('Email');
            if(savedEmail) vm.email = savedEmail;

            patientSerNum = Patient.getUserSerNum();

            //Locked out alert
            if(patientSerNum) NewsBanner.showCustomBanner($filter('translate')('LOCKEDOUT'),'black', null, 2000);

            // Switch for trusting device
            $timeout(function(){
                vm.trusted = !!(localStorage.getItem("deviceID"));
            });

        }

        //Handles authentication and next steps
        function authHandler(firebaseUser) {
            CleanUp.clear();

            firebaseUser.getToken(true).then(function(sessionToken){

                /**************************************************************************************************************************************
                 * SINCE PREPROD IS HEAVILY TESTED, I AM DISABLING TO LOCKING OUT OF CONCURRENT USERS, THIS SHOULDN'T BE THE CASE FOR PROD!!!!!!!!!!!
                 **************************************************************************************************************************************/

                //Save the current session token to the users "logged in users" node. This is used to make sure that the user is only logged in for one session at a time.
                // var Ref= firebase.database().ref(FirebaseService.getFirebaseUrl());
                // var refCurrentUser = Ref.child(FirebaseService.getFirebaseChild('logged_in_users') + firebaseUser.uid);
                //
                // refCurrentUser.set({ 'Token' : sessionToken });
                //
                // // Evoke an observer function in mainController
                // $rootScope.$emit("MonitorLoggedInUsers", firebaseUser.uid);

                UserAuthorizationInfo.setUserAuthData(firebaseUser.uid, EncryptionService.hash(vm.password), undefined, sessionToken, vm.email);

                var lastActive = new Date();
                lastActive = lastActive.getTime();

                var authenticationToLocalStorage={
                    UserName:firebaseUser.uid,
                    Email: vm.email,
                    Token:sessionToken,
                    LastActive: lastActive
                };

                window.sessionStorage.setItem('UserAuthorizationInfo', JSON.stringify(authenticationToLocalStorage));
                window.localStorage.setItem('Email', vm.email);

                // If user sets not trusted remove the local storage as to not continue to the next part which skips the security question
                if (!vm.trusted) {
                    window.localStorage.removeItem('Email');
                    window.localStorage.removeItem("deviceID");
                    window.localStorage.removeItem(UserAuthorizationInfo.getUsername()+"/securityAns");
                }

                var deviceID = localStorage.getItem("deviceID");

                //if the device was a previously trusted device, and is still set to trusted...
                if (deviceID){
                    var ans = EncryptionService.decryptDataWithKey(localStorage.getItem(UserAuthorizationInfo.getUsername()+"/securityAns"), UserAuthorizationInfo.getPassword());
                    EncryptionService.setSecurityAns(ans);

                    //Now that we know that both the password and security answer are hashed, we can create our encryption hash
                    EncryptionService.generateEncryptionHash();

                    UUID.setUUID(deviceID);
                    DeviceIdentifiers.sendIdentifiersToServer()
                        .then(function () {
                            $state.go('loading');
                        })
                        .catch(function (error) {
                            //TODO: handle this error better... need to know the error object that is returned
                            handleError('SERVERERROR')
                        });

                } else {

                    //if using a web browers (via demo or testing)
                    if (!Constants.app) UUID.setUUID(UUID.generate());

                    //send new device ID which maps to a security question in the backend
                    DeviceIdentifiers.sendFirstTimeIdentifierToServer()
                        .then(function (response) {
                            vm.loading = false;
                            //if all goes well, take the user to be asked security question
                            var language = UserPreferences.getLanguage();
                            if(!language) language = 'EN';
                            initNavigator.pushPage('./views/login/security-question.html', {
                                securityQuestion: response.Data.securityQuestion["securityQuestion_" + language],
                                trusted: vm.trusted
                            });
                        })
                        .catch(function () {
                            $timeout(function(){
                                vm.loading = false;
                                initNavigator.popPage();
                            });
                        });
                }
            });
        }

        function handleError(error)
        {
            switch (error.code) {
                case "auth/invalid-email":
                case "auth/wrong-password":
                case "auth/user-not-found":
                    $timeout(function(){
                        vm.alert.type='danger';
                        vm.alert.message="INVALID_EMAIL_OR_PWD";
                        vm.loading = false;
                    });
                    break;
                case "auth/too-many-requests":
                    $timeout(function () {
                        vm.alert.type='danger';
                        vm.alert.message="TOO_MANY_REQUESTS";
                        vm.loading = false;
                    });
                    break;
                case "LIMITS_EXCEEDED":
                    $timeout(function(){
                        vm.alert.type='danger';
                        vm.alert.message="LIMITS_EXCEEDED";
                        vm.loading = false;
                    });
                    break;
                default:
                    $timeout(function(){
                        vm.alert.type='danger';
                        vm.alert.message="SERVER_ERROR";
                        vm.loading = false;
                    });
            }
        }


        /*************************
         *  PUBLIC METHODS
         *************************/

        function clearErrors(){
            $timeout(function(){
                vm.alert.type = null;
                vm.alert.message = null;
            });
        }

        function submit() {
            clearErrors();
            if(!vm.email || vm.email === '' || !vm.password || vm.password ==='')
            {
                $timeout(function(){
                    vm.alert.type='danger';
                    vm.alert.message="INVALID_EMAIL_OR_PWD";
                });
            }else{
                vm.loading = true;

                //the user is still logged in if this is present
                var authDetails = window.sessionStorage.getItem('UserAuthorizationInfo');
                var stillActive = false;

                if (authDetails) {
                    var now = new Date();
                    now = now.getTime();
                    var tenMinutesAgo = now - 600000;
                    authDetails = JSON.parse(authDetails);
                    stillActive = (authDetails.LastActive > tenMinutesAgo);
                }

                /*  Check if signed in (myAuth not undefined),
                 *  check if data is still in memory (patientSerNum not undefined),
                 *  check if there is any stored data (authDetails)
                 *  check if user trying to login is the same as locked out user
                 */

                // Get the authentication state
                var myAuth = firebase.auth().currentUser;

                if(myAuth && patientSerNum && stillActive && authDetails.Email === vm.email && vm.trusted){
                    firebase.auth().signInWithEmailAndPassword(vm.email, vm.password)
                        .then(function () {
                            $state.go('Home');
                        }).catch(handleError);

                } else{
                    firebase.auth().signInWithEmailAndPassword(vm.email, vm.password).then(authHandler).catch(handleError);
                }
            }
        }
    }
})();
