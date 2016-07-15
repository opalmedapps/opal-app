var myApp=angular.module('MUHCApp');


myApp.factory('CheckinService', ['$q', 'RequestToServer', 'Appointments', '$timeout','FirebaseService','EncryptionService', '$rootScope','UserPreferences','UpdateUI',function ($q, RequestToServer, Appointments,$timeout,FirebaseService,EncryptionService,$rootScope,UserPreferences,UpdateUI) {

    var positionCheckinAppointment = {};

    //The last updated GPS coordinates are stored
    var checkinUpdatesInterval = null;

    //Set up the language for this life updates!
    function setLanguageCheckin(value)
    {
      var language = UserPreferences.getLanguage();
      $timeout(function(){
          if(language =='EN')
          {
            $rootScope.precedingPatientsLabel = value.preceding.EN;
            $rootScope.checkinEstimate = value.estimate.EN;
            $rootScope.scheduleAhead = value.schedule.EN;
          }else{
            $rootScope.precedingPatientsLabel = value.preceding.FR;
            $rootScope.checkinEstimate = value.estimate.FR;
            $rootScope.scheduleAhead = value.schedule.FR;
          }
      });
    }
    //To get the live estimates, send a CheckinUpdate request and listen to its response, send request every two minutes.
    function liveCheckinUpdates(nextAppointment)
    {
      if(checkinUpdatesInterval)
      {
        clearInterval(checkinUpdatesInterval);
      }
      RequestToServer.sendRequest('CheckinUpdate', {AppointmentSerNum:nextAppointment.AppointmentSerNum});
      checkinUpdatesInterval = setInterval(function(){
          RequestToServer.sendRequest('CheckinUpdate', {AppointmentSerNum:nextAppointment.AppointmentSerNum});
      },120000);
      UpdateUI.update('CheckinUpdate').then(function(data){
       if(data.response.type == 'close')
        {
          //Close request and do not send messages anymore.
          Appointments.setCheckinAppointmentAsClosed(nextAppointment.AppointmentSerNum);
          clearInterval(checkinUpdatesInterval);
        }else if(data.response.type == 'error')
        {
          //setErrorMessage(data);
        }else{
           setLanguageCheckin(data);
        }
      });
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

            if (distanceMeters <= 300) {
              positionCheckinAppointment = {
                'Latitude':position.coords.latitude,
                'Longitude':position.coords.longitude,
                'Accuracy':position.coords.accuracy
              };
              r.resolve('Check-in to your Appointment');
          } else {
              r.reject('Checkin allowed in the vecinity of the Cancer Center');
          }

        }, function(error){
          console.log(error.code);
          r.reject('Could not obtain location');
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
      /*Function determines geographically whether user is allow to check-in. works under the
      * assumption that all the checks to see if an appointment is already done, have been done!
      */
      isAllowedToCheckin:function()
      {
        var r =$q.defer();
        isWithinAllowedRange().then(function(response)
        {
          r.resolve(response);
        },function(response){
          r.reject(response);
        });
        return r.promise;
      },
      //Checks by querying the server if user has already checked in, perhaps from another device or simply the kiosk, or desk.
      checkCheckinServer:function(appointment)
      {
        var r = $q.defer();
        //Request is sent with the AppointmentSerNum
        RequestToServer.sendRequest('CheckCheckin', {AppointmentSerNum:appointment.AppointmentSerNum});
        //Update is expected to read from firebase in order to obtain update
        UpdateUI.update('CheckCheckin').then(function(data)
        {
          //Response is either success or failure with the appointmentSerNum again in the data object
          console.log('CheckCheckin coming back from backend', data);
          if(data.response =='success')
          {
            //If success, then set checkin for services, i.e. synchronize app
            Appointments.setAppointmentCheckin(appointment.AppointmentSerNum);
            //resolve with response
            r.resolve(data.response);
          }else{
            r.resolve(data.response);
          }
        });
        //If it has not come back yet assumed that they have not checked in
        setTimeout(function(){
          r.resolve('failure');
        },20000);
        return r.promise;
      },
      //Function to check a user into an appointment
      checkinToAppointment:function(nextAppointment)
      {

        var r = $q.defer();
        //Gets the position from GPS for logging in the backend.
        var objectToSend = positionCheckinAppointment;
        //Adds the appointment ser num for the request
        objectToSend.AppointmentSerNum = nextAppointment.AppointmentSerNum;
        console.log(objectToSend);
        //Request to Checkin sent
        RequestToServer.sendRequest('Checkin', objectToSend);
        //Listen for callback of this request, if success, successfuly checked in
        //and ask for live update of time estimates, if not the simply tell patient to
        //Checkin at the cancer center.
        UpdateUI.update('Checkin').then(function(data)
        {
          console.log('Checkin service, return from checkin request', data);
          data = data.response;
          if(data == 'success')
          {
            var nextAppointment=Appointments.getCheckinAppointment();
            Appointments.setAppointmentCheckin(nextAppointment.AppointmentSerNum);
            var objectToSend = angular.copy(positionCheckinAppointment);
            objectToSend.AppointmentSerNum = nextAppointment.AppointmentSerNum
            liveCheckinUpdates(nextAppointment);
            r.resolve(data);
          }else{
            r.reject(data);
          }
        });
        return r.promise;
      },
      //Gets live estimate updates
      getCheckinUpdates:function(nextappointment)
      {
        liveCheckinUpdates(nextappointment);
      }
    };


}]);
