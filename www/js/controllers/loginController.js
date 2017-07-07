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
    'EncryptionService', 'CleanUp',
    function LoginController(
        ResetPassword,$scope,$timeout, $rootScope, $state, UserAuthorizationInfo,
        RequestToServer,FirebaseService,LocalStorage,$filter,DeviceIdentifiers,
        UserPreferences,NavigatorParameters,Patient, NewsBanner,$firebaseAuth, UUID, Constants,
        EncryptionService, CleanUp
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


        // Get the authentication state
        var myAuth = firebase.auth().currentUser;

        // Switch for trusting device
        var trusted = 1;
        $timeout(function () {
            mySwitch.setChecked(trusted);
            mySwitch.on( 'change', function () {
                if (mySwitch.isChecked()) {
                    console.log("Trusted");
                    trusted = 1;
                } else {
                    console.log("Not Trusted");
                    trusted = 0;
                }
            });
        });

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

            }
        };

        //Handles authentication and next steps
        function authHandler(firebaseUser) {

            CleanUp.clear();

            firebaseUser.getToken(true).then(function(sessionToken){

                //Save the current session token to the users "logged in users" node. This is used to make sure that the user is only logged in for one session at a time.
                var Ref= firebase.database().ref('dev4/');
                var refCurrentUser = Ref.child('logged_in_users/' + firebaseUser.uid);

                $rootScope.uid = firebaseUser.uid;

                var toSend = {
                    'Token' : sessionToken
                };

                refCurrentUser.set(toSend);

                //Evoke an observer function in mainController
                $rootScope.$emit("MonitorLoggedInUsers", firebaseUser.uid);

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
                var deviceID;

                // If user sets not trusted remove the localstorage
                if (!trusted) {
                    localStorage.removeItem(UserAuthorizationInfo.getUsername()+"/deviceID");
                    localStorage.removeItem(UserAuthorizationInfo.getUsername()+"/securityAns");
                }

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
                            });
                        });

                } else {
                    if (!Constants.app) UUID.setUUID(UUID.generate());
                    DeviceIdentifiers.sendFirstTimeIdentifierToServer()
                        .then(function (response) {
                            console.log(response);
                            $scope.loading = false;
                            initNavigator.pushPage('./views/login/security-question.html', {
                                securityQuestion: response.Data.securityQuestion["securityQuestion_" + UserPreferences.getLanguage()],
                                trusted: trusted
                            });
                        })
                        .catch(function (error) {
                            console.log(error);
                            $timeout(function(){
                                $scope.loading = false;
                                initNavigator.popPage();
                            });
                        });
                }

            });
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
