(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('HomeController', HomeController);

    HomeController.$inject = [
        'Appointments', 'CheckInService', 'Patient', 'UpdateUI','$scope', '$timeout','$filter', 'Notifications',
        'NavigatorParameters', 'NewsBanner', 'PlanningSteps', 'Permissions', 'UserPreferences', 'NetworkStatus'
    ];

    /* @ngInject */
    function HomeController(Appointments, CheckInService, Patient, UpdateUI, $scope, $timeout, $filter, Notifications,
                            NavigatorParameters, NewsBanner, PlanningSteps, Permissions, UserPreferences, NetworkStatus)
    {
        var vm = this;

        vm.PatientId ='';
        vm.FirstName = '';
        vm.LastName = '';
        vm.ProfileImage = null;
        vm.language = 'EN';
        vm.notifications = [];
        vm.statusDescription = null;
        vm.appointmentShown = null;
        vm.allCheckedIn = false;
        vm.todaysAppointments = [];
        vm.calledApp = null;
        vm.checkInMessage = '';
        vm.RoomLocation = '';
        vm.showHomeScreenUpdate = null;
        vm.loading = true;
        vm.no_appointments = false;

        vm.homeDeviceBackButton = homeDeviceBackButton;
        vm.load = load;
        vm.goToStatus = goToStatus;
        vm.goToNotification = goToNotification;
        vm.goToAppointments = goToAppointments;
        vm.goToSettings = goToSettings;
        vm.goToCheckinAppointments = goToCheckinAppointments;

        activate();

        ////////////////

        function activate() {

            // Initialize the navigator for push and pop of pages.
            NavigatorParameters.setParameters({'Navigator':'homeNavigator'});
            NavigatorParameters.setNavigator(homeNavigator);


            //TODO: WHAT IS THIS USED FOR?!?!?!
            // Store the login time
            if(localStorage.getItem('locked')){
                localStorage.removeItem('locked');
            }

            // // Refresh the page on coming back from checkin
            homeNavigator.on('prepop', function(event) {
                if (event.currentPage.name == "./views/home/checkin/checkin-list.html") {
                    if(NetworkStatus.isOnline()) {
                        setCheckin();
                    }
                }
            });

            //This avoids constant repushing which causes bugs
            homeNavigator.on('prepush', function(event) {
                if (homeNavigator._doorLock.isLocked()) {
                    event.cancel();
                }
            });

            //release the watchers
            $scope.$on('$destroy',function()
            {
                homeNavigator.off('prepop');
                homeNavigator.off('prepush');
            });

            Permissions.enablePermission('WRITE_EXTERNAL_STORAGE', 'PERMISSION_STORAGE_DENIED')
                .catch(function (response) {
                    NewsBanner.showCustomBanner($filter('translate')(response.Message), '#333333', function(){}, 5000);
                });

            // Initialize the page data if online
            if(NetworkStatus.isOnline()){
                homePageInit();
            }else if(Patient.getPatientId()){
                //Basic patient information that may or many not be available... but won't break app if not there and it makes the app look less broken if not internet connection
                setPatientInfo();
            }
        }

        function homePageInit()
        {
            //Initialize modal size based on font size
            initModalSize();

            //Set patient info
            setPatientInfo();

            //Set treatment metadata state
            setTreatmentStatus();

            //display next appointment
            setNextAppointment();

            //display new notifications, if any
            Notifications.requestAllNotifications()
                .then(function(){
                    if(Notifications.getNumberUnreadNotifications() > 0){
                        vm.notifications = Notifications.setNotificationsLanguage(Notifications.getUnreadNotifications());
                    }
                });

            vm.loading =false;

            setCheckin();
        }

        function setTreatmentStatus()
        {
            if(!PlanningSteps.isCompleted() && PlanningSteps.hasCT()) {
                vm.statusDescription = "PLANNING";
            }else if (PlanningSteps.isCompleted()){
                vm.statusDescription = "PLANNING_COMPLETE";
            } else {
                vm.statusDescription = '';
            }
        }

        function setNextAppointment()
        {
            //Next appointment information
            if(Appointments.appointmentsExist()) {
                if(Appointments.nextAppointmentExists()){
                    vm.appointmentShown=Appointments.getUpcomingAppointment();
                }
            }
        }

        function setPatientInfo(){
            //Basic patient information
            vm.PatientId = Patient.getPatientId();
            vm.FirstName = Patient.getFirstName();
            vm.LastName = Patient.getLastName();
            vm.ProfileImage=Patient.getProfileImage();
            vm.language = UserPreferences.getLanguage();
            vm.noUpcomingAppointments=false;
        }

        function setCheckin()
        {

            //skip the following if the check in state has already been set..
            if(!!CheckInService.getCheckInApps() &&  CheckInService.getCheckInApps().length > 0){
                //Case 1: An Appointment has checkin 0, not checked-in

                console.log('here');
                vm.todaysAppointments = CheckInService.getCheckInApps();
                vm.allCheckedIn = CheckInService.areAllCheckedIn();

                console.log(vm.allCheckedIn);

                evaluateCheckIn();
            }
            else{
                //Get checkin appointment for the day, gets the closest appointment to right now
                vm.checkInMessage = 'CHECKING_SERVER';

                //at this point we have all the appointments that are available for checking in to
                var todaysAppointmentsToCheckIn = Appointments.getCheckinAppointment();
                CheckInService.setCheckInApps(todaysAppointmentsToCheckIn);

                vm.todaysAppointments = todaysAppointmentsToCheckIn;
                if(vm.todaysAppointments)
                {
                    CheckInService.isAllowedToCheckIn().then(function (response) {
                        var allCheckedIn = true;
                        for (var app in vm.todaysAppointments){
                            if (vm.todaysAppointments[app].Checkin === '0'){
                                allCheckedIn = false;
                            }
                        }
                        vm.allCheckedIn = allCheckedIn;
                        CheckInService.setAllCheckedIn(allCheckedIn);
                        evaluateCheckIn();
                    }).catch(function(error){

                        //NewsBanner.showCustomBanner($filter('translate')(error), '#333333', function(){}, 3000);
                    });

                }else{
                    //Case where there are no appointments that day
                    vm.todaysAppointments = [];
                    vm.checkInMessage = "CHECKIN_NONE";
                    vm.no_appointments = true;
                }
            }
        }

        function evaluateCheckIn(){
            //Case 1: An Appointment has checkin 0, not checked-in
            if (!vm.allCheckedIn) {

                //Checkin message before appointment gets set and is changed only if appointment was checked into already from Aria
                vm.checkInMessage = "CHECKIN_MESSAGE_BEFORE" + setPlural(vm.todaysAppointments);
                vm.showHomeScreenUpdate = false;

                //Queries the server to find out whether or not an appointment was checked into
                CheckInService.checkCheckinServer(vm.todaysAppointments[0]).then(function (data) {
                    //If it has, then it simply changes the message to checkedin and queries to get an update
                    if (data) {
                        $timeout(function () {
                            vm.checkInMessage = "CHECKIN_MESSAGE_AFTER" + setPlural(todaysAppointmentsToCheckIn);
                            vm.showHomeScreenUpdate = true;
                        });
                    }
                });
            } else {
                //They have been called to the appointment. // TODO: why is this the case?
                var calledApp = Appointments.getRecentCalledAppointment();
                vm.calledApp = calledApp;
                vm.checkInMessage = calledApp.RoomLocation ? "CHECKIN_CALLED":"CHECKIN_MESSAGE_AFTER" + setPlural(vm.todaysAppointments);
                vm.RoomLocation = calledApp.RoomLocation;
                vm.showHomeScreenUpdate = true;
            }
        }

        // Function used in the home view to refresh
        function load($done) {
            refresh($done);
        }

        //Function used by load
        function refresh(done){

            done == undefined ? done = function () {} : done;

            UpdateUI.update('All').then(function()
            {
                //updated=true;
                homePageInit();
                done();
            }).catch(function(error){

                done();
            });
            $timeout(function(){
                done();
            },5000);
        }

        // For Android only, allows pressing the back button
        function homeDeviceBackButton(){

            var mod = 'android';
            var msg = $filter('translate')('EXIT_APP');

            ons.notification.confirm({
                message: msg,
                modifier: mod,
                callback: function(idx) {
                    switch (idx) {
                        case 0:
                            break;
                        case 1:
                            navigator.app.exitApp();
                            break;
                    }
                }
            });
        }

        function goToStatus()
        {
            homeNavigator.pushPage('views/home/status/status_new.html');
        }

        // Function to go push a page to the correct notification.
        function goToNotification(index, notification){
            $timeout(function(){
                vm.notifications.splice(index, 1);
            });
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

        function goToSettings()
        {
            tabbar.setActiveTab(4);
        }

        function goToCheckinAppointments(todaysAppointments) {
            if (vm.allCheckedIn || vm.no_appointments) return;
            NavigatorParameters.setParameters({'Navigator':'homeNavigator'});
            homeNavigator.pushPage('./views/home/checkin/checkin-list.html');
        }

        function setPlural(apps) {
            if (apps.length > 1) {
                return "_PLURAL";
            }
            return "";
        }

        function initModalSize(){
            var fontSize = UserPreferences.getFontSize();
            var rcorners = document.getElementById("rcorners");
            if (fontSize == "xlarge") {
                rcorners.setAttribute("style", "height: 80%");
            }
            else if (fontSize == "large") {
                rcorners.setAttribute("style", "height: 60%");
            }
            else rcorners.setAttribute("style", "height: 50%");
        }

    }
})();