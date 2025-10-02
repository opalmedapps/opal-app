// SPDX-FileCopyrightText: Copyright (C) 2025 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

import '../../../css/views/ips.view.css';

(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller('IPSDescriptionController', IPSDescriptionController);

    IPSDescriptionController.$inject = ['Navigator'];

    function IPSDescriptionController(Navigator) {
        const vm = this;

        let navigator;

        vm.openPreviewOrShare = () => navigator.pushPage('./views/personal/ips/ips-preview-share.html');

        activate();

        function activate() {
            navigator = Navigator.getNavigator();
        }
    }
})();
