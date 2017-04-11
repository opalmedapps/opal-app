/*
 *Code by David Herrera May 20, 2015
 *Github: dherre3
 *Email:davidfherrerar@gmail.com
 */

angular.module('MUHCApp').controller('MainController', ["$state",'$timeout', '$rootScope','FirebaseService',
    'NativeNotification','DeviceIdentifiers','$translatePartialLoader','NewsBanner',
    "UpdateUI","Patient","LocalStorage", 'Constants', 'CleanUp', 'NavigatorParameters',
    function ($state,$timeout,$rootScope,FirebaseService,NativeNotification,
              DeviceIdentifiers,$translatePartialLoader,NewsBanner,
              UpdateUI,Patient,LocalStorage, Constants, CleanUp, NavigatorParameters) {


        //var myDataRef = new Firebase(FirebaseService.getFirebaseUrl());
        //Listen to authentication state, if user get's unauthenticated log user out
        firebase.auth().onAuthStateChanged(function(authData){
            var  authInfoLocalStorage=window.localStorage.getItem('UserAuthorizationInfo');
            if(!authData)
            {
                if($state.current.name=='Home')
                {
                    console.log('here state');
                    $state.go('logOut');
                }else if(authInfoLocalStorage)
                {
                    LocalStorage.resetUserLocalStorage();
                }
            }
        });

        /*****************************************
         * Refresh Data (Not working)
         *****************************************/

        //Ask for an update every 2 minutes
        setInterval(function()
        {
            //console.log("calling  refresh bg");
            backgroundRefresh();
        },120000);


        //On resume, make a background refresh check.
        document.addEventListener("resume", onResume, false);
        function onResume() {
            console.log("Called resume")
            setTimeout(function() {
                backgroundRefresh();
            });
        }
        var serialNum = Patient.getUserSerNum();
        function backgroundRefresh()
        {
            if(FirebaseService.getAuthenticationCredentials()&&typeof serialNum !=='undefined'&&serialNum)
            {
                console.log('refreshing');
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
            if($state.current.name=='Home')
            {

                $state.go('init');
                localStorage.setItem('locked',1);
                //window.localStorage.removeItem('OpalAdminPanelPatient');
                //window.localStorage.removeItem('OpalAdminPanelUser');
                console.log('Going inactive');
            }

            //location.reload();
        }

        function goActive() {
            // do something
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
    }]);
