//
// Author David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
var myApp=angular.module('MUHCApp');
/**
*@ngdoc service
*@name MUHCApp.service:NativeNotification
*@description API to display native looking alert, it's more code but makes it easier to use and cleaner in my opinion. Reference {@link https://onsen.io/v1/reference/ons-alert-dialog.html Onsen Alert Dialog}
**/
myApp.service('NativeNotification',function(){
   /**
  *@ngdoc property
  *@name  MUHCApp.service.#mod
  *@propertyOf MUHCApp.service:NativeNotification
  *@description string representing the style for the alert, 'material' for Android and undefined for IOS
  **/
  var currentAlert = null;
  var mod= (ons.platform.isAndroid())?'material' : undefined;
  return {
    /**
		*@ngdoc method
		*@name showNotificationAlert
		*@methodOf MUHCApp.service:NativeNotification
		*@param {String} message Alert message to be displayed
		*@description Displays message as a native looking alert
		**/
    showNotificationAlert:function(message)
    {
      if(currentAlert&&message === currentAlert) return;
      currentAlert = message;
      ons.notification.confirm({
        message: message,
        modifier: mod,
        buttonLabel:['Ok'],
        callback:function(idx)
        {
          currentAlert = null;
        }
      });
      
    },
    /**
		*@ngdoc method
		*@name showNotificationConfirm
		*@methodOf MUHCApp.service:NativeNotification
		*@param {String} url url to check and extract file type
    *@param {Function} confirmCallback If user pressed ok callback
    *@param {Function} cancelCallback If user pressed cancel callback
		*@description Prompts the user with an OK, Cancel alert.
		**/
    showNotificationConfirm:function(message,confirmCallback, cancelCallback)
    {
      if(currentAlert&&message === currentAlert) return;
      currentAlert = message;
      ons.notification.confirm({
        message: message,
        modifier: mod,
        callback: function(idx) {
          currentAlert = null;
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
  };



  });
