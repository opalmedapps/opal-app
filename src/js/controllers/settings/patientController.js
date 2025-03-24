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
