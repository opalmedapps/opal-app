
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
