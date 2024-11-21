/*
 * Filename     :   forgotPasswordController.js
 * Description  :   Controlls the forgot password view.
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   28 Apr 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */

/**
 *  @ngdoc controller
 *  @name MUHCApp.controllers: ForgotPasswordController
 *  @description
 *
 * Takes user inputted email and uses FireBases's API to send password reset email
 */

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller('ForgotPasswordController', ForgotPasswordController);

    ForgotPasswordController.$inject = ['$timeout','Firebase','Params'];

    /* @ngInject */
    function ForgotPasswordController($timeout, Firebase, Params) {
        var vm = this;

        /**
         * @ngdoc property
         * @name email
         * @propertyOf ForgotPasswordController
         * @returns string
         * @description user-inputted email value
         */
        vm.email = "";

        /**
         * @ngdoc property
         * @name alert
         * @propertyOf ForgotPasswordController
         * @returns object
         * @description displays alert to user if an error occurs
         */
        vm.alert = {
            type: null,
            message: null
        };

        vm.submitPasswordReset = submitPasswordReset;
        vm.clearErrors = clearErrors;
        vm.validateEmail = validateEmail;

        ////////////////

        /**
         * @ngdoc method
         * @name clearErrors
         * @methodOf MUHCApp.controllers.ForgotPasswordController
         * @description
         * Clears errors
         */
        function clearErrors() {
            vm.alert.type = null;
            vm.alert.message = null;
        }

        function validateEmail(email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        }

        /**
         * @ngdoc method
         * @name submitPasswordReset
         * @methodOf MUHCApp.controllers.ForgotPasswordController
         * @description
         * Submits the user-inputted email address to FireBase API. Either displays success or error message based on FireBase response.
         */
        function submitPasswordReset() {
            Firebase.sendPasswordResetEmail(vm.email).then(function () {

                $timeout(function () {
                    vm.alert.type = Params.alertTypeSuccess;
                    vm.alert.message = "RESET_PASSWORD_SENT";
                });
            }).catch(function (error) {
                if (error.code === Params.networkRequestFailure) {
                    $timeout(function () {
                        vm.alert.type = Params.alertTypeDanger;
                        vm.alert.message = "ERROR_NETWORK";
                    });
                }
                else {

                    /* Note: for security reasons, the email success and failure cases must show the exact same message,
                     * in the same colour (success = green).
                     * -SB */

                    $timeout(function () {
                        vm.alert.type = Params.alertTypeSuccess;
                        vm.alert.message = "RESET_PASSWORD_SENT";
                    });
                }
            });
        }

    }
})();
