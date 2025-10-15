// SPDX-FileCopyrightText: Copyright (C) 2016 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/*
 * Filename     :   diagnoses.controller.legacy.js
 * Description  :   Manages the diagnosis view.
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   27 Apr 2017
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
        .controller('DiagnosesControllerLegacy', DiagnosesControllerLegacy);

    /* @ngInject */
    DiagnosesControllerLegacy.$inject = ['Diagnoses','UserPreferences'];


    function DiagnosesControllerLegacy(Diagnoses, UserPreferences) {
        var vm = this;
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
