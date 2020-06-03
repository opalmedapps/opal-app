
angular.module("MUHCApp").config(TranslationConfiguration);

TranslationConfiguration.$inject = ['tmhDynamicLocaleProvider', '$translateProvider', 'Constants'];

/* @ngInject */
function TranslationConfiguration(tmhDynamicLocaleProvider, $translateProvider, Constants) {
    $translateProvider.useSanitizeValueStrategy('sanitizeParameters');
    $translateProvider.useStaticFilesLoader({
        files: [{
            prefix: '/Languages/app-translations/',
            suffix: '.json'
        }]});
    $translateProvider.preferredLanguage('en');
    tmhDynamicLocaleProvider.localeLocationPattern('./Languages/angular-locales/angular-locale_{{locale}}.js');
    $translateProvider.useMissingTranslationHandlerLog();
}
