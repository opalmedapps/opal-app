//
// Author David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
var myApp=angular.module('MUHCApp');
/**
 *@ngdoc service
 *@name MUHCApp.service:CheckinService
 *@requires MUHCApp.service:RequestToServer
 *@requires MUHCApp.service:Appointments
 *@requires MUHCApp.service:FirebaseService
 *@requires MUHCApp.service:EncryptionService
 *@requires MUHCApp.service:UserPreferences
 *@requires $filter
 *@requires $q
 *@requires $rootScope
 *@requires $timeout
 *@description Service that deals with the checkin functionality for the app
 **/
myApp.factory('CheckinService',
    ['$q', 'RequestToServer', 'Appointments', '$timeout',
        'FirebaseService','EncryptionService', '$rootScope','UserPreferences', 'Permissions',
        function ($q, RequestToServer, Appointments,$timeout,
                  FirebaseService,EncryptionService,$rootScope,UserPreferences,Permissions) {

            /**
             *@ngdoc property
             *@name  MUHCApp.service.#positionCheckinAppointment
             *@propertyOf MUHCApp.service:CheckinService
             *@description Object contains the last GPS position used when the patient tried to checkin to an appointment
             **/
                //The last updated GPS coordinates are stored
            var positionCheckinAppointment = {};

            var checkinUpdatesInterval = null;

            //Set up the language for this life updates!
            function setLanguageCheckin(value)
            {
                console.log(value);
                var language = UserPreferences.getLanguage();
                $timeout(function(){
                    if(language =='EN')
                    {
                        $rootScope.precedingPatientsLabel =value.preceding.actual.text.EN +'. '+value.preceding.scheduled.text.EN;
                        $rootScope.checkinEstimate = value.estimate_display.range;
                        $rootScope.scheduleAhead = value.schedule_detail.text.EN;
                    }else{
                        $rootScope.precedingPatientsLabel = value.actual.text.EN +','+ value.preceding.text.EN;
                        $rootScope.checkinEstimate = value.estimate_display.range;
                        $rootScope.scheduleAhead = value.schedule_detail.text.FR;
                    }

                    console.log($rootScope);
                });
            }
            //To get the live estimates, send a CheckinUpdate request and listen to its response, send request every two minutes.
            function liveCheckinUpdates(nextAppointment)
            {
                if(checkinUpdatesInterval)
                {
                    clearTimeout(checkinUpdatesInterval);
                }

                RequestToServer.sendRequestWithResponse('CheckinUpdate', {AppointmentSerNum:nextAppointment.AppointmentSerNum}).then(
                    function(response)
                    {
                        var data = response.Data;
                        if(data.details.status == 'Close')
                        {
                            //Close request and do not send messages anymore.
                            Appointments.setCheckinAppointmentAsClosed(nextAppointment.AppointmentSerNum);
                            clearTimeout(checkinUpdatesInterval);
                        }else if(data.details.status == 'Open'){
                            setLanguageCheckin(data);
                        }
                    });
                checkinUpdatesInterval = setTimeout(function(){
                    liveCheckinUpdates(nextAppointment);
                },120000);
            }

            //Helper methods
            //Obtaining the position from the GPS
            function isWithinAllowedRange()
            {
                var r=$q.defer();
                navigator.geolocation.getCurrentPosition(function(position){
                    var distanceMeters = 1000 * getDistanceFromLatLonInKm(position.coords.latitude, position.coords.longitude, 45.474127399999996, -73.6011402);
                    //var distanceMeters=1000*getDistanceFromLatLonInKm(position.coords.latitude, position.coords.longitude,45.5072138,-73.5784825);
                    //var distanceMeters = 100;
                    /*alert('Distance: '+ distanceMeters+
                     'Latitude: '          + position.coords.latitude          + '\n' +
                     'Longitude: '         + position.coords.longitude         + '\n' +
                     'Altitude: '          + position.coords.altitude          + '\n' +
                     'Accuracy: '          + position.coords.accuracy          + '\n' +
                     'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
                     'Heading: '           + position.coords.heading           + '\n' +
                     'Speed: '             + position.coords.speed             + '\n' +
                     'Timestamp: '         + position.timestamp                + '\n');*/
                    console.log(position);
                    if (distanceMeters <= 300) {
                        positionCheckinAppointment = {
                            'Latitude':position.coords.latitude,
                            'Longitude':position.coords.longitude,
                            'Accuracy':position.coords.accuracy
                        };
                        r.resolve('CHECK_IN_PERMITTED');
                    } else {
                        r.reject('NOT_ALLOWED');
                    }

                }, function(error){
                    console.log(error.code);
                    r.reject('LOCATION_ERROR');
                }, {
                    maximumAge: 3000,
                    timeout: 3000,
                    enableHighAccuracy: true
                });
                return r.promise;
            }
            //Helper functions for finding patient location
            function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
                var R = 6371; // Radius of the earth in km
                var dLat = deg2rad(lat2 - lat1); // deg2rad below
                var dLon = deg2rad(lon2 - lon1);
                var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
                var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                var d = R * c; // Distance in km
                return d;
            }
            function deg2rad(deg) {
                return deg * (Math.PI / 180);
            }
            return {
                /**
                 *@ngdoc method
                 *@name isAllowedToCheckin
                 *@methodOf MUHCApp.service:CheckinService
                 *@description Function determines geographically whether user is allow to check-in. Works under the
                 * assumption that all the checks to see if an appointment is today and open have already been done! It also updates the positionCheckinAppointment property of the CheckinService.
                 *@returns {Promise} Returns a promise that resolves to success if the user is allowed to checkin based on whether the user is within a 300m radius of the hospital, or rejects the promise if the patient is not in the vecinity of the hospital or if there is an error while checkin location
                 **/
                isAllowedToCheckin:function()
                {
                    /* var r =$q.defer();

                     isWithinAllowedRange().then(function(response)
                     {
                     r.resolve(response);
                     },function(response){
                     r.reject(response);
                     });*/
                    return isWithinAllowedRange();
                },
                /**
                 *@ngdoc method
                 *@name checkCheckinServer
                 *@methodOf MUHCApp.service:CheckinService
                 *@param {Object} appointment Appointment object
                 *@description Checks by querying the server if user has already checked in, perhaps from another device or simply the kiosk, or desk.
                 *@returns {Promise} Returns a promise that resolves to success if the user has indeed already checked in, or resolves to failure if the patient is not in the vecinity of the hospital
                 **/
                checkCheckinServer:function(appointment)
                {
                    var r = $q.defer();
                    //Request is sent with the AppointmentSerNum
                    RequestToServer.sendRequestWithResponse('CheckCheckin', {AppointmentSerNum:appointment.AppointmentSerNum}).then(
                        function(response)
                        {
                            console.log(response);
                            //Response is either success or failure with the appointmentSerNum again in the data object
                            console.log('CheckCheckin coming back from backend', response);
                            if(response.hasOwnProperty('Data')&&response.Data.hasOwnProperty('CheckedIn')){
                                console.log(typeof response.Data.CheckedIn, response.Data.CheckedIn);

                                if(response.Data.CheckedIn =='true')
                                {
                                    //If success, then set checkin for services, i.e. synchronize app
                                    Appointments.setAppointmentCheckin(appointment.AppointmentSerNum);
                                    //resolve with response
                                    r.resolve(true);
                                }else{
                                    r.resolve(false);
                                }
                            }else{
                                r.resolve(false);
                            }
                        }).catch(function(error)
                    {
                        console.log(error);
                        r.reject(false);
                    });
                    return r.promise;
                },
                /**
                 *@ngdoc method
                 *@name checkinToAppointment
                 *@methodOf MUHCApp.service:CheckinService
                 *@description Function to check a user into an appointment.
                 *@returns {Promise} Returns a promise that resolves to success if the user has indeed checked in, and resolves to failure if the patient is not been able to checkin. It also opens the connection to get time estimates from the backend
                 **/
                checkinToAppointment:function(nextAppointment)
                {

                    var r = $q.defer();
                    //Gets the position from GPS for logging in the backend.
                    var objectToSend = positionCheckinAppointment;
                    //Adds the appointment ser num for the request
                    objectToSend.AppointmentSerNum = nextAppointment.AppointmentSerNum;
                    console.log(objectToSend);
                    //Request to Checkin sent

                    RequestToServer.sendRequestWithResponse('Checkin', objectToSend).then(
                        function(data)
                        {
                            //Listen for callback of this request, if success, successfuly checked in
                            //and ask for live update of time estimates, if not the simply tell patient to
                            //Checkin at the cancer center.
                            console.log('Checkin service, return from checkin request', data);
                            data = data.Response;
                            if(data == 'success')
                            {
                                var nextAppointment=Appointments.getCheckinAppointment();
                                Appointments.setAppointmentCheckin(nextAppointment.AppointmentSerNum);
                                var objectToSend = angular.copy(positionCheckinAppointment);
                                objectToSend.AppointmentSerNum = nextAppointment.AppointmentSerNum;
                                //liveCheckinUpdates(nextAppointment);
                                r.resolve(data);
                            }else{
                                r.reject(data);
                            }
                        }).catch(function(error)
                    {
                        r.reject(error);
                    });
                    return r.promise;
                },
                /**
                 *@ngdoc method
                 *@name getCheckinUpdates
                 *@methodOf MUHCApp.service:CheckinService
                 *@description Gets live waiting estimate from the backend, sends a request every two seconds and updates variables attached to rootScope to propagate this result.
                 **/
                //
                getCheckinUpdates:function(nextappointment)
                {
                    liveCheckinUpdates(nextappointment);
                },

                checkinToAllAppointments: function (appointments){

                    //Create a promise so this can be run asynchronously
                    var defer = $q.defer();

                    var objectToSend = positionCheckinAppointment;
                    objectToSend.AppointmentSerNum = [];

                    for (appointment in appointments){
                        objectToSend.AppointmentSerNum.push(appointments[appointment].AppointmentSerNum);
                    }

                    RequestToServer.sendRequestWithResponse('Checkin', objectToSend)
                        .then( function (response) {
                            console.log('Successfully checked in to all appointments');
                            defer.resolve(response);
                        })
                        .catch(function (error) {
                            console.log(error);
                            defer.reject(error);
                        });

                    return defer.promise;
                },

                // Will return true if all appointments are checked in, false if one is not checked in or null if there are no appointments
                verifyAllCheckIn:function (appointments) {
                    var defer = $q.defer();
                    var promises = [];
                    var allCheckedIn;

                    console.log(appointments);

                    if (!appointments){
                        allCheckedIn = null;
                        console.log(!appointments);
                        defer.resolve(allCheckedIn);
                    } else {

                        for (var i = 0; i != appointments.length; i++) {
                            promises.push(this.checkCheckinServer(appointments[i]));
                        }

                        $q.all(promises).then(function (dataArray) {
                            console.log("Response from checkin check", dataArray);
                            allCheckedIn = true;
                            for (var checkedIn in dataArray) {
                                if (dataArray[checkedIn] === false) {
                                    allCheckedIn = false;
                                    break;
                                }
                            }

                            defer.resolve(allCheckedIn);

                        }).catch(function (error) {
                            console.log("Cannot verify checkin", error);
                            defer.reject("Cannot verify checkin")
                        });
                    }

                    return defer.promise;
                }

            };


        }]);
