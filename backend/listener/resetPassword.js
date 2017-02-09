var sqlInterface=require('./sqlInterface.js');
var q=require('q');
var utility=require('./utility.js');
var CryptoJS=require('crypto-js');
var exports=module.exports={};


exports.resetPasswordRequest=function(requestKey, requestObject)
{
  var r=q.defer();
  console.log(requestObject.UserEmail);
  var responseObject = {};
  //Get the patient fields to verify the credentials
  sqlInterface.getPatientFieldsForPasswordReset(requestObject).then(function(patient){
    //Check for injection attacks by the number of rows the result is returning
    if(patient.length>1||patient.lenght === 0)
    {
      responseObject = { Headers:{RequestKey:requestKey,RequestObject:requestObject}, Code: 2, Data:{},Response:'error', Reason:'Injection attack, incorrect Email'};       
      r.resolve(responseObject);
    }else{
      //If the request is not erroneus simply direct the request to appropiate function based on the request mapping object
      //var request = requestObject.Request;
      console.log(requestObject.Request, requestObject.Parameters);
      console.log(patient);
      requestMappings[requestObject.Request](requestKey, requestObject,patient[0]).then(function(response){
            r.resolve(response);
          });
      }
  }).catch(function(error){
    console.log(error);
    //If there is an error with the queries reply with an error message
    responseObject = { Headers:{RequestKey:requestKey,RequestObject:requestObject}, Code: 2, Data:{},Response:'error', Reason:'Invalid arguments for query'};       
    r.resolve(responseObject);
  });
  return r.promise;

};
exports.verifySecurityAnswer=function(requestKey,requestObject,patient)
{
  var r=q.defer();

  var key = patient.AnswerText;

  var unencrypted=utility.decryptObject(requestObject.Parameters,key);
  console.log("UNENCRYPTED request", unencrypted);

  var response = {};

  if (unencrypted.Answer == patient.AnswerText){
    response = { RequestKey:requestKey, Code:3,Data:{AnswerVerified:"true"}, Headers:{RequestKey:requestKey,RequestObject:requestObject},Response:'success'};
    sqlInterface.setTrusted(requestObject)
      .then(function(){
        r.resolve(response);
      })
      .catch(function(error){
        response = { Headers:{RequestKey:requestKey,RequestObject:requestObject}, Code: 2, Data:{},Response:'error', Reason:'Could not set trusted device'};
      })
    
  } else {
    response = { RequestKey:requestKey, Code:3,Data:{AnswerVerified:"false"}, Headers:{RequestKey:requestKey,RequestObject:requestObject},Response:'success'};
    r.resolve(response);
  }
  // sqlInterface.getSecurityQuestions(patient.PatientSerNum).then(function(questions)
  // {
  //   console.log('line 44', questions);
  //   var flag=false;
  //   for (var i = 0; i < questions.length; i++) {

  //       if(unencrypted.Question==questions[i].QuestionText&&questions[i].AnswerText==unencrypted.Answer)
  //       {
  //         console.log(questions[i].QuestionText);
  //         console.log(questions[i].AnswerText);
  //         flag=true;
  //         break;
  //       }
  //   }
  //   if(flag)
  //   {
  //     var response = { RequestKey:requestKey, Code:3,Data:{AnswerVerified:"true"}, Headers:{RequestKey:requestKey,RequestObject:requestObject},Response:'success'};
  //     r.resolve(response);
  //   }else{
  //     var response = { RequestKey:requestKey, Code:3,Data:{AnswerVerified:"false"}, Headers:{RequestKey:requestKey,RequestObject:requestObject},Response:'success'};
  //     r.resolve(response);
  //   }
  // }).catch(function(error){
  //   var response = { Headers:{RequestKey:requestKey,RequestObject:requestObject}, Code: 2, Data:{},Response:'error', Reason:'Could not obtain security questions'};       
  //   r.resolve(response);
  // });
  return r.promise;
};
exports.setNewPassword=function(requestKey, requestObject,patient)
{
  var r=q.defer();
  sqlInterface.getSecurityQuestions(patient.PatientSerNum).then(function(questions)
  {
      console.log(questions);
      var flag=false;
      var newPassword='';
      for (var i = 0; i < questions.length; i++) {
        console.log(questions[i].AnswerText);
        var password={NewPassword:requestObject.Parameters.NewPassword};
        console.log(password);
        password=utility.decryptObject(password,questions[i].AnswerText);
        console.log(password);
        if(typeof password.NewPassword!=='undefined'&&password.NewPassword!==''){
          console.log(password.NewPassword);
          console.log('I am the truth');
          newPassword=CryptoJS.SHA256(password.NewPassword).toString();
          console.log(newPassword);
          flag=true;
        }
      }
      if(!flag)
      {
        var response = { RequestKey:requestKey, Code:3,Data:{PasswordReset:"false"}, Headers:{RequestKey:requestKey,RequestObject:requestObject},Response:'success'};

        r.resolve(response);
      }else{
        sqlInterface.setNewPassword(newPassword,patient.PatientSerNum, requestObject.Token).then(function(){
          var response = { RequestKey:requestKey, Code:3,Data:{PasswordReset:"true"}, Headers:{RequestKey:requestKey,RequestObject:requestObject},Response:'success'};
          r.resolve(response);
        }).catch(function(response){
          console.log('Invalid setting password');
            //completeRequest(requestKey,{},'Invalid');
            var response = { Headers:{RequestKey:requestKey,RequestObject:requestObject}, Code: 2, Data:{},Response:'error', Reason:'Could not set password'};       
            r.resolve(response);
        });
      }
    });
    return r.promise;
  };
exports.verifySSN=function(requestKey, requestObject,patient)
{
    var r=q.defer();
    console.log(patient.SSN);
    var unencrypted=utility.decryptObject(requestObject.Parameters,patient.SSN);
    console.log(unencrypted);
    if(typeof unencrypted.SSN!=='undefined'&&unencrypted.SSN!=='')
    {
      console.log('line 131',patient.PatientSerNum);
      sqlInterface.getSecurityQuestions(patient.PatientSerNum).then(function(questions)
      {
        console.log(questions);
        var integer=Math.floor((questions.length*Math.random()));
        delete questions[integer].Answer;
        questions[integer].ValidSSN = "true";
        var response = { RequestKey:requestKey, Code:3,Data:questions[integer], Headers:{RequestKey:requestKey,RequestObject:requestObject},Response:'success'};
        r.resolve(response);
      }).catch(function(error){
        var response = { Headers:{RequestKey:requestKey,RequestObject:requestObject}, Code: 2, Data:{},Response:'error', Reason:'Error obtaining security question'};       
        r.resolve(response);
      });
    }else{
      var response = { Headers:{RequestKey:requestKey,RequestObject:requestObject}, Code: 3, Data:{ValidSSN:"false"},Response:'success', Reason:'Invalid SSN'};       
      r.resolve(response);
    }

  return r.promise;
};

var requestMappings = {
  'VerifySSN':exports.verifySSN,
  'SetNewPassword':exports.setNewPassword,
  'VerifyAnswer':exports.verifySecurityAnswer
};