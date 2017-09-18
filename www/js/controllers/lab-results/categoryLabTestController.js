/**
 * Created by PhpStorm.
 * User: James Brace
 * Date: 2017-09-18
 * Time: 3:15 PM
 */

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('CategoryLabTestController', CategoryLabTestController);

    CategoryLabTestController.$inject = ['LabResults', 'Logger'];

    /* @ngInject */
    function CategoryLabTestController(LabResults, Logger) {
        var vm = this;
        vm.title = 'CategoryLabTestController';
        vm.testResultsByCategory = null;

        activate();

        ////////////////

        function activate() {
            vm.testResultsByCategory = LabResults.getTestResultsByCategory();
            vm.testResultsByType = LabResults.getTestResultsArrayByType();
            Logger.sendLog('Lab Results', 'all - Type')
        }
    }
})();