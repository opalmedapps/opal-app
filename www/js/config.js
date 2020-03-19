myApp.config(fireConfig);

fireConfig.$inject = [];

/* @ngInject */
function fireConfig () {

    var config = {
        //
        // PreProd (Dev) - ALTHOUGH BELOW IT HAS THE WORD "PROD"
        //
        // apiKey: "AIzaSyAGBV2Zwr0SYKy_J92jceof-OFeeFmm0Gw",
        // authDomain: "opal-prod.firebaseapp.com",
        // databaseURL: "https://opal-prod.firebaseio.com",
        // projectId: "opal-prod",
        // storageBucket: "opal-prod.appspot.com",
        // messagingSenderId: "476395494069"

        //
        // Dev firebase
        //
        apiKey: "AIzaSyAMIDdcQR8EiY9gjj4cgxp6Vu3xwa78Ww8",
        authDomain: "opal-dev.firebaseapp.com",
        databaseURL: "https://opal-dev.firebaseio.com",
        projectId: "opal-dev",
        storageBucket: "opal-dev.appspot.com",
        messagingSenderId: "652464215237",

        //
        // PRODUCTION
        //
        // apiKey: "AIzaSyCxV6VuVWtKg5wkeReqzQNfRULwkvVXkos",
        // authDomain: "brilliant-inferno-7679.firebaseapp.com",
        // databaseURL: "https://brilliant-inferno-7679.firebaseio.com",
        // storageBucket: "firebase-brilliant-inferno-767.appspot.com",
        // messagingSenderId: "810896751588"
    };

    if (!firebase.apps.length) {
        firebase.initializeApp(config);
    }
}
