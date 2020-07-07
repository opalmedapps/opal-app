(function () {
    'use strict';

    angular 
        .module('MUHCApp')
        .controller('ResearchController', ResearchController);
    
    ResearchController.$inject = ['NavigatorParameters'];

    function ResearchController(NavigatorParameters) {
        var vm = this;

        vm.openClinicalTrials = openClinicalTrials;
        vm.openUsefulInfo = openUsefulInfo;
        vm.openResearchQuestionnaires = openResearchQuestionnaires;
        vm.openConsentForms = openConsentForms;

        let navigator = null;
        let navigatorName = '';

        activate();

        ////////////////////////////

        function activate(){
            navigator = NavigatorParameters.getNavigator();
            navigatorName = NavigatorParameters.getNavigatorName();          
        }


        function openClinicalTrials() {
            window[navigatorName].pushPage('views/personal/research/clinical-trials/clinical-trials.html');
        }

        function openUsefulInfo() {
            window[navigatorName].pushPage('views/personal/research/useful-info/useful-info.html');
        }

        function openResearchQuestionnaires() {
            window[navigatorName].pushPage('views/personal/research/research-questionnaires/research-questionnaires-list.html');
        }

        function openConsentForms() {
            window[navigatorName].pushPage('views/personal/research/consent-forms/consent-forms.html');
        }
    }
})();