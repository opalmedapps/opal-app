/**
 *@ngdoc controller
 *@name MUHCApp.service:logOutController
 *@requires FirebaseService, $state, RequestToServer, CleanUp, UserAuthorizationInfo
 *@description Logs users out on firebase and our servers, and then takes user to init page
 **/

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('logOutController', logOutController);

    logOutController.$inject = ['FirebaseService', '$state','RequestToServer','CleanUp', 'UserAuthorizationInfo','$window'];

    /* @ngInject */
    function logOutController(FirebaseService, $state, RequestToServer, CleanUp, UserAuthorizationInfo, $window) {
        activate();

        ////////////////

        function activate() {

            //remove the logged in user reference from DB
            // var refCurrentUser = FirebaseService.getDBRef('logged_in_users/' + UserAuthorizationInfo.getUsername());
            //
            // refCurrentUser.remove();

            //remove the saved authorized user info from session storage
            $window.sessionStorage.removeItem('UserAuthorizationInfo');

            //logout on server
            RequestToServer.sendRequest('Logout');

            //wipe all data
            CleanUp.clear();

            //signout on FireBase
            FirebaseService.signOut();

            //take user to init page
            $state.go('init');
        }
    }
})();
