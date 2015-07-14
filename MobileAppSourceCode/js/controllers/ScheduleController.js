var myApp=angular.module('app');
myApp.controller('ScheduleController',['$scope','UserDataMutable','UserTasksAndAppointments', 
	function($scope,UserDataMutable, UserTasksAndAppointments)
	{

	$scope.closeAlert = function () {	
        $rootScope.showAlert=false;
    };
    var appoint=UserTasksAndAppointments.getUserTasksAndAppointments();
    $scope.appointments=appoint;
    $scope.timeBetweenAppointments=UserTasksAndAppointments.getTimeBetweenAppointments('Day');
    console.log($scope.appointments);
    $scope.currentStage={};
    $scope.getStyle=function($index){
    	if(appoint[$index].Status==='Next'){
    		return '#5CE68A';
    	}else if(appoint[$index].Status==='Past'){
    		return '#3399ff';
    	}else{
    		return '#ccc';
    	}

    };







	}
]);