angular.module('app')
    .controller('loginEnterController', ['$scope', '$state', 'UserAuthorizationInfo', function ($scope, $state, UserAuthorizationInfo) {
    $scope.name = "David";
    var userId = "";
    $scope.userId = "asdas";

    $scope.forgotPassword = function () {
        $state.go('logIn.forgot');

    };

    //Creating reference to firebase link
    var myDataRef = new Firebase('https://luminous-heat-8715.firebaseio.com');
    $scope.submit = function () {
        console.log("boom");
        var username = $scope.signup.email;
        var password = $scope.signup.password;

        function authHandler(error, authData) {
            if (error) {
                displayChatMessage(error);
                clearText();
                console.log("Login Failed!", error);
            } else {
                setTimeout(function () {
                    $scope.$apply(function () {
                        $scope.userId = authData.uid;
                    });
                }, 500);
                userId = authData.uid;
                var data = userId + "/fields";
                var requestUserLink = userId + "/Login";
                var userRef = myDataRef.child('users').child(data);
                var requestRefTemp = myDataRef.child('requests');
                var requestRef = requestRefTemp.child(requestUserLink);

                userRef.update({
                    logged: 'true'
                });
                UserAuthorizationInfo.setUserAuthData(authData.uid, authData.token, true);
                userRef.onDisconnect().set({
                    logged: 'false'
                });
                console.log(UserAuthorizationInfo.UserName);
                console.log(UserAuthorizationInfo.UserToken);

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
        if (name !== "logged") {
            $("#addMe").append("<h5 class='bg-danger'><strong>" + text + "</strong></h5>");
            //$('<div/>').text(text).appendTo($('#addMe'));
            $('#addMe')[0].scrollTop = $('#addMe')[0].scrollHeight;
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