(function () {
    'use strict';

    angular
        .module('OpalApp')
        .filter('replaceAll', ReplaceAll);

    ReplaceAll.$inject = [];

    /**
     * @description Filter that replaces all instances of a substring in a string with a new value.
     * @author Stacey Beard
     * @date 2021-07-23
     */
    function ReplaceAll() {
        return (str, oldSubStr, newSubStr) => {
            return str.split(oldSubStr).join(newSubStr);
        };
    }
})();
