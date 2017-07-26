/*
 *Code by David Herrera May 20, 2015
 *Github: dherre3
 *Email:davidfherrerar@gmail.com
 */
var myApp = angular.module('MUHCApp');

/**
 *@ngdoc controller
 *@name MUHCApp.controller:ScheduleController
 *@scope
 *@requires $scope
 *@requires $rootScope
 *@requires MUHCApp.services.UserPreferences
 *@requires MUHCApp.services.UpdateUI
 *@requires MUHCApp.services.Appointments
 *@description
 *Controller manages the logic in the schedule appointment main view, it as as "child" controllers,
 */



//Logic for the calendar controller view
myApp.controller('CalendarController', ['Appointments', '$scope','$timeout', '$filter', '$location',
    '$anchorScroll','NavigatorParameters', 'UserPreferences', 'Logger',
    function (Appointments, $scope,$timeout,$filter,$location,
              $anchorScroll,NavigatorParameters,UserPreferences, Logger) {
       Appointments.getUserAppointments();
        /*
        *   Controller constants
        **/ 
        var flag;//Boolean value to indicate initialization
        var todaysTimeMilliseconds;//Time in milliseconds
        var choosenTimeMilliseconds;//Selected time in milliseconds
        var today;//Date today
        var dateLast; //Date of last Appointment;
        var dateFirst;//Date of first Appointment;
        var navigatorName;//Navigator Name;
        //Set the calendar options
        $scope.dateOptions = {
            formatYear: 'yyyy',
            startingDay: 0,
            formatDay:'d',
            showWeeks:false
        };
        //Determines color for calendar dates based on appointments
        $scope.showColor = showColor;
        //Obtains color for a given appointment
        $scope.getStyle=getStyle;
        //Determines whether to show header at the end
        $scope.showHeaderEnd = showHeaderEnd;
        //Determines whether or not to show red highlighted date per index
        $scope.showChoosenDateHeader=showChoosenDateHeader;
        //Go to Appointment
        $scope.goToAppointment=goToAppointment;
        //Go to Calendar options
        $scope.goToCalendarOptions = goToCalendarOptions;
       
       
        /*
        *   Implementation
        **/
        //Initializing controller
        init();
        
        function init()
        {
            navigatorName = NavigatorParameters.getParameters().Navigator;
            //Setting height for Appointment sector dynamically. - Could be done with a directive
            var divTreatment=document.getElementById('scrollerAppointments');
            var heightTreatment=document.documentElement.clientHeight-document.documentElement.clientHeight*0.35-180;
            divTreatment.style.height=heightTreatment+'px';
           
            //Obtaining and setting appointments from service
            $scope.appointments=Appointments.getUserAppointments();
            $scope.noAppointments = ($scope.appointments.length === 0);
            $scope.language = UserPreferences.getLanguage();
            $scope.dt = new Date();
            $scope.dt.setHours(0,0,0,0);
            today = new Date($scope.dt);
            flag=false;
            if( $scope.appointments.length>0)
            {
                //Setting time in milliseconds for last appointment
                dateLast=(new Date($scope.appointments[$scope.appointments.length-1].ScheduledStartTime.getTime()));
                dateLast.setHours(0,0,0,0);
                dateLast = dateLast.getTime();
                //Setting time in milliseconds for first appointment
                dateFirst=(new Date($scope.appointments[0].ScheduledStartTime.getTime()));
                dateFirst.setHours(0,0,0,0);
                dateFirst = dateFirst.getTime();
            }
            //Getting time in milliseconds for today's appointment
            todaysTimeMilliseconds =  today.getTime();
            choosenTimeMilliseconds = todaysTimeMilliseconds;
        }
        function goToCalendarOptions()
        {
            window[navigatorName].pushPage('./views/personal/appointments/calendar-options.html');
        }
        //Watcher for the calendar date
        $scope.$watch('dt',function(){
               if(!flag)
               {
                    $timeout(function () {
                        Logger.sendLog('Appointment', 'all');
                        var anchor=findClosestAnchor();
                        $location.hash(anchor);
                        $anchorScroll();
                    }, 1500);
                }else{
                    choosenTimeMilliseconds = $scope.dt.getTime();
                    var anchor=findClosestAnchor();
                    $location.hash(anchor);
                    $anchorScroll();
                }
                flag=true;

        });    

        //Determines color for calendar dates based on appointments
        function showColor(date)
        {
            var result = $scope.appointments.find(function(item){
                return  item.ScheduledStartTime.toDateString() == date.toDateString();
            });
            if(result)
            {
                if(date.getTime()> todaysTimeMilliseconds)
                {
                    return '#cf5c4c';
                }else if(date.getTime() == todaysTimeMilliseconds)
                {
                    return '#3399ff';
                }else{
                    return '#5CE68A';
                }
            }else{
                return 'rgba(255,255,255,0.0)';
            }
        }
        
     
        //Returns string with closest anchor
        function findClosestAnchor()
        {
            if($scope.appointments.length>0)
            {
                if(dateLast<choosenTimeMilliseconds) return 'lastAnchor';
                else if(dateFirst>choosenTimeMilliseconds) return 'firstAnchor';
                else{
                    var ind = findClosestAppointmentToTime(choosenTimeMilliseconds); 
                    return 'anchorAppointments'+ ind;
                }
            }
            return 'firstAnchor';
        }
        //Finds the closest appointment that happens after the choosen appointment, this is use for scrolling
        //Could be done with binary search for an improvement
        function findClosestAppointmentToTime(tmili)
        {
            for(var i =0;i<$scope.appointments.length;i++)
            {
                var date = $scope.appointments[i].ScheduledStartTime.getTime();
                if(date >= tmili)
                {
                    return i;
                }   
            }
            return 0;
             //To be added once is supported by all browsers!
            // var ind = 0;
            // ind = $scope.appointments.findIndex(function(appointment)
            // {
            //     var date = appointment.ScheduledStartTime.getTime();
            //     return date >= tmili;

            // });
            // return ind;
        }

        //Obtains color for a given appointment
        function getStyle(index){
            var dateAppointment=$scope.appointments[index].ScheduledStartTime;
            if(today.getDate()===dateAppointment.getDate()&&today.getMonth()===dateAppointment.getMonth()&&today.getFullYear()===dateAppointment.getFullYear()){
                return '#3399ff';
            }else if(dateAppointment>today){
                return '#cf5c4c';
            }else{
                return '#5CE68A';
            }
        }

        //Determines whether to show header at the end
        function showHeaderEnd()
        {
            if($scope.appointments.length>0&&dateLast<choosenTimeMilliseconds)return true;
            return false;
        }
        //Determines when to show header of appointment vs red highlighted header
        function showChoosenDateHeader(index)
        {
            var date2=new Date($scope.appointments[index].ScheduledStartTime);
            date2.setHours(0,0,0,0);
            date2=date2.getTime();
            $scope.showHeaderNormalDay = true;
            if(choosenTimeMilliseconds==date2)
            {
                $scope.showHeaderNormalDay = false;
            }
            if(index==0)
            {
                if(choosenTimeMilliseconds==date2||choosenTimeMilliseconds<date2)
                {
                    return true
                }else{
                    return false;
                }
            }else
            {
                var date1=new Date($scope.appointments[index-1].ScheduledStartTime.getTime());
                date1.setHours(0,0,0,0);
                date1=date1.getTime();
                if(date1==date2)
                {
                    return false;
                }else{
                    if((date2>choosenTimeMilliseconds&&date1<choosenTimeMilliseconds)||date2==choosenTimeMilliseconds)
                    {
                        return true;
                    }else{
                        return false;
                    }
                }
            }
        }

        //Leaves to appointment
        function goToAppointment(appointment)
        {
            if(appointment.ReadStatus == '0') Appointments.readAppointmentBySerNum(appointment.AppointmentSerNum);
            NavigatorParameters.setParameters({'Navigator':navigatorName, 'Post':appointment});
            window[navigatorName].pushPage('./views/personal/appointments/individual-appointment.html');
        }

}]);

myApp.controller('IndividualAppointmentController', ['NavigatorParameters','NativeNotification','$scope',
    '$timeout', '$rootScope','Appointments', 'CheckInService','$q',
    'NewsBanner','$filter', 'UserPreferences', 'Logger',
    function (NavigatorParameters,NativeNotification,$scope,
              $timeout, $rootScope, Appointments,CheckInService, $q,
              NewsBanner,$filter, UserPreferences, Logger) {
        //Information of current appointment
        var parameters = NavigatorParameters.getParameters();

        var navigatorName = parameters.Navigator;

        $scope.app = parameters.Post;
        $scope.language = UserPreferences.getLanguage();


        Logger.sendLog('Appointment', parameters.Post.AppointmentSerNum);

        $scope.goToMap=function()
        {
            NavigatorParameters.setParameters($scope.app);
            window[navigatorName].pushPage('./views/general/maps/individual-map.html');
        };

        $scope.aboutApp = function () {
            window[navigatorName].pushPage('./views/templates/content.html', {
                contentLink: $scope.app["URL_"+UserPreferences.getLanguage()],
                contentType: $scope.app["AppointmentType_"+UserPreferences.getLanguage()]
            });
        }

    }]);
