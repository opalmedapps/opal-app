(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('PatientsController', PatientsController);

        PatientsController.$inject = ['$timeout', 'RequestToServer', 'Params', 'Patient', 'NavigatorParameters'];

    /* @ngInject */
    function PatientsController($timeout, RequestToServer, Params, Patient, NavigatorParameters) {
        var vm = this;
        vm.error = null;
        vm.notFound = null;
        vm.message = null;
        vm.apiData;
        vm.patients;
        vm.getInitials = getInitials;
        vm.getIconColor = getIconColor;

        activate();

        function activate() {
            getPatientList();
        }

        /**
         * @description - Get list of patient related to the current user.
         */
        async function getPatientList() {
            try {
                const requestParams = Params.API.ROUTES.PATIENTS;
                const result = {
                    data: [
                        {id: 1, lastName: 'Simpson', firstName: 'Homer', status: 'Approved'},
                        {id: 2, lastName: 'Simpson', firstName: 'Bart', status: 'Pending'},
                    ]
                };
                // const result = await RequestToServer.apiRequest(requestParams);
                // const result = {data: []};
                (result.data.length <= 0) ? vm.notFound = true : vm.apiData = result.data;
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

        /**
         * @param {string} firstName User's first name. 
         * @param {string} lastName User's last name
         * @returns The patient initals to be displayed in the colored circle.
         */
        function getInitials(firstName, lastName) {
            return `${firstName.substr(0, 1)} ${lastName.substr(0, 1)}`
        }

        /**
         * @param {int} index Index of the current patient in the iteration.
         * @returns The colors code used for the patient circle.
         */
        function getIconColor(index) {
            const colorList = [
                '#037AFF',
                '#FF8351',
                '#FEC63D',
                '#B38DF7',
                '#C9BB1C',
                '#1CC925',
                '#1CC99B',
                '#1C59C9',
                '#871CC9'
            ];
            if (index >= colorList.length) return `#${Math.floor(Math.random()*16777215).toString(16)}`;
            return colorList[index];
        }
      
    }
})();
