import { getApps, initializeApp } from 'firebase/app';

angular.module('OpalApp').config(FirebaseConfiguration);

FirebaseConfiguration.$inject = [];

/* @ngInject */
function FirebaseConfiguration() {
    // Firebase configs are set per environment in /env/*/opal.config.js and made available in OPAL_CONFIG via the Webpack ProvidePlugin
    if (getApps().length === 0) initializeApp(OPAL_CONFIG.firebase);
}
