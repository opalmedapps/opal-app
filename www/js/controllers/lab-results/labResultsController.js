(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('LabResultsController', LabResultsController);

    LabResultsController.$inject = ['LabResults', 'NewsBanner', '$filter'];

    /* @ngInject */
    function LabResultsController(LabResults, NewsBanner, $filter) {

        var vm = this;
        vm.refresh = refresh;

        activate();

        //////////////////////////////////

        function activate() {
            vm.loading = true;
            // Check if the data is 300s old if it is get again
            if(LabResults.getLastUpdated() < Date.now() - 300000){
                LabResults.setTestResults()
                    .then(function () {
                        vm.testResultsByDate = LabResults.getTestResultsArrayByDate();
                        vm.loading = false;
                    }).catch(function (error) {
                        // TODO: CATCH ERROR PROPERLY
                        vm.loading = false;
                });
            } else {
                vm.testResultsByDate = LabResults.getTestResultsArrayByDate();
                vm.loading = false;
            }
        }

        function refresh() {
            // Only allowed to refresh once every 60s.
            if(LabResults.getLastUpdated() < Date.now() - 60000) {
                vm.loading = true;
                LabResults.setTestResults().then(function () {
                    vm.loading = false;
                }).catch(function (error) {
                    vm.loading = false;
                });
            } else {
                NewsBanner.showCustomBanner($filter('translate')("REFRESH_WAIT"), '#333333', function(){}, 3000);
            }
        }
    }
})();



