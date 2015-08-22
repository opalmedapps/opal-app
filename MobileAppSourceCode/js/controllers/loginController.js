
var myApp=angular.module('MUHCApp')
    
    /**
*@ngdoc controller
*@name MUHCApp.controller:LoginController
*@scope
*@requires $scope
*@requires MUHCApp.services:UserAuthorizationInfo
*@requires $state
*@description
*Uses Firebase authWithPassword method. The authWithPassword() inputs promise response
    *if error is defined, i.e authentication fails, it clears fields displays error for user via displayChatMessage() method, if authenticated
    *takes credentials and places them in the UserAuthorizationInfo service, it also sends the login request to Firebase,
    *and finally it redirects the app to the loading screen.
*/
    myApp.controller('LoginController', ['$scope', '$rootScope', '$state', 'UserAuthorizationInfo', 'RequestToServer', 'Patient', function ($scope, $rootScope, $state, UserAuthorizationInfo,RequestToServer,UserPreferences, Patient) {
    $scope.platformBoolean=(ons.platform.isAndroid()&&ons.platform.isIOS());
    var authInfo=window.localStorage.getItem('UserAuthorizationInfo');
    if(authInfo){
        var authInfoObject=JSON.parse(authInfo);
        UserAuthorizationInfo.setUserAuthData(authInfoObject.UserName, authInfoObject.Password, authInfoObject.Expires);
        $state.go('loading');
    }   
    //Creating reference to firebase link 
    $scope.submit = function (email, password) {
        signin(email, password);
    };
    function signin(email, password){
        var myDataRef = new Firebase('https://luminous-heat-8715.firebaseio.com');
        var username = email;
        var password = password;
        
       // window.localStorage.setItem('pass', password);
       // console.log(window.localStorage.getItem('pass'));
        /**
        *@ngdoc method
        *@name authHandler
        *@methodOf MUHCApp.controller:LoginController
        *@param {Error} Returns error from Firebase if unable to authenticate.
        *@param {Object} Contains authentication data.
        *@description  Is the authWithPassword() method callback, the authWithPassword() inputs promise response
        *if error is defined, i.e authentication fails, it clears fields displays error for user via displayChatMessage() method, if authenticated
        *takes credentials and places them in the UserAuthorizationInfo service, it also sends the login request to Firebase,
        *and finally it redirects the app to the loading screen.
        */
        function authHandler(error, authData) {
            if (error) {
                displayChatMessage(error);
                clearText();
                console.log("Login Failed!", error);
            } else {
                userId = authData.uid;
                //Obtaining fields links for patient's firebase

                
                var patientLoginRequest='request/'+userId;
                var patientDataFields='Users/'+userId;

                //Updating Patients references to signal backend to upload data
                myDataRef.child(patientLoginRequest).update({LogIn:true});
                UserAuthorizationInfo.setUserAuthData(authData.uid, $scope.signup.password, authData.expires);
                RequestToServer.sendRequest('Login',userId);

                //Setting The User Object for global Application Use
                authenticationToLocalStorage={};
                authenticationToLocalStorage={
                        UserName:authData.uid,
                        Password:$scope.signup.password,
                        Expires:authData.expires,
                        Email:$scope.signup.email                   
                }

                $rootScope.refresh=true;
                window.localStorage.setItem('UserAuthorizationInfo', JSON.stringify(authenticationToLocalStorage));
                window.localStorage.setItem('pass', $scope.signup.password);
                
                console.log(UserAuthorizationInfo.getUserAuthData());
                //Telling the app to delete all the fields once there is a firebase disconnect, or a page refresh 
                //firebase i.e. the user logs out. 
                //myDataRef.child(patientDataFields).onDisconnect().set({Logged:false});
                myDataRef.child(patientLoginRequest).onDisconnect().update({LogIn:false});
                //console.log(UserAuthorizationInfo.UserToken);

                //quickWriteUp(data);
                $state.go('loading');
                console.log("Authenticated successfully with payload:", authData);
            }
        }
        myDataRef.authWithPassword({
            email: username,
            password: password
        }, authHandler);


    }

    /**
    *@ngdoc method
    *@name submit
    *@methodOf MUHCApp.controller:LoginController
    *@description Submits the user login credentials, calls firebase function authWithPassword().
    */

    //myDataRef.unauth(); <-- use this for the logging out
    /**
    *@ngdoc method
    *@name cleatText
    *@methodOf MUHCApp.controller:LoginController
    *@description
    This function accesses all the fields for that particular user and posts them to the dom, also for testing
    purposes.
    */

    function clearText() {
        document.getElementById('emailField').value = "";
        document.getElementById('passwordField').value = "";
    }
    /*@ngdoc method
    *@name displayChatMessage
    *@methodOf MUHCApp.controller:LoginController
    *@description
    This error message to the dom
    */
    function displayChatMessage(text) {
        $("#addMe").html("");
        if($scope.errorMessageLogIn!==undefined){
        if (name !== "logged") {
            $("#addMe").append("<h5 class='bg-danger'><strong>" + $scope.errorMessageLogIn + "</strong></h5>");
            //$('<div/>').text(text).appendTo($('#addMe'));
            $('#addMe')[0].scrollTop = $('#addMe')[0].scrollHeight;
        }
        }else{
            if (name !== "logged") {
            $("#addMe").append("<h5 class='bg-danger'><strong>" + text + "</strong></h5>");
            //$('<div/>').text(text).appendTo($('#addMe'));
            $('#addMe')[0].scrollTop = $('#addMe')[0].scrollHeight;
        }
        }   
    }
}]);