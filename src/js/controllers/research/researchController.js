(function () {
    'use strict';

    angular 
        .module('MUHCApp')
        .controller('ResearchController', ResearchController);
    
    ResearchController.$inject = ['NavigatorParameters'];

    function ResearchController(NavigatorParameters) {
        var vm = this;

        vm.openResearchStudies = openResearchStudies;
        vm.openReferenceMaterial = openReferenceMaterial;
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


        function openResearchStudies() {
            window[navigatorName].pushPage('views/personal/research/research-studies/research-studies.html');
        }

        function openReferenceMaterial() {
            window[navigatorName].pushPage('views/personal/research/reference-material/reference-material.html');
        }

        function openResearchQuestionnaires() {
            window[navigatorName].pushPage('views/personal/research/research-questionnaires/research-questionnaires-list.html');
        }

        function openConsentForms() {
            window[navigatorName].pushPage('views/personal/research/consent-forms/consent-forms.html');
        }
    }
})();