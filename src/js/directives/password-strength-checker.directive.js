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

    passwordStrengthChecker.$inject = ['UserAuthorizationInfo'];

    /**
     * @author Stacey Beard
     * @date 2023-12-07
     * @description TODO
     */
    function passwordStrengthChecker(UserAuthorizationInfo) {
        return {
            restrict: 'E',
            scope: {
                // Password variable to link to the strength bar
                "password": "=",

                // [Value set by the directive] Boolean indicating whether the password is strong enough
                // TODO make it non-optional
                "isStrongEnough": "=?",
            },
            template: `<!--Password length strength meter-->
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

                zxcvbnOptions.setOptions(options);

                // User-specific values that can lower the password strength
                let email = UserAuthorizationInfo.getEmail();
                let emailPrefix = email?.substring(0, email.indexOf('@'));

                // Every time the password changes, recalculate the strength
                scope.$watch('password', function(newValue, oldValue) {
                    if (scope.password) {
                        let results = zxcvbn(scope.password, [email, emailPrefix]);
                        scope.passwordStrength = results.score;
                    }
                    else scope.passwordStrength = -1;

                    // TODO calculate isStrongEnough based on requiredStrength constant
                    scope.isStrongEnough = scope.passwordStrength >= 3;
                });
            },
        };
    }
})();
