(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .filter('replace', Replace);

    Replace.$inject = [];

    /**
     * @description Filter that replaces all instances of a substring in a string with a new value.
     * @author Stacey Beard
     * @date 2021-07-23
     */
    function Replace() {
        return (str, oldSubStr, newSubStr) => {
            return str.replaceAll(oldSubStr, newSubStr);
        };
    }
})();
