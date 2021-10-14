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
        '$translatePartialLoader', "LocalStorage", 'Constants', 'CleanUp', 'NavigatorParameters', 'NetworkStatus',
        'RequestToServer', 'Toast', 'Security', '$filter', 'Params', 'LogOutService', 'AppState'];

    /* @ngInject */
    function MainController($window, $state, $rootScope, FirebaseService, DeviceIdentifiers,
                            $translatePartialLoader, LocalStorage, Constants, CleanUp, NavigatorParameters, NetworkStatus,
                            RequestToServer, Toast, Security, $filter, Params, LogOutService, AppState) {

        var timeoutLockout;

        activate();

        //////////////////////////////////////////

        function activate() {
            $rootScope.firstTime = true;
            $rootScope.online = navigator.onLine;

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
                        LogOutService.logOut();
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
            
            addAppInBackgroundScreen();

            setupInactivityChecks();

            addiOSscreenshotDetection();

            preventAndroidScreenshot();

            addUpdateRequiredDetection();

            AppState.addInactiveEvent(clearSensitiveData);

            $rootScope.$on("MonitorLoggedInUsers", function (event, uid) {
                $rootScope.firstTime = true;
                if (OPAL_CONFIG.env !== "staging") {
                    addUserListener(uid);
                }
            });
        }

        /*****************************************
         * Lockout
         *****************************************/

        // Launches a timer and event checks to log out automatically after a period of inactivity
        function setupInactivityChecks() {
            addEventListener('touchstart', resetTimer, false);
            addEventListener("mousedown", resetTimer, false);
            startTimer();
        }
        
        function startTimer() {
            timeoutLockout = window.setTimeout(goInactive, Params.maxIdleTimeAllowed);
        }

        function resetTimer() {
            window.clearTimeout(timeoutLockout);
            startTimer();
        }

        function goInactive() {
            resetTimer();
            if ($state.current.name === 'Home') {
                LogOutService.logOut();  // It should go to a Logout (not 'init'). Logout will trigger CleanUp.clear() function and other necessary clean ups
                localStorage.setItem('locked', 1);

                // Display a warning message to the users after being disconnected
                Toast.showToast({
                    message: $filter('translate')("INACTIVE"),
                    positionOffset: 30,
                });
            }
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
                        Toast.showToast({
                            message: data.title + "\n" + data.message,
                        });
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
         * Clear sensitive data
         *****************************************/
        function clearSensitiveData() {
            var currentPage = NavigatorParameters.getNavigator().getCurrentPage().name;
            // Check that the current location is either documents or lab
            if (currentPage.indexOf('my-chart') !== -1 || currentPage.indexOf('lab') !== -1) {
                NavigatorParameters.getNavigator().resetToPage('./views/personal/personal.html');
            }

            // Wipe lab results
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

                    refCurrentUser.off();
                    LogOutService.logOut();

                    // Show message "You have logged in on another device."
                    Toast.showToast({
                        message: $filter('translate')("KICKEDOUT"),
                    });
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
         * Prevent screenshot being taken on Android device
         * work with the cordova-plugin-prevent-screenshot plugin
         *****************************************/
        function preventAndroidScreenshot() {
            if (Constants.app && ons.platform.isAndroid()) {
                window.plugins.preventscreenshot.disable(
                    (status) => console.log('Android screenshot successfully disabled:', !status), // true - enabled, false - disabled
                    (err) => console.log('Android screenshot cannot be disabled:', err)
                );
            }
        }

        /*****************************************
         * Update-Required Modal
         *****************************************/
        function addUpdateRequiredDetection() {
            Security.register('validVersion', showVersionUpdateScreen)
        }

        function showVersionUpdateScreen() {
            loadingmodal.hide();
            updateRequiredModal.show();
            $state.go('init')
        }
        /**
         * Function takes care of displaying the splash screen when app is placed in the background. Note that this
         * works with the plugin: cordova-plugin-privacyscreen which offers a black screen. This is not so pretty
         * so this code below is an attempt to mitigate that slightly.
         */
        function addAppInBackgroundScreen() {
            if (!Constants.app) return;
            AppState.addInactiveEvent(navigator.splashscreen.show);
            AppState.addActiveEvent(navigator.splashscreen.hide);
        }
    }
})();
