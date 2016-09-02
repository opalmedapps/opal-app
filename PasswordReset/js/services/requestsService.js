/**
 * Created by rob on 01/09/16.
 */
var myApp=angular.module('PasswordReset');
myApp.service('requestService',['$filter','EncryptionService','FirebaseService','$q',
    function($filter,UserAuthorizationInfo, EncryptionService, $q){

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

        return {
            submitSSNToServer : function(ssn){
                var defer = $q.defer();
                console.log(ssn);
                if(validateSSN(ssn))
                {
                    $scope.loading=true;
                    ResetPasswordRequests.sendRequestWithResponse('VerifySSN',{'SSN':ssn},ssn).then(function(data) {
                        console.log(data);
                        if(data.Data.ValidSSN=="true") {
                            question = data.Data.Question;
                            return defer.resolve(question);
                        }else{
                            return defer.reject();
                        }
                    }).catch(function(error){
                        console.log(error);
                        return defer.reject();
                    });
                } else {
                    return defer.reject();
                }
            },

            submitAnswerToServer : function(answer){
                //$scope.loading=true;


            },

            submitNewPasswordToServer: function(newValue){
                //$scope.loading=true;


            }
        }
    }]);