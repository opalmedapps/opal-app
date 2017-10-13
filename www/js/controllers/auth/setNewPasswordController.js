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
        '$scope',
        'RequestToServer',
        'UserAuthorizationInfo',
        'EncryptionService',
        'ResetPassword',
        '$timeout'
    ];

    /* @ngInject */
    function SetNewPasswordController($scope, RequestToServer, UserAuthorizationInfo, EncryptionService, ResetPassword, $timeout) {

        var vm = this;
        var parameters;
        vm.alert = {};
        vm.goToLogin = goToLogin;
        vm.submitNewPassword = submitNewPassword;

        activate();

        ///////////////////////////////////

        function activate() {
            parameters =  initNavigator.getCurrentPage().options;
            parameters = parameters.data;

            $scope.$watch('newValue',function()
            {
                vm.invalidPassword = !newPasswordIsValid();

                if(vm.alert.hasOwnProperty('type') && vm.alert.type === 'danger')
                {
                    delete vm.alert.type;
                    delete vm.alert.content;
                }
            });
        }

        function newPasswordIsValid() {
            var str = $scope.newValue;
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
                }
            }

            return true;
        }
        console.log("WJAT");
        function goToLogin()
        {
            initNavigator.resetToPage('./views/init/init-screen.html',{animation:'none'});
        }


        function submitNewPassword(newValue)
        {
            var invalid = !newPasswordIsValid();
            if(!newValue || invalid)
            {
                vm.invalidPassword= invalid;
                vm.alert.type='danger';
                vm.alert.content = "ENTERVALIDPASSWORD";
            }else{
                vm.submitting = true;

                ResetPassword.completePasswordChange(parameters.oobCode, $scope.newValue)
                    .then(function () {

                        return RequestToServer.sendRequestWithResponse('SetNewPassword', {newPassword: $scope.newValue}, EncryptionService.getTempEncryptionHash() ,
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
                                    vm.alert.content = "SERVERPROBLEM";
                                    break;
                            }
                        })
                    });
            }
        }
    }
})();
