// SPDX-FileCopyrightText: Copyright (C) 2020 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

import { getApps, initializeApp } from 'firebase/app';

angular.module('OpalApp').config(FirebaseConfiguration);

FirebaseConfiguration.$inject = [];

/* @ngInject */
function FirebaseConfiguration() {
    // Firebase configs are set per environment in /env/*/opal.config.js and made available in CONFIG via the Webpack ProvidePlugin
    if (getApps().length === 0) initializeApp(CONFIG.firebase);
}
