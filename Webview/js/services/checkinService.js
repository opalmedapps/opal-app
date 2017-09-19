var myApp=angular.module('MUHCApp');
myApp.factory('CheckinService', ['$q', 'RequestToServer', 'Appointments', '$timeout', function ($q, RequestToServer, Appointments,$timeout) {
    //haveAppointmentToday();
    //isAllowedToCheckin();
    //checkinUser()
    //alreadyCheckin()


    //Helper methods
    //Obtaining the position from the GPS
    function isWithinAllowedRange()
    {
      var r=$q.defer();
      var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
      if(app){
        r.resolve(navigator.geolocation.getCurrentPosition(onLocationSuccess, onError));
      }else{
        r.resolve(onLocationSuccess(-1));
      }
      return r.promise;
    }
    function onLocationSuccess(position) {
        //var distanceMeters = 1000 * getDistanceFromLatLonInKm(position.coords.latitude, position.coords.longitude, 45.4745561, -73.5999842);
        //var distanceMeters=1000*getDistanceFromLatLonInKm(position.coords.latitude, position.coords.longitude,45.5072138,-73.5784825);
        var distanceMeters = 100;
        /*alert('Distance: '+ distanceMeters+
            'Latitude: '          + position.coords.latitude          + '\n' +
          'Longitude: '         + position.coords.longitude         + '\n' +
          'Altitude: '          + position.coords.altitude          + '\n' +
          'Accuracy: '          + position.coords.accuracy          + '\n' +
          'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
          'Heading: '           + position.coords.heading           + '\n' +
          'Speed: '             + position.coords.speed             + '\n' +
          'Timestamp: '         + position.timestamp                + '\n');*/
        if (distanceMeters <= 200) {
            return true;
        } else {
            return false;
        }

    };
    function onError(error) {
        alert('code: ' + error.code + '\n' +
            'message: ' + 'Unable to get your location, proceed to the checkin kiosks' + '\n');
    };
    //Checks if there are appointments today
    function haveNextAppointmentToday(){
      //Checks if the user has appointments
      if(Appointments.isThereAppointments())
      {
          if(Appointments.isThereNextAppointment())
          {
            var today = new Date();
            var nextAppointment=Appointments.getUpcomingAppointment();
            var nextAppointmentDate=nextAppointment.ScheduledStartTime;
            if(today.getDate()==nextAppointmentDate.getDate()&&today.getFullYear()==nextAppointmentDate.getFullYear()&&today.getMonth()==nextAppointmentDate.getMonth())
            {
              return true;
            }else{
              return false;
            }
          }else{
            return false;
          }
      }else{
        return false;
      }
      var noFutureAppointments=false;

      var nextAppointment=Appointments.getNextAppointment().Object;
    };

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
      haveNextAppointmentToday:function()
      {
        return haveNextAppointmentToday();
      },
      isAlreadyCheckedin:function()
      {
        var nextAppointment=Appointments.getUpcomingAppointment();
          if(nextAppointment.Checkin=='1')
          {
            return true;
          }else{
            return false;
          }
      },
      isAllowedToCheckin:function()
      {
        var r =$q.defer();
        if(haveNextAppointmentToday())
        {
              r.resolve(isWithinAllowedRange());
        }else{
          return false;
        }
        return r.promise;
      },
      checkinToAppointment:function()
      {
        var nextAppointment=Appointments.getUpcomingAppointment();
        Appointments.checkinNextAppointment();
        RequestToServer.sendRequest('Checkin', nextAppointment.AppointmentSerNum);
        return true;
      }




    };


}]);
