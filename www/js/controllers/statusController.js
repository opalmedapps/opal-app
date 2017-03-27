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
        var boolStatus = params.Navigator == 'homeNavigator';

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

        console.log(statusVm.events);

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

            console.log(currentStep);
            initTreatmentPlanStatus(events,currentStep);
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
            console.log(stages);
            statusVm.eventType = 'plan';
            statusVm.totalEvents = 5;

            var nextStepIndex = statusVm.stepMapping[currentStep] + 1;
            console.log(nextStepIndex);
            statusVm.eventIndex = nextStepIndex;
            //statusVm.estimatedTime='3 days';
            //statusVm.finishedTreatment=false;
            var startColor='#5CE68A';
            var endColor='#3399ff';

            if(stages['CT for Radiotherapy Planning'].length == 0){
                statusVm.noData=true;
            }else{
                if(PlanningSteps.isCompleted()){
                    statusVm.planningCompleted=true;
                    statusVm.percentage=100;
                    statusVm.completionDate=stages['Scheduling Treatments'][stages['Scheduling Treatments'].length-1].DueDateTime;
                    endColor='#5CE68A';
                }else{
                    statusVm.currentEvent=currentStep;
                    console.log(statusVm.currentEvent);
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
            console.log(step, name);
            if(boolStatus)
            {
                NavigatorParameters.setParameters({'Navigator':'homeNavigator','Post':step, 'StepName': name});
                homeNavigator.pushPage('./views/home/status/individual-step.html');
            }else{
                console.log(step);
                NavigatorParameters.setParameters({'Navigator':'personalNavigator','Post':step, 'StepName': name});
                personalNavigator.pushPage('./views/home/status/individual-step.html');
            }

        }

    }
})();

/**
 * Controls the view for the treatment planning step information.
 */

(function() {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('IndividualStepController', IndividualStepController);

    IndividualStepController.$inject = ['NavigatorParameters', 'UserPreferences','$filter', 'Logger'];

    function IndividualStepController(NavigatorParameters, UserPreferences, $filter, Logger) {

        var stepVM = this;
        var nav = NavigatorParameters.getNavigator();

        stepVM.showTab = true;
        stepVM.about = about;
        stepVM.stage = {};

        activate();

        function activate() {
            stepVM.stage = NavigatorParameters.getParameters().Post;
            stepVM.name = NavigatorParameters.getParameters().StepName;
            Logger.sendLog('Treatment Plan', stepVM.stage);
            console.log(stepVM.stage);
        }

        //Links to the about page controlled by the contentController
        function about() {
            nav.pushPage('./views/templates/content.html', {
                contentLink: stepVM.stage ? stepVM.stage["URL_"+UserPreferences.getLanguage()] : '',
                contentType: $filter('translate')(stepVM.name)
            });
        }
        
    }

})();
