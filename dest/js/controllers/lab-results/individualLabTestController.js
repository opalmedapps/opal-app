/**
 * Created by PhpStorm.
 * User: James Brace
 * Date: 2017-09-18
 * Time: 3:16 PM
 */

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('IndividualLabTestController', IndividualLabTestController);

    IndividualLabTestController.$inject = ['LabResults'];

    /* @ngInject */
    function IndividualLabTestController(LabResults) {
        var vm = this;
        var page;
        var test;

        activate();

        /////////////////////

        function activate() {
            page = personalNavigator.getCurrentPage();
            test = page.options.param;


            if (test.testResults) {
                vm.test = test;
                vm.selectedLabResults = test.testResults;
                vm.testDate = test.testDate;
                vm.testResultsByCategory = LabResults.getTestResultsByCategory();

            }

            // Update title
            vm.title = 'Lab Results - ' + vm.testDate;
            vm.goToSpecificTestView=function(test)
            {
                personalNavigator.pushPage('./views/personal/lab-results/specific-test-component.html',{param:test});
            }
        }

    }
})();
