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
        vm.loading = true;

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
            NavigatorParameters.setNavigator(homeNavigator);

            // Store the login time
            if(localStorage.getItem('locked')){
                localStorage.removeItem('locked');
            }

            // Refresh the page on coming back from checkin
            homeNavigator.on('prepop', function(event) {
                if (event.currentPage.name == "./views/home/checkin/checkin-list.html") {
                    if(NetworkStatus.isOnline()) {
                        //TODO: Optimize this
                        setCheckin();
                    }
                }
            });

            //This avoids constant repushing which causes bugs
            homeNavigator.on('prepush',function(event){
                if(event.navigator._isPushing) event.cancel();
            });

            $scope.$on('$destroy',function()
            {
                homeNavigator.off('prepop');
                homeNavigator.off('prepush');
            });

            Permissions.enablePermission('WRITE_EXTERNAL_STORAGE', 'PERMISSION_STORAGE_DENIED')
                .catch(function (response) {

                    NewsBanner.showCustomBanner($filter('translate')(response.Message), '#333333', function(){}, 5000);
                });

            // Initialize the page data
            if(NetworkStatus.isOnline()){
                homePageInit();
            }
        }

        function homePageInit()
        {
            //Basic patient information
            vm.PatientId=Patient.getPatientId();
            vm.FirstName = Patient.getFirstName();
            vm.LastName = Patient.getLastName();
            vm.ProfileImage=Patient.getProfileImage();
            vm.language = UserPreferences.getLanguage();
            vm.noUpcomingAppointments=false;

            //Setting up status
            setTreatmentStatus();
            //Setting up next appointment
            setNextAppointment();
            //start by initilizing variables
            // setNotifications();
            vm.notifications = Notifications.setNotificationsLanguage(Notifications.getUnreadNotifications());

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
            if(Appointments.isThereAppointments())
            {
                if(Appointments.isThereNextAppointment()){
                    vm.appointmentShown=Appointments.getUpcomingAppointment();
                }
            }
        }

        function setNotifications()
        {
            // Get all new notifications

            UpdateUI.update(['Notifications'])
                .then(function () {
                    var notifications = Notifications.getNewNotifications();
                    if (notifications.length > 0)
                    {
                        // Get the refresh types from the notification data. These correspond to the API call to the server
                        var toLoad = notifications.reduce(
                            function (accumulator, currentValue) {
                                if (accumulator.includes(currentValue.refreshType)) {
                                    return accumulator
                                } else {
                                    accumulator.push(currentValue.refreshType);
                                    return accumulator
                                }
                            }, []);

                        // Get the data needed from server and set it in Opal
                        UpdateUI.set(toLoad)
                            .then(function () {
                                vm.notifications = Notifications.setNotificationsLanguage(Notifications.getUnreadNotifications());

                                vm.loading = false;

                            })
                            .catch(function (error) {
                                console.error(error);
                                vm.loading = false;
                            })
                    } else {
                        vm.loading = false;
                        vm.notifications = [];
                    }
                })
        }

        function setCheckin()
        {
            //Get checkin appointment for the day, gets the closest appointment to right now
            vm.checkInMessage = '';
            vm.allCheckedIn = true;
            var todaysAppointmentsToCheckIn = Appointments.getCheckinAppointment();
            CheckInService.setCheckInApps(todaysAppointmentsToCheckIn);

            vm.todaysAppointments = todaysAppointmentsToCheckIn;
            if(todaysAppointmentsToCheckIn)
            {
                CheckInService.isAllowedToCheckIn().then(function (response) {
                    var allCheckedIn = true;
                    for (var app in todaysAppointmentsToCheckIn){
                        if (todaysAppointmentsToCheckIn[app].Checkin == '0'){
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
                        CheckInService.checkCheckinServer(todaysAppointmentsToCheckIn[0]).then(function (data) {
                            //If it has, then it simply changes the message to checkedin and queries to get an update
                            if (data) {
                                $timeout(function () {
                                    vm.checkInMessage = "CHECKIN_MESSAGE_AFTER" + setPlural(todaysAppointmentsToCheckIn);
                                    vm.showHomeScreenUpdate = true;
                                });
                            }
                        });
                    } else {
                        //They have been called to the appointment.

                        var calledApp = Appointments.getRecentCalledAppointment();
                        vm.calledApp = calledApp;
                        vm.checkInMessage = calledApp.RoomLocation ? "CHECKIN_CALLED":"CHECKIN_MESSAGE_AFTER" + setPlural(todaysAppointmentsToCheckIn);
                        vm.RoomLocation = calledApp.RoomLocation;
                        vm.showHomeScreenUpdate = true;
                    }
                }).catch(function(error){

                    //NewsBanner.showCustomBanner($filter('translate')(error), '#333333', function(){}, 3000);
                });

            }else{

                //Case where there are no appointments that day
                vm.checkInMessage = "CHECKIN_NONE";
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