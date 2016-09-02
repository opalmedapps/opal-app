var myApp = angular.module('PasswordReset');

myApp.controller('resetController',['firebase','$firebaseAuth','$location','$scope','$q','$timeout',/*'requestService',*/
    function (firebase, $firebaseAuth, $location, $scope, $q, $timeout /*, requestService*/) {
        $scope.alert = {};
        //Get the query string from the URL of the reset email
        var queryStringParameters = $location.search();
        console.log(queryStringParameters);
        var auth = firebase.app().auth();

        switch (/*queryStringParameters.mode*/ 'resetPassword') {
            case 'resetPassword':
                // riH5-6pIzHkyDgVTSZjOEJGSSWk
                //(auth, queryStringParameters.actionCode);
                $firebaseAuth().$signOut();
                console.log(auth);
                handleResetPassword(auth, 'fY8TxN-sxhRQ710D_dnfeEQYJ0E');
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
                $scope.isNotValid = true;
                $scope.alert.type='danger';
                $scope.alert.content = "INVALID_REQUEST";
                console.log('Invalid mode. Got ' + queryStringParameters.mode);
        }

        function handleResetPassword(auth, actionCode){
            try {
                auth.verifyPasswordResetCode(actionCode).then(function (email) {



                    console.log(email);
                    $scope.template = 'templates/ssn.html';
                    $scope.accountEmail = email;
                }).catch(function (error) {
                    $scope.isNotValid = true;
                    console.log(error.code);
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

            } catch (error) {
                $scope.alert.type='danger';
                $scope.isNotValid = true;
                console.log(error.code);
                $scope.alert.content = error.code;
            }
        }

        $scope.submitSSN = function(ssn){

            requestService.submitSSNToServer(ssn).then(function (question) {
                $scope.question = question;
                $scope.template = 'templates/question.html';
            }).catch();

        };

        $scope.submitAnswer = function (answer){

        };

        $scope.submitNewPassword = function (newPassword) {

            auth.confirmPasswordReset(queryStringParameters.actionCode, newPassword).then(function (response) {
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

        };

        // BReak into verify
        // Submit SSN
        // Submit Answer
        // Submit and confirm pwd reset

    }]);