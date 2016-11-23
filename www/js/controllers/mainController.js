/*
 *Code by David Herrera May 20, 2015
 *Github: dherre3
 *Email:davidfherrerar@gmail.com
 */

angular.module('MUHCApp').controller('MainController', ["$state",'$timeout', '$rootScope','FirebaseService','NativeNotification','DeviceIdentifiers','$translatePartialLoader','NewsBanner', "UpdateUI","Patient","LocalStorage",function ($state,$timeout,$rootScope,FirebaseService,NativeNotification,DeviceIdentifiers,$translatePartialLoader,NewsBanner,UpdateUI,Patient,LocalStorage) {
   

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
            console.log('refreshing');
            UpdateUI.update('All');
        }
    }
//TimeoutID for locking user out
    var timeoutID;
    function setupInactivityChecks() {
        this.addEventListener('touchstart',resetTimer,false);
        this.addEventListener("mousedown", resetTimer, false);
        startTimer();
    }

    setupInactivityChecks();

    function startTimer() {

        // wait 2 seconds before calling goInactive
        timeoutID = window.setTimeout(goInactive, 300000);
    }

    function resetTimer(e) {
        console.log('resetting timer');
        window.clearTimeout(timeoutID);

        goActive();
    }

    function goInactive() {
        console.log('Currently going inactive');
        resetTimer();
        if($state.current.name=='Home')
        {

            $state.go('init');
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
    var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
    if(app)
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
        //dX5oUernHF4:APA91bEWkdACR0Ra81mAECXn5rPNyoUYx3ijC9UdzJ_26MqjYa0OBaQRzD2n7VCk_PCcsnvsZz7bEA5Aq1pSV9iABRxSPCjFlBJh7ogiqWs8Ex4COf7H2xWHrz_16CJMlNKljffpNf8q
        push.on('notification', function(data) {

            //Need to check if logged in, locked out and what to do in each case.

            //NativeNotification.showNotificationAlert(data.message);
            console.log(data);
        });
        push.on('error', function(e) {
            console.log(e);
        });
        /*push.setApplicationIconBadgeNumber(function() {
            console.log('success');
        }, function() {
            console.log('error');
        }, 3);*/

        push.on('registration', function(data) {
            console.log(data.registrationId);
            DeviceIdentifiers.setDeviceIdentifiers(data.registrationId);
        });
        /*document.addEventListener("offline", function(){
            NewsBanner.showAlert('nointernet');
            console.log('offline');
        }, false);
        document.addEventListener("online", function(){
            NewsBanner.showAlert('connected');
            console.log('online');
        }, false);*/
    }/*else{
        window.addEventListener('online',  function(){
            console.log('online');
            $rootScope.alertBanner = 'connected';
        });
        window.addEventListener('offline', function(){
            console.log('offline');
            $rootScope.alertBanner = 'nointernet';
        });
    }*/

    //Firebase.getDefaultConfig().setPersistenceEnabled(true);
}]);
