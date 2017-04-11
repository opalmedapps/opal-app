/*
*Code by David Herrera May 20, 2015
*Github: dherre3
*Email:davidfherrerar@gmail.com
*/
var myApp = angular.module('MUHCApp');

myApp.controller('ParkingController',function($scope, $timeout, NavigatorParameters, UserPreferences)
{
    var navigatorName = NavigatorParameters.getParameters();
    $scope.navigatorName = navigatorName;
    $scope.navigator = window[navigatorName];
    $scope.goToParkingLink = function(type)
    {
        
        if(type== 'general')
        {
            if (UserPreferences.getLanguage() == "EN"){
                window.open('https://muhc.ca/glen/handbook/parking-hospital','_system');
            } else {
                window.open('https://cusm.ca/glen/handbook/stationnement','_system');
            }

        }else if(type=='oncology'){
           NavigatorParameters.setParameters({type:type});
           window[navigatorName].pushPage('./views/general/parking/parking-details.html');
        }

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