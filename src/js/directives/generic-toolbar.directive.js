// SPDX-FileCopyrightText: Copyright (C) 2022 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .directive("genericToolbar", GenericToolbar);

    GenericToolbar.$inject = ['$timeout'];

    /**
     * @name TopToolbar
     * @author David Gagne
     * @date 2021-12-10
     * @desc Directive for the top tool bar with title and back bouton.
     */
    function GenericToolbar($timeout)
    {
        return {
            restrict: 'E',
            scope: {
                title: '@',
                backButton: '=?',
            },
            transclude: {
                'leftContentSlot': '?leftContent',
                'rightContentSlot': '?rightContent'
            },
            template: `
                <ons-toolbar fixed-style>
                    <div id="toolbar-left-{{$id}}" class="left" ng-transclude="leftContentSlot" ng-style="iosStyleFix">
                        <ons-back-button id="toolbar-left-default-{{$id}}" ng-hide="backButton === false">{{"BACK"|translate}}</ons-back-button>
                    </div>
                    <div id="toolbar-center-{{$id}}" class="center overflow-text-ellipsis" ng-style="iosStyleFix">{{title}}</div>
                    <div id="toolbar-right-{{$id}}" class="right" ng-transclude="rightContentSlot" ng-style="iosStyleFix"></div>
                </ons-toolbar>
            `,
            link: function (scope) {
                $timeout(() => {
                    // Fix needed to prevent empty space above the toolbar on iOS
                    scope.iosStyleFix = ons.platform.isIOS() ? {'padding-top': '0px'} : {};

                    // Get references to the toolbar elements
                    let leftElement = $(`#toolbar-left-${scope.$id}`) || $(`#toolbar-left-default-${scope.$id}`);
                    let centerElement = $(`#toolbar-center-${scope.$id}`);
                    let rightElement = $(`#toolbar-right-${scope.$id}`);

                    // Detect whether the toolbar title (center text) was cut off with '...'
                    // See: https://stackoverflow.com/questions/7738117/html-text-overflow-ellipsis-detection
                    let ellipsisIsActive = centerElement[0].offsetWidth < centerElement[0].scrollWidth;

                    // Detect whether the right element has content
                    let rightContentExists = rightElement?.find('right-content').length > 0;

                    // UI optimization: if the title is cut off, but there is nothing in the right slot, use that space to display more of the title
                    if (ellipsisIsActive && !rightContentExists) {
                        // Default ons-toolbar space allocation is 27-46-27%
                        centerElement.css('width', '73%');
                        centerElement.css('text-align', 'left');
                        rightElement.css('width', '0%');
                        rightElement.css('padding-right', '2px');
                    }
                });
            }
        };
    }
})();
