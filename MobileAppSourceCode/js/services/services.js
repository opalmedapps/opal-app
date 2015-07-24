var myApp=angular.module('app');
//Factory service made to transport the firebase link as a dependency
myApp.factory("Auth", ["$firebaseAuth",

function ($firebaseAuth) {
    var ref = new Firebase("https://luminous-heat-8715.firebaseio.com");
    return $firebaseAuth(ref);
}]);
myApp.run(function ($rootScope, $state, $stateParams,$q) {



  // Se
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
  // We can catch the error thrown when the $requireAuth promise is rejected
  // and redirect the user back to the home page
  console.log('listening');
  if (error === "AUTH_REQUIRED") {
    function redirectPage(){
            var r=$q.defer();
            $state.go('logIn');
            r.resolve;
            return r.promise;
        }

        var redirect=redirectPage();
        redirect.then(setTimeout(function(){location.reload()},100));

}
});
});
myApp.service('LocalStorage',['$rootScope',function($rootScope)
{
  return{
    set:function(thingstoset) // thingstoset is an object
    {
      for ( var key in thingstoset)
      {
        var value=thingstoset[String(key)];
        if( typeof value === "object")
        {
          value=JSON.stringify(value);
        }
        if ( value !== null && value !== undefined)
        {
          try
          {
            window.localStorage.setItem(String(key), String(value));
          } catch (e)
          {
            alert("Exceeded Storage Quota!");
          }
        } else
        {
          console.log('cant save null to localStorage');
        }
      }
    },
    get:function(key)
    {
      return window.localStorage.getItem(key);
    }
  };

}]);

myApp.service('UserNotifications',['UserDataMutable','$rootScope','LocalStorage',function(UserDataMutable,$rootScope,LocalStorage){
    this.notifications={};
    return{
        setUserNotifications:function(object){

            var keys=Object.keys(object);

            if(this.firebaseNotificationNumber===undefined){
                this.notifications=object;
                this.NotificationNumber=keys.length;
                LocalStorage.set({
                  Notifications : this.notifications ,
                  NotificationNumber : this.NotificationNumber
                });
            }else if(this.firebaseNotificationNumber!==keys.length){
                var newNot=keys.length-this.firebaseNotificationNumber;
                if(newNot>0){
                    $rootScope.Notifications=newNot;
                    $rootScope.showAlert=true;
                }
                this.notifications=object;
                this.NotificationNumber=keys.length;
                LocalStorage.set({
                  Notifications : this.notifications ,
                  NotificationNumber : this.NotificationNumber
                });
            }
            this.firebaseNotificationNumber=keys.length;
            LocalStorage.set({
              firebaseNotificationNumber : this.firebaseNotificationNumber
            });
        },
         loadUserNotifications: function () {
           this.notifications=JSON.parse(LocalStorage.get('Notifications'));
           this.NotificationNumber=LocalStorage.get('NotificationNumber');
           this.firebaseNotificationNumber= LocalStorage.get('firebaseNotificationNumber');
           this.NotificationsObjectArray=LocalStorage.get('NotificationsObjectArray');
         },
         getUserNotifications:function(){
            return this.notifications;
        },
        setNotificationReadStatus:function(notification,status){
            this.notifications[notification].ReadStatus=status;
            var updatedNotification = JSON.parse(window.localStorage['Notifications']).ReadStatus=status;
            window.localStorage['Notifications']= JSON.stringify(updatedNotification);

        },
        getNotificationUnreadStatus:function(notification){
            return this.notifications[notification].ReadStatus;
        },
        addNotification:function(notification){

        },
        deleteNotification:function(index){

        },
        getNotificationsNumber:function(){
            return this.NotificationNumber;
        },
        setNotificationsNumber:function(number){
            this.NotificationNumber=number;
        },
        getNotificationsObjectArray:function(){
            return this.NotificationsObjectArray;
        },
        setNotificationsObjectArray:function(object){
            this.NotificationsObjectArray=object;
            LocalStorage.set({ NotificationsObjectArray:this.NotificationsObjectArray});
        },
        updateNotificationsFromFirebase:function(){

        }


    };

}]);

