/*
 *Code by David Herrera May 20, 2015
 *Github: dherre3
 *Email:davidfherrerar@gmail.com
 */

(function () {
    'use strict';

    angular
        .module('OpalApp')
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

        vm.alert = {};
        vm.resetSuccess = false;
        vm.newValue = '';
        vm.newValueValidate = '';

        // Values set by the password strength checker directive
        vm.passwordIsValid = false;
        vm.passwordErrors = [];

        vm.goToLogin = goToLogin;
        vm.submitNewPassword = submitNewPassword;
        vm.passwordFieldChange = passwordFieldChange;
        // Used to show an error when the password confirmation doesn't match the password
        vm.passwordConfirmationInvalid = () => !vm.newValueValidate || vm.newValue !== vm.newValueValidate;

        activate();

        ///////////////////////////////////

        /*********************************
         * PRIVATE FUNCTIONS
         ********************************/

        function activate() {
            parameters = initNavigator.getCurrentPage().options;
            parameters = parameters.data;
        }

        /*********************************
         * PUBLIC METHODS
         ********************************/

        function goToLogin() {
            initNavigator.resetToPage('./views/init/init-screen.html',{animation:'none'});
        }

        /**
         * @description Updates variables when the user types in the password fields.
         */
        function passwordFieldChange() {
            $timeout(() => {
                if (vm.alert.hasOwnProperty('type') && vm.alert.type === Params.alertTypeDanger) {
                    delete vm.alert.type;
                    delete vm.alert.content;
                }
            });
        }

        function submitNewPassword() {
            vm.submitting = true;

            ResetPassword.completePasswordChange(parameters.oobCode, vm.newValue).then(function () {
                const emailAndSecurityAnswerKey = EncryptionService.generateSpecificEncryptionKey(
                    EncryptionService.hash(UserAuthorizationInfo.getEmail()),
                    EncryptionService.getSecurityAns(),
                );
                return RequestToServer.sendRequestWithResponse('SetNewPassword',
                    {newPassword: vm.newValue},
                    emailAndSecurityAnswerKey,
                    'passwordResetRequests',
                    'passwordResetResponses'
                );
            }).then(function() {
                vm.submitting = false;
                UserAuthorizationInfo.clearUserAuthorizationInfo();
                $timeout(function() {
                    vm.alert.type = Params.alertTypeSuccess;
                    vm.alert.content = "PASSWORD_UPDATED";
                    vm.resetSuccess = true;
                });
                localStorage.removeItem("deviceID");
                localStorage.removeItem(EncryptionService.getStorageKey());
            }).catch(function (error) {
                $timeout(function(){
                    console.error(error);
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
})();
