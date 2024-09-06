/**
 * PatientTestResult class manages a result
 */
export class PatientTestResult {
	constructor({ testValue, collectedDateTime, abnormalFlag }) {
		this.testValue = Number(testValue);
		this.testValueString = testValue;
		this.collectedDateTime = Date.parse(collectedDateTime);
		this.abnormalFlag = abnormalFlag;
	}
}
