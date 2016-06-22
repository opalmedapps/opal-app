var myApp=angular.module('MUHCApp');
/**
*
*
*
**/
myApp.service('RequestToServer',function(UserAuthorizationInfo, EncryptionService, FirebaseService, $http,$q,$cordovaNetwork){
    var identifier='';
    var Ref=new Firebase(FirebaseService.getFirebaseUrl()+'requests');
     var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
      if(app){
          identifier=device.uuid;
      }else{
          identifier='browser';
      }
    function updateTimestamps(typeOfRequest,content)
    {
      var time=(new Date()).getTime();
      var timestamp = null;
      if(typeOfRequest=='Login'||typeOfRequest=='Resume')
      {
          initTimestamps(time);
      }else if(typeOfRequest=='Refresh')
      {
        if(!lastUpdateTimestamp.hasOwnProperty('All')) initTimestampsFromLocalStorage();
        timestamp=obtainTimestamp(content);
        console.log(lastUpdateTimestamp);
      }
      return timestamp;
    }
    var lastUpdateTimestamp={};
    function sendRequest(typeOfRequest,content)
    {
          //Credentials for request
          var userID=UserAuthorizationInfo.UserName;
          var token=UserAuthorizationInfo.Token;
          var encryptedRequestType=EncryptionService.encryptData(typeOfRequest);
          var timestamp = updateTimestamps(typeOfRequest,content);
          content= EncryptionService.encryptData(content);
          //Push the request to firebase
          var pushID =  Ref.push({ 'Request' : encryptedRequestType,'DeviceId':identifier,'Token':token,  'UserID': userID, 'Parameters':content,'Timestamp':timestamp});
          return pushID.key();
    }
    function initTimestampsFromLocalStorage()
    {
      lastUpdateTimestamp=JSON.parse(window.localStorage.getItem(UserAuthorizationInfo.UserName+'/Timestamps'));
    }
    function initTimestamps(time)
    {

      lastUpdateTimestamp={
        'All':time,
        'Appointments':time,
        'Messages':time,
        'Documents':time,
        'Tasks':time,
        'Doctors':time,
        'LabTests':time,
        'Patient':time,
        'Notifications':time,
        'EducationalMaterial':time
      };
      window.localStorage.setItem(UserAuthorizationInfo.UserName+'/Timestamps',JSON.stringify(lastUpdateTimestamp));
    }
    function obtainTimestamp(content)
    {
      if(typeof content=='undefined')
      {
        return lastUpdateTimestamp.All;
      }else if(angular.isArray(content))
      {
        var min=Infinity;
        for (var i = 0; i < content.length; i++) {
          if(min>lastUpdateTimestamp[content[i]])
          {
            min=lastUpdateTimestamp[content[i]];
          }
        }
        return min;
      }else{
        return lastUpdateTimestamp[content];
      }
    }
    return{
        sendRequestWithResponse:function(typeOfRequest, content,callback)
        {
          //Sends request and gets random key for request
          var key = sendRequest(typeOfRequest,content);
          //Sets the reference to fetch data for that request
          var refPathRequest = Ref.child(UserAuthorizationInfo.UserName+'/'+key);
          //Waits to obtain the request data.
          refPathRequest.on('value',function(snapshot){
            if(snapshot.exists())
            {
              console.log(snapshot.val());
              //If data exists, obtain data, delete firebase fields and clean off the link
              refPathRequest.set(null);
              refPathRequest.off();
              callback(snapshot.val());
            }
          });
          //If request takes longer than 20000 to come back with timedout request, delete reference 
          setTimeout(function()
          {
            refPathRequest.off();
            callback({response:'timedout'});
          },20000);
        },
        sendRequest:function(typeOfRequest,content){
          sendRequest(typeOfRequest,content);
        },
        updateTimestamps:function(content,time)
        {
          if(content=='All')
          {
            initTimestamps(time);
          }else if(angular.isArray(content))
          {
            for (var i = 0; i < content.length; i++) {
              lastUpdateTimestamp[content[i]]=time;
            }
          }else{
            lastUpdateTimestamp[content]=time;
          }
          window.localStorage.setItem(UserAuthorizationInfo.UserName+'/Timestamps',JSON.stringify(lastUpdateTimestamp));
        },
        getIdentifier:function()
        {
          return identifier;
        }
    };



});
