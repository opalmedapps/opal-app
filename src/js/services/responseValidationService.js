// SPDX-FileCopyrightText: Copyright (C) 2018 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

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
        .module('OpalApp')
        .factory('ResponseValidator', ResponseValidator);

    ResponseValidator.$inject = ['$filter', 'Firebase', '$state', '$window', 'Security', 'EncryptionService', 'Params', 'Toast'];

    /* @ngInject */
    function ResponseValidator($filter, Firebase, $state, $window, Security, EncryptionService, Params, Toast) {

        /**
         * Expose API to consumers
         */
        return {
            validate: validate,
            validateApiResponse: validateApiResponse
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
            // TODO improve error handling flow, taking into account which response types are encrypted and which ones aren't
            if (response.Code === Params.REQUEST.CODE.ENCRYPTION_ERROR) {
                return {error: response}
            }
            else if (response.Code === Params.REQUEST.CODE.INVALID_VERSION) return handleResponseError(response);
            else {
                response.Timestamp = timestamp;
                clearTimeout(timeOut);

                if (!encryptionKey) response = EncryptionService.decryptData(response);

                if (response.Code === Params.REQUEST.CODE.SUCCESS) {
                    return {success: response};
                } else {
                    return handleResponseError(response)
                }
            }
        }

        /**
         * @description Validate response incoming from the new listener's section. On error show the toast with the error message.
         * @param {object} response Object fetch from firebase
         * @returns {object} A decrypted response object on success, an error data object on error
         */
        function validateApiResponse(response) {
            let decryptedresponse = (typeof response.status_code === 'number') ? response : EncryptionService.decryptData(response);
            // TODO: Create a list of all valid status codes and check that
            if (response.status_code !== Params.API.SUCCESS && response.status_code !== Params.API.CREATED) {
                return new Error(`API ERROR: ${response.status_code}: ${response.data.errorMessage}`);
            }
            return decryptedresponse;
        }



        /**
         * Handles responses that have an error code
         * @param response
         * @returns {*}
         */
        function handleResponseError(response){
            switch (response.Code) {
                case Params.REQUEST.CODE.SERVER_ERROR:
                case Params.REQUEST.CODE.TOO_MANY_ATTEMPTS:
                case Params.REQUEST.CODE.CLIENT_ERROR:
                    return {error: response};
                case Params.REQUEST.CODE.INVALID_VERSION:
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
            Firebase.signOut();

            // Change state of security
            Security.update('validVersion', false)
        }
    }
})();
