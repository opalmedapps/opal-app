/*
 * Author Limin 2022-07-05
 * Refactored by Limin on 2022-07-07
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

    Version.$inject = ['$filter','$q','RequestToServer', 'Constants'];

    function Version($filter, $q, RequestToServer, Constants) {

        /**
         * @ngdoc property
         * @name MUHCApp.service.#Version
         * @propertyOf MUHCApp.service:Version
         * @description Initializing array that represents all the information for Version.
         *              This array is passed to appropriate controllers.
         */

        const version_url = 'https://app.opalmedapps.ca/versions.json';

        let service =  {
            getVersionUpdates: getVersionUpdates,
            currentVersion: currentVersion,
        };

        return service;


        /**
         * @ngdoc method
         * @name getVersionUpdates
         * @methodOf MUHCApp.service:Version
         * @description get the version update information.
         **/
        async function getVersionUpdates(lastVersion, language) {
            var r = $q.defer();
            const https = require('https');
            // https.get is async
            await https.get(version_url,(res) => {
                let body = "";

                res.on("data", (chunk) => {
                    body += chunk;
                });

                res.on("end", () => {
                    try {
                        let versions = JSON.parse(body);
                        versions = versionSort(versions);
                        let updates = [];
                        versions.forEach(function(value) {
                            if (versionCompare(value.VERSION, lastVersion) === 1 && value.DESCRIPTION_EN) {
                                let infoData = {};
                                let description = language == 'EN' ? value.DESCRIPTION_EN : value.DESCRIPTION_FR;
                                description = formatVersionDescription(description);
                                infoData.title = value.VERSION;
                                infoData.content = description;
                                updates.push(infoData);
                            }
                        });
                        r.resolve(updates);
                    } catch (error) {
                        console.error(error.message);
                        r.reject(error.message);
                    };
                });
            }).on("error", (error) => {
                console.error(error.message);
                r.reject(error.message);
            });

            return r.promise;
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
         * @name versionSort
         * @desc sort the array by version asc
         */
        function versionSort(versions) {
            const length = versions.length;
            for (let i = 1; i < length; i++) {
                for (let j = length - 1; j >= i; j--) {
                    if (versionCompare(versions[j - 1].VERSION, versions[j].VERSION) === 1) {
                        const temp = versions[j];
                        versions[j] = versions[j - 1];
                        versions[j - 1] = temp;
                    }
                }
            }
            return versions;
        }

        /**
         * @name versionCompare
         * @desc compare version1 and version2
         *       return 1 if v1 is greater than v2
         *       return 0 if v1 = v2
         *       return -1 if v1 < v2
         */
        function versionCompare(v1, v2)
        {
            var a = v1.split('.');
            var b = v2.split('.');

            for (var i = 0; i < a.length; ++i) {
                a[i] = Number(a[i]);
            }
            for (var i = 0; i < b.length; ++i) {
                b[i] = Number(b[i]);
            }
            if (a.length == 2) {
                a[2] = 0;
            }

            if (a[0] > b[0]) return 1;
            if (a[0] < b[0]) return -1;

            if (a[1] > b[1]) return 1;
            if (a[1] < b[1]) return -1;

            if (a[2] > b[2]) return 1;
            if (a[2] < b[2]) return -1;

            return 0;
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
