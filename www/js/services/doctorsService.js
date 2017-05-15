/*
 * Filename     :   doctorsService.js
 * Description  :   Service that stores and manages the patient's doctors. To be converted to contacts.
 * Created by   :   David Herrera, Robert Maglieri 
 * Date         :   02 Mar 2017
 * Copyright    :   Copyright 2016, HIG, All rights reserved.
 * Licence      :   This file is subject to the terms and conditions defined in
 *                  file 'LICENSE.txt', which is part of this source code package.
 */



var myApp=angular.module('MUHCApp');
/**
 *@ngdoc service
 *@name MUHCApp.service:Doctors
 *@requires MUHCApp.service:LocalStorage
 *@requires MUHCApp.service:RequestToServer
 *@requires MUHCApp.service:FileManagerService
 *@requires $q
 *@requires $filter
 *@description Sets the doctors and contacts and provides an API to interact with them and the server
 **/
myApp.service('Doctors',['$q','LocalStorage','$filter','FileManagerService', function($q,LocalStorage,$filter,FileManagerService){

    //Arrays containining the different doctors.
    /**
     *@ngdoc property
     *@name  MUHCApp.service.#Doctors
     *@propertyOf MUHCApp.service:Doctors
     *@description Array of all doctors
     **/
    var Doctors=[];
    // /**
    //  *@ngdoc property
    //  *@name  MUHCApp.service.#Oncologists
    //  *@propertyOf MUHCApp.service:Doctors
    //  *@description Array of Oncologists
    //  **/
    // var Oncologists=[];
    // /**
    //  *@ngdoc property
    //  *@name  MUHCApp.service.#OtherDoctors
    //  *@propertyOf MUHCApp.service:Doctors
    //  *@description Array of other doctors
    //  **/
    // var OtherDoctors=[];
    // /**
    //  *@ngdoc property
    //  *@name  MUHCApp.service.#PrimaryPhysician
    //  *@propertyOf MUHCApp.service:Doctors
    //  *@description Array of primary doctors
    //  **/
    // var PrimaryPhysician=[];

    //Array without the actually doctor pictures that goes into the localStarge
    var doctorsStorage=[];

    var lastUpdated = 0;

    //Function finds if there are doctors that had their fields updated and deletes them from the appropiate arrays.
    function searchDoctorsAndDelete(doctors)
    //TODO change function to an update.
    {
        //Go through the new doctors
        for (var i = 0; i < doctors.length; i++) {
            //Go through the old Doctors array
            for (var j = 0; j < Doctors.length; j++) {
                //If they have the same ser num delete from the doctorsStorage and Doctors
                if(Doctors[j].DoctorSerNum==doctors[i].DoctorSerNum)
                {
                    //Delete from arrays
                    doctorsStorage.splice(j,1);
                    //If also a primary doctor, delete primary doctors
                    if(Doctors[j].PrimaryFlag=='1'&&Doctors[j].OncologistFlag=='0'){
                        PrimaryPhysician=[];
                        Doctors.splice(j,1);
                        break;
                    }else if(Doctors[j].OncologistFlag=='1')
                    {
                        //If oncologist delete oncologist
                        for (var k = 0; k < Oncologists.length; k++) {
                            if(Doctors[j].DoctorSerNum==Oncologists[k].DoctorSerNum)
                            {
                                Oncologists.splice(k,1);
                                Doctors.splice(j,1);
                                break;
                            }
                        }
                    }else{
                        //If other doctor delete from other doctor
                        for (var k = 0; k < OtherDoctors.length; k++) {
                            if(Doctors[j].DoctorSerNum==OtherDoctors[k].DoctorSerNum)
                            {
                                OtherDoctors.splice(k,1);
                                Doctors.splice(j,1);
                                break;
                            }
                        }
                    }
                    break;
                }
            }
        }
    }
    //Adds array of doctors to doctor array and downloads the doctor pictures into storage.
    function addPatientContacts(doctors)
    // TODO should always append doctors to the list
    {
        var r=$q.defer();
        var promises=[];

        if(typeof doctors!=='undefined'&&doctors){
            var doctorKeyArray=Object.keys(doctors);
            for (var i = 0; i < doctorKeyArray.length; i++) {
                //doctors[doctorKeyArray[i]].Phone=$filter('FormatPhoneNumber')(doctors[doctorKeyArray[i]].Phone);
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
            var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
            if(app){
                for (var i = 0; i < doctorKeyArray.length; i++) {
                    if(typeof doctors[doctorKeyArray[i]].ProfileImage!=='undefined'&&doctors[doctorKeyArray[i]].ProfileImage!=='')
                    {
                        var targetPath='';
                        doctors[i].NameFileSystem='doctor'+doctors[i].DoctorSerNum+"."+doctors[i].DocumentType;
                        if(ons.platform.isAndroid()){
                            targetPath = cordova.file.dataDirectory+'Doctors/doctor'+doctors[doctorKeyArray[i]].DoctorSerNum+"."+doctors[doctorKeyArray[i]].DocumentType;
                            doctors[i].CDVfilePath="cdvfile://localhost/files/Doctors/"+doctors[i].NameFileSystem;
                        }else if(ons.platform.isIOS()){
                            targetPath = cordova.file.documentsDirectory+ 'Doctors/doctor'+doctors[doctorKeyArray[i]].DoctorSerNum+"."+doctors[doctorKeyArray[i]].DocumentType;
                            doctors[i].CDVfilePath="cdvfile://localhost/persistent/Doctors/"+doctors[i].NameFileSystem;
                        }
                        var url = doctors[doctorKeyArray[i]].ProfileImage;
                        var trustHosts = true
                        var options = {};
                        doctors[i].PathFileSystem=targetPath;

                        promises.push(FileManagerService.downloadFileIntoStorage(url, targetPath));
                    }
                }
            }
            for (var i = 0; i < doctors.length; i++) {
                var copyDoctor=angular.copy(doctors[i]);
                delete doctors[i].ProfileImage;
                doctorsStorage.push(doctors[i]);
                if(typeof copyDoctor.ProfileImage=='undefined'||copyDoctor.ProfileImage=='')
                {
                    copyDoctor.ProfileImage='./img/doctor.png';
                }
                // if(copyDoctor.PrimaryFlag=='1'&&copyDoctor.OncologistFlag=='1'){
                //     PrimaryPhysician.push(copyDoctor);
                // }else if(copyDoctor.OncologistFlag=='1')
                // {
                //     Oncologists.push(copyDoctor);
                // }else{
                //     OtherDoctors.push(copyDoctor);
                // }
                Doctors.push(copyDoctor);
            };
         
            LocalStorage.WriteToLocalStorage('Doctors',doctorsStorage);
            $q.all(promises).then(function(){
                r.resolve(true);
            });
        }else{
            r.resolve(true);
        }
        return r.promise;
    }
    return{
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
            doctorsStorage=[];
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
         *@name setUserContactsOffline
         *@methodOf MUHCApp.service:Doctors
         *@param {Array} doctors Array of doctors
         *@description Gets the doctors from localStorage and sets the object, thus 'offline'
         *@returns {Promise} Returns a promise after obtaining the images
         **/
        setUserContactsOffline:function(doctors)
        {
            var r=$q.defer();
            Doctors=[];
            var promises=[];
            lastUpdated = Date.now();

            /*
             *Add code for offline extraction of doctors photos
             */

            if(typeof doctors!=='undefined'&&doctors){
                var doctorKeyArray=Object.keys(doctors);
                for (var i = 0; i < doctors.length; i++) {
                    var copyDoctor=angular.copy(doctors[i]);
                    if(doctors[i].PathFileSystem)
                    {
                        copyDoctor.ProfileImage=copyDoctor.CDVfilePath;
                    }else{
                        copyDoctor.ProfileImage='./img/doctor.png';
                    }

                    //TODO delete comment out code
                    // if(copyDoctor.PrimaryFlag=='1'&&copyDoctor.OncologistFlag=='1'){
                    //     PrimaryPhysician.push(copyDoctor);
                    // }else if(copyDoctor.OncologistFlag=='1')
                    // {
                    //     Oncologists.push(copyDoctor);
                    // }else{
                    //     OtherDoctors.push(copyDoctor);
                    // }
                    Doctors.push(copyDoctor);
                };
                // Oncologists=$filter('orderBy')(Oncologists,'LastName',false);
                // Doctors=$filter('orderBy')(Doctors,'LastName',false);
                // OtherDoctors=$filter('orderBy')(OtherDoctors,'LastName',false);
                r.resolve(true);
            }else{
                r.resolve(true);
            }

            return r.promise;
        },
        /**
         *@ngdoc method
         *@name isEmpty
         *@methodOf MUHCApp.service:Doctors
         *@returns {Boolean} Returns whether there are no contacts
         **/
        isEmpty:function()
        {
            if(Doctors.length===0)
            {
                return true;
            }else{
                return false;
            }
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
         *@name getPrimaryPhysician
         *@methodOf MUHCApp.service:Doctors
         *@returns {Array} Returns array of primary physicians
         **/
        // getPrimaryPhysician:function(){
        //     return PrimaryPhysician;
        // },
        // /**
        //  *@ngdoc method
        //  *@name getOncologists
        //  *@methodOf MUHCApp.service:Doctors
        //  *@returns {Array} Returns array of oncologists
        //  **/
        // getOncologists:function(){
        //     return Oncologists;
        // },
        // /**
        //  *@ngdoc method
        //  *@name getOtherDoctors
        //  *@methodOf MUHCApp.service:Doctors
        //  *@returns {Array} Returns array of other doctors
        //  **/
        // getOtherDoctors:function(){
        //     return OtherDoctors;
        // },
        /**
         *@ngdoc method
         *@name getDoctorBySerNum
         *@methodOf MUHCApp.service:Doctors
         *@param {String} userSerNum DoctorSerNum to match
         *@description Iterates through doctor array until a doctor matches the DoctorSerNum
         *@returns {Object} Returns doctor whose DoctorSerNum matches the doctorSerNum parameter
         **/
        getDoctorBySerNum:function(userSerNum){
            for (var i = 0; i < Doctors.length; i++) {
                if(Doctors[i].DoctorSerNum===userSerNum)
                {
                    console.log(Doctors[i]);
                    return Doctors[i];
                }
            }
        },
        /**
         *@ngdoc method
         *@name getDoctorIndexBySerNum
         *@methodOf MUHCApp.service:Doctors
         *@param {String} userSerNum DoctorSerNum to match
         *@description Filters doctors array by DoctorsSerNum and returns the index
         *@returns {Number} Returns index of matching doctor
         **/
        getDoctorIndexBySerNum:function(userSerNum){
            for (var i = 0; i < Doctors.length; i++) {
                if(Doctors[i].DoctorSerNum===userSerNum)
                {
                    console.log(i);
                    return i;
                }
            }
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
            Doctors=[];
            // Oncologists=[];
            // OtherDoctors=[];
            // PrimaryPhysician=[];
            doctorsStorage=[];
            lastUpdated = 0;
        },

        getLastUpdated: function() {
            return lastUpdated;
        }

    };
}]);
