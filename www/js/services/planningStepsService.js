(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .factory('PlanningSteps', PlanningSteps);

    PlanningSteps.$inject = ['Tasks', 'Appointments'];

    /* @ngInject */
    function PlanningSteps(Tasks, Appointments) {

        var currentStep = '';
        var sequence = {
            'CT for Radiotherapy Planning': [],
            'Physician Plan Preparation': [],
            'Calculation of Dose': [],
            'Physics Quality Control': [],
            'Scheduling': []
        };

        var service = {
            getPlanningSequence: getPlanningSequence,
            initializePlanningSequence: initializePlanningSequence,
            getCurrentStep: getCurrentStep,
            isCompleted: isCompleted
        };

        // Initilaize the sequence when app is loaded
        initializePlanningSequence();

        return service;

        ////////////////

        function getPlanningSequence() {
            return sequence;
        }

        function initializePlanningSequence(){
            var ctAppointment = getCTSimAppointment();
            var planningTasks = Tasks.getAllRecentTasks();

            console.log(ctAppointment);
            planningTasks.unshift(ctAppointment);

            for (var task in planningTasks){

                //Checking to see if appointment or task since they have different properties.
                if (planningTasks[task].hasOwnProperty('TaskName_EN')){
                    sequence[planningTasks[task].TaskName_EN].push(planningTasks[task]);

                } else if (planningTasks[task].hasOwnProperty('AppointmentType_EN')){
                    sequence[planningTasks[task].AppointmentType_EN].push(planningTasks[task]);
                }
            }
            currentStep = planningTasks[task];
            console.log(sequence);

        }

        // Gets the most recent CT Sim
        function getCTSimAppointment(){

            var appointments = Appointments.getUserAppointments();
            var mdTask = Tasks.getRecentPhysicianTask();
            var ctAppointment = {};
            //console.log(mdTask);
            // Appointments are sorted, so scanning starts at the end
            for (var i = appointments.length-1; i!=0; i--){
                //console.log(appointments[i]);
                if (appointments[i].AppointmentType_EN === 'CT for Radiotherapy Planning'
                    && appointments[i].ScheduledStartTime < mdTask.physicianTask.DueDateTime) {

                    ctAppointment = appointments[i];
                    break;

                }
            }

            return ctAppointment;
        }

        function isCompleted(){
            return sequence['Scheduling'].length > 0;
        }

        function getCurrentStep(){
            return currentStep.TaskName_EN || currentStep.AppointmentType_EN;
        }
    }

})();

