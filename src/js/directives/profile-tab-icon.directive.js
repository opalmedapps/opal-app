(function () {
    'use strict';

    angular
        .module("MUHCApp")
        .directive("profileTabIcon", ProfileTabIcon);

    ProfileTabIcon.$inject = ['$filter', 'ProfileSelector'];

    /**
     * @name ProfileTabIcon
     * @author David Gagne
     * @date 2022-09-23
     * @desc Tab icon that includes a circle with initials for the active profile, and a label for the name of the tab.
     */
    function ProfileTabIcon($filter, ProfileSelector)
    {
        return {
            restrict: 'E',
            scope: {
                // Optional string: label to display under the profile icon
                "label": "@?",

                // Optional boolean: if true, the profile icon syncs with its parent ons tab (colour when selected, grey when unselected)
                "syncWithOnsToolbar": "<?",
            },
            template: `
                <div class="tab">
                    <span class="tab-icon profile-icon" ng-style="profileColor">{{patientInitials}}</span>
                    <div class="tab-label" ng-style="fontColor">{{label}}</div>
                </div>
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
                        scope.color = isOnActiveTab ? selectedColor : '#666';
                    }
                    // Otherwise, the profile icon is always in color (or can fall back on grey in case of errors)
                    else scope.color = activeProfile?.color || 'grey';

                    // Wrap the chosen values for ng-style
                    scope.profileColor = {'background-color': scope.color};
                    scope.fontColor = {'color': scope.color};
                }
            }
        };
    }
})();
