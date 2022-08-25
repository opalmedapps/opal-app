
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
        const endpoint = Params.API.ROUTES.HOSPITAL_SETTINGS.SITES;

        let requestHospitalService = {
            requestParkingInfo: requestParkingInfo,
        };

        return requestHospitalService;

        ////////////////

        /**
         * @name requestParkingInfo
         * @desc this function gets parking info for a particular hospital
         * @param {string} hospitalKey - an ID of a particular hospital (institution)
         * @returns {Promise} resolves to the parking's data if success
         */
        async function requestParkingInfo(hospitalKey){
            // request parameters
            let params = {
                'institution__code': hospitalKey,
            };

            const result = await RequestToServer.apiRequest(endpoint, params);
            return result.data;
        }
    }
})();

