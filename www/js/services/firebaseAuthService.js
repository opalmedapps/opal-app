//
// Author David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
//Defines the module for the app services.
var myApp=angular.module('MUHCApp');
//Factory service made to transport the firebase link as a dependency
/**
*@ngdoc service
*@name MUHCApp.service:FirebaseService
*@requires $firebaseAuth
*@requires MUHCApp.service:UserAuthorizationInfo
*@description Allows the app controllers or services obtain the authentication state and credentials, it also returns the urls inside for the firebase connection
**/
myApp.factory("FirebaseService", ['$firebaseAuth','$firebaseObject','UserAuthorizationInfo',
  function ($firebaseAuth) {
    var firebaseUrl="https://brilliant-inferno-7679.firebaseio.com/dev4/";

    return {
       /**
		*@ngdoc method
		*@name getAuthentication
		*@methodOf MUHCApp.service:FirebaseService
		*@description Returns reference to firebase authentication Angular Fire object, $firebaseAuth
    *@returns {Object} Reference to firebase authentication service
		**/
      getAuthentication:function()
      {
        return $firebaseAuth();
      },
      /**
		*@ngdoc method
		*@name getAuthenticationCredentials
		*@methodOf MUHCApp.service:FirebaseService
    *@returns {Object} Returns firebase authentication credentials
		**/
      getAuthenticationCredentials:function()
      {
        return $firebaseAuth().$getAuth();
      },
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
