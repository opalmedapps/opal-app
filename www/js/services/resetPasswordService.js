//
// Author David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
var myApp=angular.module('MUHCApp');
myApp.service('ResetPassword',function(RequestToServer, FirebaseService){
    //var Ref= firebase.database().ref('dev2/requests');

    return{
        // setTemporaryPassword:function(temp)
        // {
        //     this.Password=temp;
        // },
        // getTemporaryPassword:function(temp)
        // {
        //     return this.Password;
        // },
        // setSSN:function(ssn)
        // {
        //     this.SSN=ssn;
        // },
        // getSSN:function()
        // {
        //     return this.SSN;
        // },
        // setEmail:function(email)
        // {
        //     this.Email=email;
        // },
        // getEmail:function()
        // {
        //     return this.Email;
        // },
        // setUsername:function(username)
        // {
        //     this.Username=username;
        // },
        // getUsername:function()
        // {
        //     return this.Username;
        // },
        // setQuestion:function(question)
        // {
        //     this.Question=question;
        // },
        // getQuestion:function()
        // {
        //     return this.Question;
        // },
        // setAnswer:function(answer)
        // {
        //     this.Answer=answer;
        // },
        // getAnswer:function()
        // {
        //     return this.Answer;
        // },
        // setToken:function(token)
        // {
        //     this.Token=token;
        // },
        // getToken:function()
        // {
        //     return this.Token;
        // },
        // sendRequest:function(type, parameter)
        // {
        //     if(type=='VerifySSN')
        //     {
        //
        //         parameter=CryptoJS.AES.encrypt(parameter,parameter).toString();
        //         console.log(parameter);
        //         Ref.push({ 'Request' : 'VerifySSN', 'DeviceId':RequestToServer.getIdentifier(),'Token':this.Token, 'UserID':this.Username, 'Parameters':{'SSN' : parameter }});
        //         Ref.off();
        //     }else if(type=='SetNewPassword'){
        //         console.log(this.Answer);
        //         parameter=CryptoJS.AES.encrypt(parameter,this.Answer).toString();
        //         Ref.push({ 'Request' : 'SetNewPassword', 'DeviceId':RequestToServer.getIdentifier(),'Token':this.Token, 'UserID':this.Username, 'Parameters':{'NewPassword' : parameter }});
        //         Ref.off();
        //     }else if(type=='VerifyAnswer')
        //     {
        //         parameter.Answer=CryptoJS.AES.encrypt(parameter.Answer,this.SSN).toString();
        //         parameter.Question=CryptoJS.AES.encrypt(parameter.Question,this.SSN).toString();
        //         Ref.push({ 'Request' : 'VerifySecurityAnswer', 'DeviceId':RequestToServer.getIdentifier(),'Token':this.Token, 'UserID':this.Username, 'Parameters':parameter});
        //         Ref.off();
        //     }
        // },
        /**
         *@ngdoc method
         *@name verifyLinkCode
         *@param {String} url Url that is provided by the redirect from the reset email.
         *@methodOf MUHCApp.service:ResetPassword
         *@description verifies the password reset code sent to the user.
         **/
        verifyLinkCode: function (url) {

            var modeCode = this.getParameter('mode', url);
            var oobCode = this.getParameter('oobCode', url);
            var auth = firebase.app().auth();

            return auth.verifyPasswordResetCode(oobCode[1]);

        },

        completePasswordChange : function (url, newPassword) {

            var oobCode = getParameter('oobCode', url);
            var auth = firebase.app().auth();

            return auth.confirmPasswordReset(oobCode, newPassword).then(function () {
                console.log("Successfully changed password on firebase");
                return RequestToServer.sendRequestWithResponse('SetNewPassword', {NewPassword: newPassword});
            })
        },

        getParameter: function(param, url){
            var regex = new RegExp('[?&]' + param +'=([^&#]*)', 'i');
            return regex.exec(url);
        }
    };


});
