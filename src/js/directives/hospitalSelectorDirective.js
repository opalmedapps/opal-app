// SPDX-FileCopyrightText: Copyright (C) 2020 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .directive('hospitalSelector', hospitalSelector);

    hospitalSelector.$inject = ['UserHospitalPreferences'];

    function hospitalSelector(UserHospitalPreferences) {

        let directive = {
            restrict: 'E',
            scope: {
                // Optional function called when clicking on the hospital selector
                "onClick": "=?",
            },
            template: `<ons-list>
                           <ons-list-item id="hospital-selector-{{$id}}-item" modifier="chevron" ng-click="goToHospitalSelection()" ng-style="!hospitalIsSelected() && {'background-color': 'rgba(241, 241, 88, 0.25882352941176473)'}">
                               {{"HOSPITAL"|translate}}
                               <span class="list-item-note lucent">{{getSelectedHospitalAcronym()|translate}}</span>
                           </ons-list-item>
                       </ons-list>`,

            link: function (scope) {

                scope.goToHospitalSelection = goToHospitalSelection;
                scope.hospitalIsSelected = hospitalIsSelected;
                scope.getSelectedHospitalAcronym = getSelectedHospitalAcronym;

                /**
                 * @ngdoc method
                 * @name goToHospitalSelection
                 * @description Navigates to the hospital selection screen.
                 */
                function goToHospitalSelection() {
                    if (scope.onClick && typeof scope.onClick === 'function') scope.onClick();
                    initNavigator.pushPage('./views/login/set-hospital.html', {});
                }

                /**
                 * @ngdoc method
                 * @name hospitalIsSelected
                 * @description Returns whether the user has already selected a hospital.
                 * @returns {boolean} True if there is a hospital selected; false otherwise.
                 */
                function hospitalIsSelected() {
                    return UserHospitalPreferences.isThereSelectedHospital();
                }

                /**
                 * @ngdoc method
                 * @name getSelectedHospitalAcronym
                 * @description Returns a translatable string for display on the hospital selection button
                 *              (either the selected hospital's acronym, or a placeholder).
                 * @returns {string} A translatable string: the selected hospital's acronym, or "Tap to select"
                 *                   if none has been chosen yet.
                 */
                function getSelectedHospitalAcronym() {

                    if (hospitalIsSelected()) {
                        return UserHospitalPreferences.getHospitalAcronym();
                    } else {
                        return "TAP_TO_SELECT_HOSPITAL";
                    }
                }
            }
        };
        return directive;
    }
})();
