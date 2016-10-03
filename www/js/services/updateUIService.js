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
 *@requires MUHCApp.service:Questionnaires
 *@requires MUHCApp.service:NativeNotification
 *@requires $q
 *@requires $cordovaNetwork
 *@requires $filter
 *@description API service used to update the whole application. The UpdateUI service is in charge of timestamps for updates of sections, set up or any update to the user fields.
 **/
myApp.service('UpdateUI', ['Announcements','TxTeamMessages','Patient','Doctors','Appointments','Messages','Documents','EducationalMaterial', 'UserAuthorizationInfo', '$q', 'Notifications', 'UserPlanWorkflow','$cordovaNetwork', 'LocalStorage','RequestToServer','$filter','Diagnoses','Questionnaires',
  'NativeNotification','LabResults',function (Announcements, TxTeamMessages, Patient,Doctors, Appointments,Messages, Documents, EducationalMaterial, UserAuthorizationInfo, $q, Notifications, UserPlanWorkflow,$cordovaNetwork,LocalStorage,RequestToServer,$filter,Diagnoses,Questionnaires, NativeNotification,LabResults ) {
    /**
     *@ngdoc property
     *@name  MUHCApp.service.#lastUpdateTimestamp
     *@propertyOf MUHCApp.service:UpdateUI
     *@description Initiatiates object with all the timestamps
     <pre> var lastUpdateTimestamp={
        'All':0,
        'Appointments':0,
        //'Messages':0,
        'Documents':0,
        'Tasks':0,
        'Doctors':0,
        //'LabTests':0,
        'Patient':0,
        'Notifications':0,
        'EducationalMaterial':0,
        'Questionnaires':0
  };</pre>
     **/
    var lastUpdateTimestamp={
      'All':0,
      'Appointments':0,
      //'Messages':0,
      'Documents':0,
      'Tasks':0,
      'Doctors':0,
      //'LabTests':0,
      'Patient':0,
      'Notifications':0,
      'EducationalMaterial':0,
      'Questionnaires':0
    };
    /**
     *@ngdoc property
     *@name  MUHCApp.service.#promiseFields
     *@propertyOf MUHCApp.service:UpdateUI
     *@description Array contains the fields for the patient that perform asynchronous operations. This is done so that we have a generic way to make sure we wait for them whenever we are setting or updating patient information. In the current case
     we have to wait for the fields to download the images into the device storage
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
      setOffline:Patient.setUserFieldsOffline
    },...
  **/
    var sectionServiceMappings={
      'All':
      {
        init:setServices,
        update:updateServices
      },
      'Documents':
      {
        init:Documents.setDocuments,
        update:Documents.updateDocuments
      },
      'Patient':{
        setOnline:Patient.setUserFieldsOnline,
        update:Patient.setUserFieldsOnline,
        setOffline:Patient.setUserFieldsOffline
      },
      'Doctors':{
        setOnline:Doctors.setUserContactsOnline,
        update:Doctors.updateUserContacts,
        setOffline:Doctors.setUserContactsOffline
      },
      'Appointments':{
        init:Appointments.setUserAppointments,
        update:Appointments.updateUserAppointments
      },
      /*'Messages':
       {
       init:Messages.setUserMessages,
       update:Messages.updateUserMessages
       },*/
      /*'LabTests': {
        init:LabResults.setTestResults,
        update:LabResults.updateTestResults
      },*/
      'Diagnosis':
      {
        init:Diagnoses.setDiagnoses,
        update:Diagnoses.updateDiagnoses
      },
      'TxTeamMessages':
      {
        init:TxTeamMessages.setTxTeamMessages,
        update:TxTeamMessages.updateTxTeamMessages
      },
      /*'Questionnaires':
      {
        init:Questionnaires.setPatientQuestionnaires,
        update:Questionnaires.updatePatientQuestionnaires
      },*/
      'Announcements':
      {
        init:Announcements.setAnnouncements,
        update:Announcements.updateAnnouncements
      },
      'EducationalMaterial':
      {
        init:EducationalMaterial.setEducationalMaterial,
        update:EducationalMaterial.updateEducationalMaterial
      },
      'Notifications':
      {
        init:Notifications.setUserNotifications,
        update:Notifications.updateUserNotifications
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
    function initLocalStorage()
    {
      var objectToLocalStorage={};
      for (var key in sectionServiceMappings.length) {
        objectToLocalStorage[key]=[{}];
      }
      LocalStorage.WriteToLocalStorage('All',objectToLocalStorage);
    }
    function setServices(dataUserObject,mode)
    {
      var r = $q.defer();
      if(mode=='setOnline') initLocalStorage();
      var promises = setPromises(mode,dataUserObject);
      $q.all(promises).then(function(){
        for(var key in dataUserObject)
        {
          if(sectionServiceMappings.hasOwnProperty(key)&&promiseFields.indexOf(key)==-1)
          {
            sectionServiceMappings[key].init(dataUserObject[key]);
          }
        }
        UserPlanWorkflow.setUserPlanWorkflow();
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
    //Initiatiates all the services online at either login, or simple entering the app once
    //patient is already register
    function initServicesFromServer(type)
    {
      //Sets the path for data fetching
      var r=$q.defer();
      //Initializing all the services
      RequestToServer.sendRequestWithResponse(type).then(function(response)
      {
        setServices(response.Data, 'setOnline').then(function()
        {
          initTimestamps(response.Timestamp);
          r.resolve(true);
        });
      }).catch(function(error) {
        console.log(error);
        if(error.Code=='2')
        {
          NativeNotification.showNotificationAlert($filter('translate')("ERRORCONTACTINGHOSPITAL"));
        }
        r.reject(false);
      });
      return r.promise;
    }

    function initServicesFromLocalStorage()
    {
      var r=$q.defer();
      data=LocalStorage.ReadLocalStorage('All');

      console.log(data);
      sectionServiceMappings.All.init(data, 'setOffline').then(function()
      {
        var timestampLastUpdate = initTimestampsFromLocalStorage();
        var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
        if(app){
          if($cordovaNetwork.isOnline()){
            console.log('I am right before sending the request for all the things');
            RequestToServer.sendRequestWithResponse('Refresh',{Fields:'All',Timestamp:timestampLastUpdate}).then(
                function(response)
                {
                  updateServices(response.Data);
                  updateTimestamps('All',response.Timestamp);
                  clearTimeout(timeOut);
                  r.resolve(true);
                }).catch(function(error)
            {
              if(error.Code =='2')  NativeNotification.showNotificationAlert($filter('translate')("ERRORCONTACTINGHOSPITAL"));
              clearTimeout(timeOut);
              console.log(error);
              r.resolve(true);
            });
          }else{
            clearTimeout(timeOut);
            console.log('Offline resolving');
            r.resolve(true);
          }
        }else{
          r.resolve(true);
        }
      }).catch(function(error)
      {
        r.reject(error);
      });
      var timeOut = setTimeout(function(){
        r.resolve(true);
      },30000);

      return r.promise;
    }
    function initTimestampsFromLocalStorage()
    {
      lastUpdateTimestamp=JSON.parse(window.localStorage.getItem(UserAuthorizationInfo.getUsername()+'/Timestamps'));
      return findSmallestTimestamp('All');
    }

    function initTimestamps(time)
    {
      console.log(time);
      for(var field in lastUpdateTimestamp)
      {
        lastUpdateTimestamp[field] = time;
      }
      window.localStorage.setItem(UserAuthorizationInfo.getUsername()+'/Timestamps',JSON.stringify(lastUpdateTimestamp));
    }


    /**
     * Update sections
     */
    function updateSection(parameters)
    {
      var r = $q.defer();
      console.log(parameters);
      console.log(findSmallestTimestamp(parameters));
      RequestToServer.sendRequestWithResponse('Refresh',{Fields:parameters, Timestamp:findSmallestTimestamp(parameters)}).then(
          function(data)
          {
            console.log(data);
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
          if(error.Code =='2') NativeNotification.showNotificationAlert($filter('translate')("ERRORCONTACTINGHOSPITAL"));
        }
        console.log(error);
        r.reject(error);
      });
      return r.promise;
    }

    function updateTimestamps(content,time)
    {
      if(content=='All')
      {
        lastUpdateTimestamp.All = time;
      }else if(angular.isArray(content))
      {
        var min=Infinity;
        for (var i = 0; i < content.length; i++) {
          lastUpdateTimestamp[content[i]] = time;
        }
      }else{
        lastUpdateTimestamp[content] = time;
      }
      window.localStorage.setItem(UserAuthorizationInfo.getUsername()+'/Timestamps',JSON.stringify(lastUpdateTimestamp));
    }
    /**
     * Reset sections
     */
    function resetSection()
    {
      var r = $q.defer();
      RequestToServer.sendRequestWithResponse('Refresh',{Fields:parameters}).then(
          function(data)
          {
            if(data.Data =="Empty")
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
        console.log(error);
        if(error.Code =='2'||error.Response == 'timeout') NativeNotification.showNotificationAlert($filter('translate')("ERRORCONTACTINGHOSPITAL"));
        r.reject(error);
      });
      return r.promise;
    }
    /**
     * Helper functions
     */
    function findSmallestTimestamp(content)
    {
      console.log(content);
      if(content=='All')
      {
        return lastUpdateTimestamp.All;
      }else if(angular.isArray(content))
      {
        var min=Infinity;
        for (var i = 0; i < content.length; i++) {
          if(min>lastUpdateTimestamp[content[i]])
          {
            min=lastUpdateTimestamp[content[i]];
          }
        }
        return min;
      }else{
        return lastUpdateTimestamp[content];
      }
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
      reset:function(parameters)
      {
        return resetSection(parameters);
      },
      /**
       *@ngdoc method
       *@name init
       *@methodOf MUHCApp.service:UpdateUI
       *@param {String} type Online or Offline init
       *@description Initializes app by querying the hospital for all the data and setting the services.
       **/
      init:function(type)
      {
        var r=$q.defer();
        var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
        if(app){
          console.log(LocalStorage.isUserDataDefined());
          if(LocalStorage.isUserDataDefined())
          {
            return initServicesFromLocalStorage();
          }else{
            return initServicesFromServer(type);
          }
        }else{
          //Computer check if online
          return initServicesFromServer(type);
        }
      },
      /**
       *@ngdoc method
       *@name clearUpdateUI
       *@methodOf MUHCApp.service:UpdateUI
       *@description Clears all the timestamps.
       **/
      clearUpdateUI:function()
      {
        lastUpdateTimestamp={
          'All':0,
          'Appointments':0,
          //'Messages':0,
          'Documents':0,
          'Tasks':0,
          'Doctors':0,
          //'LabTests':0,
          'Patient':0,
          'Notifications':0,
          'EducationalMaterial':0,
          //'Questionnaires':0
        };
      }
    };

  }]);
