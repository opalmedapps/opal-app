//
// Author: David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
(()=>{
	angular.module('OpalApp')
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
			navigator.pushPage(
				'./views/templates/content.html',
				{contentType: 'secureYourDevice', title: 'SECURE_YOUR_DEVICE'},
			);
		}

		function openPageLegal(type) {
			if (type === 'termsOfUse') {
				navigator.pushPage(
					'./views/templates/content.html',
					{contentType: 'termsOfUse', title: 'TERMS_OF_USE'}
				);
			} else if (type === 'serviceAgreement') {
				navigator.pushPage(
					'./views/templates/content.html',
					{contentType: 'serviceAgreement', title: 'SERVICE_AGREEMENT'},
				);
			}
		}
	}
})();
