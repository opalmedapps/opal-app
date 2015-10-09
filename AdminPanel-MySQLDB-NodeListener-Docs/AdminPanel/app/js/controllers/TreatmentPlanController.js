var myApp=angular.module('MUHCApp');
myApp.controller('TreatmentPlanController',['$rootScope','$scope','UserPlanWorkflow',function($rootScope,$scope,UserPlanWorkflow){
	//This is not a highcharts object. It just looks a little like one!
  
  

}]);
myApp.controller('TreatmentPlanStagesController',['$rootScope','$scope','$timeout', 'UserPlanWorkflow',function($rootScope,$scope,$timeout, UserPlanWorkflow){
    //This is not a highcharts object. It just looks a little like one!
   
   $scope.closeAlert = function () {    
        $rootScope.showAlert=false;
    };
    $scope.treatment={
        choice:'All'
    }
    $scope.treatment.choice='All';
    $scope.stages=UserPlanWorkflow.getPlanWorkflow();



    $scope.$watch('treatment.choice',function(){
        if($scope.treatment.choice=='Past'){
            $scope.stages=UserPlanWorkflow.getPastStages();            
        }else if($scope.treatment.choice=='Next'){
            $scope.stages=[UserPlanWorkflow.getNextStage()];
            console.log($scope.stages);
        }else if($scope.treatment.choice=='Future'){
            $scope.stages=UserPlanWorkflow.getFutureStages();
        }else{
            $scope.stages=UserPlanWorkflow.getPlanWorkflow();
        }
    });
    $scope.getStyle=function($index){
        if($scope.stages[$index].Status==='Next'){
            return '#3399ff';
        }else if($scope.stages[$index].Status==='Past'){
            return '#5CE68A';
        }else{
            return '#ccc';
        }
    };
  

}]);
myApp.controller('TreatmentPlanStatusController',['$rootScope','$scope','UserPlanWorkflow',function($rootScope,$scope,UserPlanWorkflow){



$scope.estimatedTime='3 days';
    $scope.finishedTreatment=false;
    var stages=UserPlanWorkflow.getPlanWorkflow();
    var nextStageIndex=UserPlanWorkflow.getNextStageIndex();
    var startColor='#5CE68A';
    var endColor='#3399ff';

    if(nextStageIndex==-1){
        if(stages.length!=0){
            $scope.completed=true;
            $scope.percentage=100;
            $scope.outOf=stages.length +' out of '+ stages.length;
            var circle = new ProgressBar.Circle('#progressStatus', {
                color: endColor,
                duration: 2000,
                easing: 'easeInOut',
                strokeWidth: 5,
                step: function(state, circle) {
                circle.path.setAttribute('stroke', state.color);
            }
            });
            circle.animate(1, {
                from: {color: endColor},
                to: {color: startColor}
            });
        }else{
            $scope.noTreatmentPlan=true;
        }
           
    }else{
        if(nextStageIndex==stages.length){
            $scope.outOf=nextStageIndex +' out of '+ stages.length;
            $scope.treatmentPlanCompleted=true;
            $scope.percentage=100;
            $scope.completionDate=stages[nextStageIndex-1].Date;
            endColor='#5CE68A';
        }else{
            $scope.currentStage=stages[nextStageIndex].Name;
            $scope.treatmentPlanCompleted=false;
            $scope.percentage=Math.floor((100*(nextStageIndex))/stages.length);
            $scope.outOf=nextStageIndex +' out of '+ stages.length;
        }
        var circle = new ProgressBar.Circle('#progressStatus', {
            color: endColor,
            duration: 2000,
            easing: 'easeInOut',
            strokeWidth: 5,
            step: function(state, circle) {
                circle.path.setAttribute('stroke', state.color);
            }
        });
        circle.animate($scope.percentage/100, {
            from: {color: startColor},
            to: {color: endColor}
        });
    }

}]);