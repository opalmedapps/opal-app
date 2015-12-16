var myApp=angular.module('MUHCApp');
/**
*
*
*
**/
myApp.service('RequestToServer',function(UserAuthorizationInfo, EncryptionService, $http,$q){
    function getIdentifierWeb()
    {
      var r=$q.defer();
    $http({
        method: 'GET',
        url: 'http://ip-api.com/json/?callback=?'
        }).then(function(data){
          data=data.data;
          data=data.substring(2, data.length-2);
          var uniqueIdentifier=JSON.parse(data);
          var uuid=String(uniqueIdentifier.query);
          uuid=uuid.replace(/\./g, "-");
          console.log(uuid);
          r.resolve(uuid);
        });
      return r.promise;
    }
    var identifier='';
    return{
        sendRequest:function(typeOfRequest,content){
            var Ref=new Firebase('https://brilliant-inferno-7679.firebaseio.com/requests');
            var userID=UserAuthorizationInfo.UserName;
            console.log(identifier);
            var encryptedRequestType=EncryptionService.encryptData(typeOfRequest);
            content= EncryptionService.encryptData(content);
            console.log(content);
            if(typeOfRequest=='Login'||typeOfRequest=='Logout')
            {
              Ref.push({ 'Request' : encryptedRequestType,'DeviceId':identifier,  'UserID': userID })
            }else if(typeOfRequest=='Refresh')
            {
              Ref.push({ 'Request' : encryptedRequestType,'DeviceId':identifier,  'UserID': userID, 'Parameters':content })
            }
            else if (typeOfRequest=="NewNote"||typeOfRequest=="EditNote"||typeOfRequest=="DeleteNote"||typeOfRequest=="AccountChange"||typeOfRequest=="AppointmentChange"||typeOfRequest=="Message"||typeOfRequest=="Feedback")
            {
              Ref.push({'Request': encryptedRequestType,'DeviceId':identifier, 'UserID':userID, 'Parameters':content});
            }
            else if (typeOfRequest=='Checkin')
            {
              Ref.push({ 'Request' : encryptedRequestType, 'DeviceId':identifier,'UserID':userID, 'Parameters':{'AppointmentSerNum' : content}});
            }
            else if (typeOfRequest=='MessageRead')
            {
              Ref.push({ 'Request' : encryptedRequestType, 'DeviceId':identifier,'UserID':userID, 'Parameters':{'MessageSerNum' : content }});
            }
            else if (typeOfRequest=='NotificationRead')
            {
              Ref.push({ 'Request' : encryptedRequestType, 'DeviceId':identifier,'UserID':userID, 'Parameters':{'NotificationSerNum' : content }});
            }

        },
        setIdentifier:function()
        {
          var r=$q.defer();
          var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
          if(app){
            /*
            *Use apps unique identifier
            */

          }else{
            getIdentifierWeb().then(function(uuid){
              console.log(uuid);
              identifier=uuid;
              r.resolve(uuid);
            });
          }
          return r.promise;
        },
        getIdentifier:function()
        {
          return identifier;
        }
    };



});
