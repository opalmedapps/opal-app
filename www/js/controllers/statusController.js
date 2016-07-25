var myApp=angular.module('MUHCApp');
myApp.controller('StatusController',['$rootScope','$scope','$timeout', 'UserPlanWorkflow','$anchorScroll','$location','Appointments','NavigatorParameters', function($rootScope,$scope,$timeout, UserPlanWorkflow,$anchorScroll,$location,Appointments,NavigatorParameters){
  //Grabbing navigation parameters for controller
  var param = NavigatorParameters.getParameters(); 
  
  $scope.navigator = param.Navigator;
  console.log($scope.navigator);
  var boolStatus = (param.Navigator == 'homeNavigator')? true : false;
  // var divTreatment=document.getElementById('divStatusPage');
  // console.log(divTreatment);
  // var heightTreatment=document.documentElement.clientHeight-118;
  // divTreatment.style.height=heightTreatment+'px';
  
  $scope.viewsTitles = ['Treatment plan status', 'Treatment sessions status'];
//Initializing the carousel item 
document.addEventListener('ons-carousel:init',initCarouselCallback);
document.addEventListener('ons-carousel:postchange',postChangeCarousel);
ons.orientation.on("change", function (event) {
  console.log(event.isPortrait); // e.g. portrait
  var i = $scope.carousel._scroll / $scope.carousel._currentElementSize;
  delete $scope.carousel._currentElementSize;
  $scope.carousel.setActiveCarouselItemIndex(i);
});

function postChangeCarousel(ev)
{
  $timeout(function()
  {
    $scope.activeIndex = ev.activeIndex;
  });
}
$scope.goBack = function()
{
  $scope.carousel.setActiveCarouselItemIndex(0);
};
$scope.goNext = function()
{
  $scope.carousel.setActiveCarouselItemIndex(1);
};



//Callback for carousel initializer listener
function initCarouselCallback(ev) {
    $scope.carousel = ev.component;
    setCarouselParameters(boolStatus);
    setStatusPage();
}
function setCarouselParameters(bool)
{
  $scope.carousel.setSwipeable(boolStatus);
  $scope.carousel.setAutoScrollEnabled(boolStatus);
  $scope.carousel.setOverscrollable(boolStatus);
}
//Removing event listeners and cleaning up
$scope.$on('$destroy',function()
{
  document.removeEventListener('ons-carousel:init',initCarouselCallback);
  document.removeEventListener('ons-carousel:postchange',postChangeCarousel);
  ons.orientation.off("change");
});

//Sets the entire status page
function setStatusPage()
{
  //Obtains treatment sessions
  var appointmentsSession = Appointments.getTreatmentAppointments();
  var stages=UserPlanWorkflow.getPlanWorkflow();
  var nextStageIndex=UserPlanWorkflow.getNextStageIndex();
  initTreatmentPlanStatus(stages,nextStageIndex);
  //If the treatment sessions are not empty adds them to 
  if(appointmentsSession.Total !== 0&&boolStatus)
  {
    appointmentsSession.AppointmentList = Appointments.setAppointmentsLanguage(appointmentsSession.AppointmentList);
    if(stages.length == nextStageIndex)$scope.carousel.setActiveCarouselItemIndex(1);
    initTreatmentSessions(appointmentsSession);
  }
}

  //Goes to a particular appointment 
    $scope.goToAppointment=function(appointment)
    {
      if(appointment.ReadStatus == '0')
      {
        Appointments.readAppointmentBySerNum(appointment.AppointmentSerNum);
      }
      NavigatorParameters.setParameters({'Navigator':'homeNavigator', 'Post':appointment});
      homeNavigator.pushPage('./views/personal/appointments/individual-appointment.html');
    };
    //Gets and sets the heights of the table based on the size of the viewport.
    var divTreatment=document.getElementById('divTreatmentPlan');
    var divTreatmentSessions = document.getElementById('divTreatmentSessions');
    var heightTreatment= ($scope.navigator=='personalNavigator')?document.documentElement.clientHeight-340:document.documentElement.clientHeight-360;
    divTreatment.style.height=heightTreatment+'px';
    divTreatmentSessions.style.height = heightTreatment+'px';

    //Gets the colors of the table cells 
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

    };

    function initTreatmentPlanStatus(stages, nextStageIndex){
      $scope.stages=UserPlanWorkflow.getPlanWorkflow();
      $scope.estimatedTime='3 days';
      $scope.finishedTreatment=false;
      var startColor='#5CE68A';
      var endColor='#3399ff';
      if(stages.length === 0){
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
          }
          var circleCurrent = new ProgressBarStatus('#progressStatusPresentStage2', $scope.percentage, startColor, endColor, 2000);
          var circleCurrent = new ProgressBarStatus('#progressStatusStage', 100, '#ccc', '#ccc', 2000);
      }
      console.log('initiating');
      var anchor="statusStep"+nextStageIndex;
      setTimeout(function(){
        $location.hash(anchor);
        $anchorScroll();
      },400);

    }


      function initTreatmentSessions(sessions)
      {
        var startColor='#5CE68A';
        var endColor='#3399ff';
        $scope.showTreatments = false;
        $scope.sessionList = sessions.AppointmentList;
        $scope.endingDate = $scope.sessionList[$scope.sessionList.length-1].ScheduledStartTime;
        if($scope.sessionList.length > 0)
        {
          $scope.showTreatments = true;
          if(sessions.Completed)
          {
            $scope.treatmentCompleted = true;
            $scope.totalTreatments = sessions.Total;
            $scope.stepStatusTreatment = sessions.Total +' of '+sessions.Total;
            var circleCurrent = new ProgressBarStatus('#progressStatusPresentStage3',100, startColor, startColor, 2000);
            var anchor = 'treatmentSessions'+sessions.Total-1;
            setTimeout(function(){
              $location.hash(anchor);
              $anchorScroll();
            },400);
          }else{
            $scope.treatmentCompleted = false;
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
            var anchor = 'treatmentSessions'+sessions.CurrentAppointment.Index;
            setTimeout(function(){
              $location.hash(anchor);
              $anchorScroll();
            },400);
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
