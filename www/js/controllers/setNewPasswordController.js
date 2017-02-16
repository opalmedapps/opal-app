/*
 *Code by David Herrera May 20, 2015
 *Github: dherre3
 *Email:davidfherrerar@gmail.com
 */
var myApp=angular.module('MUHCApp');
myApp.controller('SetNewPasswordController',['$scope','$timeout','ResetPassword','RequestToServer','EncryptionService','FirebaseService','NavigatorParameters',function($scope,$timeout,ResetPassword,RequestToServer,EncryptionService,FirebaseService,NavigatorParameters){
    //Enter code here!!
    $scope.alert={};
    console.log('Inside set new password');
    var parameters = NavigatorParameters.getParameters();
    console.log(parameters);
    $scope.$watch('ssn',function()
    {
        if($scope.alert.hasOwnProperty('type'))
        {
            delete $scope.alert.type;
            delete $scope.alert.content;
        }
    });
    function validateSSN(ssn)
    {
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
    var ref=firebase.database().ref('dev2/');
    $scope.submitSSN=function(ssn){
        console.log(ssn);
        if(validateSSN(ssn))
        {
            $scope.loading=true;
            RequestToServer.sendRequestWithResponse('VerifySSN',{'SSN':ssn},ssn).then(function(data)
            {
                console.log(data);
                if(data.Data.ValidSSN=="true")
                {
                    parameters.SSN = ssn;
                    parameters.Question = data.Data.Question;
                    console.log(parameters);
                    NavigatorParameters.setParameters(parameters);
                    initNavigator.pushPage('./views/login/security-question.html');
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
    };

}]);
myApp.controller('SecurityQuestionController',['$scope','$timeout','ResetPassword','RequestToServer',
    'FirebaseService','EncryptionService','NavigatorParameters', 'UUID', 'UserAuthorizationInfo', '$state',
    'Constants', 'DeviceIdentifiers',
    function($scope,$timeout,ResetPassword,RequestToServer,
             FirebaseService,EncryptionService,NavigatorParameters, UUID, UserAuthorizationInfo, $state,
             Constants, DeviceIdentifiers){

        var deviceID = (Constants.app) ? device.uuid : UUID.getUUID();
        var trusted = 0;
        var passwordReset;
        $scope.tryReset=0;
        var parameters = initNavigator.getCurrentPage().options;
        $scope.Question = parameters.securityQuestion;

        if (parameters.passwordReset){
            passwordReset = parameters.passwordReset;
            $scope.passwordReset = passwordReset;

            ResetPassword.verifyLinkCode(parameters.url)
                .then(function (email) {
                    UserAuthorizationInfo.setEmail(email);
                    return DeviceIdentifiers.sendDevicePasswordRequest(email);
                })
                .then(function (response) {
                    console.log(response);
                    $timeout(function () {
                        $scope.Question = response.Data.securityQuestion;
                    });
                })
                .catch(handleError);

        }

        $scope.$watch('answer',function()
        {
            if($scope.alert.hasOwnProperty('type'))
            {
                delete $scope.alert.type;
            }
        });

        $timeout(function () {

            mySwitch.on( 'change', function () {
                if (mySwitch.isChecked()) {
                    console.log("Trusted", deviceID);
                    localStorage.setItem(UserAuthorizationInfo.getUsername()+"/deviceID",deviceID);
                    trusted = 1;
                } else {
                    console.log("Not Trusted");
                    localStorage.removeItem(UserAuthorizationInfo.getUsername()+"/deviceID");
                    trusted = 0;
                }
            });
        });

        // In case someone presses back button, need to remove the deviceID and security answer.
        initNavigator.once('prepop', function () {
            localStorage.removeItem(UserAuthorizationInfo.getUsername()+"/deviceID");
            localStorage.removeItem(UserAuthorizationInfo.getUsername()+"/securityAns");
        });


        $scope.submitAnswer=function(answer)
        {
            if(!answer || (!$scope.ssn && passwordReset))
            {
                $scope.alert.type='danger';
                $scope.alert.content='ENTERANANSWER';
            }else{

                $scope.waiting = true;

                answer=answer.toUpperCase();
                var hash=CryptoJS.SHA256(answer).toString();

                var key = hash;
                var firebaseRequestField = passwordReset ? 'passwordResetRequests' : undefined;
                var firebaseResponseField = passwordReset ? 'passwordResetResponses' : undefined;
                var parameterObject = {
                    Question:$scope.Question,
                    Answer:hash,
                    SSN: $scope.ssn,
                    Trusted: trusted,
                };

                RequestToServer.sendRequestWithResponse('VerifyAnswer',parameterObject,key, firebaseRequestField, firebaseResponseField).then(function(data)
                {
                    console.log(data);
                    $scope.waiting = false;
                    if(data.Data.AnswerVerified=="true")
                    {
                        if (trusted){
                            localStorage.setItem(UserAuthorizationInfo.getUsername()+"/securityAns",CryptoJS.AES.encrypt(key, UserAuthorizationInfo.getPassword()).toString());
                        }
                        EncryptionService.setSecurityAns(key);

                        if(passwordReset){
                            initNavigator.pushPage('./views/login/new-password.html', {oobCode: ResetPassword.getParameter("oobCode", parameters.url)});
                        } else {
                            $state.go('loading');
                        }

                    }else if(data.Data.AnswerVerified=="false"){
                        $scope.tryReset++;
                        $timeout(function()
                        {
                            localStorage.removeItem(UserAuthorizationInfo.getUsername()+"/deviceID");
                            localStorage.removeItem(UserAuthorizationInfo.getUsername()+"/securityAns");
                            $scope.alert = {};
                            if($scope.tryReset>=3)
                            {
                                $scope.alert.type='danger';
                                $scope.alert.content="CONTACTHOSPITAL";
                                $scope.threeTries=true;
                            }else{
                                $scope.alert.type='danger';
                                $scope.alert.content="ERRORANSWERNOTMATCH";
                            }
                        });

                    }
                }).catch(function(error)
                {
                    console.log(error);
                    $scope.waiting = false;
                    localStorage.removeItem(UserAuthorizationInfo.getUsername()+"/deviceID");
                    localStorage.removeItem(UserAuthorizationInfo.getUsername()+"/securityAns");
                    $timeout(function()
                    {
                        $scope.alert.type='danger';
                        $scope.alert.content="CONTACTHOSPITAL";
                    });
                });
            }
        };


        function handleError(error) {
            $scope.alert.type='danger';

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
                        $scope.alert.content="INTERNETERROR";
                    });
            }

            $timeout(function(){
                initNavigator.popPage();
            },5000);

        }

    }]);
myApp.controller('NewPasswordController',['$scope','$timeout','Patient','ResetPassword',
    'FirebaseService','NavigatorParameters','RequestToServer',
    '$state','UserAuthorizationInfo', 'EncryptionService',
    function($scope,$timeout,Patient,ResetPassword,
             FirebaseService,NavigatorParameters,RequestToServer,
             $state,UserAuthorizationInfo,EncryptionService){
    $scope.goToLogin=function()
    {
        UserAuthorizationInfo.clearUserAuthorizationInfo();
        $state.go('init');
    };

    var parameters = initNavigator.getCurrentPage().options;

    $scope.alert={};
    $scope.$watch('newValue',function()
    {
        if($scope.alert.hasOwnProperty('type'))
        {
            delete $scope.alert.type;
            delete $scope.alert.content;
        }
    });

    $scope.submitNewPassword=function(newValue)
    {
        if(!newValue)
        {
            $scope.alert.type='danger';
            $scope.alert.content = "ENTERVALIDPASSWORD";
        }else{

            ResetPassword.completePasswordChange(parameters.oobCode, newValue)
                .then(function () {
                    console.log("Successfully changed password on firebase");
                    return RequestToServer.sendRequestWithResponse(
                        'SetNewPassword',
                        {newPassword: newValue},
                        EncryptionService.getSecurityAns() ,
                        'passwordResetRequests',
                        'passwordResetResponses'
                    );
                })
                .then(function (response) {
                    console.log(response);
                    $timeout(function () {
                        $scope.alert.type='success';
                        $scope.alert.content="PASSWORDUPDATED";
                    });

                    $timeout(function () {
                        $state.go('loading');
                    },3000);
                })
                .catch(function (error) {
                    console.log(error);
                    $scope.alert.type='danger';
                    switch (error.code) {
                        case "auth/invalid-action-code":
                            $timeout(function () {
                                $scope.alert.content = "CODE_INVALID"
                            })
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
