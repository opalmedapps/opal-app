var myApp=angular.module('MUHCApp');
myApp.controller('StatusController',['$rootScope','$scope','$timeout', 'UserPlanWorkflow','$anchorScroll','$location','Appointments','NavigatorParameters', function($rootScope,$scope,$timeout, UserPlanWorkflow,$anchorScroll,$location,Appointments,NavigatorParameters){

  $scope.indexPage=0;
  $scope.numberPlans=2;
  var param = NavigatorParameters.getParameters();  
  var boolStatus = (param.Navigator == 'homeNavigator')? true : false;
  console.log(boolStatus);
  /*document.addEventListener('ons-carousel:init', function(e) {
  var mycarousel= e.component;
  mycarousel.on('postchange',function(event){
      $timeout(function(){
        $scope.indexPage=event.activeIndex;
      });
  });
});*/
listenerCarouselInit(boolStatus);
function listenerCarouselInit(bool)
{
  
  document.addEventListener('ons-carousel:init', function(ev) {
    $scope.carousel = ev.component;
    setCarouselItems(bool);
  });
}

function setCarouselItems(status)
{
    $scope.carousel.setSwipeable(status);
    $scope.carousel.setAutoScrollEnabled(status);
    $scope.carousel.setOverscrollable(status);
}
setStatusPage();
function setStatusPage()
{
  var appointmentsSession = Appointments.getTreatmentAppointments();
  var stages=UserPlanWorkflow.getPlanWorkflow();

  var nextStageIndex=UserPlanWorkflow.getNextStageIndex();
    initTreatmentPlanStatus(stages,nextStageIndex);
  if(appointmentsSession.AppointmentList.length == 0)
  {
    listenerCarouselInit(false);
  }else{
    console.log('Do not show!!!');
    appointmentsSession.AppointmentList = Appointments.setAppointmentsLanguage(appointmentsSession.AppointmentList);
    console.log(appointmentsSession.AppointmentList);
    initTreatmentSessions(appointmentsSession);
    if(stages.length == nextStageIndex)
    {
      console.log(carousel);
      $scope.carousel.setActiveCarouselItemIndex(1);
    }
  }
}


$scope.goToAppointment=function(appointment)
{
  if(appointment.ReadStatus == '0')
  {
    Appointments.readAppointmentBySerNum(appointment.AppointmentSerNum);
  }
  NavigatorParameters.setParameters({'Navigator':'homeNavigator', 'Post':appointment});
  homeNavigator.pushPage('./views/personal/appointments/individual-appointment.html');
}
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

    var divTreatment=document.getElementById('divTreatmentPlan');
    var divTreatmentSessions = document.getElementById('divTreatmentSessions');
    var heightTreatment=document.documentElement.clientHeight-360;
    divTreatment.style.height=heightTreatment+'px';
    divTreatmentSessions.style.height = heightTreatment+'px';
    $scope.getStyle=function(app){
      if(app.hasOwnProperty('Status'))
      {
        if(app.Status==='Next'){
            return '#3399ff';
        }else if(app.Status==='Past'){
            return '#5CE68A';
        }else{
            return '#ccc';
        }
      }else{
        if(app.TimeStatus==='Next'){
            return '#3399ff';
        }else if(app.TimeStatus==='Past'){
            return '#5CE68A';
        }else{
            return '#ccc';
        }
      }

    };


    $scope.goToStep=function(step)
    {
      if(boolStatus)
      {
        NavigatorParameters.setParameters({'Navigator':'homeNavigator','Post':step})
        homeNavigator.pushPage('./views/home/status/individual-step.html');
      }else{
        NavigatorParameters.setParameters({'Navigator':'personalNavigator','Post':step})
        personalNavigator.pushPage('./views/home/status/individual-step.html');
      }

    }

    function initTreatmentPlanStatus(stages, nextStageIndex){
      $scope.stages=UserPlanWorkflow.getPlanWorkflow();
      $scope.estimatedTime='3 days';
      $scope.finishedTreatment=false;
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
              $scope.outOf=nextStageIndex +' of '+ stages.length;
              var lastStageFinishedPercentage=Math.floor((100*(nextStageIndex-1))/stages.length);
              var circlePast = ProgressBarStatus('#progressStatusPastStages2', lastStageFinishedPercentage, startColor, startColor, 2000);

              /*var circle2 = new ProgressBar.Circle(, {
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
              });*/
          }
          var circleCurrent = new ProgressBarStatus('#progressStatusPresentStage2', $scope.percentage, startColor, endColor, 2000);
          var circleCurrent = new ProgressBarStatus('#progressStatusStage', 100, '#ccc', '#ccc', 2000);


      }
      console.log('initiating');
      var anchor="statusStep"+nextStageIndex;
      setTimeout(function(){
        $location.hash(anchor);
        $anchorScroll();
      },400)

    }
    //initTreatmentSessions();

      function initTreatmentSessions(sessions)
      {
        console.log('Initiating treatment sessions');
        var startColor='#5CE68A';
        var endColor='#3399ff';
        $scope.showTreatments = false;
        $scope.sessionList = sessions.AppointmentList;
        $scope.endingDate = $scope.sessionList[$scope.sessionList.length-1].ScheduledStartTime;
        console.log($scope.sessionList);
        if($scope.sessionList.length > 0)
        {
          $scope.showTreatments = true;
          if(sessions.Completed)
          {
            console.log('completed');
            $scope.totalTreatments = sessions.Total;
            $scope.stepStatusTreatment = sessions.Total +' of '+sessions.Total;
            var circleCurrent = new ProgressBarStatus('#progressStatusPresentStage3',100, startColor, startColor, 2000);
          }else{
            $scope.totalTreatments = sessions.Total;
            $scope.stepStatusTreatment = sessions.CurrentAppointment.Index +' of '+sessions.Total;
            $scope.currentState = sessions.CurrentAppointment.Appointment;
            console.log($scope.currentState);
            var percentageCurrent = Math.floor(100*(sessions.CurrentAppointment.Index/sessions.Total));
            var percentageCompleted = Math.floor(100*((sessions.CurrentAppointment.Index-1)/sessions.Total));
            console.log(percentageCurrent);
            console.log(percentageCompleted);
            var circleCurrent = new ProgressBarStatus('#progressStatusPastStage3', percentageCompleted, startColor, startColor, 2000);
            var circleCurrent = new ProgressBarStatus('#progressStatusPresentStage3', percentageCurrent, startColor, endColor, 2000);
            var circleCurrent = new ProgressBarStatus('#progressStatusSession', 100, '#ccc', '#ccc', 2000);
          }


        }
      }
      function ProgressBarStatus(id, percentage,startColor,endColor,duration)
      {
        this.circle = new ProgressBar.Circle(id, {
            color: endColor,
            duration: duration,
            easing: 'easeInOut',
            strokeWidth: 5,
            step: function(state, circle) {
                circle.path.setAttribute('stroke', state.color);
            }
        });
        this.circle.animate(percentage/100, {
            from: {color: startColor},
            to: {color: endColor}
        });
      }


      //$location.hash("statusStep0");


}]);
myApp.controller('IndividualStepController',['$scope','$timeout','NavigatorParameters',function($scope,$timeout,NavigatorParameters){
  //Enter code here!!
  var param = NavigatorParameters.getParameters();
  console.log(param);
  $scope.stage=param.Post;
  $scope.showTab=true;


}]);
