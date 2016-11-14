//
// Author: David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
/**
 * @ngdoc controller
 * @name MUHCApp.controller:HomeController
 * @description
 * # HomeController
 * Controller is responsible for the main news and status page for the patients, the notifications will appear here at first, the checkin functionality will be available from here
 *
 * @requires $state
 * @requires $scope
 * @requires $timeout
 * @requires $rootScope
 * @requires $anchorScroll
 * @requires $location
 * @requires MUHCApp.service:Appointments
 *@requires MUHCApp.service:CheckinService
 *@requires MUHCApp.service:UpdateUI
 *@requires MUHCApp.service:UserPreferences
 *@requires MUHCApp.service:Notifications
 *@requires MUHCApp.service:NavigatorParameters
 *@requires MUHCApp.service:NativeNotification
 *@requires MUHCApp.service:NewsBanner
 *@requires MUHCApp.service:DeviceIdentifiers
 * @property {String} PatientId: Patient ID
 * @property {String} FirstName: Patient first name
 * @property {String} LastName: Patient last name
 * @property {String} ProfileImage: Path for image, or base64 representation
 * @property {array} roomDetails:array This holds the room details object. This will be a fresh object coming from service response and will be manipulated as per the view model.
 * @property {boolean} submitted:boolean Holds the submitted boolean flag. Initialized with false. Changes to true when we store the details.
 * @property {number} reservationId:number Gets the reservation id from the route params.
 * @property {date} minDate:date Date filled in the minimum date vatiable
 * @property {boolean} isRoomDetailsVisible:boolean Controls the boolean flag for visibility of room details. Initialized with false.
 * @property {array} roomTypes:array Holds types of rooms from JSON.
 * @property {array} expirymonth:array Months from Jan to Dec
 * @property {array} expiryYear:array Years of a particular range
 * @property {array} cardtype:array Type of cards
 */
var myApp = angular.module('MUHCApp');
myApp.controller('HomeController', ['$state','Appointments', 'CheckinService','$scope','Patient',
    'UpdateUI', '$timeout','$filter','$rootScope', 'tmhDynamicLocale','$translate',
    '$location','Notifications','NavigatorParameters','NativeNotification',
    'NewsBanner','DeviceIdentifiers','$anchorScroll', 'PlanningSteps', 'Permissions',
    function ($state,Appointments,CheckinService, $scope, Patient,UpdateUI,$timeout,
              $filter, $rootScope,tmhDynamicLocale, $translate,$location,
              Notifications,NavigatorParameters,NativeNotification,NewsBanner,DeviceIdentifiers,
              $anchorScroll,PlanningSteps, Permissions) {

        NewsBanner.setAlertOffline();

        console.log('Got home safely');

        // Need to allow external storage write for documents notifications.
        Permissions.enablePermission('WRITE_EXTERNAL_STORAGE', 'Storage access disabled. Unable to write documents.');

        //Check if device identifier has been sent, if not sent, send it to backend.
        var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;

        //If app, check if the device identifiers have been sent
        if(app) DeviceIdentifiers.sendIdentifiersToServer();
        /**
         * @ngdoc method
         * @name $scope.homeDeviceBackButton
         * @methodOf MUHCApp.controller:HomeController
         * @description asdas
         */
        $scope.homeDeviceBackButton=function()
        {
            console.log('device button pressed do nothing');
            NativeNotification.showNotificationConfirm('Are you sure you want to exit Opal?',function(){
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
            UpdateUI.update('All').then(function()
            {
                updated=true;
                homePageInit();
                $done();
            }).catch(function(error){
                console.log(error);
                $done();
            });
            $timeout(function(){
                $done();
            },5000);
        };

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
        /*$scope.goToView=function(param)
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
         };*/
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
            $scope.notifications = Notifications.setNotificationsLanguage($scope.notifications);
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
                if(PlanningSteps.isCompleted())
                {
                    $scope.showAppointmentTab=false;
                }else{
                    $scope.showAppointmentTab=true;
                }
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
            NavigatorParameters.setParameters({'Navigator':'homeNavigator', 'Post':todaysAppointments});
            homeNavigator.pushPage('./views/home/checkin/checkin-list.html');
        };

        function setPlural(apps) {
            if (apps.length > 1) {
                return "_PLURAL";
            }
            return "";
        }

        function setUpCheckin()
        {
            //Get checkin appointment for the day, gets the closest appointment to right now
            var todaysAppointmentsToCheckIn = Appointments.getCheckinAppointment();
            console.log(todaysAppointmentsToCheckIn);
            $scope.todaysAppointments = todaysAppointmentsToCheckIn;
            if(todaysAppointmentsToCheckIn)
            {
                $scope.showCheckin = true;
                //Case 1:Appointment checkin is 0, not checked-in
                if (todaysAppointmentsToCheckIn[0].Checkin == '0') {
                    //Checkin message before appointment gets set and is changed only if appointment was checked into already from Aria
                    $scope.todaysAppointments.checkInMessage = "CHECKIN_MESSAGE_BEFORE" + setPlural(todaysAppointmentsToCheckIn);
                    $rootScope.showHomeScreenUpdate = false;

                    //Queries the server to find out whether or not an appointment was checked into
                    CheckinService.checkCheckinServer(todaysAppointmentsToCheckIn[0]).then(function (data) {
                        //If it has, then it simply changes the message to checkedin and queries to get an update
                        if (data) {
                            console.log('Returning home');
                            $timeout(function () {
                                $scope.todaysAppointments.checkInMessage = "CHECKIN_MESSAGE_AFTER" + setPlural(todaysAppointmentsToCheckIn);
                                $rootScope.showHomeScreenUpdate = true;
                                //CheckinService.getCheckinUpdates(appointment);
                            });
                        }
                    });
                } else {
                    //Case:2 Appointment already checked-in show the message for 'you are checked in...' and query for estimate
                    $scope.todaysAppointments.checkInMessage = "CHECKIN_MESSAGE_AFTER" + setPlural(todaysAppointmentsToCheckIn);
                    $rootScope.showHomeScreenUpdate = true;
                    //CheckinService.getCheckinUpdates(appointment);
                }
                //console.log(todaysAppointmentsToCheckIn[appointment].checkInMessage);
            }else{
                //Case where there are no appointments that day
                $scope.showCheckin = false;
            }
        }
    }]);