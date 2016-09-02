//
// Author: David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
var myApp=angular.module('MUHCApp');
myApp.controller('ForgotPasswordController', ['$scope','$state','$timeout','$firebaseAuth',
    function ($scope,$state,$timeout, $firebaseAuth) {
        $scope.email="";
        $scope.alert={};
        $scope.$watch('email',function()
        {
            if($scope.alert.hasOwnProperty('type'))
            {
                delete $scope.alert.type;
                delete $scope.alert.content;
            }
        });
        $scope.submitPasswordReset = function (email) {
            var userAuth = $firebaseAuth();
            console.log(email);
            userAuth.$sendPasswordResetEmail(email).then(function(){
                console.log("Password reset email sent successfully!");
                $timeout(function(){
                    $scope.alert.type="success";
                    $scope.alert.content="EMAILPASSWORDSENT";
                });
            }).catch(function(error){
                switch (error.code) {
                    case "auth/user-not-found":
                        console.log("The specified user account does not exist.");
                        $timeout(function(){
                            $scope.alert.type="danger";
                            $scope.alert.content="INVALID_USER";
                        });

                        break;
                    case "auth/invalid-email":
                        console.log("The email is invalid.");
                        $timeout(function(){
                            $scope.alert.type="danger";
                            $scope.alert.content="INVALID_EMAIL";
                        });

                        break;
                    default:
                        console.log(error);
                        $timeout(function(){
                            $scope.alert.type="danger";
                            $scope.alert.content="INVALID_EMAIL";
                        });
                }
            });


        };
    }]);
