myApp.config(fireConfig)

fireConfig.$inject = [];

/* @ngInject */
function fireConfig () {
    var config = {
        apiKey: "AIzaSyCw4vvsyYYHbzKisZdJ3CdOOwClkG10J0A",
        authDomain: "opal-mactest.firebaseapp.com",
        databaseURL: "https://opal-mactest.firebaseio.com",
        storageBucket: "opal-mactest.appspot.com",
        messagingSenderId: "634611685707"
    };
    firebase.initializeApp(config);
}