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
        const vm = this;

        let navigatorName;

        vm.goToParkingLink = goToParkingLink;

        activate();

        /////////////////////////

        function activate(){
            navigatorName = NavigatorParameters.getParameters();
        }

        function goToParkingLink(type){
            let url = '';
            let app = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;

            if(type === 'general') {
                if (UserPreferences.getLanguage().toUpperCase() === "EN") {
                    url = 'https://muhc.ca/patient-and-visitor-parking#glen';
                    // window.open('https://muhc.ca/glen/handbook/parking-hospital', '_blank');
                } else {
                    url = 'https://cusm.ca/stationnement';
                    // window.open('https://cusm.ca/glen/handbook/stationnement', '_blank');
                }
                
                if (app) {
                    cordova.InAppBrowser.open(url, '_blank', 'location=yes');
                } else {
                    window.open(url, '_blank');
                }
            }
            else if (type === 'gettingtohospital') {
                if (UserPreferences.getLanguage().toUpperCase() === "EN") {
                    url = 'https://muhc.ca/glen';
                    // window.open('https://muhc.ca/glen/handbook/getting-hospital-5', '_blank');
                } else {
                    url = 'https://cusm.ca/glen';
                    // window.open('https://cusm.ca/glen/handbook/comment-vous-y-rendre', '_blank');
                }

                if (app) {
                    cordova.InAppBrowser.open(url, '_blank', 'location=yes');
                } else {
                    window.open(url, '_blank');
                }

            } else if (type ==='oncology'){
                NavigatorParameters.setParameters({type:type});
                window[navigatorName].pushPage('./views/general/parking/parking-details.html');
            }
        }
    }
})();



