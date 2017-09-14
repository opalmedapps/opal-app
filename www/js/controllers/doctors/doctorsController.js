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
        'NavigatorParameters',
        '$filter'
    ];

    /* @ngInject */
    function ContactsController(
        Doctors,
        NavigatorParameters,
        $filter
    ) {
        var vm = this;
        vm.title = 'ContactsController';
        vm.noContacts = null;
        vm.oncologists = null;
        vm.primaryPhysician = null;
        vm.otherDoctors = null;
        vm.showHeader = showHeader;

        activate();

        ////////////////

        function activate() {
            vm.noContacts = Doctors.isEmpty();
            vm.doctors = Doctors.getDoctors();
            vm.doctors = setDoctorsView(vm.doctors);
        }

        function goDoctorContact(doctor){

            NavigatorParameters.setParameters({Navigator:'generalNavigator',Data:doctor});
            generalNavigator.pushPage('views/general/contacts/individual-contact.html', {param:doctor},{ animation : 'slide' } );
        }


        function setDoctorsView(doctors)
        {
            doctors.forEach(function(doctor)
            {
                if(doctor.PrimaryFlag === 1 && doctor.OncologistFlag === 1){
                    doctor.Role = $filter('translate')("PRIMARYDOCTOR");
                }else if(doctor.OncologistFlag === 1){
                    doctor.Role = $filter('translate')("ONCOLOGIST");
                }else{
                    doctor.Role = $filter('translate')("OTHER");
                }
            });
            doctors = $filter('orderBy')(doctors, 'Role',true);
            return doctors;
        }
        function showHeader(index)
        {
            return index === 0 || vm.doctors[index].Role !== vm.doctors[index - 1].Role;
        }
    }

})();