myApp.service('UserTasksAndAppointments',['$filter','LocalStorage',function($filter,LocalStorage){

    return{

        setUserTasksAndAppointments:function(tasksAndAppointments){
            this.TasksAndAppointmentsObject=[];
            var keysArray=Object.keys(tasksAndAppointments);
            var min=Infinity;
            var index=-1;
            for (var i=0;i<keysArray.length;i++) {

               //console.log(tasksAndAppointments[keysArray[i]]);
               var date=$filter('formatDate')(tasksAndAppointments[keysArray[i]]);
               //console.log(date.getDate());
                var dateDiff=((new Date()) - date);
                if(dateDiff<0){
                    dateDiff=dateDiff*-1;
                }
                if((new Date())<date){
                    var sta='Future';
                    var tmp=min;
                    min=Math.min(min,dateDiff);
                    if(tmp!==min){
                        index=i;
                    }
               }else{
                    var sta='Past';
               }
               (this.TasksAndAppointmentsObject).push({Name:keysArray[i],Date:date,Status:sta});
            };
            this.TasksAndAppointmentsObject[index].Status='Next';
            this.CurrentTaskOrAppointmentIndex=index;
            this.TasksAndAppointmentsObject=$filter('orderBy')(this.TasksAndAppointmentsObject,'Date');
            LocalStorage.set({
              CurrentTaskOrAppointmentIndex : this.CurrentTaskOrAppointmentIndex ,
              TasksAndAppointmentsObject : this.TasksAndAppointmentsObject
            });
        },
        loadUserTasksAndAppointments: function () {
          this.CurrentTaskOrAppointmentIndex = Number(LocalStorage.get('CurrentTaskOrAppointmentIndex'));
          this.TasksAndAppointmentsObject = JSON.parse(LocalStorage.get('TasksAndAppointmentsObject')) ;
        },
        getUserTasksAndAppointments:function(){
            return this.TasksAndAppointmentsObject;
        },
        getTimeBetweenAppointments:function(timeFrame){
            //if(this.TasksAndAppointmentsObject[1].Date instanceof Date) console.log(this.TasksAndAppointmentsObject);
            this.timeDiff=[];
            for (var i = 0;i<this.TasksAndAppointmentsObject.length-1;i++) {

                if(timeFrame==='Day'){
                    var dateDiff=(this.TasksAndAppointmentsObject[i+1].Date - this.TasksAndAppointmentsObject[i].Date)/(1000*60*60*24);
                    this.timeDiff[i]={Stages: this.TasksAndAppointmentsObject[i].Name +'-'+ this.TasksAndAppointmentsObject[i+1].Name, TimeDiffInDays:dateDiff};
                }else if(timeFrame==='Hour'){
                     var dateDiff=(this.TasksAndAppointmentsObject[i+1].Date - this.TasksAndAppointmentsObject[i].Date)/(1000*60*60);
                    this.timeDiff[i]={Stages: this.TasksAndAppointmentsObject[i].Name +'-'+ this.TasksAndAppointmentsObject[i+1].Name, TimeDiffInDays:dateDiff};
                }
            };

            return this.timeDiff;

       },
       getCurrentTaskOrAppointment:function(){
        if(this.TasksAndAppointmentsObject){
            return this.TasksAndAppointmentsObject[this.CurrentTaskOrAppointmentIndex];
        }else{
            return {Name:"boom", Date:new Date()};
        }
        }
    };



}]);

//This service will have the user preferences for language and sent sms feature. To be used in account settings.
myApp.service('UserPreferences',['LocalStorage', function(LocalStorage){
    return{
        setLanguage:function(lan){
            if(lan!=='EN'||lan!=='FR'){
                return;
            }else{
                this.Language=lan;
            }

        },
        setSMS:function(smsPreference){
            if(smsPreference==='Enable'){
                this.SMS=smsPreference;
            }else if(smsPreference==='Disable'){
                this.SMS=smsPreference;
            }
        },
        getLanguage:function(){
            return this.Language;

        },
        getSMS:function(){
            return this.SMS;
        },
        setUserPreferences:function(smsPreference, lan){
            if(smsPreference==='Enable'){
                this.SMS=smsPreference;
                LocalStorage.set({ Sms : this.SMS});
            }else if(smsPreference==='Disable'){
                this.SMS=smsPreference;
                LocalStorage.set({ Sms : this.SMS});
            }
            if(lan==='EN'||lan==='FR'){
                this.Language=lan;
                LocalStorage.set({ Language : this.Language});

            }else{
              return;
            }
            //console.log(this.SMS + this.Language);
        },
        loadUserPreferences : function () {
          this.SMS=LocalStorage.get('Sms');
          this.Language= LocalStorage.get('Language');
        },
        getUserPreferences:function(){
            return {
                SMS: this.SMS,
                LAN: this.Language
            };
        }

    }



}]);



