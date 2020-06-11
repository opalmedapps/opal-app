/*
 * Filename     :   planningStepsService.js
 * Description  :   Service that manages the current planning steps for the user
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   03 Mar 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */

/**
 *@ngdoc service
 *@name MUHCApp.service:PlanningSteps
 *@requires MUHCApp.service:Tasks
 *@requires MUHCApp.service:Appointments
 *@description Sets and determines the current planning step for the user. The planning sequence is defined as follows:
 * 1. Patient gets a CT Scan
 * 2. Physician prepares the plan
 * 3. The radiation dose is calculated
 * 4. The plan is QAed by physics
 * 5. The patient is ready for treatment
 **/
(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .factory('PlanningSteps', PlanningSteps);

    PlanningSteps.$inject = ['Tasks', 'Appointments'];

    /* @ngInject */
    function PlanningSteps(Tasks, Appointments) {

        /**
         *@ngdoc property
         *@name  MUHCApp.service.#currentStep
         *@propertyOf MUHCApp.service:PlanningSteps
         *@description Current step of the planning sequence
         **/
        var currentStep = '';

        /**
         *@ngdoc property
         *@name  MUHCApp.service.#sequence
         *@propertyOf MUHCApp.service:PlanningSteps
         *@description Object containing five arrays: CTs, Physician Planning, Dose Calc, Physics QA, Scheduling Treatments
         **/
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
            isCompleted: isCompleted,
            hasCT: hasCT,
            destroy: destroy
        };

        // Initilaize the sequence when app is loaded
        //initializePlanningSequence();

        return service;

        ////////////////

        /**
         *@ngdoc method
         *@name getPlanningSequence
         *@methodOf MUHCApp.service:PlanningSteps
         *@description Gets the planning sequence object.
         *@returns {Object} Returns the planning sequence object.
         **/
        function getPlanningSequence() {
            return sequence;
        }

        /**
         *@ngdoc method
         *@name initializePlanningSequence
         *@methodOf MUHCApp.service:PlanningSteps
         *@description Initializes the sequence from Appointments and tasks.
         *@returns {Object} Returns the planning sequence object.
         **/
        function initializePlanningSequence(){
            destroy();
            var ctAppointment = getCTSimAppointment();
            var planningTasks = Tasks.getAllRecentTasks();

            planningTasks.unshift(ctAppointment);

            for (var i = 0; i!==planningTasks.length; ++i){

                //Checking to see if appointment or task since they have different properties.
                if (planningTasks[i].hasOwnProperty('TaskName_EN')){
                    sequence[planningTasks[i].TaskName_EN].push(planningTasks[i]);

                } else if (planningTasks[i].hasOwnProperty('AppointmentType_EN')){
                    sequence[planningTasks[i].AppointmentType_EN].push(planningTasks[i]);
                }
            }
            currentStep = planningTasks[i-1];

        }

        /**
         *@ngdoc method
         *@name getCTSimAppointment
         *@methodOf MUHCApp.service:PlanningSteps
         *@description Scans the appointment list for the most recent CT scan and return it.
         *@returns {Object} Returns the CT Appointment.
         **/
        function getCTSimAppointment(){

            var appointments = Appointments.getUserAppointments();
            var mdTask = Tasks.getRecentPhysicianTask();
            var ctAppointment = {};
            // Do not proceed if physician task is undefined
            if (mdTask.physicianTask !== undefined) {
                // Appointments are sorted, so scanning starts at the end
                for (var i = appointments.length-1; i>=0; i--){
                    //
                    if (appointments[i].AppointmentType_EN === 'CT for Radiotherapy Planning'
                        && appointments[i].ScheduledStartTime < mdTask.physicianTask.DueDateTime
                        && appointments[i].Status.toLowerCase().indexOf('completed') !== -1) {

                        ctAppointment = appointments[i];
                        break;

                    }
                }
            }

            return ctAppointment;
        }

        /**
         *@ngdoc method
         *@name isCompleted
         *@methodOf MUHCApp.service:PlanningSteps
         *@description Checks if the planning is completed
         *@returns {Boolean} Returns plan completion.
         **/
        function isCompleted(){
            return sequence['Scheduling Treatments'].length > 0 && sequence['CT for Radiotherapy Planning'].length > 0;
        }

        /**
         *@ngdoc method
         *@name getCurrentStep
         *@methodOf MUHCApp.service:PlanningSteps
         *@description Gets the current planning step name
         *@returns {String} Returns the name of the current step.
         **/
        function getCurrentStep(){

            return currentStep.TaskName_EN || currentStep.AppointmentType_EN;
        }

        /**
         *@ngdoc method
         *@name destroy
         *@methodOf MUHCApp.service:PlanningSteps
         *@description Clears all planning steps.
         **/
        function destroy(){
            currentStep = '';
            for (var step in sequence){
                sequence[step] = [];
            }
        }

        /**
         *@ngdoc method
         *@name hasCT
         *@methodOf MUHCApp.service:PlanningSteps
         *@description Returns the existence of a CT for the current plan.
         *@returns {Boolean} Returns if a CT is present.
         **/
        function hasCT() {
            return sequence['CT for Radiotherapy Planning'].length > 0;
        }

    }

})();

