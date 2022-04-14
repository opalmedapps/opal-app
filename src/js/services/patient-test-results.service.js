import { PatientTestType } from "../models/personal/test-results/PatientTestType";
import { PatientTestResultDetailed } from "../models/personal/test-results/PatientTestResultDetailed";

/**
 * @description Service that manages and stores patient test result data.
 * @author David Herrera, Stacey Beard
 */
(function () {
	'use strict';

	angular
		.module('MUHCApp')
		.factory('PatientTestResults', PatientTestResults);

	PatientTestResults.$inject = ["RequestToServer"];

	function PatientTestResults(RequestToServer) {

		/**
		 * @type {number} Timestamp for the last update on types
		 */
		let testTypesLastUpdated = 0;
		/**
		 * @type {number} Timestamp for the last update on dates
		 */
		let testDatesLastUpdated = 0;
		/**
		 * Cache of test types for the patient
		 * @type {PatientTestType[]}
		 */
		let testTypes = [];
		/**
		 * Cache of test dates for the patient
		 * @type {Date[]}
		 */
		let testDates = [];
		/**
		 * Cache of test results by date, it contains test results up to the {@link #lastUpdated}
		 * @type {Record<string,*>} testResultsByDate contains map from string date to list of group types in that date
		 */
		let testResultsByDate = {};
		/**
		 * Cache of test results by type, it contains test results up to the {@link #lastUpdated}
		 * @type {Record<string, PatientTestType>} testResultsByDate contains map from string date to list of type test results
		 *                            in that date
		 */
		let testResultsByType = {};

		let service = {
			processDates: processDates,
			processTypes: processTypes,
			setTestDates: setTestDates,
			setTestTypes: setTestTypes,
			updateTestDates: updateTestDates,
			updateTestTypes: updateTestTypes,
			getTestTypes: getTestTypes,
			getTestDates: getTestDates,
			getTestResultsByType: getTestResultsByType,
			testResultByTypeIsCached: testResultByTypeIsCached,
			testResultByTypeDeleteCached: testResultByTypeDeleteCached,
			getTestResultsByDate: getTestResultsByDate,
			getLastUpdated: getLastUpdated,
			testResultByDateIsCached: testResultByDateIsCached,
			testResultByDateDeleteCached: testResultByDateDeleteCached,
			getTestClass: getTestClass,
			clear: clear,
		};

		return service;

		////////////////

		function processDates(newDates) {
			newDates = newDates || [];
			return newDates.map(date => new Date(date.replace(/-/g, "/")));
		}

		function processTypes(newTypes) {
			newTypes = newTypes || [];
			return newTypes.map(type => new PatientTestType(type));
		}

		function setTestDates(newDates) {
			console.log("Set test dates");
			testDatesLastUpdated = Date.now();
			testDates = processDates(newDates);
			testResultsByDate = {};
			console.log(testDates);
		}

		function setTestTypes(newTypes) {
			console.log("Set test types");
			testTypesLastUpdated = Date.now();
			testTypes = processTypes(newTypes);
			testResultsByType = {};
			console.log(testTypes);
		}

		function updateTestDates(newTestDates) {
			console.log("Update dates");
			newTestDates = processDates(newTestDates);

			// Dates are simple objects with only one relevant value; simply add the new ones that are missing from the array
			let testDatesAsTime = testDates.map(e => e.getTime());
			newTestDates.forEach(e => { if (!testDatesAsTime.includes(e.getTime())) testDates.push(e) });

			// Delete cached data by date for *all* the updated items
			newTestDates.forEach(e => testResultByDateDeleteCached(e));
		}

		function updateTestTypes(newTestTypes) {
			console.log("Update types");
			//newTestTypes = processTypes(newTestTypes);

			// TODO finish writing

		}

		/**
		 * Returns list of test types for the patient
		 * @returns {PatientTestType[]} Upon full-filling promise it returns list of test types for the patient
		 */
		function getTestTypes() {
			console.log("Get test types: ", testTypes);
			return testTypes;
		}

		/**
		 * Returns test dates for the patient
		 * @returns {Date[]} Promise fulfills with patient dates
		 */
		function getTestDates() {
			console.log("Get test dates: ", testDates);
			return testDates;
		}

		/**
		 * Returns test type results for the patient
		 * @param typeSerNum ExpressionSerNum
		 * @returns {Promise<PatientTestType>} Returns results for the given test type
		 */
		async function getTestResultsByType(typeSerNum) {
			if (testResultByTypeIsCached(typeSerNum)) {
				return testResultsByType[typeSerNum];
			} else {
				let results = await RequestToServer.sendRequestWithResponse("PatientTestTypeResults",
					{ testTypeSerNum: typeSerNum });
				results = results.data || [];
				testResultsByType[typeSerNum] = new PatientTestType(results);
				return testResultsByType[typeSerNum];
			}
		}

		function testResultByTypeIsCached(type) {
			return testResultsByType.hasOwnProperty(type);
		}

		/**
		 * If a cache exists for this type, deletes it.
		 * @param type
		 */
		function testResultByTypeDeleteCached(type) {
			if (testResultByTypeIsCached(type)) delete testResultsByType[type];
		}

		/**
		 * Returns results from the given test date, checks cache for the results.
		 * @param {Date} date date to get results for
		 * @returns {Promise<Object[]>} Returns results from the given test date, checks cache for the results.
		 */
		async function getTestResultsByDate(date) {
			let dateString = date.toString();
			if (testResultByDateIsCached(dateString)) {
				return testResultsByDate[dateString];
			} else {
				let results = await RequestToServer.sendRequestWithResponse("PatientTestDateResults", { date: dateString });
				let testResults = results.data || { results: [] };
				testResults.results = testResults.results.map((result) => new PatientTestResultDetailed(result));
				testResultsByDate[dateString] = testResults;
				return testResultsByDate[dateString];
			}
		}

		/**
		 * Get last updated time for the patient test metadata
		 * @returns {number} returns time in milliseconds since the test metadata was last updated
		 */
		function getLastUpdated() {
			return Math.min(testDatesLastUpdated, testTypesLastUpdated);
		}

		/**
		 * Checks whether date is cached appropriately
		 * @param date
		 * @returns {boolean}
		 */
		function testResultByDateIsCached(date) {
			return testResultsByDate.hasOwnProperty(date.toString());
		}

		/**
		 * If a cache exists for this date, deletes it.
		 * @param date
		 */
		function testResultByDateDeleteCached(date) {
			if (testResultByDateIsCached(date)) delete testResultsByDate[date.toString()];
		}

		/**
		 * Returns the class for a given test based on its criticality (within normal range, outside normal range,
		 * critically outside normal range). The resulting class will be used to change the colour of test results
		 * outside the normal range.
		 * @param {*} test Test for which to get the class.
		 * @returns {string} Name of the class to use with this test.
		 */
		function getTestClass(test) {
			let flag;
			if (test.abnormalFlag) flag = test.abnormalFlag;
			else if (test.latestAbnormalFlag) flag = test.latestAbnormalFlag;
			else return "";
			flag = flag.toLowerCase();
			return (flag === "h" || flag === "l") ? "lab-results-test-in5" :
				(flag === "c") ? "lab-results-test-out5" : "";
		}

		/**
		 * Upon signing out, clear test results
		 */
		function clear() {
			console.log("Tests cleared");
			testResultsByDate = {};
			testResultsByType = {};
			testDates = [];
			testTypes = [];
			testDatesLastUpdated = 0;
			testTypesLastUpdated = 0;
		}
	}
})();
