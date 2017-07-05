/*
 * Filename     :   timeEstimateService.js
 * Description  :   
 * Created by   :   DoYeon Kim
 * Date         :   30 June 2017
 * Copyright    :   Copyright 2017, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */

var myApp = angular.module('MUHCApp');

myApp.service('TimeEstimate', ['RequestToServer','LocalStorage', '$q',
    function(RequestToServer, LocalStorage, $q){
        var timeEstimateObject = {};

        return {
            getTimeEstimate:function()
            {
                return timeEstimateObject;
            },
            requestTimeEstimate: function (appointmentAriaSer) {
                var deferred = $q.defer();
                RequestToServer.sendRequestWithResponse('TimeEstimate', appointmentAriaSer)
                    .then(
                        function (response) {
                            if (response.Code == '3') {
                                console.log(response);
                                LocalStorage.WriteToLocalStorage('TimeEstimate', timeEstimateObject);
                                deferred.resolve({Success: true, Location: 'Server'});
                            }
                        },
                        function (error) {
                            console.log('There was an error contacting hospital ' + JSON.stringify(error));
                            deferred.reject({Success: false, Location: '', Error: error});
                            console.log("returning");
                        }
                    );

                return deferred.promise;

            }
        };
    }]);
