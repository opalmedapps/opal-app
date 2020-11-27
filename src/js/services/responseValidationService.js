/**
 * __author__ : James Brace
 *
 * The purpose of this service is to validate incoming responses from the Opal Listener. The first step of validation
 * is to make sure that the response does not contain an encryption error (mainly used during authentication). Afterwards,
 * it checks to see if the response is a SUCCESS or error. If SUCCESS it returns the response data, if ERROR then it handles
 * the error accordingly
 */

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .factory('ResponseValidator', ResponseValidator);

    ResponseValidator.$inject = ['FirebaseService', '$state', '$window', 'Security', 'EncryptionService'];

    /* @ngInject */
    function ResponseValidator(FirebaseService, $state, $window, Security, EncryptionService) {

        /**
         * ERROR CODES
         */
        const ENCRYPTION_ERROR = 1;
        const SERVER_RESPONSE_ERROR = 2;
        const CLIENT_ERROR = 400;
        const TOO_MANY_ATTEMPTS_ERROR = 4;
        const INVALID_VERSION_ERROR = 5;

        /**
         * SUCCESS CODE
         */
        const SUCCESS = 3;


        /**
         * Expose API to consumers
         */
        return {
            validate: validate
        };

        //////////////////////////////////

        /**
         * validates incoming response from listener
         * @param response
         * @param encryptionKey
         * @param timeOut
         */

        function validate(response, encryptionKey, timeOut) {
            let timestamp = response.Timestamp;

            if (response.Code === ENCRYPTION_ERROR) {
                return {error: response}
            } else {
                response.Timestamp = timestamp;
                clearTimeout(timeOut);

                if (!encryptionKey) response = EncryptionService.decryptData(response);

                if (response.Code === SUCCESS) {
                    return {success: response};
                } else {
                    return handleResponseError(response)
                }
            }
        }

        /**
         * Handles responses that have an error code
         * @param response
         * @returns {*}
         */
        function handleResponseError(response){
            switch (response.Code) {
                case SERVER_RESPONSE_ERROR:
                    return {error: response};
                case TOO_MANY_ATTEMPTS_ERROR:
                    return {error: response};
                case CLIENT_ERROR:
                    return {error: response};
                case INVALID_VERSION_ERROR:
                    handleInvalidVersionError();
                    return {error: {Code: 'INVALID_VERSION_ERROR'}}
            }
        }

        /**
         * Handles the special case where a response error is due to invalid version.
         * In this case, the user is logged out, brought to home, and then displayed an appropriate message by MainController
         */
        function handleInvalidVersionError(){

            //remove the saved authorized user info from session storage
            $window.sessionStorage.removeItem('UserAuthorizationInfo');

            //signout on FireBase
            FirebaseService.signOut();

            // Change state of security
            Security.update('validVersion', false)
        }
    }
})();