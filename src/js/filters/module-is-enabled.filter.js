// SPDX-FileCopyrightText: Copyright (C) 2026 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .filter('moduleIsEnabled', moduleIsEnabled);

    moduleIsEnabled.$inject = ['Params', 'UserHospitalPreferences'];

    /**
     * @description Filter that checks if a module is enabled at the current hospital for the current profile.
     * @param {string} module The three-letter module code to check.
     * @param {string} profileAccessLevel The current profile's access level (either "ALL", or "NTK" - Need to Know).
     */
    function moduleIsEnabled(Params, UserHospitalPreferences) {
        return (module, profileAccessLevel) => {
            const needToKnow = profileAccessLevel === "NTK";
            const disabledNeedToKnow = needToKnow && Params.modulesDisabledNeedToKnow.includes(module);
            const hospitalModuleEnabled = !!UserHospitalPreferences.getHospitalAllowedModules()[module];

            return module && hospitalModuleEnabled && !disabledNeedToKnow;
        };
    }
})();
