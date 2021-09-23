(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .factory('LogOutService', LogOutService);

    LogOutService.$inject = ['FirebaseService', 'RequestToServer', 'CleanUp', '$window', 'UserAuthorizationInfo',
        '$state', 'Constants'];

    /* @ngInject */
    function LogOutService(FirebaseService, RequestToServer, CleanUp, $window, UserAuthorizationInfo,
                           $state, Constants) {
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
         */
        function logOut(safeDevice = true) {
            // remove the logged in user reference from DB
            // var refCurrentUser = FirebaseService.getDBRef('logged_in_users/' + UserAuthorizationInfo.getUsername());
            //
            // refCurrentUser.remove();

            loadingmodal.hide();

            // Log the time when the patient signs out from the app
            if (firebase.auth().currentUser) RequestToServer.sendRequest('Logout');

            // remove the saved authorized user info from session storage
            $window.sessionStorage.removeItem('UserAuthorizationInfo');

            // wipe all data
            CleanUp.clear();

            if (!safeDevice || !UserAuthorizationInfo.getTrusted()) {
                // device becomes untrusted
                localStorage.removeItem("deviceID");

                // clear out security answers
                localStorage.removeItem(UserAuthorizationInfo.getUsername() + "/securityAns");

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

            // take user to init page
            $state.go('init').then(() => {
                // Firebase sign out must be done after going to the init state to prevent onAuthStateChanged from re-triggering logout
                FirebaseService.signOut();
            });
        }
    }

})();

