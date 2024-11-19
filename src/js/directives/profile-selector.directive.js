import "../../css/directives/profile-selector.directive.css"

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .directive("profileSelector", ProfileSelector);

    ProfileSelector.$inject = ['$filter', '$timeout', 'ProfileSelector', 'UpdateUI', 'Params'];

    /**
     * @name ProfileSelector
     * @author David Gagne
     * @date 2022-08-18
     * @desc Directive to display the profile selector and scope it's business logic.
     */
    function ProfileSelector($filter, $timeout, ProfileSelector, UpdateUI, Params)
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
                    <div class="left" ng-style="iosStyleFix">
                        <div ng-show="listVisible" class="profile-selector--overlay" ng-click="toggleList()"></div>
                    </div>
                    <div class="center" ng-style="iosStyleFix">
                        <div class="profile-selector--title" ng-click="toggleList()">
                            <div class="profile-selector--title--text">{{title}}</div>
                            <div><ons-icon class="profile-selector--title--icon" icon="fa-solid fa-caret-down"></ons-icon></div>
                        </div>
                        <ul ng-show="listVisible" class="profile-selector--list">
                            <top-page-banner title="'RELATIONSHIPS_PATIENTS_AVAILABLE'"></top-page-banner>
                            <li 
                            ng-repeat="profile in profileList"
                            ng-if="canDisplayProfile(profile)"
                            ng-class="{
                                selected: profile.patient_legacy_id == currentProfile.patient_legacy_id,
                                disabled: profile.status == relationshipStatus.pending
                            }"
                            ng-click="selectProfile(profile.patient_legacy_id, profile.status)">
                                <div class="profile-selector--text">
                                    {{profile.first_name}} {{profile.last_name}}
                                    <span ng-show="profile.status == relationshipStatus.pending">({{'RELATIONSHIPS_PATIENTS_ACCESS' | translate}} {{'RELATIONSHIPS_PATIENTS_STATUS_PEN' | translate | lowercase}})</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div class="right" ng-transclude="rightContentSlot" ng-style="iosStyleFix" ng-click="toggleList(false)"></div>
                </ons-toolbar>
            `,
            link: function (scope) {
                
                scope.iosStyleFix = ons.platform.isIOS() ? {'padding-top': '0px'} : {};
                scope.profileList = ProfileSelector.getPatientList();
                scope.listVisible = false;
                scope.relationshipStatus = Params.relationshipStatus;

                const updateDisplayInfo = () => {
                    scope.currentProfile = ProfileSelector.getActiveProfile();
                    scope.title = (scope.profileList.length) ? `${scope.currentProfile.first_name} ${scope.currentProfile.last_name}` : $filter('translate')('RELATIONSHIPS_PATIENTS_NOT_AVAILABLE');
                }

                const assignScrollEffect = () => {
                    $timeout(() => {
                        const listItems = document.querySelectorAll('.profile-selector--text');
                        listItems.forEach(item => {
                            if (item.offsetWidth < item.scrollWidth) item.classList.add('scrollingEntry');
                        });
                    });
                }

                scope.toggleList = (isOpen = null) => {
                    scope.listVisible = isOpen !== null ? isOpen : !scope.listVisible;
                    if (scope.listVisible) assignScrollEffect();
                }

                scope.selectProfile = (lecagyId, relStatus) => {
                    if (relStatus !== scope.relationshipStatus.confirmed) return;
                    UpdateUI.clearUpdateUI();
                    ProfileSelector.loadPatientProfile(lecagyId);
                    updateDisplayInfo();
                    if (scope.refreshFunction) scope.refreshFunction();
                    scope.listVisible = false;
                };

                scope.canDisplayProfile = (profile) => {
                    return profile.patient_legacy_id && (profile.status === scope.relationshipStatus.pending || profile.status === scope.relationshipStatus.confirmed);
                }

                updateDisplayInfo();
            }
        };
    }
})();
