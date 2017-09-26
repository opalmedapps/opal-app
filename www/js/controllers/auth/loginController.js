/*
 *Code by David Herrera May 20, 2015
 *Github: dherre3
 *Email:davidfherrerar@gmail.com
 */
(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['$scope','$timeout', '$rootScope', '$state',
        'UserAuthorizationInfo', 'FirebaseService', '$filter','DeviceIdentifiers', 'UserPreferences', 'Patient',
        'NewsBanner', 'UUID', 'Constants', 'EncryptionService', 'CleanUp'];

    /* @ngInject */
    function LoginController($scope, $timeout, $rootScope, $state, UserAuthorizationInfo, FirebaseService,
                             $filter,DeviceIdentifiers, UserPreferences, Patient, NewsBanner, UUID, Constants, EncryptionService, CleanUp) {

        var vm = this;
        vm.loading = false;
        vm.email = "";
        vm.password = "";
        vm.alert = {
            type: "",
            message: ""
        };

        vm.trusted = false;

        var patientSerNum = "";

        vm.clearErrors = clearErrors;
        vm.submit = submit;

        activate();
        //////////////////////////////////

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
            if(typeof patientSerNum !=='undefined' && patientSerNum) NewsBanner.showCustomBanner($filter('translate')('LOCKEDOUT'),'black', null, 2000);

            // Switch for trusting device
            vm.trusted = !!(localStorage.getItem("deviceID"));
        }

        function clearErrors(){
            if(vm.alert.hasOwnProperty('type'))
            {
                delete vm.alert.type;
                delete vm.alert.message;
            }
        }

        function submit() {
            clearErrors();
            if(typeof vm.email==='undefined'||vm.email ==='' || typeof vm.password==='undefined'|| vm.password ==='')
            {
                $timeout(function(){
                    vm.alert.type='danger';
                    vm.alert.content="INVALID_EMAIL_OR_PWD";
                });
            }else{
                vm.loading = true;
                var authDetails = window.localStorage.getItem('UserAuthorizationInfo');
                if (authDetails) authDetails = JSON.parse(authDetails);

                /*  Check if signed in (myAuth not undefined),
                 *  check if data is still in memory (patientSerNum not undefined),
                 *  check if there is any stored data (authDetails)
                 *  check if user trying to login is the same as locked out user
                 */

                // Get the authentication state
                var myAuth = firebase.auth().currentUser;

                if(myAuth && patientSerNum && authDetails && authDetails.Email===vm.email && vm.trusted){
                    firebase.auth().signInWithEmailAndPassword(vm.email, vm.password)
                        .then(function () {
                            vm.loading = false;
                            $state.go('Home');
                        }).catch(handleError);

                } else{
                    firebase.auth().signInWithEmailAndPassword(vm.email, vm.password).then(authHandler).catch(handleError);
                }
            }
        }

        //Handles authentication and next steps
        function authHandler(firebaseUser) {

            CleanUp.clear();

            firebaseUser.getIdToken(true).then(function(sessionToken){

                //Save the current session token to the users "logged in users" node. This is used to make sure that the user is only logged in for one session at a time.
                var Ref= firebase.database().ref(FirebaseService.getFirebaseUrl());
                var refCurrentUser = Ref.child(FirebaseService.getFirebaseChild('logged_in_users') + firebaseUser.uid);

                refCurrentUser.set({ 'Token' : sessionToken });

                // Evoke an observer function in mainController
                $rootScope.$emit("MonitorLoggedInUsers", firebaseUser.uid);

                UserAuthorizationInfo.setUserAuthData(firebaseUser.uid, EncryptionService.hash(vm.password), undefined, sessionToken, vm.email);

                var authenticationToLocalStorage={
                    UserName:firebaseUser.uid,
                    Password: undefined,
                    Email: vm.email,
                    Token:sessionToken
                };

                window.localStorage.setItem('UserAuthorizationInfo', JSON.stringify(authenticationToLocalStorage));
                window.localStorage.setItem('Email', vm.email);

                // If user sets not trusted remove the localstorage
                if (!vm.trusted) {
                    localStorage.removeItem("deviceID");
                    localStorage.removeItem(UserAuthorizationInfo.getUsername()+"/securityAns");
                }

                var deviceID;
                if (deviceID = localStorage.getItem("deviceID")){

                    var ans = EncryptionService.decryptDataWithKey(localStorage.getItem(UserAuthorizationInfo.getUsername()+"/securityAns"), UserAuthorizationInfo.getPassword());
                    EncryptionService.setSecurityAns(ans);

                    //Now that we know that both the password and security answer are hashed, we can create our encryption hash
                    EncryptionService.generateEncryptionHash();

                    UUID.setUUID(deviceID);
                    DeviceIdentifiers.sendIdentifiersToServer()
                        .then(function () {
                            vm.loading = false;
                            $state.go('loading');
                        })
                        .catch(function (error) {
                            vm.loading = false;

                            //TODO: handle this error better... need to know the error object that is returned
                            console.log(error);
                        });

                } else {
                    if (!Constants.app) UUID.setUUID(UUID.generate());
                    DeviceIdentifiers.sendFirstTimeIdentifierToServer()
                        .then(function (response) {
                            vm.loading = false;
                            initNavigator.pushPage('./views/login/security-question.html', {
                                securityQuestion: response.Data.securityQuestion["securityQuestion_" + UserPreferences.getLanguage()],
                                trusted: vm.trusted
                            });
                        })
                        .catch(function () {
                            vm.loading = false;
                            initNavigator.popPage();
                        });
                }
            });
        }

        function handleError(error)
        {
            $scope.loading = false;
            $scope.alert.type='danger';

            switch (error.code) {
                case "auth/invalid-email":
                case "auth/wrong-password":
                case "auth/user-not-found":
                    $timeout(function(){
                        $scope.alert.content="INVALID_EMAIL_OR_PWD";
                        vm.loading = false;
                    });
                    break;
                case "auth/too-many-requests":
                    $timeout(function () {
                        $scope.alert.content="TOO_MANY_REQUESTS";
                        vm.loading = false;
                    });
                    break;
                case "LIMITS_EXCEEDED":
                    $timeout(function(){
                        $scope.alert.content="LIMITS_EXCEEDED";
                        vm.loading = false;
                    });
                    break;
            }
        }

    }
})();
