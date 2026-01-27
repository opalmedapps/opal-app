// SPDX-FileCopyrightText: Copyright (C) 2026 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/**
 * @description The white buttons that take up most of the space on the app's init page.
 */
(function () {

    angular
        .module('OpalApp')
        .directive('initButton', initButton);

    initButton.$inject = [];

    function initButton() {

        let directive = {
            restrict: 'E',
            scope: {
                text: '@',
            },
            transclude: {
                'leftIcon': 'leftIcon',
            },
            template: `
                <div class="initScreenButtonDiv">
                    <button ng-click="init.goToAboutOpal()" class="initScreenWhiteButtonNew">
                        <div ng-transclude="leftIcon"></div>
                        <div class="initScreenButtonText">{{text}}</div>
<!--                        <ons-row align="center">-->
<!--                            <ons-col width="60px" align="center">-->
<!--                                <div ng-transclude="leftIcon"></div>-->
<!--                            </ons-col>-->
<!--                            <ons-col>-->
<!--                                <div class="initScreenButtonText" align="center">{{text}}</div>-->
<!--                            </ons-col>-->
<!--                        </ons-row>-->
                    </button>
                </div>
            `,
            link: function(scope) {

            }
        };
        return directive;
    }
})();
