/*
*Code by David Herrera May 20, 2015
*Github: dherre3
*Email:davidfherrerar@gmail.com
*/

/**
 * @ngdoc controller
 * @requires Browser
 * @requires $filter
 * @requires Hospital
 * @requires NativeNotification
 * @requires Params
 * @requires $timeout
 * @requires UserHospitalPreferences
 * @description Controller for the parking view.
 */

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller("ParkingController", ParkingController);

    ParkingController.$inject = [
        'Browser',
        '$filter',
        'Hospital',
        'NativeNotification',
        'Params',
        '$timeout',
        'UserHospitalPreferences',
    ];

    /* @ngInject */
    function ParkingController(
        Browser,
        $filter,
        Hospital,
        NativeNotification,
        Params,
        $timeout,
        UserHospitalPreferences,
    ) {
        const vm = this;

        // variables seen from view
        vm.loading = true;  // This is for loading the list of sites
        vm.sites = [];
        vm.noParkingSites = false;
        vm.alert = undefined;

        // functions that can be used from view
        vm.goToParkingLink = goToParkingLink;

        activate();

        /////////////////////////

        function activate() {
            vm.loading = true;

            loadParkingSites();
        }

        /**
         * @name goToParkingLink
         * @desc This function redirects user to a given parking site url
         * @param {string} url Parking url
         */
        function goToParkingLink(url) {
            Browser.openInternal(url);
        }

        /**
         * @name loadParkingSites
         * @desc This function loads sites with the parking info
         */
        async function loadParkingSites() {
            try {
                const parkingInfo = await Hospital.requestSiteInfo();

                $timeout(() => {
                    
                    vm.sites = parkingInfo;
                    
                    if (vm.sites === undefined || vm.sites.length === 0) {
                        vm.noParkingSites = true;
                        vm.alert = {
                            type: Params.alertTypeInfo,
                            content: "NOPARKINGSITES",
                        };
                    }

                    vm.loading = false;
                });
            } catch (error) {
                $timeout(() => {
                    // TODO: Error handling improvements: https://o-hig.atlassian.net/browse/QSCCD-463
                    console.error(error);

                    vm.loading = false;

                    vm.alert = {
                        type: Params.alertTypeDanger,
                        content: "PAGE_ACCESS_ERROR"
                    };
                });
            }
        }
    }
})();
