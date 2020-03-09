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
        let allowedModulesBeforeLogin =  {
            "DIA": 0,
            "TRP": 0,
            "APT": 0,
            "LAB": 0,
            "DOC": 0,
            "TRT": 0,
            "TTM": 0,
            "QUE": 0,
            "CSQ": 0,
            "CHK": 0,
            "LAO": 1,
            "NTF": 0,
            "ANN": 0,
            "PAT": 0,
            "PFP": 0,
            "FEE": 0,
            "FFD": 0,
            "MAS": 0,
            "EDU": 0,
            "SUP": 0,
            "CED": 0,
            "HOS": 0,
        };

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
                return allowedModulesBeforeLogin;
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

