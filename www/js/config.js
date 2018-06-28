myApp.config(fireConfig);

fireConfig.$inject = [];

/* @ngInject */
function fireConfig () {

    var config = {

        apiKey: "AIzaSyCxV6VuVWtKg5wkeReqzQNfRULwkvVXkos",
        authDomain: "brilliant-inferno-7679.firebaseapp.com",
        databaseURL: "https://brilliant-inferno-7679.firebaseio.com",
        storageBucket: "firebase-brilliant-inferno-767.appspot.com",
        messagingSenderId: "810896751588"
    };

    if (!firebase.apps.length) {
        firebase.initializeApp(config);
    }

    // // Initialize Firebase
    // var config = {
    //     apiKey: "AIzaSyBqPY0KIXqPFlLztENbAauhn12tGHPeA6A",
    //     authDomain: "opalpatient.firebaseapp.com",
    //     databaseURL: "https://opalpatient.firebaseio.com",
    //     projectId: "opalpatient",
    //     storageBucket: "opalpatient.appspot.com",
    //     messagingSenderId: "42757898093"
    // };
    // if (!firebase.apps.length) {
    //         firebase.initializeApp(config);
    //     }

}
