/*
 *Code by David Herrera May 20, 2015
 *Github: dherre3
 *Email:davidfherrerar@gmail.com
 */

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('MainController', MainController);

    MainController.$inject = ["$window", "$state", '$rootScope','FirebaseService','DeviceIdentifiers','$translatePartialLoader', "LocalStorage", 'Constants', 'CleanUp', 'NavigatorParameters', 'NetworkStatus', 'RequestToServer'];

    /* @ngInject */
    function MainController($window, $state, $rootScope, FirebaseService, DeviceIdentifiers, $translatePartialLoader, LocalStorage, Constants, CleanUp, NavigatorParameters, NetworkStatus, RequestToServer) {

        var vm = this;
        var timeoutLockout;

        activate();
        //////////////////////////////////////////

        function activate(){
            $rootScope.firstTime = true;
            $rootScope.online = navigator.onLine;

            bindEvents();
            setPushPermissions();
            DeviceIdentifiers.setDeviceIdentifiers();

        }

        function bindEvents(){
            //var myDataRef = new Firebase(FirebaseService.getFirebaseUrl());
            //Listen to authentication state, if user get's unauthenticated log user out
            firebase.auth().onAuthStateChanged(function(authData){
                var  authInfoLocalStorage= window.sessionStorage.getItem('UserAuthorizationInfo');
                if(!authData)
                {
                    if($state.current.name ==='Home')
                    {
                        $state.go('logOut');
                    }else if(authInfoLocalStorage)
                    {
                        LocalStorage.resetUserLocalStorage();
                    }
                }
            });

            /*****************************************
             * Check for online activity when the app starts
             *****************************************/
            $window.addEventListener("offline", function() {
                $rootScope.$apply(function() {
                    $rootScope.online = false;
                    NetworkStatus.setStatus(false);
                });
            }, false);

            $window.addEventListener("online", function() {
                $rootScope.$apply(function() {
                    $rootScope.online = true;
                    NetworkStatus.setStatus(true);
                });
            }, false);

            setupInactivityChecks();

            $translatePartialLoader.addPart('top-view');

            document.addEventListener("pause", onPause, false);

            // $rootScope.$on("MonitorLoggedInUsers", function(event, uid){
            //     addUserListener(uid);
            // });
        }

        /*****************************************
         * Lockout
         *****************************************/
        //TimeoutID for locking user out
        function setupInactivityChecks() {
            addEventListener('touchstart',resetTimer,false);
            addEventListener("mousedown", resetTimer, false);
            startTimer();
        }



        function startTimer() {
            timeoutLockout = window.setTimeout(goInactive, 300000);
        }

        function resetTimer(e) {
            window.clearTimeout(timeoutLockout);
            goActive();
        }

        function goInactive() {
            resetTimer();
            if($state.current.name ==='Home')
            {
                $state.go('init');
                localStorage.setItem('locked',1);
            }
        }

        function goActive() {
            startTimer();
        }


        /*****************************************
         * Push Notifications
         *****************************************/
        function setPushPermissions(){
            if(Constants.app)
            {

                PushNotification.hasPermission(function(data) {
                    if (data.isEnabled) {
                    }
                });

                var push = PushNotification.init({
                    ios: {
                        alert: true,
                        badge: true,
                        sound: true
                    },
                    android: {
                        icon: "opal_notification",
                        iconColor: "#74A333",
                        senderID: "810896751588"
                    }
                });

                push.on('notification', function(data) {
                });
                push.on('error', function(e) {
                });
                push.on('registration', function(data) {
                    DeviceIdentifiers.updateRegistrationId(data.registrationId);
                });
            }
        }


        /*****************************************
         * Data wipe
         *****************************************/
        function onPause() {
            var currentPage = NavigatorParameters.getNavigator().getCurrentPage().name;
            // Check that the current location is either documents or lab
            if (currentPage.indexOf('my-chart') !== -1 || currentPage.indexOf('lab') !== -1){
                NavigatorParameters.getNavigator().resetToPage('./views/personal/personal.html');
            }
            // Wipe documents and lab-results
            CleanUp.clearSensitive();
        }

        /*****************************************
         * Manage concurrent users
         *****************************************/
        // function addUserListener(uid){
        //     //add a listener to the firebase database that watches for the changing of the token value (this means that the same user has logged in somewhere else)
        //     var refCurrentUser = firebase.database().ref(FirebaseService.getFirebaseUrl('logged_in_users/') + uid);
        //
        //     refCurrentUser.on('value', function() {
        //         if(!$rootScope.firstTime){
        //             //If it is detected that a user has concurrently logged on with a different device. Then force the "first" user to log out and clear the observer
        //             RequestToServer.sendRequest('Logout');
        //             CleanUp.clear();
        //         }
        //         else{
        //             $rootScope.firstTime = false;
        //         }
        //     });
        // }
    }
})();