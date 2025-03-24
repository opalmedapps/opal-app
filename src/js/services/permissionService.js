/*
 * Filename     :   permissionService.js
 * Description  :   Service that manages permissions on Android.
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   03 Mar 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */

/**
 *@ngdoc service
 *@requires $q
 *@requires Constants
 *@description Service that requests and manages the lab results (blood tests) from the server.
 **/
(function () {
    'use strict';

    angular
        .module('OpalApp')
        .factory('Permissions', Permissions);

    Permissions.$inject = ['$q', 'Constants'];

    /* @ngInject */
    function Permissions($q, Constants) {
        var service = {
            enablePermission: enablePermission
        };
        return service;

        ////////////////

        /**
         *@ngdoc method
         *@name enablePermission
         *@description Checks if the device has the required permissions enabled. If not, it asks the user permission.
         *@param {String} permission_type Android permission that is requested.
         *@returns {Promise} Returns a promise containing permission type, success and message.
         **/
        function enablePermission(permission_type) {

            //Check if enabled required for android 6+
            var deferred = $q.defer();
            if (Constants.app) {
                if (ons.platform.isAndroid()) {
                    var permissions = window.cordova.plugins.permissions;
                    permissions.hasPermission(permissions[permission_type], function (status) {
                        if (!status.hasPermission) {
                            var errorCallback = function () {
                                deferred.reject({Permission: permission_type, Success: false})
                            };

                            permissions.requestPermission(permissions[permission_type], function (status) {
                                if (!status.hasPermission) {

                                    errorCallback();
                                }
                                else deferred.resolve({Permission: permission_type, Success: true})
                            }, errorCallback());
                        }
                    }, null);
                } else {
                    deferred.resolve({Permission: permission_type, Success: true})
                }
            } else{
                deferred.resolve({Permission: permission_type, Success: true, Message: "Not a device; permission not required."});
            }
            return deferred.promise;
        }
    }
})();
