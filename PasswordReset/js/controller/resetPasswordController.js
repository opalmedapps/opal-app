var myApp = angular.module('PasswordReset');

myApp.controller('resetController',['firebase','$firebaseAuth','$location','$scope','$q','$timeout','requestService',
    function (firebase, $firebaseAuth, $location, $scope, $q, $timeout ,requestService) {
        $scope.alert = {};
        //Get the query string from the URL of the reset email
        var queryStringParameters = $location.search();
        console.log(queryStringParameters);
        var auth = firebase.app().auth();

        switch (queryStringParameters.mode) {
            case 'resetPassword':
                console.log(queryStringParameters.oobCode);
                handleResetPassword(auth, queryStringParameters.oobCode);
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
                $scope.alert.show = true;
                $scope.alert.type='danger';
                $scope.alert.content = "INVALID_REQUEST";
                console.log('Invalid mode. Got ' + queryStringParameters.mode);
        }

        function handleResetPassword(auth, actionCode){
            try {
                auth.verifyPasswordResetCode(actionCode).then(function (email) {
                    console.log("Reset code verified successfully: ");
                    $timeout(function () {
                        $scope.template = './templates/ssn.html';
                    });
                    $scope.accountEmail = email;
                    requestService.setUserEmail(email);
                }).catch(function (error) {
                    $scope.alert.show = true;
                    $scope.alert.type = 'danger';
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
                $scope.alert.show = true;
                console.log(error.code);
                $scope.alert.content = error.code;
            }
        }

        function validateSSN(ssn) {
            if(ssn===''||typeof ssn=='undefined')
            {
                $scope.alert.type='danger';
                $scope.alert.show = true;
                $scope.alert.content="ERRORENTERSSNNUMBER";
                return false;
            }else if(ssn.length!==12){
                $scope.alert.type='danger';
                $scope.alert.show = true;
                $scope.alert.content="ERRORENTERVALIDSSN";
                return false;
            }
            return true;
        }

        $scope.submitSSN = function(ssn){
            $scope.alert.show = false;
            $scope.ssn = ssn;
            if(validateSSN(ssn)) {
                $scope.loading = true;
                requestService.submitSSNToServer(ssn).then(function (question) {
                    $scope.question = question;
                    $scope.loading = false;
                    $timeout(function () {
                        $scope.template = './templates/question.html';
                    });
                }).catch(function(error){
                    $scope.loading = false;
                    $scope.alert.show = true;
                    $scope.alert.type='danger';
                    $scope.alert.content=error.code;
                });
            }
        };

        $scope.submitAnswer = function (answer){
            $scope.alert.show = false;
            if(!answer||answer===''||typeof answer=='undefined')
            {
                $scope.alert.show = true;
                $scope.alert.type='danger';
                $scope.alert.content='ENTERANANSWER';
            }else {
                requestService.setUserAnswer(answer);
                $scope.loading = true;
                requestService.submitAnswerToServer($scope.question, $scope.ssn).then(function (data) {
                    $scope.loading = false;
                    console.log(data);
                    if(data.Data.AnswerVerified=="true") {
                        console.log("Successfully verified answer to question.")
                        $timeout(function () {
                            $scope.template = './templates/newpassword.html';
                        });
                    } else {
                        $scope.alert.show = true;
                        $scope.alert.type='danger';
                        $scope.alert.content='INCORRECT_ANSWER';
                    }
                }).catch(function (error) {
                    $scope.alert = error.alert;
                    $scope.alert.show = true;
                })
            }
        };

        $scope.submitNewPassword = function (newPassword) {
            $scope.alert.show = false;
            if(newPassword===''||typeof newPassword=='undefined')
            {
                $scope.alert.show = true;
                $scope.alert.type='danger';
                $scope.alert.content = "ENTERVALIDPASSWORD";
            }else {
                $scope.loading = true;
                auth.confirmPasswordReset(queryStringParameters.oobCode, newPassword).then(function (response) {
                    // TODO show success, link to open app
                    console.log("Successfully changed password on firebase");
                    requestService.submitNewPasswordToServer(newPassword).then(function (data) {
                        $timeout(function () {
                            $scope.template = '';
                        });
                        $scope.alert = data.alert;
                        $scope.alert.show = true;
                        console.log("Successfully changed password on opal");

                    }).catch(function(error){
                        $scope.loading = true;
                        $scope.alert = error.alert;
                        $scope.alert.show = true;
                    });

                }).catch(function (error) {
                    $scope.alert.show = true;
                    $scope.loading = true;
                    switch (error.code) {
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
            }

        };

    }]);