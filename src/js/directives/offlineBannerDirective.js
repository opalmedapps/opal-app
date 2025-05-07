// SPDX-FileCopyrightText: Copyright (C) 2017 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/*
 * Filename     :   offlineBannerDirective.js
 * Description  :   This directive interacts directly with the Network Status Service and displays a banner notifying
*                   that the user if offline. And when the user comes online shows the "reconnecting" notification.
 * Created by   :   James Brace
 * Date         :   22 May 2017
 */

angular.module('OpalApp')
    .directive('networkBanner', ['$timeout', 'NetworkStatus', function($timeout, NetworkStatus) {

    return {
        restrict: 'E',
        scope: {},
        template: "<div ng-cloak ng-hide=\" online\" style=\"text-align: center; background-color:black;opacity:0.7;color:white;height:30px;width:100vw\"><ons-icon ng-hide=\"online_temp\" style=\"margin-right: 3px\" icon='ion-alert-circled'></ons-icon><small>{{ message | translate }}</small></div>",
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
                    scope.message = "RECONNECTING";
                    $timeout(function(){
                        scope.goingBackOnline = false;
                        scope.online = true;
                        scope.message = "NO_INTERNET_CONNECTION";
                    }, 3000);
                }
            };

            NetworkStatus.registerObserverCallback(updateStatus);

            scope.message = "NO_INTERNET_CONNECTION";
            scope.online = NetworkStatus.isOnline();

        }
    };

}]);
