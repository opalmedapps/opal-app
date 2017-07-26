/*
 *Code by David Herrera May 20, 2015
 *Github: dherre3
 *Email:davidfherrerar@gmail.com
 */

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('logOutController', logOutController);

    logOutController.$inject = ['FirebaseService', '$state','RequestToServer','CleanUp', '$rootScope'];

    /* @ngInject */
    function logOutController(FirebaseService, $state, RequestToServer, CleanUp, $rootScope) {
        var vm = this;
        vm.title = 'logOutController';

        activate();

        ////////////////

        function activate() {
            var Ref= firebase.database().ref('dev2/');

            var refCurrentUser = Ref.child('logged_in_users/' + $rootScope.uid);

            refCurrentUser.remove();

            RequestToServer.sendRequest('Logout');

            CleanUp.clear();

            FirebaseService.getAuthentication().$signOut();
            $state.go('init');
        }
    }

})();
