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
