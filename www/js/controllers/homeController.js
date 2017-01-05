(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('HomeController', HomeController);

    HomeController.$inject = [
        'Appointments', 'CheckinService', 'Patient',
        'UpdateUI', '$timeout','$filter', '$location','Notifications','NavigatorParameters','NativeNotification',
        'NewsBanner','DeviceIdentifiers','$anchorScroll', 'PlanningSteps', 'Permissions',
        'UserPreferences', 'Constants'
    ];

    /* @ngInject */
    function HomeController(
        Appointments, CheckinService, Patient,
        UpdateUI, $timeout, $filter, $location, Notifications, NavigatorParameters, NativeNotification,
        NewsBanner, DeviceIdentifiers, $anchorScroll, PlanningSteps, Permissions,
        UserPreferences, Constants)
    {
        var vm = this;
        vm.title = 'HomeController';

        vm.PatientId ='';
        vm.FirstName = '';
        vm.LastName = '';
        vm.ProfileImage = null;
        vm.language = 'EN';
        vm.notifications = null;
        vm.statusDescription = null;
        vm.appointmentShown = null;
        vm.allCheckedIn = true;
        vm.todaysAppointments = null;
        vm.calledApp = null;
        vm.checkInMessage = '';
        vm.RoomLocation = '';
        vm.showHomeScreenUpdate = null;

        vm.homeDeviceBackButton = homeDeviceBackButton;
        vm.load = load;
        vm.goToStatus = goToStatus;
        vm.goToNotification = goToNotification;
        vm.goToAppointments = goToAppointments;
        vm.goToCheckinAppointments = goToCheckinAppointments;

        activate();

        ////////////////

        function activate() {

            // Initialize the navigator for push and pop of pages.
            NavigatorParameters.setParameters({'Navigator':'homeNavigator'});

            // Banner alert for
            NewsBanner.setAlertOffline();

            // Store the login time
            if(localStorage.getItem('locked')){
                localStorage.removeItem('locked');
            }

            // Sending registration id to server for push notifications.
            if(Constants.app) DeviceIdentifiers.sendIdentifiersToServer();

            // Refresh the page on every pop
            homeNavigator.on('prepop', function(event) {
                console.log('prepop');
                refresh();
            });

            Permissions.enablePermission('WRITE_EXTERNAL_STORAGE', 'PERMISSION_STORAGE_DENIED')
                .catch(function (response) {
                    console.log(response);
                    NewsBanner.showCustomBanner($filter('translate')(response.Message), '#333333', function(){}, 5000);
                });

            // Initialize the page data
            homePageInit();
        }

        function homePageInit()
        {
            //Basic patient information
            vm.PatientId=Patient.getPatientId();
            vm.FirstName = Patient.getFirstName();
            vm.LastName = Patient.getLastName();
            vm.ProfileImage=Patient.getProfileImage();
            vm.language = UserPreferences.getLanguage();
            console.log(vm.language);
            vm.noUpcomingAppointments=false;

            //Initialize Planning steps
            PlanningSteps.initializePlanningSequence();

            //Setting up status
            settingStatus();
            //Setting up next appointment
            setUpNextAppointment();
            //start by initilizing variables
            setNotifications();
            //setUpCheckin();
            setUpCheckin();
        }

        function settingStatus()
        {
            console.log('Completed planning? ', PlanningSteps.isCompleted());
            if(!PlanningSteps.isCompleted()) {
                vm.statusDescription = "PLANNING";
            }else if (Appointments.isThereNextTreatment()){
                vm.statusDescription = "PLANNING_COMPLETE";
            } else {
                vm.statusDescription = '';
            }
        }

        function setUpNextAppointment()
        {
            //Next appointment information
            if(Appointments.isThereAppointments())
            {
                if(Appointments.isThereNextAppointment()){
                    var nextAppointment=Appointments.getUpcomingAppointment();
                    vm.appointmentShown=nextAppointment;
                }
            }
        }

        function setNotifications()
        {
            //Obtaining new documents and setting the number and value for last document, obtains unread notifications every time it reads
            vm.notifications = Notifications.getUnreadNotifications();
            console.log(vm.notifications);
            if(vm.notifications.length>0)
            {
                if(Constants.app)
                {
                    NewsBanner.showNotificationAlert(vm.notifications.length,function(result){
                        if (result && result.event) {
                            console.log("The toast was tapped or got hidden, see the value of result.event");
                            console.log("Event: " + result.event); // "touch" when the toast was touched by the user or "hide" when the toast geot hidden
                            console.log("Message: " + result.message); // will be equal to the message you passed in
                            //console.log("data.foo: " + result.data.foo); // .. retrieve passed in data here

                            if (result.event === 'hide') {
                                console.log("The toast has been shown");
                            }
                            if(result.event == 'touch')
                            {
                                console.log('going to the bottom');
                                $location.hash("bottomNotifications");
                                $anchorScroll();
                            }
                        }
                    });
                }

            }
        }

        function setUpCheckin()
        {
            //Get checkin appointment for the day, gets the closest appointment to right now
            var todaysAppointmentsToCheckIn = Appointments.getCheckinAppointment();
            console.log(todaysAppointmentsToCheckIn);
            vm.todaysAppointments = todaysAppointmentsToCheckIn;
            if(todaysAppointmentsToCheckIn)
            {
                CheckinService.isAllowedToCheckin().then(function (response) {
                    var allCheckedIn = true;
                    for (var app in todaysAppointmentsToCheckIn){
                        if (todaysAppointmentsToCheckIn[app].Checkin == '0'){
                            console.log("Hes not checked in Jim");
                            allCheckedIn = false;
                        }
                    }

                    vm.allCheckedIn = allCheckedIn;

                    //Case 1: An Appointment has checkin 0, not checked-in
                    if (!allCheckedIn) {

                        //Checkin message before appointment gets set and is changed only if appointment was checked into already from Aria
                        vm.checkInMessage = "CHECKIN_MESSAGE_BEFORE" + setPlural(todaysAppointmentsToCheckIn);
                        vm.showHomeScreenUpdate = false;

                        //Queries the server to find out whether or not an appointment was checked into
                        CheckinService.checkCheckinServer(todaysAppointmentsToCheckIn[0]).then(function (data) {
                            //If it has, then it simply changes the message to checkedin and queries to get an update
                            if (data) {
                                $timeout(function () {
                                    vm.checkInMessage = "CHECKIN_MESSAGE_AFTER" + setPlural(todaysAppointmentsToCheckIn);
                                    vm.showHomeScreenUpdate = true;
                                });
                            }
                        });
                    } else {
                        //Case:2 Appointment already checked-in show the message for 'you are checked in...' and query for estimate

                        var calledApp = Appointments.getRecentCalledAppointment();
                        vm.calledApp = calledApp;
                        vm.checkInMessage = calledApp.RoomLocation ? "CHECKIN_CALLED":"CHECKIN_MESSAGE_AFTER" + setPlural(todaysAppointmentsToCheckIn);
                        vm.RoomLocation = calledApp.RoomLocation;
                        vm.showHomeScreenUpdate = true;
                    }
                }).catch(function(error){
                    console.log(error);
                    //NewsBanner.showCustomBanner($filter('translate')(error), '#333333', function(){}, 3000);
                });

            }else{
                console.log("MEssage none");
                //Case where there are no appointments that day
                vm.checkInMessage = "CHECKIN_NONE";
            }
        }

        function load($done) {
            refresh($done);
        }

        function refresh(done){
            console.log(done);
            done == undefined ? done = function () {} : done;

            UpdateUI.update('All').then(function()
            {
                //updated=true;
                homePageInit();
                done();
            }).catch(function(error){
                console.log(error);
                done();
            });
            $timeout(function(){
                done();
            },5000);
        }

        function homeDeviceBackButton(){
            console.log('device button pressed do nothing');
            var message = $filter('translate')('EXIT_APP');
            NativeNotification.showNotificationConfirm(message,function(){
                if(ons.platform.isAndroid())
                {
                    navigator.app.exitApp();
                }
            },function(){
                console.log('cancel exit');
            });
            console.log(homeNavigator.getDeviceBackButtonHandler());
        }

        function goToStatus()
        {
            homeNavigator.pushPage('views/home/status/status_new.html');

        }

        function goToNotification(index, notification){
            vm.notifications[index].Number = 0;
            Notifications.readNotification(index, notification);
            var post = (notification.hasOwnProperty('Post')) ? notification.Post : Notifications.getNotificationPost(notification);
            if(notification.hasOwnProperty('PageUrl'))
            {
                NavigatorParameters.setParameters({'Navigator':'homeNavigator', 'Post':post});
                homeNavigator.pushPage(notification.PageUrl);
            }else{
                var result = Notifications.goToPost(notification.NotificationType, post);
                if(result !== -1  )
                {
                    NavigatorParameters.setParameters({'Navigator':'homeNavigator', 'Post':post});
                    homeNavigator.pushPage(result.Url);
                }
            }
        }

        function goToAppointments()
        {
            NavigatorParameters.setParameters({'Navigator':'homeNavigator'});
            homeNavigator.pushPage('./views/personal/appointments/appointments.html');
        }

        function goToCheckinAppointments(todaysAppointments) {
            NavigatorParameters.setParameters({'Navigator':'homeNavigator'});
            homeNavigator.pushPage('./views/home/checkin/checkin-list.html');
        }

        function setPlural(apps) {
            if (apps.length > 1) {
                return "_PLURAL";
            }
            return "";
        }

    }

})();




