
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
                // Needed to force an update to the icon on the tab bar in certain cases
                // For example when clicking back from a Questionnaire notification that changes profiles
                ProfileSelector.attachToObserver(refreshDisplay);

                scope.$watch(refreshDisplay);

                function refreshDisplay() {
                    const activeProfile = ProfileSelector.getActiveProfile();
                    scope.patientInitials = activeProfile ? $filter('profileInitials')(activeProfile) : '';
                    scope.profileColor = {'background-color': activeProfile?.color || 'grey'};
                }
            }
        };
    }
})();
