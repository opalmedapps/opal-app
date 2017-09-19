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
    function DateLabTestController(LabResults, Logger) {
        var vm = this;

        activate();

        /////////////////////

        function activate(){
            //Initializing option

            vm.radioModel='All';
            vm.selectedTests=LabResults.getTestResultsArrayByDate();

            console.log(vm.selectedTests);

            vm.testsReceived = 'Lab results';
            Logger.sendLog('Lab Results', 'all - Date');
        }
    }
})();