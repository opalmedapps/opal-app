/*
*Code by David Herrera May 20, 2015
*Github: dherre3
*Email:davidfherrerar@gmail.com
*/
(()=>{
	angular.module("MUHCApp")
		.controller("ParkingController", ParkingController);

	ParkingController.$inject = ['NavigatorParameters', 'UserPreferences', 'Params', 'Browser', 'DynamicContent'];

	/* @ngInject */
	function ParkingController(NavigatorParameters, UserPreferences, Params, Browser, DynamicContent) {
		const vm = this;

		let navigator;

		vm.goToParkingLink = goToParkingLink;

		activate();

		/////////////////////////

		function activate() {
			navigator = NavigatorParameters.getNavigator();
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
	}
})();
