// SPDX-FileCopyrightText: Copyright (C) 2021 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/**
 * PatientTestResultDetailed class to model a test result with all available details
 */
export class PatientTestResultDetailed {
	constructor({ abnormalFlag, educationalMaterialURL_EN, educationalMaterialURL_FR, groupName, interpretationRecommended, name_EN, name_FR,
		normalRange, patientTestResultSerNum, readStatus, sequenceNum, testExpressionSerNum, testValue,
		testValueNumeric, unitDescription }) {
		this.abnormalFlag = abnormalFlag;
		this.educationalMaterialURL_EN = educationalMaterialURL_EN;
		this.educationalMaterialURL_FR = educationalMaterialURL_FR;
		this.groupName = groupName;
		this.interpretationRecommended = interpretationRecommended === "1";
		this.name_EN = name_EN;
		this.name_FR = name_FR;
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
