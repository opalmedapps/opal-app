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
	 * @type {TestType[]}
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
	 * @type {Record<string, TestType>} testResultsByDate contains map from string date to list of type test results
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
	 * @returns {Promise<TestType[]>} Upon full-filling promise it returns list of test types for the patient
	 */
	async getTestTypes(useServer = true) {
		if (useServer) {
			let results = await this.#requestToServer.sendRequestWithResponse("PatientTestTypes");
			this.#testTypesLastUpdated = Date.now();
			this.testTypes = results.data.testTypes || [];
			this.testTypes = this.testTypes.map((testType) => new TestType(testType));
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
			this.testDates = this.testDates.map((testDate) => new Date(testDate.replace(/-/g,"/")));
			this.testResultsByDate = {};
			return this.testDates;
		}
		return this.testDates;
	}

	/**
	 * Returns test type results for the patient
	 * @param typeSerNum ExpressionSerNum
	 * @returns {Promise<TestType>} Returns results for the given test type
	 */
	async getTestResultsByType(typeSerNum) {
		if (this.#testResultByTypeIsCached(typeSerNum)) {
			return this.testResultsByType[typeSerNum];
		} else {
			let results = await this.#requestToServer.sendRequestWithResponse("PatientTestTypeResults",
				{ testTypeSerNum: typeSerNum });
			results = results.data || [];
			this.testResultsByType[typeSerNum] = new TestType(results);
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

// TODO: Once app code has been split between modules, move this code a separate file per class
/**
 * TestResult class manages a result
 */
class TestResult {
	constructor({ testValue, collectedDateTime }) {
		this.testValue = Number(testValue);
		this.testValueString = testValue;
		this.collectedDateTime = Date.parse(collectedDateTime.replace(/-/g,"/"));
	}
}
/**
 * TestType class to model the TestTypes from the back-end
 */
class TestType {
	constructor({ educationalMaterialURL_EN, educationalMaterialURL_FR, latestAbnormalFlag, latestCollectedDateTime,
		latestPatientTestResultSerNum, latestTestValue, name_EN, name_FR, normalRange, normalRangeMax,
		normalRangeMin, readStatus, testExpressionSerNum, unitDescription, hasNumericValues = "false",
		results = null }) {
		this.educationalMaterialURL_EN = educationalMaterialURL_EN;
		this.educationalMaterialURL_FR = educationalMaterialURL_FR;
		this.latestAbnormalFlag = latestAbnormalFlag;
		this.latestCollectedDateTime = Date.parse(latestCollectedDateTime.replace(/-/g,"/"));
		this.latestPatientTestResultSerNum = Number(latestPatientTestResultSerNum);
		this.latestTestValue = Number(latestTestValue);
		this.name_EN = name_EN;
		this.name_FR = name_FR;
		this.normalRange = normalRange;
		this.normalRangeMax = Number(normalRangeMax);
		this.normalRangeMin = Number(normalRangeMin);
		this.readStatus = readStatus === "1";
		this.testExpressionSerNum = Number(testExpressionSerNum);
		this.unitDescription = unitDescription;
		this.hasNumericValues = hasNumericValues === "true";
		this.results = results || [];
		this.results = this.results.map((testResult) => new TestResult(testResult));
	}
}