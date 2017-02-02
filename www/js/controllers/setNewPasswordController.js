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
    function($scope,$timeout,ResetPassword,RequestToServer,
             FirebaseService,EncryptionService,NavigatorParameters, UUID, UserAuthorizationInfo, $state){
        // var params=NavigatorParameters.getParameters();
        // $scope.ssn = params.SSN;
        // console.log($scope.ssn);
        var browserID = UUID.getUUID();
        var trusted = 0;

        $scope.Question= initNavigator.getCurrentPage().options.securityQuestion.QuestionText;
        $scope.alert = undefined;

        $scope.tryReset=0;
        // $scope.$watch('answer',function()
        // {
        //     if($scope.alert.hasOwnProperty('type'))
        //     {
        //         delete $scope.alert.type;
        //         delete $scope.alert.content;
        //     }
        // });

        $timeout(function () {
            mySwitch.on( 'change', function () {
                if (mySwitch.isChecked()) {
                    console.log("Trusted", browserID);
                    localStorage.setItem("browserID",browserID);
                    trusted = 1;
                } else {
                    console.log("Not Trusted");
                    localStorage.removeItem("browserID");
                    trusted = 0;
                }
            });
        });


        $scope.submitAnswer=function(answer)
        {
            if(!answer||answer===''||typeof answer=='undefined')
            {
                $scope.alert.type='danger';
                $scope.alert.content='ENTERANANSWER';
            }else{
                answer=answer.toUpperCase();
                var hash=CryptoJS.SHA256(answer).toString();
                $scope.loading=true;

                var key = CryptoJS.SHA256(hash+UserAuthorizationInfo.getPassword()).toString();

                RequestToServer.sendRequestWithResponse('VerifyAnswer',{Question:$scope.Question, Answer:hash, Trusted: trusted},key).then(function(data)
                {
                    console.log(data);
                    $timeout(function(){
                        $scope.loading=false;
                    });
                    console.log(data.Data);
                    if(data.Data.AnswerVerified=="true")
                    {
                        $state.go('loading');
                    }else if(data.Data.AnswerVerified=="false"){
                        $scope.tryReset++;
                        $timeout(function()
                        {
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
                }).catch(function()
                {
                    $timeout(function()
                    {
                        $scope.alert.type='danger';
                        $scope.alert.content="CONTACTHOSPITAL";
                    });
                });
            }
        };
    }]);
myApp.controller('NewPasswordController',['$scope','$timeout','Patient','ResetPassword','FirebaseService','NavigatorParameters','RequestToServer','$state','UserAuthorizationInfo',function($scope,$timeout,Patient,ResetPassword,FirebaseService,NavigatorParameters,RequestToServer,$state,UserAuthorizationInfo){
    $scope.goToLogin=function()
    {
        UserAuthorizationInfo.clearUserAuthorizationInfo();
        $state.go('init');
    };
    var parameters = NavigatorParameters.getParameters();
    $scope.alert={};
    $scope.$watch('newValue',function()
    {
        if($scope.alert.hasOwnProperty('type'))
        {
            delete $scope.alert.type;
            delete $scope.alert.content;
        }
    });
    var ref=firebase.database().ref('dev2/');
    $scope.submitNewPassword=function(newValue)
    {
        if(newValue===''||typeof newValue=='undefined')
        {
            $scope.alert.type='danger';
            $scope.alert.content = "ENTERVALIDPASSWORD";
        }else{


            ref.changePassword({
                email: parameters.Email,
                oldPassword: parameters.TempPassword,
                newPassword: newValue
            }, function(error) {
                if (error) {
                    console.log(error);
                    $timeout(function(){
                        $scope.alert.type='danger';
                        $scope.alert.content="SERVERPROBLEM";
                    });
                } else {
                    RequestToServer.sendRequestWithResponse('SetNewPassword',{'NewPassword':newValue},parameters.Answer).then(
                        function(data)
                        {
                            console.log(data);
                            if(data.hasOwnProperty('Data')&&data.Data.PasswordReset=="true")
                            {
                                $timeout(function(){
                                    $scope.alert.type='success';
                                    $scope.alert.content="PASSWORDSUCCESSRESET";
                                });
                            }else{
                                $timeout(function(){
                                    $scope.alert.type='success';
                                    $scope.alert.content="CONTACTHOSPITAL";
                                });
                            }
                        }).catch(function(error)
                    {
                        $timeout(function(){
                            $scope.alert.type='success';
                            $scope.alert.content="CONTACTHOSPITAL";
                        });
                    });
                }
            });
        }
    };


}]);
