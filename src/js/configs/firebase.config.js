import { initializeApp } from 'firebase/app';

angular.module("MUHCApp").config(FirebaseConfiguration);

FirebaseConfiguration.$inject = [];

/* @ngInject */
function FirebaseConfiguration() {
    // This Firebase configuration is set per environment; OPAL_CONFIG is set by
    // Webpack in the ProvidePlugin when we build and run the app
    //if (!firebase.apps.length) {
        let newapp = initializeApp(OPAL_CONFIG.firebase);
        console.log('Init app called', OPAL_CONFIG.firebase, newapp);
    //}
}
