(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .factory('Security', SecurityService);

    SecurityService.$inject = [];

    /* @ngInject */
    function SecurityService() {

        let security_state = {
            validVersion: {
                value: true,
                callbacks: []
            }
        };

        return {
            register: registerCallback,
            update: updateState
        };

        //////////////////////////

        //register an observer
        function registerCallback(state, callback){
            security_state[state].callbacks.push(callback);
        }

        function updateState(state, value){
            security_state[state].value = value;

            if (value === false) {
                notifyObservers(state);
            }
        }

        //call this when you know 'foo' has been changed
        function notifyObservers(state){
            security_state[state].callbacks.forEach(callback => {
                callback();
            })
        }
    }
})();