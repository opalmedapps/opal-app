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

        let hospitalList = Params.hospitalList;
        let selectedHospital;
        let localStorageHospitalKey = Params.localStorageHospitalKey;

        let service = {
            getAllowedModulesBeforeLogin: () => Params.allowedModulesBeforeLogin,
            getHospitalAcronym: getHospitalAcronym,
            getHospitalAllowedModules: () => selectedHospital ? selectedHospital.modules : Params.allowedModulesBeforeLogin,
            getHospitalCode: () => selectedHospital?.uniqueHospitalCode,
            getHospitalFullName: getHospitalFullName,
            getHospitalListForDisplay: getHospitalListForDisplay,
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
         * @description Returns the full name of the currently selected hospital.
         *              The returned value depends on the environment setting useRealInstitutionNames.
         * @returns {string} The name of the currently selected hospital.
         */
        function getHospitalFullName() {
            if (!selectedHospital) return '';
            return CONFIG.settings.useRealInstitutionNames ? selectedHospital.fullNameReal : selectedHospital.fullNameGeneric;
        }

        /**
         * @description Returns the acronym of the currently selected hospital.
         *              The returned value depends on the environment setting useRealInstitutionNames.
         * @returns {string} The acronym of the currently selected hospital.
         */
        function getHospitalAcronym() {
            if (!selectedHospital) return '';
            return CONFIG.settings.useRealInstitutionNames ? selectedHospital.acronymReal : selectedHospital.acronymGeneric;
        }

        /**
         * @description Initializes this service. Loads the value of the previously selected hospital from local storage,
         *              and initializes the base firebase URL.
         */
        function initializeHospital() {
            let hospital;
            const displayHospitals = getHospitalListForDisplay();

            // Default to the only available hospital if there's only one choice (after checking the list displayed to the user)
            if (displayHospitals.length === 1) {
                hospital = getHospitalByCode(displayHospitals[0].uniqueHospitalCode);
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

        /**
         * @description Returns the list of available hospitals, formatted for display.
         *              The values in the returned object depend on the environment setting useRealInstitutionNames.
         *              Note: when useRealInstitutionNames = true, if a hospital has no real name or acronym, then it's
         *                    omitted from the list of real hospitals.
         * @returns {{uniqueHospitalCode: string, acronym: string, fullName: string}[]} The list of hospitals for display.
         */
        function getHospitalListForDisplay() {
            let useRealName = CONFIG.settings.useRealInstitutionNames;
            return hospitalList.map(entry => {
                // Special case: ignore generic-only hospitals (those without a real name) if real hospitals are used
                if (useRealName && (!entry.acronymReal || !entry.fullNameReal)) return undefined;
                return {
                    uniqueHospitalCode: entry.uniqueHospitalCode,
                    enabled: entry.enabled,
                    acronym: useRealName ? entry.acronymReal : entry.acronymGeneric,
                    fullName: useRealName ? entry.fullNameReal : entry.fullNameGeneric,
                }
            }).filter(entry => !!entry); // Filter out undefined entries
        }
    }
})();
