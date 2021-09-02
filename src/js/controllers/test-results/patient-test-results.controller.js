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
	/**
	 * Can be used to toggle visibility of the content section without using the loading wheel.
	 * Used to force a refresh of the content.
	 * @type {boolean}
	 */
	showContent = true;
	/**
	 * Tracks whether the user has just refreshed the labs from the Type tab.
	 * If this is the case, the Date tab's display must be forced to update when next visiting it, or it stays blank.
	 * @type {boolean}
	 */
	#justRefreshedByType = false;

	#patientTestResults;
	#$filter;
	#$timeout;
	#language;
	#toast;
	navigator;

	/**
	 * Constructor for the PatientTestResultsController
	 * @param {PatientTestResults} patientTestResults  PatientTestResult service instance in angular
	 * @param {UserPreferences} userPreferences  UserPreferences service instance in angular
	 * @param {Toast} toast Toast service instance in angular
	 * @param {NavigatorParameters} navigatorParameters NavigatorParameters service
	 * @param {$filter} $filter Angular $filter factory
	 * @param {$timeout} $timeout Angular $timeout factory
	 */
	constructor(patientTestResults, userPreferences,
		toast, navigatorParameters,
		$filter, $timeout) {
		this.#patientTestResults = patientTestResults;
		this.#language = userPreferences.getLanguage();
		this.navigator = navigatorParameters.getNavigator();
		this.#toast = toast;
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
			if (!this.showByDate) this.#justRefreshedByType = true;
			this.#getTestResultsMetadata(true)
				.then(this.#updateView)
				.catch(this.#handlerServerError);
		} else this.#toast.showToast({
			message: this.#$filter('translate')("REFRESH_WAIT"),
		});
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

	/**
	 * Returns the class for a given test based on its criticality (see forwarded function for details)
	 */
	getTestClass(test) {
		return this.#patientTestResults.getTestClass(test);
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
	checkForRefresh() {
		if (this.showByDate && this.#justRefreshedByType) {
			this.#refreshDisplay();
			this.#justRefreshedByType = false;
		}
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
	};

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
	};

	/**
	 * @name refreshDisplay
	 * @author Stacey Beard
	 * @date 2021-05-19
	 * @desc Forces a refresh of the content displayed in the lab results view.
	 *       This is necessary after refreshing the lab results from the Type tab (after which the Date tab
	 *       breaks and becomes empty until this function is called).
	 */
	#refreshDisplay() {
		this.showContent = false;
		this.#$timeout(() => {
			this.showContent = true;
		});
	};

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

PatientTestResultsController.$inject = ['PatientTestResults', 'UserPreferences', 'Toast',
	'NavigatorParameters', '$filter', '$timeout'];
