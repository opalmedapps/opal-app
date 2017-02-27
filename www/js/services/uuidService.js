(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .factory('UUID', UUID);

    UUID.$inject = [];

    /* @ngInject */
    function UUID() {

        var uuid = '';

        var service = {
            generate: b,
            setUUID: setUUID,
            getUUID: getUUID
        };
        return service;

        ////////////////

        // See broofa/node-uuid
        function b(a){

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
                    b            // random hex digits
                )
        }

        function setUUID(UUID){
            uuid = UUID;
        }

        function getUUID(){
            return uuid;
        }

    }
})();

