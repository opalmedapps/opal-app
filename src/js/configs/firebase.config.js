import { getApps, initializeApp } from 'firebase/app';

angular.module("MUHCApp").config(FirebaseConfiguration);

FirebaseConfiguration.$inject = [];

/* @ngInject */
function FirebaseConfiguration() {
    // Firebase configs are set per environment in /env/*/opal.config.js and made available in CONFIG via the Webpack ProvidePlugin
    if (getApps().length === 0) initializeApp(CONFIG.firebase);
}
