var myApp = angular.module('PasswordReset', ['firebase','ui.bootstrap', 'encryptionService', 'ResetPasswordRequests', 'requestsService']);

myApp.config(function () {
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyCxV6VuVWtKg5wkeReqzQNfRULwkvVXkos",
        authDomain: "brilliant-inferno-7679.firebaseapp.com",
        databaseURL: "https://brilliant-inferno-7679.firebaseio.com",
    };
    firebase.initializeApp(config);
});
