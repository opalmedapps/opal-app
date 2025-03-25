// SPDX-FileCopyrightText: Copyright (C) 2020 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

angular.module('OpalApp').config(TranslationConfiguration);

TranslationConfiguration.$inject = ['tmhDynamicLocaleProvider', '$translateProvider', 'Constants'];

/* @ngInject */
function TranslationConfiguration(tmhDynamicLocaleProvider, $translateProvider, Constants) {
    $translateProvider.useSanitizeValueStrategy('sanitizeParameters');
    $translateProvider.useLoader('$translatePartialLoader', {
        urlTemplate: './Languages/appTranslationTablesViews/{part}/{lang}.json'
    });
    // support pluralization
    // see: https://angular-translate.github.io/docs/#/guide/14_pluralization
    $translateProvider.useMessageFormatInterpolation();
    // $translateProvider.preferredLanguage('fr');
    tmhDynamicLocaleProvider.localeLocationPattern('./Languages/angular-locales/angular-locale_{{locale}}.js');
    $translateProvider.useMissingTranslationHandlerLog();
}
