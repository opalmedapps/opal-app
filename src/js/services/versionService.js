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

        const version_url = 'https://app.opalmedapps.ca/versions.json';

        let service =  {
            requestVersionUpdates: requestVersionUpdates,
            getVersionUpdates: getVersionUpdates,
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
         * @name getVersionUpdates
         * @methodOf MUHCApp.service:Version
         * @description get the version update information.
         **/
        function getVersionUpdates(lastVersion, language) {
            const https = require('https');
            let updates = [];

            // https.get is sync
            https.get(version_url,(res) => {
                let body = "";

                res.on("data", (chunk) => {
                    body += chunk;
                });

                res.on("end", () => {
                    try {
                        let versions = JSON.parse(body);
                        const last_version_num = dot2num(lastVersion);
                        versions.forEach(function(value) {
                            const loop_version_num = dot2num(value.VERSION);
                            if (loop_version_num > last_version_num && value.DESCRIPTION_EN) {
                                let infoData = {};
                                let description = language == 'EN' ? value.DESCRIPTION_EN : value.DESCRIPTION_FR;
                                description = formatVersionDescription(description);
                                infoData.title = value.VERSION;
                                infoData.content = description;
                                updates.push(infoData);
                            }
                        });
                    } catch (error) {
                        console.error(error.message);
                    };
                });
            }).on("error", (error) => {
                console.error(error.message);
            });

            return updates;
        }

        /**
         * @name formatVersionDescription
         * @desc format the descriptions as string
         */
        function formatVersionDescription(description) {
            let descriptions = '';
            if (description && description.length > 0) {
                description.forEach(function(value, index) {
                    descriptions += '\u2022 ' + value + '\n\n';
                });
            }
            return descriptions;
        }

        /**
         * @name dot2num
         * @desc convert version value to number
         */
        function dot2num(dot)
        {
            const d = dot.split('.');
            return ((((+d[0])*256)+(+d[1]))*256)+d[2];
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
