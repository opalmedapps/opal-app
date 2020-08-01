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
        vm.openInfoPage = openInfoPage;

        let navigator = null;
        let navigatorName = '';

        activate();

        ////////////////////////////

        function activate(){
            navigator = NavigatorParameters.getNavigator();
            navigatorName = NavigatorParameters.getNavigatorName();          
        }


        function openResearchStudies() {
            navigator.pushPage('views/personal/research/research-studies/research-studies.html');
        }

        function openReferenceMaterial() {
            NavigatorParameters.setParameters({'Navigator':navigatorName, 'category':'research'});
            navigator.pushPage('views/education/education.html');
        }

        function openResearchQuestionnaires() {
            navigator.pushPage('views/personal/research/research-questionnaires/research-questionnaires-list.html');
        }

        function openConsentForms() {
            navigator.pushPage('views/personal/research/consent-forms/consent-forms.html');
        }

        function openInfoPage() {
            NavigatorParameters.setParameters({'Navigator':navigatorName, 'subView':'research'});
            navigator.pushPage('views/tabs/info-page-tabs.html');
        }
        
    }
})();
