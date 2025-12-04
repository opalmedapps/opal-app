// SPDX-FileCopyrightText: Copyright (C) 2020 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller('SetHospitalController', SetHospitalController);

    SetHospitalController.$inject = ['$filter', 'DynamicContent', 'NativeNotification', 'Toast', 'UserHospitalPreferences', 'UserPreferences'];

    /* @ngInject */
    function SetHospitalController($filter, DynamicContent, NativeNotification, Toast, UserHospitalPreferences, UserPreferences) {
        var vm = this;

        let hospitalMessages;
        let language;

        vm.hospitalList = {};
        vm.selectedHospitalCode = '';

        // Used with ng-style to grey out the hospital name when the entry is disabled
        vm.styleHospitalDisabled = hospital => hospital.enabled ? {} : { color: '#bbb' };
        vm.showOptionalMessageOnClick = showOptionalMessageOnClick;
        vm.saveSelectedHospital = saveSelectedHospital;

        activate();

        ////////////////

        function activate() {
            vm.hospitalList = UserHospitalPreferences.getHospitalList();
            hospitalMessages = DynamicContent.getConstant('hospitalMessages');
            language = UserPreferences.getLanguage();

            // set to selected the one choice stored
            vm.selectedHospitalCode = UserHospitalPreferences.getHospitalCode();

            // Show a general message on this page if one was configured
            showOptionalMessage();
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

        /**
         * @description Shows an optional general message on the hospital selector page (without clicking on any hospital).
         */
        function showOptionalMessage() {
            let message = hospitalMessages?.['general']?.[language.toLowerCase()];
            if (message) Toast.showToast({ message, position: 'bottom' });
        }

        /**
         * @description Shows an optional message when clicking on a hospital to select it.
         *              Useful for giving a reason when a hospital is disabled.
         * @param {object} hospital The hospital which was selected.
         */
        function showOptionalMessageOnClick(hospital) {
            let message = hospitalMessages?.[hospital.uniqueHospitalCode]?.[language.toLowerCase()];
            if (message) Toast.showToast({ message, position: 'bottom' });
        }
    }
})();
