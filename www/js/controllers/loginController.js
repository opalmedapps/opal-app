/*
*Code by David Herrera May 20, 2015
*Github: dherre3
*Email:davidfherrerar@gmail.com
*/
var myApp=angular.module('MUHCApp');

//Login controller
myApp.controller('LoginController', ['ResetPassword','$scope','$timeout', '$rootScope', '$state', 'UserAuthorizationInfo', 'RequestToServer', 'FirebaseService','LocalStorage','$filter','DeviceIdentifiers','UserPreferences','NavigatorParameters','Patient','NewsBanner',function LoginController(ResetPassword,$scope,$timeout, $rootScope, $state, UserAuthorizationInfo,RequestToServer,FirebaseService,LocalStorage,$filter,DeviceIdentifiers,UserPreferences,NavigatorParameters,Patient, NewsBanner) {
  
  //Check if device or browser
    var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
   
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


  var patientFirstName = Patient.getFirstName();
  //Locked out alert
  if(typeof patientFirstName !=='undefined'&&patientFirstName) NewsBanner.showCustomBanner($filter('translate')('LOCKEDOUT'),'black', null, 2000);
  
  //demoSignIn();
  //Demo automatic sign in
    //demoSignIn();

  function demoSignIn()
  {
  	var password='12345';
  	var email='muhc.app.mobile@gmail.com';
  	$scope.password=password;
    $scope.email=email;
    $scope.submit(email, password);
  }

  //var myDataRef = firebase.database().ref('dev2/');
    var myAuth = firebase.auth();


  $scope.submit = function (email,password) {
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
      //Getting authentication status
      var auth = FirebaseService.getAuthenticationCredentials();

      //Getting authentication info from local storage
      var authDetails = window.localStorage.getItem('UserAuthorizationInfo');
      //Auth details defined
      if(authDetails) authDetails = JSON.parse(authDetails);
      if(auth&&authDetails)
      {
        //If the password is correct and the patient fields are defined, means they are in the locked out state, allow them
        //access
        console.log(authDetails.Email);
        console.log($scope.email);
        if(authDetails.Password == CryptoJS.SHA256($scope.password).toString()&&authDetails.Email==$scope.email)
        {
          console.log('Hello World');
           if(typeof patientFirstName!=='undefined'&&patientFirstName)
          {
            $state.go('Home');
          }else{
            console.log(auth);
            if(app&&authenticate(auth)&&LocalStorage.isUserDataDefined())
            {
             console.log('In there'); 
              NavigatorParameters.setParameters('Resume');
              $state.go('loading');

            }else{
               //Otherwise even if they are logged out, try to authenticate them.
              /*myDataRef.signIn({
                email: email,
                password: password
              }, authHandler);*/
                myAuth.signInWithEmailAndPassword(email,password).then(authHandler).catch(handleError);
            }
           
          }
        }else{
          //Show appropiate error
           /*myDataRef.authWithPassword({
              email: email,
              password: password
            }, authHandler);*/
            myAuth.signInWithEmailAndPassword(email,password).then(authHandler).catch(handleError);
        }
      //If not authenticated, simply try to authenticate
      }else{
        /*myDataRef.authWithPassword({
          email: email,
          password: password
        }, authHandler);*/
          myAuth.signInWithEmailAndPassword(email,password).then(authHandler).catch(handleError);
      }
      
    }
  };
  //Handles authentication
  function authHandler(/*error, */authData) {
    /*if (error){
       handleError(error);
    }else {*/
        console.log('In Auth Handler')
        var temporary=authData.password.isTemporaryPassword;
        console.log(temporary);
        window.localStorage.setItem('Email',$scope.email);
        if(temporary){
            UserAuthorizationInfo.setUserAuthData(authData.auth.uid,authData.token, $scope.password, authData.expires,authData.token);
            NavigatorParameters.setParameters({Username:authData.auth.uid,Token:authData.token,Email:$scope.email,TempPassword:$scope.password});
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

    /*}*/
  } 

  //Handles login error's;

  function handleError(error)
  {
    $scope.alert.type='danger';
      console.log(error);
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
      case "LIMITS_EXCEEDED":
        $timeout(function(){
          $scope.alert.content="LIMITS_EXCEEDED";
        });
        break;
      case "NETWORK_ERROR":
          $timeout(function(){
            $scope.alert.content="INTERNETERROR";
          });
          break;
      default:
        $timeout(function(){
          $scope.alert.content="INTERNETERROR";
        });
    }
  }
      function authenticate(authData)
    {

      //Get Firebase authentication state
      $scope.authenticated = !!authData;
      console.log($scope.authenticated );
      //If authenticated update the user authentication state
      if( $scope.authenticated)
      {
        var  authInfoLocalStorage=window.localStorage.getItem('UserAuthorizationInfo');
        if(authInfoLocalStorage){
            var authInfoObject=JSON.parse(authInfoLocalStorage);
            UserAuthorizationInfo.setUserAuthData(authData.auth.uid,authInfoObject.Password , authData.expires,authData.token);
            var authenticationToLocalStorage={
                    UserName:authData.uid,
                    Password: authInfoObject.Password ,
                    Expires:authData.expires,
                    Email:authData.password.email,
                    Token:authData.token
            };
            window.localStorage.setItem('UserAuthorizationInfo', JSON.stringify(authenticationToLocalStorage));
        }else{
          return false;
        }      
      }
      return $scope.authenticated;
    }

}]);
