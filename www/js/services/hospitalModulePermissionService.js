(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .factory('HospitalModulePermission', HospitalModulePermission);

    HospitalModulePermission.$inject = ['Params', 'UserPreferences'];

    /* @ngInject */
    function HospitalModulePermission(Params, UserPreferences) {

        let hospitalList = Params.hospitalList;
        let selectedHospitalKey = UserPreferences.getHospital();

        let service = {
            getHospitalFullName: getHospitalFullName,
            getHospitalAcronym: getHospitalAcronym,
            getHospitalAllowedModules: getHospitalAllowedModules,
            isThereSelectedHospital: isThereSelectedHospital,
            getHospitalUniqueCode: getHospitalUniqueCode,
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

        function getHospitalAllowedModules (isBeforeLogin) {
            if (!isThereSelectedHospital() || isBeforeLogin){
                return Params.allowedModulesBeforeLogin;
            } else {
                return hospitalList[selectedHospitalKey].modules;
            }
        }

        function isThereSelectedHospital (){
            selectedHospitalKey = UserPreferences.getHospital();
            return selectedHospitalKey !== '' && selectedHospitalKey !== null && selectedHospitalKey !== undefined && hospitalList.hasOwnProperty(selectedHospitalKey);
        }

        function getHospitalUniqueCode (){
            if (isThereSelectedHospital()){
                return hospitalList[selectedHospitalKey].uniqueHospitalCode;
            } else {
                return '';
            }
        }
    }

})();

