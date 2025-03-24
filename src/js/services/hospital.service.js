/**
 *@ngdoc service
 *@description Service used to manage patient's hospital settings (e.g., parking info)
 **/

(function() {
    'use strict';

    angular
        .module('OpalApp')
        .factory('Hospital', Hospital);

    Hospital.$inject = [
        'RequestToServer', 'Params'
    ];

    /* @ngInject */
    function Hospital(RequestToServer, Params) {

        let requestHospitalService = {
            requestSiteInfo: requestSiteInfo,
            requestInstitutionInfo: requestInstitutionInfo,
        };

        return requestHospitalService;

        ////////////////

        /**
         * @name requestSiteInfo
         * @desc this function gets site info for the sites linked to a particular hospital
         * @returns {Promise} resolves to the sites' data if success
         */
        async function requestSiteInfo() {
            const result = await RequestToServer.apiRequest(Params.API.ROUTES.HOSPITAL_SETTINGS.SITES);
            return result.data;
        }

        /**
         * @desc this function gets institution info for the institution the user is connected to
         * @returns {Promise} resolves to the institution data if success
         */
        async function requestInstitutionInfo() {
            const result = await RequestToServer.apiRequest(Params.API.ROUTES.HOSPITAL_SETTINGS.INSTITUTION);
            return result.data;
        }
    }
})();
