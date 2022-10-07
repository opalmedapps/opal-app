(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('CaregiversController', CaregiversController);

    CaregiversController.$inject = ['$timeout', 'RequestToServer', 'Params', 'ProfileSelector'];

    /* @ngInject */
    function CaregiversController($timeout, RequestToServer, Params, ProfileSelector) {
        var vm = this;
        vm.error = null;
        vm.notFound = null;
        vm.message = null;
        vm.apiData;
        vm.caregivers;

        getCaregiversList();

        async function getCaregiversList() {
            try {
                const patientSerNum = ProfileSelector.getLoggedInUserPatientId();
                const requestParams = Params.API.ROUTES.CAREGIVERS;
                const formatedParams = {
                    ...requestParams,
                    url: requestParams.url.replace('<PATIENT_ID>', patientSerNum),
                }
                const result = await RequestToServer.apiRequest(formatedParams);
                (result.data?.length <= 0) ? vm.notFound = true : vm.apiData = result.data;
            } catch (error) {
                vm.error = true;
                console.error(error);
            }
            handleDisplay();
        }

        function handleDisplay() {
            $timeout(() => {
                if (vm.error) return vm.message = 'RELATIONSHIPS_CAREGIVERS_ERROR';
                if (vm.notFound) return vm.message = 'RELATIONSHIPS_CAREGIVERS_NOT_FOUND';
                vm.caregivers = vm.apiData;
            });
        }
    }
})();
