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
        var timeEstimateObject = null;
        //var appointmentAriaSers = null;

        return {
            getTimeEstimate:function()
            {
                return timeEstimateObject;
            },
            // getAppointmentAriaSers:function()
            // {
            //     return appointmentAriaSers;
            // },
            requestTimeEstimate: function (appointments) {
                var deferred = $q.defer();
                timeEstimateObject = [];
                appointmentAriaSers = [];
                for (var i = 0; i < appointments.length; i++) {
                    RequestToServer.sendRequestWithResponse('TimeEstimate', appointments[i].AppointmentAriaSer)
                        .then(
                            function (response) {
                                if (response.Code == '3') {
                                    timeEstimateObject.push(response);
                                    //appointmentAriaSers = appointments[i].appointmentAriaSer;
                                    deferred.resolve({Success: true, Location: 'Server'});
                                }
                            },
                            function (error) {
                                console.log('There was an error contacting hospital ' + JSON.stringify(error));
                                deferred.reject({Success: false, Location: '', Error: error});
                            }
                        );
                }
                LocalStorage.WriteToLocalStorage('TimeEstimate', timeEstimateObject);

                return deferred.promise;

            }
        };
    }]);
