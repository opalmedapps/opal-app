(function () {
    'use strict';

    angular
        .module('MUHCApp')
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
            getHospitalByCode: getHospitalByCode,
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
            return OPAL_CONFIG.settings.useRealInstitutionNames ? selectedHospital.fullNameReal : selectedHospital.fullNameGeneric;
        }

        /**
         * @description Returns the acronym of the currently selected hospital.
         *              The returned value depends on the environment setting useRealInstitutionNames.
         * @returns {string} The acronym of the currently selected hospital.
         */
        function getHospitalAcronym() {
            if (!selectedHospital) return '';
            return OPAL_CONFIG.settings.useRealInstitutionNames ? selectedHospital.acronymReal : selectedHospital.acronymGeneric;
        }

        /**
         * @description Initializes this service. Loads the value of the previously selected hospital from local storage,
         *              and initializes the base firebase URL.
         */
        function initializeHospital() {
            // Read the previous hospital choice stored in local storage
            let localStorageHospitalCode = window.localStorage.getItem(localStorageHospitalKey);
            selectedHospital = getHospitalByCode(localStorageHospitalCode);

            // Update the firebase branch
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
         * @returns {{uniqueHospitalCode: string, acronym: string, fullName: string}[]} The list of hospitals for display.
         */
        function getHospitalListForDisplay() {
            let useRealName = OPAL_CONFIG.settings.useRealInstitutionNames;
            return hospitalList.map(entry => {
                return {
                    uniqueHospitalCode: entry.uniqueHospitalCode,
                    acronym: useRealName ? entry.acronymReal : entry.acronymGeneric,
                    fullName: useRealName ? entry.fullNameReal : entry.fullNameGeneric,
                }
            });
        }
    }
})();
