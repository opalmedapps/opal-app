//
// Author: David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
var myApp=angular.module('MUHCApp');
myApp.controller('ForgotPasswordController', ['$scope', 'FirebaseService','$state','$timeout', function ($scope,FirebaseService, $state,$timeout) {
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
        var ref = firebase.database().ref('dev2/');
        console.log(email);
        try{
          ref.resetPassword({
            email: email
          }, function(error) {
            if (error) {
              switch (error.code) {
                case "INVALID_USER":
                  console.log("The specified user account does not exist.");
                  $timeout(function(){
                    $scope.alert.type="danger";
                    $scope.alert.content="INVALID_USER";
                  });

                  break;
                default:
                  console.log(error);
                  $timeout(function(){
                    $scope.alert.type="danger";
                    $scope.alert.content="INVALID_EMAIL";
                  });
              }
            } else {
              console.log("Password reset email sent successfully!");
              $timeout(function(){
                $scope.alert.type="success";
                $scope.alert.content="EMAILPASSWORDSENT";
              });
            }
          });
        }catch(err){
          console.log(err);
          $timeout(function(){
            $scope.alert.type="danger";
            $scope.alert.content="INVALID_EMAIL";
          });
        }


    };
}]);
