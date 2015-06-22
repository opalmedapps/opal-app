angular.module('app')
    .controller('CheckInController', ['UserDataMutable', '$scope', '$q', function (UserDataMutable, $scope, $q) {  
//Obtain the date, function to be changed once the back-end is updated
 var dateNextAppointmentToShow = UserDataMutable.getFirebaseField('NextAppointment');
        dateNextAppointmentToShow.then(function (data){
            var jsDate = formatTime(data);
            $scope.date = jsDate;
        }, function (error) {
            console.log(error);
        });

//Check if user is logged in, if he is tell him he is already logged in, else check if he can check in.

    var isUserCheckedIn = UserDataMutable.getFirebaseField('CheckIn');
    isUserCheckedIn.then(function (data) {
        if (data === 'true') {
            alreadyCheckedIn();
        } else {
            checkToCheckIn();
        }
    }, function (error) {
        $scope.errorFirebase = true;
    });



//Function Checks User's day and location to determine whether is ok to check in under two conditions,1. Inside a
// 200m radius from the cancer center and appointment day is the same as the current day.
    function checkToCheckIn() {
        $scope.disableButton = true;
        $scope.sameDay = false;
        $scope.checkInAllowed = false;
        $scope.errorFirebase = false;
        


        //Function for debugging purposes

        /*$scope.$watch('disableButton', function () {
            console.log('buttonChanged');
            console.log($scope.disableButton);

        });*/

        //Function to obtain date and run the check in script if user not already checked in, might have synchro problems
        //commented code below will solve that, but works so far. 
        /*var dateNextAppointment = UserDataMutable.getFirebaseField('NextAppointment');
        dateNextAppointment.then(function (data) {
            console.log(data);
            var jsDate = formatTime(data);
            console.log(jsDate.toString());
            $scope.date = jsDate;*/
            var today = new Date();
            if (today.getDay() === $scope.date.getDay()) {
                $scope.sameDay = true;
                $scope.infoReady=false;
                navigator.geolocation.getCurrentPosition(onSuccess, onError);


            }else{
                $scope.infoReady = true;
            }
        /*}, function (error) {
            console.log(error);
        });*/



    }

    function alreadyCheckedIn() {
        setTimeout(function () {
            $scope.$apply(function () {
                $scope.sameDay = true;
                $scope.firebaseCheckInUpdated = true;
                $scope.infoReady = true;
                $scope.disableButton = true;
            });
        }, 1);


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


        var onSuccess = function (position) {
            var distanceMeters=1000*getDistanceFromLatLonInKm(position.coords.latitude, position.coords.longitude,45.4745561,-73.5999842);
            //var distanceMeters=1000*getDistanceFromLatLonInKm(position.coords.latitude, position.coords.longitude,45.5072138,-73.5784825);
            //var distanceMeters = 100;
            navigator.notification.alert('Distance: '+ distanceMeters+ 
            'Latitude: '          + position.coords.latitude          + '\n' +
          'Longitude: '         + position.coords.longitude         + '\n' +
          'Altitude: '          + position.coords.altitude          + '\n' +
          'Accuracy: '          + position.coords.accuracy          + '\n' +
          'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
          'Heading: '           + position.coords.heading           + '\n' +
          'Speed: '             + position.coords.speed             + '\n' +
          'Timestamp: '         + position.timestamp                + '\n');
            if (distanceMeters <= 200) {
                setTimeout(function () {
                    $scope.$apply(function () {
                        $scope.checkInAllowed = true;
                        $scope.disableButton = false;
                        $scope.infoReady=true;
                        console.log('checkinButton');
                    });
                }, 1);
            }else{
                setTimeout(function () {
                    $scope.$apply(function () {
                        $scope.infoReady=true;
                    });
                }, 1);
            }

        };
        $scope.checkIn = function () {
            console.log('checkingIn');
            UserDataMutable.setFirebaseField('CheckIn', 'true');
            $scope.firebaseCheckInUpdated = true;
            $scope.disableButton = true;


        };
        // onError Callback receives a PositionError object
        //
        function onError(error) {
            alert('code: ' + error.code + '\n' +
                'message: ' + error.message + '\n');
        }


        function formatTime(str) {
            var res = str.split(" ");
            var res2 = (res[0]).split("-");
            //console.log(res2);
            var res3 = (res[1]).split(":");
            var res4 = (res3[2]).split("0");
            //console.log(res4);
            var year1 = res2[0];
            var month1 = res2[1];
            var day1 = res2[2];

            var hours1 = res3[0];
            var minutes1 = res3[1];
            if (res[2] === 'PM') {

                hours1 = parseInt(hours1) + 12;
                if (hours1 === 24) {
                    hours1 -= 12;
                }
                console.log(hours1);
            }
            var d = new Date(parseInt(year1), parseInt(month1) - 1, parseInt(day1), parseInt(hours1), parseInt(minutes1));
            return d;
        }








}]);