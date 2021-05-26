/**
 * PatientTestResultDetailed class to model a test result with all available details
 */
export class PatientTestResultDetailed {
	constructor({ abnormalFlag, educationalMaterialURL_EN, educationalMaterialURL_FR, groupName, name_EN, name_FR,
		normalRange, patientTestResultSerNum, readStatus, sequenceNum, testExpressionSerNum, testValue,
		testValueNumeric, unitDescription }) {
		this.abnormalFlag = abnormalFlag;
		this.educationalMaterialURL_EN = educationalMaterialURL_EN;
		this.educationalMaterialURL_FR = educationalMaterialURL_FR;
		this.groupName = groupName;
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
