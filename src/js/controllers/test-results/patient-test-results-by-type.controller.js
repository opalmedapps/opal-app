// SPDX-FileCopyrightText: Copyright (C) 2020 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

class PatientTestResultsByTypeController {
	/**
	 * @type {string}
	 */
	#fontSize;
	/**
	 * @type {TestType}
	 */
	test = {};
	/**
	 * Loading variable to toggle loading in the view
	 * @type {boolean}
	 */
	loading = true;
	/**
	 * Settings for the lab results chart
	 * @type {*}
	 */
	chartSettings = {};
	/**
	 * Variable to control whether to show the table view or the chart view
	 */
	showChartTab = true;

	#patientTestResults;
	#navigator;
	#$timeout;
	#$filter;
	#browser;
	#profileSelector;
	#updateUI;


	/**
	 * Class constructor for controller
	 * @param {PatientTestResults} patientTestResults
	 * @param {UserPreferences} userPreferences
	 * @param {Navigator} navigator
	 * @param {$filter} $filter Angular filter
	 * @param {$timeout} $timeout Angular module
	 * @param {Browser} browser Browser service
	 * @param {ProfileSelector} profileSelector profile selector service
	 * @param {UpdateUI} updateUI update UI service
	 */
	constructor(patientTestResults, userPreferences, navigator, $filter,
		$timeout, browser, profileSelector, updateUI) {
		this.#patientTestResults = patientTestResults;
		this.#fontSize = userPreferences.getFontSize();
		this.#navigator = navigator.getNavigator();
		this.#$timeout = $timeout;
		this.#$filter = $filter;
		this.#browser = browser;
		this.#profileSelector = profileSelector;
		this.#updateUI = updateUI;
		this.#initialize(this.#navigator.getCurrentPage().options);
	}

	/**
	 * Displays disclaimer modal for out-of-app links
	 */
	showAboutTestAlert() {
		// TODO(dherre3) Centralize modals of this kind, create factory to manage all modals.
		disclaimerModal.show();
	}

	showLabDelayInfo() {
		this.#navigator.pushPage('./views/personal/test-results/test-results-info-labdelay.html');
	}

	/**
	 * Routing to EducationalMaterialURL for the test type
	 */
	goToUrl() {
		let url = this.test.educationalMaterialURL;
		this.#browser.openInternal(url);
	}

	////////////////////////////////////////////////////

	/**
	 * Initializes the controller, takes the testTypeSerNum (ExpressionSerNum) for the TestType from the
	 * navigator parameters, shows error upon failure
	 * @param {number} testTypeSerNum
	 */
	#initialize = ({ testTypeSerNum }) => {
		if (!testTypeSerNum) this.#handlerServerError(
			`No test type provided to initialize ${PatientTestResultsByTypeController.toString()}`);
		this.#patientTestResults.getTestResultsByType(testTypeSerNum)
			.then((results) => {
				this.#updateView(results);
			}).catch(this.#handlerServerError);
	};

	/**
	 * Configures the timeline results chart
	 */
	#configureChart = (test) => {
		// Non-numeric tests are not plotted (no data or axis label)
		const data = (test.hasNumericValues) ?
			{
				x: test.results.map((testResult) => testResult.collectedDateTime),
				y: test.results.map((testResult) => testResult.testValue),
			} : [];
		const yAxisLabel = test.hasNumericValues ? test.unitWithBrackets : "";
		this.chartSettings = {
			data: data,
			yAxisLabel: yAxisLabel,
			hasNonNumericValues: test.results && test.results.length > 0 && !test.hasNumericValues,
			normalRangeMax: test.results.normalRangeMin,
			normalRangeMin: test.results.normalRangeMax
		};
	};

	/**
	 * Updates the user view with the new server information for the TestType
	 * @param {TestType} testType contains TestType results.
	 */
	#updateView = (results = null) => {
		this.#$timeout(() => {
			this.loading = false;
			if (results) {
				this.test = results;

				// Updates testDates array in the patient-test-results service and in the patient-test-results view.
				// Since both arrays share the same reference, updating one will automatically update the other.
				// Once the arrays are updated, the UI will also be automatically updated (bolding on "By Date" tab).
				// NOTE: this.#updateUI.updateTimestamps('PatientTestDates', 0) will not work because it creates
				// an array with a new reference (e.g., setTestDates function in the service), so the array in the view
				// won't be automatically updated.
				// NOTE: default UpdateUI update call (e.g., PatientTestResults.updateTestDates) will return
				// only updated records that will result in incorrect readStatuses (the query in the listener
				// needs to aggregate the read statuses on all the testDates labs, not just on the updated ones).
				// To reload all testDates records from listener and update the existing array in the patient-test-results
				// service, set lastUpdated to 1 (e.g., updateTimestamps('PatientTestDates', 1)).
				this.#updateUI.updateTimestamps('PatientTestDates', 1);
				this.#updateUI.getData('PatientTestDates');

				let nonInterpretableDelay = this.#profileSelector.getActiveProfile().non_interpretable_lab_result_delay;
				let interpretableDelay = this.#profileSelector.getActiveProfile().interpretable_lab_result_delay;

				this.labDelay = this.test.interpretationRecommended ? nonInterpretableDelay : interpretableDelay;

				this.showChartTab = results.hasNumericValues;
				this.#configureChart(this.test);
			}
		});
	}
	/**
	 * Handles a response error from the server. Displays server error alert
	 * At the time, Opal does not have a logging mechanism for errors.
	 */
	#handlerServerError = (error) => {
		// TODO(dherre3) Add logging of error here
		this.loading = false;
		ons.notification.alert({
			//message: 'Server problem: could not fetch data, try again later',
			message: this.#$filter('translate')("SERVER_ERROR_ALERT"),
			modifier: (ons.platform.isAndroid()) ? 'material' : null
		});
	};

	/**
	 * Returns style declaration for the global fontSize of the app in pixels
	 * @returns {CSSStyleDeclaration} returns style declaration for the global fontSize of the app in pixels
	 */
	#getAppFontSizeInPixels = () => {
		// TODO(dherre3) This should be managed by JavaScript in the user account service
		const elem = document.querySelector(`.fontDesc${this.#$filter("capitalize")(this.#fontSize)}`);
		return getComputedStyle(elem).fontSize;
	};
}

angular
	.module('OpalApp')
	.controller('PatientTestResultsByTypeController', PatientTestResultsByTypeController);

PatientTestResultsByTypeController.$inject = ['PatientTestResults', 'UserPreferences',
	'Navigator', '$filter', '$timeout', 'Browser', 'ProfileSelector', 'UpdateUI'];
