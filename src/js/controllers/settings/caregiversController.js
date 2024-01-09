(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('CaregiversController', CaregiversController);

    CaregiversController.$inject = ['$timeout', 'RequestToServer', 'Params', 'User'];

    /* @ngInject */
    function CaregiversController($timeout, RequestToServer, Params, User) {
        var vm = this;
        vm.error = null;
        vm.message = null;
        vm.apiData;
        vm.caregivers;
        vm.loadingList = true;  // This is for loading the list of caregivers
        vm.getRelationshipStatusText = (status) => `RELATIONSHIPS_PATIENTS_STATUS_${status}`;

        getCaregiversList();

        async function getCaregiversList() {
            try {
                const selfPatientSerNum = User.getSelfPatientSerNum();
                // Special case: if the user doesn't have a self relationship, then this user has no caregivers
                if (!selfPatientSerNum) {
                    vm.apiData = [];
                    handleDisplay();
                    return;
                }

                const requestParams = Params.API.ROUTES.CAREGIVERS;
                const formatedParams = {
                    ...requestParams,
                    url: requestParams.url.replace('<PATIENT_ID>', selfPatientSerNum),
                }
                const result = await RequestToServer.apiRequest(formatedParams);
                vm.apiData = result.data;
                vm.loadingList = false;
            } catch (error) {
                vm.error = true;
                console.error(error);
                vm.loadingList = false;
            }
            handleDisplay();
        }

        function handleDisplay() {
            $timeout(() => {
                if (vm.error) return vm.message = 'RELATIONSHIPS_CAREGIVERS_ERROR';
                console.log(vm.apiData.length, vm.apiData);
                if (vm.apiData.length === 0) return vm.message = 'RELATIONSHIPS_CAREGIVERS_NONE';
                vm.caregivers = vm.apiData;
            });
        }
    }
})();
