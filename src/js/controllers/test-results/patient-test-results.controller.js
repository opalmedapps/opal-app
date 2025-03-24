(function () {
	'use strict';

	angular
		.module('MUHCApp')
		.controller('PatientTestResultsController', PatientTestResultsController);

	PatientTestResultsController.$inject = ['$filter','NavigatorParameters','PatientTestResults','UserPreferences'];

	function PatientTestResultsController($filter, NavigatorParameters, PatientTestResults, UserPreferences) {

		let vm = this;

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
		 * Whether the view should display the date list or the type list
		 * @type {boolean}
		 */
		vm.showByDate = true;

		let language;
		let navigator;

		vm.goToTestDateResults = goToTestDateResults;
		vm.goToTestTypeResults = goToTestTypeResults;
		vm.showDateHeader = showDateHeader;
		vm.displayType = displayType;
		vm.getTestClass = PatientTestResults.getTestClass;

		// Used by patient-data-handler
		vm.setTestsView = setTestsView;

		activate();

		//////////////////////////////////////////

		/************************************************
		 *  PRIVATE FUNCTIONS
		 ************************************************/

		function activate() {
			language = UserPreferences.getLanguage();
			navigator = NavigatorParameters.getNavigator();
		}

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
		 * @description Gets the test results from the service and uses them to update the view.
		 *              Results are sorted in reverse chronological order for dates, and alphabetical order for types.
		 */
		function setTestsView() {
			vm.testDates = PatientTestResults.getTestDates().sort((a, b) => b.getTime() - a.getTime()); // Newest first
			vm.testTypes = $filter('orderBy')(PatientTestResults.getTestTypes(), `name_${language}`);
		}
	}
})();
