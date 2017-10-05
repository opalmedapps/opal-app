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

    TabsController.$inject = ['$timeout', '$translatePartialLoader', '$scope'];

    function TabsController($timeout, $translatePartialLoader, $scope) {

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
            $translatePartialLoader.addPart('all-views');
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
