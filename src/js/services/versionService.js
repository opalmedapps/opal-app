/*
 * Author Limin 2022-07-05
 * Refactored by Stacey Beard on 2022-07-07
 */

/**
 * @ngdoc service
 * @name MUHCApp.service:Version
 * @requires $filter
 * @requires $q
 * @requires MUHCApp.service:RequestToServer
 * @description API service used for app version information.
 **/
(function() {
    'use strict';

    angular
        .module('MUHCApp')
        .factory('Version', Version);

    Version.$inject = ['$filter','$q','RequestToServer', 'Constants', '$timeout'];

    function Version($filter, $q, RequestToServer, Constants, $timeout) {

        /**
         * @ngdoc property
         * @name MUHCApp.service.#Version
         * @propertyOf MUHCApp.service:Version
         * @description Initializing array that represents all the information for Version.
         *              This array is passed to appropriate controllers.
         */

        let versions = [];

        let service =  {
            requestVersionUpdates: requestVersionUpdates,
            currentVersion: currentVersion,
        };

        return service;

        /**
         * @ngdoc method
         * @name requestVersionUpdates
         * @methodOf MUHCApp.service:Version
         * @description Grabs all the version updates from the server.
         **/
        function requestVersionUpdates() {
            let r = $q.defer();

            RequestToServer.sendRequestWithResponse('VersionUpdates')
                .then(function (response) {
                    if (response.Data && response.Data.length > 0) {
                        r.resolve(response.Data);
                    } else {
                        r.reject('No updates');
                    }
                })
                .catch(function (error) {
                    console.log('Error in VersionUpdates: ', error);
                    r.reject(error);
                });

            return r.promise;
        }

        /**
         * @ngdoc method
         * @name currentVersion
         * @methodOf MUHCApp.service:Version
         * @description get the current version of the app.
         **/
        function currentVersion() {
            return Constants.version();
        }
    }
})();
