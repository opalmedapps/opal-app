var app = angular.module('MUHCApp');
/**
*@ngdoc service
*@name MUHCApp.service:DeviceIdentifiers
*@requires MUHCApp.service:RequestToServer
*@description Service that deals with the device identifiers, sends the identifiers to backend to be used by the push notifications system.
**/
app.service('DeviceIdentifiers', [ 'RequestToServer', function(RequestToServer)
{
    /**
  *@ngdoc property
  *@name  MUHCApp.service.#deviceIdentifiers
  *@propertyOf MUHCApp.service:DeviceIdentifiers
  *@description Object contains three properties registrationId, deviceUUID, and deviceType, the object is sent to the server to update the devices for a particular user.
  **/
  var deviceIdentifiers = {
      registrationId: '',
      deviceUUID:'',
      deviceType:'',
  };
  /**
  *@ngdoc property
  *@name  MUHCApp.service.#haveBeenSent
  *@propertyOf MUHCApp.service:DeviceIdentifiers
  *@description Flag to check whether the device identifiers have been sent
  **/
  var haveBeenSet = false;
  var haveBeenSend = false;
  
  return{
      /**
        *@ngdoc method
        *@name setDeviceIdentifiers
        *@methodOf MUHCApp.service:DeviceIdentifiers
        *@description Sets the deviceIdentifiers property.
        **/
     setDeviceIdentifiers:function(id)
     {
         deviceIdentifiers.registrationId = id;
         deviceIdentifiers.deviceUUID = device.uuid;
         deviceIdentifiers.deviceType = device.platform;
         haveBeenSend = false;
         haveBeenSet = true;
     },
     /**
        *@ngdoc method
        *@name setSendStatus
        *@methodOf MUHCApp.service:DeviceIdentifiers
        *@description Sets the haveBeenSent flag
        **/
     setSendStatus:function()
     {
         haveBeenSend = true; 
     },
      /**
        *@ngdoc method
        *@name setIdentifier
        *@param {String} identifierType Name of one of the three properties for the deviceIdentifiers object.
        *@param {String} value new value for field.
        *@methodOf MUHCApp.service:DeviceIdentifiers
        *@description Sets the identifierType property for the deviceIdentifiers object
        **/
     setIdentifier:function(idetifierType, value)
     {
         deviceIdentifiers[identifierType] = value;
     },
     /**
        *@ngdoc method
        *@name getDeviceIdentifiers
        *@methodOf MUHCApp.service:DeviceIdentifiers
        *@returns {Object} Returns deviceIdentifiers object.
        **/
     getDeviceIdentifiers:function()
     {
         return deviceIdentifiers; 
     },
     /**
        *@ngdoc method
        *@name sendIdentifiersToServer
        *@methodOf MUHCApp.service:DeviceIdentifiers
        *@description If the device identifiers are set and have not been sent, it sends the device identifiers.
        **/
     sendIdentifiersToServer:function()
     {
        if(haveBeenSet&&!haveBeenSend)
        {
            RequestToServer.sendRequest('DeviceIdentifier',deviceIdentifiers);
            haveBeenSend = true;
        }
     }
  };
}]);