
/**
 *@ngdoc service
 *@name MUHCApp.service:Hospital
 * @requires MUHCApp.service:RequestToServer
 * @requires MUHCApp.service:Patient
 * @requires MUHCApp.service:Params
 *@description Service used to manage patient's hospital settings (e.g., parking info)
 **/

(function() {
    'use strict';

    angular
        .module('MUHCApp')
        .factory('Hospital', Hospital);

    Hospital.$inject = [
        'RequestToServer', 'Patient', 'Params'
    ];

    /* @ngInject */
    function Hospital(RequestToServer, Patient, Params) {
        const endpoint = Params.HOSPITAL_SETTINGS.PARKING_INFO;

        let requestHospitalService = {
            requestParkingInfo: requestParkingInfo,
        };

        return requestHospitalService;

        ////////////////

        /**
         * @name requestParkingInfo
         * @desc this function gets parking info for a particular hospital
         * @param {string} hospitalKey - an ID of a particular hospital (institution)
         * @param {string} language - patient's language
         * @returns {Promise} resolves to the parking's data if success
         */
        function requestParkingInfo(hospitalKey, language){
            // request parameters
            let params = {
                'patientSerNum': Patient.getUserSerNum(),
                'institutionCode': hospitalKey,
                'language': language,
            };

            return RequestToServer.sendRequestWithResponse(endpoint, params)
                .then(function (response) {
                    // this is in case firebase delete the property when it is empty
                    if (response.hasOwnProperty('data')) {
                        return response.data;
                    }
                    return {};
                });
        }
    }
})();

