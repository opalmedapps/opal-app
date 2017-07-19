(function() {
'use strict';

    // Usage:
    // 
    // Creates:
    // 

    angular
        .module('Module')
        .component('Component', {
            template:'htmlTemplate',
            //templateUrl: 'templateUrl',
            controller: ControllerController,
            bindings: {
                Binding: '=',
            },
        });

    ControllerController.inject = ['dependency1'];
    function ControllerController(dependency1) {
        var ctrl = this;
        

        ////////////////

        ctrl.onInit = function() { };
        ctrl.onChanges = function(changesObj) { };
        ctrl.onDestory = function() { };
    }
})();