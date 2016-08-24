//
// Author David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
var myApp=angular.module('MUHCApp');
/**
*@ngdoc service
*@name MUHCApp.service:Notifications
*@requires $filter
*@requires MUHCApp.service:UserPreferences
*@requires MUHCApp.service:RequestToServer
*@requires MUHCApp.service:LocalStorage
*@requires MUHCApp.service:Announcements
*@requires MUHCApp.service:TxTeamMessages
*@requires MUHCApp.service:Appointments
*@requires MUHCApp.service:Messages
*@requires MUHCApp.service:Documents
*@requires MUHCApp.service:EducationalMaterial
*@description API service used to patient notifications. This Service is deeply linked to other services to extract that information about the actual content of the notification.
**/
myApp.service('Notifications',['$filter','RequestToServer','LocalStorage','Announcements','TxTeamMessages','Appointments','Messages','Documents','EducationalMaterial', 'UserPreferences', function($filter,RequestToServer,LocalStorage,Announcements, TxTeamMessages,Appointments,Messages, Documents,EducationalMaterial, UserPreferences){
    /**
  *@ngdoc property
  *@name  MUHCApp.service.#Notifications
  *@propertyOf MUHCApp.service:Notifications
  *@description Initializing array that represents all the information for Notifications, this array is passed to appropiate controllers.
  **/
    var Notifications=[];
    /**
  *@ngdoc property
  *@name  MUHCApp.service.#notificationsLocalStorage
  *@propertyOf MUHCApp.service:Notifications
  *@description Initializing array that represents all the notifications as saved in localStorage.
  **/
    var notificationsLocalStorage=[];
    /**
  *@ngdoc property
  *@name  MUHCApp.service.#notificationTypes
  *@propertyOf MUHCApp.service:Notifications
  *@description Array contains all the mappings to search the actual post for the notification, the icon, the color and the Name of the field.
  *<pre>
  //Example of the Document notification type.
  var notificationTypes={
      'Document':
      {
        icon:'fa fa-folder',
        color:'darkorange',
        NameEN:'AliasName_EN',
        NameFR:'AliasName_FR',
        SerNum:'DocumentSerNum',
        readFunction:Documents.readDocument,
        searchFunction:Documents.getDocumentBySerNum,
        namesFunction:Documents.getDocumentNames,
        PageUrl:Documents.getDocumentUrl
      }...
  </pre>
  **/
    var notificationTypes={
      'Document':
      {
        icon:'fa fa-folder',
        color:'darkorange',
        NameEN:'AliasName_EN',
        NameFR:'AliasName_FR',
        SerNum:'DocumentSerNum',
        readFunction:Documents.readDocument,
        searchFunction:Documents.getDocumentBySerNum,
        namesFunction:Documents.getDocumentNames,
        PageUrl:Documents.getDocumentUrl
      },
      'TxTeamMessage':
      {
        icon:'fa fa-user-md ',
        color:'Olive',
        NameEN:'PostName_EN',
        NameFR: 'PostName_FR',
        SerNum:'TxTeamMessageSerNum',
        searchFunction:TxTeamMessages.getTxTeamMessageBySerNum,
        namesFunction:TxTeamMessages.getTxTeamMessageName,
        readFunction:TxTeamMessages.readTxTeamMessage,
        PageUrl:TxTeamMessages.getTxTeamMessageUrl
      },
      'Announcement':{
        icon:'ion-speakerphone',
        color:'navy',
        NameEN:'PostName_EN',
        NameFR: 'PostName_FR',
        SerNum:'AnnouncementSerNum',
        readFunction:Announcements.readAnnouncementBySerNum,
        searchFunction:Announcements.getAnnouncementBySerNum,
        namesFunction:Announcements.getAnnouncementName,
        PageUrl:Announcements.getAnnouncementUrl
      },
      'EducationalMaterial':{
        icon:'fa fa-book',
        color:'purple',
        SerNum:'EducationalMaterialSerNum',
        NameEN:'Name_EN',
        NameFR:'Name_FR',
        readFunction:EducationalMaterial.readEducationalMaterial,
        searchFunction:EducationalMaterial.getEducationaMaterialBySerNum,
        namesFunction:EducationalMaterial.getEducationalMaterialName,
        openFunction:EducationalMaterial.getEducationalMaterialUrl
      },
      'NextAppointment':{
        icon:'fa fa-calendar',
        color:'DarkSlateGrey',
        SerNum:'AppointmentSerNum',
        searchFunction:Appointments.getAppointmentBySerNum,
        PageUrl:Appointments.getAppointmentUrl
      },
      'AppointmentModified':{
        icon:'fa fa-hospital-o',
        color:'DarkSlateBlue',
        NameEN:'AppointmentType_EN',
        NameFR: 'AppointmentType_FR',
        SerNum:'AppointmentSerNum',
        readFunction:Appointments.readAppointmentBySerNum,
        searchFunction:Appointments.getAppointmentBySerNum,
        namesFunction:Appointments.getAppointmentName,
        PageUrl:Appointments.getAppointmentUrl
      },
      'NewMessage':{
        SerNum:'DocumentSerNum',
        icon:'ion-chatbubbles',
        color:'DeepSkyBlue'
      },
      'NewLabResult':{
        SerNum:'DocumentSerNum',
        icon:'ion-erlenmeyer-flask',
        color:'purple'
      },
      'Other':{
        icon:'fa fa-bell',
        color:'darkred'
      }
    };


    function readNotification(index, notification)
    {
      //If index is defined it the notification at that index matches the NotificationSerNum, then we can save 
      //an array iteration look up.
      //Notification SerNum
      var serNum = notification.NotificationSerNum;
      console.log(notification);

      //ReferenceTableSerNum, as in DocumentSerNum and such.
      var refSerNum = notification.RefTableRowSerNum;
      var type = notification.NotificationType;
      console.log(Notifications[index].NotificationSerNum, serNum);
      //If the index is not defined and the notificationSerNum matches then read that notification and sync the state of all services
      if(typeof Notifications[index]!== 'undefined' && Notifications[index].NotificationSerNum == serNum)
      {
        console.log('Reading notification via index');
        Notifications[index].ReadStatus = '1';
        notificationsLocalStorage[index].ReadStatus = '1';
        notificationTypes[type].readFunction(refSerNum);
        LocalStorage.WriteToLocalStorage('Notifications', notificationsLocalStorage);
        RequestToServer.sendRequest('Read',{'Id':serNum, 'Field':'Notifications'});
      }else{
        //If it doesnt match, iterate, find notification and update read status in all the states, i.e. localStorage, server, model.
        console.log('Reading notification via serNum');
        for (var i = 0; i < Notifications.length; i++) {
          console.log(serNum, Notifications[i].NotificationSerNum );
          if(Notifications[i].NotificationSerNum == serNum )
          {
            console.log('Reading not,', Notifications[i]);
            Notifications[i].ReadStatus = '1';
            notificationsLocalStorage[i].ReadStatus = '1';
            notificationTypes[type].readFunction(refSerNum);
            console.log('Done reading', Notifications[i]);
            LocalStorage.WriteToLocalStorage('Notifications', notificationsLocalStorage);
            RequestToServer.sendRequest('Read',{'Id':serNum, 'Field':'Notifications'});
            break;
          }
        }
      }
    }
    //Used by the update function, it iterates through the notifications if it finds the notification then it deletes it.
    function searchAndDeleteNotifications(notifications)
    {
      for (var i = 0; i < notifications.length; i++) {
        for (var j = 0; j < Notifications.length; j++) {
          if(Notifications[j].NotificationSerNum == notifications[i].NotificationSerNum)
          {
            Notifications.splice(j,1);
            notificationsLocalStorage.splice(j,1);
            break;
          }
        }
      }
    }
    //Adds the notification to the notifications array and the localStorage array.
    function addUserNotifications(notifications)
    {
      if(typeof notifications==='undefined') return;
      var temp=angular.copy(notifications);
      for (var i = 0; i < notifications.length; i++) {
          temp[i].Custom =  notificationTypes[temp[i].NotificationType].Custom;
          temp[i].Icon = notificationTypes[temp[i].NotificationType].icon;
          temp[i].Color = notificationTypes[temp[i].NotificationType].color;
          if(!notificationTypes[temp[i].NotificationType].hasOwnProperty('openFunction')) temp[i].PageUrl = notificationTypes[temp[i].NotificationType].PageUrl(temp[i].RefTableRowSerNum);
          temp[i].Content = notificationTypes[temp[i].NotificationType].namesFunction(temp[i].RefTableRowSerNum);
          console.log(temp[i].Content);
          temp[i].DateAdded=$filter('formatDate')(temp[i].DateAdded);
          console.log(temp[i]);
          Notifications.push(temp[i]);
          notificationsLocalStorage.push(notifications[i]);
      }
      Notifications=$filter('orderBy')(Notifications,'DateAdded',true);
      console.log(Notifications);
      LocalStorage.WriteToLocalStorage('Notifications',notificationsLocalStorage);
    }
    return{
     /**
      *@ngdoc method
      *@name setUserNotifications
      *@methodOf MUHCApp.service:Notifications
      *@param {Object} notifications Notifications array that containts the new notifications
      *@description Setter method for Notifications
      **/
        setUserNotifications:function(notifications){
            Notifications=[];
            notificationsLocalStorage=[];
            addUserNotifications(notifications);
        },
        /**
      *@ngdoc method
      *@name updateUserNotifications
      *@methodOf MUHCApp.service:Notifications
      *@param {Object} notifications Finds notifications to update or adds new notifications if not found
      *@description Updates the notificationsArray with the new information contained in the notifications parameter
      **/
        updateUserNotifications:function(notifications)
        {
          searchAndDeleteNotifications(notifications);
          addUserNotifications(notifications);
        },
          /**
      *@ngdoc method
      *@name getUserNotifications
      *@methodOf MUHCApp.service:Notifications
      *@description Getter for the Notifications array
      *@returns {Array} Notifications array
      **/
         getUserNotifications:function(){
            return Notifications;
        },
     /**
      *@ngdoc method
      *@name readNotification
      *@methodOf MUHCApp.service:Notifications
      *@param {String} index index in the Notification array which belongs to the notification to be read.
      *@param {String} notification Notification to be read
      *@description Sets ReadStatus in the notification to 1, sends request to backend, and syncs with device storage
      **/
        readNotification:function(index, notification)
        {
          readNotification(index, notification);
        },
        //Get number of unread news
         /**
    *@ngdoc method
    *@name getNumberUnreadNotifications
    *@methodOf MUHCApp.service:Notifications
    *@description Iterates through array object and returns the number of unread notifications
    *@returns {Number} Returns number of unread news
    **/
        getNumberUnreadNotifications:function()
        {
          var number=0;
          for (var i = 0; i < Notifications.length; i++) {
            if(Notifications[i].ReadStatus == '0')
            {
              number++;
            }
          }
          return number;
        },
            /**
        *@ngdoc method
        *@name getUnreadNotifications
        *@methodOf MUHCApp.service:Notifications
        *@description Gets unread notifications
        *@returns {Array} Returns all the unread notifications
        **/
        getUnreadNotifications:function()
        {
          //Initialize array
          var array=[];
          for (var i = 0; i < Notifications.length; i++) {
            //If ReadStatus is 0, then find actual post for notification
            if(Notifications[i].ReadStatus == '0')
            {
              console.log(Notifications[i]);
              //Finding post
              var post = notificationTypes[Notifications[i].NotificationType].searchFunction(Notifications[i].RefTableRowSerNum);
              //If ReadStatus in post is also 0, Set the notification for showing in the controller
              if(post.ReadStatus == '0' )
              {
                console.log(post);
                Notifications[i].Post = post;
                Notifications[i].Number = 1;
                array.push(Notifications[i]);
              }else{
                //If the ReadStatus of the actual post is not 0, then read the notification
                readNotification(i, Notifications[i]);
              }
            }
          }
          return array;
        },
        /**
        *@ngdoc method
        *@name getNotificationPost
        *@methodOf MUHCApp.service:Notifications
        *@param {String} notification Notification that belongs to the post
        *@description Finds the post that belongs to a given notification by using the search service function for that post
        *@returns {Object} Returns object containing the post 
        **/
        getNotificationPost:function(notification)
        {
          return notificationTypes[notification.NotificationType].searchFunction(notification.RefTableRowSerNum);
        },
         /**
        *@ngdoc method
        *@name goToPost
        *@methodOf MUHCApp.service:Notifications
        *@param {String} type Notification type
        *@param {String} post Post object
        *@description Opens a post by using the opening function in each post found by {@link MUHCApp.service:Notifications#notificationTypes notificationTypes} array.
        *@returns {Object} Returns the return value of the post opening function, this function is defined in each post.
        **/
        goToPost:function(type, post)
        {
          console.log(post);
          return notificationTypes[type].openFunction(post);
        },
        /**
        *@ngdoc method
        *@name setNotificationsLanguage
        *@methodOf MUHCApp.service:Notifications
        *@param {Array} array Array with notifications
        *@description Translates the array parameter containing notifications to appropiate preferred language specified in {@link MUHCApp.service:UserPreferences UserPreferences}.
        *@returns {Array} Returns array with translated values
        **/
        setNotificationsLanguage:function(notifications)
        {
          var language = UserPreferences.getLanguage();
          for (var i = notifications.length-1; i >=0; i--) {
              console.log(notifications[i]);
              notifications[i].Title = (language=='EN') ?   notifications[i].Name_EN : notifications[i].Name_FR;
              console.log(notifications[i].RefTableRowSerNum);
              try{
                if(typeof notifications[i].Content == 'undefined') notifications[i].Content = notificationTypes[notifications[i].NotificationType].namesFunction(notifications[i].RefTableRowSerNum);
                notifications[i].Desc = (language=='EN') ?  notifications[i].Content.NameEN : notifications[i].Content.NameFR;
              }catch(e){
                notifications.splice(i,1);
                console.log(e);
              }
              

          }
          return notifications;
        },
        /**
        *@ngdoc method
        *@name clearNotifications
        *@methodOf MUHCApp.service:Notifications
        *@description Clears the service of any saved state, function used by the {@link MUHCApp.controller:LogoutController LogoutController}
        **/
        clearNotifications:function()
        {
          var Notifications=[];
          var notificationsLocalStorage=[];
        }

    };

}]);
