import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common';
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en';
import * as zxcvbnFrPackage from '@zxcvbn-ts/language-fr';
import '../../css/directives/password-strength-checker.directive.css';

(function () {
    'use strict';

    angular
        .module("MUHCApp")
        .directive("passwordStrengthChecker", passwordStrengthChecker);

    passwordStrengthChecker.$inject = ["$timeout"];

    /**
     * @author Stacey Beard
     * @date 2023-12-07
     * @description
     */
    function passwordStrengthChecker($timeout) {
        return {
            restrict: 'E',
            scope: {

            },
            template: `<input placeholder='{{"PASSWORD"|translate}}' ng-model="password" ng-change="calculateStrength()">

                       <br>
                       <!--Password length strength meter-->
                       <div class="strength-meter">
                           <div class="strength-meter-fill" data-strength="{{passwordStrength}}"></div>
                       </div>
                       <br>
            `,
            link: scope => {
                const options = {
                    translations: zxcvbnEnPackage.translations,
                    graphs: zxcvbnCommonPackage.adjacencyGraphs,
                    dictionary: {
                        ...zxcvbnCommonPackage.dictionary,
                        ...zxcvbnEnPackage.dictionary,
                        ...zxcvbnFrPackage.dictionary,
                    },
                };

                let savedStrength = -1;

                zxcvbnOptions.setOptions(options);

                scope.calculateStrength = () => {
                    $timeout(() => {
                        let results = zxcvbn(scope.password);
                        // console.log(results);
                        scope.passwordStrength = results.score;
                        if (savedStrength !== scope.passwordStrength) {
                            console.log(scope.passwordStrength);
                            savedStrength = scope.passwordStrength;
                        }
                    });
                };
            },
        };
    }
})();
