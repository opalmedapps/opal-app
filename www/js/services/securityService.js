(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .factory('Security', SecurityService);

    SecurityService.$inject = [];

    /* @ngInject */
    function SecurityService() {


        /**
         * Controls the security state of the app.
         * Values set to true means 'secure' state, values set to false means 'insecure'
         * @type {{validVersion: {value: boolean, callbacks: Array}}}
         */
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

        //call this when you know state has been changed
        function notifyObservers(state){
            security_state[state].callbacks.forEach(callback => {
                callback();
            })
        }
    }
})();