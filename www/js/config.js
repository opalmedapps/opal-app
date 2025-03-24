myApp.config(fireConfig);

fireConfig.$inject = [];

/* @ngInject */
function fireConfig () {
    var config = {
        apiKey: "AIzaSyAMIDdcQR8EiY9gjj4cgxp6Vu3xwa78Ww8",
        authDomain: "opal-dev.firebaseapp.com",
        databaseURL: "https://opal-dev.firebaseio.com",
        storageBucket: "opal-dev.appspot.com",
        messagingSenderId: "652464215237"
    };

    if (!firebase.apps.length) {
        firebase.initializeApp(config);
    }
}