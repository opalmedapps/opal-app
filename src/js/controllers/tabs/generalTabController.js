// SPDX-FileCopyrightText: Copyright (C) 2017 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/**
 * Created by PhpStorm.
 * User: James Brace
 * Date: 2017-09-20
 * Time: 12:01 PM
 */

(function () {
        'use strict';

        angular
            .module('OpalApp')
            .controller('GeneralTabController', GeneralTabController);

        GeneralTabController.$inject = ['$scope', 'Navigator', 'NetworkStatus', '$timeout',
            'UserPreferences', 'UserHospitalPreferences', 'Browser', 'DynamicContent', 'RequestToServer', 'Params'];

        function GeneralTabController($scope, Navigator, NetworkStatus, $timeout,
                                      UserPreferences, UserHospitalPreferences, Browser, DynamicContent, RequestToServer, Params) {
            var vm = this;

            vm.goToParking = goToParking;
            vm.generalDeviceBackButton = generalDeviceBackButton;
            vm.goToUrl = goToUrl;
            vm.goToCarnetSante = goToCarnetSante;
            // variable to let the user know which hospital they are logged in
            vm.selectedHospitalToDisplay = "";
            vm.allowedModules = {};

            activate();

            ///////////////////////////

            /**
             * PRIVATE FUNCTIONS
             */

            function activate() {
                Navigator.setNavigator(generalNavigator);

                bindEvents();

                vm.language = UserPreferences.getLanguage();
                configureSelectedHospital();

                if(NetworkStatus.isOnline()) getDisplayData();
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
                // Refresh the page on coming back from other pages
                generalNavigator.on('prepop', function () {
                    if(NetworkStatus.isOnline()) getDisplayData();
                });
                //This avoids constant repushing which causes bugs
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

            /**
             * @description Function to get view specific data from Django API
             */
            async function getDisplayData() {
                try {
                    const result = await RequestToServer.apiRequest(Params.API.ROUTES.GENERAL);
                    $timeout(() => {
                        vm.announcementsUnreadNumber = result.data.unread_announcement_count;
                    });
                } catch (error) {
                    // TODO: Error handling improvements: https://o-hig.atlassian.net/browse/QSCCD-463
                    console.error(error);
                }
            }

            /**
             * PUBLIC FUNCTIONS
             */

            function goToParking() {
                generalNavigator.pushPage('views/general/parking/parking.html');
            }

            function generalDeviceBackButton() {
                tabbar.setActiveTab(0);
            }

            function goToUrl(contentKey) {
                const url = DynamicContent.getURL(contentKey);
                Browser.openInternal(url);
            }

            function goToCarnetSante() {
                const url = DynamicContent.getURL("carnetSante");
                Browser.openInternal(url);
            }
        }
    }
)();
