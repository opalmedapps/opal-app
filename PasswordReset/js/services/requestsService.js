/**
 * Created by rob on 01/09/16.
 */
var myApp=angular.module('PasswordReset');
myApp.service('requestService',['$filter','EncryptionService','$q', 'ResetPasswordRequests',
    function($filter,EncryptionService,$q,ResetPasswordRequests){

        var tryReset = 0;
        var userEmail = '';
        var userAnswer = '';

        return {

            setUserEmail : function(email){
                userEmail = email;
            },

            setUserAnswer : function(answer){
                userAnswer = answer;
            },

            submitSSNToServer: function (ssn) {
                var defer = $q.defer();
                console.log(ssn);
                ResetPasswordRequests.sendRequestWithResponse('VerifySSN', {'SSN': ssn, 'Email': userEmail}, ssn).then(function (data) {
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
                return defer.promise;
            },

            submitAnswerToServer: function (question, ssn) {
                var defer = $q.defer();
                userAnswer = userAnswer.toUpperCase();
                var hash = CryptoJS.SHA256(userAnswer).toString();
                ResetPasswordRequests.sendRequestWithResponse('VerifyAnswer', {
                    Question: question,
                    Answer: hash,
                    Email: userEmail
                }, ssn).then(function (data) {
                    console.log(data);
                    if (data.Data.AnswerVerified == "true") {
                        hash = CryptoJS.SHA256(userAnswer).toString();
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
                return defer.promise;
            },

            submitNewPasswordToServer: function (newValue) {
                var defer = $q.defer();
                console.log(userAnswer);
                var answerhash = CryptoJS.SHA256(userAnswer).toString();
                ResetPasswordRequests.sendRequestWithResponse('SetNewPassword', {
                    'NewPassword': newValue, 'Email': userEmail}, answerhash).then(
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
                return defer.promise;
            }
        }
    }]);