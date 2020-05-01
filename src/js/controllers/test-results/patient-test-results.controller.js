/* @ngInject */
class PatientTestResultsController {
	static #SERVER_REFRESH_TIME = 60000;
	/**
	 * Array holding the patient test dates
	 * @type {Date[]}
	 */
	testDates = [];
	/**
	 * Search string for the test types
	 * @type {string} 
	 */
	searchTestTypeText = "";
	/**
	 * Loading variable for the loading bar in the view
	 * @type {boolean}
	 */
	loading = true;
	/**
	 * Whether the view should display the date list or the type list
	 * @type {boolean}
	 */
	showByDate = true;

	#patientTestResults;
	#$filter;
	#$timeout;
	#language;
	#newsBanner;
	navigator;

	/**
	 * Constructor for the PatientTestResultsController
	 * @param {PatientTestResults} patientTestResults  PatientTestResult service instance in angular
	 * @param {UserPreferences} userPreferences  UserPreferences service instance in angular
	 * @param {NewsBanner} newsBanner NewsBannerClass service instance in angular
	 * @param {NavigatorParameters} navigatorParameters NavigatorParameters service
	 * @param {$filter} $filter Angular $filter factory
	 * @param {$timeout} $timeout Angular $timeout factory
	 */
	constructor(patientTestResults, userPreferences,
		newsBanner, navigatorParameters,
		$filter, $timeout) {
		this.#patientTestResults = patientTestResults;
		this.#language = userPreferences.getLanguage();
		this.navigator = navigatorParameters.getNavigator();
		this.#newsBanner = newsBanner;
		this.#$filter = $filter;
		this.#$timeout = $timeout;
		this.#getTestResultsMetadata(this.#shouldFetchTestResultsFromServer())
			.then(this.#updateView)
			.catch(this.#handlerServerError);
	}

	/**
	 * Refreshes the patient test result metadata only if the last updated time is larger than
	 * {@link PatientTestResultsController.#SERVER_REFRESH_TIME}
	 */
	refresh() {
		// Only allowed to refresh once every 60s.
		if (this.#shouldFetchTestResultsFromServer()) {
			this.loading = true;
			this.#getTestResultsMetadata(true)
				.then(this.#updateView)
				.catch(this.#handlerServerError);
		} else this.#newsBanner.showCustomBanner(this.#$filter('translate')("REFRESH_WAIT"), '#333333', 
			'#F0F3F4', 13, 'top', null, 3000);
	}

	/**
	 * Function to go to the `test-results-by-datetime.html` view, passes the testDate for the view
	 * @param {Date} testDate Test date for the subsequent view
	 */
	goToTestDateResults(testDate) {
		this.navigator.pushPage(
			'./views/personal/test-results/test-results-by-datetime.html',
			{ testDate });
	}
	/**
	 * Function to go to the `test-results-by-type.html`view, passes the testTypeSerNum for the view
	 * @param {number} testTypeSerNum ExpressionSerNum for the given test type
	 */
	goToTestTypeResults(testTypeSerNum) {
		this.navigator.pushPage(
			'./views/personal/test-results/test-results-by-type.html',
			{ testTypeSerNum });
	}

	/**
	 * Returns whether to show the date list header in the view, 
	 * this is based on whether two consequent dates sorted in order have the same date of the year.
	 * @param {number} $index Current index in list
	 * @returns {boolean} Returns whether to show the date list header in the view
	 */
	showDateHeader($index) {
		if ($index === 0) return true;
		let [dateOne, dateTwo] = [this.testDates[$index], this.testDates[$index - 1]];
		return !(dateOne.getFullYear() === dateTwo.getFullYear()
			&& dateOne.getDate() === dateTwo.getDate() &&
			dateOne.getMonth() === dateTwo.getMonth());
	}
	/**
	 * Returns the display name in the right language for a given TestType.
	 * @param {TestType} type TestType 
	 */
	displayType(type) {
		return type[`name_${this.#language}`];
	}

	////////////////////////////////////////

	/**
	 * Returns whether or not to fetch test results from server 
	 * @returns {boolean} whether or not to fetch test results from server
	 */
	#shouldFetchTestResultsFromServer = () => {
		return Date.now() - this.#patientTestResults.getLastUpdated()
			> PatientTestResultsController.#SERVER_REFRESH_TIME;
	};

	/**
	 * Polls the {@link PatientTestResults} service for the testDates, and testTypes of the patient
	 */
	#getTestResultsMetadata = async (useServer) => {
		return [await this.#patientTestResults.getTestDates(useServer),
		await this.#patientTestResults.getTestTypes(useServer)];
	}

	/**
	 * Updates the view with the test dates and test types for the given patient.
	 * @param {[Dates[], TestType[]]} param0 testDates and testTypes for the view
	 */
	#updateView = ([testDates, testTypes]) => {
		this.#$timeout(() => {
			this.loading = false;
			this.testDates = testDates;
			this.testTypes = testTypes;
		});
	}
	/**
	 * Handles a response error from the server. Displays server error alert:
	 * At the time, Opal does not have a logging mechanism for errors.
	 */
	#handlerServerError = (error) => {
		// TODO(dherre3) Add logging of back-end error
		ons.notification.alert({
			//message: 'Server problem: could not fetch data, try again later',
			message: this.#$filter('translate')("SERVERERRORALERT"),
			modifier: (ons.platform.isAndroid()) ? 'material' : null
		});
	};
}

angular
	.module('MUHCApp')
	.controller('PatientTestResultsController', PatientTestResultsController);

PatientTestResultsController.$inject = ['PatientTestResults', 'UserPreferences', 'NewsBanner',
	'NavigatorParameters', '$filter', '$timeout'];
