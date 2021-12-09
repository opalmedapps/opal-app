//
// Author David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
var myApp=angular.module('MUHCApp');
/**
 *@ngdoc service
 *@name MUHCApp.service:UpdateUI
 *@requires MUHCApp.service:Announcements
 *@requires MUHCApp.service:TxTeamMessages
 *@requires MUHCApp.service:Patient
 *@requires MUHCApp.service:Doctors
 *@requires MUHCApp.service:Appointments
 *@requires MUHCApp.service:Messages
 *@requires MUHCApp.service:Documents
 *@requires MUHCApp.service:EducationalMaterial
 *@requires MUHCApp.service:Notifications
 *@requires MUHCApp.service:UserPlanWorkflow
 *@requires MUHCApp.service:LocalStorage
 *@requires MUHCApp.service:RequestToServer
 *@requires MUHCApp.service:Diagnoses
 *@requires MUHCApp.service:NativeNotification
 *@requires $q
 *@requires $cordovaNetwork
 *@requires $filter
 *@description API service used to update the whole application. The UpdateUI service is in charge of timestamps for updates of sections, set up or any update to the user fields.
 **/
myApp.service('UpdateUI', ['Announcements','TxTeamMessages','Patient','Doctors','Appointments',
    'Documents','EducationalMaterial', 'UserAuthorizationInfo', '$q', 'Notifications',
    '$cordovaNetwork', 'LocalStorage','RequestToServer','$filter','Diagnoses',
    'NativeNotification', 'Tasks',

    function (Announcements, TxTeamMessages, Patient,Doctors, Appointments, Documents,
              EducationalMaterial, UserAuthorizationInfo, $q, Notifications,
              $cordovaNetwork,LocalStorage,RequestToServer,$filter,Diagnoses,
              NativeNotification, Tasks) {

        /**
         *@ngdoc property
         *@name  MUHCApp.service.#promiseFields
         *@propertyOf MUHCApp.service:UpdateUI
         *@description Array contains the fields for the patient that perform asynchronous operations.
         * This is done so that we have a generic way to make sure we wait for them whenever we are setting or updating patient information.
         * In the current case we have to wait for the fields to download the images into the device storage
         <pre>
         //Contents so far:
         var promiseFields =  ['Doctors', 'Patient'];
         **/
        var promiseFields = ['Doctors', 'Patient'];
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
        var sectionServiceMappings={
            'All':
            {
                init:setServices,
                update:updateServices,
                lastUpdated: 0,
            },
            'Documents':
            {
                init:Documents.setDocuments,
                update:Documents.updateDocuments,
                lastUpdated: 0,
            },
            'Patient':{
                setOnline:Patient.setUserFieldsOnline,
                update:Patient.setUserFieldsOnline,
                lastUpdated: 0,
            },
            'Doctors':{
                setOnline:Doctors.setUserContactsOnline,
                update:Doctors.updateUserContacts,
                lastUpdated: 0,
            },
            'Appointments':{
                init:Appointments.setUserAppointments,
                update:Appointments.updateUserAppointments,
                lastUpdated: 0,
            },
            'Tasks':{
                init: Tasks.setPlanningTasks,
                update:Tasks.setPlanningTasks,
                lastUpdated: 0,
            },
            'Diagnosis':
            {
                init:Diagnoses.setDiagnoses,
                update:Diagnoses.updateDiagnoses,
                lastUpdated: 0,
            },
            'TxTeamMessages':
            {
                init:TxTeamMessages.setTxTeamMessages,
                update:TxTeamMessages.updateTxTeamMessages,
                lastUpdated: 0,
            },
            'Announcements':
            {
                init:Announcements.setAnnouncements,
                update:Announcements.updateAnnouncements,
                lastUpdated: 0,
            },
            'EducationalMaterial':
            {
                init:EducationalMaterial.setEducationalMaterial,
                update:EducationalMaterial.updateEducationalMaterial,
                lastUpdated: 0,
            },
            'Notifications':
            {
                init:Notifications.initNotifications,
                update:Notifications.updateUserNotifications,
                lastUpdated: 0,
            }
        };

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
                if(error.Code !== '3')
                {
                    NativeNotification.showNotificationAlert($filter('translate')("ERRORCONTACTINGHOSPITAL"));
                }
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
        async function updateSection(parameters)
        {
            console.log(`Updating ${parameters}`);

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
        async function setSection(parameters)
        {
            console.log(`Initializing ${parameters}`);

            let response = await RequestToServer.sendRequestWithResponse('Refresh', {Fields: parameters});
            if (response.Data && response.Data !== "empty") await setServices(response.Data, 'setOnline');
            updateTimestamps(parameters, response.Timestamp);
        }

        /**
         * Helper functions
         */

        function updateTimestamps(content,time)
        {
            console.log("Init timestamps", time, content);
            if(content === 'All') for (let section of sectionServiceMappings) section.lastUpdated = time;
            else if(angular.isArray(content)) for (let section of content) sectionServiceMappings[section].lastUpdated = time;
            else sectionServiceMappings[content].lastUpdated = time;
        }

        function findSmallestTimestamp(content)
        {
            if (content === 'All') return findSmallestTimestamp(Object.keys(sectionServiceMappings));
            else if(angular.isArray(content)) {
                if (content.length === 0) return undefined;
                return content.reduce((min, section) => {
                    let lastUpdated = sectionServiceMappings[section].lastUpdated;
                    if (lastUpdated < min) return lastUpdated;
                    else return min;
                }, Infinity);
            }
            else return sectionServiceMappings[content].lastUpdated;
        }

        /**
         * @description Determines whether a category has been successfully initialized.
         *              Note: if an error occurred during its initialization process, the category is not considered initialized.
         * @param {string} category - The category to check.
         * @returns {boolean} True if the category has been successfully initialized; false otherwise.
         */
        function hasBeenInitialized(category) {
            if (!category) throw new Error("Category required");
            return sectionServiceMappings[category].lastUpdated !== 0;
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
            if (typeof categories === "string") return getData([categories]);
            else if (!Array.isArray(categories)) throw `GetData requires a string or array as input; received instead: ${categories} (${typeof categories})`;

            // Iterate through all categories to initialize or update them
            let toSet = [], toUpdate = [];
            for (let category of categories) {
                if (!sectionServiceMappings.hasOwnProperty(category)) throw `UpdateUI category not supported: ${category}`;

                // Depending on its status, dispatch the category to be initialized or updated
                if (hasBeenInitialized(category)) toUpdate.push(category);
                else toSet.push(category);
            }

            // Execute all initializations or updates simultaneously
            let setPromise = toSet.length === 0 ? undefined : setSection(toSet);
            let updatePromise = toUpdate.length === 0 ? undefined : updateSection(toUpdate);
            await Promise.all([setPromise, updatePromise]);
        }

        return {

            hasBeenInitialized: hasBeenInitialized,
            getData: getData,

            /**
             *@ngdoc method
             *@name init
             *@methodOf MUHCApp.service:UpdateUI
             *@param {String} type Online or Offline init
             *@description Initializes app by querying the hospital for all the data and setting the services.
             **/
            init:function()
            {
                return initServicesFromServer([
                    'Patient',
                    'Tasks',
                    'Notifications',
                ]);

            },
            /**
             *@ngdoc method
             *@name clearUpdateUI
             *@methodOf MUHCApp.service:UpdateUI
             *@description Clears all the timestamps.
             **/
            clearUpdateUI:function()
            {
                updateTimestamps(Object.keys(sectionServiceMappings), 0)
            }
        };
    }
]);
