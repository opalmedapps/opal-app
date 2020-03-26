(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('LabResultsController', LabResultsController);

    LabResultsController.$inject = ['LabResults', 'NewsBanner', '$filter', '$timeout'];

    /* @ngInject */
    function LabResultsController(LabResults, NewsBanner, $filter, $timeout) {

        var vm = this;
        vm.refresh = refresh;
        vm.showTestResultsByDate = showTestResultsByDate;
        vm.showTestResultsByType = showTestResultsByType;
        vm.showByDate = true;
        vm.tests = [];
        activate();

        //////////////////////////////////

        function activate() {
            // Check if the data is 300s old if it is get again
            if(LabResults.getLastUpdated() < Date.now() - 300000) getLabResultsFromServer();
            else setLabTestsForDisplay();
        }

        function refresh() {
            // Only allowed to refresh once every 60s.
            if(LabResults.getLastUpdated() < Date.now() - 60000) getLabResultsFromServer();
            else NewsBanner.showCustomBanner($filter('translate')("REFRESH_WAIT"), '#333333', '#F0F3F4', 13, 'top', function(){}, 3000);
        }

        function getLabResultsFromServer() {
            vm.loading = true;
            return LabResults.setTestResults()
                .then(function () {
                    $timeout(function(){
                        vm.loading = false;
                        setLabTestsForDisplay();
                    });
                }).catch(function () {
                    vm.loading = false;
                    ons.notification.alert({
                        //message: 'Server problem: could not fetch data, try again later',
                        message: $filter('translate')("SERVERERRORALERT"),
                        modifier: (ons.platform.isAndroid())?'material':null
                    });
                });
        }
        function setLabTestsForDisplay(){
            if(vm.showByDate) showTestResultsByDate();
            else showTestResultsByType();
        }

        function showTestResultsByDate(){
            vm.showByDate = true;
            vm.tests = LabResults.getTestResultsArrayByDate();
        }

        function showTestResultsByType() {
            vm.showByDate = false;
            vm.tests = LabResults.getTestResultsArrayByType();
        }
    }
})();



