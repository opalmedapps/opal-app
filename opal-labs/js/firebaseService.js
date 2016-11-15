//
// Author David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
//Defines the module for the app services.
var myApp=angular.module('myApp');
//Factory service made to transport the firebase link as a dependency
/**
*@ngdoc service
*@name MUHCApp.service:FirebaseService
*@requires $firebaseAuth
*@requires MUHCApp.service:UserAuthorizationInfo
*@description Allows the app controllers or services obtain the authentication state and credentials, it also returns the urls inside for the firebase connection
**/
myApp.factory("FirebaseService", ['UserAuthorizationInfo',
  function (UserAuthorizationInfo) {
    var firebaseUrl="https://brilliant-inferno-7679.firebaseio.com/dev2/";
    return {
 
       /**
		*@ngdoc method
		*@name getFirebaseUrl
		*@methodOf MUHCApp.service:FirebaseService
    *@returns {String} Returns firebase url string
		**/
      getFirebaseUrl:function()
      {
        return firebaseUrl;
      }
    };
}]);
