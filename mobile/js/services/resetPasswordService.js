var myApp=angular.module('MUHCApp');
myApp.service('ResetPassword',function(RequestToServer){
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
    sendRequestReset:function(ssn)
    {
      var Ref=new Firebase('https://brilliant-inferno-7679.firebaseio.com/requests');
      ssn=CryptoJS.AES.encrypt(ssn,ssn).toString();
      console.log(ssn);
      Ref.push({ 'Request' : 'ResetPassword', 'DeviceId':RequestToServer.getIdentifier(),'UserID':this.Username, 'Parameters':{'SSN' : ssn }});
      Ref.off();
    },
    sendNewPasswordToServer:function(newValue)
    {
      var Ref=new Firebase('https://brilliant-inferno-7679.firebaseio.com/requests');
      console.log(this.Answer);
      newValue=CryptoJS.AES.encrypt(newValue,this.Answer).toString();
      Ref.push({ 'Request' : 'ChangePasswordReset', 'DeviceId':RequestToServer.getIdentifier(),'UserID':this.Username, 'Parameters':{'NewPassword' : newValue }});
      Ref.off();
    }
  };


  });
