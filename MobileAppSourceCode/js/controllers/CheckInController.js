angular.module('MUHCApp')
    .controller('CheckInController', ['$scope', '$q', 'RequestToServer', 'Appointments', '$timeout', function ($scope, $q, RequestToServer, Appointments,$timeout) {
        checkInUser();
        function checkInUser(){
            var temp = new Date();
            $scope.noFutureAppointments=false;
            $scope.today = new Date(temp.getFullYear(), temp.getMonth(), temp.getDate());
            var nextAppointment =Appointments.getNextAppointment().Object;
            console.log(nextAppointment);
            if(nextAppointment.ScheduledStartTime===undefined) $scope.errorFirebase = true;
            $scope.nextAppointmentDate = nextAppointment.ScheduledStartTime;
            if(nextAppointment.ScheduledStartTime<$scope.today){
                $scope.noFutureAppointments=true;
                $scope.lastAppointmentDate=Appointments.getUserAppointments()[(Appointments.getUserAppointments()).length-1].ScheduledStartTime;
            }
            $scope.date=new Date($scope.nextAppointmentDate.getFullYear(),$scope.nextAppointmentDate.getMonth(),$scope.nextAppointmentDate.getDate());

            //Check if user is logged in, if he is tell him he is already logged in, else check if he can check in.
            (nextAppointment.Checkin==1)?$scope.checkIn=true:$scope.checkIn=false;
            if (nextAppointment.Checkin===1 && $scope.today.getTime()=== $scope.date.getTime()) {
                alreadyCheckedIn();
            } else {
                checkToCheckIn();
            }
        };

        $scope.checkInButton = function () {
            RequestToServer.sendRequest('Checkin', Appointments.getNextAppointment().Object.AppointmentSerNum);
            $scope.checkIn==='true';
            $scope.firebaseCheckInUpdated = true;
            $scope.disableButton = true;
        };

        //Function Checks User's day and location to determine whether is ok to check in under two conditions,1. Inside a
        // 200m radius from the cancer center and appointment day is the same as the current day.
        function onSuccess(position) {
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
                $timeout(function(){
                        $scope.checkInAllowed = true;
                        $scope.disableButton = false;
                        $scope.infoReady = true;
                
                    });
            } else {
                $timeout(function(){
                        $scope.infoReady = true;
                    });
            }

        };
        function checkToCheckIn() {
            $scope.disableButton = true;
            $scope.sameDay = false;
            $scope.checkInAllowed = false;
            $scope.errorFirebase = false;
            if ($scope.today.getTime()=== $scope.date.getTime()) {
                $scope.sameDay = true;
                $scope.infoReady = false;
                var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
                if(app){
                    navigator.geolocation.getCurrentPosition(onSuccess, onError);
                }else{
                    onSuccess(-1);
                }
            } else {
                $scope.infoReady = true;
            }
        }

        function alreadyCheckedIn() {
            $timeout(function(){
                    $scope.sameDay = true;
                    $scope.firebaseCheckInUpdated = true;
                    $scope.infoReady = true;
                    $scope.disableButton = true;
                });
        }

       

         // onError Callback receives a PositionError object
        //
        function onError(error) {
            alert('code: ' + error.code + '\n' +
                'message: ' + error.message + '\n');
        }
       
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
}]);