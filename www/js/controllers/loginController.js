/*
*Code by David Herrera May 20, 2015
*Github: dherre3
*Email:davidfherrerar@gmail.com
*/
var myApp=angular.module('MUHCApp');

//Login controller
myApp.controller('LoginController', ['ResetPassword','$scope','$timeout', '$rootScope', '$state', 'UserAuthorizationInfo', 'RequestToServer', 'FirebaseService','LocalStorage','$filter','DeviceIdentifiers','UserPreferences','NavigatorParameters',function LoginController(ResetPassword,$scope,$timeout, $rootScope, $state, UserAuthorizationInfo,RequestToServer,FirebaseService,LocalStorage,$filter,DeviceIdentifiers,UserPreferences,NavigatorParameters) {
  
  //demoSignIn();

  //Watch email and password for error cleaning
  $scope.$watchGroup(['email','password'],function()
  {
      if($scope.alert.hasOwnProperty('type'))
      {
        delete $scope.alert.type;
        delete $scope.alert.content;
      }
  });
  //Obtain email from localStorage and show that email
  var savedEmail = window.localStorage.getItem('Email');
  if(savedEmail)
  {
    $scope.email = savedEmail;
  }
 
  //demoSignIn();
  //Demo automatic sign in
  function demoSignIn()
  {
  	var password='12345';
  	var email='muhc.app.mobile@gmail.com';
  	$scope.password=password;
    $scope.email=email;
    $scope.submit(email, password);
  }

  var myDataRef = new Firebase(FirebaseService.getFirebaseUrl());
  $scope.submit = function (email,password) {
    if(savedEmail) email = savedEmail;
    $scope.email=email;
    $scope.password=password;
    if(typeof email=='undefined'||email ==='')
    {
        $scope.alert.type='danger';
        $scope.alert.content="INVALID_EMAIL";
    }else if(typeof password=='undefined'||password ==='')
    {
        $scope.alert.type='danger';
        $scope.alert.content="INVALID_PASSWORD";
    }else{
      myDataRef.authWithPassword({
          email: email,
          password: password
      }, authHandler);
    }
  };
  //Handles authentication
  function authHandler(error, authData) {
    if (error) {
        console.log("Login Failed!", error);
        handleError(error);
    } else {
      console.log(authData);
        var temporary=authData.password.isTemporaryPassword;
        console.log(temporary);
        window.localStorage.setItem('Email',$scope.email);
        if(temporary){
            ResetPassword.setUsername(authData.auth.uid);
            ResetPassword.setToken(authData.token);
            ResetPassword.setEmail($scope.email);
            ResetPassword.setTemporaryPassword($scope.password);
            initNavigator.pushPage('views/login/verify-ssn.html');
        }else{
          UserAuthorizationInfo.setUserAuthData(authData.auth.uid, CryptoJS.SHA256($scope.password).toString(), authData.expires,authData.token);
          //Setting The User Object for global Application Use
          console.log($scope.email);
          var authenticationToLocalStorage={
              UserName:authData.uid,
              Password: CryptoJS.SHA256($scope.password).toString(),
              Expires:authData.expires,
              Email:$scope.email,
              Token:authData.token
          };
          $rootScope.refresh=true;
          window.localStorage.setItem('UserAuthorizationInfo', JSON.stringify(authenticationToLocalStorage));
          console.log(UserAuthorizationInfo.getUserAuthData());
          console.log("Authenticated successfully with payload:", authData);
          NavigatorParameters.setParameters('Login');
          $state.go('loading');
        }

    }
  } 

  //Handles login error's;
  function handleError(error)
  {
    $scope.alert.type='danger';
    switch (error.code) {
      case "INVALID_EMAIL":
        console.log("The specified user account email is invalid.");
        $timeout(function(){
          $scope.alert.content="INVALID_EMAIL";
        });
        break;
      case "INVALID_PASSWORD":
      $timeout(function(){
        $scope.alert.content="INVALID_PASSWORD";
      });
        break;
      case "INVALID_USER":
        $timeout(function(){
          $scope.alert.content="INVALID_USER";
        });
        break;
      default:
        console.log("Error logging user in:", error);
        $timeout(function(){
          $scope.alert.content="INTERNETERROR";
        });
    }
  }
  $scope.signInDifferentAccount = function()
  {
    $scope.savedEmail ='';
    $scope.email='';
    $scope.password='';
    window.localStorage.removeItem('Email');
  };

}]);
