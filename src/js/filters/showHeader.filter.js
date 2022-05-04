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
     * @param {String} [sortBy] (Optional) Name of the key used to compare two values from the sourceArray.
     *                          If not provided, the object itself from sourceArray is used (should be a date or convertable to Date).
     * @date 2021-12-14
     */
    function ShowHeader() {
        return function(sourceArray, index, sortBy) {
            if (index === 0) return true;
            let current = sortBy ? new Date(sourceArray[index][sortBy]) : new Date(sourceArray[index]);
            let previous = sortBy ? new Date(sourceArray[index-1][sortBy]) : new Date(sourceArray[index-1]);
            current = current.setHours(0,0,0,0);
            previous = previous.setHours(0,0,0,0);
            return current !== previous;
        }
    }
})();
