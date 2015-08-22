var myApp=angular.module('MUHCApp');
/**
*
*
*
**/
myApp.service('RequestToServer',function(UserAuthorizationInfo, EncryptionService){
    return{
        sendRequest:function(typeOfRequest,content){
            var Ref=new Firebase('https://luminous-heat-8715.firebaseio.com/requests');
            var userID=UserAuthorizationInfo.UserName;
            var encryptedRequestType=EncryptionService.encryptData(typeOfRequest);

            content= EncryptionService.encryptData(content);
            if(typeOfRequest=='Login')
            {
              Ref.push({ 'Request' : encryptedRequestType, 'UserID': userID })
            }
            else if ( typeOfRequest=='Refresh')
            {
              typeOfRequest=EncryptionService.encryptData(typeOfRequest);
              Ref.push({ 'Request' : encryptedRequestType, 'UserID': userID });
            }else if (typeOfRequest=='Logout')
            {
              typeOfRequest=EncryptionService.encryptData(typeOfRequest);
              Ref.push({ 'Request' : encryptedRequestType, 'UserID': userID });
            }else if (typeOfRequest=='Checkin')
            {
              typeOfRequest=EncryptionService.encryptData(typeOfRequest);
              Ref.push({ 'Request' : encryptedRequestType, 'UserID':userID, 'AppointmentSerNum' : content});
            }else if (typeOfRequest=='AccountChange')
            {
              typeOfRequest=EncryptionService.encryptData(typeOfRequest);
              Ref.push({ 'Request' : encryptedRequestType, 'UserID':userID, 'Content' : content}); // FieldToChange:Password [Name,Email,TelNum,EnableSMS,Language] , NewValue
            }else if (typeOfRequest=='AppointmentChange')
            {
              typeOfRequest=EncryptionService.encryptData(typeOfRequest);
              Ref.push({ 'Request' : encryptedRequestType, 'UserID':userID, 'Content' : content }); // DateRange , AppointmentSerNum, Reason
            }else if (typeOfRequest=='MessageRead')
            {
              typeOfRequest=EncryptionService.encryptData(typeOfRequest);
              Ref.push({ 'Request' : encryptedRequestType, 'UserID':userID, 'MessageSerNum' : content });

            }else if (typeOfRequest=='NotificationRead')
            {
              typeOfRequest=EncryptionService.encryptData(typeOfRequest);
              Ref.push({ 'Request' : encryptedRequestType, 'UserID':userID, 'NotificationSerNum' : content });
            }else if (typeOfRequest=='Message')
            {  
              typeOfRequest=EncryptionService.encryptData(typeOfRequest);
              Ref.push({ 'Request' : encryptedRequestType, 'UserID': userID, 'Content': content});// ALL the things about mesage
            }else if (typeOfRequest=='Feedback')
            { 
              typeOfRequest=EncryptionService.encryptData(typeOfRequest);  
              Ref.push({ 'Request' : encryptedRequestType, 'UserID': userID, 'Content': content});// ALL the things about mesage
            }

        }
    };



});