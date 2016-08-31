var myApp = angular.module('PasswordReset');

myApp.controller('resetController',['firebase','$location','$scope',function (firebase,$location, $scope) {

    //Get the query string from the URL of the reset email
    var queryStringParameters = $location.search();
    console.log(queryStringParameters);
    var auth = firebase.app().auth();

    switch (queryStringParameters.mode) {
        case 'resetPassword':
            handleResetPassword(auth, queryStringParameters.actionCode);
            break;

        //For potential future use...
        case 'recoverEmail':
            //handleRecoverEmail(auth, queryStringParameters.actionCode);
            break;
        case 'verifyEmail':
            //handleVerifyEmail(auth, queryStringParameters.actionCode);
            break;
        default:
            // TODO error handling for wrong mode. Tell user.
            console.log('Invalid mode.')
    }

    $scope.validated = {
        init: true,
        SSN: false,
        Question: false
    };

    function validateSSN(ssn) {
        if(ssn===''||typeof ssn=='undefined')
        {
            $scope.alert.type='danger';
            $scope.alert.content="ERRORENTERSSNNUMBER";
            return false;
        }else if(ssn.length!==12){
            $scope.alert.type='danger';
            $scope.alert.content="ERRORENTERVALIDSSN";
            return false;
        }
        return true;
    }

    $scope.submitSSN = function(ssn){
        console.log(ssn);
        if(validateSSN(ssn))
        {
            $scope.loading=true;
            RequestToServer.sendRequestWithResponse('VerifySSN',{'SSN':ssn},ssn).then(function(data) {
                console.log(data);
                if(data.Data.ValidSSN=="true") {
                    $scope.Question = data.Data.Question;
                }else{
                    $timeout(function(){
                        $scope.alert.type="danger";
                        $scope.alert.content="ERRORINCORRECTSSN";
                        $scope.loading=false;
                    });
                }
            }).catch(function(error){
                $timeout(function(){
                    $scope.alert.type="danger";
                    $scope.alert.content="ERRORCONTACTINGHOSPITAL";
                    $scope.loading=false;
                });
            });
        }

        $scope.validated.init = false;
        $scope.validated.SSN = true;
    };

    $scope.submitAnswer = function(answer){
        //$scope.loading=true;

        $scope.validated.SSN = false;
        $scope.validated.Question = true;
    };

    $scope.submitNewPassword=function(newValue){
        //$scope.loading=true;

        $scope.validated.Question = false;
    };

    function handleResetPassword(auth, actionCode){
        var accountEmail;

        auth.verifyPasswordReset(actionCode).then(function (email) {
            var accountEmail = email;

            // TODO 1) SSN verification, 2) security question, 3) password reset

            auth.confirmPasswordReset(actionCode, newPassword).then(function (response) {
                // TODO show success, link to open app
            }).catch(function (error) {
                switch (error.code){
                    case "auth/expired-action-code":
                        $timeout(function () {
                            $scope.alert.content = "CODE_EXPIRED";
                        });
                        break;
                    case "auth/weak-password":
                        $timeout(function () {
                            $scope.alert.content = "WEAK_PASSWORD";
                        });
                        break;
                    default:
                        $timeout(function () {
                            $scope.alert.content = "SERVERPROBLEM";
                        });
                }
            });

        }).catch(function (error) {
            switch (error.code){
                case "auth/expired-action-code":
                    $timeout(function () {
                        $scope.alert.content = "CODE_EXPIRED";
                    });
                    break;
                case "auth/invalid-action-code":
                    $timeout(function () {
                        $scope.alert.content = "INVALID_CODE";
                    });
                    break;
                case "auth/user-disabled":
                    $timeout(function () {
                        $scope.alert.content = "USER_DISABLED";
                    });
                    break;
                case "auth/user-not-found":
                    $timeout(function () {
                        $scope.alert.content = "INVALID_USER";
                    });
                    break;
                default:
                    $timeout(function () {
                        $scope.alert.content = "SERVERPROBLEM";
                    });
            }
        });
    }

}]);