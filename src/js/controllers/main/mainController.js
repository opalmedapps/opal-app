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

    MainController.$inject = ["$window", "$state", '$rootScope','FirebaseService','DeviceIdentifiers',
        '$translatePartialLoader', "LocalStorage", 'Constants', 'CleanUp',
        'NavigatorParameters', 'NetworkStatus', 'RequestToServer', 'NewsBanner', 'Security', '$filter', 'Params'];

    /* @ngInject */
    function MainController($window, $state, $rootScope, FirebaseService, DeviceIdentifiers,
                            $translatePartialLoader, LocalStorage, Constants, CleanUp,
                            NavigatorParameters, NetworkStatus, RequestToServer, NewsBanner, Security, $filter, Params) {

        var timeoutLockout;
        var currentTime;
       // var maxIdleTimeAllowed = 300000;    // 1000 = 1 second;   300000 = 300 seconds = 5 minutes

        activate();

        //////////////////////////////////////////

        function activate() {
            $rootScope.firstTime = true;
            $rootScope.online = navigator.onLine;

            currentTime = Date.now();

            bindEvents();
            setPushPermissions();

            DeviceIdentifiers.setDeviceIdentifiers();

        }

        function bindEvents() {
            $translatePartialLoader.addPart('top-view');

            //Listen to authentication state, if user get's unauthenticated log user out
            firebase.auth().onAuthStateChanged(function (authData) {
                var authInfoLocalStorage = window.sessionStorage.getItem('UserAuthorizationInfo');
                if (!authData) {
                    if ($state.current.name === 'Home') {
                        $state.go('logOut');
                    } else if (authInfoLocalStorage) {
                        LocalStorage.resetUserLocalStorage();
                    }
                }
            });

            /*****************************************
             * Check for online activity when the app starts
             *****************************************/
            $window.addEventListener("offline", function () {
                $rootScope.$apply(function () {
                    $rootScope.online = false;
                    NetworkStatus.setStatus(false);
                });
            }, false);

            $window.addEventListener("online", function () {
                $rootScope.$apply(function () {
                    $rootScope.online = true;
                    NetworkStatus.setStatus(true);
                });
            }, false);

            setupInactivityChecks();

            addiOSscreenshotDetection();

            addUpdateRequiredDetection();

            document.addEventListener("pause", onPause, false);

            $rootScope.$on("MonitorLoggedInUsers", function (event, uid) {
                $rootScope.firstTime = true;
                addUserListener(uid);
            });
        }

        /*****************************************
         * Lockout
         *****************************************/
        //TimeoutID for locking user out
        function setupInactivityChecks() {
            addEventListener('touchstart', resetTimer, false);
            addEventListener("mousedown", resetTimer, false);

            startTimer();
        }


        function startTimer() {
            timeoutLockout = window.setTimeout(goInactive, Params.maxIdleTimeAllowed);
        }

        function resetTimer() {

            if (Date.now() - currentTime > Params.maxIdleTimeAllowed) {
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
            if ($state.current.name === 'Home') {
                $state.go('logOut');   // It should go to a Logout (not 'init'). Logout will trigger CleanUp.clear() function and other necessary clean ups
//                $state.go('init');
                localStorage.setItem('locked', 1);
            }
        }

        function goActive() {
            startTimer();
        }


        /*****************************************
         * Push Notifications
         *****************************************/
        function setPushPermissions() {
            if (Constants.app) {

                PushNotification.hasPermission(function (data) {
                    if (data.isEnabled) {
                    }
                });

                // forceShow: "true" in Android will allow push notification to appear even when app is running

                var push = PushNotification.init({
                    ios: {
                        alert: true,
                        badge: true,
                        sound: true
                    },
                    android: {
                        icon: "opal_notification",
                        iconColor: "#74A333",
                        // senderID: "810896751588",   // PRODUCTION
                        // senderID: "476395494069",   // pre-prod
                        forceShow: "true"
                    }
                });

                push.on('notification', function (data) {
                    if (ons.platform.isIOS() && data.additionalData.foreground) {
                        // on iOS, it will allow push notification to appear when app is running
						NewsBanner.showCustomBanner(data.title + "\n" + data.message, '#333333', '#F0F3F4', 13, 'top', function(){}, 9000);
                        navigator.vibrate(3000);
                    }
                });
                push.on('error', function (e) {
                });
                push.on('registration', function (data) {
                    DeviceIdentifiers.updateRegistrationId(data.registrationId);
                });
            }
        }

        /*****************************************
         * Data wipe  - onPause event is triggered when the app goes in the background (switch apps on a device)
         *****************************************/
        function onPause() {
            var currentPage = NavigatorParameters.getNavigator().getCurrentPage().name;
            // Check that the current location is either documents or lab
            if (currentPage.indexOf('my-chart') !== -1 || currentPage.indexOf('lab') !== -1) {
                NavigatorParameters.getNavigator().resetToPage('./views/personal/personal.html');
            }

            // Wipe documents and lab-results
            CleanUp.clearSensitive();
        }


        /*****************************************
         * Manage concurrent users
         *****************************************/
        function addUserListener(uid) {
            //
            // add a listener to the firebase database that watches for the changing of the token value
            // (this means that the same user has logged in somewhere else)
            //
            let refCurrentUser = FirebaseService.getDBRef(FirebaseService.getFirebaseChild('logged_in_users') + uid);

            refCurrentUser.on('value', function () {
                if (!$rootScope.firstTime && !localStorage.getItem('locked')) {
                    //
                    // If it is detected that a user has concurrently logged on with a different device.
                    // Then force the "first" user to log out and clear the observer
                    //
                    RequestToServer.sendRequest('Logout');
                    CleanUp.clear();

                    // Show message "You have logged in on another device."
					NewsBanner.showCustomBanner($filter('translate')("KICKEDOUT"), '#333333', '#F0F3F4', 13, 'top', function () {}, 5000);
                    refCurrentUser.off();
                    $state.go('init');
                }
                else {
                    $rootScope.firstTime = false;
                }
            });
        }


        /**************************************************
         * Detect When Screenshot is taken on iOS device
         * (we cannot block screenshots on iOS. We can only detect if user has just taken a screenshot)
         *************************************************/
        function addiOSscreenshotDetection() {
            window.addEventListener('screenshotDidTake', onScreenshotDidTake, false);

            function onScreenshotDidTake() {
                screenshotTakenModal.show();
            }

        }


        /*****************************************
         * Update-Required Modal
         *****************************************/
        function addUpdateRequiredDetection(){
            Security.register('validVersion', showVersionUpdateScreen)
        }

        function showVersionUpdateScreen(){
            loadingmodal.hide();
            updateRequiredModal.show();
            $state.go('init')
        }
    }
})();
