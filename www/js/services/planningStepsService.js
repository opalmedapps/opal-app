(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .factory('PlanningSteps', PlanningSteps);

    PlanningSteps.$inject = ['Tasks', 'Appointments'];

    /* @ngInject */
    function PlanningSteps(Tasks, Appointments) {

        var currentStep = -1;
        var totalEvents = 0;
        var sequence = {
            1: {name: 'CT for Radiotherapy Planning', events: []},
            2: {name: 'Physician Plan Preparation', events: []},
            3: {name: 'Calculation of Dose', events: []},
            4: {name: 'Quality Control', events: []},
            5: {name: 'Scheduling', events: []}
        };

        var service = {
            getPlanningSequence: getPlanningSequence,
            initializePlanningSequence: initializePlanningSequence
        };

        return service;

        ////////////////

        function getPlanningSequence() {
            return sequence;
        }

        function initializePlanningSequence(){
            var ctAppointment = getCTSimAppointment();
            var planningTasks = Tasks.getAllRecentTasks();

            planningTasks.unshift(ctAppointment);

            console.log(planningTasks);

            /*for (var event in events){
                sequence[events[event].TaskName_EN].push(events[event]);
            }*/

        }

        // Gets the most recent CT Sim
        function getCTSimAppointment(){

            var appointments = Appointments.getUserAppointments();
            var mdTask = Tasks.getRecentPhysicianTask();

            var ctAppointment = {};

            for (var appointment in appointments){
                if (appointments[appointment].TaskName_EN === 'CT for Radiotherapy Planning'
                    && appointments[appointment].ScheduledStartTime
                        < mdTask.physicianTask.DueDateTime) {

                    ctAppointment = appointments[appointment];
                    break;

                }
            }

            return ctAppointment;
        }

        function isCompleted(){
            return sequence[5].length > 0;
        }

        function getCurrentStep(){
            return currentStep;
        }
    }

})();