/*
var myApp = angular.module('MUHCApp');
myApp.controller('HomeController', ['$state','Appointments', 'CheckinService','$scope','Patient',
    'UpdateUI', '$timeout','$filter','$rootScope', 'tmhDynamicLocale','$translate',
    '$location','Notifications','NavigatorParameters','NativeNotification',
    'NewsBanner','DeviceIdentifiers','$anchorScroll', 'PlanningSteps', 'Permissions', 'UserPreferences',
    function ($state,Appointments,CheckinService, $scope, Patient,UpdateUI,$timeout,
              $filter, $rootScope,tmhDynamicLocale, $translate,$location,
              Notifications,NavigatorParameters,NativeNotification,NewsBanner,DeviceIdentifiers,
              $anchorScroll,PlanningSteps, Permissions, UserPreferences) {

        NewsBanner.setAlertOffline();

        if(!localStorage.getItem('login')){
            localStorage.setItem('login', new Date().getUTCMilliseconds());
        }

        $scope.language = UserPreferences.getLanguage();

        console.log('Got home safely');
        NavigatorParameters.setParameters({'Navigator':'homeNavigator'});
        // Need to allow external storage write for documents notifications.
        Permissions.enablePermission('WRITE_EXTERNAL_STORAGE', 'Storage access disabled. Unable to write documents.');
        Permissions.enablePermission('ACCESS_FINE_LOCATION', 'Location access denied wont be able to checkin.');

        //Check if device identifier has been sent, if not sent, send it to backend.
        var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;

        //If app, check if the device identifiers have been sent
        if(app) DeviceIdentifiers.sendIdentifiersToServer();
        /!**
         * @ngdoc method
         * @name $scope.homeDeviceBackButton
         * @methodOf MUHCApp.controller:HomeController
         * @description asdas
         *!/
        $scope.homeDeviceBackButton=function()
        {
            console.log('device button pressed do nothing');
            var message = $filter('translate')('EXIT_APP');
            NativeNotification.showNotificationConfirm(message,function(){
                if(ons.platform.isAndroid())
                {
                    navigator.app.exitApp();
                }
            },function(){
                console.log('cancel exit');
            });
            console.log(homeNavigator.getDeviceBackButtonHandler());
        };

        homePageInit();
        $scope.load = function($done) {
            refresh($done);
        };

        homeNavigator.on('prepop', function(event) {

            console.log('prepop');
            refresh();
        });

        function refresh(done){
            console.log(done);
            done == undefined ? done = function () {} : done;

            UpdateUI.update('All').then(function()
            {
                //updated=true;
                homePageInit();
                done();
            }).catch(function(error){
                console.log(error);
                done();
            });
            $timeout(function(){
                done();
            },5000);
        }


        function homePageInit(){

            //Basic patient information
            $scope.PatientId=Patient.getPatientId();
            $scope.FirstName = Patient.getFirstName();
            $scope.LastName = Patient.getLastName();
            $scope.ProfileImage=Patient.getProfileImage();
            $scope.noUpcomingAppointments=false;
            //Setting up appointments tab
            setTabViews();
            //Setting up status
            settingStatus();
            //Setting up next appointment
            setUpNextAppointment();
            //start by initilizing variables
            setNotifications();
            //setUpCheckin();
            setUpCheckin();
        }
        /!*$scope.goToView=function(param)
         {
         if(Appointments.isThereNextAppointment())
         {
         if(UserPlanWorkflow.isCompleted())
         {
         //Status goes to next appointment details
         homeNavigator.pushPage('views/personal/appointment/individual-appointment.html');
         }else{
         homeNavigator.pushPage('views/personal/treatment-plan/individual-stage.html');
         }
         }else{
         if(UserPlanWorkflow.isCompleted())
         {
         //set active tab to personal, no future appointments, treatment plan completed
         tabbar.setActiveTab(1);
         }else{
         homeNavigator.pushPage('views/personal/treatment-plan/individual-stage.html');

         }
         }
         };*!/
        $scope.goToStatus = function()
        {
            NavigatorParameters.setParameters({'Navigator':'homeNavigator'});
            //console.log(PlanningSteps.isCompleted());
            if(PlanningSteps.isCompleted()) {
                homeNavigator.pushPage('views/personal/appointments/appointments.html')
            } else{
                homeNavigator.pushPage('views/home/status/status_new.html');
            }
        };

        //Set notifications function
        function setNotifications()
        {
            //Obtaining new documents and setting the number and value for last document, obtains unread notifications every time it reads
            $scope.notifications = Notifications.getUnreadNotifications();
            console.log($scope.notifications);
            if($scope.notifications.length>0)
            {
                if(app)
                {
                    NewsBanner.showNotificationAlert($scope.notifications.length,function(result){
                        if (result && result.event) {
                            console.log("The toast was tapped or got hidden, see the value of result.event");
                            console.log("Event: " + result.event); // "touch" when the toast was touched by the user or "hide" when the toast geot hidden
                            console.log("Message: " + result.message); // will be equal to the message you passed in
                            //console.log("data.foo: " + result.data.foo); // .. retrieve passed in data here

                            if (result.event === 'hide') {
                                console.log("The toast has been shown");
                            }
                            if(result.event == 'touch')
                            {
                                console.log('going to the bottom');
                                $location.hash("bottomNotifications");
                                $anchorScroll();
                            }
                        }
                    });
                }

            }
            console.log($scope.notifications);
            //Sets language for the notification
            //$scope.notifications = Notifications.setNotificationsLanguage($scope.notifications);
        }

        //Goes to specific notification
        $scope.goToNotification=function(index, notification){
            $scope.notifications[index].Number = 0;
            console.log(notification.NotificationSerNum);
            Notifications.readNotification(index, notification);
            console.log(notification);
            var post = (notification.hasOwnProperty('Post')) ? notification.Post : Notifications.getNotificationPost(notification);
            if(notification.hasOwnProperty('PageUrl'))
            {
                NavigatorParameters.setParameters({'Navigator':'homeNavigator', 'Post':post});
                homeNavigator.pushPage(notification.PageUrl);
            }else{
                var result = Notifications.goToPost(notification.NotificationType, post);
                console.log(result);
                if(result !== -1  )
                {
                    console.log(notification.Post);
                    NavigatorParameters.setParameters({'Navigator':'homeNavigator', 'Post':post});
                    homeNavigator.pushPage(result.Url);
                }
            }
        }
        $scope.goToNextAppointment=function(appointment)
        {
            NavigatorParameters.setParameters({'Navigator':'homeNavigator', 'Post':appointment});
            homeNavigator.pushPage('./views/personal/appointments/individual-appointment.html');
        };

        $scope.goToAppointments=function()
        {
            NavigatorParameters.setParameters({'Navigator':'homeNavigator'});
            homeNavigator.pushPage('./views/personal/appointments/appointments.html');
        };

        function settingStatus()
        {
            if(!PlanningSteps.isCompleted()) {
                $scope.statusDescription = "PLANNING";
            } else if (Appointments.isThereNextTreatment()){
                $scope.statusDescription = "INTREATMENT";
            } else if (PlanningSteps.isCompleted()){
                $scope.statusDescription = null;
            } else {
                $scope.statusDescription = null;
            }
        }
        function setTabViews()
        {
            if(Appointments.isThereNextAppointment())
            {
                $scope.showAppointmentTab = !PlanningSteps.isCompleted();
            }else{
                $scope.showAppointmentTab=false;
            }
        }
        function setUpNextAppointment()
        {
            //Next appointment information
            if(Appointments.isThereAppointments())
            {
                $scope.noAppointments=false;
                if(Appointments.isThereNextAppointment()){
                    $scope.thereIsNextAppointment = true;
                    var nextAppointment=Appointments.getUpcomingAppointment();
                    $scope.appointmentShown=nextAppointment;
                    $scope.titleAppointmentsHome='Next Appointment';

                }else{
                    $scope.thereIsNextAppointment = false;
                }
            }else{
                $scope.noAppointments=true;
            }
        }

        $scope.goToCheckinAppointments = function (todaysAppointments) {
            NavigatorParameters.setParameters({'Navigator':'homeNavigator'});
            homeNavigator.pushPage('./views/home/checkin/checkin-list.html');
        };

        function setPlural(apps) {
            if (apps.length > 1) {
                return "_PLURAL";
            }
            return "";
        }

        $scope.allCheckedIn = true;

        function setUpCheckin()
        {
            //Get checkin appointment for the day, gets the closest appointment to right now
            var todaysAppointmentsToCheckIn = Appointments.getCheckinAppointment();
            console.log(todaysAppointmentsToCheckIn);
            $scope.todaysAppointments = todaysAppointmentsToCheckIn;
            if(todaysAppointmentsToCheckIn)
            {
                //$scope.showCheckin = true;
                console.log('pass check for apps');
                CheckinService.isAllowedToCheckin().then(function (response) {
                    var allCheckedIn = true;
                    for (var app in todaysAppointmentsToCheckIn){
                        console.log(todaysAppointmentsToCheckIn[app].Checkin);
                        if (todaysAppointmentsToCheckIn[app].Checkin == '0'){
                            console.log("Hes not checked in Jim");
                            allCheckedIn = false;
                        }
                    }

                    $scope.allCheckedIn = allCheckedIn;

                    //Case 1: An Appointment has checkin 0, not checked-in
                    console.log(allCheckedIn);
                    if (!allCheckedIn) {

                        //Checkin message before appointment gets set and is changed only if appointment was checked into already from Aria
                        $rootScope.checkInMessage = "CHECKIN_MESSAGE_BEFORE" + setPlural(todaysAppointmentsToCheckIn);
                        $rootScope.showHomeScreenUpdate = false;

                        //Queries the server to find out whether or not an appointment was checked into
                        CheckinService.checkCheckinServer(todaysAppointmentsToCheckIn[0]).then(function (data) {
                            //If it has, then it simply changes the message to checkedin and queries to get an update
                            if (data) {
                                console.log('Returning home');
                                $timeout(function () {
                                    $rootScope.checkInMessage = "CHECKIN_MESSAGE_AFTER" + setPlural(todaysAppointmentsToCheckIn);
                                    $rootScope.showHomeScreenUpdate = true;
                                    //CheckinService.getCheckinUpdates(appointment);
                                });
                            }
                        });
                    } else {
                        //Case:2 Appointment already checked-in show the message for 'you are checked in...' and query for estimate

                        var calledApp = Appointments.getRecentCalledAppointment();
                        console.log(calledApp);
                        $scope.calledApp = calledApp;
                        $rootScope.checkInMessage = calledApp.RoomLocation ? "CHECKIN_CALLED":"CHECKIN_MESSAGE_AFTER" + setPlural(todaysAppointmentsToCheckIn);
                        $rootScope.RoomLocation = calledApp.RoomLocation;
                        $rootScope.showHomeScreenUpdate = true;
                        //CheckinService.getCheckinUpdates(appointment);
                    }
                    //console.log(todaysAppointmentsToCheckIn[appointment].checkInMessage);
                }).catch(function(error){
                    $rootScope.checkInMessage = "CHECKIN_IN_HOSPITAL_ONLY";
                });

            }else{
                console.log("MEssage none");
                //Case where there are no appointments that day
                $rootScope.checkInMessage = "CHECKIN_NONE";
                //$scope.showCheckin = false;
            }
        }
    }]);*/
