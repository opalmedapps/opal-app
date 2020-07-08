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
 *@ngdoc service
 *@name MUHCApp.service:ResetPassword
 *@requires Firebase
 *@description Service used to verify and confirm password resets.
 **/

var myApp=angular.module('MUHCApp');
myApp.service('ResetPassword',function(){

    var auth = firebase.app().auth();

    return{
        /**
         *@ngdoc method
         *@name verifyLinkCode
         *@param {String} url Url that is provided by the redirect from the reset email.
         *@methodOf MUHCApp.service:ResetPassword
         *@description verifies the password reset code sent to the user.
         **/
        verifyLinkCode: function (url) {

            var oobCode = this.getParameter('oobCode', url);

            if(oobCode){
                return auth.verifyPasswordResetCode(oobCode[1]);
            } else {
                return Promise.reject({Code: "auth/invalid-action-code"})
            }

        },

        /**
         *@ngdoc method
         *@name completePasswordChange
         *@param {String} oobCode  Code sent to user from the reset password email.
         *@param {String} newPassword  New user password.
         *@methodOf MUHCApp.service:ResetPassword
         *@description confirms the password reset.
         *@returns {Promise} Returns promise containing void.
         **/
        completePasswordChange : function (oobCode, newPassword) {

            return auth.confirmPasswordReset(oobCode[1], newPassword)
        },

        /**
         *@ngdoc method
         *@name getParameter
         *@param {String} param  Parameter to search for in query string.
         *@param {String} url  URL to scan for parameter.
         *@methodOf MUHCApp.service:ResetPassword
         *@description Scans the URL using regular expressions for parameters.
         *@returns {Object} The parameter and its value.
         **/
        getParameter: function(param, url){
            // Getting the query string param and value
            var regex = new RegExp('[?&]' + param +'=([^&#]*)', 'i');
            return regex.exec(url);
        }
    };


});
