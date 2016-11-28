var app=angular.module('MUHCAppListener',[]);
app.controller('MainController',['$scope','$timeout',function($scope,$timeout){
  $scope.requests=[];
  $scope.selectTimeline='All';
  var ref=new Firebase('https://opal-dev.firebaseio.com/dev2');
  ref.auth('wX6RW5wPthYjEuUxfAviFa2BwXPdjuLEVcCIV7dB');
  setInterval(function(){ 
       clearTimeoutRequests();
  },10000);

function clearTimeoutRequests()
{
    ref.child('users').once('value',function(snapshot){
       console.log('I am inside deleting requests');
        var now=(new Date()).getTime();
        var usersData=snapshot.val();
        for (var user in usersData) {
          for(var requestKey in usersData[user])
          {
            if(usersData[user][requestKey].hasOwnProperty('Timestamp')&&now-usersData[user][requestKey].Timestamp>60000)
            {
              console.log('I am deleting requests');
              ref.child('users/'+user+'/'+requestKey).set(null);
            }
          }
         
        }
    });
}
 

  ref.on('child_added',function(request){
    console.log(request.val());
    console.log("insidelistener");

    request.forEach(function(childSnapshot){
      console.log(childSnapshot.key());
      var headers = {key: childSnapshot.key(),objectRequest: childSnapshot.val()}
      console.log(headers);
      if(!(request.key() === "users" || request.key() === "passwordResetResponses")){
        $.post("http://172.26.66.41:8030/login", headers, function(response){
          console.log(request.key());
          if (request.key() === "requests") uploadToFirebase(response);
          if (request.key() === "passwordResetRequests") uploadToFirebasePasswordReset(response);
        });
        // Exit the loop
      }
    });
   
  });

  function uploadToFirebasePasswordReset(response)
  {
    console.log('I am about to go to into encrypting regular upload: PasswordReset');

    var headers = angular.copy(response.Headers);
    var success = response.Response;
    var requestKey = headers.RequestKey;
    var encryptionKey = response.EncryptionKey;
    console.log(encryptionKey);
    delete response.EncryptionKey;
    if(typeof encryptionKey!=='undefined' && encryptionKey!=='') response = encryptObject(response, encryptionKey);
    response.Timestamp = Firebase.ServerValue.TIMESTAMP;
    console.log(response);
    var email = headers.RequestObject.UserEmail;
    ref.child('passwordResetResponses/'+requestKey).set(response, function(){
      console.log('I just finished writing to firebase');
      completeRequestPasswordReset(headers,success);
    });
  }

  function uploadToFirebase(response)
  {
    console.log('I am about to go to into encrypting regular upload');

    var headers = angular.copy(response.Headers);
    var success = response.Response;
    var requestKey = headers.RequestKey;
    var encryptionKey = response.EncryptionKey;
    console.log(encryptionKey);
    delete response.EncryptionKey;
    if(typeof encryptionKey!=='undefined' && encryptionKey!=='') response = encryptObject(response, encryptionKey);
    response.Timestamp = Firebase.ServerValue.TIMESTAMP;
    console.log(response);
    var userId = headers.RequestObject.UserID;
    ref.child('users/'+userId+'/'+requestKey).set(response, function(){
      console.log('I just finished writing to firebase');
      completeRequest(headers,success);
    });    
  }

   /**
   * @name EncryptObject
   * @description Deletes the request from Firebase and displays it on the screen
   * 
   */
  function completeRequest(headers, success)
  {
    var requestKey = headers.RequestKey;
    var requestObject  = headers.RequestObject;
    requestObject.Parameters=JSON.stringify(requestObject.Parameters);
    requestObject.time=new Date();
    if(success == 'error')
    {
      requestObject.response='Failure';
    }else{
      requestObject.response='Success';
    }
    $timeout(function(){
      if($scope.requests.length>20)
      {
        $scope.requests = [];
      }
      $scope.requests.push(requestObject);
      console.log($scope.requests);
    });
    
      ref.child('requests').child(requestKey).set(null);
  }

  function completeRequestPasswordReset(headers, success)
  {
    var requestKey = headers.RequestKey;
    var requestObject  = headers.RequestObject;
    requestObject.Parameters=JSON.stringify(requestObject.Parameters);
    requestObject.time=new Date();
    if(success == 'error')
    {
      requestObject.response='Failure';
    }else{
      requestObject.response='Success';
    }
    $timeout(function(){
      if($scope.requests.length>20)
      {
        $scope.requests = [];
      }
      $scope.requests.push(requestObject);
      console.log($scope.requests);
    });
      ref.child('passwordResetRequests').child(requestKey).set(null);
  }

  /**
   * @name EncryptObject
   * @description performs the AES encryption recursively given an object and a key for encryption 
   * 
   */
  function encryptObject(object,secret)
  {

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
