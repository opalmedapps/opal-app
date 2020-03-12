(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('SetHospitalController', SetHospitalController);

    SetHospitalController.$inject = ['UserHospitalPreferences'];

    /* @ngInject */
    function SetHospitalController(UserHospitalPreferences) {
        var vm = this;

        vm.hospitalObj = {};
        vm.selectedHospitalKey = '';

        vm.saveSelectedHospital = saveSelectedHospital;

        activate();

        ////////////////

        function activate() {
            // bring hospital list into view
            vm.hospitalObj = UserHospitalPreferences.getHospitalList();

            // set to selected the one choice stored
            vm.selectedHospitalKey = UserHospitalPreferences.getHospital();
        }

        /*************************
         *  PUBLIC METHODS
         *************************/

        /**
         * @ngdoc method
         * @name saveSelectedHospital
         * @methodOf MUHCApp.controllers.SetHospitalController
         * @description Add the selected hospital to local storage and update firebase branch
         */
        function saveSelectedHospital(){
            // add the selected hospital to the local storage and update firebase branch
            UserHospitalPreferences.setHospital(vm.selectedHospitalKey);
        }
    }
})();

