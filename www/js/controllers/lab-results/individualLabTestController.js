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

        vm.getTestClass = getTestClass;
        vm.getAbnormalFlagString = getAbnormalFlagString;

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

        function getTestClass(test){
            return LabResults.getTestClass(test);
        }

        /**
         * getAbnormalFlagString
         * @author Stacey Beard
         * @date 2019-01-11
         * @desc Formats the abnormal flag to display after a test result.
         *       If there is a flag, returns it in parentheses and preceded by a space.
         *       If there is no flag, returns an empty string.
         * @param test Test for which to format the abnormal flag.
         * @returns {string} Formatted abnormal flag.
         */
        function getAbnormalFlagString(test){
            if (test.AbnormalFlag){
                return " ("+test.AbnormalFlag+")";
            }
            else{
                return "";
            }
        }
    }
})();
