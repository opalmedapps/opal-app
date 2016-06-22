myApp.controller('CharterController',function($scope, $timeout, NavigatorParameters, UserPreferences)
{
    $scope.loading = true;
    var parameters = NavigatorParameters.getParameters();
    
    console.log(parameters);
    var language = UserPreferences.getLanguage();
    $scope.title = (language == 'EN')?"Patient Charter":"Charte Du Patient";
    var url = (language == 'EN')?'https://www.depdocs.com/opal/patient_rights/patient_charter.php':'https://www.depdocs.com/opal/patient_rights/charte_du_patient.php';
    $.get(url, function(res) {

		 res.replace(/(\r\n|\n|\r)/gm, " ");
			 $timeout(function(){
				 $scope.loading=false;
				 $scope.htmlBind=res;
			 });

	 });
    
});