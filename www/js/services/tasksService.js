(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .factory('Tasks', Tasks);

    Tasks.$inject = ['Storage'];

    /* @ngInject */
    function Tasks(Storage) {

        var planningTasks = [];

        var service = {
            setPlanningTasks: setPlanningTasks,
            getPlanningTasks: getPlanningTasks,
            deletePlanningTasks: deletePlanningTasks
        };

        return service;

        ////////////////

        function setPlanningTasks(tasks) {
            planningTasks = tasks;
            if (!Storage.hasKey('tasks')) {
                Storage.write('tasks', planningTasks);
            }
            console.log(tasks);
        }

        function getPlanningTasks() {
            return planningTasks;
        }

        function getPlanningTasksFromStorage(){
            return Storage.read('tasks');
        }

        function deletePlanningTasks(){
            Storage.remove('tasks')
        }
    }

})();

