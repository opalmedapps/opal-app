/*
 * Filename     :   diagnosesController.js
 * Description  :   Manages the diagnosis view.
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   27 Apr 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */

/**
 * @ngdoc controller
 * @requires Diagnoses
 * @requires UserPreferences
 * @description Controller for the diagnoses view.
 */

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller('DiagnosesController', DiagnosesController);

    /* @ngInject */
    DiagnosesController.$inject = ['Diagnoses','UserPreferences'];


    function DiagnosesController(Diagnoses, UserPreferences) {
        var vm = this;
        vm.title = 'DiagnosesController';
        vm.diagnoses = [];
        vm.language = '';
        vm.noDiagnosis = false;

        // Used by patient-data-handler
        vm.setDiagnosesView = setDiagnosesView;

        activate();

        ////////////////

        function activate() {
            vm.language = UserPreferences.getLanguage();
        }

        /**
         * @description Filters and displays the diagnoses from the Diagnoses service. N/A diagnoses are not shown (case-insensitive).
         */
        function setDiagnosesView() {
            // Filter out "N/A" diagnoses
            vm.diagnoses = Diagnoses.getDiagnoses().filter(e => {
                return e[`Description_${vm.language}`].toUpperCase() !== 'N/A';
            });

            vm.noDiagnosis = vm.diagnoses.length === 0;
        }
    }
})();
