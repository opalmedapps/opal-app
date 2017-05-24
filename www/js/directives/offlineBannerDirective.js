/*
 * Filename     :   offlineBannerDirective.js
 * Description  :   This directive interacts directly with the Network Status Service and displays a banner notifying
*                   that the user if offline. And when the user comes online shows the "reconnecting" notification.
 * Created by   :   James Brace
 * Date         :   22 May 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * License      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */

angular.module('MUHCApp')
    .directive('networkBanner', function($timeout, NetworkStatus) {

    return {
        restrict: 'E',
        scope: {},
        template: "<div ng-hide=\" online\" style=\"background-color:black;opacity:0.7;color:white;height:30px;width:100vw\"><ons-icon ng-hide=\"online_temp\" style=\"margin-right: 3px\" icon='ion-alert-circled'></ons-icon><small>{{ message }}</small></div>",
        link: function(scope) {
            //observer for the network state
            var updateStatus = function(){

                scope.wasOffline = !scope.online;
                scope.online_temp = NetworkStatus.isOnline();

                if(scope.online_temp === false){
                    scope.online = NetworkStatus.isOnline();
                }

                //this renders the "Reconnecting message" if switching from an offline  `state to an online state.
                scope.goingBackOnline = scope.wasOffline && scope.online_temp;

                if(scope.goingBackOnline){
                    scope.message = "Reconnecting...";
                    $timeout(function(){
                        scope.goingBackOnline = false;
                        scope.online = true;
                        scope.message = "You are currently offline.";
                    }, 3000);
                }
            };

            NetworkStatus.registerObserverCallback(updateStatus);

            scope.message = "You are currently offline.";
            scope.online = NetworkStatus.isOnline();

        }
    };

});