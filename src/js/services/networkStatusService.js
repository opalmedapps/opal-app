/*
 * Filename     :   networkStatusService.js
 * Description  :   Service that monitors network activity in order to block http requests when offline + display appropriate message.
 * Created by   :   James Brace
 * Date         :   22 May 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * License      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */

/**
 *@ngdoc service
 *@description Service that holds a property that states whether or not the app is online
 **/

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .factory('NetworkStatus', NetworkStatus);

    function NetworkStatus() {

        var online = true;

        var observerCallbacks = [];

        var NetworkStatus = {
            isOnline: isOnline,
            setStatus: setStatus,
            registerObserverCallback: registerObserverCallback
        };

        return NetworkStatus;

        ////////////////////////

        //register an observer
        function registerObserverCallback (callback){
            observerCallbacks.push(callback);
        }

        function isOnline(){
            return online;
        }

        function setStatus(state){
            online = state;
            notifyObservers();
        }

        //call this when you know 'foo' has been changed
        function notifyObservers(){
            angular.forEach(observerCallbacks, function(callback){
                callback();
            });
        }

    }

})();