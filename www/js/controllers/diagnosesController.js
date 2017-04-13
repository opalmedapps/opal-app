//
// Author: David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
/**
 * @ngdoc controller
 * @name MUHCApp.controller:DiagnosesController
 * @requires Diagnoses
 * @requires UserPreferences
 * @description Controller for the diagnoses view.
 */

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('DiagnosesController', DiagnosesController);

    DiagnosesController.$inject = ['Diagnoses','UserPreferences', 'UpdateUI'];

    /* @ngInject */
    function DiagnosesController(Diagnoses, UserPreferences, UpdateUI) {
        var vm = this;
        vm.title = 'DiagnosesController';
        vm.diagnoses = [];
        vm.language = '';

        activate();

        ////////////////

        function activate() {
            //load the diagnoses array into view
            vm.diagnoses=Diagnoses.getDiagnoses();

            //grab the language
            vm.language = UserPreferences.getLanguage();
        }
    }

})();


