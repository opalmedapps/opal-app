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

	/**
	* @type {string}
	*/
	#language = "";

	#patientTestResults;
	#navigator;
	#$timeout;
	#$filter;
	#updateUI;

	/**
	 *
	 * @param {PatientTestResults} patientTestResults
	 * @param {Navigator} navigator
	 * @param {UserPreferences} userPreferences
	 * @param {$timeout} $timeout
	 * @param {$filter} $filter
	 * @param {UpdateUI} updateUI update UI service
	 * @param {$locale} $locale
	 */
	constructor(patientTestResults, navigator,
	            userPreferences, $timeout, $filter, updateUI, $locale) {
		this.#patientTestResults = patientTestResults;
		this.#navigator = navigator.getNavigator();
		this.#language = userPreferences.getLanguage();
		this.#$filter = $filter;
		this.#$timeout = $timeout;
		this.#updateUI = updateUI;
		this.locale = $locale.id;
		this.#initialize(this.#navigator.getCurrentPage().options);
	}


	/**
	 * Returns the test name in the preferred patient language
	 * @param {*} testResult Result for given test type
	 * @returns {string} Returns test name
	 */
	getTestName(testResult) {
		return testResult[`name_${this.#language}`];
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
		// TODO: (dherre3) logging of the error
		this.#updateView();
		ons.notification.alert({
			//message: 'Server problem: could not fetch data, try again later',
			message: this.#$filter('translate')("SERVERERRORALERT"),
			modifier: (ons.platform.isAndroid()) ? 'material' : null
		});
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

PatientTestResultsByDatetimeController.$inject = ['PatientTestResults', 'Navigator', 'UserPreferences',
													'$timeout', '$filter', 'UpdateUI', '$locale'];
angular
	.module('OpalApp')
	.controller('PatientTestResultsByDatetimeController', PatientTestResultsByDatetimeController);
