angular.module('app')
    .controller('loginController', ['$scope', '$state', 'UserAuthorizationInfo','$rootScope', function ($scope, $state, UserAuthorizationInfo,$rootScope) {
    $scope.name = "David";
    var userId = "";
    $scope.userId = "asdas";

    $scope.forgotPassword = function () {
        $state.go('forgotPassword');

    };

    //Creating reference to firebase link
    var myDataRef = new Firebase('https://luminous-heat-8715.firebaseio.com');
    $scope.submit = function () {
        var username = $scope.signup.email;
        var password = $scope.signup.password;

        function authHandler(error, authData) {
            if (error) {
                displayChatMessage(error);
                clearText();
                console.log("Login Failed!", error);
            } else {
                userId = authData.uid;
                //Obtaining fields links for patient's firebase

                var patientLoginRequest='PatientActivity/'+userId;
                var patientDataFields='Users/'+userId;

                //Updating Patients references to signal backend to upload data
                myDataRef.child(patientLoginRequest).update({LogIn:true});

                //Setting The User Object for global Application Use
                UserAuthorizationInfo.setUserAuthData(authData.uid, authData.token, true);

                //Telling the app to delete all the fields once there is a firebase disconnect, or a page refresh 
                //firebase i.e. the user logs out. 
                myDataRef.child(patientDataFields).onDisconnect().set({Logged:false});
                myDataRef.child(patientLoginRequest).onDisconnect().update({LogIn:false});
                console.log(UserAuthorizationInfo.UserName);
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
    };
    //myDataRef.unauth(); <-- use this for the logging out

    //This function accesses all the fields for that particular user and posts them to the html, also for testing
    //purposes but it will be useful when displaying in the other views later
    function clearText() {
        document.getElementById('emailField').value = "";
        document.getElementById('passwordField').value = "";
    }

    function displayChatMessage(text) {
        $("#addMe").html("");
        if($rootScope.errorMessageLogIn!==undefined){
        if (name !== "logged") {
            $("#addMe").append("<h5 class='bg-danger'><strong>" + $rootScope.errorMessageLogIn + "</strong></h5>");
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



    var quickWriteUp = function (usid) {
        var UserDatRef = myDataRef.child(usid);
        UserDatRef.once('value', function (snapshot) {
            var newPost = snapshot.val();
            snapshot.forEach(function (data) {
                displayChatMessage(data.key(), data.val());


            });

        });
    };
}]);