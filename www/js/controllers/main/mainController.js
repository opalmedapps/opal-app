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

    MainController.$inject = ["$window", "$state", '$rootScope','FirebaseService','DeviceIdentifiers','$translatePartialLoader', "LocalStorage", 'Constants', 'CleanUp', 'NavigatorParameters', 'NetworkStatus', 'RequestToServer', 'NewsBanner'];

    /* @ngInject */
    function MainController($window, $state, $rootScope, FirebaseService, DeviceIdentifiers, $translatePartialLoader, LocalStorage, Constants, CleanUp, NavigatorParameters, NetworkStatus, RequestToServer, NewsBanner) {

        var vm = this;
        var timeoutLockout;

        var currentTime;
        var currentlyHidden = false;

        activate();
        //////////////////////////////////////////

        function activate(){
            $rootScope.firstTime = true;
            $rootScope.online = navigator.onLine;

            currentTime = Date.now();

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

            addBackgroundDetection();

            $translatePartialLoader.addPart('top-view');

            document.addEventListener("pause", onPause, false);

            $rootScope.$on("MonitorLoggedInUsers", function(event, uid){
                $rootScope.firstTime = true;
                addUserListener(uid);
            });
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

        function resetTimer() {

            if(Date.now() - currentTime > 300000) {
                currentTime = Date.now();
                goInactive();
                return;
            }

            currentTime = Date.now();
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
        function addUserListener(uid){
            //add a listener to the firebase database that watches for the changing of the token value (this means that the same user has logged in somewhere else)
            var Ref= firebase.database().ref(FirebaseService.getFirebaseUrl(null));
            var refCurrentUser = Ref.child(FirebaseService.getFirebaseChild('logged_in_users') + uid);

            refCurrentUser.on('value', function() {
                if(!$rootScope.firstTime && !localStorage.getItem('locked')){
                    //If it is detected that a user has concurrently logged on with a different device. Then force the "first" user to log out and clear the observer
                    RequestToServer.sendRequest('Logout');
                    CleanUp.clear();
                    NewsBanner.showCustomBanner("You have logged in on another device.", '#333333', function(){}, 5000);
                    refCurrentUser.off();
                    $state.go('init');
                }
                else{
                    $rootScope.firstTime = false;
                }
            });
        }

        /*****************************************
         * Background Splash Screen
         *****************************************/
        function addBackgroundDetection(){
            var hidden = "hidden";

            // Standards:
            if (hidden in document)
                document.addEventListener("visibilitychange", onchange);
            else if ((hidden = "mozHidden") in document)
                document.addEventListener("mozvisibilitychange", onchange);
            else if ((hidden = "webkitHidden") in document)
                document.addEventListener("webkitvisibilitychange", onchange);
            else if ((hidden = "msHidden") in document)
                document.addEventListener("msvisibilitychange", onchange);
            // IE 9 and lower:
            else if ("onfocusin" in document)
                document.onfocusin = document.onfocusout = onchange;
            // All others:
            else
                window.onpageshow = window.onpagehide
                    = window.onfocus = window.onblur = onchange;

            function onchange () {
                if (document[hidden]){
                    showSplashScreen()
                } else {
                    hideSplashScreen()
                }
            }

            // set the initial state (but only if browser supports the Page Visibility API)
            if( document[hidden] !== undefined )
                onchange();
        }
    }

    function hideSplashScreen(){
        setTimeout(function(){
            backsplashmodal.hide();
            console.log("hidden")
        }, 1000)

    }

    function showSplashScreen(){
        backsplashmodal.show();
        console.log("visible")
    }
})();