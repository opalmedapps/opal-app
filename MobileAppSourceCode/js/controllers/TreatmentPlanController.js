var myApp=angular.module('app');
myApp.controller('TreatmentPlanController',['$rootScope','$scope','UserTasksAndAppointments',function($rootScope,$scope,UserTasksAndAppointments){
	//This is not a highcharts object. It just looks a little like one!
   $scope.closeAlert = function () {	
        $rootScope.showAlert=false;
    };
    var appoint=UserTasksAndAppointments.getUserTasksAndAppointments();
    $scope.appointments=appoint;
    $scope.timeBetweenAppointments=UserTasksAndAppointments.getTimeBetweenAppointments('Day');
    $scope.lastFinished=appoint[UserTasksAndAppointments.CurrentTaskOrAppointmentIndex-1].Name;
    $scope.currentStage=appoint[UserTasksAndAppointments.CurrentTaskOrAppointmentIndex].Name;

    console.log($scope.appointments);
    $scope.dynamic=Math.floor(100*((UserTasksAndAppointments.CurrentTaskOrAppointmentIndex)/appoint.length));
    console.log($scope.dynamic);
    $scope.message=(UserTasksAndAppointments.CurrentTaskOrAppointmentIndex)+' out of '+appoint.length;
    $scope.getStyle=function($index){
    	if(appoint[$index].Status==='Next'){
    		return '#5CE68A';
    	}else if(appoint[$index].Status==='Past'){
    		return '#3399ff';
    	}else{
    		return '#ccc';
    	}

    };

}]);