/**
 * @file Controller for the main lab results list page.
 */
(function () {
	'use strict';

	angular
		.module('MUHCApp')
		.controller('PatientTestResultsController', PatientTestResultsController);

	PatientTestResultsController.$inject = ['$scope', '$filter','Navigator','PatientTestResults','UserPreferences'];

	function PatientTestResultsController($scope, $filter, Navigator, PatientTestResults, UserPreferences) {

		const vm = this;

		/**
		 * @description Array holding the patient test dates
		 * @type {Date[]}
		 */
		vm.testDates = [];

		/**
		 * @description Array holding the patient test types
		 * @type {PatientTestType[]}
		 */
		vm.testTypes = [];

		/**
		 * @description Search string for the test types
		 * @type {string}
		 */
		vm.searchTestTypeText = "";

		/**
		 * @description Whether the view should display the date list or the type list (tab selection)
		 * @type {boolean}
		 */
		vm.showByDate = true;

		vm.goToTestDateResults = goToTestDateResults;
		vm.goToTestTypeResults = goToTestTypeResults;
		vm.displayType = displayType;

		// Used by patient-data-handler
		vm.setTestsView = setTestsView;

		let language;
		let navigator;

		activate();

		//////////////////////////////////////////

		function activate() {
			language = UserPreferences.getLanguage();
			navigator = Navigator.getNavigator();
			bindEvents();
		}

		/**
		 * Function to go to the `test-results-by-datetime.html` view, passes the testDate for the view
		 * @param {Date} testDate Test date for the subsequent view
		 */
		function goToTestDateResults(testDate) {
			// Marks cached test dates as read (also implicitly marks as read testDates in the service)
			vm.testDates.forEach(testResult => {
				if (testResult.collectedDateTime === testDate && testResult.readStatus === '0')
					testResult.readStatus = '1';
			});

			navigator.pushPage(
				'./views/personal/test-results/test-results-by-datetime.html',
				{ testDate });
		}

		/**
		 * Function to go to the `test-results-by-type.html`view, passes the testTypeSerNum for the view
		 * @param {number} testTypeSerNum ExpressionSerNum for the given test type
		 */
		function goToTestTypeResults(testTypeSerNum) {
			// Mark cached test results by type as read (also implicitly marks as read testTypes in the service)
			vm.testTypes.forEach(testResult => {
				if (testResult.testExpressionSerNum === testTypeSerNum && testResult.readStatus === false) {
					testResult.readStatus = true;
				}
			});

			navigator.pushPage(
				'./views/personal/test-results/test-results-by-type.html',
				{ testTypeSerNum });
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
			vm.testDates = PatientTestResults.getTestDates().sort(
				(a, b) => b.collectedDateTime.getTime() - a.collectedDateTime.getTime()
			); // Newest first
			vm.testTypes = PatientTestResults.getTestTypes();
			vm.testTypes.sort((a, b) => a[`name_${language}`].localeCompare(b[`name_${language}`]));
		}

		function bindEvents() {
			// Remove event listeners
			$scope.$on('$destroy', () => navigator.off('prepop'));

			// Reload user profile if lab results were opened via Notifications tab,
			// and profile was implicitly changed.
			navigator.on('prepop', () => Navigator.reloadPreviousProfilePrepopHandler(
				'notifications.html',
				['PatientTestDates', 'PatientTestTypes'],
			));
		}
	}
})();
