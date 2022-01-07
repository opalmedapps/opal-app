/*
*Code by David Herrera May 20, 2015
*Github: dherre3
*Email:davidfherrerar@gmail.com
*/
(()=>{
	angular.module("MUHCApp")
		.controller("ParkingController", ParkingController);

	ParkingController.$inject = [
		'$filter', '$timeout', 'NativeNotification', 'NavigatorParameters', 'UserPreferences', 'UserHospitalPreferences',
		'Hospital', 'Params', 'Browser', 'DynamicContent'
	];

	/* @ngInject */
	function ParkingController(
		$filter, $timeout, NativeNotification, NavigatorParameters, UserPreferences, UserHospitalPreferences,
		Hospital, Params, Browser, DynamicContent
	) {
		const vm = this;

		// variables for controller
		let navigator;

		// variables seen from view
		vm.loading = true;  // This is for loading the list of questionnaires
		vm.sites = [];

		// functions that can be used from view
		vm.goToParkingLink = goToParkingLink;
		vm.goToPrototypeParkingLink = goToPrototypeParkingLink;

		activate();

		/////////////////////////

		function activate() {

			vm.loading = true;

			navigator = NavigatorParameters.getNavigator();

			Hospital.requestParkingInfo(UserHospitalPreferences.getHospital(), UserPreferences.getLanguage())
				.then(function(parkingInfo) {
					$timeout(function(){
						vm.sites = parkingInfo.results;
					});

					vm.loading = false;
				})
				.catch(function(error){
					$timeout(function(){
						vm.loading = false;
						handleRequestError();
					})
			});
		}

		/**
		 * @name goToPrototypeParkingLink
		 * @desc This function redirects user to the given parking site url
		 * @param {string} url Parking url
		 */
		function goToPrototypeParkingLink(url) {
				Browser.openInternal(url);
		}

		function goToParkingLink(type) {
			if (type === "parking_general" || type === "parking_gettingtohospital") {
				const url = DynamicContent.getURL(type);
				Browser.openInternal(url);
			}
			else if (type ==="parking_oncology") {
				navigator.pushPage('./views/templates/content.html', {contentType: type});
			}
		}

		/**
		 * @name handleRequestError
		 * @desc show a notification to the user in case a request to server fails
		 */
		function handleRequestError (){
			//message: 'Server problem: could not fetch data, try again later',
			NativeNotification.showNotificationAlert($filter('translate')("SERVERERRORALERT"));
		}
	}
})();
