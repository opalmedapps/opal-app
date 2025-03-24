import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common';
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en';
import * as zxcvbnFrPackage from '@zxcvbn-ts/language-fr';
import '../../css/directives/password-strength-checker.directive.css';

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .directive("passwordStrengthChecker", passwordStrengthChecker);

    passwordStrengthChecker.$inject = ['Params', 'UserAuthorizationInfo'];

    /**
     * @author Stacey Beard
     * @date 2023-12-07
     * @description Password strength bar and requirements checks used to validate the strength and validity of new passwords.
     */
    function passwordStrengthChecker(Params, UserAuthorizationInfo) {
        return {
            restrict: 'E',
            scope: {
                // Password variable to link to the strength bar
                "password": "=",

                // [Value set by the directive] Boolean indicating whether the password is valid
                "isValid": "=",

                // [Value set by the directive] List of translation keys representing the error messages for an invalid password
                "errorMessageKeys": "=",
            },
            template: `<!--Password strength meter-->
                       <div class="strength-meter">
                           <div class="strength-meter-fill" data-strength="{{passwordStrength}}"></div>
                       </div>
            `,
            link: scope => {
                // Options provided to zxcvbn
                const options = {
                    graphs: zxcvbnCommonPackage.adjacencyGraphs,
                    dictionary: {
                        ...zxcvbnCommonPackage.dictionary,
                        ...zxcvbnEnPackage.dictionary,
                        ...zxcvbnFrPackage.dictionary,
                    },
                };

                /**
                 * @description Password strength requirements.
                 *              Keys are the error message keys corresponding to each requirement.
                 *              The values are functions that return true if the password fails the given requirement.
                 *              NOTE: errors should be displayed in this order (with strength error last, since it's the least specific)
                 */
                const passwordRequirements = {
                    "PASSWORD_INVALID_MIN_LENGTH": password => password.length < Params.minPasswordLength,
                    "PASSWORD_INVALID_MAX_LENGTH": password => password.length > Params.maxPasswordLength,
                    "PASSWORD_INVALID_NUMBER": password => password.search(/\d{1}/) === -1,
                    "PASSWORD_INVALID_CAPITAL": password => password.search(/[A-Z]{1}/) === -1,
                    "PASSWORD_INVALID_LOWERCASE": password => password.search(/[a-z]{1}/) === -1,
                    "PASSWORD_INVALID_SPECIAL_CHAR": password => password.search(/\W|_{1}/) === -1,
                    "PASSWORD_INVALID_STRENGTH": () => !scope.passwordStrength || scope.passwordStrength < Params.minPasswordStrengthLevel,
                }

                zxcvbnOptions.setOptions(options);

                // User-specific values that can lower the password strength
                let email = UserAuthorizationInfo.getEmail();
                let emailPrefix = email?.substring(0, email.indexOf('@'));

                // Every time the password changes, recalculate its strength and validity
                scope.$watch('password', function() {
                    // Recalculate password strength to display in the bar
                    if (scope.password) {
                        let results = zxcvbn(scope.password, [email, emailPrefix]);
                        scope.passwordStrength = results.score;
                    }
                    else scope.passwordStrength = -1;

                    // Recalculate the password's validity
                    recalculatePasswordValidity();

                    // If the password is strong via zxcvbn, but invalid via our own requirements, lower the strength to the highest invalid level
                    // This makes the UI clearer by showing a low strength for passwords we consider invalid
                    if (!scope.isValid && scope.passwordStrength >= Params.minPasswordStrengthLevel) {
                        scope.passwordStrength = Params.minPasswordStrengthLevel - 1;
                    }
                });

                /**
                 * @description Evaluates whether the password is valid, according to the above password requirements.
                 *              If invalid, compiles a list of error message keys with the reasons why it's invalid.
                 */
                function recalculatePasswordValidity() {
                    scope.errorMessageKeys = [];

                    // Skip validation if the password is empty
                    if (!scope.password) {
                        scope.isValid = false;
                        return;
                    }

                    // Check all validation requirements
                    let validity = true;
                    Object.entries(passwordRequirements).forEach(([errorKey, isInvalid]) => {
                        if (isInvalid(scope.password)) {
                            validity = false;
                            scope.errorMessageKeys.push(errorKey);
                        }
                    });
                    scope.isValid = validity;
                }
            },
        };
    }
})();
