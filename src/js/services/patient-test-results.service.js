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
		 * Cache of test dates for the patient
		 * @type {Date[]}
		 */
		let testDates = [];
		/**
		 * Cache of test types for the patient
		 * @type {PatientTestType[]}
		 */
		let testTypes = [];
		/**
		 * Cache of test results by date.
		 * @type {Record<string,*>} testResultsByDate contains map from string date to list of group types in that date
		 */
		let testResultsByDate = {};
		/**
		 * Cache of test results by type.
		 * @type {Record<string, PatientTestType>} testResultsByDate contains map from string date to list of type test results
		 *                            in that date
		 */
		let testResultsByType = {};

		let service = {
			setTestDates: setTestDates,
			setTestTypes: setTestTypes,
			updateTestDates: updateTestDates,
			updateTestTypes: updateTestTypes,
			getTestDates: () => testDates,
			getTestTypes: () => testTypes,
			getTestResultsByDate: getTestResultsByDate,
			getTestResultsByType: getTestResultsByType,
			getTestClass: getTestClass,
			clear: clear,

			// Exported for testing
			testResultByDateIsCached: testResultByDateIsCached,
			testResultByTypeIsCached: testResultByTypeIsCached,
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
			testDates = processDates(newDates);
			testResultsByDate = {};
		}

		function setTestTypes(newTypes) {
			testTypes = processTypes(newTypes);
			testResultsByType = {};
		}

		function updateTestDates(newTestDates) {
			newTestDates = processDates(newTestDates);

			// Dates are simple objects with only one relevant value; simply add the new ones that are missing from the array
			let testDatesAsTime = testDates.map(testDate => testDate.getTime());
			newTestDates.forEach(newDate => { if (!testDatesAsTime.includes(newDate.getTime())) testDates.push(newDate) });

			// Delete cached data by date for all the updated items
			newTestDates.forEach(e => testResultByDateDeleteCached(e));
		}

		function updateTestTypes(newTestTypes) {
			newTestTypes = processTypes(newTestTypes);

			// Apply the new types over the old types (overwriting any matching types that are already present, by SerNum)
			newTestTypes.forEach(newType => {
				// If applicable, find and delete an element with the same SerNum as the new one
				const newSerNum = newType.testExpressionSerNum;
				const existingTypeIndex = testTypes.findIndex(type => type.testExpressionSerNum === newSerNum);
				if (existingTypeIndex !== -1) testTypes.splice(existingTypeIndex, 1); // Delete it

				// Add the new element
				testTypes.push(newType);

				// Delete cached data by type for the new element
				testResultByTypeDeleteCached(newType.testExpressionSerNum);
			});
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

		/**
		 * Checks whether date is cached appropriately
		 * @param date
		 * @returns {boolean}
		 */
		function testResultByDateIsCached(date) {
			return testResultsByDate.hasOwnProperty(date.toString());
		}

		function testResultByTypeIsCached(typeSerNum) {
			return testResultsByType.hasOwnProperty(typeSerNum);
		}

		/**
		 * If a cache exists for this date, deletes it.
		 * @param date
		 */
		function testResultByDateDeleteCached(date) {
			if (testResultByDateIsCached(date)) delete testResultsByDate[date.toString()];
		}

		/**
		 * If a cache exists for this type, deletes it.
		 * @param typeSerNum
		 */
		function testResultByTypeDeleteCached(typeSerNum) {
			if (testResultByTypeIsCached(typeSerNum)) delete testResultsByType[typeSerNum];
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
			testDates = [];
			testTypes = [];
			testResultsByDate = {};
			testResultsByType = {};
		}
	}
})();
