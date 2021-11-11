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

        GeneralTabController.$inject = ['$scope', 'Announcements', 'UpdateUI', 'NavigatorParameters', 'NetworkStatus',
            'MetaData', 'UserPreferences', 'Params', 'UserHospitalPreferences', 'Browser', 'DynamicContent'];

        function GeneralTabController($scope, Announcements, UpdateUI, NavigatorParameters, NetworkStatus, MetaData,
                                      UserPreferences, Params, UserHospitalPreferences, Browser, DynamicContent) {
            var vm = this;

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
                vm.selectedHospitalToDisplay = UserHospitalPreferences.getHospitalFullName();
                vm.allowedModules = UserHospitalPreferences.getHospitalAllowedModules();
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

                    UpdateUI.getData([
                        'Doctors',
                        'Announcements'
                    ]).catch(error => {
                        console.error("Failed to fetch Doctors and Announcements data from server:", error);
                    });
                }
                setBadges();
            }

            function setBadges() {
                vm.announcementsUnreadNumber = Announcements.getNumberUnreadAnnouncements();
            }


            /**
             * PUBLIC FUNCTIONS
             */

            function goToParking() {
                NavigatorParameters.setParameters('generalNavigator');
                generalNavigator.pushPage('views/general/parking/parking.html');
            }

            function generalDeviceBackButton() {
                tabbar.setActiveTab(0);
            }

            function goToUrl(contentKey) {
                const url = DynamicContent.getURL(contentKey);
                Browser.openInternal(url);
            }
        }
    }
)();
