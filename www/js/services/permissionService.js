/**
 * Created by rob on 03/11/16.
 */

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .factory('Permissions', Permissions);

    Permissions.$inject = ['Constants'];

    /* @ngInject */
    function Permissions(Constants) {
        var service = {
            enablePermission: enablePermission
        };
        return service;

        ////////////////

        //Check for user permissions to write/read from storage, required for android 6+
        function enablePermission(permission_type, msg) {

            if(Constants.app) {
                if (ons.platform.isAndroid()) {
                    var permissions = window.cordova.plugins.permissions;
                    permissions.hasPermission(permissions[permission_type], function (status) {
                        if (!status.hasPermission) {
                            var errorCallback = function () {
                                console.warn(msg);
                            };

                            permissions.requestPermission(permissions[permission_type], function (status) {
                                if (!status.hasPermission) errorCallback();
                            }, errorCallback());
                        }
                    }, null);
                }
            }

        }
    }

})();



