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

    /* @ngInject */
    DiagnosesController.$inject = ['Diagnoses','UserPreferences'];


    function DiagnosesController(Diagnoses, UserPreferences) {
        var vm = this;
        vm.title = 'DiagnosesController';
        vm.diagnoses = [];
        vm.language = '';
        vm.noDiagnosis = false;
        vm.showHeader = showHeader;

        // Used by patient-data-initializer
        vm.loading = false;
        vm.setDiagnosesView = setDiagnosesView;

        activate();

        ////////////////

        function activate() {
            vm.language = UserPreferences.getLanguage();
        }

        /**
         * @description Filters and displays the diagnoses from the Diagnoses service. N/A diagnoses are not shown.
         */
        function setDiagnosesView() {
            // Filter out "N/A" diagnoses
            vm.diagnoses = Diagnoses.getDiagnoses().filter(e => {
                return e[`Description_${vm.language}`].toUpperCase() !== 'N/A';
            });

            vm.noDiagnosis = vm.diagnoses.length === 0;
        }
        
        // Determines whether or not to show the date header in the view. Announcements are grouped by day.
        function showHeader(index)
        {
            if (index === 0) return true;
            var current = (new Date(vm.diagnoses[index].CreationDate)).setHours(0,0,0,0);
            var previous = (new Date(vm.diagnoses[index-1].CreationDate)).setHours(0,0,0,0);
            return current !== previous;
        }
    }
})();
