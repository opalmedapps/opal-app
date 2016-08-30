/*
 *Code by David Herrera May 20, 2015
 *Github: dherre3
 *Email:davidfherrerar@gmail.com
 */
var myApp=angular.module('MUHCApp');

//Login controller
myApp.controller('LoginController', ['ResetPassword','$scope','$timeout', '$rootScope', '$state', 'UserAuthorizationInfo', 'RequestToServer', 'FirebaseService','LocalStorage','$filter','DeviceIdentifiers','UserPreferences','NavigatorParameters','Patient','NewsBanner', '$firebaseAuth',function LoginController(ResetPassword,$scope,$timeout, $rootScope, $state, UserAuthorizationInfo,RequestToServer,FirebaseService,LocalStorage,$filter,DeviceIdentifiers,UserPreferences,NavigatorParameters,Patient, NewsBanner,$firebaseAuth) {

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
    var myAuth = $firebaseAuth();


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
                            myAuth.$signInWithEmailAndPassword(email,password).then(authHandler).catch(handleError);
                        }

                    }
                }else{
                    //Show appropiate error
                    /*myDataRef.authWithPassword({
                     email: email,
                     password: password
                     }, authHandler);*/
                    myAuth.$signInWithEmailAndPassword(email,password).then(authHandler).catch(handleError);
                }
                //If not authenticated, simply try to authenticate
            }else{
                /*myDataRef.authWithPassword({
                 email: email,
                 password: password
                 }, authHandler);*/
                myAuth.$signInWithEmailAndPassword(email,password).then(authHandler).catch(handleError);
            }

        }
    };
    //Handles authentication
    function authHandler(/*error, */firebaseUser) {
        /*if (error){
         handleError(error);
         }else {*/
        firebaseUser.getToken().then(function(sessionToken){
            console.log('In Auth Handler')
            // TODO temporary false fix this
            var temporary= false; //firebaseUser.password.isTemporaryPassword;
            console.log(temporary);
            window.localStorage.setItem('Email',$scope.email);
            if(temporary){
                // ResetPassword.setUsername(firebaseUser.auth.uid);
                // ResetPassword.setToken(firebaseUser.token);
                // ResetPassword.setEmail($scope.email);
                // ResetPassword.setTemporaryPassword($scope.password);
                UserAuthorizationInfo.setUserAuthData(firebaseUser.uid, $scope.password, myAuth.getAuth().expires, sessionToken);
                NavigatorParameters.setParameters({Username:firebaseUser.uid,Token:sessionToken,Email:$scope.email,TempPassword:$scope.password});
                initNavigator.pushPage('views/login/verify-ssn.html');
            }else{
                UserAuthorizationInfo.setUserAuthData(firebaseUser.uid, CryptoJS.SHA256($scope.password).toString(), myAuth.$getAuth().expires,sessionToken);
                //Setting The User Object for global Application Use
                console.log($scope.email);
                var authenticationToLocalStorage={
                    UserName:firebaseUser.uid,
                    Password: CryptoJS.SHA256($scope.password).toString(),
                    Expires:myAuth.$getAuth().expires,
                    Email:$scope.email,
                    Token:sessionToken
                };
                $rootScope.refresh=true;
                window.localStorage.setItem('UserAuthorizationInfo', JSON.stringify(authenticationToLocalStorage));
                console.log(UserAuthorizationInfo.getUserAuthData());
                console.log("Authenticated successfully with payload:", firebaseUser);
                NavigatorParameters.setParameters('Login');
                $state.go('loading');


            }
        });
        /*}*/
    }

    //Handles login error's;

    function handleError(error)
    {
        $scope.alert.type='danger';
        console.log(error);
        switch (error.code) {
            case "auth/invalid-email":
                console.log("The specified user account email is invalid.");
                $timeout(function(){
                    $scope.alert.content="INVALID_EMAIL";
                });
                break;
            case "auth/wrong-password":
                $timeout(function(){
                    $scope.alert.content="INVALID_PASSWORD";
                });
                break;
            case "auth/user-not-found":
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
    function authenticate(firebaseUser)
    {

        //Get Firebase authentication state
        $scope.authenticated = !!firebaseUser;
        console.log($scope.authenticated );
        //If authenticated update the user authentication state
        if( $scope.authenticated)
        {
            firebaseUser.getToken().then(function(sessionToken){
                var  authInfoLocalStorage=window.localStorage.getItem('UserAuthorizationInfo');
                if(authInfoLocalStorage){
                    var authInfoObject=JSON.parse(authInfoLocalStorage);
                    UserAuthorizationInfo.setUserAuthData(firebaseUser.uid, authInfoObject.Password , myAuth.$getAuth().expires,sessionToken);
                    var authenticationToLocalStorage={
                        UserName:firebaseUser.uid,
                        Password: authInfoObject.Password ,
                        Expires:myAuth.$getAuth().expires,
                        Email:firebaseUser.email,
                        Token:sessionToken
                    };
                    window.localStorage.setItem('UserAuthorizationInfo', JSON.stringify(authenticationToLocalStorage));
                }else{
                    return false;
                }
            });
        }
        return $scope.authenticated;
    }

}]);
