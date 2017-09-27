/*
 * Filename     :   forgotPasswordController.js
 * Description  :   Controlls the forgot password view.
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   28 Apr 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('ForgotPasswordController', ForgotPasswordController);

    ForgotPasswordController.$inject = ['$timeout','$firebaseAuth'];

    /* @ngInject */
    function ForgotPasswordController($timeout, $firebaseAuth) {
        var vm = this;
        vm.email = "";
        vm.alert = {};

        vm.submitPasswordReset = submitPasswordReset;
        vm.clearErrors = clearErrors;

        ////////////////

        function clearErrors(){
            if(vm.alert.hasOwnProperty('type'))
            {
                delete vm.alert.type;
                delete vm.alert.content;
            }
        }

        function submitPasswordReset() {
            var userAuth = $firebaseAuth();

            userAuth.$sendPasswordResetEmail(vm.email).then(function(){

                $timeout(function(){
                    vm.alert.type="success";
                    vm.alert.content="EMAILPASSWORDSENT";
                });
            }).catch(function(error){
                switch (error.code) {
                    case "auth/user-not-found":

                        $timeout(function(){
                            vm.alert.type="danger";
                            vm.alert.content="INVALID_USER";
                        });

                        break;
                    case "auth/invalid-email":

                        $timeout(function(){
                            vm.alert.type="danger";
                            vm.alert.content="INVALID_EMAIL";
                        });

                        break;
                    default:

                        $timeout(function(){
                            vm.alert.type="danger";
                            vm.alert.content="INVALID_EMAIL";
                        });
                }
            });
        }
    }
})();