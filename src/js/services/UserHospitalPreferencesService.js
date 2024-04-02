(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .factory('UserHospitalPreferences', UserHospitalPreferences);

    UserHospitalPreferences.$inject = ['Params', 'UserPreferences', 'Firebase'];

    /* @ngInject */
    function UserHospitalPreferences(Params, UserPreferences, Firebase) {

        let hospitalList = Params.hospitalList;
        let selectedHospitalKey = '';
        let localStorageHospitalKey = Params.localStorageHospitalKey;

        let service = {
            getHospitalFullName: getHospitalFullName,
            getHospitalAcronym: getHospitalAcronym,
            getHospitalAllowedModules: getHospitalAllowedModules,
            isThereSelectedHospital: isThereSelectedHospital,
            initializeHospital: initializeHospital,
            setHospital: setHospital,
            getHospital: getHospital,
            getHospitalList: getHospitalList,
            getAllowedModulesBeforeLogin: getAllowedModulesBeforeLogin,
            getHospitalInstitutionCode: getHospitalInstitutionCode,
        };

        return service;

        ////////////////

        function getHospitalFullName () {
            if (isThereSelectedHospital()){
                return hospitalList[selectedHospitalKey].fullName;
            } else {
                return '';
            }
        }

        function getHospitalAcronym () {
            if (isThereSelectedHospital()){
                return hospitalList[selectedHospitalKey].acronym;
            } else {
                return '';
            }
        }

        function getHospitalAllowedModules () {
            if (!isThereSelectedHospital()){
                return Params.allowedModulesBeforeLogin;
            } else {
                return hospitalList[selectedHospitalKey].modules;
            }
        }

        function getAllowedModulesBeforeLogin () {
            return Params.allowedModulesBeforeLogin;
        }

        function isThereSelectedHospital (){
            return selectedHospitalKey !== '' && selectedHospitalKey !== null && selectedHospitalKey !== undefined && hospitalList.hasOwnProperty(selectedHospitalKey);
        }

        function getHospitalList (){
            return hospitalList;
        }

        /**
         * @name initializeHospital
         * @desc If hospital was already set previously within the app, set default to that hospital. Otherwise it sets hospital to '' as default.
         */
        function initializeHospital (){
            let localStorageHospital = window.localStorage.getItem(localStorageHospitalKey);

            if (localStorageHospital === undefined || localStorageHospital === null || !Object.keys(hospitalList).includes(localStorageHospital)){
                selectedHospitalKey = '';
            } else {
                selectedHospitalKey = localStorageHospital;

                // set hospital firebase branch
                Firebase.updateFirebaseUrl(hospitalList[localStorageHospital].uniqueHospitalCode + '/');
            }
        }

        function getHospital (){
            return selectedHospitalKey;
        }

        /**
         * @name getHospitalInstitutionCode
         * @desc Return the unique institution code of the selected hospital e.g A0, A4 etc
         * @returns institurionCode {string} Instituion code string
         */
        function getHospitalInstitutionCode(){
            if (hospitalList[window.localStorage.getItem(localStorageHospitalKey)]){
                return hospitalList[window.localStorage.getItem(localStorageHospitalKey)].uniqueHospitalCode;
            }
            // If trusted=False when a user logs out hospitalList could be empty when we try to clear the sec ans localStorage
            // In that case, return an empty string to avoid crashing
            return '';
            
        }

        /**
         * @name setHospital
         * @desc Setter method for patient hospital of preference
         * @param hospitalKey {string} The string denoting the hospital chosen, must be from the hospital list in constants.js
         */
        function setHospital (hospitalKey) {
            if (!Object.keys(hospitalList).includes(hospitalKey)){
                // TODO: error handling. This means that the hospital the user have entered does not exist
                return;
            }

            // store hospital choice in local storage
            window.localStorage.setItem(localStorageHospitalKey, hospitalKey);

            // update firebase hospital branch
            Firebase.updateFirebaseUrl(hospitalList[hospitalKey].uniqueHospitalCode + '/');

            // update local hospital
            selectedHospitalKey = hospitalKey;
        }
    }

})();

