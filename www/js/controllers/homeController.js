(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('HomeController', HomeController);

    HomeController.$inject = [
        'Appointments', 'CheckInService', 'Patient',
        'UpdateUI','$scope', '$timeout','$filter', '$location','Notifications','NavigatorParameters','NativeNotification',
        'NewsBanner','DeviceIdentifiers','$anchorScroll', 'PlanningSteps', 'Permissions', 'TimeEstimate',
        'UserPreferences', 'Constants', 'Logger', 'NetworkStatus'
    ];

    /* @ngInject */
    function HomeController(
        Appointments, CheckInService, Patient,
        UpdateUI,$scope, $timeout, $filter, $location, Notifications, NavigatorParameters, NativeNotification,
        NewsBanner, DeviceIdentifiers, $anchorScroll, PlanningSteps, Permissions, TimeEstimate,
        UserPreferences, Constants, Logger, NetworkStatus)
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
        vm.checkedInAppointments = null;
        vm.waitingTimeEstimates = [];

        vm.homeDeviceBackButton = homeDeviceBackButton;
        vm.load = load;
        vm.goToStatus = goToStatus;
        vm.goToNotification = goToNotification;
        vm.goToAppointments = goToAppointments;
        vm.goToCheckinAppointments = goToCheckinAppointments;
        //vm.goToWaitingTimeEstimates = goToWaitingTimeEstimates;

        activate();

        ////////////////
        function activate() {



            // Initialize the navigator for push and pop of pages.
            NavigatorParameters.setParameters({'Navigator':'homeNavigator'});
            NavigatorParameters.setNavigator(homeNavigator);

            // Banner alert for
            NewsBanner.setAlertOffline();

            // Store the login time
            if(localStorage.getItem('locked')){
                localStorage.removeItem('locked');
            }

            // Sending registration id to server for push notifications.
            //DeviceIdentifiers.sendIdentifiersToServer();

            // Refresh the page on coming back from checkin
            homeNavigator.on('prepop', function(event) {
                if (event.currentPage.name == "./views/home/checkin/checkin-list.html") {
                    if(NetworkStatus.isOnline()) {
                        setUpCheckin();
                    }
                }

            });
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
            if(!PlanningSteps.isCompleted() && PlanningSteps.hasCT()) {
                vm.statusDescription = "PLANNING";
            }else if (PlanningSteps.isCompleted()){
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
                                console.log(vm.notifications);
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



            // if(vm.notifications.length>0)
            // {
            //     if(Constants.app)
            //     {
            //         NewsBanner.showNotificationAlert(vm.notifications.length,function(result){
            //             if (result && result.event) {
            //                 console.log("The toast was tapped or got hidden, see the value of result.event");
            //                 console.log("Event: " + result.event); // "touch" when the toast was touched by the user or "hide" when the toast geot hidden
            //                 console.log("Message: " + result.message); // will be equal to the message you passed in
            //                 //console.log("data.foo: " + result.data.foo); // .. retrieve passed in data here
            //
            //                 if (result.event === 'hide') {
            //                     console.log("The toast has been shown");
            //                 }
            //                 if(result.event == 'touch')
            //                 {
            //                     console.log('going to the bottom');
            //                     $location.hash("bottomNotifications");
            //                     $anchorScroll();
            //                 }
            //             }
            //         });
            //     }
            //
            // }
        }

        function setUpCheckin()
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
                    vm.checkedInAppointments = [];
                    for (var app in todaysAppointmentsToCheckIn){
                        if (todaysAppointmentsToCheckIn[app].Checkin == '0'){
                            allCheckedIn = false;
                        }
                        else {
                            vm.checkedInAppointments.push(todaysAppointmentsToCheckIn[app]);
                        }
                    }
                    requestEstimate();

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
                    console.log(error);
                    //NewsBanner.showCustomBanner($filter('translate')(error), '#333333', function(){}, 3000);
                });

            }else{
                console.log("MEssage none");
                //Case where there are no appointments that day
                //vm.checkInMessage = "CHECKIN_NONE";
            }
        }


        function requestEstimate() {
            TimeEstimate.requestTimeEstimate(vm.checkedInAppointments).then(function () {
                var timeEstimate = TimeEstimate.getTimeEstimate();
                for (var j = 0; j < timeEstimate.length; j++) {
                    var prevPatientDur = [];
                    for (var i = 0; i < Object.keys(timeEstimate[j]).length - 4; i++) {
                        if (timeEstimate[j][i]["details"]["status"] == "In Progress") {
                            var tmpSlicedTime = Number(timeEstimate[j][i]["details"]["estimated_duration"]) - ((new Date() - new Date(timeEstimate[j][i]["details"]["actual_start"]))/60000);
                            if (tmpSlicedTime > 0) {
                                prevPatientDur.push(tmpSlicedTime);
                            }
                        }
                        else {
                            prevPatientDur.push(Number(timeEstimate[j][i]["details"]["estimated_duration"]));
                        }
                    }
                    vm.waitingTimeEstimates.push(estimateWait(prevPatientDur));
                }
            },
            function(error){
                console.log(JSON.stringify(error));
            });
        }

        var estimateWait = function(prevPatientDur) {
            var totalMins = 0;
            for (var i = 0; i < prevPatientDur.length; i++) {
                totalMins = totalMins + prevPatientDur[i];
            }
            var hr = Math.floor(totalMins/60) > 1 ? "Hrs " : "Hr ";
            var min = Math.round(totalMins%60) > 1 ? "Mins" : "Min";
            return Math.floor(totalMins/60) + hr + Math.round(totalMins%60) + min;
        }

        // Function used in the home view to refresh
        function load($done) {
            refresh($done);
        }

        //Function used by load
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

        // For Android only, allows pressing the back button
        function homeDeviceBackButton(){
            console.log('device button pressed do nothing');
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
            NavigatorParameters.setParameters({'Navigator':'homeNavigator', 'checkedInAppointments':vm.checkedInAppointments});
            homeNavigator.pushPage('./views/home/checkin/checkin-list.html');
        }

        // function goToWaitingTimeEstimates()
        // {
        //     NavigatorParameters.setParameters({'Navigator':'homeNavigator', 'checkedInAppointments':vm.checkedInAppointments});
        //     console.log(vm.checkedInAppointments)
        //     homeNavigator.pushPage('views/home/waiting-time/waiting-time.html');
        // }

        function setPlural(apps) {
            if (apps.length > 1) {
                return "_PLURAL";
            }
            return "";
        }
        

    }

})();