var myApp=angular.module('MUHCApp');
myApp.service('LabResults',function(){
	return{

		setTestResults:function(tests){

			/**
				TODO: The only tests taken into account are Laurie's tests.
				Once we start accessing other patients' tests, the code below
				will have to be updated accordingly.
			**/

			var CATEGORY_ONE = 'Complete Blood Count'; // WBC, RBC, HGB, HCT, Platelet, Neutrophils, Eosinophils
			var CATEGORY_TWO = 'Electrolytes'; // Sodium, potassium, glucose, creatinine, calcium, corrected calcium, magnesium
			var CATEGORY_THREE = 'Other'; // LDH, T4, TSH, albumin, protein, AST, ALT, alkaline phosophatase
			var CATEGORY_FOUR = 'Tumor markers'; //CEA, CA 15-3, CA-125
			var categoryOneTests = ['WBC', 'RBC', 'HGB', 'HCT', 'Platelet Count', 'Neutrophils', 'Eosinophils'];
			var categoryTwoTests = ['Sodium', 'Potassium', 'Glucose, Random', 'Creatinine', 'Calcium', 'Corrected Calcium', 'Magnesium'];
			var categoryThreeTests = ['LDH', 'T4', 'T4, Free', 'TSH', 'Albumin', 'Protein, Total', 'AST (SGOT)', 'ALT (SGPT)', 'Alkaline Phosphatase'];
			var categoryFourTests = ['CEA', 'CA 15-3', 'CA-125'];

			this.testResults = [];
			this.testResultsByDate = {};
			this.testResultsByType = {};
			this.testResultsByCategory = {};

			for (var key=0;key< tests.length;key++) {
				var testResult = tests[key];
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
				if (this.testResultsByDate[testResultDate] == undefined) {
					this.testResultsByDate[testResultDate] = {};
					this.testResultsByDate[testResultDate].testCategory = testCategory;
					this.testResultsByDate[testResultDate].testDate = testResult.TestDate;
					this.testResultsByDate[testResultDate].testResults = [];
					this.testResultsByDate[testResultDate].testResults.push(testResult);
				} else {
					this.testResultsByDate[testResultDate].testResults.push(testResult);
				}

				// Filter by test name
				if (this.testResultsByType[testResultType] == undefined) {
					this.testResultsByType[testResultType] = {};
					this.testResultsByType[testResultType].testCategory = testCategory;
					this.testResultsByType[testResultType].testName = testResultType;
					this.testResultsByType[testResultType].testResults = [];
					this.testResultsByType[testResultType].testResults.push(testResult);
				} else {
					this.testResultsByType[testResultType].testResults.push(testResult);
				}

				// Filter by test category
				if (this.testResultsByCategory[testCategory] === undefined) {
					this.testResultsByCategory[testCategory] = {};
					this.testResultsByCategory[testCategory].testCategory = testCategory;
					this.testResultsByCategory[testCategory].testResults = [];
					this.testResultsByCategory[testCategory].testResults.push(testResult);
				} else {
					this.testResultsByCategory[testCategory].testResults.push(testResult);
				}

				this.testResults.push(testResult);
			}
		},

		getTestResults:function(){
			return this.testResults;
		},

		getTestResultsByDate:function(){
			return this.testResultsByDate;
		},

		getTestResultsByType:function(){
			return this.testResultsByType;
		},
		getTestResultsByCategory:function(){
			return this.testResultsByCategory;
		}
	}
});
