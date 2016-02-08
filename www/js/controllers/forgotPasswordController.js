var myApp=angular.module('MUHCApp');
myApp.controller('ForgotPasswordController', ['$scope', '$state','$timeout', function ($scope, $state,$timeout) {
    $scope.email="";
    $scope.alert={};
    $scope.submitPasswordReset = function (email) {
        var ref = new Firebase("https://brilliant-inferno-7679.firebaseio.com/");
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
                    $scope.alert.content="The specified user account does not exist.";
                  });

                  break;
                default:
                  console.log(error);
                  $timeout(function(){
                    $scope.alert.type="danger";
                    $scope.alert.content="Enter a valid email address";
                  });
              }
            } else {
              console.log("Password reset email sent successfully!");
              $timeout(function(){
                $scope.alert.type="success";
                $scope.alert.content="Password has been reset sucessfully, check your email for your temporary password!";
              });
            }
          });
        }catch(err){
          console.log(err);
          $timeout(function(){
            $scope.alert.type="danger";
            $scope.alert.content="Enter a valid email address";
          });
        }


    };
}]);
