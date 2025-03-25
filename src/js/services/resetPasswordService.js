// SPDX-FileCopyrightText: Copyright (C) 2015 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/*
 * Filename     :   resetPasswordService.js
 * Description  :
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   03 Mar 2017
 */

/**
 * @ngdoc service
 * @description Service used to verify and confirm password resets.
 **/
(function() {
    'use strict';

    angular
        .module('OpalApp')
        .factory('ResetPassword', ResetPassword);

    ResetPassword.$inject = ['Firebase','Params'];

    function ResetPassword(Firebase, Params) {

        let service =  {
            verifyLinkCode: verifyLinkCode,
            completePasswordChange: completePasswordChange,
            getParameter: getParameter,
        };

        return service;

        /**
         *@ngdoc method
         *@name verifyLinkCode
         *@param {String} url Url that is provided by the redirect from the reset email.
         *@description verifies the password reset code sent to the user.
         **/
        function verifyLinkCode(url) {
            var oobCode = this.getParameter('oobCode', url);

            if (oobCode) {
                return Firebase.verifyPasswordResetCode(oobCode[1]);
            } else {
                return Promise.reject({Code: Params.invalidActionCode});
            }
        }

        /**
         *@ngdoc method
         *@name completePasswordChange
         *@param {String} oobCode  Code sent to user from the reset password email.
         *@param {String} newPassword  New user password.
         *@description confirms the password reset.
         *@returns {Promise} Returns promise containing void.
         **/
        async function completePasswordChange(oobCode, newPassword) {
            return await Firebase.confirmPasswordReset(oobCode[1], newPassword);
        }

        /**
         *@ngdoc method
         *@name getParameter
         *@param {String} param  Parameter to search for in query string.
         *@param {String} url  URL to scan for parameter.
         *@description Scans the URL using regular expressions for parameters.
         *@returns {Object} The parameter and its value.
         **/
        function getParameter(param, url){
            // Getting the query string param and value
            var regex = new RegExp('[?&]' + param +'=([^&#]*)', 'i');
            return regex.exec(url);
        }
    }
})();
