

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('CaregiversController', CaregiversController);

        CaregiversController.$inject = ['$timeout', 'RequestToServer', 'Params', 'Patient', 'NavigatorParameters'];

    /* @ngInject */
    function CaregiversController($timeout, RequestToServer, Params, Patient, NavigatorParameters) {
        var vm = this;
        vm.error = null;
        vm.notFound = null;
        vm.message = null;
        vm.apiData;
        vm.caregivers;

        activate();

        function activate() {
            // NavigatorParameters.getNavigator();
            getCaregiversList();
        }

        async function getCaregiversList() {
            try {
                const patientSerNum = Patient.getPatientSerNum();
                const requestParams = Params.API.ROUTES.CAREGIVERS;
                const formatedParams = {
                    ...requestParams,
                    url: requestParams.url.replace('<PATIENT_ID>', patientSerNum),
                }
                // Request return 404 at the moment. The endpoint in the django backend is not implemented. (QSCCD-132)
                // The URL format need to be validated (QSCCD-132)
                // Temporary mock data. Values should come from result
                // Responsefor mat need to be validated
                // const result = await RequestToServer.apiRequest(formatedParams);
                const result = {
                    data: [
                        {id: 1, lastName: 'Bouvier', firstName: 'Marge'},
                        {id: 2, lastName: 'Bouvier', firstName: 'Selma'},
                    ]
                };
                // const result = {data: []};
                (result.data.length <= 0) ? vm.notFound = true : vm.apiData = result.data;
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
