
(function () {
    'use strict';

    angular
        .module("MUHCApp")
        .directive("profileIcon", ProfileSelector);

    ProfileSelector.$inject = ['$timeout', 'ProfileSelector'];

    /**
     * @name ProfileIcon
     * @author David Gagne
     * @date 2022-09-23
     * @desc Display the rounf icon with active profile intials
     */
    function ProfileSelector($timeout, ProfileSelector)
    {
        return {
            restrict: 'E',
            scope: true,
            template: `
                <span class="tab-icon tab-icon--profile" ng-style="profileColor">{{patientInitials}}</span>
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
                    scope.patientInitials = `${activeProfile.first_name.substr(0, 1)}${activeProfile.last_name.substr(0, 1)}`;
                    scope.profileColor = {'background-color': activeProfile.color};
                }
            }
        };
    }
})();
