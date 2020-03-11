(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('HomeController', HomeController);

    HomeController.$inject = [
        'Appointments', 'CheckInService', 'Patient', 'UpdateUI','$scope', '$timeout','$filter', 'Notifications',
        'NavigatorParameters', 'NewsBanner', 'PlanningSteps', 'Permissions', 'UserPreferences', 'NetworkStatus',
        'MetaData', 'HospitalModulePermission'];

    /* @ngInject */
    function HomeController(Appointments, CheckInService, Patient, UpdateUI, $scope, $timeout, $filter, Notifications,
                            NavigatorParameters, NewsBanner, PlanningSteps, Permissions, UserPreferences, NetworkStatus,
                            MetaData, HospitalModulePermission)
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
        vm.todaysAppointments = [];
        vm.calledApp = null;
        //vm.checkInMessage = '';
        vm.RoomLocation = '';
        vm.showHomeScreenUpdate = null;
        vm.loading = true;

        vm.checkinState = {
            noAppointments: true,
            allCheckedIn: false,
            message: 'DETECTING_LOCATION',
            canNavigate: false,
            checkinError: false,
            inRange: true
        };

        // control the modules to display to users
        vm.allowedModules = {};

        vm.homeDeviceBackButton = homeDeviceBackButton;
        vm.goToStatus = goToStatus;
        vm.goToNotification = goToNotification;
        vm.goToAppointments = goToAppointments;
        vm.goToSettings = goToSettings;
        vm.goToCheckinAppointments = goToCheckinAppointments;
        vm.gotoLearnAboutOpal = gotoLearnAboutOpal;

        activate();

        //////////////////////////////////////////////////

        /*
         * PRIVATE METHODS
         * =================================
         */

        function activate() {

            // Initialize the navigator for push and pop of pages.
            NavigatorParameters.setParameters({'Navigator':'homeNavigator'});
            NavigatorParameters.setNavigator(homeNavigator);

            // Store the login time
            if(localStorage.getItem('locked')){
                localStorage.removeItem('locked');
            }

            // // Refresh the page on coming back from checkin
            homeNavigator.on('prepop', function(event) {
                if (event.currentPage.name === "./views/home/checkin/checkin-list.html" && NetworkStatus.isOnline()) evaluateCheckIn();
            });

            //This avoids constant repushing which causes bugs
            homeNavigator.on('prepush', function(event) {
                if (homeNavigator._doorLock.isLocked()) event.cancel();
            });

            //release the watchers
            $scope.$on('$destroy',function() {
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

            // set the hospital banner and available modules
            configureSelectedHospital();
        }

        /**
         * Initializes the home page view by calling a bunch of helper functiosn
         */
        function homePageInit() {
            //Initialize modal size based on font size
            initModalSize();

            //Set patient info
            setPatientInfo();

            //Set treatment metadata state
            setTreatmentStatus();

            //display next appointment
            setNextAppointment();

            // display new notifications, if any
            checkForNewNotifications();

            // Display current check in status
            evaluateCheckIn();

            setMetaData();

            // Display Notifications badge (unread number)
            setBadges();

        }


        function setMetaData(){
            if(MetaData.isFirstTimeHome()){
                var meta = MetaData.fetchHomeMeta();
                vm.notificationsUnreadNumber = meta.notificationsUnreadNumber;
                MetaData.setFetchedHome();
            }
        }

        //Setting up numbers on the
        function setBadges()
        {
            vm.notificationsUnreadNumber = Notifications.getNumberUnreadNotifications();
        }

        /**
         * @name setTreatmentStatus
         * @desc displays the latest treatment statements
         */
        function setTreatmentStatus() {
            if(!PlanningSteps.isCompleted() && PlanningSteps.hasCT()) {
                vm.statusDescription = "PLANNING";
            }else if (PlanningSteps.isCompleted()){
                vm.statusDescription = "PLANNING_COMPLETE";
            } else {
                vm.statusDescription = '';
            }
        }

        /**
         * @name setNextAppointment
         * @desc if appointments exist for the user, display the next upcoming appointment
         */
        function setNextAppointment() {
            //Next appointment information
            if(Appointments.appointmentsExist() && Appointments.nextAppointmentExists()) {
                vm.appointmentShown=Appointments.getUpcomingAppointment();
            }
        }

        /**
         * @name setPatientInfo
         * @desc sets the basic patient information in the view header
         */
        function setPatientInfo(){
            //Basic patient information
            vm.PatientId = Patient.getPatientId();
            vm.FirstName = Patient.getFirstName();
            vm.LastName = Patient.getLastName();
            vm.ProfileImage=Patient.getProfileImage();
            vm.language = UserPreferences.getLanguage();
            vm.noUpcomingAppointments=false;
        }

        function checkForNewNotifications(){
            Notifications.requestNewNotifications()
                .then(function(){
                    vm.loading = false;
                    if(Notifications.getNumberUnreadNotifications() > 0){
                        vm.notifications = Notifications.setNotificationsLanguage(Notifications.getUnreadNotifications());

                        vm.notifications=$filter('orderBy')(vm.notifications,'DateAdded',true);  // Sort Descending (chronological order)
                    }
                })
                .catch(function(error){
                    vm.loading = false;

                    // TODO: Notify user about error
                    console.log(error);
                });
        }

        /**
         * @name evaluateCheckIn
         * @desc checks with listener to see if the current user has checked in or not
         */
        function evaluateCheckIn(){
            CheckInService.evaluateCheckinState()
                .then(function(state){
                    vm.checkinState = state;
                });
        }

        /**
         * Initialize the app's modal size based on the screen size
         */
        function initModalSize(){
            var fontSize = UserPreferences.getFontSize();
            var rcorners = document.getElementById("rcorners");
            if (fontSize === "xlarge") {
                rcorners.setAttribute("style", "height: 80%");
            }
            else if (fontSize === "large") {
                rcorners.setAttribute("style", "height: 60%");
            }
            else rcorners.setAttribute("style", "height: 50%");
        }

        /**
         * @name configureSelectedHospital
         * @desc Set the hospital name to display
         */
        function configureSelectedHospital() {
            vm.allowedModules = HospitalModulePermission.getHospitalAllowedModules();
        }

        /*
         * PUBLIC METHODS
         * =========================================
         */

        /**
         * Exits the app on pressing the back button
         * Note: For Android devices only
         */
        function homeDeviceBackButton(){
            ons.notification.confirm({
                message: $filter('translate')('EXIT_APP'),
                modifier: 'android',
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

        /**
         * Takes the user the treatment status page
         */
        function goToStatus() {
            homeNavigator.pushPage('views/home/status/status_new.html');
        }

        /**
         * Takes the user to the selected notification in order to view it in detail
         * @param index
         * @param notification
         */
        function goToNotification(index, notification){

            $timeout(function(){
                vm.notifications.splice(index, 1);
            });

            Notifications.readNotification(index, notification);

            if(notification.NotificationType === 'CheckInError' || notification.NotificationType === 'CheckInNotification') goToCheckinAppointments();

            var post = (notification.hasOwnProperty('Post')) ? notification.Post : Notifications.getNotificationPost(notification);
            if(notification.hasOwnProperty('PageUrl')) {
                NavigatorParameters.setParameters({'Navigator':'homeNavigator', 'Post':post});
                homeNavigator.pushPage(notification.PageUrl);
            }else{
                var result = Notifications.goToPost(notification.NotificationType, post);
                if(result !== -1 ) {
                    NavigatorParameters.setParameters({'Navigator':'homeNavigator', 'Post':post});
                    homeNavigator.pushPage(result.Url);
                }
            }
        }

        /**
         * @desc Go to learn about Opal page
         */
        function gotoLearnAboutOpal(){
            NavigatorParameters.setParameters({'Navigator':'homeNavigator', 'isBeforeLogin': false});
            homeNavigator.pushPage('./views/home/about/about.html');
        }

        /**
         * Takes the user to the selected appointment to view more details about it
         */
        function goToAppointments(){
            NavigatorParameters.setParameters({'Navigator':'homeNavigator'});
            homeNavigator.pushPage('./views/personal/appointments/appointments.html');
        }

        /**
         * Takes the user to the setting pages
         */
        function goToSettings() {
            tabbar.setActiveTab(4);
        }

        /**
         * Takes the user to the checkin view
         */
        function goToCheckinAppointments() {
            if (vm.checkinState.noAppointments) return;
            NavigatorParameters.setParameters({'Navigator':'homeNavigator'});
            homeNavigator.pushPage('./views/home/checkin/checkin-list.html');
        }

    }
})();
