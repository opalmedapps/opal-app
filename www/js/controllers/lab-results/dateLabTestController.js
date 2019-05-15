/**
 * Created by PhpStorm.
 * User: James Brace
 * Date: 2017-09-18
 * Time: 3:14 PM
 */
(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('DateLabTestController', DateLabTestController);

    DateLabTestController.$inject = ['LabResults', 'Logger'];

    /* @ngInject */
    function DateLabTestController(LabResults) {
        var vm = this;
        activate();

        /////////////////////

        function activate(){
            vm.radioModel='All';
            vm.selectedTests=LabResults.getTestResultsArrayByDate();
            vm.testsReceived = 'Lab results';
        }
    }
})();