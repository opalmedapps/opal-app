var myApp=angular.module('MUHCApp');
/**
*
*
*
**/
myApp.service('RequestToServer',function(UserAuthorizationInfo, EncryptionService, $http,$q,$cordovaNetwork){
    function getIdentifierWeb()
    {
      var r=$q.defer();
      /*$http({
        method:'GET',
        url:'https://depdocs.com/opal/getPublicIpAddress.php'}).then(function(data){
          data=data.data;
          data=data.substring(2, data.length-2);
          var uniqueIdentifier=JSON.parse(data);
          var uuid=String(uniqueIdentifier.query);
          uuid=uuid.replace(/\./g, "-");
          console.log(uuid);
          r.resolve(uuid);
        });*/
    /*$http({
        method: 'GET',
        url: 'http://ip-api.com/json/?callback=?'
        }).then(function(data){
          data=data.data;
          data=data.substring(2, data.length-2);
          var uniqueIdentifier=JSON.parse(data);
          var uuid=String(uniqueIdentifier.query);
          uuid=uuid.replace(/\./g, "-");
          console.log(uuid);
          uuid='demo';
          r.resolve(uuid);
        });*/
        r.resolve('demo');
      return r.promise;
    }
    var identifier='';
    return{
        sendRequest:function(typeOfRequest,content){
          var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
          if(app){
              if($cordovaNetwork.isOnline()){

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
                }else if (typeOfRequest=='TestResult')
                {
                  testResultRef.push({ 'Request': typeOfRequest, 'DeviceId':identifier, 'UserID': userId, 'Content': content});

                }
              }else{
                //  navigator.notification.alert('No changes will be reflected at the hospital. Connect to the internet to perform this action, ',function(){},'Internet Connectivity','Ok');
              }
          }else{
            var Ref=new Firebase('https://brilliant-inferno-7679.firebaseio.com/requests');
            var userID=UserAuthorizationInfo.UserName;
            console.log(identifier);
            var encryptedRequestType=EncryptionService.encryptData(typeOfRequest);
            content= EncryptionService.encryptData(content);
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
            }else if (typeOfRequest=='TestResult')
            {
              testResultRef.push({ 'Request': typeOfRequest, 'DeviceId':identifier, 'UserID': userId, 'Content': content});
            }


          }


        },
        setIdentifier:function()
        {
          var r=$q.defer();
          var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
          if(app){
            identifier=device.uuid;
            r.resolve('demo');
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
