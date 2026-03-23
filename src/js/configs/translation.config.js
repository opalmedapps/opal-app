// SPDX-FileCopyrightText: Copyright (C) 2020 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

angular.module('OpalApp').config(TranslationConfiguration);

TranslationConfiguration.$inject = ['tmhDynamicLocaleProvider', '$translateProvider'];

/* @ngInject */
function TranslationConfiguration(tmhDynamicLocaleProvider, $translateProvider) {
    $translateProvider.useSanitizeValueStrategy('sanitizeParameters');
    $translateProvider.useLoader('$translatePartialLoader', {
        urlTemplate: './Languages/appTranslationTablesViews/{part}/{lang}.json'
    });
    // support pluralization
    // see: https://angular-translate.github.io/docs/#/guide/14_pluralization
    $translateProvider.useMessageFormatInterpolation();
    tmhDynamicLocaleProvider.localeLocationPattern('./Languages/angular-locales/angular-locale_{{locale}}.js');

    // Log missing translations to the console
    $translateProvider.useMissingTranslationHandler('MissingTranslationLogger');
}

// Define a custom logger for missing translations, since using the default angular-translate-handler-log leads to spammed warnings on the init page
// See: https://angular-translate.github.io/docs/#/guide/17_custom-error-handler
angular.module('OpalApp').factory('MissingTranslationLogger', function ($translate) {
    let translateServiceReady = false;
    let missingTranslations = [];

    $translate.onReady(() => translateServiceReady = true);

    return function (translationID) {
        // Logging only after the translation service is ready suppresses "Translation for _ doesn't exist" warnings for strings on the init page
        // Also, to avoid spamming the console, log each missing translation only once
        if (translateServiceReady && !missingTranslations.includes(translationID)) {
            missingTranslations.push(translationID);
            console.warn(`Translation for ${translationID} doesn't exist`);
        }
    };
});
