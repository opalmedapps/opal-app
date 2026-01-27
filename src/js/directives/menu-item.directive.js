// SPDX-FileCopyrightText: Copyright (C) 2026 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/**
 * @description The basic menu item that makes up the Chart and General tabs.
 */
(function () {

    angular
        .module('OpalApp')
        .directive('menuItem', menuItem);

    menuItem.$inject = [];

    function menuItem() {

        let directive = {
            restrict: 'E',
            scope: {
                text: '@',
                chevron: '=?',
                isLink: '=?',
            },
            // Used for the icon on the left of the menu item
            transclude: true,
            template: `
                <ons-list-item modifier="{{chevron ? 'chevron' : ''}}" class="item">
                    <ons-row align="center">
                        <ons-col width="60px" style="text-align: center">
                            <!-- ICON TO THE LEFT OF THE TEXT -->
                            <div ng-transclude></div>
                        </ons-col>
                        <ons-col>
                            <header>
                                <!-- TEXT -->
                                <span class="item-title" ng-class="$root.fontSizeTitle">{{text}}</span>

                                <!-- OPTIONAL OPEN LINK ICON -->
                                <ons-icon ng-if="isLink" icon="ion-android-open" style="color: #ddd; margin-top: 1%; margin-right: -10px"
                                          class="pull-right" size="1.2em">
                                </ons-icon>
                            </header>
                        </ons-col>
                    </ons-row>
                </ons-list-item>
            `,
            link: function(scope) {
                if (scope.chevron && scope.isLink) throw 'A menu item cannot be configured with both a chevron and an "open link" icon';
            }
        };
        return directive;
    }
})();
