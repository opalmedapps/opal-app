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
        Logger.sendLog('Appointment', 'all');
        var flag;//Boolean value to indicate initialization
        var todaysTimeMilliseconds;//Time in milliseconds
        var today;//Day today
        var dateLast; //Date of last Appointment;
        var dateFirst;//Date of first Appointment;
        var navigatorName;//Navigator Name;

        //Initializing controller
        init();
        
        function init()
        {
            navigatorName = NavigatorParameters.getParameters().Navigator;
            //Setting height for Appointment sector dynamically. - Could be done with a directive
            var divTreatment=document.getElementById('scrollerAppointments');
            var heightTreatment=document.documentElement.clientHeight-document.documentElement.clientHeight*0.35-180;
            divTreatment.style.height=heightTreatment+'px';
           
            //
            $scope.appointments=Appointments.getUserAppointments();
            $scope.noAppointments = ($scope.appointments.length === 0);
            $scope.language = UserPreferences.getLanguage();
            $scope.dt = new Date();
            $scope.dt.setHours(0,0,0,0);
            today = new Date($scope.dt);
            flag=false;
            //Getting time in milliseconds for today's appointment
            todaysTimeMilliseconds =  today.getTime();
            choosenTimeMilliseconds = todaysTimeMilliseconds;
            //Setting time in milliseconds for last appointment
            dateLast=(new Date($scope.appointments[$scope.appointments.length-1].ScheduledStartTime.getTime()));
            dateLast.setHours(0,0,0,0);
            dateLast = dateLast.getTime();
            //Setting time in milliseconds for first appointment
            dateFirst=(new Date($scope.appointments[0].ScheduledStartTime.getTime()));
            dateFirst.setHours(0,0,0,0);
            dateFirst = dateFirst.getTime();
        }
        $scope.goToCalendarOptions = function()
        {
            window[navigatorName].pushPage('./views/personal/appointments/calendar-options.html');
        };
        //Watcher for the calendar date
        $scope.$watch('dt',function(){
               if(!flag)
               {
                    $timeout(function () {
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
        $scope.showColor = function(date)
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
        };
        
     
        //Returns string with closest anchor
        function findClosestAnchor()
        {
            
            if($scope.appointments.length>0)
            {
                if(dateLast<choosenTimeMilliseconds) return 'lastAnchor';
                else if(dateFirst>choosenTimeMilliseconds) return 'firstAnchor';
                else{
                    var ind = findClosestAppointmentToTime(choosenTimeMilliseconds);                    
                    if(ind<2) return 'firstAnchor';
                    return 'anchorAppointments'+ (ind-1);
                }
            }
            return 'firstAnchor';
        }
        //Finds the closest appointment that happens after the choosen appointment, this is use for scrolling
        //Could be done with binary search for an improvement
        function findClosestAppointmentToTime(tmili)
        {
            //To be added once is supported by all browsers!
            // $scope.appointments.findIndex(function(appointment)
            // {
            //     var date = appointment.ScheduledStartTime.getTime();
            //     return date >= tmili;

            // });
            // return 0;
            for(var i =0;i<$scope.appointments.length;i++)
            {
                var date = $scope.appointments[i].ScheduledStartTime.getTime();
                if(date > tmili)
                {
                    return i;
                }   
            }
            return 0;
        }

        //Obtains color for a given appointment
        $scope.getStyle=function(index){
            var dateAppointment=$scope.appointments[index].ScheduledStartTime;
            if(today.getDate()===dateAppointment.getDate()&&today.getMonth()===dateAppointment.getMonth()&&today.getFullYear()===dateAppointment.getFullYear()){
                return '#3399ff';
            }else if(dateAppointment>today){
                return '#cf5c4c';
            }else{
                return '#5CE68A';
            }
        };

        //Determines whether to show header at the end
        $scope.showHeaderEnd=function()
        {
            if($scope.appointments.length>0&&dateLast<choosenTimeMilliseconds)return true;
            return false;
        };
        //Determines whether or not to show red highlighted date per index
        $scope.showChoosenDateHeader=function(index)
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
        };
        //Set the calendar options
        $scope.dateOptions = {
            formatYear: 'yyyy',
            startingDay: 0,
            formatDay:'d',
            showWeeks:false
        };

        //Go to Appointment
        $scope.goToAppointment=function(appointment)
        {
            if(appointment.ReadStatus == '0') Appointments.readAppointmentBySerNum(appointment.AppointmentSerNum);
            NavigatorParameters.setParameters({'Navigator':navigatorName, 'Post':appointment});
            window[navigatorName].pushPage('./views/personal/appointments/individual-appointment.html');
        };
        /**
         *@ngdoc method
         *@name addEventsToCalendar
         *@method MUHCApp.controller:ScheduleController
         *@description  If its a device checks to see if the user authorized access to calendar device feature, if the user has not
         defined it (first time), it prompts the user, otherwise it checks through the {@link Appointments.}whether it
         they have been added.
         **/


        // function addEventsToNativeCalendar(){
        //     //Check for device or website
        //     var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
        //     if(app){
        //         var nativeCalendarOption=window.localStorage.getItem('NativeCalendar')
        //         if(!nativeCalendarOption){
        //             var message='Would you like these appointments to be saved as events in your device calendar?';
        //             navigator.notification.confirm(message, confirmCallback, 'Access Calendar', ["Don't allow",'Ok'] );
        //         }else if( Number(nativeCalendarOption)===1){
        //             console.log('option was one!')
        //             Appointments.checkAndAddAppointmentsToCalendar().then(function(eventSuccession)
        //             {
        //                 console.log(eventSuccession);
        //             });
        //         }else{
        //             console.log('Opted out of appointments in native calendar');
        //         }
        //     }else{
        //         console.log('website');
        //     }
        // }
        // function confirmCallback(index){
        //     if(index==1){
        //         console.log(index);
        //         window.localStorage.setItem('NativeCalendar', 0);
        //         console.log('Not Allowed!');
        //     }else if(index==2){
        //         console.log(index);
        //         window.localStorage.setItem('NativeCalendar', 1);
        //         console.log('Allowed!');
        //         Appointments.checkAndAddAppointmentsToCalendar().then(function(eventSuccession)
        //         {
        //             console.log(eventSuccession);
        //         });
        //     }
        // }

        //Go to appointment

}]);

