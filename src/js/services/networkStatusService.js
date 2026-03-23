// SPDX-FileCopyrightText: Copyright (C) 2017 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/*
 * Filename     :   networkStatusService.js
 * Description  :   Service that monitors network activity in order to block http requests when offline + display appropriate message.
 * Created by   :   James Brace
 * Date         :   22 May 2017
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
