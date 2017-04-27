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
        'NavigatorParameters'
    ];

    /* @ngInject */
    function ContactsController(
        Doctors,
        NavigatorParameters
    ) {
        var vm = this;
        vm.title = 'ContactsController';
        vm.noContacts = null;
        vm.oncologists = null;
        vm.primaryPhysician = null;
        vm.otherDoctors = null;

        vm.goDoctorContact = goDoctorContact;

        activate();

        ////////////////

        function activate() {
            vm.noContacts = Doctors.isEmpty();
            vm.oncologists=Doctors.getOncologists();
            vm.primaryPhysician=Doctors.getPrimaryPhysician();
            vm.otherDoctors=Doctors.getOtherDoctors();
        }

        function goDoctorContact(doctor){

            NavigatorParameters.setParameters({Navigator:'generalNavigator',Data:doctor});
            generalNavigator.pushPage('views/general/contacts/individual-contact.html', {param:doctor},{ animation : 'slide' } );
        }
    }

})();

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
        .controller('ContactIndividualDoctorController', ContactIndividualDoctorController);

    ContactIndividualDoctorController.$inject = ['NavigatorParameters'];

    /* @ngInject */
    function ContactIndividualDoctorController(NavigatorParameters) {
        var vm = this;
        vm.title = 'ContactIndividualDoctorController';
        vm.doctor = null;
        vm.header = '';

        activate();

        ////////////////

        function activate() {
            var params = NavigatorParameters.getParameters();
            vm.doctor = params.Data;
            if(vm.doctor.PrimaryFlag===1){
                vm.header='Primary Physician';
            }else if(vm.doctor.OncologistFlag===1){
                vm.header='Oncologist';
            }else{
                vm.header='Doctor';
            }
        }
    }

})();

