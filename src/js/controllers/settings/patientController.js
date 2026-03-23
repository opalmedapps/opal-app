// SPDX-FileCopyrightText: Copyright (C) 2022 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller('PatientsController', PatientsController);

        PatientsController.$inject = ['$timeout', 'Navigator', 'ProfileSelector'];

    /* @ngInject */
    function PatientsController($timeout, Navigator, ProfileSelector) {
        let vm = this;
        let navigator;

        vm.error = null;
        vm.message = null;
        vm.apiData;
        vm.patients;
        // See translations for: RELATIONSHIPS_PATIENTS_STATUS_CON, RELATIONSHIPS_PATIENTS_STATUS_DEN, RELATIONSHIPS_PATIENTS_STATUS_EXP, RELATIONSHIPS_PATIENTS_STATUS_PEN, RELATIONSHIPS_PATIENTS_STATUS_REV
        vm.getRelationshipStatusText = (status) => `RELATIONSHIPS_PATIENTS_STATUS_${status}`;
        vm.goToPatientsInfo = () => navigator.pushPage('views/settings/info-page-relationship-type.html', {id: 'patients'})

        activate();

        /**
         * @description - Get list of patient related to the current user.
         */
        async function activate() {
            navigator = Navigator.getNavigator();
            try {
                vm.apiData = ProfileSelector.getPatientList();
            } catch (error) {
                vm.error = true;
                console.error(error);
            }
            handleDisplay();
        }

        /**
         * @description Handle display of data, not found or error message.
         */
        function handleDisplay() {
            $timeout(() => {
                if (vm.error) return vm.message = 'RELATIONSHIPS_ERROR';
                if (vm.apiData.length === 0) return vm.message = 'RELATIONSHIPS_PATIENTS_NONE';
                vm.patients = vm.apiData;
            });
        }
    }
})();
