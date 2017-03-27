/*
 * Filename     :   loggerService.js
 * Description  :   Service that sends user activity logs to the server.
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   23 Mar 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */

/**
 *@ngdoc service
 *@name MUHCApp.service:Logger
 *@requires MUHCApp.service:RequestToServer
 *@description Service that logs user activity on the Opal server
 **/

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .factory('Logger', Logger);

    Logger.$inject = ['RequestToServer'];

    /* @ngInject */
    function Logger(RequestToServer) {

        var loggingEnabled = true;

        var service = {
            sendLog: sendLog,
            enableLogging: enableLogging
        };
        return service;

        ////////////////

        /**
         *@ngdoc method
         *@name sendLog
         *@methodOf MUHCApp.service:Logger
         *@param {String} activity the user activity type to be logged
         *@param {String} activityDetails the activity serial number to be logged
         *@description Sends a log of the current user activity to the server.
         **/
        function sendLog(activity, activityDetails) {

            if (loggingEnabled) {

                RequestToServer.sendRequestWithResponse('Log', {
                    Activity: angular.copy(activity),
                    ActivityDetails: angular.copy(activityDetails)
                })
                    .then(function (response) {
                        console.log(response);
                    });
            }
        }

        /**
         *@ngdoc method
         *@name enableLogging
         *@methodOf MUHCApp.service:Logger
         *@param {Boolean} bool Boolean value that sets the logging
         *@description Enables or disables logging of usage
         **/
        function enableLogging(bool){
            loggingEnabled = bool;
        }
    }

})();

