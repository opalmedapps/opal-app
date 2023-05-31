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

    PersonalTabController.$inject = ['NavigatorParameters', 'Patient', 'NetworkStatus', '$timeout', 'UserPreferences',
        'UserHospitalPreferences', 'RequestToServer', 'Params'];

    function PersonalTabController(NavigatorParameters, Patient, NetworkStatus, $timeout, UserPreferences,
        UserHospitalPreferences, RequestToServer, Params) {
        let vm = this;
        let setAccessLevel = () => vm.accessLevelAll = Patient.getAccessLevel() === "ALL";

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
                const patientSernum = Patient.getPatientSerNum();
                const requestConfig = Params.API.ROUTES.CHART
                const result = await RequestToServer.apiRequest({
                    ...requestConfig,
                    url: `${requestConfig.url}${patientSernum}/`
                });
                $timeout(() => {
                    vm.appointmentsUnreadNumber = result.data.unread_appointment_count;
                    vm.documentsUnreadNumber = result.data.unread_document_count;
                    vm.txTeamMessagesUnreadNumber = result.data.unread_txteammessage_count;
                    vm.notificationsUnreadNumber = result.data.unread_notification_count;
                    vm.questionnairesUnreadNumber = result.data.unread_questionnaire_count;
                    vm.educationalMaterialsNumber = result.data.unread_educationalmaterial_count;
                    // TODO: fetch badges for the research menu items

                    // Refresh the visible menu items based on access level when changing profiles
                    setAccessLevel();
                });
            } catch (error) {
                // TODO: Error handling improvements: https://o-hig.atlassian.net/browse/QSCCD-463
                console.error(error);
            }
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