myApp.service('UpdateUI', ['UserPreferences', 'UserDataMutable', 'UserAuthorizationInfo', '$q', 'UserNotifications', 'UserTasksAndAppointments', function (UserPreferences, UserDataMutable, UserAuthorizationInfo, $q, UserNotifications, UserTasksAndAppointments) {
    return {
        loadLocally : function () {
          UserDataMutable.loadData();
          UserPreferences.loadUserPreferences();
          UserNotifications.loadUserNotifications();
          UserTasksAndAppointments.loadUserTasksAndAppointments();
          UserAuthorizationInfo.loadUserAuthData();
        },
        UpdateUserFields: function () {
            //Firebase.goOnline();
            var count=0;
            var r = $q.defer();

            var firebaseLink = new Firebase('https://luminous-heat-8715.firebaseio.com/users/' + UserAuthorizationInfo.UserName);
            obtainDataLoop();
           function obtainDataLoop(){
            firebaseLink.once('value', function (snapshot) {

                var values = snapshot.val();
                if(values.fields.FirstName===undefined){
                    count++;
                    console.log(count);
                    firebaseLink.child('fields').update({logged:'true'});
                    obtainDataLoop();
                }else{
                                    UserDataMutable.setData(values.fields.FirstName, values.fields.LastName, values.fields.picture, values.fields.TelNum, values.fields.Email, values.NextAppointment.CheckIn, values.NextAppointment.Date, values.images, values.AppointmentsAndTasks, values.Notifications);
                                    UserPreferences.setUserPreferences(values.UserPreferences.EnableSMS, values.UserPreferences.Language);
                                    UserNotifications.setUserNotifications(values.Notifications);
                                    UserTasksAndAppointments.setUserTasksAndAppointments(values.AppointmentsAndTasks);
                                    var dataValues = {
                                        FirstName: values.fields.FirstName,
                                        LastName: values.fields.LastName,
                                        Picture: values.fields.picture,
                                        Email: values.fields.Email,
                                        TelNum: values.fields.TelNum,
                                        NextAppointment: values.NextAppointment.Date,
                                        CheckIn: values.NextAppointment.CheckIn,
                                        Photos: values.images,
                                        AppointmentsAndTasks: values.AppointmentsAndTasks,
                                        EnableSMS: values.UserPreferences.EnableSMS,
                                        Language: values.UserPreferences.Language,
                                        Notifications: values.Notifications

                                    };
                                    r.resolve(dataValues);


                }

        },function(error){

            r.reject(error);

            });


    }
    return r.promise;
}
};
}]);

