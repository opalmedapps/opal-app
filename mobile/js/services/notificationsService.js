var myApp=angular.module('MUHCApp');
/**
*
*
*
*
**/
myApp.service('Notifications',['$rootScope','$filter','RequestToServer','LocalStorage','Announcements','TxTeamMessages','Appointments','Messages','Documents','EducationalMaterial', 'UserPreferences', function($rootScope,$filter,RequestToServer,LocalStorage,Announcements, TxTeamMessages,Appointments,Messages, Documents,EducationalMaterial, UserPreferences){
    var Notifications=[];
    var notificationsLocalStorage=[];
    var groupNotifications={};
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
        openFunction:EducationalMaterial.openEducationalMaterial
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
      var serNum = notification.NotificationSerNum;
      console.log(notification);
      var refSerNum = notification.RefTableRowSerNum;
      var type = notification.NotificationType;
      console.log(Notifications[index].NotificationSerNum, serNum);
      if(typeof Notifications[index]!== 'undefined' && Notifications[index].NotificationSerNum == serNum)
      {
        console.log('Reading notification via index');
        Notifications[index].ReadStatus = '1';
        notificationsLocalStorage[index].ReadStatus = '1';
        notificationTypes[type].readFunction(refSerNum);
        LocalStorage.WriteToLocalStorage('Notifications', notificationsLocalStorage);
        RequestToServer.sendRequest('Read',{'Id':serNum, 'Field':'Notifications'});
      }else{
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
          }
        }
      }
    }

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
      };
      Notifications=$filter('orderBy')(Notifications,'DateAdded',true);
      console.log(Notifications);
      LocalStorage.WriteToLocalStorage('Notifications',notificationsLocalStorage);
    }
    return{
        setUserNotifications:function(notifications){
            Notifications=[];
            notificationsLocalStorage=[];
            $rootScope.Notifications=0;
            addUserNotifications(notifications);
        },
        updateUserNotifications:function(notifications)
        {
          searchAndDeleteNotifications(notifications);
          addUserNotifications(notifications);
        },
         getUserNotifications:function(){
            return Notifications;
        },
        getLastNotification:function()
        {
          if(Notifications.length==0)
          {
            return -1;
          }else{
            return Notifications[0];
          }
        },
        readNotification:function(index, notification)
        {
          readNotification(index, notification);
        },
        /*getGroupNotifications:function()
        {
          groupNotifications={};
          var language = UserPreferences.getLanguage();
          for (var i = 0; i < Notifications.length; i++) {
            if(Notifications[i].ReadStatus == '0')
            {
              if(!groupNotifications.hasOwnProperty(Notifications[i].NotificationType))
              {
                groupNotifications[Notifications[i].NotificationType]={};
                console.log(Notifications[i]);
                var not=notificationTypes[Notifications[i].NotificationType]['searchFunction'](Notifications[i].RefTableRowSerNum);
                console.log(not);
                (language=='EN')? not.Name=not[notificationTypes[Notifications[i].NotificationType]['NameEN']]:not.Name=not[notificationTypes[Notifications[i].NotificationType]['NameFR']];
                groupNotifications[Notifications[i].NotificationType].Notifications=[not];
                groupNotifications[Notifications[i].NotificationType].Icon = notificationTypes[Notifications[i].NotificationType].icon;
                groupNotifications[Notifications[i].NotificationType].Color = notificationTypes[Notifications[i].NotificationType].color;
                groupNotifications[Notifications[i].NotificationType].PageUrl = notificationTypes[Notifications[i].NotificationType].PageUrl;
                var content = '';
                (language=='EN') ? content = Notifications[i].Name_EN : content = Notifications[i].Name_FR;
                groupNotifications[Notifications[i].NotificationType].Title = content;
                groupNotifications[Notifications[i].NotificationType].Number = 1;
              }else{
                groupNotifications[Notifications[i].NotificationType].Notifications.push(notificationTypes[Notifications[i].NotificationType]['searchFunction'](Notifications[i].RefTableRowSerNum));
                groupNotifications[Notifications[i].NotificationType].Number++;
              }
            }
          }
          return groupNotifications;
        },
      readGroupNotifications:function(notificationType)
      {
        console.log(notificationType);
        console.log('Im In there');
          for (var i = 0; i < groupNotifications[notificationType].Notifications.length; i++) {
            for (var j = 0; j < Notifications.length; j++) {
              console.log('About to change read status');
              console.log(Notifications[j]);
              console.log(Notifications[j].RefTableRowSerNum);
              console.log(groupNotifications[notificationType].Notifications[i]);
              console.log(groupNotifications[notificationType].Notifications[i][notificationTypes[notificationType].SerNum]);
                if(Notifications[j].RefTableRowSerNum == groupNotifications[notificationType].Notifications[i][notificationTypes[notificationType].SerNum])
                {
                  console.log('Changing read status');
                  //  Notifications[j].ReadStatus = '1';
                    console.log(Notifications);
                    RequestToServer.sendRequest('Read',{'Id':Notifications[j].NotificationSerNum, 'Field':'Notifications'});
                }
            }
          }
        },*/
        //Get number of unread news
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
        getUnreadNotifications:function()
        {
          var array=[];
          for (var i = 0; i < Notifications.length; i++) {
            if(Notifications[i].ReadStatus == '0')
            {
              console.log(Notifications[i]);
              var post = notificationTypes[Notifications[i].NotificationType].searchFunction(Notifications[i].RefTableRowSerNum);
              console.log(post);
              if(post.ReadStatus == '0' )
              {
                Notifications[i].Post = post;
                Notifications[i].Number = 1;
                array.push(Notifications[i]);
              }else{
                readNotification(i, Notifications[i]);
              }
            }
          }
          return array;
        },
        getNotificationPost:function(type, serNum)
        {
          return notificationTypes[type].searchFunction(serNum);
        },
        getNotificationReadStatus:function(notificationIndex){
            return Notifications[notificationIndex].ReadStatus;
        },
        getPost:function(notification)
        {
          return notificationTypes[notification.NotificationType]['searchFunction'](notification.RefTableRowSerNum);
        },
        goToPost:function(type, post)
        {
          console.log(post);
          return notificationTypes[type].openFunction(post);
        },
        setNotificationsLanguage:function(notifications)
        {
          var language = UserPreferences.getLanguage();
          for (var i = 0; i < notifications.length; i++) {
              notifications[i].Title = (language=='EN') ?   notifications[i].Name_EN : notifications[i].Name_FR;
              notifications[i].Desc = (language=='EN') ?  notifications[i].Content.NameEN : notifications[i].Content.NameFR;

          }
          return notifications;
        }

    };

}]);
