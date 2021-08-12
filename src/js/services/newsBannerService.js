//
// Author David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
var myApp=angular.module('MUHCApp');
/**
*@ngdoc service
*@name MUHCApp.service:NewsBanner
*@requires $cordovaNetwork
*@requires $filter
*@requires $translatePartialLoader
*@description API services used to display message banner alerts for the app, e.g. internet connectivity banners, notification banners, etc. For more information on the plugin, {@link https://github.com/EddyVerbruggen/Toast-PhoneGap-Plugin Cordova Toast Plugin}
**/
myApp.service('NewsBanner',['$cordovaNetwork','$filter','$translatePartialLoader','Constants','Params',
  function($cordovaNetwork, $filter, $translatePartialLoader, Constants, Params) {

  //Adds the top-view translation tables in order to always display the alert banners correctly.
  $translatePartialLoader.addPart('top-view');

  /**
   * @author Stacey Beard
   * @date 2021-08-12
   * @desc Determines whether the current platform is able to display toast messages.
   * @returns {boolean} True if toasts can be used; false otherwise.
   */
  function platformSupportsToast() {
    // Check the version number of the OS. If using Android, toasts are not supported on Android 11+.
    // Use a regular expression to extract the first number of the version; e.g. 11.0 --> 11
    const versionRegEx = /^\d*/;
    const versionStr = device.version.match(versionRegEx)[0];
    const versionNum = parseInt(versionStr);

    // To support toasts, we must be running on mobile ("app"), and not on Android 11+.
    return Constants.app && !(device.platform === "Android" && versionNum >= 11);
  }

  //Helper method to show banner
  function showCustomBanner(messageValue,backgroundColorValue, textColorValue, textSizeValue,
      positionValue, callbackValue, durationValue)
  {
    // TODO add support for Android 11+; display toasts in a different way
    if(platformSupportsToast())
    {
      window.plugins.toast.showWithOptions(
      {
        message: messageValue,
        duration:durationValue,
        position: positionValue,
        addPixelsY: 100,
        styling: {
          opacity:0.8,
          backgroundColor: backgroundColorValue, // make sure you use #RRGGBB. Default #333333
          textColor: textColorValue, // Ditto. Default #FFFFFF
          textSize: textSizeValue, // Default 13
        }
      },
      callbackValue,
      function(error){});
    }
  }

  //Show connectivity or notification banner
  function showBanner(type, callback, numberOfNotifications)
  {
    var message = '';
    //Display number of notifications if notifications
    if(type=='notifications')
    {
      var numberNot = (typeof numberOfNotifications !=='undefined')?numberOfNotifications:'';
      var newNotificaitions = $filter('translate')("NEWNOTIFICATIONS");
      if(numberNot == 1||numberNot=='1') newNotificaitions = newNotificaitions.substring(0,newNotificaitions.length-1);
      message =  numberNot +" "+ newNotificaitions;
    }else{
      //Otherwise get the translation for other alert types
      message = $filter('translate')(alertTypes[type].Message);
    }
    //If the callback is not undefined call plugin with callback option
    // TODO add support for Android 11+; display toasts in a different way
    if(typeof callback !=='undefined' && platformSupportsToast())
    {
      window.plugins.toast.showWithOptions(
      {
        message: message,
        duration:alertTypes[type].Duration,
        position: "top",
        addPixelsY: 40,
        styling: {
          opacity:1.0,
          backgroundColor: alertTypes[type].Color, // make sure you use #RRGGBB. Default #333333
          textColor: '#F0F3F4', // Ditto. Default #FFFFFF
        }
      },
      callback,
      function(error){});
    // TODO add support for Android 11+; display toasts in a different way
    }else if(platformSupportsToast()){
       window.plugins.toast.showWithOptions(
      {
        message: message,
        duration:"short",
        position: "top",
        addPixelsY: 40,
        styling: {
          opacity:1.0,
          backgroundColor: alertTypes[type].Color, // make sure you use #RRGGBB. Default #333333
          textColor: '#F0F3F4', // Ditto. Default #FFFFFF
        }
      },
      function(result){},
      function(error){});

    }
  }
  //Alert mappings for types
    /**
  *@ngdoc property
  *@name  MUHCApp.service.#alertTypes
  *@propertyOf MUHCApp.service:NewsBanner
  *@description Alert mappings for types, Returns an object with message, duration, colorf for the specific types. The types are the following: nointernet, connected, notifications
  **/
  var alertTypes = Params.newsAlertTypes;
  return {
        /**
	    *@ngdoc method
		*@name showCustomBanner
		*@methodOf MUHCApp.service:NewsBanner
		*@param {String} message Message for the alert
		*@param {String}  Background Color for the alert
		*@param {String}  Text Color for the alert
		*@param {String}  Position for the alert
		*@param {Function} callback Callback function for the alert
		*@param {Number} duration Duration in milliseconds
		*@description Displays alert based on the parameters
		**/
		showCustomBanner:function(messageValue,backgroundColorValue, textColorValue, textSizeValue, positionValue, callbackValue, durationValue){
        if(Constants.app)
        {
          showCustomBanner(messageValue,backgroundColorValue, textColorValue, textSizeValue, positionValue, callbackValue, durationValue);
        }
        else console.log("Toast message:\n" + messageValue);
      },
        /**
		*@ngdoc method
		*@name setAlertOnline
		*@methodOf MUHCApp.service:NewsBanner
		*@description Displays no internet alert
		**/
      setAlertOffline:function()
      {
        if(Constants.app){
          if (!$cordovaNetwork.isOnline()) showBanner('nointernet');
        }
      },
      /**
		*@ngdoc method
		*@name showAlert
		*@methodOf MUHCApp.service:NewsBanner
    *@param {String} type Type for alert.
		*@description Shows alert for the three types, no internet, online, and notifications
		**/
      showAlert:function(type)
      {
        showBanner(type);
      },
        /**
		*@ngdoc method
		*@name showNotificationAlert
		*@methodOf MUHCApp.service:NewsBanner
    *@param {String} numberOfNotifications Number of notifications in alert
    *@param {Function} callback Callback function
		*@description Displays the notification banner for the numberOfNotifications specified.
		**/
      showNotificationAlert:function(numberOfNotifications, callback)
      {
        showBanner('notifications', callback,numberOfNotifications);
      }
  };
}]);
