// SPDX-FileCopyrightText: Copyright (C) 2020 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller('SetHospitalController', SetHospitalController);

    SetHospitalController.$inject = ['$filter', 'NativeNotification','UserHospitalPreferences'];

    /* @ngInject */
    function SetHospitalController($filter, NativeNotification, UserHospitalPreferences) {
        var vm = this;

        vm.hospitalList = {};
        vm.selectedHospitalCode = '';

        vm.saveSelectedHospital = saveSelectedHospital;

        activate();

        ////////////////

        function activate() {
            vm.hospitalList = UserHospitalPreferences.getHospitalListForDisplay();

            // set to selected the one choice stored
            vm.selectedHospitalCode = UserHospitalPreferences.getHospitalCode();
        }

        /*************************
         *  PUBLIC METHODS
         *************************/

        /**
         * @ngdoc method
         * @name saveSelectedHospital
         * @description Add the selected hospital to local storage and update firebase branch
         */
        function saveSelectedHospital() {
            try {
                UserHospitalPreferences.setHospital(vm.selectedHospitalCode);
            }
            catch (error) {
                console.error(error);
                NativeNotification.showNotificationAlert($filter('translate')("ERROR_SELECTING_HOSPITAL"));
            }
        }
    }
})();
