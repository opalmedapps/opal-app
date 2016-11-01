var express        =         require("express");
var bodyParser     =         require("body-parser");
var mainRequestApi=require('./main.js');
var resetPasswordApi=require('./resetPassword.js');

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
  console.log("----------------------------------REQUEST OBJECT --------------------------------------")
  console.log(requestObject);


    if(requestObject.Request=='VerifySSN'||requestObject.Request=='SetNewPassword'||requestObject.Request=='VerifyAnswer')
    {
      console.log(requestObject);
      resetPasswordApi.resetPasswordRequest(requestKey,requestObject).then(function(results)
      {
        console.log('Reset Password ');
        console.log(results);
        res.send(results);
      });

    }else{
      mainRequestApi.apiRequestFormatter(requestKey, requestObject).then(function(results){
        console.log('Api call from server.js');
        console.log(results);
        res.send(results);
      });
    }
});

app.listen(8030,function(){
  console.log("Started on PORT 8030");
});
