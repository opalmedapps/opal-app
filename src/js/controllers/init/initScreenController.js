/*
 * Filename     :   initScreenController.js
 * Description  :   Manages app initialization
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   28 Apr 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */

import '../../../css/views/init-page.view.css';

(function () {
	'use strict';

	angular
		.module('MUHCApp')
		.controller('InitScreenController', InitScreenController);

	InitScreenController.$inject = [
		'AppState',
		'NavigatorParameters',
		'$translatePartialLoader',
		'UserPreferences',
		'$filter',
		'Constants',
		'DynamicContent',
		'Toast',
		'Params',
		'UserHospitalPreferences',
		'Browser',
		'$timeout'
	];

	/* @ngInject */
	function InitScreenController(
		AppState,
		NavigatorParameters,
		$translatePartialLoader,
		UserPreferences,
		$filter,
		Constants,
		DynamicContent,
		Toast,
		Params,
		UserHospitalPreferences,
		Browser,
		$timeout
	) {
		var vm = this;
		vm.globalMessage = '';
		vm.globalMessageDescription = '';
		vm.hasShownMessageOfTheDay = false;
		vm.OPAL_CONFIG = OPAL_CONFIG;
		vm.APP_VERSION = Constants.version();
		vm.APP_BUILD_NUMBER = Constants.build();

		vm.gotoLearnAboutOpal = gotoLearnAboutOpal;
		vm.goToRegister = goToRegister;
		vm.goToGeneralSettings = goToGeneralSettings;
		vm.goToAcknowledgements = goToAcknowledgements;
		vm.goToLogin = goToLogin;
		vm.showMessageOfTheDay = showMessageOfTheDay;

		activate();

		////////////////

		function activate() {

			DynamicContent.ensureInitialized().then(() => {
				// Read the Message Of The Day from [dev|qa|staging|preprod|prod|etc.]_serviceStatus_[EN|FR].php on depDocs
				return DynamicContent.getPageContent(OPAL_CONFIG.settings.messageOfTheDayKey);

			}).then(response => {
				// Save the Message Of The Day
				if (typeof response.data === "object") for (let key in response.data) {
					if (response.data[key] !== "") {
						$timeout(() => {
							vm.globalMessage = key;
							vm.globalMessageDescription = response.data[key];
						});
						break;
					}
				}
			}).catch(err => {
				if (err.code === "INIT_ERROR") Toast.showToast({
					message: $filter('translate')("ERROR_INIT_LINKS"),
				});
				else if (err.code === "NO_PAGE_CONTENT") console.warn(`No message of the day set up for environment "${OPAL_CONFIG.env}"`);
				else console.error("Error initializing the message of the day using DynamicContent:", err);
			});

			//Add the login translation
			$translatePartialLoader.addPart('login');

			//Initialize language if not initialized
			UserPreferences.initializeLanguage();

			//Initialize hospital chosen if not initialized
			UserHospitalPreferences.initializeHospital();

			//Do not show the list breaking, equivalent of ng-cloak for angularjs, LOOK IT UP!!! https://docs.angularjs.org/api/ng/directive/ngCloak
			setTimeout(function () {
				$("#listInitApp").css({display: 'block'});
				NavigatorParameters.setNavigator(initNavigator);
				initNavigator.on('prepush', function (event) {
					if (initNavigator._doorLock.isLocked()) {
						event.cancel();
					}
				});
			}, 10);

			AppState.setInitialized(true);
		}

		function showMessageOfTheDay() {
			$timeout(function () {
				if (vm.globalMessageDescription !== '') {
					if (!vm.hasShownMessageOfTheDay) {
						Toast.showToast({
							message: vm.globalMessage + "\n" + vm.globalMessageDescription,
							fontSize: 18,
							durationWordsPerMinute: 80, // Slow down the message of the day
							positionOffset: 30,
						});
						vm.hasShownMessageOfTheDay = true;
					}
				}
			}, 5000); // Add a delay equivalent to SplashScreenDelay to ensure message is not hidden by splash screen
		}

		/**
		 * Go to Learn About Opal
		 */
		function gotoLearnAboutOpal() {
			NavigatorParameters.setParameters({'Navigator': 'initNavigator', 'isBeforeLogin': true});
			initNavigator.pushPage('./views/home/about/about.html');
		}

		/**
		 * Go to registration page
		 */
		function goToRegister() {
			const url = DynamicContent.getURL("registration");
			Browser.openInternal(url);
		}

		/**
		 * Go to general settings (About)
		 */
		function goToGeneralSettings() {
			NavigatorParameters.setParameters({'Navigator': 'initNavigator'});
			initNavigator.pushPage('./views/init/init-settings.html');
		}

		/**
		 * Go to Acknowledgements
		 */
		function goToAcknowledgements() {
			initNavigator.pushPage('./views/templates/content.html', {contentType: 'acknowledgements'});
		}

		/**
		 * Go to login page
		 */
		function goToLogin() {
			initNavigator.pushPage('./views/login/login.html', {animation: 'lift'});
		}
	}
})();
