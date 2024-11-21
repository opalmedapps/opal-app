(function () {
    'use strict';

    angular
        .module('OpalApp')
        .filter('profileInitials', ProfileInitials);
    /**
     * @description Filter that gets the first letters of the first and last name for icon display.
     * @author David Gagne
     * @date 2022-10-13
     */
    function ProfileInitials() {
        return (profile) => {
            return `${profile?.first_name?.substr(0, 1)}${profile?.last_name?.substr(0, 1)}`
        };
    }
})();