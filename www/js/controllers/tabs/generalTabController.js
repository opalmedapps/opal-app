/**
 * Created by PhpStorm.
 * User: James Brace
 * Date: 2017-09-20
 * Time: 12:01 PM
 */

(function () {
        'use strict';

        angular
            .module('MUHCApp')
            .controller('GeneralTabController', GeneralTabController);

        GeneralTabController.$inject = ['$scope', 'Announcements', 'UpdateUI', 'NavigatorParameters', 'NetworkStatus', 'MetaData', 'UserPreferences', 'Params', 'HospitalModulePermission'];

        function GeneralTabController($scope, Announcements, UpdateUI, NavigatorParameters, NetworkStatus, MetaData, UserPreferences, Params, HospitalModulePermission) {
            var vm = this;

            vm.goToPatientCharter = goToPatientCharter;
            vm.goToParking = goToParking;
            vm.generalDeviceBackButton = generalDeviceBackButton;
            vm.goToUrl = goToUrl;

            // variable to let the user know which hospital they are logged in
            vm.selectedHospitalToDisplay = "";
            vm.allowedModules = {};

            activate();

            ///////////////////////////

            /**
             * PRIVATE FUNCTIONS
             */

            function activate() {
                if (NetworkStatus.isOnline()) {
                    initGeneralTab();
                }

                NavigatorParameters.setParameters({'Navigator': 'generalNavigator'});
                NavigatorParameters.setNavigator(generalNavigator);

                bindEvents();

                vm.language = UserPreferences.getLanguage();
                configureSelectedHospital();
            }

            /**
             * @name configureSelectedHospital
             * @desc Set the hospital name and module to display
             */
            function configureSelectedHospital() {
                vm.selectedHospitalToDisplay = HospitalModulePermission.getHospitalFullName();
                vm.allowedModules = HospitalModulePermission.getHospitalAllowedModules();
            }

            function bindEvents() {
                generalNavigator.on('prepop', function () {
                    setBadges();
                });

                generalNavigator.on('prepush', function (event) {
                    if (generalNavigator._doorLock.isLocked()) {
                        event.cancel();
                    }
                });

                //Destroying personal navigator events
                $scope.$on('$destroy', function () {
                    generalNavigator.off('prepush');
                    generalNavigator.off('prepop');
                });
            }

            function initGeneralTab() {
                if (MetaData.isFirstTimeGeneral()) {
                    $scope.announcementsUnreadNumber = Announcements.getNumberUnreadAnnouncements();
                }
                else if (Announcements.getLastUpdated() < Date.now() - 300000) {
                    // TODO: MAKE THIS INTO A BACKGROUND REFRESH

                    UpdateUI.set([
                        'Doctors',
                        'Announcements'
                    ])
                }
                setBadges();
            }

            function setBadges() {
                vm.announcementsUnreadNumber = Announcements.getNumberUnreadAnnouncements();
            }


            /**
             * PUBLIC FUNCTIONS
             */

            function goToPatientCharter() {
                NavigatorParameters.setParameters('generalNavigator');
                generalNavigator.pushPage('./views/general/charter/charter.html');
            }

            function goToParking() {
                NavigatorParameters.setParameters('generalNavigator');
                generalNavigator.pushPage('views/general/parking/parking.html');
            }

            function generalDeviceBackButton() {
                tabbar.setActiveTab(0);
            }


            function goToUrl(openWhat) {
                let url = '';
                let app = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;

                switch (openWhat.toLowerCase()) {
                    case Params.findDoctorCase:
                        url = (vm.language === "EN") ? Params.findDoctorUrl.findDoctorUrlEn : Params.findDoctorUrl.findDoctorUrlFr ;
                        break;
                    case Params.medicalSchedulerCase:
                        url = (vm.language === "EN") ? Params.medicalSchedulerUrl.medicalSchedulerUrlEn : Params.medicalSchedulerUrl.medicalSchedulerUrlFr ;
                        break;
                    case Params.carnetSanteCase:
                        url =  Params.carnetSanteUrl ;  // English site available after opening the French one
                        break;
                    default:
                        break;
                }

                if (app) {
                    cordova.InAppBrowser.open(url, '_blank', 'location=yes');
                } else {
                    window.open(url, '_blank');
                }

            }

        }
    }
)();
