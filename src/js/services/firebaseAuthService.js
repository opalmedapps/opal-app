//
// Author David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
//Defines the module for the app services.
var myApp = angular.module('MUHCApp');
//Factory service made to transport the firebase link as a dependency
/**
 *@ngdoc service
 *@name MUHCApp.service:FirebaseService
 *@requires $firebaseAuth
 *@description Allows the app controllers or services obtain the authentication state and credentials, it also returns the urls inside for the firebase connection
 **/
myApp.factory("FirebaseService", ['$firebaseAuth',
	function ($firebaseAuth) {
		let firebaseBaseUrl = "dev3/";
		let firebaseUrl = firebaseBaseUrl;
		let firebaseDBRef = firebase.database().ref(firebaseUrl);

		return {
			/**
			 *@ngdoc method
			 *@name getAuthentication
			 *@methodOf MUHCApp.service:FirebaseService
			 *@description Returns reference to firebase authentication Angular Fire object, $firebaseAuth
			 *@returns {Object} Reference to firebase authentication service
			 **/
			getAuthentication: function () {
				return $firebaseAuth();
			},
			/**
			 *@ngdoc method
			 *@name getAuthenticationCredentials
			 *@methodOf MUHCApp.service:FirebaseService
			 *@returns {Object} Returns firebase authentication credentials
			 **/
			getAuthenticationCredentials: function () {
				return $firebaseAuth().$getAuth();
			},

			getFirebaseChild: function (child) {
				switch (child) {
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

			getDBRef: function (ref) {
				if (ref) {
					return firebaseDBRef.child(ref);
				} else {
					return firebaseDBRef;
				}
			},

			signIn: function (email, password) {
				return firebase.signInWithEmailAndPassword(email, password);

			},

			signOut: function () {

				this.getAuthentication().$signOut()
					.then(function (response) {
						"use strict";
						console.log('Firebase sign out response: ', JSON.stringify(response));
					})
			},

			updateFirebaseUrl: function (extension) {
				firebaseUrl = firebaseBaseUrl + extension;
				firebaseDBRef = firebase.database().ref(firebaseUrl);
			}
		};
	}]);
