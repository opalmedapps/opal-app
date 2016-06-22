
var myApp = angular.module('MUHCApp');

myApp.service('Questionnaires', [function(){
		var questionnairesArray = [];
		function findAndDeletePatientQuestionnaires(questionnaires)
		{
			for(var i = 0;i<questionnaires.length;i++)
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
		function addQuestionnaires(questionnaires)
		{
			for(var i = 0;i<questionnaires.length;i++)
			{
				questionnairesArray.push(questionnaires);
			}
		}
		function fortmatQuestionnaires(questionnaires)
		{
			var questionnairesObject = {};
			var questionnaireArray = [];
			
			for(var i = 0;i<questionnaires.length;i++)
			{
				var questionnaireSerNum = questionnaires[i].QuestionnaireSerNum;
				if(!questionnairesObject.hasOwnProperty(questionnaires[i].QuestionnaireSerNum))
				{
					questionnairesObject[questionnaires[i].QuestionnaireSerNum] = {};
					questionnairesObject[questionnaires[i].QuestionnaireSerNum].QuestionnaireSerNum = questionnaires[i].QuestionnaireSerNum;
					questionnairesObject[questionnaires[i].QuestionnaireSerNum].QuestionnaireName = questionnaires[i].QuestionnaireName;
					delete questionnaires[i].QuestionnaireName;
					delete questionnaires[i].QuestionnaireSerNum;
					questionnairesObject[questionnaireSerNum].Questions = [questionnaires[i]];
				}else{
					delete questionnaires[i].QuestionnaireName;
					delete questionnaires[i].QuestionnaireSerNum; 
					questionnairesObject[questionnaireSerNum].Questions.push(questionnaires[i]);
				}
			}
			for(var key in questionnairesObject)
			{
				questionnaireArray.push(questionnairesObject[key]);
			}
			return questionnaireArray;
		}
	return {
		updatePatientQuestionnaires:function(questionnaires)
		{
			if(questionnaires&&typeof questionnaires !=='undefined')
			{
				questionnaires = fortmatQuestionnaires(questionnaires);
				findAndDeletePatientQuestionnaires(questionnaires);
				addPatientQuestionnaires(questionnaires);
			}
		},
		setPatientQuestionnaires:function(questionnaires)
		{
			questionnairesArray = [];
			if(questionnaires&&typeof questionnaires !=='undefined') questionnairesArray = fortmatQuestionnaires(questionnaires);
			console.log(questionnairesArray);
		},
		getPatientQuestionnaires:function()
		{
			return questionnairesArray;
		}
	};
}]);
