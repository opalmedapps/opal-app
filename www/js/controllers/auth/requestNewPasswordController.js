/**
 * Created by PhpStorm.
 * User: James Brace
 * Date: 2017-08-09
 * Time: 3:32 PM
 */

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('RequestNewPasswordController', RequestNewPasswordController);

    RequestNewPasswordController.$inject = ['$scope', '$timeout', 'RequestToServer'];

    /* @ngInject */
    function RequestNewPasswordController($scope, RequestToServer) {

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