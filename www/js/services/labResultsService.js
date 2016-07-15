var myApp=angular.module('MUHCApp');
myApp.service('LabResults',['$filter','LocalStorage',function($filter,LocalStorage){
	var testResults = [];
	var testResultsByDate = {};
	var testResultsByType = {};
	var testResultsByCategory = {};
	var testResultsByDateArray=[];
	var testResultsByTypeArray=[];
	var testResultsToLocalStorage=[];
	var CATEGORY_ONE = 'Complete Blood Count'; // WBC, RBC, HGB, HCT, Platelet, Neutrophils, Eosinophils
	var CATEGORY_TWO = 'Electrolytes'; // Sodium, potassium, glucose, creatinine, calcium, corrected calcium, magnesium
	var CATEGORY_THREE = 'Other'; // LDH, T4, TSH, albumin, protein, AST, ALT, alkaline phosophatase
	var CATEGORY_FOUR = 'Tumor markers'; //CEA, CA 15-3, CA-125
	var categoryOneTests = ['WBC', 'RBC', 'HGB', 'HCT', 'Platelet Count', 'Neutrophils', 'Eosinophils'];
	var categoryTwoTests = ['Sodium', 'Potassium', 'Glucose, Random', 'Creatinine', 'Calcium', 'Corrected Calcium', 'Magnesium'];
	var categoryThreeTests = ['LDH', 'T4', 'T4, Free', 'TSH', 'Albumin', 'Protein, Total', 'AST (SGOT)', 'ALT (SGPT)', 'Alkaline Phosphatase'];
	var categoryFourTests = ['CEA', 'CA 15-3', 'CA-125'];

 function addTestResults(tests) {
	 if(typeof tests=='undefined') return;
		for (var key=0;key< tests.length;key++) {
			testResultsToLocalStorage.push(angular.copy(tests[key]));

			var testResult = tests[key];
			testResult.TestDateFormat=$filter('formatDate')(testResult.TestDate);
			var testResultDate = testResult.TestDate.replace(/ /g,'');
			var testResultType = testResult.FacComponentName;
			var testCategory = undefined;

			// Assign test to category
			if (categoryOneTests.indexOf(testResultType) > -1) {
				testCategory = CATEGORY_ONE;
			} else if(categoryTwoTests.indexOf(testResultType) > -1){
				testCategory = CATEGORY_TWO;
			} else if(categoryThreeTests.indexOf(testResultType) > -1){
				testCategory = CATEGORY_THREE;
			} else if(categoryFourTests.indexOf(testResultType) > -1) {
				testCategory = CATEGORY_FOUR;
			}
			testResult.testCategory = testCategory;

			// Filter by test date
			if (testResultsByDate[testResultDate] == undefined) {
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
			if (testResultsByType[testResultType] == undefined) {
				testResultsByType[testResultType] = {};
				testResultsByType[testResultType].testCategory = testCategory;
				testResultsByType[testResultType].testName = testResultType;
				testResultsByType[testResultType].testResults = [];
				testResultsByType[testResultType].testResults.push(testResult);
			} else {
				testResultsByType[testResultType].testResults.push(testResult);
			}

			// Filter by test category
			if (testResultsByCategory[testCategory] === undefined) {
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
		console.log(testResultsByTypeArray);
		for (var key in testResultsByDate) {
			testResultsByDateArray.push(testResultsByDate[key]);
		}
		testResultsByDateArray=$filter('orderBy')(testResultsByDateArray,'testDateFormat',true);
		console.log(testResultsByDateArray);
		LocalStorage.WriteToLocalStorage('LabTests',testResultsToLocalStorage);
 }
	return{
		updateTestResults:function(tests)
		{
			addTestResults(tests);
		},
		setTestResults:function(tests){

			/**
				TODO: The only tests taken into account are Laurie's tests.
				Once we start accessing other patients' tests, the code below
				will have to be updated accordingly.
			**/
			testResults = [];
			testResultsByDate = {};
			testResultsByType = {};
			testResultsByCategory = {};
			testResultsByDateArray=[];
			testResultsByTypeArray=[];
			testResultsToLocalStorage=[];
			addTestResults(tests);
		},

		getTestResults:function(){
			return testResults;
		},
		getTestResultsArrayByType:function()
		{
			return testResultsByTypeArray;
		},
		getTestResultsArrayByDate:function()
		{
			return testResultsByDateArray;
		},
		getTestResultsByDate:function(){
			return testResultsByDate;
		},

		getTestResultsByType:function(){
			return testResultsByType;
		},
		getTestResultsByCategory:function(){
			return testResultsByCategory;
		}
	}
}]);
