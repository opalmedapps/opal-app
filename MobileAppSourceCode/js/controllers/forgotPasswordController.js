angular.module('app').controller('forgotPasswordController', ['$scope', '$state', function ($scope, $state) {
    console.log("boom");
    //$scope.forgotPassword.email=" ";

    function clearText() {
        document.getElementById('emailFieldForgot').value = "";
    }

    function displayChatMessageError(text) {
        $(".addMe").html("");
        if (name !== "logged") {
            $(".addMe").append("<h5 class='bg-danger'><strong>" + text + "</strong></h5>");
            //$('<div/>').text(text).appendTo($('#addMe'));
            $('.addMe')[0].scrollTop = $('#addMe')[0].scrollHeight;
        }
    }

    function displayChatMessageSuccess(text) {
        $(".addMe").html("");
        if (name !== "logged") {
            $(".addMe").append("<h5 class='bg-success'><strong>" + text + "</strong></h5>");
            //$('<div/>').text(text).appendTo($('#addMe'));
            $('.addMe')[0].scrollTop = $('#addMe')[0].scrollHeight;
        }
    }
    $scope.submitPasswordReset = function () {

        var emailUser = $scope.forgotPassword.email;



        var ref = new Firebase("https://luminous-heat-8715.firebaseio.com");
        ref.resetPassword({
            email: emailUser
        }, function (error) {
            if (error) {
                switch (error.code) {
                    case "INVALID_USER":
                        console.log("The specified user account does not exist.");
                        displayChatMessageError(error);
                        clearText();

                        break;
                    default:
                        displayChatMessageError(error);
                        clearText();
                        console.log("Error resetting password:", error);
                }
            } else {
                console.log("Password reset email sent successfully!");
                setTimeout(function () {
                    $state.go('logIn.enter');
                }, 5000);
                displayChatMessageSuccess("Temporary Password has been sent to your email address, you will be redirected to the login page");
                //$state.go('logIn.enter');


            }
        });

    };
}]);