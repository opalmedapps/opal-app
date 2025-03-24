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
		'Navigator',
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
		Navigator,
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
		vm.CONFIG = CONFIG;
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

		async function activate() {
			//Initialize language if not initialized
			UserPreferences.initializeLanguage();

			try {
				await DynamicContent.ensureInitialized();
				// Read the Service Status Message from the serviceStatusURL hosted on the external server.
				const response = await DynamicContent.loadFromURL(CONFIG.settings.serviceStatusURL);

				// Save the Service Status
				const lang = UserPreferences.getLanguage().toLowerCase();
				const { message = '', title } = response?.data?.[lang] || {};

				if (message !== '') {
					$timeout(() => {
						vm.globalMessage = title;
						vm.globalMessageDescription = message;
					});
				}
			} catch (error) {
				// TODO: ERROR_INIT_LINKS is not translated
				if (error.code === "INIT_ERROR") Toast.showToast({
					message: $filter('translate')("ERROR_INIT_LINKS"),
				});
				else console.error("Error initializing the service status using DynamicContent:", error);
			}

			//Add the login translation
			$translatePartialLoader.addPart('login');

			//Initialize hospital chosen if not initialized
			UserHospitalPreferences.initializeHospital();

			//Do not show the list breaking, equivalent of ng-cloak for angularjs, LOOK IT UP!!! https://docs.angularjs.org/api/ng/directive/ngCloak
			setTimeout(function () {
				$("#listInitApp").css({display: 'block'});
				Navigator.setNavigator(initNavigator);
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
							durationWordsPerMinute: 80, // Slow down the service status message
							positionOffset: 30,
						});
						vm.hasShownMessageOfTheDay = true;
					}
				}
			}, Constants.app ? 5000 : 0); // Add a delay on mobile equivalent to length of SplashScreenDelay to ensure message is not hidden by splash screen
		}

		/**
		 * Go to Learn About Opal
		 */
		function gotoLearnAboutOpal() {
			initNavigator.pushPage('./views/home/about/about.html', {'isBeforeLogin': true});
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
			initNavigator.pushPage('./views/init/init-settings.html');
		}

		/**
		 * Go to Acknowledgements
		 */
		function goToAcknowledgements() {
			initNavigator.pushPage(
				'./views/templates/content.html',
				{contentType: 'acknowledgements', title: 'ACKNOWLEDGEMENTS'}
			);
		}

		/**
		 * Go to login page
		 */
		function goToLogin() {
			initNavigator.pushPage('./views/login/login.html', {animation: 'lift'});
		}
	}
})();
