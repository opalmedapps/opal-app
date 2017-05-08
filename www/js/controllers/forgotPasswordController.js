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

    ForgotPasswordController.$inject = ['$scope','$timeout','$firebaseAuth'];

    /* @ngInject */
    function ForgotPasswordController($scope,$timeout, $firebaseAuth) {
        var vm = this;
        vm.title = 'ForgotPasswordController';
        vm.email = "";
        vm.alert = {};

        vm.submitPasswordReset = submitPasswordReset;

        activate();

        ////////////////

        function activate() {

            // Remove the alert on text input
            $scope.$watch(function () {
                return vm.email;
            },function(){

                if(vm.alert.hasOwnProperty('type'))
                {
                    delete vm.alert.type;
                    delete vm.alert.content;
                }

            });
        }

        function submitPasswordReset() {
            var userAuth = $firebaseAuth();
            console.log(vm.email);
            userAuth.$sendPasswordResetEmail(vm.email).then(function(){
                console.log("Password reset email sent successfully!");
                $timeout(function(){
                    vm.alert.type="success";
                    vm.alert.content="EMAILPASSWORDSENT";
                });
            }).catch(function(error){
                switch (error.code) {
                    case "auth/user-not-found":
                        console.log("The specified user account does not exist.");
                        $timeout(function(){
                            vm.alert.type="danger";
                            vm.alert.content="INVALID_USER";
                        });

                        break;
                    case "auth/invalid-email":
                        console.log("The email is invalid.");
                        $timeout(function(){
                            vm.alert.type="danger";
                            vm.alert.content="INVALID_EMAIL";
                        });

                        break;
                    default:
                        console.log(error);
                        $timeout(function(){
                            vm.alert.type="danger";
                            vm.alert.content="INVALID_EMAIL";
                        });
                }
            });
        }

    }

})();