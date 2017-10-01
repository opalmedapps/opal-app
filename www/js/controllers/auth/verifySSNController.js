/*
 * Filename     :   loginController.js
 * Description  :   Controller in charge of the login process using FireBase as the authentication API.
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   May 20, 2015
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */


/**
 *  @ngdoc controller
 *  @name MUHCApp.controllers: LoginController
 *  @requires $scope, $timeout, RequestToServer
 *  @description
 *
 *  Controller in charge of the validating the user's SSN in order to allow them to change their password.
 */

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('VerifySSNController', VerifySSNController);

    VerifySSNController.$inject = ['$scope', '$timeout', 'RequestToServer'];

    /* @ngInject */
    function VerifySSNController($scope, RequestToServer) {

        var vm = this;
        var parameters = { data: { SSN: "", Question: ""}};
        vm.clearErrors = clearErrors;
        vm.submitSSN = submitSSN;
        vm.loading = false;
        vm.ssn = "";
        vm.alert = {
            type: "",
            message: ""
        };

        /////////////////////////////////////////////

        function clearErrors(){
            if(vm.alert.hasOwnProperty('type'))
            {
                delete vm.alert.type;
                delete vm.alert.content;
            }
        }

        function validateSSN(ssn) {
            if (ssn === '' || typeof ssn == 'undefined') {
                $scope.alert.type = 'danger';
                $scope.alert.content = "ERRORENTERSSNNUMBER";
                return false;
            } else if (ssn.length !== 12) {
                $scope.alert.type = 'danger';
                $scope.alert.content = "ERRORENTERVALIDSSN";
                return false;
            }
            return true;
        }

        function submitSSN (ssn) {

            if (validateSSN(ssn)) {
                vm.loading = true;
                RequestToServer.sendRequestWithResponse('VerifySSN', {'SSN': vm.ssn}, vm.ssn).then(function (data) {

                    if (data.Data.ValidSSN == "true") {
                        parameters.data.SSN = ssn;
                        parameters.data.Question = data.Data.Question;
                        initNavigator.pushPage('./views/login/security-question.html', parameters);
                    } else {
                        vm.alert.type = "danger";
                        vm.alert.content = "ERRORINCORRECTSSN";
                        vm.loading = false;
                    }
                }).catch(function () {
                    vm.alert.type = "danger";
                    vm.alert.content = "ERRORCONTACTINGHOSPITAL";
                    vm.loading = false;
                });
            }
        }
    }
})();