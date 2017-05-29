myApp.config(fireConfig)

fireConfig.$inject = [];

/* @ngInject */
function fireConfig () {
    var config = {
        apiKey: "AIzaSyAGBV2Zwr0SYKy_J92jceof-OFeeFmm0Gw",
        authDomain: "opal-prod.firebaseapp.com",
        databaseURL: "https://opal-prod.firebaseio.com",
        projectId: "opal-prod",
        storageBucket: "opal-prod.appspot.com",
        messagingSenderId: "476395494069"
    };
    
    firebase.initializeApp(config);
}