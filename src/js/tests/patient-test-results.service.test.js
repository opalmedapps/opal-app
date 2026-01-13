// SPDX-FileCopyrightText: Copyright (C) 2022 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

// import PatientTestResults from '../services/patient-test-results.service.js';
const { expect } = require('chai');

beforeEach(function() {
    PatientTestResults.clear();
});

describe('PatientTestResults service', function() {
    describe('setTestDates', function() {
        it('should set all dates in the testDates array', function() {
            let newDates = [
                "2022-04-11",
                "2022-04-12",
                "2022-01-03",
                "2022-12-27",
            ];

            PatientTestResults.setTestDates(newDates);

            let serviceDatesText = getServiceDatesText();

            expect(serviceDatesText).to.have.members(newDates);
        });

        it('should overwrite any existing dates', function() {
            let oldDates = [
                "2022-04-11",
                "2022-04-12",
                "2022-01-03",
                "2022-12-27",
            ];

            PatientTestResults.setTestDates(oldDates);
            PatientTestResults.setTestDates([]);

            let serviceDatesText = getServiceDatesText();

            expect(serviceDatesText).to.have.members([]);
        });
    });

    describe('setTestTypes', function() {
        it('should set all types in the testTypes array', function() {
            let newTypes = [
                {
                    educationalMaterialURL: "",
                    latestAbnormalFlag: "",
                    latestCollectedDateTime: "",
                    latestPatientTestResultSerNum: "1",
                    latestTestValue: "0",
                    name: "test",
                    normalRange: "",
                    normalRangeMax: "",
                    normalRangeMin: "",
                    readStatus: "0",
                    testExpressionSerNum: "1",
                    unitDescription: "",
                }
            ];

            PatientTestResults.setTestTypes(newTypes);

            let serviceTypes = PatientTestResults.getTestTypes();

            expect(serviceTypes).to.have.lengthOf(newTypes.length);
            expect(serviceTypes[0].testExpressionSerNum).to.equal(parseInt(newTypes[0].testExpressionSerNum));
        });

        it('should overwrite any existing types', function() {
            let oldTypes = [
                {
                    educationalMaterialURL: "",
                    latestAbnormalFlag: "",
                    latestCollectedDateTime: "",
                    latestPatientTestResultSerNum: "1",
                    latestTestValue: "0",
                    name: "test",
                    normalRange: "",
                    normalRangeMax: "",
                    normalRangeMin: "",
                    readStatus: "0",
                    testExpressionSerNum: "1",
                    unitDescription: "",
                }
            ];

            PatientTestResults.setTestTypes(oldTypes);
            PatientTestResults.setTestTypes([]);

            let serviceTypes = PatientTestResults.getTestTypes();

            expect(serviceTypes).to.have.lengthOf(0);
        });
    });

    describe('updateTestDates', function() {
        it('should add new dates, without adding duplicates', function() {
            executeUpdateDates();

            let expectedResult = expectedResultUpdateDates();
            let serviceDatesText = getServiceDatesText();

            expect(serviceDatesText).to.have.members(expectedResult);
        });

        it('should clear cached data for updated dates', function() {
            executeUpdateDates();

            let updatedDateIsCached = PatientTestResults.testResultByDateIsCached(new Date("2022-04-12"));
            let newDateIsCached = PatientTestResults.testResultByDateIsCached(new Date("2022-06-05"));

            expect(updatedDateIsCached).to.be.false;
            expect(newDateIsCached).to.be.false;
        });
    });

    describe('updateTestTypes', function() {
        it('should add new types, without adding duplicates', function() {
            executeUpdateTypes();

            let serviceTypes = PatientTestResults.getTestTypes();

            expect(serviceTypes).to.have.lengthOf(3);
        });

        it('should update existing types with new information', function() {
            executeUpdateTypes();

            let serviceTypes = PatientTestResults.getTestTypes();
            let typeSerNum2 = serviceTypes.find(type => type.testExpressionSerNum === 2);

            expect(typeSerNum2.normalRangeMax).to.equal(100);
        });

        it('should clear cached data for updated types', function() {
            executeUpdateTypes();

            let serviceTypes = PatientTestResults.getTestTypes();
            let typeSerNum2 = serviceTypes.find(type => type.testExpressionSerNum === 2);
            let type2IsCached = PatientTestResults.testResultByTypeIsCached(typeSerNum2.testExpressionSerNum);

            expect(type2IsCached).to.be.false;
        });
    });
});

/**
 * @description Returns the test Dates from the service, converted to an array of strings in the format "yyyy-mm-dd".
 * @returns {string[]} The test Dates as formatted strings.
 */
function getServiceDatesText() {
    return PatientTestResults.getTestDates().map(date => date.toISOString().substring(0, 10)); // yyyy-mm-dd (10 chars)
}

/**
 * @description Updates the test Dates in the service. Wrapped in a function for reuse.
 */
function executeUpdateDates() {
    let dates = [
        "2022-04-11",
        "2022-04-12",
        "2022-01-03",
        "2022-12-27",
    ];

    let newDates = [
        "2022-04-12",
        "2022-06-05",
    ];

    PatientTestResults.setTestDates(dates);
    PatientTestResults.updateTestDates(newDates);
}

/**
 * @description Returns the expected result for executeUpdateDates.
 * @returns {string[]} The expected resulting array of dates (string-formatted).
 */
function expectedResultUpdateDates() {
    return [
        "2022-04-11",
        "2022-04-12",
        "2022-01-03",
        "2022-12-27",
        "2022-06-05",
    ];
}

/**
 * @description Updates the test Types in the service. Wrapped in a function for reuse.
 */
function executeUpdateTypes() {
    let types = [
        {
            educationalMaterialURL: "",
            latestAbnormalFlag: "",
            latestCollectedDateTime: "",
            latestPatientTestResultSerNum: "1",
            latestTestValue: "0",
            name: "test",
            normalRange: "",
            normalRangeMax: "",
            normalRangeMin: "",
            readStatus: "0",
            testExpressionSerNum: "1",
            unitDescription: "",
        },
        {
            educationalMaterialURL: "",
            latestAbnormalFlag: "",
            latestCollectedDateTime: "",
            latestPatientTestResultSerNum: "1",
            latestTestValue: "0",
            name: "test",
            normalRange: "",
            normalRangeMax: "",
            normalRangeMin: "",
            readStatus: "0",
            testExpressionSerNum: "2",
            unitDescription: "",
        },
    ];

    let newTypes = [
        {
            educationalMaterialURL: "",
            latestAbnormalFlag: "",
            latestCollectedDateTime: "",
            latestPatientTestResultSerNum: "1",
            latestTestValue: "0",
            name: "test",
            normalRange: "",
            normalRangeMax: "100",
            normalRangeMin: "1",
            readStatus: "0",
            testExpressionSerNum: "2",
            unitDescription: "",
        },
        {
            educationalMaterialURL: "",
            latestAbnormalFlag: "",
            latestCollectedDateTime: "",
            latestPatientTestResultSerNum: "1",
            latestTestValue: "0",
            name: "test",
            normalRange: "",
            normalRangeMax: "",
            normalRangeMin: "",
            readStatus: "0",
            testExpressionSerNum: "3",
            unitDescription: "",
        },
    ];

    PatientTestResults.setTestTypes(types);
    PatientTestResults.updateTestTypes(newTypes);
}
