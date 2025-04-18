// SPDX-FileCopyrightText: Copyright (C) 2024 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/**
 * @description Service that helps manage the Onsen navigator.
 * @author David Herrera, Summer 2016, Email:davidfherrerar@gmail.com
 *         Refactored by Stacey Beard in May 2024.
 */
(function () {
    'use strict';

    angular
        .module('OpalApp')
        .factory('Navigator', Navigator);

    Navigator.$inject = ['$timeout', 'ProfileSelector'];

    function Navigator($timeout, ProfileSelector) {
        let navigator;

        return {
            getNavigator: () => navigator,
            getNavigatorName: () => navigator ? navigator._attrs.var : '',
            getPageName: getPageName,
            getParameters: () => navigator.getCurrentPage().options,
            getPreviousPageName: getPreviousPageName,
            reloadPreviousProfilePrepopHandler: reloadPreviousProfilePrepopHandler,
            setNavigator: nav => navigator = nav,
        }

        /**
         * @description Gets the file name of the current page in the navigator (e.g. notifications.html).
         * @returns {string} The name of the current page.
         */
        function getPageName() {
            let filePath = navigator.getCurrentPage().page;
            // Return only the last piece of the path, which is the file name
            return filePath.split('/').pop();
        }

        /**
         * @description Gets the file name of the previous page in the navigator (e.g. notifications.html).
         * @returns {string} The name of the previous page.
         */
        function getPreviousPageName() {
            // Read the second-to-last element of the pages array
            let pageCount = navigator.pages.length;
            if (pageCount < 2) return undefined;
            let filePath = navigator.pages[pageCount - 2].page;

            // Return only the last piece of the path, which is the file name
            return filePath.split('/').pop();
        }

        /**
         * @description Reload patient profile using profileID that was used on the previous page.
         *              The handler is invoked in case the profile was implicitly changed.
         *              E.g., opening up a caregiver's notification and going back to the Notifications page.
         * @param {string | string[]} previousPage The name of the previous page (e.g. notifications.html).
         *                              The profile will only be reset if prepop causes a return to the previous page.
         *                              This is needed because prepop events can occur when backing out of deeper pages
         *                              in the navigation stack (e.g. a deeper page inside lab results).
         *                              An array can be used if there are multiple possible previous pages.
         **/
        function reloadPreviousProfilePrepopHandler(previousPage) {
            // The previousPage parameter can contain a single value or an array of possible values
            if (!Array.isArray(previousPage)) previousPage = [previousPage];

            $timeout(() => {
                // Check if there is a patient profile that was active/set on the previous page
                let prevPageProfileID = this.getParameters()?.previousProfile;
                let previousProfile = ProfileSelector.getPatientList().find(
                    item => item.patient_legacy_id === prevPageProfileID
                )
                // If a previous profile was set, and if we're back on the right page, reload the previous profile
                if (
                    previousProfile
                    && previousPage.includes(getPageName())
                ) {
                    ProfileSelector.loadPatientProfile(prevPageProfileID);
                }
            }, 0);
        }
    }
})();
