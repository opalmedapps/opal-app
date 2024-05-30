/**
 * @description Service helping to manage the Onsen navigator.
 * @author David Herrera, Summer 2016, Email:davidfherrerar@gmail.com
 *         Refactored by Stacey Beard in May 2024.
 */
(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .factory('Navigator', Navigator);

    Navigator.$inject = ['ProfileSelector', 'UpdateUI'];

    function Navigator(ProfileSelector, UpdateUI) {
        let navigator;

        return {
            getNavigator: () => navigator,
            getNavigatorName: navigator._attrs.var,
            getParameters: () => navigator.getCurrentPage().options,
            reloadPreviousProfilePrepopHandler: reloadPreviousProfilePrepopHandler,
            setNavigator: nav => navigator = nav,
        }

        /**
         *@ngdoc method
         *@name reloadPreviousProfilePrepopHandler
         *@desc Reload patient profile using profileID that was used on the previous page.
         *      The handler is invoked in case the profile was implicitly changed.
         *      E.g., opening up a caregiver's notification and going back to the Notifications page.
         *@methodOf MUHCApp.service:NavigatorParameters
         *@param {Array<string>} [categories=[]] The categories to update (force to refresh).
         *@return {Object} Returns a handler function for the prepop event.
         **/
        function reloadPreviousProfilePrepopHandler(categories = []) {
            // Patient profile that was active/set on the previous page
            let prevPageProfileID = this.getParameters()?.currentProfile;
            let previousProfile = ProfileSelector.getPatientList().find(
                (item) => item.patient_legacy_id == prevPageProfileID
            )
            // Reload profile that was active/set on the previous page
            if (
                this.getParameters()?.isCareReceiver
                && previousProfile
            ) {
                ProfileSelector.loadPatientProfile(prevPageProfileID);

                // Special case for the 'NewLabResult' and 'Appointments' categories:
                // reload these categories in case they were already loaded.
                // Reload lab results in case user decides to open them through Notifications page.
                // Reload appointments in case user decides to open them through Home page (e.g., Upcoming appointment)
                let forceRefreshCategories = ['Appointments', 'PatientTestDates', 'PatientTestTypes'];
                let categoriesToRefresh = categories.filter(category => forceRefreshCategories.includes(category));
                UpdateUI.updateTimestamps(categoriesToRefresh, 0);
            }
        }
    }
})();
