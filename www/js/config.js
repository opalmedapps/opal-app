myApp.config(fireConfig);

fireConfig.$inject = [];

/* @ngInject */
function fireConfig () {

    // var config = {
    //
    //     apiKey: "AIzaSyCxV6VuVWtKg5wkeReqzQNfRULwkvVXkos",
    //     authDomain: "brilliant-inferno-7679.firebaseapp.com",
    //     databaseURL: "https://brilliant-inferno-7679.firebaseio.com",
    //     storageBucket: "firebase-brilliant-inferno-767.appspot.com",
    //     messagingSenderId: "810896751588"
    // };
    //
    // if (!firebase.apps.length) {
    //     firebase.initializeApp(config);
    // }

    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyAwrkvcBqCDIleuKKyJvTsdTYkXRbYMSVw",
        authDomain: "opal-86e32.firebaseapp.com",
        databaseURL: "https://opal-86e32.firebaseio.com",
        projectId: "opal-86e32",
        storageBucket: "opal-86e32.appspot.com",
        messagingSenderId: "42757898093"
    };
    if (!firebase.apps.length) {
        firebase.initializeApp(config);
    }

}
