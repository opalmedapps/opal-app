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
        // PRODUCTION
        //
        // apiKey: "AIzaSyCxV6VuVWtKg5wkeReqzQNfRULwkvVXkos",
        // authDomain: "brilliant-inferno-7679.firebaseapp.com",
        // databaseURL: "https://brilliant-inferno-7679.firebaseio.com",
        // storageBucket: "firebase-brilliant-inferno-767.appspot.com",
        // messagingSenderId: "810896751588"

        //
        // Local (Stacey)
        //
        apiKey: "AIzaSyB_I9XTYRGBcL54E-vwihapSe6cLjHebTY",
        authDomain: "opal-test-35d3d.firebaseapp.com",
        databaseURL: "https://opal-test-35d3d.firebaseio.com",
        projectId: "opal-test-35d3d",
        storageBucket: "",
        messagingSenderId: "338019889649"
    };

    if (!firebase.apps.length) {
        firebase.initializeApp(config);
    }
}