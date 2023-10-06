/**
 *@ngdoc service
 *@name MUHCApp.service:Hospital
 * @requires MUHCApp.service:RequestToServer
 * @requires MUHCApp.service:Params
 *@description Service used to manage patient's hospital settings (e.g., parking info)
 **/

(function() {
    'use strict';

    angular
        .module('MUHCApp')
        .factory('Hospital', Hospital);

    Hospital.$inject = [
        'RequestToServer', 'Params'
    ];

    /* @ngInject */
    function Hospital(RequestToServer, Params) {
        const endpoint = Params.API.ROUTES.HOSPITAL_SETTINGS.SITES;

        let requestHospitalService = {
            requestSiteInfo: requestSiteInfo,
        };

        return requestHospitalService;

        ////////////////

        /**
         * @name requestSiteInfo
         * @desc this function gets site info for the sites linked to a particular hospital
         * @returns {Promise} resolves to the sites' data if success
         */
        async function requestSiteInfo(){
            const result = await RequestToServer.apiRequest(endpoint);
            return result.data;
        }
    }
})();
