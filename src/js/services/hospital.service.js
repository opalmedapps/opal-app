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
            requestSiteInfo: requestSiteInfo,
        };

        return requestHospitalService;

        ////////////////

        /**
         * @name requestSiteInfo
         * @desc this function gets site info for the sites linked to a particular hospital
         * @param {string} hospitalKey - an ID of a particular hospital (institution)
         * @returns {Promise} resolves to the sites' data if success
         */
        async function requestSiteInfo(hospitalKey){
            // request parameters
            let params = {
                'institution__code': hospitalKey,
            };

            const result = await RequestToServer.apiRequest(endpoint, params);
            return result.data;
        }
    }
})();
