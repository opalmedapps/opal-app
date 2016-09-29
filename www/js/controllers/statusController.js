/*
 *Code by David Herrera May 20, 2015
 *Github: dherre3
 *Email:davidfherrerar@gmail.com
 */
var myApp=angular.module('MUHCApp');
myApp.controller('StatusController',['$rootScope','$scope','$timeout', 'UserPlanWorkflow','$anchorScroll','$location','Appointments','NavigatorParameters', '$filter',function($rootScope,$scope,$timeout, UserPlanWorkflow,$anchorScroll,$location,Appointments,NavigatorParameters,$filter){
    //Grabbing navigation parameters for controller
    var param = NavigatorParameters.getParameters();

    $scope.navigator = param.Navigator;
    console.log($scope.navigator);
    var boolStatus = param.Navigator == 'homeNavigator';

    $scope.viewsTitles = [$filter('translate')('TREATMENTPLANNING'), $filter('translate')('TREATMENTSESSION')];

    setStatusPage();
//Sets the entire status page
    function setStatusPage()
    {
        //Check for PlanWorkflow completion and populate with that otherwise start with treatment sessions
        var events;
        $scope.planningCompleted = true;
        $scope.treatmentCompleted = true;
        if (!UserPlanWorkflow.isCompleted()){
            events=UserPlanWorkflow.getPlanWorkflow();
            var nextStageIndex=UserPlanWorkflow.getNextStageIndex();
            initTreatmentPlanStatus(events,nextStageIndex);
        } else{
            events = Appointments.getTreatmentAppointments();
            //If the treatment sessions are not empty adds them to
            if(events.Total !== 0&&boolStatus)
            {
                events.AppointmentList = Appointments.setAppointmentsLanguage(
                    events.AppointmentList);
                initTreatmentSessions(events);
            }
        }
    }
    setHeightElement();

    function setHeightElement()
    {
        //Gets and sets the heights of the table based on the size of the viewport.
        var divTreatment=document.getElementById('divTreatmentPlan');
        //var divTreatmentSessions = document.getElementById('divTreatmentSessions');
        var heightTreatment= 0;
        if($scope.navigator=='personalNavigator')
        {
            heightTreatment= document.documentElement.clientHeight*0.42;
            if(ons.orientation.isPortrait())
            {
                heightTreatment= document.documentElement.clientHeight*0.42;
            }else{
                heightTreatment= document.documentElement.clientWidth*0.42;
            }
        }else{
            if(ons.orientation.isPortrait())
            {
                heightTreatment= (ons.platform.isIOS())?document.documentElement.clientHeight*0.42:document.documentElement.clientHeight*0.42;
            }else{
                heightTreatment= (ons.platform.isIOS())?document.documentElement.clientWidth*0.42:document.documentElement.clientWidth*0.42;
            }
        }
        divTreatment.style.height=heightTreatment+'px';
        //divTreatmentSessions.style.height = heightTreatment+'px';
    }

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

    $scope.goTo = function(whichEvent, event)
    {
        if (whichEvent === 'treatment') goToAppointment(event);
        if (whichEvent === 'plan') goToStep(event);
    }

    //Goes to a particular appointment
    function goToAppointment(appointment)
    {
        if(appointment.ReadStatus == '0')
        {
            Appointments.readAppointmentBySerNum(appointment.AppointmentSerNum);
        }
        NavigatorParameters.setParameters({'Navigator':'homeNavigator', 'Post':appointment});
        homeNavigator.pushPage('./views/personal/appointments/individual-appointment.html');
    };

    function goToStep(step)
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
        $scope.events=stages;
        $scope.eventType = 'plan';
        //$scope.estimatedTime='3 days';
        //$scope.finishedTreatment=false;
        var startColor='#5CE68A';
        var endColor='#3399ff';
        if(stages.length === 0){
            $scope.noData=true;
        }else{
            if(nextStageIndex==stages.length){
                $scope.eventIndex = nextStageIndex;
                $scope.totalEvents=stages.length;
                $scope.planningCompleted=true;
                $scope.percentage=100;
                $scope.completionDate=stages[nextStageIndex-1].Date;
                endColor='#5CE68A';
            }else{
                $scope.currentEvent=stages[nextStageIndex-1].Name;
                $scope.planningCompleted=false;
                $scope.percentage=Math.floor((100*(nextStageIndex))/stages.length);
                $scope.eventIndex = nextStageIndex;
                $scope.totalEvents=stages.length;
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
        $scope.eventType = 'treatment';
        $scope.noData = false;
        var appointments = sessions.AppointmentList;
        $scope.events = appointments;
        $scope.endingDate = appointments[appointments.length-1].ScheduledStartTime;
        if(appointments.length > 0)
        {
            $scope.showTreatments = true;
            if(sessions.Completed)
            {
                $scope.eventIndex = sessions.CurrentAppointment.Index;
                $scope.totalEvents = sessions.Total;
                $scope.treatmentCompleted = true;
/*                $scope.totalTreatments = sessions.Total;
                $scope.stepStatusTreatment = sessions.Total +' of '+sessions.Total;*/
                var circleCurrent = new ProgressBarStatus('#progressStatusPresentStage2',100, startColor, startColor, 2000);
                var anchor = 'treatmentSessions'+sessions.Total-1;
                setTimeout(function(){
                    $location.hash(anchor);
                    $anchorScroll();
                },400);
            }else{
                $scope.treatmentCompleted = false;
                $scope.eventIndex = sessions.CurrentAppointment.Index;
                $scope.totalEvents = sessions.Total;
                //$scope.totalTreatments = sessions.Total;
                //$scope.stepStatusTreatment = sessions.CurrentAppointment.Index +' of '+sessions.Total;
                $scope.currentEvent = sessions.CurrentAppointment.Appointment;
                console.log($scope.currentEvent);
                var percentageCurrent = Math.floor(100*(sessions.CurrentAppointment.Index/sessions.Total));
                var percentageCompleted = Math.floor(100*((sessions.CurrentAppointment.Index-1)/sessions.Total));
                console.log(percentageCurrent);
                console.log(percentageCompleted);
                var circleCurrent = new ProgressBarStatus('#progressStatusPastStages2', percentageCompleted, startColor, startColor, 2000);
                var circleCurrent = new ProgressBarStatus('#progressStatusPresentStage2', percentageCurrent, startColor, endColor, 2000);
                var circleCurrent = new ProgressBarStatus('#progressStatusStage', 100, '#ccc', '#ccc', 2000);
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
