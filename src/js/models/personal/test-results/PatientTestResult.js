/**
 * TestResult class manages a result
 */
export class PatientTestResult {
	constructor({ testValue, collectedDateTime }) {
		this.testValue = Number(testValue);
		this.testValueString = testValue;
		this.collectedDateTime = Date.parse(collectedDateTime.replace(/-/g,"/"));
	}
}