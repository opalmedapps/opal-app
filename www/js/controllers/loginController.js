/*
 *Code by David Herrera May 20, 2015
 *Github: dherre3
 *Email:davidfherrerar@gmail.com
 */
var myApp=angular.module('MUHCApp');

//Login controller
myApp.controller('LoginController', ['ResetPassword','$scope','$timeout', '$rootScope', '$state',
    'UserAuthorizationInfo', 'RequestToServer', 'FirebaseService','LocalStorage','$filter','DeviceIdentifiers',
    'UserPreferences','NavigatorParameters','Patient','NewsBanner', '$firebaseAuth', 'UUID', 'Constants',
    'EncryptionService',
    function LoginController(
        ResetPassword,$scope,$timeout, $rootScope, $state, UserAuthorizationInfo,
        RequestToServer,FirebaseService,LocalStorage,$filter,DeviceIdentifiers,
        UserPreferences,NavigatorParameters,Patient, NewsBanner,$firebaseAuth, UUID, Constants,
        EncryptionService
    ) {

        if(!localStorage.getItem('locked')){
            $timeout(function () {
                securityModal.show();
            },200);
        }

        $scope.loading = false;


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


        var patientSerNum = Patient.getUserSerNum();
        //Locked out alert
        if(typeof patientSerNum !=='undefined'&&patientSerNum) NewsBanner.showCustomBanner($filter('translate')('LOCKEDOUT'),'black', null, 2000);

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

        // Get the authentication state
        var myAuth = firebase.auth().currentUser;
        console.log(myAuth);

        $scope.submit = function (email,password) {
            $scope.email=email;
            $scope.password=password;

            if(typeof email=='undefined'||email ==='')
            {
                $scope.alert.type='danger';
                $scope.alert.content="INVALID_EMAIL_OR_PWD";
            }else if(typeof password=='undefined'||password ==='')
            {
                $scope.alert.type='danger';
                $scope.alert.content="INVALID_EMAIL_OR_PWD";
            }else{
                $scope.loading = true;
                var authDetails = window.localStorage.getItem('UserAuthorizationInfo');
                if (authDetails) authDetails = JSON.parse(authDetails);

                /*  Check if signed in (myAuth not undefined),
                 *  check if data is still in memory (patientSerNum not undefined),
                 *  check if there is any stored data (authDetails)
                 *  check if user trying to login is the same as locked out user
                 */
                if(myAuth && patientSerNum && authDetails && authDetails.Email==$scope.email){
                    firebase.auth().signInWithEmailAndPassword(email,password)
                        .then(function () {
                            $scope.loading = false;
                            $state.go('Home');
                        })
                        .catch(handleError);

                } else{
                    firebase.auth().signInWithEmailAndPassword(email,password).then(authHandler).catch(handleError);
                }

                //Getting authentication status
                // var auth = FirebaseService.getAuthenticationCredentials();
                // //Getting authentication info from local storage
                // var authDetails = window.localStorage.getItem('UserAuthorizationInfo');
                // //Auth details defined
                // if(authDetails) authDetails = JSON.parse(authDetails);
                // if(auth&&authDetails)
                // {
                //     //If the password is correct and the patient fields are defined, means they are in the locked out state, allow them
                //     //access
                //     console.log(authDetails.Email);
                //     console.log($scope.email);
                //     if(authDetails.Password == CryptoJS.SHA256($scope.password).toString()&&authDetails.Email==$scope.email)
                //     {
                //         console.log('Hello World');
                //         if(typeof patientSerNum!=='undefined'&&patientSerNum)
                //         {
                //             $state.go('Home');
                //         }else{
                //             console.log(auth);
                //             if(app&&authenticate(auth)&&LocalStorage.isUserDataDefined())
                //             {
                //                 console.log('In there');
                //                 NavigatorParameters.setParameters('Resume');
                //                 $state.go('loading');
                //
                //             }else{
                //                 //Otherwise even if they are logged out, try to authenticate them.
                //                 myAuth.$signInWithEmailAndPassword(email,password).then(authHandler).catch(handleError);
                //             }
                //
                //         }
                //     }else{
                //         //Show appropiate error
                //         myAuth.$signInWithEmailAndPassword(email,password).then(authHandler).catch(handleError);
                //     }
                //     //If not authenticated, simply try to authenticate
                // }else{
                //     myAuth.$signInWithEmailAndPassword(email,password).then(authHandler).catch(handleError);
                // }

            }
        };
        //Handles authentication
        function authHandler(/*error, */firebaseUser) {

            firebaseUser.getToken(true).then(function(sessionToken){
                console.log('In Auth Handler');
                window.localStorage.setItem('Email',$scope.email);

                UserAuthorizationInfo.setUserAuthData(firebaseUser.uid, CryptoJS.SHA256($scope.password).toString(), undefined, sessionToken, $scope.email);
                //Setting The User Object for global Application Use
                // console.log("Users email is" + $scope.email);
                var authenticationToLocalStorage={
                    UserName:firebaseUser.uid,
                    Password: undefined,
                    Email:$scope.email,
                    Token:sessionToken
                };
                $rootScope.refresh=true;
                window.localStorage.setItem('UserAuthorizationInfo', JSON.stringify(authenticationToLocalStorage));
                // console.log(UserAuthorizationInfo.getUserAuthData());
                // console.log("Authenticated successfully with payload:", firebaseUser);
                NavigatorParameters.setParameters('Login');
                var deviceID;
                //$state.go('loading');
                if (deviceID = localStorage.getItem(UserAuthorizationInfo.getUsername()+"/deviceID")){

                    var decipherBytes = CryptoJS.AES.decrypt(localStorage.getItem(UserAuthorizationInfo.getUsername()+"/securityAns"),UserAuthorizationInfo.getPassword());
                    var ans = decipherBytes.toString(CryptoJS.enc.Utf8);

                    EncryptionService.setSecurityAns(ans);
                    UUID.setUUID(deviceID);
                    DeviceIdentifiers.sendIdentifiersToServer()
                        .then(function () {
                            $scope.loading = false;
                            $state.go('loading');
                        })
                        .catch(function (error) {
                            console.log(error);
                            $timeout(function(){
                                $scope.loading = false;
                                initNavigator.pushPage('./views/login/security-question.html', {passwordReset: true});
                            });
                        });

                } else {
                    if (!Constants.app) UUID.setUUID(UUID.generate());
                    DeviceIdentifiers.sendFirstTimeIdentifierToServer()
                        .then(function (response) {
                            console.log(response);
                            $scope.loading = false;
                            initNavigator.pushPage('./views/login/security-question.html', {securityQuestion: response.Data.securityQuestion});
                        })
                        .catch(function (error) {
                            console.log(error);
                            $timeout(function(){
                                $scope.loading = false;
                                initNavigator.popPage();
                                $scope.alert.content="INTERNETERROR";
                            });
                        });
                }





            });
            /*}*/
        }

        //Handles login error's;

        function handleError(error)
        {
            $scope.loading = false;
            $scope.alert.type='danger';
            console.log(error);
            switch (error.code) {
                case "auth/invalid-email":
                case "auth/wrong-password":
                case "auth/user-not-found":
                    $timeout(function(){
                        $scope.alert.content="INVALID_EMAIL_OR_PWD";
                    });
                    break;
                case "auth/too-many-requests":
                    $timeout(function () {
                        $scope.alert.content="TOO_MANY_REQUESTS";
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
            var authenticated = !!firebaseUser;
            //console.log($scope.authenticated );
            //If authenticated update the user authentication state
            if( authenticated)
            {
                firebaseUser.getToken().then(function(sessionToken){
                    var  authInfoLocalStorage=window.localStorage.getItem('UserAuthorizationInfo');
                    if(authInfoLocalStorage){
                        var authInfoObject=JSON.parse(authInfoLocalStorage);
                        UserAuthorizationInfo.setUserAuthData(firebaseUser.uid, authInfoObject.Password , undefined,sessionToken);
                        var authenticationToLocalStorage={
                            UserName:firebaseUser.uid,
                            Password: authInfoObject.Password ,
                            Email:firebaseUser.email,
                            Token:sessionToken
                        };
                        window.localStorage.setItem('UserAuthorizationInfo', JSON.stringify(authenticationToLocalStorage));
                    }else{
                        return false;
                    }
                });
            }
            return authenticated;
        }

    }]);
