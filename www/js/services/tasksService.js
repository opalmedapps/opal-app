/**
 *@ngdoc service
 *@name MUHCApp.service:Tasks
 *@requires $filter
 *@description Service used to store and manage treatment planning tasks
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
            getRecentPhysicianTask: getRecentPhysicianTask,
            destroy: destroy
        };

        return service;

        ////////////////

        /**
         *@ngdoc method
         *@name setPlanningTasks
         *@methodOf MUHCApp.service:Tasks
         *@param {Array} tasks Array of task objects.
         *@description Sets the tasks member in the model and writes it to localstorage.
         **/
        function setPlanningTasks(tasks) {
            for (var i = 0; i!=tasks.length; ++i){
                // Convert string date to JS date
                tasks[i].DueDateTime = $filter('formatDate')(tasks[i].DueDateTime);
            }
            planningTasks = tasks;
            LocalStorage.WriteToLocalStorage('Tasks', planningTasks);
            console.log(planningTasks);
        }

        /**
         * @ngdoc method
         * @name getPlanningTasks
         * @methodOf MUHCApp.service:Tasks
         * @returns {Array} the array of planning tasks.
         * @description Returns an array of the planning tasks
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
         * @methodOf MUHCApp.service:Tasks
         * @description Sets the local storage value to null
         **/
        function deletePlanningTasks(){
            planningTasks = null;
            LocalStorage.WriteToLocalStorage('Tasks', planningTasks);
        }

        /**
         * @ngdoc method
         * @name setPlanningTasks
         * @methodOf MUHCApp.service:Tasks
         * @description Sets the tasks member in the model and writes it to localstorage.
         * @returns {Object} The task and its index in the task array.
        **/
        function getRecentPhysicianTask(){
            var physicianTask = planningTasks[0];
            var index = 0;
            var mdIndex = 0;
            for (var i=0; i!=planningTasks.length; ++i ){
                if (planningTasks[i].DueDateTime > physicianTask.DueDateTime
                    && planningTasks[i].TaskName_EN === 'Physician Plan Preparation'){
                    physicianTask = planningTasks[i];
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

        function destroy(){
            planningTasks = [];
        }
    }

})();

