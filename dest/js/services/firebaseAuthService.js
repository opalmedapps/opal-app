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

    var firebaseUrl="dev2/";

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
      getFirebaseUrl:function(extension)
      {
          switch(extension){
              case null:
                  return firebaseUrl;
              case 'users':
                  return firebaseUrl + 'users/';
              case 'requests':
                  return firebaseUrl + 'requests/';
              case 'logged_in_users':
                  return firebaseUrl + 'logged_in_users/';
              default:
                  return firebaseUrl;
          }

      },

      getFirebaseChild:function(child){
          switch(child){
              case 'users':
                  return 'users/';
              case 'requests':
                  return 'requests/';
              case 'logged_in_users':
                  return 'logged_in_users/';
              default:
                  return '';
          }
      },

        getDBRef: function(ref){
            var global = firebase.database().ref(firebaseUrl);

            if(ref){
                return global.child(ref);
            } else {
                return global
            }
        },

        signIn: function(email, password) {
          return firebase.signInWithEmailAndPassword(email, password);

        },

        signOut: function() {

            this.getAuthentication().$signOut()
                .then(function(response) {
                    "use strict";
                    console.log(response)
                })
        }
    };
}]);
