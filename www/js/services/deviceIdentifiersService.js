/*
 * Filename     :   deviceIdentifiersService.js
 * Description  :   Service that manages user device identifiers and registration ids for push notifications
 * Created by   :   Robert Maglieri 
 * Date         :   02 Mar 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */
 
 
 
var app = angular.module('MUHCApp');
/**
 *@ngdoc service
 *@name MUHCApp.service:DeviceIdentifiers
 *@requires MUHCApp.service:RequestToServer
 *@description Service that deals with the device identifiers, sends the identifiers to backend to be used by the push notifications system.
 **/
app.service('DeviceIdentifiers', [ 'RequestToServer', '$q','Constants','UserAuthorizationInfo',
    function(RequestToServer,$q, Constants, UserAuthorizationInfo)
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
        setDeviceIdentifiers:function(browserUUID)
        {
            deviceIdentifiers.deviceUUID = Constants.app ? device.uuid : browserUUID;
            deviceIdentifiers.deviceType = Constants.app ? device.platform : 'browser';
            haveBeenSend = false;
            haveBeenSet = true;
        },
        /**
         *@ngdoc method
         *@name setDeviceIdentifiers
         *@methodOf MUHCApp.service:DeviceIdentifiers
         *@description Sets the deviceIdentifiers property.
         **/
        updateRegistrationId:function(id)
        {
            deviceIdentifiers.registrationId = id;
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
        setIdentifier:function(identifierType, value)
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
            var defer = $q.defer();
            if(haveBeenSet&&!haveBeenSend)
            {
                console.log(deviceIdentifiers);
                RequestToServer.sendRequestWithResponse('DeviceIdentifier',deviceIdentifiers);
                haveBeenSend = true;
            }

            defer.resolve();

            return defer.promise;
        },
        /**
         *@ngdoc method
         *@name sendFirstTimeIdentifierToServer
         *@methodOf MUHCApp.service:DeviceIdentifiers
         *@description Sending the data on first login to the server.
         **/
        sendFirstTimeIdentifierToServer:function()
        {
            return RequestToServer.sendRequestWithResponse('SecurityQuestion',deviceIdentifiers, 'none');
        },
        /**
         *@ngdoc method
         *@name sendDevicePasswordRequest
         *@methodOf MUHCApp.service:DeviceIdentifiers
         *@description Makes a request to the server on password reset.
         **/
        sendDevicePasswordRequest:function(email)
        {

            var objectToSend = deviceIdentifiers;
            objectToSend.email = email;

            return RequestToServer.sendRequestWithResponse('SecurityQuestion', objectToSend, 'none', 'passwordResetRequests', 'passwordResetResponses');
        },
        /**
         *@ngdoc method
         *@name destroy
         *@methodOf MUHCApp.service:DeviceIdentifiers
         *@description Wipes all data and local storage
         **/
        destroy: function () {

            for (var key in deviceIdentifiers){
                if (deviceIdentifiers.hasOwnProperty(key)){
                    deviceIdentifiers[key] = '';
                }
            }

            localStorage.removeItem(UserAuthorizationInfo.getUsername()+"/deviceID");
            localStorage.removeItem(UserAuthorizationInfo.getUsername()+"/securityAns");
        }
    };
}]);