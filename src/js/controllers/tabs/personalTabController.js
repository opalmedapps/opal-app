/**
 * Created by PhpStorm.
 * User: James Brace
 * Date: 2017-09-20
 * Time: 12:00 PM
 */

(function() {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('PersonalTabController', PersonalTabController);

    PersonalTabController.$inject = ['Appointments','TxTeamMessages','Documents','NavigatorParameters', 'Notifications',
        'Questionnaires', 'Patient', 'NetworkStatus', 'MetaData', '$timeout', 'UserPreferences', 'Params', 'UserHospitalPreferences'];

    function PersonalTabController( Appointments, TxTeamMessages, Documents, NavigatorParameters, Notifications, Questionnaires,
                                    Patient, NetworkStatus, MetaData, $timeout, UserPreferences, Params, UserHospitalPreferences) {
        var vm = this;

        // variable to let the user know which hospital they are logged in
        vm.selectedHospitalToDisplay = "";
        vm.allowedModules = {};

        vm.goToStatus = goToStatus;
        vm.personalDeviceBackButton = personalDeviceBackButton;
        vm.goToCarnetSante = goToCarnetSante;

        activate();

        //////////////////////////

        function activate(){
            //Its possible for a notification to have been read such as a document since this controller has already been instantiated
            // we will have to check to sync that number on the badges for the tabs on the personal page.
            NavigatorParameters.setParameters({'Navigator':'personalNavigator'});
            NavigatorParameters.setNavigator(personalNavigator);

            bindEvents();
            setMetaData();

            vm.language = UserPreferences.getLanguage();
            configureSelectedHospital();

            $timeout(function(){
                vm.censor = Patient.getAccessLevel() == 3;
            });

            //Sets appointments and treatment plan stage tab
            if(NetworkStatus.isOnline()){
                setBadges();
            }
        }

        function bindEvents(){
            personalNavigator.on('prepop',function(){
                setBadges();
            });

            personalNavigator.on('prepush', function(event) {
                if (personalNavigator._doorLock.isLocked()) {
                    event.cancel();
                }
            });
        }

        function setMetaData(){
            if(MetaData.isFirstTimePersonal()){
                var meta = MetaData.fetchPersonalMeta();
                vm.appointmentsUnreadNumber = meta.appointmentsUnreadNumber;
                vm.documentsUnreadNumber = meta.documentsUnreadNumber;
                vm.txTeamMessagesUnreadNumber = meta.txTeamMessagesUnreadNumber;
                vm.notificationsUnreadNumber = meta.notificationsUnreadNumber;
                vm.questionnairesUnreadNumber = meta.questionnairesUnreadNumber;
                MetaData.setFetchedPersonal();
            }
        }

        //Setting up numbers on the
        function setBadges()
        {
            vm.appointmentsUnreadNumber = Appointments.getNumberUnreadAppointments();
            vm.documentsUnreadNumber = Documents.getNumberUnreadDocuments();
            vm.txTeamMessagesUnreadNumber = TxTeamMessages.getNumberUnreadTxTeamMessages();
            vm.notificationsUnreadNumber = Notifications.getNumberUnreadNotifications();
            vm.questionnairesUnreadNumber = Questionnaires.getNumberOfUnreadQuestionnaires();
        }

        function goToStatus(){
            NavigatorParameters.setParameters({'Navigator':'personalNavigator'});
            personalNavigator.pushPage('views/home/status/status_new.html');
        }

        function personalDeviceBackButton(){
            tabbar.setActiveTab(0);
        }

        function goToCarnetSante() {
            let url = '';
            let app = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;

            url = Params.carnetSanteUrl;  // English site available after opening the French one

            if (app) {
                cordova.InAppBrowser.open(url, '_blank', 'location=yes');
            } else {
                window.open(url, '_blank');
            }
        }

        /**
         * @name configureSelectedHospital
         * @desc Set the hospital name to display
         */
        function configureSelectedHospital() {
            vm.selectedHospitalToDisplay = UserHospitalPreferences.getHospitalFullName();
            vm.allowedModules = UserHospitalPreferences.getHospitalAllowedModules();
        }
    }
})();
