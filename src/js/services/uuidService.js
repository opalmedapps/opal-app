// SPDX-FileCopyrightText: Copyright (C) 2017 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/*
 * Filename     :   uuidService.js
 * Description  :   Service that generates UUIDS for browsers. These are needed to uniquely identify browsers
 *                  so they can be asscociated with specific security answers.
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   03 Mar 2017
 */


/**
 *@ngdoc service
 *@description Service used to generate UUIDs for browsers.
 **/

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .factory('UUID', UUID);

    UUID.$inject = ['Constants'];

    /* @ngInject */
    function UUID(Constants) {

        /**
         *@ngdoc property
         *@description UUID for the browser
         **/
        var uuid = '';

        var service = {
            generate: generate,
            setUUID: setUUID,
            getUUID: getUUID
        };
        return service;

        ////////////////

        /**
         * @ngdoc method
         * @name generate
         * @description Generates a random UUID for a browser
         * @returns {String} The UUID.
         **/
        function generate(a){
            return a           // if the placeholder was passed, return
                ? (              // a random number from 0 to 15
                    a ^            // unless b is 8,
                    window.crypto.getRandomValues(new Uint8Array(1))[0]  // in which case
                    * 16           // a random number from
                    >> a/4         // 8 to 11
                ).toString(16) // in hexadecimal
                : (              // or otherwise a concatenated string:
                    [1e7] +        // 10000000 +
                    -1e3 +         // -1000 +
                    -4e3 +         // -4000 +
                    -8e3 +         // -80000000 +
                    -1e11          // -100000000000,
                ).replace(     // replacing
                    /[018]/g,    // zeroes, ones, and eights with
                    generate            // random hex digits
                )
        }

        /**
         * @ngdoc method
         * @name setUUID
         * @param {String} UUID The UUID to set.
         * @description Sets the previously generated UUID in the service.
         **/
        function setUUID(UUID){
            uuid = UUID;
        }

        /**
         * @ngdoc method
         * @name getUUID
         * @description Gets the previously generated UUID.
         **/
        function getUUID(){
            if (Constants.app){
                return device.uuid
            } else {
                return uuid
            }
        }

    }
})();
