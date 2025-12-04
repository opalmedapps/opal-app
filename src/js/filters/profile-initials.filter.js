// SPDX-FileCopyrightText: Copyright (C) 2022 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .filter('profileInitials', ProfileInitials);
    /**
     * @description Filter that gets the first letters of the first and last name for icon display.
     * @author David Gagne
     * @date 2022-10-13
     */
    function ProfileInitials() {
        return profile => {
            return profile ? `${profile?.first_name?.substr(0, 1)}${profile?.last_name?.substr(0, 1)}` : '';
        };
    }
})();
