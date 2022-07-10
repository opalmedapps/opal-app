(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('HomeController', HomeController);

    HomeController.$inject = [
        'Appointments', 'CheckInService', 'Patient', '$scope', '$filter', 'Notifications', 'NavigatorParameters',
        'Permissions', 'UserPreferences', 'NetworkStatus', 'MetaData', 'UserHospitalPreferences', 'Version', '$timeout'];

    /* @ngInject */
    function HomeController(Appointments, CheckInService, Patient, $scope, $filter, Notifications, NavigatorParameters,
                            Permissions, UserPreferences, NetworkStatus, MetaData, UserHospitalPreferences, Version, $timeout)
    {
        var vm = this;

        vm.FirstName = '';
        vm.LastName = '';
        vm.ProfileImage = null;
        vm.language = 'EN';
        vm.appointmentShown = null;
        vm.todaysAppointments = [];
        vm.calledApp = null;
        vm.RoomLocation = '';
        vm.showHomeScreenUpdate = null;
        vm.loading = true;
        $scope.infoModalData = [];

        vm.checkinState = {
            noAppointments: true,
            allCheckedIn: false,
            message: 'DETECTING_LOCATION',
            canNavigate: false,
            checkinError: false,
            inRange: true
        };

        // variable to let the user know which hospital they are logged in
        vm.selectedHospitalToDisplay = "";
        // control the modules to display to users
        vm.allowedModules = {};

        vm.homeDeviceBackButton = homeDeviceBackButton;
        vm.goToAppointments = goToAppointments;
        vm.goToSettings = goToSettings;
        vm.goToCheckinAppointments = goToCheckinAppointments;
        vm.gotoLearnAboutOpal = gotoLearnAboutOpal;
        vm.goToAcknowledgements = goToAcknowledgements;

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

            // Refresh the page on coming back from other pages
            homeNavigator.on('prepop', function(event) {
                if (event.currentPage.name === "./views/home/checkin/checkin-list.html" && NetworkStatus.isOnline()) evaluateCheckIn();
                if (event.currentPage.name === "views/personal/notifications/notifications.html" && NetworkStatus.isOnline()) setBadges();
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

            // Initialize the page data if online
            if (NetworkStatus.isOnline()) {
                homePageInit();
            } else {
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

            //display next appointment
            setNextAppointment();

            // display new notifications, if any
            checkForNewNotifications();

            checkForVersionUpdates();

            // Display current check in status
            evaluateCheckIn();

            setMetaData();

            // Display notifications badge (unread number)
            setBadges();
        }


        function setMetaData() {
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
                    // Display notifications badge (unread number)
                    setBadges();
                })
                .catch(function(error){
                    vm.loading = false;

                    // TODO: Notify user about error
                    console.log(error);

                    // Display notifications badge (unread number)
                    setBadges();
                });
        }

        /**
         * @name checkForVersionUpdates
         * @desc get latest version info according to the current version
         */
        function checkForVersionUpdates() {
            $scope.infoModalTitle = 'Current Version: ' + Version.currentVersion();
            Version.requestVersionUpdates()
                .then(function(response){
                    vm.loading = false;
                    response.forEach(function(value, index) {
                        let infoData = {};
                        let description = vm.language == 'EN' ? value.description_en : value.description_fr;
                        description = formatVersionDescription(description);
                        infoData.title = value.version;
                        infoData.content = description;
                        $scope.infoModalData.push(infoData);
                    });
                    $timeout(function () {
                        infoModal.show();
                    },200);
                })
                .catch(function(error){
                    vm.loading = false;

                    // TODO: Notify user about error
                    console.log(error);

                    // Display notifications badge (unread number)
                });
        }

        /**
         * @name formatVersionDescription
         * @desc parse the description from string to array
         */
        function formatVersionDescription(description) {
            let descriptions = '';
            if (typeof description == 'string' && description.length > 0) {
                const descriptionArray = JSON.parse(description);
                descriptionArray.forEach(function(value, index) {
                    descriptions += '\u2022 ' + value + '\n\n';
                });
            }
            return descriptions;
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
            vm.selectedHospitalToDisplay = UserHospitalPreferences.getHospitalFullName();
            vm.allowedModules = UserHospitalPreferences.getHospitalAllowedModules();
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

        /**
         * @description Takes the user to the acknowledgements page.
         */
        function goToAcknowledgements() {
            homeNavigator.pushPage('./views/templates/content.html', {contentType: 'acknowledgements'});
        }

        function test() {
            console.log('test');
        }
    }
})();
