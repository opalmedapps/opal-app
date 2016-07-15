var myApp=angular.module('MUHCApp');
myApp.controller('TreatmentPlanController',['$rootScope','$scope','$timeout', 'UserPlanWorkflow','$anchorScroll','$location',function($rootScope,$scope,$timeout, UserPlanWorkflow,$anchorScroll,$location){
  initTreatmentPlanStatus();
  initTreatmentList();
  $scope.indexPage=0;
  $scope.numberPlans=2;

  document.addEventListener('ons-carousel:init', function(e) {
  var mycarousel= e.component;
  mycarousel.on('postchange',function(event){
      $timeout(function(){
        $scope.indexPage=event.activeIndex;
      });
  });
});
$scope.pickPagePagination=function(index)
{
  if(index==$scope.indexPage)
  {
    return "iconHomeView fa fa-circle";
  }else{
    return "iconHomeView fa fa-circle-o";
  }
}
  $scope.load = function($done) {
    RequestToServer.sendRequest('Refresh','All');
    $timeout(function() {
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
    var divTreatment=document.getElementById('divTreatmentPlan');
    console.log(divTreatment);
    var heightTreatment=document.documentElement.clientHeight-335;
    divTreatment.style.height=heightTreatment+'px';
    console.log(divTreatment.style.height);

    /*$scope.$watch('treatment.choice',function(){
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
    });*/
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
              $scope.outOf=nextStageIndex +' of '+ stages.length;
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
              $scope.outOf=nextStageIndex +' of '+ stages.length;
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
      console.log('initiating');
      var anchor="treatmentPlanStage"+nextStageIndex;
      setTimeout(function(){
        $location.hash(anchor);
        $anchorScroll();
      },400)
    }

}]);
myApp.controller('IndividualStageController',['$scope','$timeout','UserPlanWorkflow',function($scope,$timeout,UserPlanWorkflow){
  if(typeof personalNavigator!=='undefined'&&typeof personalNavigator.getCurrentPage()!=='undefined')
  {
    var page = personalNavigator.getCurrentPage();
    if(page.options.flag=='TreatmentPlan')
    {
      delete page.options.flag;
      var stage = page.options.param;
      console.log(stage);
      $scope.stage=stage;
      $scope.showTab=false;
    }else{
      $scope.stage=UserPlanWorkflow.getNextStage();
      $scope.showTab=true;
    }
  }else{
    $scope.stage=UserPlanWorkflow.getNextStage();
    $scope.showTab=true;
  }
  }]);
