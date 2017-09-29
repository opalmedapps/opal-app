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

    PatientForPatientService.$inject = ['RequestToServer', 'NativeNotification', '$q'];

    function PatientForPatientService(RequestToServer, NativeNotification, $q) {
        
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
            var q = $q.defer();
            if(this.areContactsEmpty()){
                RequestToServer.sendRequestWithResponse('PatientCommitteMembers')
                    .then(function (response) {
                        this.contacts = response.Data;
                        _emptyContacts = false;
                        clearTimeout(timeout);
                        q.resolve(this.contacts);
                    }.bind(this))
                    .catch(function (error)
                    {
                        if(error.Code==='2')
                        {
                            NativeNotification.showNotificationAlert($filter('translate')("ERRORCONTACTINGHOSPITAL"));
                            clearTimeout(timeout);
                            q.resolve([]);
                        }
                    });

                var timeout = setTimeout(function(){ q.resolve([])}, 5000);
            } else {
                q.resolve(this.contacts);
            }

            return q.promise
        };
    }
})();