myApp.controller('ScheduleController', ['$rootScope', 'UserPreferences', 'Appointments','$cordovaCalendar','$scope',
    function ($rootScope, UserPreferences, Appointments,$cordovaCalendar,$scope) {

        $scope.closeAlert = function () {
            $rootScope.showAlert = false;
        };
        //addEventsToNativeCalendar();

        /**
         *@ngdoc method
         *@name addEventsToCalendar
         *@methodOf MUHCApp.controller:ScheduleController
         *@description  If its a device checks to see if the user authorized access to calendar device feature, if the user has not
         defined it (first time), it prompts the user, otherwise it checks through the {@link Appointments.}whether it
         they have been added.
         **/


        function addEventsToNativeCalendar(){
            //Check for device or website
            var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
            if(app){
                var nativeCalendarOption=window.localStorage.getItem('NativeCalendar')
                if(!nativeCalendarOption){
                    var message='Would you like these appointments to be saved as events in your device calendar?';
                    navigator.notification.confirm(message, confirmCallback, 'Access Calendar', ["Don't allow",'Ok'] );
                }else if( Number(nativeCalendarOption)===1){
                    console.log('option was one!')
                    Appointments.checkAndAddAppointmentsToCalendar().then(function(eventSuccession)
                    {
                        console.log(eventSuccession);
                    });
                }else{
                    console.log('Opted out of appointments in native calendar');
                }
            }else{
                console.log('website');
            }
        }
        function confirmCallback(index){
            if(index==1){
                console.log(index);
                window.localStorage.setItem('NativeCalendar', 0);
                console.log('Not Allowed!');
            }else if(index==2){
                console.log(index);
                window.localStorage.setItem('NativeCalendar', 1);
                console.log('Allowed!');
                Appointments.checkAndAddAppointmentsToCalendar().then(function(eventSuccession)
                {
                    console.log(eventSuccession);
                });
            }
        }

    }]);

