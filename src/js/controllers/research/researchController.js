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

    ResearchController.$inject = ['$scope', '$timeout', 'Navigator', 'Params', 'ProfileSelector',
        'Questionnaires', 'RequestToServer', 'Studies', 'UserHospitalPreferences'];

    function ResearchController($scope, $timeout, Navigator, Params, ProfileSelector,
                                Questionnaires, RequestToServer, Studies, UserHospitalPreferences) {
        let vm = this;

        vm.allowedModules = {};

        vm.openResearchStudies = openResearchStudies;
        vm.openResearchFeedback = openResearchFeedback;
        vm.openReferenceMaterial = openReferenceMaterial;
        vm.openResearchQuestionnaires = openResearchQuestionnaires;
        vm.openConsentForms = openConsentForms;
        vm.openInfoPage = openInfoPage;

        let navigator = null;

        activate();

        ////////////////////////////

        function activate() {
            navigator = Navigator.getNavigator();

            bindEvents();
            configureSelectedHospital();
            setBadges();
        }

        function bindEvents() {
            navigator.on('prepop', () => setBadges());
            $scope.$on('$destroy', () => navigator.off('prepop'));
        }

        /**
         * @name configureSelectedHospital
         * @desc Set the hospital name to display
         */
        function configureSelectedHospital() {
            vm.allowedModules = UserHospitalPreferences.getHospitalAllowedModules();
        }

        async function setBadges() {
            try {
                const patientSerNum = ProfileSelector.getPatientSerNum();
                const requestConfig = Params.API.ROUTES.CHART
                const result = await RequestToServer.apiRequest({
                    ...requestConfig,
                    url: `${requestConfig.url}${patientSerNum}/`
                });
                await $timeout(() => {
                    vm.researchReferenceUnreadNumber = parseInt(result.data.unread_research_reference_count);
                    vm.researchQuestionnairesUnreadNumber = parseInt(result.data.unread_research_questionnaire_count);
                    vm.consentQuestionnairesUnreadNumber = parseInt(result.data.unread_consent_questionnaire_count);
                });
            } catch (error) {
                console.error(error);
            }
        }

        function openResearchStudies() {
            navigator.pushPage('views/personal/research/research-studies/research-studies.html');
        }

        function openResearchFeedback() {
            navigator.pushPage('views/general/feedback/feedback.html', {contentType: 'research'});
        }

        function openReferenceMaterial() {
            navigator.pushPage('views/personal/education/education.html', {category: 'research'});
        }

        function openResearchQuestionnaires() {
            navigator.pushPage('views/personal/questionnaires/questionnairesList.html', {questionnairePurpose: 'research'});
        }

        function openConsentForms() {
            navigator.pushPage('views/personal/questionnaires/questionnairesList.html', {questionnairePurpose: 'consent'});
        }

        function openInfoPage() {
            navigator.pushPage('views/tabs/info-page-tabs.html', {id: 'research'});
        }

    }
})();
