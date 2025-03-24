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
		 * @description Cache of test dates for the patient.
		 * @type {Date[]}
		 */
		let testDates = [];

		/**
		 * @description Cache of test types for the patient.
		 * @type {PatientTestType[]}
		 */
		let testTypes = [];

		/**
		 * @description Cache of test results by date.
		 * @type {Record<string, Object>} Map from each string date to an object containing results for that date.
		 */
		let testResultsByDate = {};

		/**
		 * @description Cache of test results by type.
		 * @type {Record<number, PatientTestType>} Map from each test's SerNum (testExpressionSerNum) to a
		 *                                         PatientTestType object containing results for that test.
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
			getTestResultsUrl: () => './views/personal/test-results/test-results.html',
			clear: clear,

			// Exported for testing
			testResultByDateIsCached: testResultByDateIsCached,
			testResultByTypeIsCached: testResultByTypeIsCached,
		};

		return service;

		////////////////

		/**
		 * @description Processes lab results dates from the format sent by the listener to the format used in this service.
		 * @param {String[]} newDates - An array of objects containing lab results' dates and read statuses,
		 *								as provided by the listener.
		 *								E.g., [
		 *									{"collectedDateTime":"2023-05-05 14:00:00Z","readStatus":1},
		 *									{"collectedDateTime":"2023-01-05 15:59:00Z","readStatus":0},
		 *								]
		 * @returns {Date[]} A new processed array of objects with formatted dates.
		 */
		function processTestDates(newDates) {
			newDates = newDates || [];
			return newDates.map(item => (
				{
					...item,
					collectedDateTime: new Date(item.collectedDateTime)
				})
			);
		}

		/**
		 * @description Processes types from the format sent by the listener to the format used in this service.
		 * @param {Object[]} newTypes - An array of type objects, as provided by the listener.
		 * @returns {PatientTestType[]} A new processed array of PatientTestType objects.
		 */
		function processTypes(newTypes) {
			newTypes = newTypes || [];
			return newTypes.map(type => new PatientTestType(type));
		}

		/**
		 * @description Processes an array of objects with dates from the listener and saves it in this service.
		 *              Any previously added values are overwritten.
		 * @param {String[]} newDates - An array of objects with dates, as provided by the listener.
		 */
		function setTestDates(newDates) {
			testDates = processTestDates(newDates);
			testResultsByDate = {};
		}

		/**
		 * @description Processes an array of types from the listener and saves it in this service.
		 *              Any previously added values are overwritten.
		 * @param {Object[]} newTypes - An array of type objects, as provided by the listener.
		 */
		function setTestTypes(newTypes) {
			testTypes = processTypes(newTypes);
			testResultsByType = {};
		}

		/**
		 * @description Processes an array of updated dates from the listener and uses it to update this service.
		 *              New dates are added. Read status are updated for the corresponding dates.
		 * @param {String[]} newTestDates - An array of new or updated dates, as provided by the listener.
		 */
		function updateTestDates(newTestDates) {
			let processedNewTestDates = processTestDates(newTestDates);
			processedNewTestDates.forEach(
				newDate => {
					let labTestDate = testDates.find(
						testDate => newDate.collectedDateTime.getTime() === testDate.collectedDateTime.getTime()
					);

					!labTestDate ? testDates.push(newDate) : labTestDate.readStatus = newDate.readStatus;
				}
			);

			// Delete cached data by date for all the updated items
			processedNewTestDates.forEach(e => testResultByDateDeleteCached(e.collectedDateTime));
		}

		/**
		 * @description Processes an array of updated types from the listener and uses it to update this service.
		 *              Values with the same testExpressionSerNum are overwritten; the rest are left untouched.
		 * @param {Object[]} newTestTypes - An array of new or updated type objects, as provided by the listener.
		 */
		function updateTestTypes(newTestTypes) {
			let processedNewTestTypes = processTypes(newTestTypes);

			// Apply the new types over the old types (overwriting any matching types that are already present, by SerNum)
			processedNewTestTypes.forEach(newType => {
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
		 * @description Checks whether a given date has results cached in this service.
		 * @param {Date} date - The date to check.
		 * @returns {boolean} True if the given date has cached results; false otherwise.
		 */
		function testResultByDateIsCached(date) {
			return testResultsByDate.hasOwnProperty(date.toString());
		}

		/**
		 * @description Checks whether a given type has results cached in this service.
		 * @param {number} typeSerNum - The SerNum of the type to check (testExpressionSerNum).
		 * @returns {boolean} True if the given type has cached results; false otherwise.
		 */
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
