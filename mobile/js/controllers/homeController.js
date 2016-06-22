//
//  Created by David Herrera on 2015-05-04.
//  Copyright (c) 2015 David Herrera. All rights reserved.
//
var myApp = angular.module('MUHCApp');
myApp.controller('HomeController', ['$state','Appointments', 'CheckinService','$scope','Patient','UpdateUI', '$timeout','$filter','UserPreferences','UserPlanWorkflow','$rootScope', 'tmhDynamicLocale','$translate','RequestToServer', '$location','Documents','Notifications','NavigatorParameters','NativeNotification',
'NewsBanner','DeviceIdentifiers','$anchorScroll',function ($state,Appointments,CheckinService, $scope, Patient,UpdateUI,$timeout,$filter,UserPreferences,UserPlanWorkflow, $rootScope,tmhDynamicLocale, $translate,RequestToServer,$location,Documents,Notifications,NavigatorParameters,NativeNotification,NewsBanner,DeviceIdentifiers,$anchorScroll) {
      NewsBanner.setAlert();
      //Check if device identifier has been sent, if not sent, send it to backend.
      var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
      if(app) DeviceIdentifiers.checkSendStatus();  
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
          RequestToServer.sendRequest('Refresh','All');
          var updated=false;
          UpdateUI.update('All').then(function()
          {
              updated=true;
              homePageInit();
              $done();
          });
          $timeout(function(){
              $done();
          },5000);
        };

        function homePageInit(){

          //Basic patient information
          $scope.PatientId=Patient.getPatientId();
          $scope.Email=Patient.getEmail();
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
    $scope.goToView=function(param)
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
    };
    $scope.goToStatus = function()
    {
      NavigatorParameters.setParameters({'Navigator':'homeNavigator'});
      homeNavigator.pushPage('views/home/status/status.html');
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
      var post = (notification.hasOwnProperty('Post')) ? notification.Post : Notifications.getPost(notification);
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
    }

    function settingStatus()
    {
      if(!UserPlanWorkflow.isEmpty())
      {
        if(UserPlanWorkflow.isCompleted()){
          $scope.statusDescription = "INTREATMENT";
        }else{
          $scope.statusDescription = "PLANNING";
        }
      }else{
        $scope.statusDescription = "NOPLANNING";
      }
    }
    function setTabViews()
    {
      if(Appointments.isThereNextAppointment())
      {
        if(UserPlanWorkflow.isCompleted())
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

    function setUpCheckin()
    {
      //Get checkin appointment for the day, gets the closest appointment to right now
      var checkInAppointment = Appointments.getCheckinAppointment();
      console.log(checkInAppointment);
      if(checkInAppointment)
      {
        //If there is an appointment shows checkin tab on home page otherwise it does not
        $scope.showCheckin = true;
        $scope.checkInAppointment = checkInAppointment;
        //Case 1:Appointment checkin is 0, not checked-in
        if(checkInAppointment.Checkin == '0')
        {
          //Checkin message before appointment gets set and is changed only if appointment was checked into already from Aria
          $rootScope.checkInMessage = "CHECKIN_MESSAGE_BEFORE";
          $rootScope.showHomeScreenUpdate = false;

          //Queries the server to find out whether or not an appointment was checked into
          CheckinService.checkCheckinServer(checkInAppointment).then(function(data)
          {
            //If it has, then it simply changes the message to checkedin and queries to get an update
            if(data=='success')
            {
              console.log('Returning home');
              $timeout(function()
              {
                $rootScope.checkInMessage = "CHECKIN_MESSAGE_AFTER";
                $rootScope.showHomeScreenUpdate = true;
                CheckinService.getCheckinUpdates(checkInAppointment);
              });
            }
          });
        }else{
          //Case:2 Appointment already checked-in show the message for 'you are checked in...' and query for estimate
          $rootScope.checkInMessage = "CHECKIN_MESSAGE_AFTER";
          $rootScope.showHomeScreenUpdate = true;
          CheckinService.getCheckinUpdates(checkInAppointment);
        }
      }else{
        //Case where there are no appointments that day
        $scope.showCheckin = false;
      }
    }

//Sets all the variables in the view.

}]);


myApp.controller('WelcomeHomeController',function($scope,Patient){
    $scope.FirstName = Patient.getFirstName();
    $scope.LastName = Patient.getLastName();
    $scope.welcomeMessage="We are happy to please you with some quality service";
});
