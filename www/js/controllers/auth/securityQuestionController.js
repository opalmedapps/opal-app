/**
 * Created by PhpStorm.
 * User: James Brace
 * Date: 2017-08-09
 * Time: 3:32 PM
 */

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('SecurityQuestionController', SecurityQuestionController);

    SecurityQuestionController.$inject = ['$scope', '$timeout', 'ResetPassword', 'RequestToServer', 'EncryptionService',
        'UUID', 'UserAuthorizationInfo', '$state', 'Constants', 'DeviceIdentifiers', 'NavigatorParameters'];

    /* @ngInject */
    function SecurityQuestionController($scope, $timeout, ResetPassword, RequestToServer, EncryptionService, UUID,
                                        UserAuthorizationInfo, $state, Constants, DeviceIdentifiers, NavigatorParameters) {

        var vm = this;
        var deviceID;
        var passwordReset;
        var parameters = {};
        var trusted;

        vm.tryReset= 0;
        vm.Question = "";
        vm.alert = {
            type: "",
            message: ""
        };
        vm.answer = "";
        vm.submitAnswer = submitAnswer;

        activate();

        //////////////////////////////////////////

        function activate(){
            deviceID = (Constants.app) ? device.uuid : UUID.getUUID();
            var nav = NavigatorParameters.getNavigator();
            var parameters = nav.getCurrentPage().options;

            trusted = parameters.trusted;

            if (parameters.passwordReset){
                passwordReset = parameters.passwordReset;
                vm.passwordReset = passwordReset;

                ResetPassword.verifyLinkCode(parameters.url)
                    .then(function (email) {
                        UserAuthorizationInfo.setEmail(email);
                        return DeviceIdentifiers.sendDevicePasswordRequest(email);
                    })
                    .then(function (response) {
                        vm.Question = response.Data.securityQuestion.securityQuestion_EN +"/"+response.Data.securityQuestion.securityQuestion_FR ;
                    })
                    .catch(handleError);
            } else {
                vm.Question = parameters.securityQuestion;
            }

            $scope.$watch('answer',function()
            {
                if(vm.alert.hasOwnProperty('type'))
                {
                    delete vm.alert.type;
                }
            });

            // In case someone presses back button, need to remove the deviceID and security answer.
            initNavigator.once('prepop', function () {
                localStorage.removeItem(UserAuthorizationInfo.getUsername()+"/deviceID");
                localStorage.removeItem(UserAuthorizationInfo.getUsername()+"/securityAns");
            });
        }


        function submitAnswer (answer)
        {
            if(!answer || (!vm.ssn && passwordReset))
            {
                vm.alert.type='danger';
                vm.alert.content='ENTERANANSWER';
            }else{

                vm.waiting = true;

                answer = answer.toUpperCase();
                var hash= EncryptionService.hash(answer);

                var key = hash;
                var firebaseRequestField = passwordReset ? 'passwordResetRequests' : undefined;
                var firebaseResponseField = passwordReset ? 'passwordResetResponses' : undefined;
                var parameterObject = {
                    Question:vm.Question,
                    Answer:hash,
                    SSN: vm.ssn,
                    Trusted: trusted
                };

                RequestToServer.sendRequestWithResponse('VerifyAnswer',parameterObject,key, firebaseRequestField, firebaseResponseField).then(function(data)
                {

                    console.log("is trusted: " + trusted);

                    vm.waiting = false;
                    if(data.Data.AnswerVerified === "true")
                    {
                        if (trusted){
                            localStorage.setItem("deviceID",deviceID);
                            localStorage.setItem(UserAuthorizationInfo.getUsername()+"/securityAns", EncryptionService.encryptWithKey(key, UserAuthorizationInfo.getPassword()).toString());
                        }
                        EncryptionService.setSecurityAns(key);

                        EncryptionService.generateEncryptionHash();

                        if(passwordReset){
                            initNavigator.pushPage('./views/login/new-password.html', {data: {oobCode: ResetPassword.getParameter("oobCode", parameters.url)}});
                        }
                        else $state.go('loading');

                    }else if(data.Data.AnswerVerified === "false"){
                        vm.tryReset++;
                        $timeout(function()
                        {
                            localStorage.removeItem(UserAuthorizationInfo.getUsername()+"/deviceID");
                            localStorage.removeItem(UserAuthorizationInfo.getUsername()+"/securityAns");
                            vm.alert = {};
                            if(vm.tryReset>=3)
                            {
                                vm.alert.type='danger';
                                vm.alert.content="CONTACTHOSPITAL";
                                vm.threeTries=true;
                            }else{
                                vm.alert.type='danger';
                                vm.alert.content="ERRORANSWERNOTMATCH";
                            }
                        });
                    } else{
                        handleError({code: ""});
                    }
                }).catch(function(error)
                {
                    vm.waiting = false;
                    localStorage.removeItem(UserAuthorizationInfo.getUsername()+"/deviceID");
                    localStorage.removeItem(UserAuthorizationInfo.getUsername()+"/securityAns");

                    $timeout(function()
                    {
                        vm.alert.type='danger';
                        if(error.Reason.toLowerCase().indexOf('malformed utf-8') === -1) {
                            vm.alert.content = "CONTACTHOSPITAL";
                        } else {
                            vm.alert.content = "ERRORANSWERNOTMATCH";
                        }
                    });
                });
            }
        }

        function handleError(error) {
            alert(JSON.stringify(error));
            vm.alert.type='danger';

            switch (error.code){
                case "auth/expired-action-code":
                    vm.alert.content = "CODE_EXPIRED";
                    break;
                case "auth/invalid-action-code":
                    vm.alert.content = "INVALID_CODE";
                    break;
                case "auth/user-disabled":
                    vm.alert.content = "USER_DISABLED";
                    break;
                case "auth/user-not-found":
                    vm.alert.content = "INVALID_USER";
                    break;
                default:
                    vm.alert.content="INTERNETERROR";
                    break;
            }
        }
    }
})();