var myApp=angular.module('adminPanelApp');
myApp.service('FeedbackService',function(api,URLs,$filter)
{
	var appFeedbackArray = [];
	var educationalFeedbackArray = [];
	
	return {
		getAppFeedbackFromServer:function(date)
		{	

			return api.getFieldFromServer(URLs.getUrlFeedback(),{filter:$filter('date')(date,'yyyy-MM-dd hh:mm:ss')});
		},
		getEducationalMaterialFeedbackFromServer:function()
		{
			return api.getFieldFromServer(URLs.getUrlEducationalMaterialFeedback());
		},
		setAppFeedback:function(feedback)
		{
			appFeedbackArray = feedback;
		},
		getAppFeedback:function()
		{
			return appFeedbackArray;
		},
		setEducationalFeedbac:function(feedback)
		{
			educationalFeedbackArray= feedback;
		},
		getEdicationalFeedback:function()
		{
			return educationalFeedbackArray;
		},
		getEducationalMaterialRatingFromServer:function(serNum)
		{
			return api.getFieldFromServer(URLs.getUrlEducationalMaterialRating(),{'EducationalMaterialControlSerNum':serNum});
		},
		processRatings:function(values)
		{
			var arrayRatings =[0,0,0,0,0];
			for (var i = 0; i < values.length; i++) {
				if(values[i]>0)arrayRatings[values[i]-1]++;
				else arrayRatings[values[i]]++;
			}
			return arrayRatings;
		}



	};
});
