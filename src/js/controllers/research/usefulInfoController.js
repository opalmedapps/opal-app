(function() {
    'use strict';
    angular
        .module('MUHCApp')
        .controller('UsefulInfoController', UsefulInfoController);

    UsefulInfoController.$inject = ['NavigatorParameters', 'UserPreferences'];

    /* @ngInject */
    function UsefulInfoController(NavigatorParameters, UserPreferences)
    {
        var vm = this;
        let navigator = null;
        let navigatorName = '';
        vm.goToResearchFAQ = goToResearchFAQ;

        activate();

        ///////////////////////////////////////////////////////////////////////////////////
        function activate() {
            // Initialize the navigator for push and pop of pages.
            navigator = NavigatorParameters.getNavigator();
            navigatorName = NavigatorParameters.getNavigatorName();
        }

        function goToResearchFAQ() {
            let url = '';
            let app = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;

            if (UserPreferences.getLanguage().toUpperCase() === "EN") {
                url = 'https://ethics.gc.ca/eng/education_FAQs_gen.html';
            } else {
                url = 'https://ethics.gc.ca/fra/education_FAQs_gen.html';
            }

            if (app) {
                cordova.InAppBrowser.open(url, '_blank', 'location=yes');
            } else {
                window.open(url, '_blank');
            }
        }
    }

})();