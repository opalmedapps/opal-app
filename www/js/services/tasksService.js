/**
 *@ngdoc service
 *@name MUHCApp.services:TasksService
 *@requires Storage
 *@description Models patient tasks
 **/
(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .factory('Tasks', Tasks);

    Tasks.$inject = ['Storage', '$filter'];

    /* @ngInject */
    function Tasks(Storage, $filter) {

        var planningTasks = [];

        var service = {
            setPlanningTasks: setPlanningTasks,
            getPlanningTasks: getPlanningTasks,
            deletePlanningTasks: deletePlanningTasks,
            getAllRecentTasks: getAllRecentTasks,
            getRecentPhysicianTask: getRecentPhysicianTask
        };

        return service;

        ////////////////

        /**
         *@ngdoc method
         *@name setPlanningTasks
         *@methodOf MUHCApp.services:Tasks
         *@param {Array} tasks Array of task objects.
         *@description Sets the tasks member in the model and writes it to localstorage.
         **/
        function setPlanningTasks(tasks) {
            for (var task in tasks){
                tasks[task].DueDateTime = convertDateToJSDate(tasks[task].DueDateTime);
            }
            planningTasks = tasks;
            //Storage.write('tasks', planningTasks);
            console.log(planningTasks);
        }

        /**
         *@ngdoc method
         *@name getPlanningTasks
         *@methodOf MUHCApp.services:Tasks
         *@returns {Array} the array of planning tasks.
         *@description Returns an array of the planning tasks
         **/
        function getPlanningTasks() {
            return planningTasks;
        }

        function getPlanningTasksFromStorage(){
            return Storage.read('tasks');
        }

        /**
         *@ngdoc method
         *@name deletePlanningTasks
         *@methodOf MUHCApp.services:Tasks
         *@description Removes the tasks from localStorage.
         **/
        function deletePlanningTasks(){
            Storage.remove('tasks')
        }

        function getTasksInCourse(courseID){

        }

        // Scans the task list for Physician Plan Preparation and returns the most recent task.
        function getRecentPhysicianTask(){
            var physicianTask = planningTasks[0];
            var index = 0;
            for (var task in planningTasks ){
                if (planningTasks[task].DueDateTime > physicianTask.DueDateTime
                    && planningTasks[task].TaskName_EN === 'Physician Plan Preparation'){
                    physicianTask = planningTasks[task];
                    index++;
                }
            }
            return {
                physicianTask: physicianTask,
                index: index
            };
        }

        // Helper function that converts a string date to JS Date
        function convertDateToJSDate(stringDate){
            return new Date(stringDate);
        }

        // Returns all tasks starting from the most recent Physician plan prep.
        function getAllRecentTasks(){

            var physicianTask = getRecentPhysicianTask();
            console.log(planningTasks);
            console.log(physicianTask);
            return planningTasks.slice(physicianTask.index, planningTasks.length);
        }
    }

})();

