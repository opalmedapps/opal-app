var myApp=angular.module('MUHCApp');
myApp.controller('TreatmentPlanController',['$rootScope','$scope','UserPlanWorkflow','$timeout',function($rootScope,$scope,UserPlanWorkflow,$timeout){
   $scope.treatment={
       choice:'All'
   }
   $scope.treatment.choice='All';
   $scope.stages=UserPlanWorkflow.getPlanWorkflow();
   $scope.nextStageIndex=UserPlanWorkflow.getNextStageIndex();
   console.log(UserPlanWorkflow.getNextStageIndex());


   if($scope.nextStageIndex==$scope.stages.length)
   {
     if($scope.stages.length>0){
       $rootScope.selectedStage=$scope.stages[$scope.nextStageIndex-1];
       $scope.treatmentPlanCompleted=true;
     }else{
       $scope.noTreatmentPlan=true;
     }
   }else{
     $rootScope.selectedStage=$scope.stages[$scope.nextStageIndex];
     $scope.treatmentPlanCompleted=false;
     $scope.noTreatmentPlan=false;
   }
   console.log($scope.stages);

   $scope.getStyle=function($index){
       if($scope.stages[$index].Status==='Next'){
           return '#3399ff';
       }else if($scope.stages[$index].Status==='Past'){
           return '#5CE68A';
       }else{
           return '#ccc';
       }
   };
   $scope.selectStageForShow=function(index)
   {
     $rootScope.selectedStage=$scope.stages[index];
   }



}]);
myApp.controller('TreatmentPlanStatusController',['$rootScope','$scope','UserPlanWorkflow',function($rootScope,$scope,UserPlanWorkflow){



	$scope.estimatedTime='3 days';
	    $scope.finishedTreatment=false;
	    var stages=UserPlanWorkflow.getPlanWorkflow();

	    var nextStageIndex=UserPlanWorkflow.getNextStageIndex();
	    var startColor='#5CE68A';
	    var endColor='#3399ff';



	  if(stages.length==0){
	            $scope.noTreatmentPlan=true;
		}
	  else{
	        if(nextStageIndex==stages.length){
	            $scope.outOf=nextStageIndex +' out of '+ stages.length;
	            $scope.treatmentPlanCompleted=true;
	            $scope.percentage=100;
							console.log($scope.treatmentPlanCompleted);
	            $scope.completionDate=stages[nextStageIndex-1].Date;
	            endColor='#5CE68A';
	        }else{
	            $scope.currentStage=stages[nextStageIndex-1].Name;
	            $scope.treatmentPlanCompleted=false;
	            $scope.percentage=Math.floor((100*(nextStageIndex))/stages.length);
	            console.log($scope.percentage);
	            console.log(stages.lenght);
	            console.log(nextStageIndex);
	            $scope.outOf=nextStageIndex +' out of '+ stages.length;
	            var lastStageFinishedPercentage=Math.floor((100*(nextStageIndex-1))/stages.length);
	            var circle2 = new ProgressBar.Circle('#pastStagesTreatmentView', {
	                color: startColor,
	                duration: 2000,
	                easing: 'easeInOut',
	                strokeWidth: 5,
	                step: function(state, circle) {
	                    circle.path.setAttribute('stroke', state.color);
	                }
	            });
	            circle2.animate(lastStageFinishedPercentage/100, {
	                from: {color: startColor},
	                to: {color: startColor}
	            });
	        }
	        var circle = new ProgressBar.Circle('#presentStageTreatmentView', {
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

myApp.controller('flow',function($scope,UserPlanWorkflow){
	$scope.stages=UserPlanWorkflow.getPlanWorkflow();
	console.log($scope.stages);
	if($scope.stages.length>0){
		$scope.noStagePlan=true;
	}else{
		$scope.noStagePlan=false;
	}
	var lengthStage=$scope.stages.length;
	if(lengthStage>8||lengthStage<=6){
		$scope.treatmentPlanLessThanEight=false;
	}else{
		$scope.treatmentPlanLessThanEight=true;
	}

	if($scope.stages.length>=7){

		$scope.classStageClass="col-xs-1 col-md-1 col-sm-1 col-lg-1";
	}else if($scope.stages.length>4){

		$scope.classStageClass="col-xs-2 col-md-2 col-sm-2 col-lg-2";
	}else if($scope.stages.length<=4){
		$scope.classStageClass="col-xs-3 col-md-3 col-sm-3 col-lg-3";
	}
	$scope.dynamicPopover = {
	    content: 'Hello, World!',
	    templateUrl: 'myPopoverTemplate.html',
	    title: 'Title'
  	};
	$scope.numberClass="numberClassCompleted";
	$scope.classCircle=function(index)
	{
		var nextIndex=UserPlanWorkflow.getNextStageIndex();
		if(nextIndex-1===index){
			return 'numberCircle blueCircle';
		}
		var date=$scope.stages[index].Date;
		if(date<new Date()){
			return 'numberCircle greenCircle';
		}else{
			return 'numberCircle';
		}

	};
	/*$scope.progressBarClass=function(index)
	{
		var currentIndex=UserPlanWorkflow.getNextStageIndex();
		var date=$scope.stages[index].Date;
		if(index!==currentIndex-1){
			return 'progress-bar progress-bar-success progress-bar-striped';
		}else{
			return 'progress-bar progress-bar-info progress-bar-striped';
		}

	}*/
  $scope.setBarColor=function(index)
  {
    var currentIndex=UserPlanWorkflow.getNextStageIndex();
    if(currentIndex===$scope.stages.length)
    {
      return 'progress-bar-success';
    }
		if((currentIndex-2)===index&&$scope.stages[currentIndex].Date>new Date()){
			return 'progress-bar-primary';
		}
		var date=$scope.stages[index].Date;
		if(date<new Date()){
			return 'progress-bar-success';
		}else{
			return '';
		}
  }
	$scope.iconClass=function(index){
		var currentIndex=UserPlanWorkflow.getNextStageIndex();
		if(currentIndex-1===index){
			return 'ion-ios-circle-filled';
		}
		var date=$scope.stages[index].Date;
		if(date<new Date()){
			return 'fa fa-check';
		}else{
			return 'ion-ios-circle-outline';
		}
	}
	$scope.setPercentageBar=function(index)
	{
		var currentIndex=UserPlanWorkflow.getNextStageIndex();
		if(currentIndex===index){
			return {width: "0%"};
		}
		var date=$scope.stages[index].Date;
		if(date<new Date()){
			return {width: "100%"};
		}else{
			return {width: "0%"};
		}

	}
});
