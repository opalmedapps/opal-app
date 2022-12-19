(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('HomeController', HomeController);

    HomeController.$inject = [
        '$timeout', 'Appointments', 'CheckInService', 'Patient', '$scope', '$filter', 'NavigatorParameters',
        'UserPreferences', 'NetworkStatus', 'UserHospitalPreferences', 'RequestToServer', 'Params', 'Version', 'User', 'ProfileSelector'];

    /* @ngInject */
    function HomeController($timeout, Appointments, CheckInService, Patient, $scope, $filter, NavigatorParameters,
                            UserPreferences, NetworkStatus, UserHospitalPreferences, RequestToServer, Params, Version, User, ProfileSelector)
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
            message: 'CHECKIN_NONE',
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
            if (localStorage.getItem('locked')) localStorage.removeItem('locked');
            // Refresh the page on coming back from other pages
            homeNavigator.on('prepop', function(event) {
                if ((event.currentPage.name === "./views/home/checkin/checkin-list.html"
                    || event.currentPage.name === "views/personal/notifications/notifications.html")
                    && NetworkStatus.isOnline()) getDisplayData();
            });
            //This avoids constant repushing which causes bugs
            homeNavigator.on('prepush', event => {
                if (homeNavigator._doorLock.isLocked()) event.cancel();
            });
            //release the watchers
            $scope.$on('$destroy',() => {
                homeNavigator.off('prepop');
                homeNavigator.off('prepush');
            });
            // Initialize the page data if online
            NetworkStatus.isOnline() ? homePageInit() : setPatientInfo();
            // set the hospital banner and available modules
            configureSelectedHospital();
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
            //display next appointment
            setNextAppointment();
            // display version updates info, if any
            checkForVersionUpdates();
        }

        /**
         * @description Function to get view specific data from Django API
         */
        async function getDisplayData() {
            try {
                const result = await RequestToServer.apiRequest(Params.API.ROUTES.HOME);
                $timeout(async () => {
                    vm.notificationsUnreadNumber = result.data.unread_notification_count;
                    evaluateCheckinStatus(result.data.daily_appointments);
                });
            } catch (error) {
                // TODO: Error handling improvements: https://o-hig.atlassian.net/browse/QSCCD-463
                console.error(error);
            }
        }

        /**
         * @description Evaluate and set to correct display for the checkin checkbox
         * @param {object} dailyAppointments Caregiver and related patient(s) daily appointment(s). 
         */
        function evaluateCheckinStatus(dailyAppointments) {
            if (!dailyAppointments) return {...vm.checkinState, message: selectMessage(vm.checkinState)};
            let appointmentWithCheckinAvailable = dailyAppointments.filter(appt => appt.checkinpossible === '1');
            vm.checkinState.noAppointments = appointmentWithCheckinAvailable?.length === 0;
            vm.checkinState.allCheckedIn = !vm.checkinState.noAppointments && appointmentWithCheckinAvailable.filter(appt => appt.checkin === '1').length === appointmentWithCheckinAvailable.length;
            vm.checkinState.canNavigate = !vm.checkinState.noAppointments && !vm.checkinState.checkinError;
            vm.checkinState.numberOfAppts = appointmentWithCheckinAvailable?.length || 0;
            selectMessage(vm.checkinState);
        }

        /**
         * @description Assign the correct checkin status message to the user.
         * @param {object} checkinState Current checking state to which assign the message.
         */
        function selectMessage(checkinState) {   
            if (!checkinState.allCheckedIn && !checkinState.noAppointments) {
                return vm.checkinState.message = (checkinState.numberOfAppts <= 1) ? 'CHECKIN_MESSAGE_BEFORE' : 'CHECKIN_MESSAGE_BEFORE_PLURAL';
            }

            if (checkinState.allCheckedIn) {
                return vm.checkinState.message = (checkinState.numberOfAppts <= 1) ? 'CHECKIN_MESSAGE_AFTER' : 'CHECKIN_MESSAGE_AFTER_PLURAL';
            }
            vm.checkinState.message = 'CHECKIN_NONE'
        }

        /**
         * @name setNextAppointment
         * @desc if appointments exist for the user, display the next upcoming appointment
         */
        function setNextAppointment() {
            //Next appointment information
            if(Appointments.appointmentsExist() && Appointments.nextAppointmentExists()) vm.appointmentShown=Appointments.getUpcomingAppointment();
        }

        /**
         * @name setPatientInfo
         * @desc Sets the basic patient information in the view header that may or many not be available... but won't break app if not there and it makes the app look less broken if not internet connection
         */
        function setPatientInfo(){
            vm.user = User.getLoggedinUserProfile();
            // The observable is needed to fix a race condition on login.
            if(!vm.user) ProfileSelector.observeProfile(() => vm.user = User.getLoggedinUserProfile());
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
            NavigatorParameters.setParameters({'Navigator':'homeNavigator'});
            homeNavigator.pushPage('./views/personal/appointments/appointments.html');
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
    }
})();
