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
        activate();

        ////////////////

        function activate() {

            //load the diagnoses array into view
            vm.diagnoses = Diagnoses.getDiagnoses();
            setDiagnosesView(vm.diagnoses);

            if(vm.diagnoses.length === 0) vm.noDiagnosis = true;

            //grab the language
            vm.language = UserPreferences.getLanguage();
        }

        // Function to remove the diagnoses from the list if the diagnoses name has N/A or n/a
        function setDiagnosesView(diagnoses) {
            let filterDiagnoses = [];
            for (var i = 0, j = 0; i < diagnoses.length; i++) {
                if ((diagnoses[i].Description_EN).toUpperCase() !== 'N/A' || (diagnoses[i].Description_FR).toUpperCase() !== 'N/A') {
                    filterDiagnoses[j] = diagnoses[i];
                    j++;
                }
            }
            vm.diagnoses = filterDiagnoses;
        }
    }

})();


