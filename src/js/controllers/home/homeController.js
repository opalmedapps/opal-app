(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('HomeController', HomeController);

    HomeController.$inject = [
        '$timeout', 'Appointments', 'CheckInService', '$scope', '$filter', 'NavigatorParameters',
        'UserPreferences', 'NetworkStatus', 'UserHospitalPreferences', 'RequestToServer', 'Params',
        'Version', 'User', 'ProfileSelector','$interval', 'UpdateUI',
    ];

    /* @ngInject */
    function HomeController($timeout, Appointments, CheckInService, $scope, $filter, NavigatorParameters,
        UserPreferences, NetworkStatus, UserHospitalPreferences, RequestToServer, Params,
        Version, User, ProfileSelector, $interval, UpdateUI,
    ){
        var vm = this;

        vm.FirstName = '';
        vm.LastName = '';
        vm.ProfileImage = null;
        vm.language = 'EN';
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

        // For displaying the closest upcoming endpoint
        vm.closestAppointment = null;

        vm.homeDeviceBackButton = homeDeviceBackButton;
        vm.goToAppointments = goToAppointments;
        vm.goToCheckinAppointments = goToCheckinAppointments;
        vm.gotoLearnAboutOpal = gotoLearnAboutOpal;
        vm.goToAcknowledgements = goToAcknowledgements;
        vm.getPatientFirstName = getPatientFirstName;

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
            //Initialize the page interval to refresh checkin state every 5 second
            setInterval();
            // Store the login time
            if (localStorage.getItem('locked')) localStorage.removeItem('locked');
            bindEvents();
            // Initialize the page data if online
            NetworkStatus.isOnline() ? homePageInit() : setPatientInfo();
            // set the hospital banner and available modules
            configureSelectedHospital();
        }

        /**
         * @ngdoc function
         * @name bindEvents
         * @methodOf MUHCApp.controllers.homeController
         * @description Sets up event bindings for this controller.
         */
        function bindEvents() {
            // Refresh the page on coming back from other pages
            homeNavigator.on('prepop', function(event) {
                const prepopPages = ['./views/home/checkin/checkin-list.html', 'views/personal/notifications/notifications.html'];
                if (prepopPages.includes(event.currentPage.name) && NetworkStatus.isOnline()) getDisplayData();
                //restart the reload interval when going back to the home page
                setInterval();
            });

            //This avoids constant repushing which causes bugs
            homeNavigator.on('prepush', event => {
                if (homeNavigator._doorLock.isLocked()) event.cancel();
                //stop the reload interval when leaving the home page
                cancelInterval();
            });

            //release the watchers
            $scope.$on('$destroy',() => {
                homeNavigator.off('prepop');
                homeNavigator.off('prepush');
                //stop the reload interval when leaving the home page
                cancelInterval();
            });
        }

        /**
         * Initializes the home page view by calling a bunch of helper function
         */
        function homePageInit() {
            // Get Data from the new backend api
            getDisplayData();
            //Initialize modal size based on font size
            initModalSize();
            //Set patient info
            setPatientInfo();
            // display version updates info, if any
            checkForVersionUpdates();
        }

        /**
         * @description Function to get view specific data from Django API
         */
        async function getDisplayData() {
            try {
                const result = await RequestToServer.apiRequest(Params.API.ROUTES.HOME);
                const checkinState = await CheckInService.evaluateCheckinState(result?.data?.daily_appointments);
                $timeout(() => {
                    vm.notificationsUnreadNumber = result?.data?.unread_notification_count;
                    vm.checkinState = checkinState;
                    vm.closestAppointment = result?.data?.closest_appointment;
                });
            } catch (error) {
                // TODO: Error handling improvements: https://o-hig.atlassian.net/browse/QSCCD-463
                console.error(error);
            }
        }

        /**
         * @name setPatientInfo
         * @desc Sets the basic patient information in the view header that may or many not be available... but won't break app if not there and it makes the app look less broken if not internet connection
         */
        function setPatientInfo(){
            vm.userInfo = User.getUserInfo();
            vm.language = UserPreferences.getLanguage();
            vm.noUpcomingAppointments = false;
        }
        
        /**
         * @name checkForVersionUpdates
         * @desc get latest version info according to the current version
         */
        function checkForVersionUpdates() {
            const currentVersion = Version.currentVersion();
            let lastVersion = localStorage.getItem('lastVersion');
            // Initialize lastVersion if not defined, so that we could
            // get all the updates from the beginning of major version
            if (!lastVersion) {
                const lastPoint = currentVersion.lastIndexOf('.');
                lastVersion = currentVersion.substr(0, lastPoint) + '.-1';
                localStorage.setItem('lastVersion', lastVersion);
            }

            if (currentVersion !== lastVersion) {
                Version.getVersionUpdates(lastVersion, currentVersion, vm.language).then(function(data) {
                    if (data && data.length > 0) {
                        $scope.infoModalVersion = Version.currentVersion();
                        $scope.infoModalData = data;
                        $timeout(function () {
                            infoModal.show();
                        },200);
                        localStorage.setItem('lastVersion', currentVersion);
                    }
                }).catch(console.error);
            }
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
                callback: (index) => {
                    if (index === 1) navigator.app.exitApp();
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
            let params = {'Navigator':'homeNavigator'};
            // When the nearest appointment is for a patient in care,
            // by clicking on the widget should open the calendar for that patient (e.g., care receiver's calendar)
            if (ProfileSelector.getActiveProfile().patient_legacy_id !== vm?.closestAppointment?.patientsernum) {
                params['isCareReceiver'] = true;
                params['currentProfile'] = ProfileSelector.getActiveProfile().patient_legacy_id;
                ProfileSelector.loadPatientProfile(vm.closestAppointment.patientsernum);

                // Reload 'Appointments' for the patient in care in case the appointments were already loaded
                UpdateUI.updateTimestamps('Appointments', 0);
            }
            NavigatorParameters.setParameters(params);
            homeNavigator.pushPage('./views/personal/appointments/appointments.html');
        }

        /**
         * Takes the user to the checkin view
         */
        async function goToCheckinAppointments() {
            if (vm.checkinState.noAppointments || !vm.checkinState.canNavigate) return;
            const url = {
                method: 'get',
                url: '/api/app/appointments/',
            }
            const apps = await RequestToServer.apiRequest(url);
            Appointments.setCheckinAppointments(apps?.data?.daily_appointments);

            NavigatorParameters.setParameters({'Navigator':'homeNavigator'});
            homeNavigator.pushPage('./views/home/checkin/checkin-list.html');
        }

        /**
         * @description Takes the user to the acknowledgements page.
         */
        function goToAcknowledgements() {
            homeNavigator.pushPage('./views/templates/content.html', {contentType: 'acknowledgements'});
        }

        /**
         * @description set a interval to refresh the checkin state every 5 seconds
         */
        function setInterval(){
            vm.reloadInterval = $interval(function(){
                CheckInService.reloadingCheckinState();
                getDisplayData();
            }, 5000);
        }

        /**
         * @description cancel the interval
         */
        function cancelInterval(){
            $interval.cancel(vm.reloadInterval);
        }

        /**
         * @description get patient's first name for the appointment widget
         */
        function getPatientFirstName(){
            let selfPatientSerNum = User.getSelfPatientSerNum();
            if (selfPatientSerNum && selfPatientSerNum === vm?.closestAppointment?.patientsernum) {
                return $filter('translate')("YOU");
            }
            else {
                let confirmedProfiles = ProfileSelector.getConfirmedProfiles();
                let patient = confirmedProfiles.find(
                    patient_profile => patient_profile.patient_legacy_id === vm?.closestAppointment?.patientsernum
                );
                return patient ? patient.first_name : "";
            }
        }
    }
})();