/*myApp.controller('AppointmentListController', ['$scope','$timeout','Appointments','$location','$anchorScroll',

    function ($scope,$timeout, Appointments,$location,$anchorScroll) {
        //Initializing choice
        if(Appointments.getTodaysAppointments().length!==0){
            $scope.radioModel = 'Today';
        }else {
            $scope.radioModel = 'All';
        }


        //Today's date
        $scope.today=new Date();

        //Sets up appointments to display based on the user option selected
        $scope.$watch('radioModel',function(){
            $timeout(function(){
                selectAppointmentsToDisplay();
            });

        });

        //Function to select whether the today, past, or upming buttons are selected
        function selectAppointmentsToDisplay(){
            var selectionRadio=$scope.radioModel;
            if(selectionRadio==='Today'){
                $scope.appointments=Appointments.getTodaysAppointments();

            }else if(selectionRadio==='Upcoming'){
                $scope.appointments=Appointments.getFutureAppointments();
            }else if(selectionRadio==='Past'){
                $scope.appointments=Appointments.getPastAppointments();
            }else{
                $scope.appointments=Appointments.getUserAppointments();
            }
            if($scope.appointments.length==0){
                $scope.noAppointments=true;
            }
        }

        //Function to select the color of the appointment depending on whether the date has passed or not
        $scope.getStyle=function(index){
            var today=$scope.today;
            var dateAppointment=$scope.appointments[index].ScheduledStartTime;

            if(today.getDate()===dateAppointment.getDate()&&today.getMonth()===dateAppointment.getMonth()&&today.getFullYear()===dateAppointment.getFullYear()){
                return '#3399ff';

            }else if(dateAppointment>today){
                return '#D3D3D3';


            }else{
                return '#5CE68A';
            }
        };

        //Set header
        $scope.scrollTo=function()
        {
            if($scope.pickAnchor&&typeof $scope.pickAnchor!=='undefined')
            {
                var anchor='anchorAppointments'+$scope.pickAnchor;
                console.log(anchor);
                $location.hash(anchor);
                $anchorScroll();
            }
        }
        $scope.showColor = function(date)
        {

            if(100*Math.random()>85)
            {
                return 'red';
            }else{
                return 'rgba(0,0,0,0.0)';
            }
        }
        $scope.setHeader=function(index)
        {
            if(index>0)
            {
                var date1=new Date($scope.appointments[index-1].ScheduledStartTime.getTime());
                date1.setHours(0,0,0,0);
                date1=date1.getTime();
                var date2=new Date($scope.appointments[index].ScheduledStartTime.getTime());
                date2.setHours(0,0,0,0);
                date2=date2.getTime();
                if(date1==date2)
                {
                    return false;
                }else{
                    return true;
                }
            }else{
                return true;
            }
        };
    }]);*/

myApp.controller('IndividualAppointmentController', ['NavigatorParameters','NativeNotification','$scope',
    '$timeout', '$rootScope','Appointments', 'CheckInService','$q',
    'NewsBanner','$filter', 'UserPreferences', 'Logger',
    function (NavigatorParameters,NativeNotification,$scope,
              $timeout, $rootScope, Appointments,CheckInService, $q,
              NewsBanner,$filter, UserPreferences, Logger) {
        //Information of current appointment
        var parameters = NavigatorParameters.getParameters();
        console.log(parameters);
        var navigatorName = parameters.Navigator;

        $scope.app = parameters.Post;
        $scope.language = UserPreferences.getLanguage();
        console.log($scope.app);

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
