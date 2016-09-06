/**
 * Created by rob on 01/09/16.
 */
var myApp=angular.module('PasswordReset');
myApp.service('requestService',['$filter','EncryptionService','$q', 'ResetPasswordRequests',
    function($filter,EncryptionService,ResetPasswordRequests, $q){

        var tryReset = 0;

        return {
            submitSSNToServer: function (ssn, email) {
                var defer = $q.defer();
                console.log(ssn);
                ResetPasswordRequests.sendRequestWithResponse('VerifySSN', {'SSN': ssn, 'Email': email}, ssn).then(function (data) {
                    console.log(data);
                    if (data.Data.ValidSSN == "true") {
                        question = data.Data.Question;
                        return defer.resolve(question);
                    } else {
                        return defer.reject("ERRORENTERVALIDSSN");
                    }
                }).catch(function (error) {
                    console.log(error);
                    return defer.reject("SERVERPROBLEM");
                });
            },

            submitAnswerToServer: function (answer, ssn) {
                var defer = $q.defer();
                answer = answer.toUpperCase();
                var hash = CryptoJS.SHA256(answer).toString();
                ResetPasswordRequests.sendRequestWithResponse('VerifyAnswer', {
                    Question: $scope.Question,
                    Answer: hash
                }, ssn).then(function (data) {
                    console.log(data);
                    if (data.Data.AnswerVerified == "true") {
                        hash = CryptoJS.SHA256(answer).toString();
                        return defer.resolve(question);
                    } else if (data.Data.AnswerVerified == "false") {
                        var errorData = {
                            attempts: tryReset++,
                            alert: {
                                type: 'danger',
                                content: "CONTACTHOSPITAL"
                            },
                            threeTries: tryReset >= 3
                        };
                        return defer.reject(errorData);
                    }
                }).catch(function () {
                    return defer.reject({alert:{type:'danger',content:"SERVERPROBLEM"}});
                });
            },

            submitNewPasswordToServer: function (newValue) {
                var defer = $q.defer();
                RequestToServer.sendRequestWithResponse('SetNewPassword', {'NewPassword': newValue}, parameters.Answer).then(
                    function (data) {
                        console.log(data);
                        if (data.hasOwnProperty('Data') && data.Data.PasswordReset == "true") {
                            var successData = {
                                alert: {
                                    type: 'success',
                                    content: "PASSWORDSUCCESSRESET"
                                }
                            };
                            return defer.resolve(successData);
                        } else {
                            var errorData = {
                                alert: {
                                    type: 'danger',
                                    content: "CONTACTHOSPITAL"
                                }
                            };
                            return defer.reject(errorData);
                        }
                    }).catch(
                    function (error) {
                        var errorData = {
                            errorCode : error.code,
                            alert: {
                                type: 'danger',
                                content: "CONTACTHOSPITAL"
                            }
                        };
                        return defer.reject(errorData);
                    });
            }
        }
    }]);