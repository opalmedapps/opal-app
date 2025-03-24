/*
 * Filename     :   contactsController.js
 * Description  :   Manages the contacts view
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   27 Apr 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */

/**
* @ngdoc controller
* @scope
* @name MUHCApp.controller:ContactDoctorController
* @requires vm
* @description Controller manages the logic for the contact page of the doctor, the user is directed here through
* the {@link MUHCApp.controller:HomeController HomeController} view.
*
**/
(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('ContactsController', ContactsController);

    ContactsController.$inject = [
        'Doctors',
        '$filter'
    ];

    /* @ngInject */
    function ContactsController(
        Doctors,
        $filter
    ) {
        let vm = this;
        vm.noContacts = false;
        vm.doctors = [];

        activate();

        ////////////////

        function activate() {
            vm.noContacts = Doctors.isEmpty();
            vm.doctors = setDoctorsView(Doctors.getDoctors());
        }

        function setDoctorsView(doctors)
        {
            doctors = $filter('orderBy')(doctors, 'LastName', false);    // Sort ascending by LastName
            return doctors;
        }
    }
})();
