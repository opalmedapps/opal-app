// SPDX-FileCopyrightText: Copyright (C) 2020 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/**
 * Class handlers to controller to show the test results by date
 */
class PatientTestResultsByDatetimeController {
	/**
	 * Variable controls the Test date on the top bar
	 * @type {Date}
	 */
	testDate = null;
	/**
	 * Array containing the test results for the given date
	 * @type {*[]}
	 */
	results = [];
	/**
	 * String to search through the date results
	 */
	searchText = "";
	/**
	 * Variable to control whether to show the loading screen on the controller
	 */
	loading = true;
	/**
	 * Variable containing current locale
	 */
	locale = "";

	#patientTestResults;
	#navigator;
	#$timeout;
	#$filter;
	#updateUI;
	#nativeNotification;

	/**
	 *
	 * @param {PatientTestResults} patientTestResults
	 * @param {Navigator} navigator
	 * @param {$timeout} $timeout
	 * @param {$filter} $filter
	 * @param {UpdateUI} updateUI update UI service
	 * @param {$locale} $locale
	 * @param {NativeNotification} nativeNotification NativeNotification service
	 */
	constructor(patientTestResults, navigator,
	            $timeout, $filter, updateUI, $locale, nativeNotification) {
		this.#patientTestResults = patientTestResults;
		this.#navigator = navigator.getNavigator();
		this.#$filter = $filter;
		this.#$timeout = $timeout;
		this.#updateUI = updateUI;
		this.locale = $locale.id;
		this.#nativeNotification = nativeNotification;
		this.#initialize(this.#navigator.getCurrentPage().options);
	}

	/**
	 * Returns the display group name for the current result, some results are under no group, in this case the string
	 * Other is used as group name
	 * @param {string} groupName Group name string
	 * @returns {string} Group name display string
	 */
	getDisplayedGroupName(groupName) {
		if (!groupName || groupName === "") return this.#$filter("translate")("OTHER");
		else return groupName;
	}

	/**
	 * Returns whether or not to show the group header in the view
	 * @param {string} $index in the test result
	 * @returns {boolean} Returns whether or not to show the group header in the view
	 */
	showGroupHeader($index){
		if($index === 0 ) return true;
		const testResultOne = this.results[$index].groupName;
		const testResultTwo = this.results[$index-1].groupName;
		return testResultOne !== testResultTwo;
	}
	/**
	 * Controls navigation into the `test-result-by-type` page, passes to the page a testTypeSerNum as parameter
	 * @param {number} testTypeSerNum Returns the testTypeSerNum (ExpressionSerNum) in the view
	 */
	goToTestTypeResults(testTypeSerNum) {
		this.#navigator.pushPage(
			'./views/personal/test-results/test-results-by-type.html',
			{testTypeSerNum});
	}

	////////////////////////////////////////////////////////////
	/**
	 * Initializes the controller, takes the testTypeSerNum (ExpressionSerNum) for the TestType from the
	 * navigator parameters, shows error upon failure
	 * @param {{Date}} testDate, obtains a test date for the patient
	 */
	#initialize = ({testDate = null}) => {
		if (testDate === null) this.#handleServerFetchError("Error: testDate parameter necessary for page");
		this.testDate = testDate;
		this.#patientTestResults.getTestResultsByDate(testDate).then((testResults) => {
			this.#updateView(testResults.results);
		}).catch(this.#handleServerFetchError);
	};
	/**
	 * Handles a response error from the server. Displays server error alert
	 * At the time, Opal does not have a logging mechanism for errors.
	 */
	#handleServerFetchError = (err) => {
		console.error(err);
		this.#updateView();
		this.#nativeNotification.showNotificationAlert(this.#$filter('translate')('SERVER_ERROR_ALERT'));
	};
	/**
	 * Updates the user view with the new server information for the date test results
	 * @param {*} results contains TestType results.
	 */
	#updateView=(results=null) =>{
		this.#$timeout(()=>{
			// Updates testTypes array in the patient-test-results service and in the patient-test-results view.
			// Since both arrays share the same reference, updating one will automatically update the other.
			// Once the arrays are updated, the UI will also be automatically updated (bolding on the "By Type" tab).
			// NOTE: this.#updateUI.updateTimestamps('PatientTestTypes', 0) will not work because it creates
			// an array with a new reference (e.g., setTestTypes function in the service), so the array in the view
			// won't be automatically updated.
			// NOTE: default UpdateUI update call (e.g., PatientTestResults.updateTestTypes) will return
			// only updated records that will result in incorrect readStatuses (the query in the listener
			// needs to aggregate the read statuses on all the testTypes labs, not just on the updated ones).
			// To reload all testTypes records from listener and update the existing array in the patient-test-results
			// service, set lastUpdated to 1 (e.g., updateTimestamps('PatientTestTypes', 1)).
			this.#updateUI.updateTimestamps('PatientTestTypes', 1);
			this.#updateUI.getData('PatientTestTypes');
			this.results = results??[];
			this.loading = false;
		});
	}
}

PatientTestResultsByDatetimeController.$inject = ['PatientTestResults', 'Navigator',
													'$timeout', '$filter', 'UpdateUI', '$locale', 'NativeNotification'];
angular
	.module('OpalApp')
	.controller('PatientTestResultsByDatetimeController', PatientTestResultsByDatetimeController);
