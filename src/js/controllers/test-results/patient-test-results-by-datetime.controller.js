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
	* @type {string}
	*/
	#language = "";

	#patientTestResults;
	#navigator;
	#$timeout;
	#$filter;

	/**
	 *
	 * @param {PatientTestResults} patientTestResults
	 * @param {NavigatorParameters} navigatorParameters
	 * @param {UserPreferences} userPreferences
	 * @param {$timeout} $timeout
	 * @param {$filter} $filter
	 */
	constructor(patientTestResults, navigatorParameters,
	            userPreferences, $timeout, $filter) {
		this.#patientTestResults = patientTestResults;
		this.#navigator = navigatorParameters.getNavigator();
		this.#language = userPreferences.getLanguage();
		this.#$filter = $filter;
		this.#$timeout = $timeout;
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
		// Mark cached test results by date as read
		this.results.forEach(resultByType => {
			if (resultByType.testExpressionSerNum === testTypeSerNum && resultByType.readStatus === 0)
				resultByType.readStatus = 1;
		});

		// Implicitly mark cached test results by type as read
		const testTypes = this.#patientTestResults.getTestTypes();
		testTypes.forEach(async resultByType => {
			if (resultByType.testExpressionSerNum === testTypeSerNum && resultByType.readStatus === false) {
				resultByType.readStatus = 1;
			}
		});

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
			this.loading = false;
			this.results = results??[];
		});
	}
}

PatientTestResultsByDatetimeController.$inject = ['PatientTestResults', 'NavigatorParameters', 'UserPreferences',
													'$timeout', '$filter'];
angular
	.module('MUHCApp')
	.controller('PatientTestResultsByDatetimeController', PatientTestResultsByDatetimeController);