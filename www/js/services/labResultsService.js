/*
 * Filename     :   labResultsService.js
 * Description  :   Service that requests test results from the hospital server and stores them in this service.
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   02 Mar 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */


/**
 *@ngdoc service
 *@name MUHCApp.service:LabResults
 *@requires $filter
 *@requires MUHCApp.service:RequestToServer
 *@requires $q
 *@requires MUHCApp.service:LocalStorage
 *@description Service that requests and manages the lab results (blood tests) from the server.
 **/
var myApp=angular.module('MUHCApp');
myApp.service('LabResults',['$filter','LocalStorage','RequestToServer','$q', "Params",
    function($filter,LocalStorage,RequestToServer,$q, Params){

        /**
         *@ngdoc property
         *@name  MUHCApp.service.#testResults
         *@propertyOf MUHCApp.service:LabResults
         *@description Raw data obtained by the server.
         **/
        var testResults = [];
        var testResultsByDate = {};
        var testResultsByType = {};
        var testResultsByCategory = {};
        var testResultsByDateArray=[];
        var testResultsByTypeArray=[];
        var lastUpdated = 0;


        // Function that saves tests results to the service
        function addTestResults(tests) {

            if (!tests) return;
            for (var key = 0; key < tests.length; key++) {

                var testResult = tests[key];
                testResult.TestDateFormat = $filter('formatDate')(testResult.TestDate);
                testResult.AbnormalFlag = testResult.AbnormalFlag.trim();
                //
                var testResultDate = testResult.TestDate.replace(/ /g, '');
                var testResultType = testResult.FacComponentName;
                var testCategory = testResult.Group_EN;

                // Assign test to category
                // if (categoryOneTests.indexOf(testResultType) > -1) {
                //     testCategory = CATEGORY_ONE;
                // } else if (categoryTwoTests.indexOf(testResultType) > -1) {
                //     testCategory = CATEGORY_TWO;
                // } else if (categoryThreeTests.indexOf(testResultType) > -1) {
                //     testCategory = CATEGORY_THREE;
                // } else if (categoryFourTests.indexOf(testResultType) > -1) {
                //     testCategory = CATEGORY_FOUR;
                // }

                testResult.testCategory = testCategory;

                // Filter by test date
                if (!testResultsByDate[testResultDate]) {
                    testResultsByDate[testResultDate] = {};
                    testResultsByDate[testResultDate].testCategory = testCategory;
                    testResultsByDate[testResultDate].testDate = testResult.TestDate;
                    testResultsByDate[testResultDate].testDateFormat = $filter('formatDate')(testResult.TestDate);
                    testResultsByDate[testResultDate].testResults = [];
                    testResultsByDate[testResultDate].testResults.push(testResult);
                } else {
                    testResultsByDate[testResultDate].testResults.push(testResult);
                }

                // Filter by test name
                if (!testResultsByType[testResultType]) {
                    testResultsByType[testResultType] = {};
                    testResultsByType[testResultType].testCategory = testCategory;
                    testResultsByType[testResultType].testName = testResultType;
                    testResultsByType[testResultType].testResults = [];
                    testResultsByType[testResultType].testResults.push(testResult);
                } else {
                    testResultsByType[testResultType].testResults.push(testResult);
                }

                // Filter by test category
                if (!testResultsByCategory[testCategory]) {
                    testResultsByCategory[testCategory] = {};
                    testResultsByCategory[testCategory].testCategory = testCategory;
                    testResultsByCategory[testCategory].testResults = [];
                    testResultsByCategory[testCategory].testResults.push(testResult);
                } else {
                    testResultsByCategory[testCategory].testResults.push(testResult);
                }
                testResults.push(testResult);
            }

            for (var keyType in testResultsByType) {
                testResultsByTypeArray.push(testResultsByType[keyType]);
            }

            for (var key1 in testResultsByDate) {
                testResultsByDateArray.push(testResultsByDate[key1]);
            }

            testResultsByDateArray = $filter('orderBy')(testResultsByDateArray, 'testDateFormat', true);
        }

        return{

            /**
             *@ngdoc method
             *@name updateTestResults
             *@methodOf MUHCApp.service:LabResults
             *@description Updates the lab results, grabbing the latest results from the server. Currently not implemented
             *@returns {Promise} Returns a promise containing status.
             **/
            updateTestResults:function()
            {

            },

            /**
             *@ngdoc method
             *@name setTestResults
             *@methodOf MUHCApp.service:LabResults
             *@description Clears and sets the lab results after getting the raw data from the server.
             *@returns {Promise} Returns a promise containing status
             **/
            setTestResults:function(){
                var deferred = $q.defer();
                this.destroy();
                lastUpdated = Date.now();
                RequestToServer.sendRequestWithResponse('LabResults')
                    .then(function (response) {
                        if (response.Code == '3') {
                            addTestResults(response.labResults);
                            deferred.resolve({Success: true, Location: 'Server'});
                        }
                    })
                    .catch(function (error) {
                        deferred.reject({Success: false, Location: '', Error: error})
                    });
                return deferred.promise;
            },

            /**
             *@ngdoc method
             *@name getTestResults
             *@methodOf MUHCApp.service:LabResults
             *@description Getter for the raw lab results.
             *@returns {Object} Returns raw lab results
             **/
            getTestResults:function(){
                return testResults;
            },

            /**
             *@ngdoc method
             *@name getTestResultsArrayByType
             *@methodOf MUHCApp.service:LabResults
             *@description Gets the lab results by type
             *@returns {Array} Returns array containing lab results by type
             **/
            getTestResultsArrayByType:function()
            {

                return testResultsByTypeArray;
            },

            /**
             *@ngdoc method
             *@name getTestResultsArrayByDate
             *@methodOf MUHCApp.service:LabResults
             *@description Gets the lab results by date
             *@returns {Array} Returns array containing lab results by date
             **/
            getTestResultsArrayByDate:function()
            {
                //
                return testResultsByDateArray;
            },

            /**
             *@ngdoc method
             *@name getTestResultsByDate
             *@methodOf MUHCApp.service:LabResults
             *@description Gets lab results by date
             *@returns {Object} Returns object containing lab results by date
             **/
            getTestResultsByDate:function(){
                return testResultsByDate;
            },

            /**
             *@ngdoc method
             *@name getTestResultsByType
             *@methodOf MUHCApp.service:LabResults
             *@description Gets the lab results by type.
             *@returns {Object} Returns lab results object by type.
             **/
            getTestResultsByType:function(){
                return testResultsByType;
            },

            /**
             *@ngdoc method
             *@name getTestResultsByCategory
             *@methodOf MUHCApp.service:LabResults
             *@description Gets lab results by category
             *@returns {Object} Returns lab results by category
             **/
            getTestResultsByCategory:function(){
                return testResultsByCategory;
            },

            /**
             *@ngdoc method
             *@name destroy
             *@methodOf MUHCApp.service:LabResults
             *@description Clears all lab results.
             **/
            destroy:function () {
                testResults = [];
                testResultsByDate = {};
                testResultsByType = {};
                testResultsByCategory = {};
                testResultsByDateArray=[];
                testResultsByTypeArray=[];
                lastUpdated = 0;
            },

            /**
             *
             */
            getLastUpdated : function () {
                return lastUpdated;
            },

            /**
             * getTestClass
             * @author Stacey Beard
             * @date 2019-01-11
             * @desc Returns the class for a given test based on its criticality (within normal range, outside normal range,
             *       critically outside normal range). The resulting class will be used to change the colour of test results
             *       outside the normal range.
             * @param test Test for which to get the class.
             * @returns {string} Name of the class to use with this test.
             */
            getTestClass : function(test) {
                if (test.AbnormalFlag && test.AbnormalFlag.toLowerCase() === 'c') {
                    return "lab-results-test-out5";
                }
                else if (test.AbnormalFlag && test.AbnormalFlag.toLowerCase() !== 'c') {
                    return "lab-results-test-in5";
                }
                else {
                    return "";
                }
            }
        }
    }]);
