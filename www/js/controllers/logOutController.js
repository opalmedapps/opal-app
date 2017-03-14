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

    logOutController.$inject = ['FirebaseService', '$state','RequestToServer','CleanUp'];

    /* @ngInject */
    function logOutController(FirebaseService, $state, RequestToServer, CleanUp) {
        var vm = this;
        vm.title = 'logOutController';

        activate();

        ////////////////

        function activate() {

            console.log('Resetting services...');
            RequestToServer.sendRequest('Logout');

            CleanUp.clear();

            FirebaseService.getAuthentication().$signOut();
            console.log($state.go('init'));
        }
    }

})();
