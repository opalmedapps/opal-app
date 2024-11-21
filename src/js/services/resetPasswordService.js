/*
 * Filename     :   resetPasswordService.js
 * Description  :
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   03 Mar 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */

/**
 * @ngdoc service
 * @name MUHCApp.service:ResetPassword
 * @requires MUHCApp.service:Params
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
         *@methodOf MUHCApp.service:ResetPassword
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
         *@methodOf MUHCApp.service:ResetPassword
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
         *@methodOf MUHCApp.service:ResetPassword
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
