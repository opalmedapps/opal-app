/*
 * Filename     :   deviceIdentifiersService.js
 * Description  :   Service that manages user device identifiers and registration ids for push notifications
 * Created by   :   Robert Maglieri 
 * Date         :   02 Mar 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */
 
 
 
var app = angular.module('OpalApp');
/**
 *@ngdoc service
 *@description Service that deals with the device identifiers, sends the identifiers to backend to be used by the push notifications system.
 **/
app.service('DeviceIdentifiers', [ 'RequestToServer', '$q','Constants','UserAuthorizationInfo', 'EncryptionService',
    function(RequestToServer,$q, Constants, UserAuthorizationInfo, EncryptionService)
{
    /**
     *@ngdoc property
     *@description Object contains three properties registrationId, deviceUUID, and deviceType, the object is sent to the server to update the devices for a particular user.
     **/
    var deviceIdentifiers = {
        registrationId:'',
        deviceUUID:'',
        deviceType:''
    };

    return{
        /**
         *@ngdoc method
         *@name setDeviceIdentifiers
         *@description Sets the deviceIdentifiers property.
         **/
        setDeviceIdentifiers:function(browserUUID)
        {
            
            deviceIdentifiers.deviceUUID = Constants.app ? device.uuid : browserUUID;
            deviceIdentifiers.deviceType = Constants.app ? device.platform : 'browser';
        },
        getDeviceIdentifiers:function()
        {
            return deviceIdentifiers;
        },
        /**
         *@ngdoc method
         *@name updateRegistrationId
         *@description Sets the deviceIdentifiers property.
         **/
        updateRegistrationId:function(id)
        {
            deviceIdentifiers.registrationId = id;
        },
        /**
         *@ngdoc method
         *@name sendDeviceIdentifiersToServer
         *@description Sends the device identifiers to the listener.
         *@returns {{promise: Promise, cancel: function}} Cancellable Promise.
         */
        sendDeviceIdentifiersToServer: function()
        {
            let data = JSON.parse(JSON.stringify(deviceIdentifiers));
            return RequestToServer.sendRequestWithResponseCancellable('DeviceIdentifier', data);
        },
        /**
         *@ngdoc method
         *@name sendFirstTimeIdentifierToServer
         *@description Sends the device identifiers to the listener, while also requesting a security question.
         *@returns {{promise: Promise, cancel: function}} Cancellable Promise which resolves with security question data.
         **/
        sendFirstTimeIdentifierToServer:function()
        {
            let data = JSON.parse(JSON.stringify(deviceIdentifiers));
            data['Password'] = UserAuthorizationInfo.getPassword();
            return RequestToServer.sendRequestWithResponseCancellable('SecurityQuestion', data, EncryptionService.hash('none'));
        },
        /**
         *@ngdoc method
         *@name sendDevicePasswordRequest
         *@description Makes a request to the server on password reset.
         **/
        sendDevicePasswordRequest:function(email)
        {
            var objectToSend = JSON.parse(JSON.stringify(deviceIdentifiers));
            objectToSend.email = email;
            return RequestToServer.sendRequestWithResponse('SecurityQuestion', objectToSend, EncryptionService.hash('none'), 'passwordResetRequests', 'passwordResetResponses');
        },
        /**
         *@ngdoc method
         *@name destroy
         *@description Wipes all data and local storage
         **/
        destroy: function () {

            deviceIdentifiers ={
                registrationId:'',
                deviceUUID:'',
                deviceType:''
            };

            localStorage.removeItem(UserAuthorizationInfo.getUsername()+"/deviceID");
            localStorage.removeItem(EncryptionService.getStorageKey());
        }
    };
}]);