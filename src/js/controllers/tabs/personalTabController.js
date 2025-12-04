// SPDX-FileCopyrightText: Copyright (C) 2017 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

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
        .module('OpalApp')
        .controller('PersonalTabController', PersonalTabController);

    PersonalTabController.$inject = ['$timeout', 'Navigator', 'NetworkStatus', 'Params',
        'ProfileSelector', 'Questionnaires', 'RequestToServer', 'UserHospitalPreferences', 'UserPreferences'];

    function PersonalTabController($timeout, Navigator, NetworkStatus, Params,
        ProfileSelector, Questionnaires, RequestToServer, UserHospitalPreferences, UserPreferences) {

        let vm = this;
        let setAccessLevel = () => vm.accessLevelAll = ProfileSelector.getAccessLevel() === "ALL";

        // variable to let the user know which hospital they are logged in
        vm.selectedHospitalToDisplay = "";
        vm.allowedModules = {};
        vm.getDisplayData = getDisplayData;

        vm.personalDeviceBackButton = () => tabbar.setActiveTab(0);

        vm.goToClinicalQuestionnaire = goToClinicalQuestionnaire;
        vm.goToClinicalReference = goToClinicalReference;

        activate();

        //////////////////////////

        function activate() {
            Navigator.setNavigator(personalNavigator);

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
                    vm.educationalMaterialsUnreadNumber = result.data.unread_educationalmaterial_count;
                    vm.researchUnreadNumber = calculateResearchBadge(result.data);

                    // Refresh the visible menu items based on access level when changing profiles
                    setAccessLevel();
                });
            } catch (error) {
                // TODO: Error handling improvements: https://o-hig.atlassian.net/browse/QSCCD-463
                console.error(error);
            }
        }

        /**
         * @description Calculates the total value of the "unread items" badge for the research menu based on
         *              the enabled research modules. If a module is not enabled (not visible), then it
         *              won't be included in the count.
         * @param {object} unreadCounts Object containing the number of unread items for each module.
         * @returns {number} The total value of all visible badges inside the research menu.
         */
        function calculateResearchBadge(unreadCounts) {
            let total = 0;
            let researchReferenceEnabled = vm.allowedModules.hasOwnProperty('REF') && vm.allowedModules['REF'];
            let researchQuestionnairesEnabled = vm.allowedModules.hasOwnProperty('RQU') && vm.allowedModules['RQU'];
            let researchConsentEnabled = vm.allowedModules.hasOwnProperty('CON') && vm.allowedModules['CON'];
            if (researchReferenceEnabled) total += parseInt(unreadCounts.unread_research_reference_count);
            if (researchQuestionnairesEnabled) total += parseInt(unreadCounts.unread_research_questionnaire_count);
            if (researchConsentEnabled) total += parseInt(unreadCounts.unread_consent_questionnaire_count);
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
            personalNavigator.pushPage('views/personal/questionnaires/questionnairesList.html', {questionnairePurpose: 'clinical'});
        }

        /**
         * @desc Navigates to the clinical reference material list.
         */
        function goToClinicalReference() {
            personalNavigator.pushPage('views/personal/education/education.html', {category: 'clinical'});
        }
    }
})();
