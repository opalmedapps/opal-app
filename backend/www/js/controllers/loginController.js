
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
    $scope.signup={};

    //Creating reference to firebase link
    $scope.submit = function () {
        $scope.signup.password='12345';
        $scope.signup.email='muhc.app.mobile@gmail.com';
        signin();

    };
    signin();
    function signin(){

        var ref = new Firebase('https://luminous-heat-8715.firebaseio.com/');
        ref.auth("RdIjtoI3kR3arxzBZkARO9UbYegTTp0M5HWfqh5c",authHandler);

    }
    function authHandler(error, authData) {
        if (error) {
            displayChatMessage(error);
            clearText();
            console.log("Login Failed!", error);
        } else {
          var authInfo=window.localStorage.getItem('OpalAdminPanelPatient');
          if(authInfo){
              var authInfoObject=JSON.parse(authInfo);
              UserAuthorizationInfo.setUserAuthData(authInfoObject.Username, '12345', 12345);
              RequestToServer.setIdentifier().then(function(uuid)
              {
                console.log(uuid);
                  RequestToServer.sendRequest('Login');
                  $state.go('loading');
              });
          }
        }
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

/**

@@ -22,11 +22,17 @@ var myApp=angular.module('MUHCApp')
        UserAuthorizationInfo.setUserAuthData(authInfoObject.UserName, authInfoObject.Password, authInfoObject.Expires);
        RequestToServer.sendRequest('Refresh');
        $state.go('loading');
    }
    //Creating reference to firebase link
    $scope.submit = function (email, password) {
        signin(email, password);
        }

    **/
