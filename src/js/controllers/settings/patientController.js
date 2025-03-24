(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('PatientsController', PatientsController);

        PatientsController.$inject = ['$timeout', 'ProfileSelector'];

    /* @ngInject */
    function PatientsController($timeout, ProfileSelector) {
        var vm = this;
        vm.error = null;
        vm.notFound = null;
        vm.message = null;
        vm.apiData;
        vm.patients;
        vm.getRelationshipStatusText = (status) => `RELATIONSHIPS_PATIENTS_STATUS_${status}`;

        activate();

        /**
         * @description - Get list of patient related to the current user.
         */
        async function activate() {
            try {
                const patientList = ProfileSelector.getPatientList();
                patientList.length <= 0 ? vm.notFound = true : vm.apiData = patientList;
            } catch (error) {
                vm.error = true;
                console.error(error);
            }
            handleDisplay();
        }

        /**
         * @descripiton Handle display of data, not foundm or error message.
         */
        function handleDisplay() {
            $timeout(() => {
                if (vm.error) return vm.message = 'RELATIONSHIPS_ERROR';
                if (vm.notFound) return vm.message = 'RELATIONSHIPS_PATIENTS_NOT_FOUND';
                vm.patients = vm.apiData;
            });
        }
    }
})();
