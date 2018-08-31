myApp.config(fireConfig);

fireConfig.$inject = [];

/* @ngInject */
function fireConfig() {

    let config = {
        //
        // PRODUCTION
        //
        // apiKey: "AIzaSyAGBV2Zwr0SYKy_J92jceof-OFeeFmm0Gw",
        // authDomain: "opal-prod.firebaseapp.com",
        // databaseURL: "https://opal-prod.firebaseio.com",
        // projectId: "opal-prod",
        // storageBucket: "opal-prod.appspot.com",
        // messagingSenderId: "476395494069"

        //
        // PreProd (Dev)
        //
        apiKey: 'AIzaSyDUxheeBz18Qu2WhXgYGIJ2b0gWBmEYAjM',
        authDomain: 'opal-dev-64f98.firebaseapp.com',
        databaseURL: 'https://opal-dev-64f98.firebaseio.com',
        projectId: 'opal-dev-64f98',
        storageBucket: '',
        messagingSenderId: '752651575903',
    };

    if (!firebase.apps.length) {
        firebase.initializeApp(config);
    }
}
