/**
 * __author__ : James Brace
 *
 * The purpose of this service is to preserve the security state of the app. Security is defined in an object literal
 * called 'security_state'. Each state field consists of another object literal that consists of the 'value' of the
 * sub-state .. ie can take on value 'true' for secure and 'false' for insecure .. and the 'callbacks' which is an array
 * of functions that controllers can bind to in order to monitor changes in security state
 */
(function () {
    'use strict';

    angular
        .module('OpalApp')
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

        // update the state, if insecure notify the observers via their callbacks
        function updateState(state, value){
            security_state[state].value = value;

            if (value === false) {
                notifyObservers(state);
            }
        }

        //notify observers about insecure state
        // TODO: perhaps reflect on situations where you want to notify on 'secure' state
        function notifyObservers(state){
            security_state[state].callbacks.forEach(callback => {
                callback();
            })
        }
    }
})();