(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('SetHospitalController', SetHospitalController);

    SetHospitalController.$inject = ['UserPreferences', 'Params', 'FirebaseService'];

    /* @ngInject */
    function SetHospitalController(UserPreferences, Params, FirebaseService) {
        var vm = this;

        vm.hospitalObj = {};
        vm.selectedHospitalKey = '';

        vm.saveSelectedHospital = saveSelectedHospital;

        activate();

        ////////////////

        function activate() {
            // bring hospital list into view
            vm.hospitalObj = Params.hospitalList;

            // set to selected the one choice stored
            vm.selectedHospitalKey = UserPreferences.getHospital();
        }

        /*************************
         *  PUBLIC METHODS
         *************************/

        /**
         * @ngdoc method
         * @name saveSelectedHospital
         * @methodOf MUHCApp.controllers.SetHospitalController
         * @description Add the selected hospital to local storage
         */
        function saveSelectedHospital(){
            // add the selected hospital to the local storage and update firebase branch
            UserPreferences.setHospital(vm.selectedHospitalKey);
        }
    }
})();

