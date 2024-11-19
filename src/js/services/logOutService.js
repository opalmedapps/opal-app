(function () {
    'use strict';

    angular
        .module('OpalApp')
        .factory('LogOutService', LogOutService);

    LogOutService.$inject = ['Firebase', 'RequestToServer', 'CleanUp', '$window', 'UserAuthorizationInfo',
        '$state', 'Constants', 'EncryptionService'];

    /* @ngInject */
    function LogOutService(Firebase, RequestToServer, CleanUp, $window, UserAuthorizationInfo,
                           $state, Constants, EncryptionService) {
        var service = {
            logOut: logOut
        };

        return service;

        ////////////////

        /**
         * logOut
         * @desc Logs users out on firebase and our servers and navigate the user to the init page,
         *       also clears out the security answers and set the device as untrusted if safeDevice is false
         * @param {boolean} safeDevice if false, clears out the security answers and set the device as untrusted
         * @param {boolean} kickedOut If true, the current user is being kicked out; the logged_in_users entry for the
         *                            user won't be removed, because another user is currently logged in.
         */
        function logOut(safeDevice = true, kickedOut = false) {
            // If the current user is logging out normally, remove their "logged_in_users" entry from Firebase.
            // If they are being kicked out, leave it there to reflect that someone is still logged into that same account on another device.
            if (!kickedOut) {
                let refCurrentUser = Firebase.getDBRef(`logged_in_users/${UserAuthorizationInfo.getUsername()}`);
                Firebase.remove(refCurrentUser);
            }

            loadingmodal.hide();

            // Log the time when the patient signs out from the app
            if (Firebase.getCurrentUser()) RequestToServer.sendRequest('Logout');

            // remove the saved authorized user info from session storage
            $window.sessionStorage.removeItem('UserAuthorizationInfo');

            if (!safeDevice || !UserAuthorizationInfo.getTrusted()) {
                // device becomes untrusted
                localStorage.removeItem("deviceID");

                // clear out security answers
                localStorage.removeItem(EncryptionService.getStorageKey());

                // clear the cordova webview cache
                if (Constants.app) {
                    window.CacheClear(
                        function (status) {
                            console.log('Success clearing cache: ' + status);
                        },
                        function (error) {
                            console.log('error clearing cache: ' + error);
                        }
                    );
                }
            }

            // wipe all data
            CleanUp.clear();

            // take user to init page
            $state.go('init').then(() => {
                // Firebase sign out must be done after going to the init state to prevent onAuthStateChanged from re-triggering logout
                Firebase.signOut();
            });
        }
    }
})();
