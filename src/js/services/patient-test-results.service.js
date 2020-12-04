import { PatientTestType } from "./../models/personal/test-results/PatientTestType";
/**
 * PatienTest class serves as a model for the PatientTest module of the app.
 */
class PatientTestResults {
	/**
	 * @type {number} Timestamp for the last update on types
	 */
	#testTypesLastUpdated = 0;
	/**
	 * @type {number} Timestamp for the last update on dates
	 */
	#testDatesLastUpdated = 0;
	/**
	 * Cache of test types for the patient
	 * @type {PatientTestType[]}
	 */
	testTypes = [];
	/**
	 * Cache of test dates for the patient
	 * @type {Date[]}
	 */
	testDates = [];
	/**
	 * Cache of test results by date, it contains test results up to the {@link #lastUpdated}
	 * @type {Record<string,*>} testResultsByDate contains map from string date to list of group types in that date
	 */
	testResultsByDate = {};
	/**
	 * Cache of test results by type, it contains test results up to the {@link #lastUpdated}
	 * @type {Record<string, PatientTestType>} testResultsByDate contains map from string date to list of type test results
	 *                            in that date
	 */
	testResultsByType = {};
	/**
	 * RequestToServer instance
	 */
	#requestToServer;

	/**
	 * Constructor for the PatientTestResults service
	 * @param {RequestToServer} requestToServer factory to perform request to server
	 */
	constructor(requestToServer) {
		this.#requestToServer = requestToServer;
	}

	/**
	 * Returns list of test types for the patient
	 * @param {Boolean} useServer Decides whether the testTypes should be fetched from the server
	 * @returns {Promise<PatientTestType[]>} Upon full-filling promise it returns list of test types for the patient
	 */
	async getTestTypes(useServer = true) {
		if (useServer) {
			let results = await this.#requestToServer.sendRequestWithResponse("PatientTestTypes");
			this.#testTypesLastUpdated = Date.now();
			this.testTypes = results.data.testTypes || [];
			this.testTypes = this.testTypes.map((testType) => new PatientTestType(testType));
			this.testResultsByType = {};
			return this.testTypes;
		}
		return this.testTypes;
	}

	/**
	 * Returns test dates for the patient
	 * @param {Boolean} useServer Decides whether the testDates should be fetched from the server
	 * @returns {Promise<Date[]>} Promise fulfills with patient dates
	 */
	async getTestDates(useServer = true) {
		if (useServer) {
			let results = await this.#requestToServer.sendRequestWithResponse("PatientTestDates");
			this.#testDatesLastUpdated = Date.now();
			this.testDates = results.data.collectedDates || [];
			this.testDates = this.testDates.map((testDate) => new Date(testDate.replace(/-/g, "/")));
			this.testResultsByDate = {};
			return this.testDates;
		}
		return this.testDates;
	}

	/**
	 * Returns test type results for the patient
	 * @param typeSerNum ExpressionSerNum
	 * @returns {Promise<PatientTestType>} Returns results for the given test type
	 */
	async getTestResultsByType(typeSerNum) {
		if (this.#testResultByTypeIsCached(typeSerNum)) {
			return this.testResultsByType[typeSerNum];
		} else {
			let results = await this.#requestToServer.sendRequestWithResponse("PatientTestTypeResults",
				{ testTypeSerNum: typeSerNum });
			results = results.data || [];
			this.testResultsByType[typeSerNum] = new PatientTestType(results);
			return this.testResultsByType[typeSerNum];
		}
	}

	#testResultByTypeIsCached = (type) => {
		return this.testResultsByType.hasOwnProperty(type);
	};

	/**
	 * Returns results from the given test date, checks cache for the results.
	 * @param {Date} date date to get results for
	 * @returns {Promise<Object[]>} Returns results from the given test date, checks cache for the results.
	 */
	async getTestResultsByDate(date) {
		let dateString = date.toString();
		if (this.#testResultByDateIsCached(dateString)) {
			return this.testResultsByDate[dateString];
		} else {
			let results = await this.#requestToServer.sendRequestWithResponse("PatientTestDateResults",
				{ date: dateString });
			this.testResultsByDate[dateString] = results.data || [];
			return this.testResultsByDate[dateString];
		}
	}

	/**
	 * Get last updated time for the patient test metadata
	 * @returns {number} returns time in milliseconds since the test metadata was last updated
	 */
	getLastUpdated() {
		return Math.min(this.#testDatesLastUpdated, this.#testTypesLastUpdated);
	}

	/**
	 * Checks whether date is cached appropriately
	 * @param date
	 * @returns {boolean}
	 */
	#testResultByDateIsCached = (date) => {
		return this.testResultsByDate.hasOwnProperty(date.toString());
	};
	/**
	 * Upon signing out, clear test results
	 */
	clear() {
		this.testResultsByDate = {};
		this.testResultsByType = {};
		this.testDates = [];
		this.testTypes = [];
		this.#testDatesLastUpdated = 0;
		this.#testTypesLastUpdated = 0;
	}
}

angular.module("MUHCApp").service("PatientTestResults", PatientTestResults);

PatientTestResults.$inject = ["RequestToServer"];
