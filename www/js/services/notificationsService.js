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
myApp.service('Notifications',['$filter','RequestToServer','LocalStorage','Announcements','TxTeamMessages','Appointments','Documents','EducationalMaterial', 'UserPreferences', '$q', 'Questionnaires', 'CheckInService',
    function($filter,RequestToServer,LocalStorage,Announcements, TxTeamMessages,Appointments, Documents,EducationalMaterial, UserPreferences, $q, Questionnaires, CheckInService){
        /**
         *@ngdoc property
         *@name  MUHCApp.service.#Notifications
         *@propertyOf MUHCApp.service:Notifications
         *@description Initializing array that represents all the information for Notifications, this array is passed to appropiate controllers.
         */
        var Notifications=[];

        var lastUpdated = 0;

        var hasFetchedAll = false;


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
        */
        var notificationTypes={
            'Document':
                {
                    icon:'ion-android-document',
                    color:'#90CAF9',
                    NameEN:'AliasName_EN',
                    NameFR:'AliasName_FR',
                    SerNum:'DocumentSerNum',
                    readFunction:Documents.readDocument,
                    searchFunction:Documents.getDocumentBySerNum,
                    namesFunction:Documents.getDocumentNames,
                    updateFunction: Documents.updateDocuments,
                    PageUrl:Documents.getDocumentUrl,
                    refreshType: 'Documents'
                },
            'UpdDocument':
                {
                    icon:'ion-android-document',
                    color:'#BA68C8',
                    NameEN:'AliasName_EN',
                    NameFR:'AliasName_FR',
                    SerNum:'DocumentSerNum',
                    readFunction:Documents.readDocument,
                    searchFunction:Documents.getDocumentBySerNum,
                    namesFunction:Documents.getDocumentNames,
                    PageUrl:Documents.getDocumentUrl,
                    updateFunction: Documents.updateDocuments,
                    refreshType: 'Documents'
                },
            'RoomAssignment':
                {
                    icon:'fa fa-calendar-o',
                    color:'#ffc107',
                    NameEN:'Description_EN',
                    NameFR: 'Description_FR',
                    SerNum:'AppointmentSerNum',
                    readFunction:Appointments.readAppointmentBySerNum,
                    searchFunction:Appointments.getAppointmentBySerNum,
                    namesFunction:Appointments.getAppointmentName,
                    PageUrl:Appointments.getAppointmentUrl
                },
            'TxTeamMessage':
                {
                    icon:'fa fa-user-md ',
                    color:'#2196F3',
                    NameEN:'PostName_EN',
                    NameFR: 'PostName_FR',
                    SerNum:'TxTeamMessageSerNum',
                    searchFunction:TxTeamMessages.getTxTeamMessageBySerNum,
                    namesFunction:TxTeamMessages.getTxTeamMessageName,
                    readFunction:TxTeamMessages.readTxTeamMessage,
                    updateFunction: TxTeamMessages.updateTxTeamMessages,
                    PageUrl:TxTeamMessages.getTxTeamMessageUrl,
                    refreshType: 'TxTeamMessages'
                },
            'Announcement':{
                icon:'fa fa-bullhorn',
                color:'#FFC107',
                NameEN:'PostName_EN',
                NameFR: 'PostName_FR',
                SerNum:'AnnouncementSerNum',
                readFunction:Announcements.readAnnouncementBySerNum,
                searchFunction:Announcements.getAnnouncementBySerNum,
                namesFunction:Announcements.getAnnouncementName,
                updateFunction: Announcements.updateAnnouncements,
                PageUrl:Announcements.getAnnouncementUrl,
                refreshType :'Announcements'
            },
            'EducationalMaterial':{
                icon:'fa fa-book',
                color:'#66BB6A',
                SerNum:'EducationalMaterialSerNum',
                NameEN:'Name_EN',
                NameFR:'Name_FR',
                readFunction:EducationalMaterial.readEducationalMaterial,
                searchFunction:EducationalMaterial.getEducationaMaterialBySerNum,
                namesFunction:EducationalMaterial.getEducationalMaterialName,
                openFunction:EducationalMaterial.getEducationalMaterialUrl,
                updateFunction: EducationalMaterial.updateEducationalMaterial,
                refreshType: 'EducationalMaterial'
            },
            'NextAppointment':{
                icon:'fa fa-calendar',
                color:'#ffc107',
                SerNum:'AppointmentSerNum',
                searchFunction:Appointments.getAppointmentBySerNum,
                PageUrl:Appointments.getAppointmentUrl,
                refreshType: 'Appointments'
            },
            'AppointmentModified':{
                icon:'fa fa-calendar',
                color:'#ffc107',
                NameEN:'AppointmentType_EN',
                NameFR: 'AppointmentType_FR',
                SerNum:'AppointmentSerNum',
                readFunction:Appointments.readAppointmentBySerNum,
                searchFunction:Appointments.getAppointmentBySerNum,
                namesFunction:Appointments.getAppointmentName,
                PageUrl:Appointments.getAppointmentUrl,
                refreshType: 'Appointments'
            },
            'NewMessage':{
                SerNum:'DocumentSerNum',
                icon:'ion-chatbubbles',
                color:'#0091EA'
            },
            'NewLabResult':{
                SerNum:'DocumentSerNum',
                icon:'ion-erlenmeyer-flask',
                color:'#8BC34A'
            },
            'CheckInNotification':{
                SerNum:'AppointmentSerNum',
                icon:'fa fa-check-square-o',
                color:'#4CAF50',
                readFunction:Appointments.readAppointmentBySerNum,
                searchFunction:Appointments.getAppointmentBySerNum,
                namesFunction:Appointments.getAppointmentName,
                PageUrl:Appointments.getAppointmentUrl,
            },
            'CheckInError':{
                SerNum:'AppointmentSerNum',
                icon:'fa fa-check-square-o',
                color:'#F44336',
                readFunction:Appointments.readAppointmentBySerNum,
                searchFunction:Appointments.getAppointmentBySerNum,
                namesFunction:Appointments.getAppointmentName,
                PageUrl:Appointments.getAppointmentUrl,
            },
            'Questionnaire':{
                SerNum:'QuestionnaireSerNum',
                icon:'fa fa-question-circle',
                color:'#607d8b',
                updateFunction: Questionnaires.updateQuestionnairesFromNotification,
                namesFunction: Questionnaires.getQuestionnaireName,
                PageUrl:Questionnaires.getQuestionnaireUrl,
                searchFunction: function() { return true },
                readFunction: function() { return true },
            },
            'LegacyQuestionnaire':{
                SerNum:'QuestionnaireSerNum',
                icon:'fa fa-question-circle',
                color:'#607d8b',
                updateFunction: Questionnaires.updateQuestionnairesFromNotification,
                namesFunction: Questionnaires.getQuestionnaireName,
                PageUrl:Questionnaires.getQuestionnaireUrl,
                searchFunction: function() { return true },
                readFunction: function() { return true },
            },
            'Other':{
                icon:'fa fa-bell',
                color:'#FFC107'
            }
        };

        function readNotification(index, notification) {
            //If index is defined it the notification at that index matches the NotificationSerNum, then we can save
            //an array iteration look up.
            //Notification SerNum
            var serNum = notification.NotificationSerNum;

            //ReferenceTableSerNum, as in DocumentSerNum and such.
            var refSerNum = notification.RefTableRowSerNum;
            var type = notification.NotificationType;

            //If the index is not defined and the notificationSerNum matches then read that notification and sync the state of all services
            if(typeof Notifications[index]!== 'undefined' && Notifications[index].NotificationSerNum == serNum) {
                Notifications[index].ReadStatus = '1';
                notificationTypes[type].readFunction(refSerNum);
                RequestToServer.sendRequest('Read',{'Id':serNum, 'Field':'Notifications'});
            }else{
                //If it doesnt match, iterate, find notification and update read status in all the states, i.e. localStorage, server, model.

                for (var i = 0; i < Notifications.length; i++) {

                    if(Notifications[i].NotificationSerNum == serNum ) {
                        Notifications[i].ReadStatus = '1';
                        notificationTypes[type].readFunction(refSerNum);
                        RequestToServer.sendRequest('Read',{'Id':serNum, 'Field':'Notifications'});
                        break;
                    }
                }
            }
        }

        //Used by the update function, it iterates through the notifications if it finds the notification then it deletes it.
        function searchAndDeleteNotifications(notifications) {
            for (var i = 0; i < notifications.length; i++) {
                for (var j = 0; j < Notifications.length; j++) {
                    if(Notifications[j].NotificationSerNum === notifications[i].NotificationSerNum) {
                        Notifications.splice(j,1);
                        break;
                    }
                }
            }
        }

        //Adds the notification to the notifications array and the localStorage array.
        function addUserNotifications(notifications) {
            if(typeof notifications==='undefined') return;
            var temp=angular.copy(notifications);
            for (var i = 0; i < notifications.length; i++) {
                if(typeof notificationTypes[temp[i].NotificationType] ==='undefined') break;
                temp[i].Custom =  notificationTypes[temp[i].NotificationType].Custom;
                temp[i].Icon = notificationTypes[temp[i].NotificationType].icon;
                temp[i].Color = notificationTypes[temp[i].NotificationType].color;


                if(!notificationTypes[temp[i].NotificationType].hasOwnProperty('openFunction')){
                    temp[i].PageUrl = notificationTypes[temp[i].NotificationType].PageUrl(temp[i].RefTableRowSerNum);
                }

                temp[i].Content = notificationTypes[temp[i].NotificationType].namesFunction(temp[i].RefTableRowSerNum);
                temp[i].DateAdded=$filter('formatDate')(temp[i].DateAdded);

                temp[i].refreshType = notificationTypes[temp[i].NotificationType].refreshType;
                Notifications.push(temp[i]);
            }

            Notifications=$filter('orderBy')(Notifications,'-DateAdded',true);
        }


        /**
         *@ngdoc method
         *@name setUserNotifications
         *@methodOf MUHCApp.service:Notifications
         *@param {Object} notifications Notifications array that containts the new notifications
         *@description Setter method for Notifications
         **/
        function setUserNotifications(notifications){

            console.log(notifications);

            Notifications=[];
            addUserNotifications(notifications);
            hasFetchedAll = true;
        }

        /**
         *@ngdoc method
         *@name updateUserNotifications
         *@methodOf MUHCApp.service:Notifications
         *@param {Object} notifications Finds notifications to update or adds new notifications if not found
         *@description Updates the notificationsArray with the new information contained in the notifications parameter
         **/
        function updateUserNotifications(notifications) {
            searchAndDeleteNotifications(notifications);
            addUserNotifications(notifications);
        }

        return{

            initNotifications:function(notifications){
                lastUpdated = new Date();
                setUserNotifications(notifications);
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
            readNotification:function(index, notification) {
                readNotification(index, notification);
            },


            /**
             *@ngdoc method
             *@name getNumberUnreadNotifications
             *@methodOf MUHCApp.service:Notifications
             *@description Iterates through array object and returns the number of unread notifications
             *@returns {Number} Returns number of unread news
             **/
            getNumberUnreadNotifications:function() {
                var number=0;
                for (var i = 0; i < Notifications.length; i++) {
                    if(Notifications[i].ReadStatus === '0') number++;
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
                    if(Notifications[i].ReadStatus === '0') {

                        //Get content from the notification... should already exist on the app... except for questionnaires
                        var content = notificationTypes[Notifications[i].NotificationType].searchFunction(Notifications[i].RefTableRowSerNum);

                        if(content){
                            Notifications[i].Description_EN = Notifications[i].Description_EN.replace(/\$\w+/, content.RoomLocation_EN||"");
                            Notifications[i].Description_FR = Notifications[i].Description_FR.replace(/\$\w+/, content.RoomLocation_FR||"");

                            //If ReadStatus in post is also 0, Set the notification for showing in the controller
                            if((content.ReadStatus && content.ReadStatus === '0') || Notifications[i].NotificationType === "RoomAssignment" || Notifications[i].NotificationType === "Questionnaire" || Notifications[i].NotificationType === "LegacyQuestionnaire") {
                                Notifications[i].Post = content;
                                Notifications[i].Number = 1;
                                array.push(Notifications[i]);
                            }else{
                                //If the ReadStatus of the actual post is not 0, then read the notification
                                readNotification(i, Notifications[i]);
                            }
                        }
                    }
                }

                return array;
            },
            /**
             *@ngdoc method
             *@name getNewNotifications
             *@methodOf MUHCApp.service:Notifications
             *@description Gets unread notifications
             *@returns {Array} Returns all the unread notifications
             **/
            getNewNotifications:function() {
                //Initialize array
                var array=[];
                for (var i = 0; i < Notifications.length; i++) {
                    //If ReadStatus is 0, then find actual post for notification
                    if(Notifications[i].ReadStatus == '0') array.push(Notifications[i]);
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
            getNotificationPost:function(notification) {
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
            goToPost:function(type, post) {
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
                    notifications[i].Title = (language=='EN') ?   notifications[i].Name_EN : notifications[i].Name_FR;
                    try{
                        if(typeof notifications[i].Content == 'undefined') notifications[i].Content = notificationTypes[notifications[i].NotificationType].namesFunction(notifications[i].RefTableRowSerNum);
                        notifications[i].Desc = (language=='EN') ?  notifications[i].Content.NameEN : notifications[i].Content.NameFR;
                    }catch(e){
                        notifications.splice(i,1);
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
            clearNotifications:function() {
                Notifications=[];
                lastUpdated = 0;
            },

            /**
             *@ngdoc method
             *@name requestNewNotifications
             *@methodOf MUHCApp.service:Notifications
             *@description Grabs all the notifications form the server.
             **/
            requestNewNotifications: function () {
                var r = $q.defer();

                if (lastUpdated > Date.now() - 10000 && !CheckInService.checkinNotificationsExist()) r.resolve({});
                else{
                    RequestToServer.sendRequestWithResponse('NotificationsNew', {LastUpdated: lastUpdated.getTime()})
                        .then(function (response) {
                            lastUpdated = new Date();
                            if (response.Data && response.Data.length > 0) {
                                response.Data.forEach(function(notif){

                                    // If notification content exists.. update the notification content
                                    if(notif[1]) notificationTypes[notif[0].NotificationType].updateFunction([notif[1]]);
                                    var notification = (!!notif[0]) ? notif[0] : notif;
                                    updateUserNotifications([notification]);
                                })
                            }

                            // If have just checked in.. then update boolean saying that we have received notification
                            if (CheckInService.checkinNotificationsExist()) {
                                CheckInService.retrievedCheckinNotifications();
                            }

                            r.resolve({});
                        })
                        .catch(function (err) {
                            console.log(err);
                            r.reject(err)
                        });
                }
                return r.promise;
            },

            getLastUpdated: function () {
                return lastUpdated;
            }
        };

    }]);
