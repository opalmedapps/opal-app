
angular.module("MUHCApp").config(TranslationConfiguration);

TranslationConfiguration.$inject = ['tmhDynamicLocaleProvider', '$translateProvider', 'Constants'];

/* @ngInject */
function TranslationConfiguration(tmhDynamicLocaleProvider, $translateProvider, Constants) {
    $translateProvider.useSanitizeValueStrategy('sanitizeParameters');
    $translateProvider.useLoader('$translatePartialLoader', {
        urlTemplate: './Languages/appTranslationTablesViews/{part}/{lang}.json'
    });
    //$translateProvider.preferredLanguage('fr');
    tmhDynamicLocaleProvider.localeLocationPattern('./Languages/angular-locales/angular-locale_{{locale}}.js');
    $translateProvider.useMissingTranslationHandlerLog();
}