/*
 *Code by David Herrera May 20, 2015
 *Github: dherre3
 *Email:davidfherrerar@gmail.com
 */

angular.module('MUHCApp').controller('MainController', ["$window", "$state",'$timeout', '$rootScope','FirebaseService',
    'NativeNotification','DeviceIdentifiers','$translatePartialLoader',
    "UpdateUI","Patient","LocalStorage", 'Constants', 'CleanUp', 'NavigatorParameters', 'NetworkStatus', 'RequestToServer',
    function ($window, $state,$timeout,$rootScope,FirebaseService,NativeNotification,
              DeviceIdentifiers,$translatePartialLoader,
              UpdateUI,Patient,LocalStorage, Constants, CleanUp, NavigatorParameters, NetworkStatus, RequestToServer) {


       $rootScope.firstTime = true;


        //var myDataRef = new Firebase(FirebaseService.getFirebaseUrl());
        //Listen to authentication state, if user get's unauthenticated log user out
        firebase.auth().onAuthStateChanged(function(authData){
            var  authInfoLocalStorage=window.localStorage.getItem('UserAuthorizationInfo');
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
        var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;

        $rootScope.online = navigator.onLine;

        $window.addEventListener("offline", function() {
            $rootScope.$apply(function() {
                $rootScope.online = false;
                console.log("offline");
                NetworkStatus.setStatus(false);
            });
        }, false);

        $window.addEventListener("online", function() {
            $rootScope.$apply(function() {
                $rootScope.online = true;
                console.log("online");
                NetworkStatus.setStatus(true);
            });
        }, false);

        /*****************************************
         * Refresh Data (Not working)
         *****************************************/

        //Ask for an update every 2 minutes
        setInterval(function()
        {
            backgroundRefresh();
        },120000);


        //On resume, make a background refresh check.
        document.addEventListener("resume", onResume, false);

        function onResume() {
            setTimeout(function() {
                backgroundRefresh();
            });
        }

        var serialNum = Patient.getUserSerNum();
        function backgroundRefresh()
        {
            if(FirebaseService.getAuthenticationCredentials()&&typeof serialNum !=='undefined'&&serialNum)
            {
                UpdateUI.update('All');
            }
        }

        /*****************************************
         * Lockout
         *****************************************/

            //TimeoutID for locking user out
        var timeoutLockout;
        function setupInactivityChecks() {
            this.addEventListener('touchstart',resetTimer,false);
            this.addEventListener("mousedown", resetTimer, false);
            startTimer();
        }

        setupInactivityChecks();

        function startTimer() {
            timeoutLockout = window.setTimeout(goInactive, 300000);
        }

        function resetTimer(e) {
            //console.log('resetting timer');
            window.clearTimeout(timeoutLockout);

            goActive();
        }

        function goInactive() {
            //console.log('Currently going inactive');
            resetTimer();
            if($state.current.name ==='Home')
            {

                $state.go('init');
                localStorage.setItem('locked',1);
                //window.localStorage.removeItem('OpalAdminPanelPatient');
                //window.localStorage.removeItem('OpalAdminPanelUser');
            }

            //location.reload();
        }

        function goActive() {
            startTimer();
        }

        $translatePartialLoader.addPart('top-view');
        //$state.transitionTo('logIn');

        /*****************************************
         * Push Notifications
         *****************************************/

        if(Constants.app)
        {

            PushNotification.hasPermission(function(data) {
                if (data.isEnabled) {
                    console.log('isEnabled');
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
                console.log(data);
            });
            push.on('error', function(e) {
                console.log(e);
            });

            push.on('registration', function(data) {
                console.log(data.registrationId);
                DeviceIdentifiers.updateRegistrationId(data.registrationId);
            });

        }
        DeviceIdentifiers.setDeviceIdentifiers();

        /*****************************************
         * Data wipe
         *****************************************/

        document.addEventListener("pause", onPause, false);

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
        $rootScope.$on("MonitorLoggedInUsers", function(event, uid){
            addUserListener(uid);
        });


        function addUserListener(uid){
            //add a listener to the firebase database that watches for the changing of the token value (this means that the same user has logged in somewhere else)
            var Ref= firebase.database().ref('dev2/');

            var refCurrentUser = Ref.child('logged_in_users/' + uid);

            refCurrentUser.on('value', function() {

                if(!$rootScope.firstTime){

                    //If it is detected that a user has concurrently logged on with a different device. Then force the "first" user to log out and clear the observer

                    RequestToServer.sendRequest('Logout');

                    CleanUp.clear();

                    // FirebaseService.getAuthentication().$signOut();
                    console.log($state.go('init'));
                }
                else{
                    $rootScope.firstTime = false;
                }

            });
        }
    }]);
