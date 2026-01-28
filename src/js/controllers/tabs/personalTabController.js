// SPDX-FileCopyrightText: Copyright (C) 2017 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/**
 * Created by PhpStorm.
 * User: James Brace
 * Date: 2017-09-20
 * Time: 12:00 PM
 */

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller('PersonalTabController', PersonalTabController);

    PersonalTabController.$inject = ['$filter', '$timeout', 'Navigator', 'NetworkStatus', 'Params',
        'ProfileSelector', 'RequestToServer', 'UserHospitalPreferences'];

    function PersonalTabController($filter, $timeout, Navigator, NetworkStatus, Params,
        ProfileSelector, RequestToServer, UserHospitalPreferences) {

        let vm = this;
        let setAccessLevel = () => vm.accessLevel = ProfileSelector.getAccessLevel();

        vm.navigator = undefined;
        // variable to let the user know which hospital they are logged in
        vm.selectedHospitalToDisplay = UserHospitalPreferences.getHospitalFullName();

        vm.getDisplayData = getDisplayData;
        vm.personalDeviceBackButton = () => tabbar.setActiveTab(0);

        activate();

        //////////////////////////

        function activate() {
            vm.navigator = personalNavigator;
            Navigator.setNavigator(vm.navigator);

            // Call early to prevent flickering of hidden menu items
            setAccessLevel();

            bindEvents();

            if (NetworkStatus.isOnline()) getDisplayData();
        }

        function bindEvents() {
            // Refresh the page on coming back from other pages
            vm.navigator.on('prepop', function () {
                if (NetworkStatus.isOnline()) getDisplayData();
            });
            //This avoids constant repushing which causes bugs
            vm.navigator.on('prepush', function (event) {
                if (vm.navigator._doorLock.isLocked()) {
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
                    // Refresh the visible menu items based on access level when changing profiles
                    setAccessLevel();

                    vm.appointmentsUnreadNumber = result.data.unread_appointment_count;
                    vm.labsUnreadNumber = result.data.unread_lab_result_count;
                    vm.documentsUnreadNumber = result.data.unread_document_count;
                    vm.txTeamMessagesUnreadNumber = result.data.unread_txteammessage_count;
                    vm.notificationsUnreadNumber = result.data.unread_notification_count;
                    vm.questionnairesUnreadNumber = result.data.unread_questionnaire_count;
                    vm.educationalMaterialsUnreadNumber = result.data.unread_educationalmaterial_count;
                    vm.researchUnreadNumber = calculateResearchBadge(result.data);
                });
            } catch (error) {
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
            let researchReferenceEnabled = $filter('moduleIsEnabled')('REF', vm.accessLevel);
            let researchQuestionnairesEnabled = $filter('moduleIsEnabled')('RQU', vm.accessLevel);
            let researchConsentEnabled = $filter('moduleIsEnabled')('CON', vm.accessLevel);
            if (researchReferenceEnabled) total += parseInt(unreadCounts.unread_research_reference_count);
            if (researchQuestionnairesEnabled) total += parseInt(unreadCounts.unread_research_questionnaire_count);
            if (researchConsentEnabled) total += parseInt(unreadCounts.unread_consent_questionnaire_count);
            return total;
        }
    }
})();
