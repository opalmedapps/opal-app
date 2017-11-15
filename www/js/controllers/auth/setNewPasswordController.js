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
        'DeviceIdentifiers'
    ];

    /* @ngInject */
    function SetNewPasswordController(RequestToServer, UserAuthorizationInfo, EncryptionService, ResetPassword, $timeout, DeviceIdentifiers) {

        var vm = this;
        var parameters;
        vm.alert = {};
        vm.resetSuccess = false;
        vm.invalidPassword = true;
        vm.goToLogin = goToLogin;
        vm.submitNewPassword = submitNewPassword;
        vm.evaluatePassword = evaluatePassword;

        activate();

        ///////////////////////////////////

        /*********************************
         * PRIVATE FUNCTIONS
         ********************************/

        function activate() {
            parameters =  initNavigator.getCurrentPage().options;
            parameters = parameters.data;
        }


        function newPasswordIsValid() {
            var str = vm.newValue;
            if (str && typeof str === 'string')
            {
                if ( str.length < 6) {
                    return false;
                } else if (str.length > 50) {
                    return false;
                } else if (str.search(/\d/) === -1) {
                    return false;
                } else if (str.search(/[a-zA-Z]/) === -1) {
                    return false;
                } else if (str.search(/[^a-zA-Z0-9\!\@\#\$\%\^\&\*\(\)\_\+]/) !== -1) {
                    return false;
                } else if (str !== vm.validateNewValue) {
                    return false;
                }
            }

            return true;
        }

        /*********************************
         * PUBLIC METHODS
         ********************************/

        function goToLogin() {
            initNavigator.resetToPage('./views/init/init-screen.html',{animation:'none'});
        }

        function evaluatePassword(){
            vm.invalidPassword = !newPasswordIsValid();

            if(vm.alert.hasOwnProperty('type') && vm.alert.type === 'danger')
            {
                delete vm.alert.type;
                delete vm.alert.content;
            }
        }


        function submitNewPassword() {
            var invalid = !newPasswordIsValid();
            if(!vm.newValue || invalid) {
                vm.invalidPassword = invalid;
                vm.alert.type = 'danger';
                vm.alert.content = "ENTERVALIDPASSWORD";
            } else if (vm.newValue !== vm.validateNewValue){
                vm.invalidPassword = true;
                vm.alert.type = 'danger';
                vm.alert.content = "Passwords do no match!";
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
                            vm.alert.type = 'success';
                            vm.alert.content = "PASSWORDUPDATED";
                            vm.resetSuccess = true;
                        });
                        localStorage.removeItem("deviceID");
                        localStorage.removeItem(UserAuthorizationInfo.getUsername()+"/securityAns");
                    })
                    .catch(function (error) {
                        $timeout(function(){
                            vm.submitting = false;
                            vm.alert.type='danger';
                            switch (error.code) {
                                case "auth/invalid-action-code":
                                    vm.alert.content = "CODE_INVALID";
                                    break;
                                case "auth/expired-action-code":
                                    vm.alert.content = "CODE_EXPIRED";
                                    break;
                                case "auth/weak-password":
                                    vm.alert.content = "WEAK_PASSWORD";
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
