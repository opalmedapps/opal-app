/*
 * Filename     :   doctorsService.js
 * Description  :   Service that stores and manages the patient's doctors. To be converted to contacts.
 * Created by   :   David Herrera, Robert Maglieri
 * Date         :   02 Mar 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */

let myApp=angular.module('MUHCApp');
/**
 *@ngdoc service
 *@name MUHCApp.service:Doctors
 *@requires $q
 *@description Sets the doctors and contacts and provides an API to interact with them and the server
 **/
myApp.service('Doctors',['$q', function($q) {

    /**
     *@ngdoc property
     *@name MUHCApp.service.#Doctors
     *@propertyOf MUHCApp.service:Doctors
     *@description Array of all doctors
     **/
    let Doctors = [];

    let lastUpdated = 0;

    //Function finds if there are doctors that had their fields updated and deletes them from the appropiate arrays.
    function searchDoctorsAndDelete(doctors)
    //TODO change function to an update.
    {
        //Go through the new doctors
        for (var i = 0; i < doctors.length; i++) {
            //Go through the old Doctors array
            for (var j = 0; j < Doctors.length; j++) {
                //If they have the same SerNum, delete from Doctors
                if(Doctors[j].DoctorSerNum === doctors[i].DoctorSerNum) Doctors.splice(j,1);
            }
        }
    }

    // Adds array of doctors to doctor array
    function addPatientContacts(doctors)
    {
        var r=$q.defer();
        var promises=[];

        if(typeof doctors!=='undefined'&&doctors){
            var doctorKeyArray=Object.keys(doctors);
            for (var i = 0; i < doctorKeyArray.length; i++) {
                if(typeof doctors[doctorKeyArray[i]].ProfileImage!=='undefined'&&doctors[doctorKeyArray[i]].ProfileImage!=='')
                {
                    if(doctors[doctorKeyArray[i]].DocumentType=='pdf')
                    {
                        doctors[doctorKeyArray[i]].ProfileImage='data:application/pdf;base64,'+doctors[doctorKeyArray[i]].ProfileImage;
                    }else{
                        doctors[doctorKeyArray[i]].ProfileImage='data:image/'+doctors[doctorKeyArray[i]].DocumentType+';base64,'+doctors[doctorKeyArray[i]].ProfileImage;
                    }
                }
            }
            for (var i = 0; i < doctors.length; i++) {
                var copyDoctor=angular.copy(doctors[i]);
                delete doctors[i].ProfileImage;
                Doctors.push(copyDoctor);
            }

            $q.all(promises).then(function(){
                r.resolve(true);
            });
        }else{
            r.resolve(true);
        }
        return r.promise;
    }

    return {
        /**
         *@ngdoc method
         *@name setUserContactsOnline
         *@methodOf MUHCApp.service:Doctors
         *@param {Array} doctors Array of doctors
         *@description Instatiates properties with the doctors Online
         *@returns {Promise} Returns a promise after saving the doctors images.
         **/
        setUserContactsOnline:function(doctors)
        {
            Doctors=[];
            lastUpdated = Date.now();
            return addPatientContacts(doctors);

        },

        /**
         *@ngdoc method
         *@name updateUserContacts
         *@methodOf MUHCApp.service:Doctors
         *@param {Array} doctors Array of doctors
         *@description Updates all the array properties, finds and replaces the old ones and adds the new doctors
         *@returns {Promise} Returns a promise after saving the doctors images.
         **/
        updateUserContacts:function(doctors)
        {
            searchDoctorsAndDelete(doctors);
            lastUpdated = Date.now();
            return addPatientContacts(doctors);
        },

        /**
         *@ngdoc method
         *@name isEmpty
         *@methodOf MUHCApp.service:Doctors
         *@returns {Boolean} Returns whether there are no contacts
         **/
        isEmpty:function()
        {
            return Doctors.length === 0;
        },

        /**
         *@ngdoc method
         *@name getDoctors
         *@methodOf MUHCApp.service:Doctors
         *@returns {Array} Returns array of Doctors
         **/
        getDoctors:function(){
            return Doctors;
        },

        /**
         *@ngdoc method
         *@name clearDoctors
         *@methodOf MUHCApp.service:Doctors
         *@params {Array} Array of doctors
         *@description Reinstantiates or empties the doctors service. Used by the Logout Controller
         **/
        clearDoctors:function()
        {
            Doctors = [];
            lastUpdated = 0;
        },

        getLastUpdated: function() {
            return lastUpdated;
        }
    };
}]);
