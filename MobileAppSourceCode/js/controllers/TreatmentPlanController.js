var myApp=angular.module('MUHCApp');
myApp.controller('TreatmentPlanController',['$rootScope','$scope','UserPlanWorkflow',function($rootScope,$scope,UserPlanWorkflow){
	//This is not a highcharts object. It just looks a little like one!
  
   $scope.closeAlert = function () {	
        $rootScope.showAlert=false;
    };
    $scope.finishedTreatment=false;
    var appoint=UserPlanWorkflow.getPlanWorkflow();
    if(appoint){
        $scope.appointments=appoint;
        console.log(appoint);
        $scope.timeBetweenAppointments=UserPlanWorkflow.getTimeBetweenEvents('Day');
        $scope.today=new Date();
        $scope.currentStage=appoint[UserPlanWorkflow.CurrentTaskOrAppointmentIndex].Name;
        if(appoint[UserPlanWorkflow.CurrentTaskOrAppointmentIndex].Date>$scope.today){
            $scope.lastFinished=appoint[UserPlanWorkflow.CurrentTaskOrAppointmentIndex-1].Name;  
            $scope.dynamic=Math.floor(100*((UserPlanWorkflow.CurrentTaskOrAppointmentIndex+1)/appoint.length));
            $scope.message=(UserPlanWorkflow.CurrentTaskOrAppointmentIndex+1)+' out of '+appoint.length;
        }else{
        $scope.finishedTreatment=true;
        $scope.dynamic=100;
        $scope.message=appoint.length+' out of '+appoint.length;
      }
}
    
   
    

    console.log($scope.appointments);

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