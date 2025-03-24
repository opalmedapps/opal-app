//
// Author: David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
(()=>{
	angular.module("MUHCApp")
		.controller("InitSettingsController", InitSettingsController);

	InitSettingsController.$inject = [
		'Firebase', 'Navigator', 'UserPreferences', 'Constants', '$rootScope'
	];

	/* @ngInject */
	function InitSettingsController(Firebase, Navigator, UserPreferences, Constants, $rootScope) {

		let vm = this;
		let navigator;

		vm.changeLanguage = changeLanguage;
		vm.openPageLegal = openPageLegal;
		vm.goToFeedback = goToFeedback;
		vm.secureYourDeviceNotice = secureYourDeviceNotice;

		activate();

		/////////////////////////

		function activate() {
			navigator = Navigator.getNavigator();
			vm.navigatorName = Navigator.getNavigatorName();

			initSettings();
		}

		function initSettings() {
			vm.authenticated = !!Firebase.getCurrentUser();
			vm.languageSwitch = (UserPreferences.getLanguage().toUpperCase() !== 'EN');
			vm.currentYear = new Date().getFullYear();
			vm.APP_VERSION = Constants.version();
			vm.APP_BUILD_NUMBER = Constants.build();
		}

		function changeLanguage(value) {

			if (value) {
				UserPreferences.setLanguage('FR');
			} else {
				UserPreferences.setLanguage('EN');
			}
		}

		function goToFeedback() {
			navigator.pushPage('views/general/feedback/feedback.html', {contentType: 'general'});
		}

		function secureYourDeviceNotice() {
			$rootScope.contentType = 'secureyourdevice';
			navigator.pushPage('./views/templates/content.html', {contentType: 'secureyourdevice'});
		}

		function openPageLegal(type) {
			if (type.toLowerCase() === 'tou') {
				$rootScope.contentType = 'tou';
				navigator.pushPage('./views/templates/content.html', {contentType: 'tou'});
			} else if (type.toLowerCase() === 'serviceagreement') {
				$rootScope.contentType = 'serviceagreement';
				navigator.pushPage('./views/templates/content.html', {contentType: 'serviceagreement'});
			} else if (type.toLowerCase() === 'privacypolicy') {
				$rootScope.contentType = 'privacypolicy';
				navigator.pushPage('./views/templates/content.html', {contentType: 'privacypolicy'});
			}
		}
	}
})();
