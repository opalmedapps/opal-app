(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .filter('showHeader', ShowHeader);

    /**
     * @description Filter that evaluates if a date header should be rendered in a list view.
     * @author David Gagne
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