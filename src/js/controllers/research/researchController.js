/*
 * Filename     :   researchController.js
 * Description  :   Manages the research view.
 * Created by   :   Kayla O'Sullivan-Steben 
 * Date         :   Jan 2021
 *
 * TODO: once studies are added, replace 'vm.studiesUnreadNumber = 0;' with actual implementation 
 *       (also replace in metadataService.js and personalTabControler.js)
 */

(function () {
    'use strict';

    angular 
        .module('MUHCApp')
        .controller('ResearchController', ResearchController);
    
    ResearchController.$inject = ['MetaData','NavigatorParameters','Questionnaires'];

    function ResearchController(MetaData, NavigatorParameters, Questionnaires) {
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

        function activate(){
            navigator = NavigatorParameters.getNavigator();
            navigatorName = NavigatorParameters.getNavigatorName();          
            
            bindEvents();
            setMetaData();
            setBadges();
        }

        function bindEvents(){
            navigator.on('prepop',function(){
               setBadges();
            });
        }

        function setMetaData(){
            if(MetaData.isFirstTimeResearch()){
                var meta = MetaData.fetchResearchMeta();
                vm.studiesUnreadNumber = meta.studiesUnreadNumber;
                vm.researchQuestionnairesUnreadNumber = meta.researchQuestionnairesUnreadNumber;
                vm.consentQuestionnairesUnreadNumber = meta.consentQuestionnairesUnreadNumber;
                MetaData.setFetchedResearch();
            } 
        }

        function setBadges(){
            vm.studiesUnreadNumber = 0; //TODO: add implementation
            vm.researchQuestionnairesUnreadNumber = Questionnaires.getNumberOfUnreadQuestionnairesByCategory('research');    
            vm.consentQuestionnairesUnreadNumber = Questionnaires.getNumberOfUnreadQuestionnairesByCategory('consent'); 
        }

        function openResearchStudies() {
            navigator.pushPage('views/personal/research/research-studies/research-studies.html');
        }

        function openReferenceMaterial() {
            NavigatorParameters.setParameters({Navigator:navigatorName, category:'research'});
            navigator.pushPage('views/education/education.html');
        }

        function openResearchQuestionnaires() {
            NavigatorParameters.setParameters({questionnaireCategory: 'research'});
            navigator.pushPage('views/personal/questionnaires/questionnairesList.html');
        }

        function openConsentForms() {
            NavigatorParameters.setParameters({questionnaireCategory: 'consent'});
            navigator.pushPage('views/personal/questionnaires/questionnairesList.html');
        }

        function openInfoPage() {
            NavigatorParameters.setParameters({Navigator:navigatorName, subView:'research'});
            navigator.pushPage('views/tabs/info-page-tabs.html');
        }
        
    }
})();
