/*
 *Code by David Herrera May 20, 2015
 *Github: dherre3
 *Email:davidfherrerar@gmail.com
 */

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('SetNewPasswordController', SetNewPasswordController);

    SetNewPasswordController.$inject = [
        'RequestToServer',
        'UserAuthorizationInfo',
        'EncryptionService',
        'ResetPassword',
        '$timeout',
        'Params'
    ];

    /* @ngInject */
    function SetNewPasswordController(RequestToServer, UserAuthorizationInfo, EncryptionService, ResetPassword, $timeout, Params) {

        var vm = this;
        var parameters;
        const MIN_PASSWORD_LENGTH = 8;
        vm.alert = {};
        vm.resetSuccess = false;
        vm.invalidPassword = true;
        vm.goToLogin = goToLogin;
        vm.submitNewPassword = submitNewPassword;
        vm.evaluatePassword = evaluatePassword;
        vm.newValue = '';
        vm.validateNewValue = '';

        activate();

        ///////////////////////////////////

        /*********************************
         * PRIVATE FUNCTIONS
         ********************************/

        function activate() {
            parameters = initNavigator.getCurrentPage().options;
            parameters = parameters.data;
        }

        function newPasswordIsValid() {
            var str = vm.newValue;
            if (str !== null && str !== undefined && typeof str === 'string')
            {
                return !(str.length < MIN_PASSWORD_LENGTH || str.length > 50 || str.search(/\d/) === -1 ||
                    str.search(/[A-Z]/) === -1 || str.search(/\W|_{1}/) <= -1);
            }

            return false;
        }

        /*********************************
         * PUBLIC METHODS
         ********************************/

        function goToLogin() {
            initNavigator.resetToPage('./views/init/init-screen.html',{animation:'none'});
        }

        function evaluatePassword(){
            vm.invalidPassword = !newPasswordIsValid();

            if(vm.alert.hasOwnProperty('type') && vm.alert.type === Params.alertTypeDanger)
            {
                delete vm.alert.type;
                delete vm.alert.content;
            }
        }

        function submitNewPassword() {
            var invalid = !newPasswordIsValid();
            if(!vm.newValue || invalid) {
                $timeout(function() {
                    vm.invalidPassword = invalid;
                    vm.alert.type = Params.alertTypeDanger;
                    vm.alert.content = "ENTERVALIDPASSWORD";
                })
            } else if (vm.newValue !== vm.validateNewValue){
                $timeout(function() {
                    vm.invalidPassword = true;
                    vm.alert.type = Params.alertTypeDanger;
                    vm.alert.content = "PASSWORD_MISMATCH_ERROR";
                });
            }else{
                vm.submitting = true;

                ResetPassword.completePasswordChange(parameters.oobCode, vm.newValue)
                    .then(function () {

                        return RequestToServer.sendRequestWithResponse('SetNewPassword', {newPassword: vm.newValue}, EncryptionService.getTempEncryptionHash() ,
                            'passwordResetRequests',
                            'passwordResetResponses'
                        );
                    })
                    .then(function() {
                        vm.submitting = false;
                        UserAuthorizationInfo.clearUserAuthorizationInfo();
                        EncryptionService.removeTempEncryptionHash();
                        $timeout(function() {
                            vm.alert.type = Params.alertTypeSuccess;
                            vm.alert.content = "PASSWORDUPDATED";
                            vm.resetSuccess = true;
                        });
                        localStorage.removeItem("deviceID");
                        localStorage.removeItem(UserAuthorizationInfo.getUsername()+"/securityAns");
                    })
                    .catch(function (error) {
                        $timeout(function(){
                            vm.submitting = false;
                            vm.alert.type = Params.alertTypeDanger;
                            switch (error.code) {
                                case Params.invalidActionCode:
                                    vm.alert.content = "RESET_PASSWORD_CODE_INVALID";
                                    break;
                                case Params.expiredActionCode:
                                    vm.alert.content = "RESET_PASSWORD_CODE_EXPIRED";
                                    break;
                                case Params.weakPassword:
                                    vm.alert.content = "PASSWORD_CRITERIA";
                                    break;
                                default:
                                    vm.alert.content = "PASSWORDRESETSERVERERROR";
                                    break;
                            }
                        })
                    });
            }
        }
    }
})();
