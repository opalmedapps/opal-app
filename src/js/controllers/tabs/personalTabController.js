/**
 * Created by PhpStorm.
 * User: James Brace
 * Date: 2017-09-20
 * Time: 12:00 PM
 * 
 */

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('PersonalTabController', PersonalTabController);

    PersonalTabController.$inject = ['$timeout', 'EducationalMaterial', 'NavigatorParameters', 'NetworkStatus', 'Params',
        'ProfileSelector', 'Questionnaires', 'RequestToServer', 'UserHospitalPreferences', 'UserPreferences'];

    function PersonalTabController($timeout, EducationalMaterial, NavigatorParameters, NetworkStatus, Params,
        ProfileSelector, Questionnaires, RequestToServer, UserHospitalPreferences, UserPreferences) {

        let vm = this;
        let setAccessLevel = () => vm.accessLevelAll = ProfileSelector.getAccessLevel() === "ALL";

        // variable to let the user know which hospital they are logged in
        vm.selectedHospitalToDisplay = "";
        vm.allowedModules = {};
        vm.getDisplayData = getDisplayData;

        vm.personalDeviceBackButton = () => tabbar.setActiveTab(0);
        
        vm.goToClinicalQuestionnaire = goToClinicalQuestionnaire;

        activate();

        //////////////////////////

        function activate() {
            //It is possible for a notification to have been read such as a document since this controller has already been instantiated
            // we will have to check to sync that number on the badges for the tabs on the personal page.
            NavigatorParameters.setParameters({ 'Navigator': 'personalNavigator' });
            NavigatorParameters.setNavigator(personalNavigator);

            // Call early to prevent flickering of hidden menu items
            setAccessLevel();

            bindEvents();

            vm.language = UserPreferences.getLanguage();
            configureSelectedHospital();

            if (NetworkStatus.isOnline()) getDisplayData();
        }

        function bindEvents() {
            // Refresh the page on coming back from other pages
            personalNavigator.on('prepop', function () {
                if (NetworkStatus.isOnline()) getDisplayData();
            });
            //This avoids constant repushing which causes bugs
            personalNavigator.on('prepush', function (event) {
                if (personalNavigator._doorLock.isLocked()) {
                    event.cancel();
                }
            });
        }

        /**
         * @description Function to get view specific data from Django API
         */
        async function getDisplayData() {
            try {
                const patientSerNum = ProfileSelector.getPatientSerNum();
                const requestConfig = Params.API.ROUTES.CHART
                const result = await RequestToServer.apiRequest({
                    ...requestConfig,
                    url: `${requestConfig.url}${patientSerNum}/`
                });
                $timeout(() => {
                    vm.appointmentsUnreadNumber = result.data.unread_appointment_count;
                    vm.labsUnreadNumber = result.data.unread_lab_result_count;
                    vm.documentsUnreadNumber = result.data.unread_document_count;
                    vm.txTeamMessagesUnreadNumber = result.data.unread_txteammessage_count;
                    vm.notificationsUnreadNumber = result.data.unread_notification_count;
                    vm.questionnairesUnreadNumber = result.data.unread_questionnaire_count;
                    vm.educationalMaterialsUnreadNumber = parseInt(result.data.unread_educationalmaterial_count);
                    vm.researchReferenceUnreadNumber = parseInt(result.data.unread_research_reference_count);
                    vm.researchQuestionnairesUnreadNumber = parseInt(result.data.unread_research_questionnaire_count);
                    vm.consentQuestionnairesUnreadNumber = parseInt(result.data.unread_consent_questionnaire_count);
                    EducationalMaterial.setNumberOfUnreadMaterialsByPurpose(
                        'clinical',
                        vm.educationalMaterialsUnreadNumber,
                    );
                    EducationalMaterial.setNumberOfUnreadMaterialsByPurpose(
                        'research',
                        vm.researchReferenceUnreadNumber,
                    );
                    Questionnaires.setNumberOfUnreadQuestionnairesByPurpose(
                        'research',
                        vm.researchQuestionnairesUnreadNumber,
                    );
                    Questionnaires.setNumberOfUnreadQuestionnairesByPurpose(
                        'consent',
                        vm.consentQuestionnairesUnreadNumber,
                    );
                    vm.researchUnreadNumber = calculateResearchBadge();

                    // Refresh the visible menu items based on access level when changing profiles
                    setAccessLevel();
                });
            } catch (error) {
                // TODO: Error handling improvements: https://o-hig.atlassian.net/browse/QSCCD-463
                console.error(error);
            }
        }

        /**
         * @description Calculates the total value of the research badge based on the badges of enabled research modules.
         *              If a module is not enabled (not visible), it shouldn't be included in the count.
         * @returns {number} The total value of all visible badges inside the research menu.
         */
        function calculateResearchBadge() {
            let total = 0;
            let enabledREF = vm.allowedModules.hasOwnProperty('REF') && vm.allowedModules['REF'];
            let enabledRQU = vm.allowedModules.hasOwnProperty('RQU') && vm.allowedModules['RQU'];
            let enabledCON = vm.allowedModules.hasOwnProperty('CON') && vm.allowedModules['CON'];
            if (enabledREF) total += vm.researchReferenceUnreadNumber;
            if (enabledRQU) total += vm.researchQuestionnairesUnreadNumber;
            if (enabledCON) total += vm.consentQuestionnairesUnreadNumber;
            return total;
        }

        /**
         * @name configureSelectedHospital
         * @desc Set the hospital name to display
         */
        function configureSelectedHospital() {
            vm.selectedHospitalToDisplay = UserHospitalPreferences.getHospitalFullName();
            vm.allowedModules = UserHospitalPreferences.getHospitalAllowedModules();
        }

        /**
         * @name goToClinicalQuestionnaire
         * @desc Get clinical questionnaires
         */
        function goToClinicalQuestionnaire() {
            NavigatorParameters.setParameters({ questionnairePurpose: 'clinical' });
            personalNavigator.pushPage('views/personal/questionnaires/questionnairesList.html');
        }
    }
})();
