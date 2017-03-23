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
 *@description Service that logs user activity
 **/

(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .factory('Logger', Logger);

    Logger.$inject = ['RequestToServer'];

    /* @ngInject */
    function Logger(RequestToServer) {
        var service = {
            sendLog: sendLog
        };
        return service;

        ////////////////

        /**
         *@ngdoc method
         *@name sendLog
         *@methodOf MUHCApp.service:Logger
         *@param {String} activity the user activity type to be logged
         *@param {String} activitySerNum the activity serial number to be logged
         *@description Sends a log of the current user activity to the server.
         **/
        function sendLog(activity, activitySerNum) {
            RequestToServer.sendRequestWithResponse('Log',{
                Activity: activity,
                ActivitySerNum: activitySerNum
            })
                .then(function (response) {
                    console.log(response);
                })
        }
    }

})();

