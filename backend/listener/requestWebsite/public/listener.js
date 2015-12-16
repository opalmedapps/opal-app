var app=angular.module('MUHCAppListener',[]);
app.controller('MainController',['$scope','$timeout',function($scope,$timeout){
  $scope.requests=[];
  console.log(CryptoJS.SHA256('12345').toString());
  $scope.selectTimeline='All';
  setInterval(function(){
    location.reload();
  },1296000000);
  var ref=new Firebase('https://brilliant-inferno-7679.firebaseio.com/');
  ref.child('requests').on('child_added',function(request){
    $.post("http://172.26.66.41:8010/login",{key: request.key(),objectRequest: request.val()}, function(data){
      console.log(data);
      if(data.type=='UploadToFirebase')
      {
        uploadToFirebase(data.requestKey, data.encryptionKey,data.requestObject, data.object);
      }else if(data.type=='CompleteRequest')
      {
        completeRequest(data.requestKey,data.requestObject,data.Invalid);
      }else if(data.type=='ResetPasswordError')
      {
        resetPasswordError(data.requestKey,data.requestObject);
      }

    });
  });


  function uploadToFirebase(requestKey,encryptionKey,requestObject,object)
  {
    console.log('I am about to go to into encrypting');
    //console.log(request);
    object=encryptObject(object,encryptionKey);
    //console.log(object);
    var deviceId=requestObject.DeviceId;
    var UserID=requestObject.UserID;
    var userFieldsPath='Users/'+UserID+'/'+deviceId;
      console.log('I am about to write to firebase');
    ref.child(userFieldsPath).update(object, function(){
      console.log('I just finished writing to firebase');
      completeRequest(requestKey, requestObject);
      //logRequest(requestObject);
    });
  }
  function resetPasswordError(requestKey,requestObject)
  {
    var response={};
    response.ResetPassword={};
    response.ResetPassword.type='error';
    var deviceId=requestObject.DeviceId;
    var UserID=requestObject.UserID;
    var userFieldsPath='Users/'+UserID+'/'+deviceId;
      console.log('I am about to write to firebase');
    ref.child(userFieldsPath).update(response, function(){
      console.log('I just finished writing to firebase');
      completeRequest(requestKey, requestObject);
      //logRequest(requestObject);
    });
  }
  function completeRequest(requestKey, requestObject, invalid)
  {
    requestObject.Parameters=JSON.stringify(requestObject.Parameters);
    requestObject.time=new Date();

    if(invalid!==undefined)
    {
      requestObject.response='Failure';
    }else{
      requestObject.response='Success';
    }
    $timeout(function(){
      $scope.requests.push(requestObject);
      console.log($scope.requests);
    });
    //Clear request
    ref.child('requests').child(requestKey).set(null);
    //Log Request
  }


  function encryptObject(object,secret)
  {
    /*console.log(object.Appointments[0].ScheduledStartTime);
    var dateString=object.Appointments[0].ScheduledStartTime.toISOString();
    console.log(dateString);*/
    //var object=JSON.parse(JSON.stringify(object));
    if(typeof object=='string')
    {
      var ciphertext = CryptoJS.AES.encrypt(object, secret);
      object=ciphertext.toString();
      return object;
    }else{
      for (var key in object)
      {

        if (typeof object[key]=='object')
        {

          if(object[key] instanceof Date )
          {
            object[key]=object[key].toISOString();
            var ciphertext = CryptoJS.AES.encrypt(object[key], secret);
            object[key]=ciphertext.toString();
          }else{
              encryptObject(object[key],secret);
          }

        } else
        {
          //console.log('I am encrypting right now!');
          if (typeof object[key] !=='string') {
            //console.log(object[key]);
            object[key]=String(object[key]);
          }
          //console.log(object[key]);
          var ciphertext = CryptoJS.AES.encrypt(object[key], secret);
          object[key]=ciphertext.toString();
        }
      }
      return object;
    }

  };

  }]);
  app.filter('filterRequests', function() {
  return function( items, option) {
    var filtered = [];
    var date=new Date();
    if(option=='Today')
    {
      var date=date.setHours(0,0,0,0);
    }else if(option=='All')
    {
      date=new Date('1980');
    }else if(option=='Last 7 days')
    {
      date.setDate(date.getDate()-7);
    }else if(option=='Last 15 days')
    {
        date.setDate(date.getDate()-15);
    }
    angular.forEach(items, function(item) {
      if(item.time>date)
      {
        filtered.push(item);
      }
    });
    return filtered;
  };
});
