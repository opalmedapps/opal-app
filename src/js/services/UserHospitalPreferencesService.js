// SPDX-FileCopyrightText: Copyright (C) 2020 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .factory('UserHospitalPreferences', UserHospitalPreferences);

    UserHospitalPreferences.$inject = ['Params', 'UserPreferences', 'Firebase'];

    /* @ngInject */
    function UserHospitalPreferences(Params, UserPreferences, Firebase) {

        let hospitalList = CONFIG.settings.useProductionHospitals ? Params.productionHospitalList : Params.developmentHospitalList;
        let selectedHospital;
        let localStorageHospitalKey = Params.localStorageHospitalKey;

        let service = {
            getHospitalAcronym: () => selectedHospital?.acronym || '',
            getHospitalAllowedModules: () => selectedHospital?.modules,
            getHospitalCode: () => selectedHospital?.uniqueHospitalCode,
            getHospitalFullName: () => selectedHospital?.fullName || '',
            getHospitalList: () => hospitalList,
            mustKickOutConcurrentUsers: () => selectedHospital?.kickOutConcurrentUsers,
            initializeHospital: initializeHospital,
            isThereSelectedHospital: () => !!selectedHospital,
            setHospital: setHospital,
        };

        return service;

        ////////////////

        /**
         * @description Finds and returns a hospital listing based on its uniqueHospitalCode.
         * @param {string} code The uniqueHospitalCode to search for.
         * @returns {object|undefined} Returns the hospital code object, or undefined it isn't found.
         */
        function getHospitalByCode(code) {
            return hospitalList.find(entry => entry.uniqueHospitalCode === code);
        }

        /**
         * @description Initializes this service. Loads the value of the previously selected hospital from local storage,
         *              and initializes the base firebase URL.
         */
        function initializeHospital() {
            let hospital;

            // Default to the only available hospital if there's only one choice (from the list available to the user)
            if (hospitalList.length === 1) {
                hospital = getHospitalByCode(hospitalList[0].uniqueHospitalCode);
            }
            else {
                // Read the previous hospital choice stored in local storage
                const localStorageHospitalCode = window.localStorage.getItem(localStorageHospitalKey);
                hospital = getHospitalByCode(localStorageHospitalCode);
            }

            // Save the selection if it's a valid entry
            if (hospital && hospital.enabled) selectedHospital = hospital;

            // If a selection was initialized, update the firebase branch
            if (selectedHospital) Firebase.updateFirebaseUrl(selectedHospital.uniqueHospitalCode + '/');
        }

        /**
         * @description Sets the currently selected hospital.
         * @param {string} hospitalCode The uniqueHospitalCode of the selected hospital.
         * @throws Throws an error if the hospitalCode value isn't found in the hospital list.
         */
        function setHospital(hospitalCode) {
            // Store the new selection in this service
            selectedHospital = getHospitalByCode(hospitalCode);
            if (!selectedHospital) throw `Invalid hospital key: ${hospitalCode}`;

            // Store the hospital choice in local storage
            window.localStorage.setItem(localStorageHospitalKey, hospitalCode);

            // Update the firebase branch
            Firebase.updateFirebaseUrl(hospitalCode + '/');
        }
    }
})();
