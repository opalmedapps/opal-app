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

    Tasks.$inject = ['LocalStorage', '$filter'];

    /* @ngInject */
    function Tasks(LocalStorage, $filter) {

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
                // Convert string date to JS date
                tasks[task].DueDateTime = $filter('formatDate')(tasks[task].DueDateTime);
            }
            planningTasks = tasks;
            LocalStorage.WriteToLocalStorage('Tasks', planningTasks);
            console.log(planningTasks);
        }

        /**
         * @ngdoc method
         * @name getPlanningTasks
         * @methodOf MUHCApp.services:Tasks
         * @returns {Array} the array of planning tasks.
         * @description Returns an array of the planning tasks
         * @returns
         **/
        function getPlanningTasks() {
            return planningTasks;
        }

        function getPlanningTasksFromStorage(){
            return LocalStorage.ReadLocalStorage('Tasks');
        }

        /**
         * @ngdoc method
         * @name deletePlanningTasks
         * @methodOf MUHCApp.services:Tasks
         * @description Sets the local storage value to null
         **/
        function deletePlanningTasks(){
            planningTasks = null;
            LocalStorage.WriteToLocalStorage('Tasks', planningTasks);
        }

        /**
         * @ngdoc method
         * @name setPlanningTasks
         * @methodOf MUHCApp.services:Tasks
         * @param {Array} tasks Array of task objects.
         * @description Sets the tasks member in the model and writes it to localstorage.
         * @returns {Object} The task and its index in the task array.
        **/
        function getRecentPhysicianTask(){
            var physicianTask = planningTasks[0];
            var index = 0;
            var mdIndex = 0;
            for (var task in planningTasks ){
                if (planningTasks[task].DueDateTime > physicianTask.DueDateTime
                    && planningTasks[task].TaskName_EN === 'Physician Plan Preparation'){
                    physicianTask = planningTasks[task];
                    mdIndex = index;
                }
                index++;
            }
            return {
                physicianTask: physicianTask,
                index: mdIndex
            };
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

