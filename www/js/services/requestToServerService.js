var myApp=angular.module('MUHCApp');
/**
*
*
*
**/
myApp.service('RequestToServer',function(UserAuthorizationInfo, EncryptionService, FirebaseService, $http,$q,$cordovaNetwork){
    var identifier='';
    var Ref=new Firebase(FirebaseService.getFirebaseUrl());
    var refRequests = Ref.child('requests');
    var refUsers = Ref.child('users');
     var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
      if(app){
          identifier=device.uuid;
      }else{
          identifier='browser';
      }
    
    function sendRequest(typeOfRequest,parameters)
    {
         //Push the request to firebase
        var pushID =  refRequests.push({ 'Request' : EncryptionService.encryptData(typeOfRequest),'DeviceId':identifier,'Token':UserAuthorizationInfo.getToken(),  'UserID': UserAuthorizationInfo.getUsername(), 'Parameters':EncryptionService.encryptData(parameters),'Timestamp':Firebase.ServerValue.TIMESTAMP});
        return pushID.key();
    }

   
  
    return{
        sendRequestWithResponse:function(typeOfRequest, parameters)
        {
          var r = $q.defer();
          //Sends request and gets random key for request
          var key = sendRequest(typeOfRequest,parameters);
          //Sets the reference to fetch data for that request
          var refRequestResponse = refUsers.child(UserAuthorizationInfo.getUsername()+'/'+key);
          console.log(refRequestResponse.toString());
          //Waits to obtain the request data.
          console.log('users/'+UserAuthorizationInfo.getUsername()+'/'+key);
          refRequestResponse.on('value',function(snapshot){
            if(snapshot.exists())
            {
              var data = snapshot.val();
              var timestamp = data.Timestamp;
              
              data = EncryptionService.decryptData(data);
              data.Timestamp = timestamp;
              console.log(data);
              clearTimeout(timeOut);
              refRequestResponse.set(null);
              refRequestResponse.off();
              if(data.Code =='3')
              {
                r.resolve(data);
              }else if(data.Code == '2'){
                r.reject(data);
              }              
            }
          },function(error)
          {
            console.log(error);
            r.reject(error);
          });
          //If request takes longer than 20000 to come back with timedout request, delete reference 
          var timeOut = setTimeout(function()
          {
            refRequestResponse.off();
            r.resolve({Response:'timeout'});
          },30000);
          return r.promise;
        },
        sendRequest:function(typeOfRequest,content){
          sendRequest(typeOfRequest,content);
        },
        getIdentifier:function()
        {
          return identifier;
        }
    };



});
