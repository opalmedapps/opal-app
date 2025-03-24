/*
*Code by David Herrera May 20, 2015
*Github: dherre3
*Email:davidfherrerar@gmail.com
*/

/**
 * @ngdoc controller
 * @name MUHCApp.controller:ParkingController
 * @requires Browser
 * @requires $filter
 * @requires Hospital
 * @requires NativeNotification
 * @requires Params
 * @requires $timeout
 * @requires UserHospitalPreferences
 * @requires UserPreferences
 * @description Controller for the parking view.
 */

(function () {
	'use strict';

	angular
		.module("MUHCApp")
		.controller("ParkingController", ParkingController);

	ParkingController.$inject = [
		'Browser',
		'$filter',
		'Hospital',
		'NativeNotification',
		'Params',
		'$timeout',
		'UserHospitalPreferences',
		'UserPreferences',
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
		UserPreferences,
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

			Hospital.requestParkingInfo(
				UserHospitalPreferences.getHospital(),
				UserPreferences.getLanguage()
			).then(function (parkingInfo) {
				$timeout(function () {
					vm.sites = parkingInfo.results;

					if (vm.sites.length === 0) {
						vm.noParkingSites = true;
						vm.alert = {
							type: Params.alertTypeInfo,
							content: "NOPARKINGSITES"
						};
					}
				});

				vm.loading = false;
			}).catch(handleError);
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
		 * @name handleError
		 * @desc show a notification to the user in case a request to server fails
		 */
		function handleError(response) {
			$timeout(() => {
				vm.loading = false;
				console.log(response);
				switch (response.Code) {
					case Params.REQUEST.ENCRYPTION_ERROR:
						vm.alert = {
							type: Params.alertTypeDanger,
							content: "PAGE_ACCESS_ERROR"
						};
						break;
					case Params.REQUEST.SERVER_ERROR:
						vm.alert = {
							type: Params.alertTypeDanger,
							content: "SERVERERRORALERT"
						};
						break;
					case Params.REQUEST.TOO_MANY_ATTEMPTS:
						vm.alert = {
							type: Params.alertTypeDanger,
							content: "PAGE_ACCESS_ERROR"
						};
						break;
					case Params.REQUEST.CLIENT_ERROR:
						vm.alert = {
							type: Params.alertTypeDanger,
							content: "PAGE_ACCESS_ERROR"
						};
						break;
					default:
						vm.alert = {
							type: Params.alertTypeDanger,
							content: "ERROR_GENERIC"
						};
				}
			});
		}
	}
})();
