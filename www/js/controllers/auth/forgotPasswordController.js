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
        .module('MUHCApp')
        .controller('ForgotPasswordController', ForgotPasswordController);

    ForgotPasswordController.$inject = ['$timeout','$firebaseAuth', '$state'];

    /* @ngInject */
    function ForgotPasswordController($timeout, $firebaseAuth, $state) {
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

        ////////////////

        /**
         * @ngdoc method
         * @name clearErrors
         * @methodOf MUHCApp.controllers.ForgotPasswordController
         * @description
         * Clears errors
         */
        function clearErrors(){
            vm.alert.type = null;
            vm.alert.message = null;
        }

        /**
         * @ngdoc method
         * @name submitPasswordReset
         * @methodOf MUHCApp.controllers.ForgotPasswordController
         * @description
         * Submits the user-inputted email address to FireBase API. Either displays success or error message based on FireBase response.
         */
        function submitPasswordReset() {
            var userAuth = $firebaseAuth();
            userAuth.$sendPasswordResetEmail(vm.email).then(function(){
                $timeout(function(){
                    vm.alert.type="success";
                    vm.alert.message="EMAILPASSWORDSENT";
                });
            }).catch(function(error){
                switch (error.code) {
                    case "auth/user-not-found":
                        $timeout(function(){
                            vm.alert.type="danger";
                            vm.alert.message="INVALID_USER";
                        });
                        break;
                    case "auth/invalid-email":
                        $timeout(function(){
                            vm.alert.type="danger";
                            vm.alert.message="INVALID_EMAIL";
                        });
                        break;
                    default:
                        $timeout(function(){
                            vm.alert.type="danger";
                            vm.alert.message="INVALID_EMAIL";
                        });
                }
            });
        }

    }
})();