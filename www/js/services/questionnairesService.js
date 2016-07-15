
var myApp = angular.module('MUHCApp');

myApp.service('Questionnaires', ['RequestToServer','$filter', 'Patient','LocalStorage',function(RequestToServer,$filter,Patient,LocalStorage){
		var questionnairesArray = [];
		var questionnaireAnswers = {};
		var questionnairesObject = {};
		function findAndReplacePatientQuestionnaires(questionnaires)
		{
			for(var i in questionnaires)
			{
				for(var j = 0;j<questionnairesArray.length;j++)
				{
					if(questionnairesArray[j].QuestionnaireSerNum == questionnaires[i].QuestionnaireSerNum)
					{
						questionnairesArray.splice(j,1);
						break;
					}
				}
			}
			
		}
		function addToQuestionnaireObject(questionnaires)
		{
			for(var key in questionnaires)
			{
				questionnairesObject[key]=questionnaires[key];
			}
			console.log(questionnairesObject);			
		}
		function fortmatQuestionnaires(questionnaires)
		{
			addToQuestionnaireObject(questionnaires);
			for(var key in questionnaires)
			{
				questionnairesArray.push(questionnaires[key]);
			}
			LocalStorage.WriteToLocalStorage('Questionnaires',questionnairesObject);
			return questionnairesArray;
		}
	return {
		updatePatientQuestionnaires:function(questionnaires)
		{
			if(questionnaires&&typeof questionnaires !=='undefined')
			{
				
				findAndReplacePatientQuestionnaires(questionnaires);
				fortmatQuestionnaires(questionnaires);
			}
		},
		setPatientQuestionnaires:function(questionnaires)
		{
			questionnairesArray = [];
			questionnairesObject = {};
			console.log(questionnaires);
			
			if(questionnaires&&typeof questionnaires !=='undefined') questionnairesArray = fortmatQuestionnaires(questionnaires);
			console.log(questionnairesObject);
			console.log(questionnairesArray);
		},
		getPatientQuestionnaires:function()
		{
			return questionnairesArray;
		},
		setQuestionnaireAnswers:function(Answer, questionSerNum, questionnaireSerNum) 
		{
			if((Object.keys(questionnaireAnswers).length == 0 ) || (Object.keys(questionnaireAnswers[questionnaireSerNum]).length == 0)) {
				questionnaireAnswers[questionnaireSerNum] = {};
				console.log(questionnairesArray[0]);
				console.log(questionnaireSerNum);
				questionnaireAnswers[questionnaireSerNum].QuestionnaireSerNum = questionnairesArray[questionnaireSerNum].QuestionnaireSerNum;
				questionnaireAnswers[questionnaireSerNum].Answers = new Array(questionnairesArray[questionnaireSerNum].Questions.length);
			}
			questionnaireAnswers[questionnaireSerNum].Answers[questionSerNum] = {
				Answer: Answer,
				QuestionType: questionnairesArray[questionnaireSerNum].Questions[questionSerNum].QuestionType,
				QuestionnaireQuestionSerNum: questionnairesArray[questionnaireSerNum].Questions[questionSerNum].QuestionnaireQuestionSerNum
			};
		},
		getQuestionnaireAnswers:function(questionnaireSerNum)
		{
			if((Object.keys(questionnaireAnswers).length == 0 ) || (Object.keys(questionnaireAnswers[questionnaireSerNum]).length == 0)) {
				console.log('undefined');
				return undefined;
			} else {
				console.log(questionnaireAnswers[questionnaireSerNum]);
				return questionnaireAnswers[questionnaireSerNum];
			}
		},
		submitQuestionnaire:function(questionnaireSerNum) { 
			questionnaireAnswers[questionnaireSerNum].PatientId = Patient.getPatientId();
			questionnaireAnswers[questionnaireSerNum].DateCompleted = $filter('date')(new Date(),'yyyy-MM-dd HH:mm:ss');
			questionnaireAnswers[questionnaireSerNum].OpalQuestionnaireSerNum = questionnairesArray[questionnaireSerNum].OpalQuestionnaireSerNum;
			RequestToServer.sendRequest('QuestionnaireAnswers', questionnaireAnswers[questionnaireSerNum]);
			console.log(questionnaireAnswers[questionnaireSerNum]);
			questionnaireAnswers = {};

		},
		getNumberOfUnreadQuestionnaires:function()
		{
			var unread = 0;
			for (var key in questionnairesObject) {
				if (questionnairesObject[key].CompletedFlag=='0') {
					unread++;
				}
			}
			return unread;
		},
		isQuestionnaireComplete:function(questionnaireSerNum) {
			if(typeof questionnaireAnswers[questionnaireSerNum] !== 'undefined') {
				
				return questionnaireAnswers[questionnaireSerNum].CompletedFlag;
			} else {
				return undefined;
			}
		},
		isEmpty:function()
		{
			return (Object.keys(questionnairesObject).length === 0);
		}
	};
}]);
