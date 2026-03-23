// SPDX-FileCopyrightText: Copyright (C) 2021 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/**
 * PatientTestResultDetailed class to model a test result with all available details
 */
export class PatientTestResultDetailed {
	constructor({ abnormalFlag, educationalMaterialURL, groupName, interpretationRecommended, name,
		normalRange, patientTestResultSerNum, readStatus, sequenceNum, testExpressionSerNum, testValue,
		testValueNumeric, unitDescription }) {
		this.abnormalFlag = abnormalFlag;
		this.educationalMaterialURL = educationalMaterialURL;
		this.groupName = groupName;
		this.interpretationRecommended = interpretationRecommended === "1";
		this.name = name;
		this.normalRange = normalRange;
		this.patientTestResultSerNum = Number(patientTestResultSerNum);
		this.readStatus = Number(readStatus);
		this.sequenceNum = Number(sequenceNum);
		this.testExpressionSerNum = Number(testExpressionSerNum);
		this.testValue = testValue;
		this.testValueNumeric = Number(testValueNumeric);
		this.unitDescription = unitDescription;
		this.unitWithBrackets = unitDescription === "" ? "" : "(" + unitDescription + ")";
	}
}
