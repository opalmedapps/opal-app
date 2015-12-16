var myApp=angular.module('MUHCApp');
myApp.controller('TreatmentPlanController',['$rootScope','$scope','$timeout', 'UserPlanWorkflow',function($rootScope,$scope,$timeout, UserPlanWorkflow){
  initTreatmentPlanStatus();
  initTreatmentList();
  $scope.load = function($done) {
    $timeout(function() {
      RequestToServer.sendRequest('Refresh','All');
      loadInfo();
          $done();
    }, 3000);
  };

  function loadInfo(){

  }
   $scope.closeAlert = function () {
        $rootScope.showAlert=false;
    };

    function initTreatmentList(){
      $scope.treatment={
          choice:'All'
      }
      $scope.stages=UserPlanWorkflow.getPlanWorkflow();

    }


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


    function initTreatmentPlanStatus(){
      $scope.estimatedTime='3 days';
      $scope.finishedTreatment=false;
      var stages=UserPlanWorkflow.getPlanWorkflow();
      var nextStageIndex=UserPlanWorkflow.getNextStageIndex();
      var startColor='#5CE68A';
      var endColor='#3399ff';


      if(stages.length==0){
              $scope.noTreatmentPlan=true;
      }else{
          if(nextStageIndex==stages.length){
              $scope.outOf=nextStageIndex +' out of '+ stages.length;
              $scope.treatmentPlanCompleted=true;
              $scope.percentage=100;
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
              var circle2 = new ProgressBar.Circle('#progressStatusPastStages', {
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
          var circle = new ProgressBar.Circle('#progressStatusPresentStage', {
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
    }

}]);
