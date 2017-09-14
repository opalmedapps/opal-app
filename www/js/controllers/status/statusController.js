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
        'NavigatorParameters', '$filter', 'PlanningSteps', 'UserPreferences', 'Logger'];

    function StatusController($anchorScroll,$location, Appointments,
                              NavigatorParameters,$filter, PlanningSteps, UserPreferences, Logger)
    {
        var statusVm = this;

        var params =NavigatorParameters.getParameters();
        var boolStatus = params.Navigator === 'homeNavigator';

        statusVm.navigator = params.Navigator;  // getting the navigator from the service
        statusVm.viewTitles = [$filter('translate')('TREATMENTPLANNING'), $filter('translate')('TREATMENTSESSION')];
        statusVm.noData = false;                // presence of planning or session data
        statusVm.planningCompleted = true;
        statusVm.events = {};                   // planning or treatment event list
        statusVm.eventType = '';                // determines event type plan or treatment
        statusVm.eventIndex = 0;                // tracker for the events
        statusVm.totalEvents= 0;                // total number of events
        statusVm.percentage=0;                  // percentage completion for each eventtype
        statusVm.completionDate='';             // date of plan completion
        statusVm.currentEvent='';               // current event in sequence
        statusVm.endingDate = '';               // treatment end date
        statusVm.today = new Date();
        statusVm.language = UserPreferences.getLanguage();
        statusVm.stepMapping = {
            'CT for Radiotherapy Planning': 1,
            'Physician Plan Preparation': 2,
            'Calculation of Dose': 3,
            'Physics Quality Control': 4,
            'Scheduling Treatments': 5
        }

        statusVm.getStyle = getStyle;           // function which determines style
        statusVm.goToStep = goToStep;           // function which provides details on the event

        activate();                             // initializes status page

        function activate()
        {
            //Check for plan completion and populate
            PlanningSteps.initializePlanningSequence();
            Logger.sendLog('Treatment Plan', 'all');

            var events;
            statusVm.planningCompleted = true;
            statusVm.treatmentCompleted = true;
            events = PlanningSteps.getPlanningSequence();
            var currentStep = PlanningSteps.getCurrentStep();


            initTreatmentPlanStatus(events,currentStep);
            //setHeightElement();
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
            statusVm.events=stages;
            statusVm.eventType = 'plan';
            statusVm.totalEvents = 5;

            var nextStepIndex = statusVm.stepMapping[currentStep] + 1;

            statusVm.eventIndex = nextStepIndex;
            //statusVm.estimatedTime='3 days';
            //statusVm.finishedTreatment=false;
            var startColor='#00E676';
            var endColor='#3399ff';

            if(stages['CT for Radiotherapy Planning'].length == 0){
                statusVm.noData=true;
                statusVm.bg_color = "#F9F9F9"
            }else{
                if(PlanningSteps.isCompleted()){
                    statusVm.planningCompleted=true;
                    statusVm.percentage=100;
                    statusVm.completionDate=stages['Scheduling Treatments'][stages['Scheduling Treatments'].length-1].DueDateTime;
                    endColor='#00E676';
                }else{
                    statusVm.currentEvent=currentStep;
                    statusVm.planningCompleted=false;
                    statusVm.percentage=Math.floor((100*(nextStepIndex))/stages.length);
                    var lastStageFinishedPercentage=Math.floor((100*(nextStepIndex))/5);
                    var circlePast = ProgressBarStatus('#progressStatusPastStages2', lastStageFinishedPercentage, startColor, startColor, 2000);
                }
                var circleCurrent = new ProgressBarStatus('#progressStatusPresentStage2', statusVm.percentage, startColor, endColor, 2000);
                var circleCurrent = new ProgressBarStatus('#progressStatusStage', 100, '#ccc', '#ccc', 2000);
            }
            var anchor="statusStep"+nextStepIndex;
            setTimeout(function(){
                $location.hash(anchor);
                $anchorScroll();
            },400);

        }

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

        function goToStep(step, name)
        {

            if(boolStatus)
            {
                NavigatorParameters.setParameters({'Navigator':'homeNavigator','Post':step, 'StepName': name});
                homeNavigator.pushPage('./views/home/status/individual-step.html');
            }else{

                NavigatorParameters.setParameters({'Navigator':'personalNavigator','Post':step, 'StepName': name});
                personalNavigator.pushPage('./views/home/status/individual-step.html');
            }

        }

    }
})();
