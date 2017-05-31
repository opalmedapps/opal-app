/*
 * Filename     :   pfpService.js
 * Description  :   Holds the data for the patient for patients module
 * Created by   :   David Herrera
 * Date         :   25 May 2017
 * Copyright    :   Copyright 2017, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */
(function()
{
    angular
    .module('MUHCApp')
    .service('Pfp', PatientForPatientService);
    function PatientForPatientService() {
        
        //Holds contacts
        this.contacts = [];
        var _emptyContacts = true;

        //Checks whether contacts are empty
        this.areContactsEmpty = function()
        {
            return _emptyContacts;
        };

        //Sets the contacts array
        this.setContacts = function(contacts) {
            if(contacts)
            {
                this.contacts = contacts;
                _emptyContacts = false;
            }
            
        };
        //Getter for the contacts array
        this.getContacts = function()
        {
            return this.contacts;
        };
    }
})();

