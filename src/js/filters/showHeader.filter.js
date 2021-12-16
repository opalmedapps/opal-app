(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .filter('showHeader', ShowHeader);

    /**
     * @description Filter that evaluates if a date header should be rendered in a list view.
     * @author David Gagne
     * @param {array} sourceArray Array from where values to be compared are coming from.
     * @param {int} index Index of the current value to be evaluated.
     * @param {String} sortBy Name of the key used to compare two values from the sourceArray.
     * @date 2021-12-14
     */
    function ShowHeader() {
        return function(sourceArray, index, sortBy) {
            if (index === 0) return true;
            var current = (new Date(sourceArray[index][sortBy])).setHours(0,0,0,0);
            var previous = (new Date(sourceArray[index-1][sortBy])).setHours(0,0,0,0);
    
            return current !== previous;
        }
    }
})();
