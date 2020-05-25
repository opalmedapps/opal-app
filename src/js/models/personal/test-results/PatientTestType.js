// TODO: Once app code has been split between modules, move this code a separate file per class
import { PatientTestResult } from "./PatientTestResult";
/**
 * TestType class to model the TestTypes from the back-end
 */
export class PatientTestType {
	constructor({ educationalMaterialURL_EN, educationalMaterialURL_FR, latestAbnormalFlag, latestCollectedDateTime,
		latestPatientTestResultSerNum, latestTestValue, name_EN, name_FR, normalRange, normalRangeMax,
		normalRangeMin, readStatus, testExpressionSerNum, unitDescription, hasNumericValues = "false",
		results = null }) {
		this.educationalMaterialURL_EN = educationalMaterialURL_EN;
		this.educationalMaterialURL_FR = educationalMaterialURL_FR;
		this.latestAbnormalFlag = latestAbnormalFlag;
		this.latestCollectedDateTime = Date.parse(latestCollectedDateTime.replace(/-/g, "/"));
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
		this.results = this.results.map((testResult) => new PatientTestResult(testResult));
	}
}