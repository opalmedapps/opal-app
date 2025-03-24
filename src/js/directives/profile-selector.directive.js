import "../../css/directives/profile-selector.directive.css"

(function () {
    'use strict';

    angular
        .module("MUHCApp")
        .directive("profileSelector", ProfileSelector);

    ProfileSelector.$inject = ['$timeout', '$filter', 'ProfileSelector', 'Patient'];

    /**
     * @name ProfileSelector
     * @author David Gagne
     * @date 2022-08-18
     * @desc Directive to display the profile selector and scope it's business logic.
     */
    function ProfileSelector($timeout, $filter, ProfileSelector, Patient)
    {
        return {
            restrict: 'E',
            scope: {
                // Function passed by the controller to trigger a refresh on profile change.
                'refreshFunction': '=',
            },
            transclude: {
                'rightContentSlot': '?rightContent'
            },
            template: `
                <ons-toolbar fixed-style>
                    <div class="left" ng-style="iosStyleFix"></div>
                    <div class="center" ng-style="iosStyleFix">
                        <div class="profile-selector--title" ng-click="toggleList()">
                            <div>{{title}}</div>
                            <div ng-show="profileList.length > 1"><ons-icon class="profile-selector--title--icon" icon="fa-solid fa-caret-down"></ons-icon></div>
                        </div>
                        <ul ng-show="listVisible" class="profile-selector--list">
                            <top-page-banner title="'RELATIONSHIPS_PATIENTS_AVAILABLE'"></top-page-banner>
                            <li 
                            ng-repeat="profile in profileList"
                            ng-if="profile.patient_legacy_id"
                            ng-class="{
                                selected: profile.patient_legacy_id == currentProfile.patient_legacy_id,
                                disabled: profile.status == 'PEN'
                            }"
                            ng-click="selectProfile(profile.patient_legacy_id, profile.status)">
                                {{profile.first_name}} {{profile.last_name}}
                                <span ng-show="profile.status == 'PEN'">({{'RELATIONSHIPS_PATIENTS_STATUS_PEN' | translate | lowercase}})</span>
                            </li>
                        </ul>
                    </div>
                    <div class="right" ng-transclude="rightContentSlot" ng-style="iosStyleFix" ng-click="toggleList()"></div>
                </ons-toolbar>
            `,
            link: function (scope) {
                
                scope.iosStyleFix = ons.platform.isIOS() ? {'padding-top': '0px'} : {};
                scope.profileList = ProfileSelector.getPatientList();
                scope.listVisible = false;

                const updateDisplayInfo = () => {
                    scope.currentProfile = Patient.getSelectedProfile();
                    scope.title = `${scope.currentProfile.first_name} ${scope.currentProfile.last_name}`;
                }

                scope.toggleList = () => scope.listVisible = !scope.listVisible;

                scope.selectProfile = (lecagyId, relStatus) => {
                    if (relStatus !== 'CON') return;
                    ProfileSelector.loadPatientProfile(lecagyId);
                    updateDisplayInfo();
                    if (scope.refreshFunction) scope.refreshFunction();
                    scope.listVisible = false;
                };

                updateDisplayInfo();
            }
        };
    }
})();
