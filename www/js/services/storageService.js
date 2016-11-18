(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .factory('Storage', Storage);

    Storage.$inject = ['EncryptionService'];

    /* @ngInject */
    function Storage(EncryptionService) {
        var service = {
            write: write,
            read: read,
            hasKey: hasKey,
            remove: remove
        };
        return service;

        ////////////////

        function write(key, value) {
            localStorage.setItem(key, EncryptionService.encryptData(JSON.stringify(value)));
        }

        function read(key){
            return JSON.parse(EncryptionService.decryptData(localStorage.getItem(key)));
        }

        function hasKey(key) {
            return localStorage.getItem(key);
        }

        function remove(key) {
            localStorage.removeItem(key);
        }
    }

})();

