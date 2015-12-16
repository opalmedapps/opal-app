angular.module('MUHCApp')
.factory('pushService', function($q, $window,cordovaDeviceService) {

  var pushConfig = {};
  console.log(cordovaDeviceService.platform());
  if (device.platform == 'android' || device.platform == 'Android') {
    pushConfig = {
      "senderID":"GOOGLE-SERVER-API-KEY",
      "ecb":"onNotificationGCM"
    };
  } else {
    pushConfig = {
      "badge":"true",
      "sound":"true",
      "alert":"true",
      "ecb":"onNotificationAPN"
    };
  }
  
  // handle GCM notifications for Android
  $window.onNotificationGCM = function (event) {
    console.log(event.regid);
    switch (event.event) {
      case 'registered':
        if (event.regid.length > 0) {
          // Your GCM push server needs to know the regID before it can push to this device
          // here is where you might want to send it the regID for later use.
          console.log("regID = " + event.regid);
          var firebaseLink = new Firebase('https://luminous-heat-8715.firebaseio.com/users/' + UserAuthorizationInfo.UserName + '/fields');
          firebaseLink.update({userInfoNotifications:result});

          //send device reg id to server

        }
        break;

      case 'message':
          // if this flag is set, this notification happened while we were in the foreground.
          // you might want to play a sound to get the user's attention, throw up a dialog, etc.
          if (event.foreground) {
            console.log('INLINE NOTIFICATION');
            var my_media = new Media("/android_asset/www/" + event.soundname);
            my_media.play();
          } else {
            if (event.coldstart) {
                console.log('COLDSTART NOTIFICATION');
            } else {
                console.log('BACKGROUND NOTIFICATION');
            }
          }

          navigator.notification.alert(event.payload.message);
          console.log('MESSAGE -> MSG: ' + event.payload.message);
          //Only works for GCM
          console.log('MESSAGE -> MSGCNT: ' + event.payload.msgcnt);
          //Only works on Amazon Fire OS
          console.log('MESSAGE -> TIME: ' + event.payload.timeStamp);
          break;

      case 'error':
          console.log('ERROR -> MSG:' + event.msg);
          break;

      default:
          console.log('EVENT -> Unknown, an event was received and we do not know what it is');
          break;
    }
  };

  // handle APNS notifications for iOS
  $window.successIosHandler = function (result) {
    console.log('result = ' + result);
  };

  $window.onNotificationAPN = function (e) {
    if (e.alert) {
      console.log('push-notification: ' + e.alert);
      navigator.notification.alert(e.alert);
    }

    if (e.sound) {
      var snd = new Media(e.sound);
      snd.play();
    }

    if (e.badge) {
      pushNotification.setApplicationIconBadgeNumber("successIosHandler", e.badge);
    }
  };
  
  return {
    register: function () {
      var q = $q.defer();
      
      window.plugins.pushNotification.register(
      function (result) {
          q.resolve(result);
      },
      function (error) {
          q.reject(error);
      },
      pushConfig);
      
      return q.promise;
    }
  }
});