
(function () {
    'use strict';

    angular
        .module("MUHCApp")
        .directive("profileIcon", ProfileIcon);

    ProfileIcon.$inject = ['$filter', 'ProfileSelector'];

    /**
     * @name ProfileIcon
     * @author David Gagne
     * @date 2022-09-23
     * @desc Display the round icon with active profile initials
     */
    function ProfileIcon($filter, ProfileSelector)
    {
        return {
            restrict: 'E',
            scope: true,
            template: `
                <span class="tab-icon profile-icon" ng-style="profileColor">{{patientInitials}}</span>
            `,
            link: function (scope) {
                /**
                 * @description Observe profile selection and trigger UI update.
                 */
                ProfileSelector.observeProfile(() => setIcon(ProfileSelector.getActiveProfile()));
                /**
                 * @description Set icon color and active profile initials.
                 * @param {object} activeProfile Currently selected profile.
                 */
                function setIcon(activeProfile) {
                    scope.patientInitials = $filter('profileInitials')(activeProfile);
                    scope.profileColor = {'background-color': activeProfile.color};
                }
            }
        };
    }
})();
