/*
 * Filename     :   researchController.js
 * Description  :   Manages the research view.
 * Created by   :   Kayla O'Sullivan-Steben 
 * Date         :   Jan 2021
 *
 */

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('ResearchController', ResearchController);

    ResearchController.$inject = ['EducationalMaterial', 'MetaData', 'NavigatorParameters', 'Questionnaires', 'Studies'];

    function ResearchController(EducationalMaterial, MetaData, NavigatorParameters, Questionnaires, Studies) {
        let vm = this;

        vm.openResearchStudies = openResearchStudies;
        vm.openReferenceMaterial = openReferenceMaterial;
        vm.openResearchQuestionnaires = openResearchQuestionnaires;
        vm.openConsentForms = openConsentForms;
        vm.openInfoPage = openInfoPage;

        let navigator = null;
        let navigatorName = '';

        activate();

        ////////////////////////////

        function activate() {
            navigator = NavigatorParameters.getNavigator();
            navigatorName = NavigatorParameters.getNavigatorName();

            bindEvents();
            setMetaData();
            setBadges();
        }

        function bindEvents() {
            navigator.on('prepop', () => setBadges());
        }

        function setMetaData() {
            if (MetaData.isFirstTimeResearch()) {
                var meta = MetaData.fetchResearchMeta();
                vm.studiesUnreadNumber = meta.studiesUnreadNumber;
                vm.researchQuestionnairesUnreadNumber = meta.researchQuestionnairesUnreadNumber;
                vm.consentQuestionnairesUnreadNumber = meta.consentQuestionnairesUnreadNumber;
                MetaData.setFetchedResearch();
            }
        }

        function setBadges() {
            vm.studiesUnreadNumber = Studies.getNumberUnreadStudies();
            vm.researchQuestionnairesUnreadNumber = Questionnaires.getNumberOfUnreadQuestionnairesByPurpose('research');
            vm.consentQuestionnairesUnreadNumber = Questionnaires.getNumberOfUnreadQuestionnairesByPurpose('consent');
            vm.eduMaterialUnreadNumber = EducationalMaterial.getNumberOfUnreadEducationalMaterialByCategory('research');
        }

        function openResearchStudies() {
            navigator.pushPage('views/personal/research/research-studies/research-studies.html');
        }

        function openReferenceMaterial() {
            NavigatorParameters.setParameters({ Navigator: navigatorName, category: 'research' });
            navigator.pushPage('views/personal/education/education.html');
        }

        function openResearchQuestionnaires() {
            NavigatorParameters.setParameters({ questionnairePurpose: 'research' });
            navigator.pushPage('views/personal/questionnaires/questionnairesList.html');
        }

        function openConsentForms() {
            NavigatorParameters.setParameters({ questionnairePurpose: 'consent' });
            navigator.pushPage('views/personal/questionnaires/questionnairesList.html');
        }

        function openInfoPage() {
            NavigatorParameters.setParameters({ Navigator: navigatorName, subView: 'research' });
            navigator.pushPage('views/tabs/info-page-tabs.html');
        }

    }
})();
