/**
 * Created by rob on 03/11/16.
 */

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .factory('Permissions', Permissions);

    Permissions.$inject = ['$q'];

    /* @ngInject */
    function Permissions($q) {
        var service = {
            enablePermission: enablePermission
        };
        return service;

        ////////////////

        //Check if enable and , required for android 6+
        function enablePermission(permission_type, msg) {

            var deferred = $q.defer();
            if (ons.platform.isAndroid()) {
                var permissions = window.cordova.plugins.permissions;
                permissions.hasPermission(permissions[permission_type], function (status) {
                    if (!status.hasPermission) {
                        var errorCallback = function () {
                            console.warn(msg);
                            deferred.reject({Permission: permission_type, Success: false, Message: msg})
                        };

                        permissions.requestPermission(permissions[permission_type], function (status) {
                            if (!status.hasPermission) {
                                console.log("called in request permission")
                                errorCallback();
                            }
                            else deferred.resolve({Permission: permission_type, Success: true})
                        }, errorCallback());
                    }
                }, null);
            } else {
                deferred.resolve({Permission: permission_type, Success: true})
            }
            return deferred.promise;

        }
    }

})();



