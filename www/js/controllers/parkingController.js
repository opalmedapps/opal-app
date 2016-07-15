var myApp = angular.module('MUHCApp');

myApp.controller('ParkingController',function($scope, $timeout, NavigatorParameters)
{
    var navigatorName = NavigatorParameters.getParameters();
    $scope.navigatorName = navigatorName;
    $scope.navigator = window[navigatorName];
    $scope.goToParkingLink = function(type)
    {
        
        if(type== 'general')
        {
           NavigatorParameters.setParameters({type:type});
        }else if(type=='oncology'){
           NavigatorParameters.setParameters({type:type});
        }
        window[navigatorName].pushPage('./views/general/parking/parking-details.html');
    }
});

myApp.controller('IndividualParkingController',function($scope, $timeout, NavigatorParameters, UserPreferences)
{
    $scope.loading = true;
    var language = UserPreferences.getLanguage();
    var parkingInformation = {
        'EN':{
           'general':{
               title:"Parking",
               link:"https://www.depdocs.com/opal/parking/parking.php"
           },
           'oncology':{
               title:"Oncology Parking",
               link:"https://www.depdocs.com/opal/parking/oncology_parking.php"
           }
        },
        'FR':{
           'general':{
               title:"Stationnement",
               link:"https://www.depdocs.com/opal/parking/stationnement.php"
           },
           'oncology':{
               title:"Stationnement Radiothérapie",
               link:"https://www.depdocs.com/opal/parking/radiotherapie_stationnement.php"
           } 
        }
    };
    
    var parameters = NavigatorParameters.getParameters();
    console.log(parameters);
    
    $scope.title = parkingInformation[language][parameters.type].title;
    var link = parkingInformation[language][parameters.type].link;
    $.get(link, function(res) {

		 res.replace(/(\r\n|\n|\r)/gm, " ");
			 $timeout(function(){
				 $scope.loading=false;
				 $scope.htmlBind=res;
			 });

	 });
    
});