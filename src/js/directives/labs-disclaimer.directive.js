// SPDX-FileCopyrightText: Copyright (C) 2021 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

import "../../css/directives/labs-disclaimer.directive.css";

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .directive("labsDisclaimer", LabsDisclaimer);

    LabsDisclaimer.$inject = [];

    /**
     * @name LabsDisclaimer
     * @author Stacey Beard
     * @date 2021-05-19
     * @desc Directive for the lab results disclaimer bar.
     * @example <labs-disclaimer></labs-disclaimer>
     */
    function LabsDisclaimer()
    {
        let directive = {
            restrict: 'E',
            scope: { },
            template: `
                <div class="labs-disclaimer">
                    <ons-icon icon="fa-solid fa-triangle-exclamation"></ons-icon>
                    <span>{{"LAB_DISCLAIMER"|translate}}</span>
                </div>
            `,
        };
        return directive;
    }
})();
