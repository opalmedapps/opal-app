(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller('CaregiversController', CaregiversController);

    CaregiversController.$inject = ['$timeout', 'Navigator', 'Params', 'RequestToServer', 'User'];

    /* @ngInject */
    function CaregiversController($timeout, Navigator, Params, RequestToServer, User) {
        let vm = this;
        let navigator;

        vm.error = null;
        vm.message = null;
        vm.apiData;
        vm.caregivers;
        vm.loadingList = true;  // This is for loading the list of caregivers
        vm.getRelationshipStatusText = (status) => `RELATIONSHIPS_PATIENTS_STATUS_${status}`;
        vm.goToCaregiversInfo = () => navigator.pushPage('views/settings/info-page-relationship-type.html', {id: 'caregivers'});

        activate();

        ////////////////

        async function activate() {
            navigator = Navigator.getNavigator();
            await getCaregiversList();
        }

        async function getCaregiversList() {
            try {
                const selfPatientSerNum = User.getSelfPatientSerNum();
                // Special case: if the user doesn't have a self relationship, then this user has no caregivers
                if (!selfPatientSerNum) {
                    vm.apiData = [];
                    handleDisplay();
                    vm.loadingList = false;
                    return;
                }

                const requestParams = Params.API.ROUTES.CAREGIVERS;
                const formattedParams = {
                    ...requestParams,
                    url: requestParams.url.replace('<PATIENT_ID>', selfPatientSerNum),
                }
                const result = await RequestToServer.apiRequest(formattedParams);
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
                if (vm.apiData.length === 0) return vm.message = 'RELATIONSHIPS_CAREGIVERS_NONE';
                vm.caregivers = vm.apiData;
            });
        }
    }
})();
