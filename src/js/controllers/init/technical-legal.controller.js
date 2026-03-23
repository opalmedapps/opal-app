// SPDX-FileCopyrightText: Copyright (C) 2020 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

//
// Author: David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
(()=>{
	angular.module('OpalApp')
		.controller("TechnicalLegalController", TechnicalLegalController);

	TechnicalLegalController.$inject = [
		'Browser', 'Constants', 'DynamicContent', 'Firebase', 'Navigator', 'UserPreferences'
	];

	/* @ngInject */
	function TechnicalLegalController(Browser, Constants, DynamicContent, Firebase, Navigator, UserPreferences) {

		let vm = this;
		let navigator;

		vm.goToFeedback = goToFeedback;
		vm.goToLicense = () => navigator.pushPage('views/init/license.html');
		vm.goToThirdParty = () => navigator.pushPage('views/init/third-party.html');
		vm.openPageLegal = openPageLegal;
		vm.openSecurityAndPrivacy = () => Browser.openInternal(DynamicContent.getURL('securityAndPrivacy'));
		vm.openSourceLink = () => Browser.openExternal(DynamicContent.getURL('openSource'));

		activate();

		/////////////////////////

		function activate() {
			navigator = Navigator.getNavigator();
			vm.navigatorName = Navigator.getNavigatorName();

			vm.authenticated = !!Firebase.getCurrentUser();
			vm.currentYear = new Date().getFullYear();
			vm.APP_VERSION = Constants.version();
			vm.APP_BUILD_NUMBER = Constants.build();
		}

		function goToFeedback() {
			navigator.pushPage('views/general/feedback/feedback.html', {contentType: 'general'});
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
