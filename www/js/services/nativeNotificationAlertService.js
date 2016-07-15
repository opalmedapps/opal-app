var myApp=angular.module('MUHCApp');
myApp.service('NativeNotification',[function(){
  var mod= (ons.platform.isAndroid())?'material' : undefined;
  return {
    showNotificationAlert:function(message)
    {
      ons.notification.alert({
        message: message,
        modifier: mod
      });
    },
    showNotificationConfirm:function(message,confirmCallback, cancelCallback)
    {
      var message = (message)? message:'Problems with server, would you like to load your most recent saved data from the device?';
      ons.notification.confirm({
        message: message,
        modifier: mod,
        callback: function(idx) {
          switch (idx) {
            case 0:
              cancelCallback();
              break;
            case 1:
              confirmCallback();
            break;
          }
        }
      });
    }
  }



  }]);
