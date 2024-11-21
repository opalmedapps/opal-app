(function () {
    'use strict';

    angular
        .module('OpalApp')
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
            scope: {
                // Optional boolean: if true, the profile icon syncs with its parent ons tab (colour when selected, grey when unselected)
                "syncWithOnsToolbar": "<?",
            },
            template: `
                <span class="tab-icon profile-icon" ng-style="profileColor">{{patientInitials}}</span>
            `,
            link: function (scope, element) {
                // Needed to force an update to the icon on the tab bar in certain cases
                // For example when clicking back from a Questionnaire notification that changes profiles
                ProfileSelector.attachToObserver(refreshDisplay);

                scope.$watch(refreshDisplay);

                function refreshDisplay() {
                    // Use jQuery instead of jQLite
                    element = $(element[0]);

                    // Set the icon content based on the current patient profile
                    const activeProfile = ProfileSelector.getActiveProfile();
                    scope.patientInitials = activeProfile ? $filter('profileInitials')(activeProfile) : '';

                    // If synced, the profile icon only takes on its colour when it's on a selected ons tab
                    if (scope.syncWithOnsToolbar) {
                        // In case of issues, fall back on the default tab color
                        const selectedColor = activeProfile?.color || '#1284ff';
                        const isOnActiveTab = element.parents('ons-tab.active').length > 0;
                        scope.profileColor = {
                            'background-color': isOnActiveTab ? selectedColor : '#666',
                        };
                    }
                    // Otherwise, the profile icon is always in color (or can fall back on grey in case of errors)
                    else scope.profileColor = {'background-color': activeProfile?.color || 'grey'};
                }
            }
        };
    }
})();
