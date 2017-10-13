/**
 * Created by PhpStorm.
 * User: James Brace
 * Date: 2017-09-20
 * Time: 12:01 PM
 */

(function() {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('GeneralTabController', GeneralTabController);

    GeneralTabController.$inject = ['$scope', 'Announcements', 'UpdateUI', 'NavigatorParameters', 'NetworkStatus', 'MetaData'];

    function GeneralTabController($scope,  Announcements, UpdateUI, NavigatorParameters, NetworkStatus, MetaData) {
        var vm = this;

        vm.goToPatientCharter = goToPatientCharter;
        vm.goToParking =goToParking;
        vm.generalDeviceBackButton = generalDeviceBackButton;

        activate();

        ///////////////////////////

        /**
         * PRIVATE FUNCTIONS
         */

        function activate(){
            if(NetworkStatus.isOnline()){
                initGeneralTab();
            }

            NavigatorParameters.setParameters({'Navigator':'generalNavigator'});
            NavigatorParameters.setNavigator(generalNavigator);

            bindEvents();
        }

        function bindEvents(){
            generalNavigator.on('prepop',function(){
                setBadges();
            });

            generalNavigator.on('prepush', function(event) {
                if (generalNavigator._doorLock.isLocked()) {
                    event.cancel();
                }
            });

            //Destroying personal navigator events
            $scope.$on('$destroy', function(){
                generalNavigator.off('prepush');
                generalNavigator.off('prepop');
            });
        }

        function initGeneralTab(){
            if(MetaData.isFirstTimeGeneral()){
                $scope.announcementsUnreadNumber = Announcements.getNumberUnreadAnnouncements();
            }
            else if (Announcements.getLastUpdated() < Date.now() - 300000 ) {
                // TODO: MAKE THIS INTO A BACKGROUND REFRESH

                UpdateUI.set([
                    'Doctors',
                    'Announcements'
                ])
            }
            setBadges();
        }

        function setBadges(){
            $scope.announcementsUnreadNumber = Announcements.getNumberUnreadAnnouncements();
        }


        /**
         * PUBLIC FUNCTIONS
         */

        function goToPatientCharter(){
            NavigatorParameters.setParameters('generalNavigator');
            generalNavigator.pushPage('./views/general/charter/charter.html');
        }

        function goToParking() {
            NavigatorParameters.setParameters('generalNavigator');
            generalNavigator.pushPage('views/general/parking/parking.html')
        }

        function generalDeviceBackButton(){
            tabbar.setActiveTab(0);
        }
    }
})();