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

    MainController.$inject = ["$window", "$state", '$rootScope','Firebase','DeviceIdentifiers',
        '$translatePartialLoader', "LocalStorage", 'Constants', 'CleanUp', 'Navigator', 'NetworkStatus',
        'RequestToServer', 'Toast', 'Security', '$filter', 'Params', 'LogOutService', 'AppState'];

    /* @ngInject */
    function MainController($window, $state, $rootScope, Firebase, DeviceIdentifiers,
                            $translatePartialLoader, LocalStorage, Constants, CleanUp, Navigator, NetworkStatus,
                            RequestToServer, Toast, Security, $filter, Params, LogOutService, AppState) {

        var timeoutLockout;

        activate();

        //////////////////////////////////////////

        function activate() {
            $rootScope.online = navigator.onLine;

            bindEvents();
            setPushPermissions();

            /*
                Detect jailbroken and rooted devices and prevent continuing.
                Suggested in the pentest report 2023.
                Note that this is not a fool-proof solution and some disagree whether it should be done at all.
                See: https://developer.apple.com/forums/thread/66363#191199022
            */
            if (Constants.app) {
                IRoot.isRooted(jailbreakOrRootedDevice, console.error);
            }

            DeviceIdentifiers.setDeviceIdentifiers();
        }

        function bindEvents() {
            $translatePartialLoader.addPart('top-view');

            // Listen to the Firebase authentication state; if the user gets unauthenticated, print a message
            // Actual handling should be done in the code that unauthenticated the user; this message is just to be aware if the unauthentication happens unexpectedly
            Firebase.onAuthStateChanged(function (authData) {
                if (!authData) {
                    console.log('Firebase authentication null state; currently authenticated user:', Firebase.getCurrentUser());
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

                // Display a warning message to the users after being disconnected
                Toast.showToast({
                    message: $filter('translate')("INACTIVE"),
                    positionOffset: 30,
                });
            }
        }

        function jailbreakOrRootedDevice(detected) {
            console.log('jailbreak or rooted device detection result', detected);
            if (detected) {
                loadingmodal.hide();
                jailbreakModal.show();
                $state.go('init');
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
                push.on('error', console.error);
                push.on('registration', function (data) {
                    DeviceIdentifiers.updateRegistrationId(data.registrationId);
                });
            }
        }

        /*****************************************
         * Clear sensitive data
         *****************************************/
        function clearSensitiveData() {
            var currentPage = Navigator.getNavigator().getCurrentPage().name;
            // Check that the current location is either documents or lab
            if (currentPage.indexOf('my-chart') !== -1 || currentPage.indexOf('lab') !== -1) {
                Navigator.getNavigator().resetToPage('./views/personal/personal.html');
            }

            // Wipe lab results
            CleanUp.clearSensitive();
        }

        /**************************************************
         * Detect When Screenshot is taken on iOS device
         * (we cannot block screenshots on iOS. We can only detect if user has just taken a screenshot)
         *************************************************/
        function addiOSscreenshotDetection() {
            window.addEventListener('screenshotDidTake', onScreenshotDidTake, false);

            function onScreenshotDidTake() {
                if (!CONFIG.settings.screenshotsAllowed) {
                    screenshotTakenModal.show();
                }
            }

        }

        /*****************************************
         * Prevent screenshot being taken on Android device
         * work with the cordova-plugin-prevent-screenshot plugin
         *****************************************/
        function preventAndroidScreenshot() {
            if (Constants.app && ons.platform.isAndroid()) {
                if (CONFIG.settings.screenshotsAllowed) {
                    window.plugins.preventscreenshot.enable(
                        () => console.log('Android screenshot successfully enabled'),
                        (err) => console.log('Android screenshot cannot be enabled:', err)
                    );
                } else {
                    window.plugins.preventscreenshot.disable(
                        () => console.log('Android screenshot successfully disabled'),
                        (err) => console.log('Android screenshot cannot be disabled:', err)
                    );
                }
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
