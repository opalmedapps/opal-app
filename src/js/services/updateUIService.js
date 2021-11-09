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
                    initTimestamps(response.Timestamp);
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

        function initTimestamps(time)
        {
            for (let section in sectionServiceMappings) sectionServiceMappings[section].lastUpdated = time;
        }

        /**
         * Update sections
         */
        function updateSection(parameters)
        {
            var r = $q.defer();

            let refreshParams = {
                Fields: parameters,
                Timestamp: findSmallestTimestamp(parameters),
            };
            RequestToServer.sendRequestWithResponse('Refresh', refreshParams).then(
                function(data)
                {
                    if(data.Data =="Empty")
                    {
                        updateTimestamps(parameters, data.Timestamp);
                        r.resolve(true);
                    }else{
                        updateServices(data.Data).then(function()
                        {
                            updateTimestamps(parameters, data.Timestamp);
                            r.resolve(true);
                        });
                    }
                }).catch(function(error)
            {
                if(typeof error =='object'&&error.Response=='timeout')
                {
                    NativeNotification.showNotificationAlert($filter('translate')("ERRORCONTACTINGHOSPITAL"));
                }else{
                    if(error.Code !== '3') NativeNotification.showNotificationAlert($filter('translate')("ERRORCONTACTINGHOSPITAL"));
                }
                r.reject(error);
            });
            return r.promise;
        }

        function updateTimestamps(content,time)
        {
            if(content === 'All') for (let section of sectionServiceMappings) section.lastUpdated = time;
            else if(angular.isArray(content)) for (let section of content) sectionServiceMappings[section].lastUpdated = time;
            else sectionServiceMappings[content].lastUpdated = time;
        }
        /**
         * Reset sections
         */
        function setSection(parameters)
        {
            var r = $q.defer();
            RequestToServer.sendRequestWithResponse('Refresh',{Fields:parameters}).then(
                function(data)
                {
                    if(data.Data === "Empty")
                    {
                        updateTimestamps(parameters, data.Timestamp);
                        r.resolve(true);
                    }else{
                        setServices(data.Data,'setOnline').then(function()
                        {
                            updateTimestamps(parameters, data.Timestamp);
                            r.resolve(true);
                        });
                    }
                }).catch(function(error)
            {
                if(error.Code !== '3' || error.Response === 'timeout') NativeNotification.showNotificationAlert($filter('translate')("ERRORCONTACTINGHOSPITAL"));
                r.reject(error);
            });
            return r.promise;
        }
        /**
         * Helper functions
         */
        function findSmallestTimestamp(content)
        {
            if (content === 'All') return findSmallestTimestamp(sectionServiceMappings.keys);
            else if(angular.isArray(content)) {
                content.reduce((min, section) => {
                    let lastUpdated = sectionServiceMappings[section].lastUpdated;
                    if (lastUpdated < min) return lastUpdated;
                    else return min;
                }, Infinity);
            }
            else return sectionServiceMappings[content].lastUpdated;
        }

        return {
            //Function to update fields in the app, it does not initialize them, it only updates the new fields.
            //Parameter only defined when its a particular array of values.
            /**
             *@ngdoc method
             *@name update
             *@methodOf MUHCApp.service:UpdateUI
             *@param {String||Array} parameters Could be a string or an array, parameter signifying the sections to update, i.e. 'All', or ['Appointments','Documents'].
             *@description  asks the backend for the most recent data in the parameters
             object, gets the data and updates the corresponding services with this new data.
             **/
            update:function(parameters)
            {
                return updateSection(parameters);
            },
            /**
             *@ngdoc method
             *@name reset
             *@methodOf MUHCApp.service:UpdateUI
             *@param {String,Array} parameters Could be a string or an array, parameter signifying the sections to update, i.e. 'All', or ['Appointments','Documents'].
             *@description Completely reinstantiates services specified by the parameter by obtaining all the data from the Hospital and re-setting them.
             **/
            set:function(parameters)
            {
                // TODO validate input (should be categories that exists)
                return setSection(parameters);
            },
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
                    'TxTeamMessages',
                    'EducationalMaterial',
                    'Notifications',
                    'Announcements'
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
                initTimestamps(0);
            }
        };

    }]);
