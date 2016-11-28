var myApp = angular.module('PasswordReset', ['firebase','ui.bootstrap']);

myApp.config(function () {
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyAMIDdcQR8EiY9gjj4cgxp6Vu3xwa78Ww8",
        authDomain: "opal-dev.firebaseapp.com",
        databaseURL: "https://opal-dev.firebaseio.com"
    };
    firebase.initializeApp(config);
});
