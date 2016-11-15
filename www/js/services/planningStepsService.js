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
            'Scheduling Treatments': []
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

            planningTasks.unshift(ctAppointment);

            for (var i = 0; i!=planningTasks.length; ++i){

                //Checking to see if appointment or task since they have different properties.
                if (planningTasks[i].hasOwnProperty('TaskName_EN')){
                    sequence[planningTasks[i].TaskName_EN].push(planningTasks[i]);

                } else if (planningTasks[i].hasOwnProperty('AppointmentType_EN')){
                    sequence[planningTasks[i].AppointmentType_EN].push(planningTasks[i]);
                }
                //console.log(sequence);
            }
            currentStep = planningTasks[i];
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
                    && appointments[i].ScheduledStartTime < mdTask.physicianTask.DueDateTime
                    && appointments[i].Status.toLowerCase().indexOf('completed') !== -1) {

                    ctAppointment = appointments[i];
                    break;

                }
            }

            return ctAppointment;
        }

        function isCompleted(){
            return sequence['Scheduling Treatments'].length > 0;
        }

        function getCurrentStep(){
            return currentStep.TaskName_EN || currentStep.AppointmentType_EN;
        }
    }

})();

