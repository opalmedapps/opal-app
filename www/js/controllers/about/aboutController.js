/*
 * Filename     :   aboutController.js
 * Description  :   Manages the about view. Only controls the link to the Cedar's donation page.
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   18 Apr 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */


(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('AboutController', AboutController);

    AboutController.$inject = ['$window', 'UserPreferences'];

    /* @ngInject */
    function AboutController($window, UserPreferences) {
        var vm = this;
        vm.language = '';
        vm.openDonation = openDonation;

        activate();

        ////////////////

        function activate() {
            vm.language = UserPreferences.getLanguage().toLowerCase();
        }

        /**
         * Open the Cedar's donation page using the user preferred language.
         */
        function openDonation() {
            $window.open('https://www.cedars.ca/cedars/'+ vm.language +'/donate/donate_online?designation=radiation-oncology-opal-fund','_system');
        }

    }

})();

