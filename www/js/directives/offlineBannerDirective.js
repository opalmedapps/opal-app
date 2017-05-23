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

angular.module('MUHCApp').directive('networkBanner', ['NetworkStatus', function() {
    return function($timeout, $scope, NetworkStatus) {

        $scope.message = "You are currently offline. Please check your internet connection.";

        $scope.goingBackOnline = false;
        $scope.wasOffline = false;
        $scope.online = true;

        //observer for the network state
        var isOnline = function(){
            $scope.wasOffline = !$scope.online;
            $scope.online = NetworkStatus.isOnline;

            //this renders the "Reconnecting message" if switching from an offline state to an online state.
            $scope.goingBackOnline = $scope.wasOffline && $scope.online;

            if($scope.goingBackOnline){
                $scope.message = "Reconnecting...";
                $timeout(function(){$scope.goingBackOnline = false}, 3000);
            }
        };

        NetworkStatus.registerObserverCallback(isOnline);

        return {
            template: "<div ng-show='!$scope.online || $scope.goingBackOnline' style='background-color:black;opacity:0.8;color:white;height:30px;width:100vw'> {{ $scope.message }} </div>"
        };
    };
}]);