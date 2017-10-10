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
        'EncryptionService'
    ];

    /* @ngInject */
    function SetNewPasswordController($scope, RequestToServer, UserAuthorizationInfo, EncryptionService) {

        var vm = this;
        var parameters;
        vm.alert={};
        vm.goToLogin = goToLogin;
        vm.submitNewPassword = submitNewPassword;


        activate();

        ///////////////////////////////////

        function activate() {
            parameters =  initNavigator.getCurrentPage().options;

            $scope.$watch('vm.newValue',function()
            {
                if($scope.alert.hasOwnProperty('type'))
                {
                    delete $scope.alert.type;
                    delete $scope.alert.content;
                }
            });
        }

        function goToLogin()
        {
            initNavigator.resetToPage('./views/init/init-screen.html');
        }


        function submitNewPassword(newValue)
        {
            if(!newValue)
            {
                vm.alert.type='danger';
                vm.alert.content = "ENTERVALIDPASSWORD";
            }else{

                ResetPassword.completePasswordChange(parameters.oobCode, newValue)
                    .then(function () {

                        return RequestToServer.sendRequestWithResponse('SetNewPassword', {newPassword: newValue}, EncryptionService.getTempEncryptionHash() ,
                            'passwordResetRequests',
                            'passwordResetResponses'
                        );
                    })
                    .then(function() {
                        UserAuthorizationInfo.clearUserAuthorizationInfo();
                        EncryptionService.removeTempEncryptionHash();
                        vm.alert.type='success';
                        vm.alert.content="PASSWORDUPDATED";
                        localStorage.removeItem("deviceID");
                        localStorage.removeItem(UserAuthorizationInfo.getUsername()+"/securityAns");
                        goToLogin();
                    })
                    .catch(function (error) {

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
                    });
            }
        }
    }
})();
