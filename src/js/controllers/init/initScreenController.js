/*
 * Filename     :   initScreenController.js
 * Description  :   Manages app initialization
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   28 Apr 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */

(function () {
	'use strict';

	angular
		.module('MUHCApp')
		.controller('InitScreenController', InitScreenController);

	InitScreenController.$inject = [
		'NavigatorParameters',
		'$translatePartialLoader',
		'UserPreferences',
		'$filter',
		'Constants',
		'Permissions',
		'DynamicContentService',
		'NewsBanner',
		'Params',
		'UserHospitalPreferences',
		'Browser'
	];

	/* @ngInject */
	function InitScreenController(
		NavigatorParameters,
		$translatePartialLoader,
		UserPreferences,
		$filter,
		Constants,
		Permissions,
		DynamicContentService,
		NewsBanner,
		Params,
		UserHospitalPreferences,
		Browser
	) {
		var vm = this;
		vm.globalMessage = '';
		vm.globalMessageDescription = '';
		vm.firstTime = true;
		vm.APP_NAME = OPAL_CONFIG.name;
		vm.APP_VERSION = Constants.version();
		vm.OPAL_ENV = OPAL_CONFIG.env;
		vm.APP_BUILD_NUMBER = Constants.build();

		vm.gotoLearnAboutOpal = gotoLearnAboutOpal;
		vm.goToRegister = goToRegister;
		vm.goToGeneralSettings = goToGeneralSettings;
		vm.goToPatientCharter = goToPatientCharter;
		vm.goToAcknowledgements = goToAcknowledgements;
		vm.reportBugs = reportBugs;
		vm.goToLogin = goToLogin;
		vm.showMessageOfTheDay = showMessageOfTheDay;

		activate();

		////////////////

		function activate() {

			// Initialize the service message to all users (links.php)
			DynamicContentService.initializeLinks()
				.then(function (response) {
					if (!response.exists) {
						DynamicContentService.setContentData(response.data);
					}

					// This line reads the Message Of The Day from [staging|preprod|prod]_serviceStatus_[EN|FR].php on depDocs
					// '[staging|preprod|prod]_service' in links.php will grab the url (location) of
					// [staging|preprod|prod]_serviceStatus_[EN|FR].php
					return DynamicContentService.getPageContent(`${vm.OPAL_ENV}_service`);
				})
				.then(function successCallback(response) {
					for (var key in response.data) {
						if (response.data[key] !== "") {
							vm.globalMessage = key;
							vm.globalMessageDescription = response.data[key];
							break;
						}
					}
				})
				.catch(function errorCallback(error) {
					console.log("Error initializing links using the DynamicContentService.", error);
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

			// Get location permission
			Permissions.enablePermission('ACCESS_FINE_LOCATION').catch(console.error);
		}

		function showMessageOfTheDay() {
			if (vm.globalMessageDescription !== '') {
				if (vm.firstTime) {
					vm.firstTime = false;
					NewsBanner.showCustomBanner(vm.globalMessage + "\n" + vm.globalMessageDescription,'#333333', 
						'#F0F3F4', 25, 'top', function(){}, 'long');
				}
			}
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
			Browser.openInternal(Params.registrationPage);
		}

		/**
		 * Go to general settings (About)
		 */
		function goToGeneralSettings() {
			NavigatorParameters.setParameters({'Navigator': 'initNavigator'});
			initNavigator.pushPage('./views/init/init-settings.html');
		}

		/**
		 * Go to patient charter
		 */
		function goToPatientCharter() {
			initNavigator.pushPage('./views/templates/content.html', {contentType: 'patient_charter'});
		}

		/**
		 * Go to Acknowledgements
		 */
		function goToAcknowledgements() {
			initNavigator.pushPage('./views/templates/content.html', {contentType: 'acknowledgements'});
		}


		/**
		 * Report issues function
		 */
		function reportIssuesMail() {
			if (Constants.app) {
				var email = {
					to: 'opal@muhc.mcgill.ca',
					cc: '',
					bcc: [],
					subject: $filter("translate")("OPALPROBLEMSUBJECT"),
					body: '',
					isHtml: true
				};
				cordova.plugins.email.isAvailable(function (isAvailable) {
					if (isAvailable) {
						cordova.plugins.email.open(email, function (sent) {

						}, this);
					} else {
						alert("Not able to send emails currently.")
					}
				});
			}
		}

		/**
		 * Report bugs function
		 */
		function reportBugs() {
			initNavigator.pushPage('./views/general/bugreport/bugreport.html');
		}

		/**
		 * Go to login page
		 */
		function goToLogin() {
			initNavigator.pushPage('./views/login/login.html', {animation: 'lift'});
		}

	}

})();