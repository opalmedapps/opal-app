var app = angular.module('MUHCApp');

app.service('DeviceIdentifiers', [ 'RequestToServer', function(RequestToServer)
{
  var deviceIdentifiers = {
      registrationId: '',
      deviceUUID:'',
      deviceType:'',
  };
  
  var haveBeenSet = false;
  var haveBeenSend = false;
  
  return{
     setDeviceIdentifiers:function(id)
     {
         deviceIdentifiers.registrationId = id;
         deviceIdentifiers.deviceUUID = device.uuid;
         deviceIdentifiers.deviceType = device.platform;
         haveBeenSend = false;
         haveBeenSet = true;
     },
     setSendStatus:function()
     {
         haveBeenSend = true; 
     },
     setIdentifier:function(idetifierType, value)
     {
         deviceIdentifiers[identifierType] = value;
     },
     getDeviceIdentifiers:function()
     {
         return deviceIdentifiers;
     },
     getRegistrationId:function()
     {
         return registrationId;
     },
     areSet:function()
     {
         return haveBeenSet;
     },
     checkSendStatus:function()
     {
        if(haveBeenSet&&!haveBeenSend)
        {
            RequestToServer.sendRequest('DeviceIdentifier',deviceIdentifiers);
            haveBeenSend = true;
        }
     }
  };
}]);