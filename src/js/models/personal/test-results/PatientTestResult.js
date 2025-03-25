// SPDX-FileCopyrightText: Copyright (C) 2020 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

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
