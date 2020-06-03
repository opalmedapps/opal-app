/*
 *Code by David Herrera May 20, 2015
 *Github: dherre3
 *Email:davidfherrerar@gmail.com
 */
(function() {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('TabsController', TabsController);

    TabsController.$inject = ['$timeout',  '$scope'];

    function TabsController($timeout, $scope) {

        var vm = this;

        vm.analyze = analyze;

        activate();

        /////////////////////////

        function activate(){
            $scope.tour = './views/home/tour/tour.html';

            if (!localStorage.getItem('firstInstall')){
                localStorage.setItem('firstInstall', '1');
                $timeout(function () {
                    tourModal.show();
                },500);
            }
        }

        function analyze(event){
            if(event.index === tabbar.getActiveTabIndex()){
                event.cancel()
            }
            else{
                tabbar.setActiveTab(e.index);
            }
        }
    }
})();
