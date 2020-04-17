angular.module("MUHCApp").config(FirebaseConfiguration);

FirebaseConfiguration.$inject = [];

/* @ngInject */
function FirebaseConfiguration() {
    // This Firebase configuration is set per environment, OPAL_ENVIRONMENT is set by
    // Webpack in the ProvidePlugin when we build and run the app
    if (!firebase.apps.length) {
        firebase.initializeApp(OPAL_CONFIG.firebase);
    }
}
