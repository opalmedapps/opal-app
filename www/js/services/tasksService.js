/*
 * Filename     :   tasksService.js
 * Description  :   Service that stores and manages patient tasks.
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   03 Mar 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */




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

        /**
         *@ngdoc property
         *@name  MUHCApp.service.#planningTasks
         *@propertyOf MUHCApp.service:Tasks
         *@description Array of all the users planning tasks
         **/
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
         * @name getRecentPhysicianTask
         * @methodOf MUHCApp.service:Tasks
         * @description Gets the most recent physician planning task.
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

        /**
         * @ngdoc method
         * @name getAllRecentTasks
         * @methodOf MUHCApp.service:Tasks
         * @description Gets all the most recent tasks until the first physician planning task.
         * @returns {Array} All the recent planning tasks.
         **/
        function getAllRecentTasks(){

            var physicianTask = getRecentPhysicianTask();
            console.log(planningTasks);
            console.log(physicianTask);
            return planningTasks.slice(physicianTask.index, planningTasks.length);
        }

        /**
         * @ngdoc method
         * @name destroy
         * @methodOf MUHCApp.service:Tasks
         * @description Clears all the planning tasks
         **/
        function destroy(){
            planningTasks = [];
        }
    }

})();

