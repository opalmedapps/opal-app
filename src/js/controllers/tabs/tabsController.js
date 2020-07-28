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

    TabsController.$inject = ['$timeout', '$translatePartialLoader'];

    function TabsController($timeout, $translatePartialLoader) {

        var vm = this;

       // vm.openTour = openTour;
        vm.analyze = analyze;
        
        activate();

        /////////////////////////

        function activate() {
            
            if (!localStorage.getItem('firstInstall')) {
                
                localStorage.setItem('firstInstall', '1');
                $timeout(function () {
                    firstLoginTourModal.show();
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

        //function openTour() {
        //    //NavigatorParameters.setParameters({
        //    //    Navigator: navigatorName
        //    //});
        //    //navigator.pushPage('/views/home/tour/tour.html');

        //    NavigatorParameters.setParameters({ 'Navigator': navigatorName });
        //    $window[navigatorName].pushPage('./views/home/tour/tour.html')
        //}
    }
})();
