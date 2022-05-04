/**
 * @file Service that handles downloading, updating and setting other services with patient data for the whole application.
 * @author David Herrera, Stacey Beard
 */
(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .factory('UpdateUI', UpdateUI);

    UpdateUI.$inject = ['$filter','$injector','$q','Announcements','Appointments','Diagnoses','Documents',
        'EducationalMaterial','NativeNotification','Notifications','Patient','PatientTestResults',
        'RequestToServer','TxTeamMessages'];

    function UpdateUI($filter, $injector, $q, Announcements, Appointments, Diagnoses, Documents,
                      EducationalMaterial, NativeNotification, Notifications, Patient, PatientTestResults,
                      RequestToServer, TxTeamMessages) {

        /**
         *@ngdoc property
         *@name  MUHCApp.service.#promiseFields
         *@propertyOf MUHCApp.service:UpdateUI
         *@description Array contains the fields for the patient that perform asynchronous operations.
         * This is done so that we have a generic way to make sure we wait for them whenever we are setting or updating patient information.
         * In the current case we have to wait for the fields to download the images into the device storage
         <pre>
         //Contents so far:
         var promiseFields =  ['Patient'];
         **/
        var promiseFields = ['Patient'];
        /**
         *@ngdoc property
         *@name  MUHCApp.service.#sectionServiceMappings
         *@propertyOf MUHCApp.service:UpdateUI
         *@description Array contains all the details concerning setting or update for patient fields, or patient modules
         <pre>
         //Example:
         var sectionServiceMappings={
              'Patient':{
                  setOnline:Patient.setUserFieldsOnline,
                  update:Patient.setUserFieldsOnline,
                  lastUpdated: 0,
              },
              ...
         **/
        let sectionServiceMappings = {
            'Documents': {
                init: Documents.setDocuments,
                update: Documents.updateDocuments,
                lastUpdated: 0,
            },
            'Patient': {
                setOnline: Patient.setUserFieldsOnline,
                update: Patient.setUserFieldsOnline,
                lastUpdated: 0,
            },
            'Appointments': {
                init: Appointments.setUserAppointments,
                update: Appointments.updateUserAppointments,
                lastUpdated: 0,
            },
            'Diagnosis': {
                init: Diagnoses.setDiagnoses,
                update: Diagnoses.updateDiagnoses,
                lastUpdated: 0,
            },
            'TxTeamMessages': {
                init: TxTeamMessages.setTxTeamMessages,
                update: TxTeamMessages.updateTxTeamMessages,
                lastUpdated: 0,
            },
            'Announcements': {
                init: Announcements.setAnnouncements,
                update: Announcements.updateAnnouncements,
                lastUpdated: 0,
            },
            'EducationalMaterial': {
                init: EducationalMaterial.setEducationalMaterial,
                update: EducationalMaterial.updateEducationalMaterial,
                lastUpdated: 0,
            },
            'Notifications': {
                init: Notifications.initNotifications,
                update: Notifications.updateUserNotifications,
                lastUpdated: 0,
            },
            'PatientTestDates': {
                init: PatientTestResults.setTestDates,
                update: PatientTestResults.updateTestDates,
                lastUpdated: 0,
            },
            'PatientTestTypes': {
                init: PatientTestResults.setTestTypes,
                update: PatientTestResults.updateTestTypes,
                lastUpdated: 0,
            },
        };

        let service = {
            haveBeenInitialized: haveBeenInitialized,
            getData: getData,
            init: () => initServicesFromServer(['Patient', 'Notifications']),
            clearUpdateUI: () => updateTimestamps(Object.keys(sectionServiceMappings), 0),
        };

        return service;

        ////////////////

        function setPromises(type, dataUserObject)
        {
            var promises = [];
            for(var i = 0;i<promiseFields.length;i++)
            {
                if(dataUserObject.hasOwnProperty(promiseFields[i])) promises.push(sectionServiceMappings[promiseFields[i]][type](dataUserObject[promiseFields[i]]));
            }
            return promises;
        }

        function setServices(dataUserObject,mode)
        {
            var r = $q.defer();
            var promises = setPromises(mode,dataUserObject);
            $q.all(promises).then(function(){
                for(var key in dataUserObject)
                {
                    if(sectionServiceMappings.hasOwnProperty(key)&&promiseFields.indexOf(key)==-1)
                    {
                        sectionServiceMappings[key].init(dataUserObject[key]);
                    }
                }
                r.resolve(true);
            }).catch(function(error)
            {
                console.log(error);
                r.reject(error);
            });
            return r.promise;
        }

        function updateServices(dataUserObject){
            var r = $q.defer();
            $q.all(setPromises('update', dataUserObject)).then(function(result)
            {
                for(var key in dataUserObject)
                {
                    if(sectionServiceMappings.hasOwnProperty(key)&&promiseFields.indexOf(key)==-1)
                    {
                        sectionServiceMappings[key].update(dataUserObject[key]);
                    }
                }
                r.resolve(true);
            }).catch(function(error)
            {
                console.log(error);
                r.reject(error);
            });
            return r.promise;
        }

        /**
         * Initialize sections
         */
        //Initializes all the services online at either login, or simple entering the app once
        //patient is already register
        function initServicesFromServer(parameters)
        {
            //Sets the path for data fetching
            var r=$q.defer();
            //Initializing all the services
            RequestToServer.sendRequestWithResponse('Login', {Fields:parameters}).then(function(response)
            {
                setServices(response.Data, 'setOnline').then(function()
                {
                    updateTimestamps(parameters, response.Timestamp);
                    r.resolve(true);
                });
            }).catch(function(error) {
                console.error(error);
                const LogOutService = $injector.get('LogOutService');
                NativeNotification.showNotificationAlert($filter('translate')("ERROR_CONTACTING_HOSPITAL"), LogOutService.logOut);
                r.reject(false);
            });
            return r.promise;
        }

        /**
         * @description Queries the backend for newly updated data in the given categories, receiving only data that has
         *              been changed since the last update. Updates the corresponding services with this new data.
         * @param {Array<string>} parameters - The categories of data to update.
         * @returns {Promise<void>} Resolves if all data was successfully updated, or rejects with an error.
         */
        async function updateSection(parameters) {
            let refreshParams = {
                Fields: parameters,
                Timestamp: findSmallestTimestamp(parameters),
            };

            let response = await RequestToServer.sendRequestWithResponse('Refresh', refreshParams);
            if (response.Data && response.Data !== "empty") await updateServices(response.Data);
            updateTimestamps(parameters, response.Timestamp);
        }

        /**
         * @description Queries the backend for all data in each of the given categories. Initializes the corresponding
         *              services with this data (clearing any existing data).
         * @param {Array<string>} parameters - The categories of data to initialize.
         * @returns {Promise<void>} Resolves if all data was successfully initialized, or rejects with an error.
         */
        async function setSection(parameters) {
            let response = await RequestToServer.sendRequestWithResponse('Refresh', {Fields: parameters});
            if (response.Data && response.Data !== "empty") await setServices(response.Data, 'setOnline');
            updateTimestamps(parameters, response.Timestamp);
        }

        /**
         * Helper functions
         */

        /**
         * @description Iterates through the 'lastUpdated' timestamps in the given categories in sectionServiceMappings
         *              and sets them to a certain value.
         * @param {string| Array<string>} categories - The category or categories to update.
         * @param {number} time - The new value to which to set lastUpdated.
         */
        function updateTimestamps(categories, time) {
            if(angular.isArray(categories)) for (let section of categories) sectionServiceMappings[section].lastUpdated = time;
            else sectionServiceMappings[categories].lastUpdated = time;
        }

        /**
         * @description Finds and returns the smallest 'lastUpdated' timestamp among the given categories.
         * @param {string| Array<string>} categories - The category or categories to check.
         * @returns {number|undefined} The smallest lastUpdated value for the given categories.
         */
        function findSmallestTimestamp(categories) {
            if (Array.isArray(categories)) {
                if (categories.length === 0) return undefined;
                return categories.reduce((min, category) => {
                    let lastUpdated = sectionServiceMappings[category].lastUpdated;
                    if (lastUpdated < min) return lastUpdated;
                    else return min;
                }, Infinity);
            }
            else return sectionServiceMappings[categories].lastUpdated;
        }

        /**
         * @description Determines whether all provided category have been successfully initialized.
         *              Note: if an error occurred during its initialization process, a category is not considered initialized.
         * @param {string| Array<string>} categories - The category or categories to check.
         * @returns {boolean} True if the category has been successfully initialized; false otherwise.
         *                    If an array is provided, this function will return false if at least one category has not been initialized.
         */
        function haveBeenInitialized(categories) {
            validateCategories(categories);
            if (!Array.isArray(categories)) return haveBeenInitialized([categories]);
            return categories.every(category => sectionServiceMappings[category].lastUpdated !== 0);
        }

        /**
         * @description Validates a category or array of categories by checking whether it's in sectionServiceMappings.
         * @param {string | Array<string>} categories - The category or categories to check.
         * @throws {string} An error if a category is invalid.
         */
        function validateCategories(categories) {
            if (!Array.isArray(categories)) return validateCategories([categories]);
            categories.forEach(category => {
                if (!sectionServiceMappings.hasOwnProperty(category)) throw `Invalid UpdateUI category: ${category}`;
            });
        }

        /**
         * @description Initializes or updates data in the requested categories. If data in a category has not been
         *              requested yet, or an error has prevented it from being requested successfully, it will
         *              be initialized; otherwise, it will be updated.
         * @param {string | Array<string>} categories - The categories of data to initialize or update.
         * @returns {Promise<void>} Resolves if all data was successfully initialized / updated, or rejects with an error.
         */
        async function getData(categories) {
            // Validate input
            validateCategories(categories);
            if (typeof categories === "string") return getData([categories]);

            // Iterate through all categories to initialize or update them
            let toSet = [], toUpdate = [];
            for (let category of categories) {
                // Depending on its status, dispatch the category to be initialized or updated
                if (haveBeenInitialized(category)) toUpdate.push(category);
                else toSet.push(category);
            }

            // Execute all initializations or updates simultaneously
            let setPromise = toSet.length === 0 ? undefined : setSection(toSet);
            let updatePromise = toUpdate.length === 0 ? undefined : updateSection(toUpdate);
            await Promise.all([setPromise, updatePromise]);
        }
    }
})();
