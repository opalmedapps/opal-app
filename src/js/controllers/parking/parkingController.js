/*
*Code by David Herrera May 20, 2015
*Github: dherre3
*Email:davidfherrerar@gmail.com
*/
(()=>{
	angular.module("MUHCApp")
		.controller("ParkingController", ParkingController);

	ParkingController.$inject = ['NavigatorParameters', 'UserPreferences', 'Params', 'Browser'];

	/* @ngInject */
	function ParkingController(NavigatorParameters, UserPreferences, Params, Browser) {
		const vm = this;

		let navigatorName;

		vm.goToParkingLink = goToParkingLink;

		activate();

		/////////////////////////

		function activate(){
			navigatorName = NavigatorParameters.getParameters();
		}

		function goToParkingLink(type){
			let url = '';
			if (type === 'general') {
				UserPreferences.getLanguage().toUpperCase() === "EN"
					? url = Params.general.generalParkingGlenUrlEn
					: url = Params.general.generalParkingGlenUrlFr;
				Browser.openInternal(url);
			}
			else if (type === 'gettingtohospital') {
				UserPreferences.getLanguage().toUpperCase() === "EN"
					? url = Params.gettingHospitalUrl.gettingHospitalUrlEn
					: url = Params.gettingHospitalUrl.gettingHospitalUrlFr;
				Browser.openInternal(url);
			}
			else if (type ==='oncology') {
				NavigatorParameters.setParameters({type:type});
				window[navigatorName].pushPage('./views/general/parking/parking-details.html');
			}
		}
	}
})();
