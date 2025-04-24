// SPDX-FileCopyrightText: Copyright (C) 2023 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/**
 * @description Service that manages concurrent logins in the app.
 */
(function () {
    'use strict';

    angular
        .module('OpalApp')
        .factory('ConcurrentLogin', ConcurrentLogin);

    ConcurrentLogin.$inject = ['$filter','$injector','Firebase','Toast','UserHospitalPreferences'];

    function ConcurrentLogin($filter, $injector, Firebase, Toast, UserHospitalPreferences) {

        // Ignore the first time "onValue" is triggered, since it will trigger once with current user's own initial data
        let firstValueChecked = false;

        // Firebase path on which concurrent logins are monitored for the current user at the current hospital
        let getUserRef = () => Firebase.getDBRef(`logged_in_users/${Firebase.getCurrentUser().uid}`);

        return {
            clearConcurrentLogin: clearConcurrentLogin,
            initConcurrentLogin: initConcurrentLogin,
        }

        /********************************/
        /******* PUBLIC FUNCTIONS *******/
        /********************************/

        /**
         * @description Initializes handling of concurrent logins.
         *              If applicable (based on kickOutConcurrentUsers from the hospital's settings in app.values.js),
         *              sets a listener to kick out users who are logged in at the same time.

         * @returns {Promise<void>}
         */
        async function initConcurrentLogin() {
            await recordCurrentLogin();
            if (UserHospitalPreferences.mustKickOutConcurrentUsers()) listenForConcurrentUserLogins();
        }

        /**
         * @description Clears data from this service.
         */
        function clearConcurrentLogin() {
            firstValueChecked = false;
            try {
                Firebase.off(getUserRef());
            }
            catch (error) {
                // Suppress an error if it occurs here; getUserRef might fail if the current user has already been logged out
                console.warn('Could not clear concurrent login listener:', error);
            }
        }

        /*********************************/
        /******* PRIVATE FUNCTIONS *******/
        /*********************************/

        /**
         * @description Adds a listener on Firebase to detect other user logins,
         *              in order to kick out the current user if someone else logs into the same
         *              account for the same hospital on another device.
         */
        function listenForConcurrentUserLogins() {
            const LogOutService = $injector.get('LogOutService');

            // Listen for changes to the user's token value on Firebase (under their uid)
            let refCurrentUser = getUserRef();
            Firebase.onValue(refCurrentUser, function (snapshot) {
                if (!firstValueChecked) {
                    // Do nothing with the first value; this is the current user's own token
                    firstValueChecked = true;
                }
                else if (snapshot.val()) {
                    /*
                     * Any further changes to the token value after this represent another device logging in.
                     * In this case, kick out the current user and clear the observer.
                     * However, ignore the case where snapshot.val() is null. This can happen if we clear the Firebase database.
                     * In this case, we don't want to incorrectly worry users by telling them that another person is logging into their account.
                     */
                    Firebase.off(refCurrentUser);
                    LogOutService.logOut(undefined, true);

                    // Show message "You have logged in on another device."
                    Toast.showToast({
                        message: $filter('translate')("KICKEDOUT"),
                    });
                }
            });
        }

        /**
         * @description Records the current login on Firebase, to kick out any others currently logged into
         *              the same account on another device.
         * @returns {Promise<void>}
         */
        async function recordCurrentLogin() {
            let firebaseUser = Firebase.getCurrentUser();
            let sessionToken = await firebaseUser.getIdToken();
            // Save the current session token to the user's "logged_in_users" branch
            let refCurrentUser = getUserRef();
            await Firebase.set(refCurrentUser, { 'Token' : sessionToken });
        }
    }
})();
