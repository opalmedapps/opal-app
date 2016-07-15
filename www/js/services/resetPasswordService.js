var myApp=angular.module('MUHCApp');
myApp.service('ResetPassword',function(RequestToServer, FirebaseService){
  return{
    setTemporaryPassword:function(temp)
    {
      this.Password=temp;
    },
    getTemporaryPassword:function(temp)
    {
      return this.Password;
    },
    setSSN:function(ssn)
    {
      this.SSN=ssn;
    },
    getSSN:function()
    {
      return this.SSN;
    },
    setEmail:function(email)
    {
      this.Email=email;
    },
    getEmail:function()
    {
      return this.Email;
    },
    setUsername:function(username)
    {
      this.Username=username;
    },
    getUsername:function()
    {
      return this.Username;
    },
    setQuestion:function(question)
    {
      this.Question=question;
    },
    getQuestion:function()
    {
      return this.Question;
    },
    setAnswer:function(answer)
    {
      this.Answer=answer;
    },
    getAnswer:function()
    {
      return this.Answer;
    },
    setToken:function(token)
    {
      this.Token=token;
    },
    getToken:function()
    {
      return this.Token;
    },
    sendRequest:function(type, parameter)
    {
      if(type=='VerifySSN')
      {
        var Ref=new Firebase(FirebaseService.getFirebaseUrl()+'requests');
        parameter=CryptoJS.AES.encrypt(parameter,parameter).toString();
        console.log(parameter);
        Ref.push({ 'Request' : 'VerifySSN', 'DeviceId':RequestToServer.getIdentifier(),'Token':this.Token, 'UserID':this.Username, 'Parameters':{'SSN' : parameter }});
        Ref.off();
      }else if(type=='SetNewPassword'){
        var Ref=new Firebase(FirebaseService.getFirebaseUrl()+'requests');
        console.log(this.Answer);
        parameter=CryptoJS.AES.encrypt(parameter,this.Answer).toString();
        Ref.push({ 'Request' : 'SetNewPassword', 'DeviceId':RequestToServer.getIdentifier(),'Token':this.Token, 'UserID':this.Username, 'Parameters':{'NewPassword' : parameter }});
        Ref.off();
      }else if(type=='VerifyAnswer')
      {
        var Ref=new Firebase(FirebaseService.getFirebaseUrl()+'requests');
        console.log(this.SSN);
        console.log(parameter);
        parameter.Answer=CryptoJS.AES.encrypt(parameter.Answer,this.SSN).toString();
        parameter.Question=CryptoJS.AES.encrypt(parameter.Question,this.SSN).toString();

        Ref.push({ 'Request' : 'VerifySecurityAnswer', 'DeviceId':RequestToServer.getIdentifier(),'Token':this.Token, 'UserID':this.Username, 'Parameters':parameter});
        Ref.off();
      }
    }/*,
    sendNewPasswordToServer:function(newValue)
    {
      var Ref=new Firebase(FirebaseService.getFirebaseUrl()+'requests');
      console.log(this.Answer);
      newValue=CryptoJS.AES.encrypt(newValue,this.Answer).toString();
      Ref.push({ 'Request' : 'ChangePasswordReset', 'DeviceId':RequestToServer.getIdentifier(),'Token':this.Token, 'UserID':this.Username, 'Parameters':{'NewPassword' : newValue }});
      Ref.off();
    }*/
  };


  });