//This is our main object where we will define the user data and all the appropiate variables
myApp.service('UserDataMutable', ['UserPreferences','UserAuthorizationInfo','$q','LocalStorage',function (UserPreferences, UserAuthorizationInfo,$q,LocalStorage) {
    return {

        //This function obtains any field for the patient from firebase, type specifies the type of field, so update, check in, or image, or
        //simply user fields, while the field is the actual name.
        getFirebaseField:function(type,field){
            var r=$q.defer();
            if(field===undefined&&type!==undefined){
                var firebaseLink = new Firebase('https://luminous-heat-8715.firebaseio.com/users/' + UserAuthorizationInfo.UserName +'/' +type);
                firebaseLink.once('value',function(snapshot){
                    console.log(snapshot.val());
                    r.resolve(snapshot.val());

                },function(error){r.reject(error)});
                return r.promise;
            }else if(type!==undefined&&field!==undefined){
                var firebaseLink = new Firebase('https://luminous-heat-8715.firebaseio.com/users/' + UserAuthorizationInfo.UserName +'/' +type+'/'+field);
                firebaseLink.once('value',function(snapshot){
                    r.resolve(snapshot.val());
                    //return snapshot.val();
                },function(error){r.reject(error)});
                return r.promise;
            }else{
            r.reject('Not Good Enough');
            return r.promise;
            }
        },
        setFirebaseField:function(type,value,field){
        //Example: UserDataMutable.setFirebaseField('Update','LastName'); Here the field was undefined, so it will update Update:FistName, check firebase
        //for structure of database.
        //UserDataMutable.setFirebaseField('fields','FirstName','Andrew'); Here it will go into fields and update the FirstName field to Andrew.
        //Notice how only allowed values will be updated.
            if(value===undefined) return;
            if(field===undefined&&type!==undefined){
                var firebaseLink = new Firebase('https://luminous-heat-8715.firebaseio.com/users/' + UserAuthorizationInfo.UserName);
                if(type==='Update') firebaseLink.update({'Update':value});
                if(type==='NextAppointment') firebaseLink.update({'NextAppointment':value});
                if(type==='CheckIn') {

                    //firebaseLink.update({'CheckIn':value});
                    var firebaseLink2 = new Firebase('https://luminous-heat-8715.firebaseio.com/PatientActivity/' + UserAuthorizationInfo.UserName);
                    var toFirebase={CheckIn:true};
                    firebaseLink2.update(toFirebase);
                }

            }else if(type!==undefined&&field!==undefined){
                var firebaseLink = new Firebase('https://luminous-heat-8715.firebaseio.com/users/' + UserAuthorizationInfo.UserName +'/' +type);
                if(field==='FirstName') firebaseLink.update({'FirstName':value});
                if(field==='LastName') firebaseLink.update({'LastName':value});
                if(field==='Email') firebaseLink.update({'Email':value});
                if(field==='TelNum') firebaseLink.update({'TelNum':value});
                if(field==='picture') firebaseLink.update({'picture':value});
                if(field==='Date') firebaseLink.update({'Date':value});
                if(field==='NextAppointment') firebaseLink.update({'NextAppointment':value});

            }
        },
        getAppointmentsAndTasks:function(){
            return this.AppointmentsAndTasks;
        },
        getUserNotifications:function(){
            return this.UserNotifications;
        },
        getPhotos:function(){
            return this.Photos;
        },
        getData: function () {
            return this.Data;
        },
        getCheckInField:function(){
            return this.CheckIn;
        },
        getNextAppointment:function(){
            return this.NextAppointment;
        },
        getFirstName: function () {
            return this.FirstName;
        },
        getLastName: function () {
            return this.LastName;
        },
        getEmail: function () {

            return this.Email;
        },
        getPictures: function () {
            return this.Pictures;
        },
        getTelNum: function () {
            return this.TelNum;
        },
        setData: function (firstName, lastName, pictures, telNum, email,checkin,nextappointment,images,appointmentsAndtasks,usernotifications) {
            var r=$q.defer();
            this.FirstName = firstName;
            this.LastName = lastName;
            this.Pictures = pictures;
            this.Photos=images;
            this.TelNum = telNum;
            this.Email = email;
            this.CheckIn = checkin;
            this.NextAppointment=nextappointment;
            this.AppointmentsAndTasks=appointmentsAndtasks;
            this.UserNotifications=usernotifications;
            LocalStorage.set(
              {
                FirstName : firstName ,
                LastName : lastName,
                Pictures : pictures,
                Photos : images,
                TelNum : telNum,
                Email : email ,
                CheckIn : checkin,
                NextAppointment : nextappointment,
                appointmentsAndtasks : appointmentsAndtasks,
                UserNotifications : usernotifications
              });
            r.resolve;
            return r.promise;
        },
        loadData : function ()
        {
          this.FirstName = LocalStorage.get('FirstName');
          this.LastName = LocalStorage.get('LastName');
          this.Pictures = LocalStorage.get('Pictures');
          this.Photos=JSON.parse(LocalStorage.get('Photos'));
          this.TelNum = LocalStorage.get('TelNum');
          this.Email = LocalStorage.get('Email');
          this.CheckIn = LocalStorage.get('CheckIn');
          this.NextAppointment = LocalStorage.get('Nextappointment');
          this.AppointmentsAndTasks = JSON.parse(LocalStorage.get('AppointmentsAndtasks'));
          this.UserNotifications = JSON.parse(LocalStorage.get('UserNotifications'));
        },
        setPhotos:function(photos){
            this.Photos=photos;
        },
         setCheckInField:function(checkin){
            this.CheckIn=checkin;
        },
        setNextAppointment:function(nextappointment){
            this.NextAppointment=nextappointment;
        },
        setFirstName: function (firstName) {
            this.FirstName = firstName;
        },
        setLastName: function (lastName) {
            this.LastName = lastName;
        },
        setEmail: function (email) {
            this.Email = email;
        },
        setPictures: function (pictures) {
            this.Pictures = pictures;
        },
        setTelNum: function (telNum) {
            this.TelNum = telNum;
        },
        setAppointmentsAndTasks:function(object){
            this.AppointmentsAndTasks=object;
        },
        setUserNotifications:function(object){
            this.UserNotifications=object;
        }

    };
}]);
//Defines the authorization parameters for the user serssion
myApp.service('UserAuthorizationInfo',['$q','$state','LocalStorage', function ($q,$state,LocalStorage) {


    return {
      setUserAuthData: function (username, token, authorize)
      {
          this.UserName = username;
          this.UserToken = token;
          this.authorization = authorize;
          LocalStorage.set(
            {
            UserName : username,
            UserToken : token,
            Authorization: authorize
            });
      },
      loadUserAuthData: function ()
      {
          this.UserName = LocalStorage.get('UserName');
          this.UserToken = LocalStorage.get('UserToken');
          this.authorization = LocalStorage.get('Authorization');
      },
        getUserAuthData: function () {
            return {
                UserName: this.UserName,
                Token: this.UserToken,
                AuthorizationData: this.authorization


            };
        },
        authorizeUser:function(){
            var q=$q.defer()
            if(this.authorization===undefined){
                q.reject('boom');
            }else{
                q.resolve('goHome');
            }
            return q.promise;
        }

}

}]);
