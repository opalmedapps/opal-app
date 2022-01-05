(function() {
    'use strict';

    /**
     * hospitalService
     */

    angular
        .module('MUHCApp')
        .factory('Hospital', Hospital);

    Hospital.$inject = [
        'RequestToServer',
        'Params'
    ];

    /* @ngInject */
    function Hospital(RequestToServer, Params) {
        //TODO: fix - add to app values (Params.API_PARKING_INFO)
        const api = 'ParkingInfo';

        // this is redundant, but written for clarity, ordered alphabetically
        let requestHospitalService = {
            requestParkingInfo: requestParkingInfo,
        };

        return requestHospitalService;

        ////////////////

        /**
         * @name requestParkingInfo
         * @desc this function gets parking info for a particular hospital
         * @param {string} hospitalKey ID of a particular hospital (institution)
         * @param {string} language
         * @returns {Promise} resolves to the parking's data if success
         */
        function requestParkingInfo(hospitalKey, language){
            // Parameters
            let params = {
                'hospitalKey': hospitalKey,
                'language': language,
            };

            return RequestToServer.sendRequestWithResponse(api, params)
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

