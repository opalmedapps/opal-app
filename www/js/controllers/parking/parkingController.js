/*
*Code by David Herrera May 20, 2015
*Github: dherre3
*Email:davidfherrerar@gmail.com
*/

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('ParkingController', ParkingController);

    ParkingController.$inject = ['NavigatorParameters', 'UserPreferences'];

    /* @ngInject */
    function ParkingController(NavigatorParameters, UserPreferences) {
        var vm = this;

        var navigatorName;

        vm.goToParkingLink = goToParkingLink;

        activate();

        /////////////////////////

        function activate(){
            vm.navigatorName = navigatorName;
            vm.navigator = window[navigatorName];
        }

        function goToParkingLink(type){
            if(type === 'general')
            {
                if (UserPreferences.getLanguage().toUpperCase() === "EN"){
                    window.open('https://muhc.ca/glen/handbook/parking-hospital','_blank');
                } else {
                    window.open('https://cusm.ca/glen/handbook/stationnement','_blank');
                }

            }else if(type ==='oncology'){
                NavigatorParameters.setParameters({type:type});
                window[navigatorName].pushPage('./views/general/parking/parking-details.html');
            }
        }
    }
})();



