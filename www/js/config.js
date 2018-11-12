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
        apiKey: "AIzaSyBCWNBrWMt0cABzBYvUASe-Bxc7HhlGlnY",
        authDomain: "opal-d2be7.firebaseapp.com",
        databaseURL: "https://opal-d2be7.firebaseio.com",
        projectId: "opal-d2be7",
        storageBucket: "opal-d2be7.appspot.com",
        messagingSenderId: "394159777757"
    };
    if (!firebase.apps.length) {
        firebase.initializeApp(config);
    }

}
