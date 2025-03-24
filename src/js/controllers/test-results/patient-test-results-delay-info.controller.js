/**
 * @file Controller for the delay info page
 */
(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('PatientTestResultsDelayInfoController', PatientTestResultsDelayInfoController);

    PatientTestResultsDelayInfoController.$inject = ['$timeout', 'Hospital', 'Params'];

    function PatientTestResultsDelayInfoController($timeout, Hospital, Params) {

        const vm = this;
        vm.loading = true;
        vm.alert = undefined;

        activate();

        //////////////////////////////////////////

        async function activate() {
            try {
                let institution = await Hospital.requestInstitutionInfo();

                $timeout(() => {
                    vm.default_interpretable = institution.interpretable_lab_result_delay;
                    vm.default_non_interpretable = institution.non_interpretable_lab_result_delay;
                    vm.loading = false;
                });
            } catch (error) {
                $timeout(() => {
                    // TODO: Error handling improvements: https://o-hig.atlassian.net/browse/QSCCD-463
                    console.error(error);

                    vm.loading = false;

                    vm.alert = {
                        type: Params.alertTypeDanger,
                        content: "PAGE_ACCESS_ERROR"
                    };
                })
            }
        }
    }
})();
