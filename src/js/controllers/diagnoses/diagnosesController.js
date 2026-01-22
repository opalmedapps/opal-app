// SPDX-FileCopyrightText: Copyright (C) 2016 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/*
 * Filename     :   diagnosesController.js
 * Description  :   Manages the diagnosis view.
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   27 Apr 2017
 */

/**
 * @ngdoc controller
 * @requires Diagnoses
 * @description Controller for the diagnoses view.
 */

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller('DiagnosesController', DiagnosesController);

    /* @ngInject */
    DiagnosesController.$inject = ['Diagnoses'];


    function DiagnosesController(Diagnoses) {
        const vm = this;

        vm.title = 'DiagnosesController';
        vm.diagnoses = [];
        vm.noDiagnosis = false;

        // Used by patient-data-handler
        vm.setDiagnosesView = setDiagnosesView;

        activate();

        ////////////////

        function activate() {

        }

        /**
         * @description Filters and displays the diagnoses from the Diagnoses service. N/A diagnoses are not shown (case-insensitive).
         */
        function setDiagnosesView() {
            // Filter out "N/A" diagnoses
            vm.diagnoses = Diagnoses.getDiagnoses().filter(e => {
                // 'N/A' is a possible output from the OpalDB database function getDiagnosisDescription
                return e.Description.toUpperCase() !== 'N/A';
            });

            vm.noDiagnosis = vm.diagnoses.length === 0;
        }
    }
})();
