/*
 *  Code by David Herrera May 20, 2015, refactored by Robert September 30
 *  Github: dherre3, blakholesun
 *  Email:davidfherrerar@gmail.com, robert.maglieri@gmail.com
 *  Description: Controller for the patient's status. Will display plan or treatment status
 *  based on the patient's current situation.
 */

(function() {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('StatusController', StatusController);

    StatusController.$inject = ['$anchorScroll','$location','Appointments',
        'NavigatorParameters', '$filter', 'PlanningSteps'];

    function StatusController($anchorScroll,$location,
                              Appointments,NavigatorParameters,$filter, PlanningSteps)
    {
        /* jshint validthis: true */
        var statusVm = this;

        var params =NavigatorParameters.getParameters();
        var boolStatus = params.Navigator == 'homeNavigator';

        statusVm.navigator = params.Navigator;  // getting the navigator from the service
        statusVm.viewTitles = [$filter('translate')('TREATMENTPLANNING'), $filter('translate')('TREATMENTSESSION')];
        statusVm.noData = false;                // presence of planning or session data
        statusVm.planningCompleted = true;
        statusVm.treatmentCompleted = true;
        statusVm.events = {};                   // planning or treatment event list
        statusVm.eventType = '';                // determines event type plan or treatment
        statusVm.eventIndex = 0;                // tracker for the events
        statusVm.totalEvents= 0;                // total number of events
        statusVm.percentage=0;                  // percentage completion for each eventtype
        statusVm.completionDate='';             // date of plan completion
        statusVm.currentEvent='';               // current event in sequence
        statusVm.endingDate = '';               // treatment end date
        statusVm.today = new Date();
        statusVm.stepMapping = {
            'CT for Radiotherapy Planning': 1,
            'Physician Plan Preparation': 2,
            'Calculation of Dose': 3,
            'Physics Quality Control': 4,
            'Scheduling': 5
        }

        statusVm.getStyle = getStyle;           // function which determines style
        statusVm.goTo = goTo;                   // function which provides details on the event

        activate();                             // initializes status page

        console.log(statusVm.events);

        function activate()
        {
            //Check for PlanWorkflow completion and populate with that otherwise start with treatment sessions
            var events;
            statusVm.planningCompleted = true;
            statusVm.treatmentCompleted = true;
            console.log(PlanningSteps.isCompleted());

            if (PlanningSteps.isCompleted() || !boolStatus){
                events = PlanningSteps.getPlanningSequence();
                var currentStep = PlanningSteps.getCurrentStep();
                console.log(currentStep);
                initTreatmentPlanStatus(events,currentStep);

            } /*else{

                events = Appointments.getTreatmentAppointments();
                //If the treatment sessions are not empty adds them to
                if(events.Total !== 0&&boolStatus)
                {
                    events.AppointmentList = Appointments.setAppointmentsLanguage(
                        events.AppointmentList);
                    initTreatmentSessions(events);
                }
            }*/
            setHeightElement();
        }

        function setHeightElement()
        {
            //Gets and sets the heights of the table based on the size of the viewport.
            var divTreatment=document.getElementById('divTreatmentPlan');
            //var divTreatmentSessions = document.getElementById('divTreatmentSessions');
            var heightTreatment= 0;
            if(statusVm.navigator=='personalNavigator')
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

        function initTreatmentPlanStatus(stages, currentStep){
            console.log('Inside Status init');
            statusVm.events=stages;
            statusVm.eventType = 'plan';
            statusVm.totalEvents = 5;

            var nextStepIndex = statusVm.stepMapping[currentStep] + 1;
            console.log(nextStepIndex);
            statusVm.eventIndex = nextStepIndex;
            //statusVm.estimatedTime='3 days';
            //statusVm.finishedTreatment=false;
            var startColor='#5CE68A';
            var endColor='#3399ff';

            if(stages['CT for Radiotherapy Planning'].length === 0){
                statusVm.noData=true;
            }else{
                if(PlanningSteps.isCompleted()){
                    statusVm.planningCompleted=true;
                    statusVm.percentage=100;
                    statusVm.completionDate=stages['Scheduling'][stages['Scheduling'].length-1].DueDateTime;
                    endColor='#5CE68A';
                }else{
                    statusVm.currentEvent=stages[currentStep];
                    statusVm.planningCompleted=false;
                    statusVm.percentage=Math.floor((100*(nextStepIndex))/stages.length);
                    var lastStageFinishedPercentage=Math.floor((100*(nextStepIndex))/5);
                    var circlePast = ProgressBarStatus('#progressStatusPastStages2', lastStageFinishedPercentage, startColor, startColor, 2000);
                }
                var circleCurrent = new ProgressBarStatus('#progressStatusPresentStage2', statusVm.percentage, startColor, endColor, 2000);
                var circleCurrent = new ProgressBarStatus('#progressStatusStage', 100, '#ccc', '#ccc', 2000);
            }
            console.log('initiating');
            var anchor="statusStep"+nextStepIndex;
            setTimeout(function(){
                $location.hash(anchor);
                $anchorScroll();
            },400);

        }


        /*function initTreatmentSessions(sessions)
        {
            var startColor='#5CE68A';
            var endColor='#3399ff';
            statusVm.eventType = 'treatment';
            statusVm.noData = false;
            var appointments = sessions.AppointmentList;
            statusVm.events = appointments;
            statusVm.endingDate = appointments[appointments.length-1].ScheduledStartTime;
            if(appointments.length > 0)
            {
                statusVm.showTreatments = true;
                if(sessions.Completed)
                {
                    statusVm.eventIndex = sessions.CurrentAppointment.Index;
                    statusVm.totalEvents = sessions.Total;
                    statusVm.treatmentCompleted = true;
                    /!*                statusVm.totalTreatments = sessions.Total;
                     statusVm.stepStatusTreatment = sessions.Total +' of '+sessions.Total;*!/
                    var circleCurrent = new ProgressBarStatus('#progressStatusPresentStage2',100, startColor, startColor, 2000);
                    var anchor = 'treatmentSessions'+sessions.Total-1;
                    setTimeout(function(){
                        $location.hash(anchor);
                        $anchorScroll();
                    },400);
                }else{
                    statusVm.treatmentCompleted = false;
                    statusVm.eventIndex = sessions.CurrentAppointment.Index;
                    statusVm.totalEvents = sessions.Total;
                    //statusVm.totalTreatments = sessions.Total;
                    //statusVm.stepStatusTreatment = sessions.CurrentAppointment.Index +' of '+sessions.Total;
                    statusVm.currentEvent = sessions.CurrentAppointment.Appointment;
                    console.log(statusVm.currentEvent);
                    var percentageCurrent = Math.floor(100*(sessions.CurrentAppointment.Index/sessions.Total));
                    var percentageCompleted = Math.floor(100*((sessions.CurrentAppointment.Index-1)/sessions.Total));
                    console.log(percentageCurrent);
                    console.log(percentageCompleted);
                    var circleCurrent = new ProgressBarStatus('#progressStatusPastStages2', percentageCompleted, startColor, startColor, 2000);
                    var circleCurrent = new ProgressBarStatus('#progressStatusPresentStage2', percentageCurrent, startColor, endColor, 2000);
                    var circleCurrent = new ProgressBarStatus('#progressStatusStage', 100, '#ccc', '#ccc', 2000);
                    var anchor = 'treatmentSessions'+sessions.CurrentAppointment.Index-1;
                    setTimeout(function(){
                        $location.hash(anchor);
                        $anchorScroll();
                    },400);
                }
            }
        }*/

        function ProgressBarStatus(id, percentage,startColor,endColor,duration)
        {
            var circle = new ProgressBar.Circle(id, {
                color: endColor,
                duration: duration,
                easing: 'easeInOut',
                strokeWidth: 5,
                step: function(state, circle) {
                    circle.path.setAttribute('stroke', state.color);
                }
            });
            circle.animate(percentage/100, {
                from: {color: startColor},
                to: {color: endColor}
            });
        }

        function getStyle(app){
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

        }

        function goTo(whichEvent, event)
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
        }

        function goToStep(step)
        {
            console.log(step);
            if(boolStatus)
            {
                NavigatorParameters.setParameters({'Navigator':'homeNavigator','Post':step});
                homeNavigator.pushPage('./views/home/status/individual-step.html');
            }else{
                console.log(step);
                NavigatorParameters.setParameters({'Navigator':'personalNavigator','Post':step});
                personalNavigator.pushPage('./views/home/status/individual-step.html');
            }

        }

    }
})();

(function() {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('IndividualStepController', IndividualStepController);

    IndividualStepController.$inject = ['$scope','NavigatorParameters'];

    function IndividualStepController($scope,NavigatorParameters) {

        var stepVM = this;
        stepVM.stage = NavigatorParameters.getParameters().Post;
        stepVM.showTab = true;
    }

})();
