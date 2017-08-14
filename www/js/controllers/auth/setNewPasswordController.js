/*
 *Code by David Herrera May 20, 2015
 *Github: dherre3
 *Email:davidfherrerar@gmail.com
 */
var myApp=angular.module('MUHCApp');

myApp.controller('SetNewPasswordController',['$scope', 'Patient',
    'FirebaseService','NavigatorParameters','RequestToServer',
    '$state','UserAuthorizationInfo', 'EncryptionService', function(
             $scope, FirebaseService,NavigatorParameters,RequestToServer,
             $state,UserAuthorizationInfo,EncryptionService){
        $scope.goToLogin=function()
        {

            initNavigator.resetToPage('./views/init/init-screen.html');
        };

        var parameters = initNavigator.getCurrentPage().options;

        $scope.alert={};
        $scope.$watch('newValue',function()
        {
            if($scope.alert.hasOwnProperty('type'))
            {
                delete $scope.alert.type;
                delete $scope.alert.content;
            }
        });

        $scope.submitNewPassword=function(newValue)
        {
            if(!newValue)
            {
                $scope.alert.type='danger';
                $scope.alert.content = "ENTERVALIDPASSWORD";
            }else{

                ResetPassword.completePasswordChange(parameters.oobCode, newValue)
                    .then(function () {

                        return RequestToServer.sendRequestWithResponse(
                            'SetNewPassword',
                            {newPassword: newValue},
                            EncryptionService.getSecurityAns() ,
                            'passwordResetRequests',
                            'passwordResetResponses'
                        );
                    })
                    .then(function() {

                        UserAuthorizationInfo.clearUserAuthorizationInfo();
                        $scope.alert.type='success';
                        $scope.alert.content="PASSWORDUPDATED";
                        localStorage.removeItem("deviceID");
                        localStorage.removeItem(UserAuthorizationInfo.getUsername()+"/securityAns");

                    })
                    .catch(function (error) {

                        $scope.alert.type='danger';
                        switch (error.code) {
                            case "auth/invalid-action-code":
                                $timeout(function () {
                                    $scope.alert.content = "CODE_INVALID"
                                });
                                break;
                            case "auth/expired-action-code":
                                $timeout(function () {
                                    $scope.alert.content = "CODE_EXPIRED";
                                });
                                break;
                            case "auth/weak-password":
                                $timeout(function () {
                                    $scope.alert.content = "WEAK_PASSWORD";
                                });
                                break;
                            default:
                                $timeout(function () {
                                    $scope.alert.content = "SERVERPROBLEM";
                                });
                        }
                    });

            }
        };


    }]);
