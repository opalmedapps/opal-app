var express        =         require("express");
var bodyParser     =         require("body-parser");
var utility=require('./utility.js');
var updateClient=require('./updateClient.js');
var updateServer=require('./updateServer.js');
var credentials=require('./credentials.js');
var sqlInterface=require('./sqlInterface.js');
var CryptoJS=require('crypto-js')
var api=require('./api.js');

var app            =         express();
app.use(bodyParser.urlencoded({ extended: true }));
app.all('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });
app.get('/',function(req,res,next){
  res.sendfile("./requestWebsite/index.html");
});
app.use(express.static('./requestWebsite/public'));
app.get('/request',function(req,res,next){
  console.log(req.body);
  res.sendfile("./requestWebsite/index.html");
});
app.post('/login',function(req,res,next){
  var requestKey=req.body.key;
  var request=req.body.objectRequest;
  var requestObject={};
  requestObject=request;
  console.log(requestObject);
  console.log(requestKey);
    console.log(requestObject);

    if(requestObject.Request=='ResetPassword'||requestObject.Request=='ChangePasswordReset')
    {
      console.log(requestObject);
      sqlInterface.getPatientFieldsForPasswordReset(requestObject.UserID).then(function(patient){
        console.log('Inside this function');
        console.log(patient);
        console.log(patient.SSN);
        if(requestObject.Request=='ResetPassword'){
          var unencrypted=utility.decryptObject(requestObject.Parameters,patient.SSN);
          console.log(unencrypted);
          if(typeof unencrypted.SSN!=='undefined'&&unencrypted.SSN!=='')
          {
            //console.log(patient.PatientSerNum);
            sqlInterface.getSecurityQuestions(patient.PatientSerNum).then(function(questions)
            {
              console.log(questions);
              var integer=Math.floor((3*Math.random()));
              console.log(integer);
              questions[integer].type='success';
              var response={ResetPassword:questions[integer]};
              var firebaseObject={};
              firebaseObject.type='UploadToFirebase';
              firebaseObject.requestKey=requestKey;
              firebaseObject.requestObject=requestObject;
              firebaseObject.encryptionKey=patient.SSN;
              firebaseObject.object=response;
              res.send(firebaseObject);
            });
          }else{
            response.type='ResetPasswordError';
            response.requestKey=requestKey;
            response.requestObject=requestObject;
            res.send(response);
          }
        }else{
          sqlInterface.getSecurityQuestions(patient.PatientSerNum).then(function(questions)
          {
            console.log(questions);
            var flag=false;
            var newPassword='';
            for (var i = 0; i < questions.length; i++) {
              console.log(questions[i].Answer);
              var password={NewPassword:requestObject.Parameters.NewPassword};
              console.log(password);
              password=utility.decryptObject(password,questions[i].Answer);
              console.log(password);
              if(typeof password.NewPassword!=='undefined'&&password.NewPassword!==''){
                console.log(password.NewPassword);
                newPassword=CryptoJS.SHA256(password.NewPassword).toString();
                console.log(newPassword);
                console.log('I am the truth');
                flag=true;
              }
            }
            if(!flag)
            {
              //completeRequest(requestKey,{},'Invalid');
              console.log('Invalid flag');
            }else{
              console.log(patient);
              sqlInterface.setNewPassword(newPassword,patient.PatientSerNum).then(function(){
                var firebaseObject={};
                firebaseObject.requestKey=requestKey;
                firebaseObject.requestObject={};
                firebaseObject.type='CompleteRequest';
                res.send(firebaseObject);
              }).catch(function(response){
                console.log('Invalid setting password');
                  //completeRequest(requestKey,{},'Invalid');
                  var firebaseObject={};
                  firebaseObject.requestKey=requestKey;
                  firebaseObject.requestObject={};
                  firebaseObject.type='CompleteRequest';
                  firebaseObject.Invalid='Invalid';
                  if(firebaseObject.Invalid!==undefined)
                  {
                    api.logRequest(requestObject);
                  }else{
                    requestObject.reason='Error wrong arguments';
                    api.logRequest(requestObject);
                  }
                  res.send(firebaseObject);
              });
            }
          });
        }
      }).catch(function(response){
        var firebaseObject={};
        firebaseObject.requestKey=requestKey;
        firebaseObject.requestObject={};
        firebaseObject.type='CompleteRequest';
        firebaseObject.Invalid='Invalid';
        if(firebaseObject.Invalid!==undefined)
        {
          api.logRequest(requestObject);
        }else{
          requestObject.reason='Error wrong arguments';
          api.logRequest(requestObject);
        }
        res.send(firebaseObject);
      });
    }else{
      sqlInterface.getUsersPassword(requestObject.UserID).then(function(key){
        requestObject.Request=utility.decryptObject(requestObject.Request,key);
        var encryptionKey=key;
        console.log(requestObject.Request);

        if(requestObject.Request=='') {
          console.log('Rejecting request');
          var firebaseObject={};
          firebaseObject.requestKey=requestKey;
          firebaseObject.requestObject={};
          firebaseObject.type='CompleteRequest';
          firebaseObject.Invalid='Invalid';
          if(firebaseObject.Invalid!==undefined)
          {
            api.logRequest(requestObject);
          }else{
            requestObject.reason='Error wrong arguments';
            api.logRequest(requestObject);
          }
          res.send(firebaseObject);
          return;
        }
        requestObject.Parameters=utility.decryptObject(requestObject.Parameters,key);
        if(requestObject.Request=='Login'||requestObject.Request=='Refresh')
        {
          updateClient.update(requestObject).then(function(objectToFirebase)
          {
            console.log(objectToFirebase);
            var firebaseObject={};
            firebaseObject.requestKey=requestKey;
            firebaseObject.requestObject=requestObject;
            firebaseObject.encryptionKey=encryptionKey;
            firebaseObject.object=objectToFirebase;
            firebaseObject.type='UploadToFirebase';
            res.send(firebaseObject);
            console.log('Completing update client requests');
          }).catch(function(response){
              var firebaseObject={};
              firebaseObject.requestKey=requestKey;
              firebaseObject.requestObject=requestObject;
              firebaseObject.type='CompleteRequest';
              firebaseObject.Invalid='Invalid';
              if(firebaseObject.Invalid!==undefined)
              {
                api.logRequest(requestObject);
              }else{
                requestObject.reason='Error wrong arguments';
                api.logRequest(requestObject);
              }
              res.send(firebaseObject);
          });
        }else
        {
          console.log('server request');
          updateServer.update(requestObject).then(function(response)
          {
            var firebaseObject={};
            firebaseObject.requestKey=requestKey;
            firebaseObject.requestObject=requestObject;
            firebaseObject.type='CompleteRequest';
            res.send(firebaseObject);
          }).catch(function(response){
            var firebaseObject={};
            firebaseObject.requestKey=requestKey;
            firebaseObject.requestObject=requestObject;
            firebaseObject.type='CompleteRequest';
            firebaseObject.Invalid='Invalid';
            if(firebaseObject.Invalid!==undefined)
            {
              api.logRequest(requestObject);
            }else{
              requestObject.reason='Error wrong arguments';
              api.logRequest(requestObject);
            }
            console.log('Problems with update server request');
            res.send(firebaseObject);
          });
        }
      }).catch(function(error){
        console.log(error);
        var firebaseObject={};
        firebaseObject.requestKey=requestKey;
        firebaseObject.requestObject=requestObject;
        firebaseObject.type='CompleteRequest';
        firebaseObject.Invalid='Invalid';
        if(firebaseObject.Invalid!==undefined)
        {
          api.logRequest(requestObject);
        }else{
          requestObject.reason='Error wrong arguments';
          api.logRequest(requestObject);
        }
        res.send(firebaseObject);
      });
    }
     /*requestObject.Request=utility.decryptObject(requestObject.Request);
     console.log(requestObject.Request);
     requestObject.Parameters=utility.decryptObject(requestObject.Parameters);
    if(requestObject.Request=='Login'||requestObject.Request=='Refresh')
    {
      updateClient.update(requestObject).then(function(objectToFirebase)
      {
          var firebaseObject={};
          firebaseObject.key=requestKey;
          firebaseObject.requestObject=requestObject;
          firebaseObject.objectToFirebase=objectToFirebase;
          res.send(firebaseObject);
          //uploadToFirebase(requestKey, requestObject, objectToFirebase);

      }).catch(function(response){
          var firebaseObject={};
          firebaseObject.key=requestKey;
          firebaseObject.requestObject=requestObject;
          res.send(firebaseObject);
      });
    }else
    {
      updateServer.update(requestObject).then(function(requestObject)
      {
          console.log(requestObject);
          var firebaseObject={};
          firebaseObject.key=requestKey;
          firebaseObject.requestObject=requestObject;
          res.send(firebaseObject);

      }).catch(function(response){
        console.log(requestObject);
        console.log(requestObject);
        var firebaseObject={};
        firebaseObject.key=requestKey;
        firebaseObject.requestObject=requestObject;
        res.send(firebaseObject);
      });
   }*/


});

app.listen(8010,function(){
  console.log("Started on PORT 3000");
})
