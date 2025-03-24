/*
 *Code by David Herrera May 20, 2015
 *Github: dherre3
 *Email:davidfherrerar@gmail.com
 */
(function() {
    'use strict';

    angular
        .module('OpalApp')
        .controller('TabsController', TabsController);

    TabsController.$inject = ['$timeout', '$translatePartialLoader'];

    function TabsController($timeout, $translatePartialLoader) {

        activate();

        /////////////////////////

        function activate() {
            if (!localStorage.getItem('firstInstall')) {
                localStorage.setItem('firstInstall', '1');
                $timeout(function () {
                    securityModal.show();
                },500);
            }
            $translatePartialLoader.addPart('all-views');
        }
    }
})();
