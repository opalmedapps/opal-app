angular.module('MUHCApp').controller('MainController', ["$state",'$timeout', '$rootScope','FirebaseService','NativeNotification','DeviceIdentifiers','$translatePartialLoader','NewsBanner', function ($state,$timeout,$rootScope,FirebaseService,NativeNotification,DeviceIdentifiers,$translatePartialLoader,NewsBanner) {
//     var timeoutID;

// function setup() {
//     this.addEventListener('touchstart',resetTimer,false);
//     this.addEventListener('touchend',resetTimer,false);
//     this.addEventListener("mousemove", resetTimer, false);
//     this.addEventListener("mousedown", resetTimer, false);

//     startTimer();
// }
// setup();

// function startTimer() {
    
//     // wait 2 seconds before calling goInactive
//     timeoutID = window.setTimeout(goInactive, 300000);
// }

// function resetTimer(e) {
//     console.log(e.type);
//     window.clearTimeout(timeoutID);

//     goActive();
// }

// function goInactive() {
//     //window.localStorage.removeItem('OpalAdminPanelPatient');
//     //window.localStorage.removeItem('OpalAdminPanelUser');
//     location.reload();
// }

// function goActive() {
//     // do something

//     startTimer();
// }

    $translatePartialLoader.addPart('top-view');
    //$state.transitionTo('logIn');
    var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
    if(app)
    {
        var push = PushNotification.init({
            ios: {
                alert: "true",
                badge: true,
                sound: 'true',
                clearBadge:'true'
            },
             android: {
                senderID: "840430637971"
            }
        });
        //dX5oUernHF4:APA91bEWkdACR0Ra81mAECXn5rPNyoUYx3ijC9UdzJ_26MqjYa0OBaQRzD2n7VCk_PCcsnvsZz7bEA5Aq1pSV9iABRxSPCjFlBJh7ogiqWs8Ex4COf7H2xWHrz_16CJMlNKljffpNf8q
        push.on('notification', function(data) {
          NativeNotification.showNotificationAlert(data.message);
            var urlMedia = 'sounds/'+data.sound;
            var media = new Media(urlMedia);
            media.play();
            console.log(data.message);
            media.play({ numberOfLoops: 2 });
            console.log(data.title);
            console.log(data.count);
            console.log(data.sound);
            console.log(data.image);
            console.log(data.additionalData);
        });
        push.on('error', function(e) {
            console.log(e);
        });
        push.setApplicationIconBadgeNumber(function() {
            console.log('success');
        }, function() {
            console.log('error');
        }, 3);
        PushNotification.hasPermission(function(data) {
            if (data.isEnabled) {
                console.log('isEnabled');
            }
        });
        push.on('registration', function(data) {
            console.log(data.registrationId);
            DeviceIdentifiers.setDeviceIdentifiers(data.registrationId);
        });
      document.addEventListener("offline", function(){
        NewsBanner.showAlert('nointernet');
        console.log('offline');
      }, false);
      document.addEventListener("online", function(){
        NewsBanner.showAlert('connected');
        console.log('online');
      }, false);
    }else{
      window.addEventListener('online',  function(){
        console.log('online');
        $timeout(function()
        {
            $rootScope.alertBanner = 'connected';
        })
      });
      window.addEventListener('offline', function(){
        console.log('offline');
        $timeout(function()
        {
            $rootScope.alertBanner = 'nointernet';   
        })
        
      });
    }

    //Firebase.getDefaultConfig().setPersistenceEnabled(true);
}]);
