(function () {
	'use strict';

	angular
		.module('MUHCApp')
		.controller('PatientTestResultsController', PatientTestResultsController);

	PatientTestResultsController.$inject = ['PatientTestResults', 'UserPreferences', 'Toast',
		'NavigatorParameters', '$filter', '$timeout'];

	function PatientTestResultsController(PatientTestResults, UserPreferences, Toast, NavigatorParameters, $filter, $timeout) {

		let vm = this;

		// TODO move?
		const SERVER_REFRESH_TIME = 60000;
		/**
		 * Array holding the patient test dates
		 * @type {Date[]}
		 */
		vm.testDates = [];
		/**
		 * Search string for the test types
		 * @type {string}
		 */
		vm.searchTestTypeText = "";
		/**
		 * Loading variable for the loading bar in the view
		 * @type {boolean}
		 */
		vm.loading = true; // DELETE
		/**
		 * Whether the view should display the date list or the type list
		 * @type {boolean}
		 */
		vm.showByDate = true;
		/**
		 * Can be used to toggle visibility of the content section without using the loading wheel.
		 * Used to force a refresh of the content.
		 * @type {boolean}
		 */
		vm.showContent = true;
		/**
		 * Tracks whether the user has just refreshed the labs from the Type tab.
		 * If this is the case, the Date tab's display must be forced to update when next visiting it, or it stays blank.
		 * @type {boolean}
		 */
		let justRefreshedByType = false;
		/**
		 * @description Tracks whether the user is currently being shown a warning that the labs can't be refreshed this soon.
		 *              Prevents the user from enqueuing a lot of duplicate messages in the Toast service.
		 * @type {boolean}
		 */
		let refreshWarningIsShowing = false;

		let language;
		let navigator;

		vm.goToTestDateResults = goToTestDateResults
		vm.goToTestTypeResults = goToTestTypeResults
		vm.showDateHeader = showDateHeader
		vm.displayType = displayType
		vm.getTestClass = getTestClass
		vm.checkForRefresh = checkForRefresh
		vm.updateViewFromService = updateViewFromService
		vm.shouldFetchTestResultsFromServer = shouldFetchTestResultsFromServer
		vm.getTestResultsMetadata = getTestResultsMetadata
		vm.updateView = updateView
		vm.refreshDisplay = refreshDisplay
		vm.handlerServerError = handlerServerError

		activate();

		//////////////////////////////////////////

		/************************************************
		 *  PRIVATE FUNCTIONS
		 ************************************************/

		function activate() {
			language = UserPreferences.getLanguage();
			navigator = NavigatorParameters.getNavigator();
			// getTestResultsMetadata(this.#shouldFetchTestResultsFromServer())
			// 	.then(this.#updateView)
			// 	.catch(this.#handlerServerError);
		}

		/**
		 * Refreshes the patient test result metadata only if the last updated time is larger than SERVER_REFRESH_TIME
		 */
		// refresh() {
		// 	// Only allowed to refresh once every 60s.
		// 	if (this.#shouldFetchTestResultsFromServer()) {
		// 		this.loading = true;
		// 		if (!this.showByDate) this.#justRefreshedByType = true;
		// 		this.getTestResultsMetadata(true)
		// 			.then(this.#updateView)
		// 			.catch(this.#handlerServerError);
		// 	}
		// 	// Use a variable to prevent new refresh warnings from being added to the toast queue if one is already showing
		// 	else if (!this.#refreshWarningIsShowing) {
		// 		this.#refreshWarningIsShowing = true;
		// 		this.#toast.showToast({
		// 			message: this.#$filter('translate')("REFRESH_WAIT"),
		// 			position: "bottom",
		// 			callback: () => {
		// 				this.#refreshWarningIsShowing = false;
		// 			}
		// 		});
		// 	}
		// }
		/**
		 * Function to go to the `test-results-by-datetime.html` view, passes the testDate for the view
		 * @param {Date} testDate Test date for the subsequent view
		 */
		function goToTestDateResults(testDate) {
			navigator.pushPage(
				'./views/personal/test-results/test-results-by-datetime.html',
				{ testDate });
		}
		/**
		 * Function to go to the `test-results-by-type.html`view, passes the testTypeSerNum for the view
		 * @param {number} testTypeSerNum ExpressionSerNum for the given test type
		 */
		function goToTestTypeResults(testTypeSerNum) {
			navigator.pushPage(
				'./views/personal/test-results/test-results-by-type.html',
				{ testTypeSerNum });
		}

		/**
		 * Returns whether to show the date list header in the view,
		 * this is based on whether two consequent dates sorted in order have the same date of the year.
		 * @param {number} $index Current index in list
		 * @returns {boolean} Returns whether to show the date list header in the view
		 */
		function showDateHeader($index) {
			if ($index === 0) return true;
			let [dateOne, dateTwo] = [vm.testDates[$index], vm.testDates[$index - 1]];
			return !(dateOne.getFullYear() === dateTwo.getFullYear()
				&& dateOne.getDate() === dateTwo.getDate() &&
				dateOne.getMonth() === dateTwo.getMonth());
		}
		/**
		 * Returns the display name in the right language for a given TestType.
		 * @param {PatientTestType} type TestType
		 */
		function displayType(type) {
			return type[`name_${language}`];
		}

		/**
		 * Returns the class for a given test based on its criticality (see forwarded function for details)
		 */
		function getTestClass(test) {
			return PatientTestResults.getTestClass(test);
		}

		/**
		 * @name checkForRefresh
		 * @author Stacey Beard
		 * @date 2021-05-19
		 * @desc Checks whether a refresh of the display is required.
		 *       The display must be refreshed on the Date tab after the lab data was refreshed from the Type tab
		 *       (otherwise, the Date tab stays blank).
		 *       However, it does not need to be refreshed after the lab data was refreshed from the Date tab (no issues).
		 */
		function checkForRefresh() {
			if (vm.showByDate && justRefreshedByType) {
				refreshDisplay();
				justRefreshedByType = false;
			}
		}

		/**
		 * @description Gets the test results from the service and uses them to update the view.
		 */
		function updateViewFromService() {
			console.log("Called updateViewFromService");
			//this.#updateView(...this.#getTestResultsMetadata(false));

			vm.testDates = PatientTestResults.getTestDates();
			vm.testTypes = PatientTestResults.getTestTypes();
			console.log(vm.testDates);
			console.log(vm.testTypes);
		}

		////////////////////////////////////////

		/**
		 * Returns whether or not to fetch test results from server
		 * @returns {boolean} whether or not to fetch test results from server
		 */
		function shouldFetchTestResultsFromServer() {
			return Date.now() - PatientTestResults.getLastUpdated() > SERVER_REFRESH_TIME;
		}

		/**
		 * Polls the {@link PatientTestResults} service for the testDates, and testTypes of the patient
		 */
		async function getTestResultsMetadata() {
			return [PatientTestResults.getTestDates(), PatientTestResults.getTestTypes()];
		}

		/**
		 * Updates the view with the test dates and test types for the given patient.
		 * @param {[Date[], PatientTestType[]]} param0 testDates and testTypes for the view
		 */
		function updateView([testDates, testTypes]) {
			$timeout(() => {
				vm.loading = false;
				vm.testDates = testDates;
				vm.testTypes = testTypes;
			});
		}

		/**
		 * @name refreshDisplay
		 * @author Stacey Beard
		 * @date 2021-05-19
		 * @desc Forces a refresh of the content displayed in the lab results view.
		 *       This is necessary after refreshing the lab results from the Type tab (after which the Date tab
		 *       breaks and becomes empty until this function is called).
		 */
		function refreshDisplay() {
			vm.showContent = false;
			$timeout(() => {
				vm.showContent = true;
			});
		}

		/**
		 * Handles a response error from the server. Displays server error alert:
		 * At the time, Opal does not have a logging mechanism for errors.
		 */
		function handlerServerError () {
			// TODO(dherre3) Add logging of back-end error
			ons.notification.alert({
				//message: 'Server problem: could not fetch data, try again later',
				message: $filter('translate')("SERVERERRORALERT"),
				modifier: (ons.platform.isAndroid()) ? 'material' : null
			});
		}
	}
})();
