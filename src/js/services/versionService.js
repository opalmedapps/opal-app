// SPDX-FileCopyrightText: Copyright (C) 2022 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/*
 * Author Limin 2022-07-05
 * Refactored by Limin on 2022-07-07
 */

/**
 * @ngdoc service
 * @requires $filter
 * @requires $q
 * @description API service used for app version information.
 **/
(function() {
    'use strict';

    angular
        .module('OpalApp')
        .factory('Version', Version);

    Version.$inject = ['$filter','$q','RequestToServer', 'Constants', '$http'];

    function Version($filter, $q, RequestToServer, Constants, $http) {

        /**
         * @ngdoc property
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
         * @description get the version update information.
         **/
        async function getVersionUpdates(lastVersion, currentVersion, language) {
            var r = $q.defer();

            await $http.get(version_url).then(function successCallback(response) {
                try {
                    let versions = response.data;
                    versions.sort(function(v1, v2){return versionCompare(v2.VERSION, v1.VERSION)});
                    let updates = [];
                    versions.forEach(function(value) {
                        if (versionCompare(value.VERSION, lastVersion) === 1 &&
                            versionCompare(value.VERSION, currentVersion) !== 1 &&
                            value[`DESCRIPTION_${language}`])
                        {
                            let infoData = {};
                            let description = value[`DESCRIPTION_${language}`];
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
            }, function errorCallback(response) {
                console.log(response);
                r.reject(response);
            });

            return r.promise;
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
         * @description get the current version of the app.
         **/
        function currentVersion() {
            return Constants.version();
        }
    }
})();
