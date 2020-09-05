/*
 * Author David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
 * Refactored by Stacey Beard on 2020-07-14 according to the JohnPapa style guide
 */

/**
 * @ngdoc service
 * @name MUHCApp.service:Notifications
 * @requires $filter
 * @requires $q
 * @requires MUHCApp.service:Announcements
 * @requires MUHCApp.service:Appointments
 * @requires MUHCApp.service:CheckInService
 * @requires MUHCApp.service:Documents
 * @requires MUHCApp.service:EducationalMaterial
 * @requires MUHCApp.service:Questionnaires
 * @requires MUHCApp.service:RequestToServer
 * @requires MUHCApp.service:TxTeamMessages
 * @requires MUHCApp.service:UserPreferences
 * @description API service used for patient notifications. This service is deeply linked to other services to extract
 *              information about the actual content of each notification.
 **/
(function() {
    'use strict';

    angular
        .module('MUHCApp')
        .factory('Notifications', Notifications);

    Notifications.$inject = ['$filter','$q','Announcements','Appointments','CheckInService','Documents',
        'EducationalMaterial','Questionnaires','RequestToServer','TxTeamMessages','UserPreferences'];

    function Notifications($filter, $q, Announcements, Appointments, CheckInService, Documents, EducationalMaterial,
                           Questionnaires, RequestToServer, TxTeamMessages, UserPreferences) {
        /**
         * @ngdoc property
         * @name MUHCApp.service.#Notifications
         * @propertyOf MUHCApp.service:Notifications
         * @description Initializing array that represents all the information for Notifications.
         *              This array is passed to appropriate controllers.
         */
        let Notifications = [];

        let lastUpdated = new Date();

        let hasFetchedAll = false;

        /**
         * @ngdoc property
         * @name MUHCApp.service.#notificationTypes
         * @propertyOf MUHCApp.service:Notifications
         * @description Array containing all the mappings to search the actual post for the notification, the icon,
         *              the color and the name of the field.
         *
         *              Example:
         *                let notificationTypes = {
         *                  'Document':
         *                    {
         *                      icon: 'fa fa-folder',
         *                      color: 'darkorange',
         *                      NameEN: 'AliasName_EN',
         *                      NameFR: 'AliasName_FR',
         *                      SerNum: 'DocumentSerNum',
         *                      readFunction: Documents.readDocument,
         *                      searchFunction: Documents.getDocumentBySerNum,
         *                      getName: Documents.getDocumentNames,
         *                      updateFunction: Documents.updateDocuments,
         *                      PageUrl: Documents.getDocumentUrl,
         *                      refreshType: 'Documents'
         *                    } ...
         */
        let notificationTypes = {
            'Document': {
                icon: 'ion-android-document',
                color: '#90CAF9',
                NameEN: 'AliasName_EN',
                NameFR: 'AliasName_FR',
                SerNum: 'DocumentSerNum',
                readFunction: Documents.readDocument,
                searchFunction: Documents.getDocumentBySerNum,
                getName: Documents.getDocumentNames,
                updateFunction: Documents.updateDocuments,
                PageUrl: Documents.getDocumentUrl,
                refreshType: 'Documents',
            },
            'UpdDocument': {
                icon: 'ion-android-document',
                color: '#BA68C8',
                NameEN: 'AliasName_EN',
                NameFR: 'AliasName_FR',
                SerNum: 'DocumentSerNum',
                readFunction: Documents.readDocument,
                searchFunction: Documents.getDocumentBySerNum,
                getName: Documents.getDocumentNames,
                PageUrl: Documents.getDocumentUrl,
                updateFunction: Documents.updateDocuments,
                refreshType: 'Documents',
            },
            'RoomAssignment': {
                icon: 'fa fa-calendar-o',
                color: '#ffc107',
                NameEN: 'Description_EN',
                NameFR: 'Description_FR',
                SerNum: 'AppointmentSerNum',
                readFunction: Appointments.readAppointmentBySerNum,
                searchFunction: Appointments.getAppointmentBySerNum,
                getName: Appointments.getAppointmentName,
                PageUrl: Appointments.getAppointmentUrl,
            },
            'TxTeamMessage': {
                icon: 'fa fa-user-md ',
                color: '#2196F3',
                NameEN: 'PostName_EN',
                NameFR: 'PostName_FR',
                SerNum: 'TxTeamMessageSerNum',
                searchFunction: TxTeamMessages.getTxTeamMessageBySerNum,
                getName: TxTeamMessages.getTxTeamMessageName,
                readFunction: TxTeamMessages.readTxTeamMessage,
                updateFunction: TxTeamMessages.updateTxTeamMessages,
                PageUrl: TxTeamMessages.getTxTeamMessageUrl,
                refreshType: 'TxTeamMessages',
            },
            'Announcement': {
                icon: 'fa fa-bullhorn',
                color: '#FFC107',
                NameEN: 'PostName_EN',
                NameFR: 'PostName_FR',
                SerNum: 'AnnouncementSerNum',
                readFunction: Announcements.readAnnouncementBySerNum,
                searchFunction: Announcements.getAnnouncementBySerNum,
                getName: Announcements.getAnnouncementName,
                updateFunction: Announcements.updateAnnouncements,
                PageUrl: Announcements.getAnnouncementUrl,
                refreshType: 'Announcements',
            },
            'EducationalMaterial': {
                icon: 'fa fa-book',
                color: '#66BB6A',
                SerNum: 'EducationalMaterialSerNum',
                NameEN: 'Name_EN',
                NameFR: 'Name_FR',
                readFunction: EducationalMaterial.readEducationalMaterial,
                searchFunction: EducationalMaterial.getEducationaMaterialBySerNum,
                getName: EducationalMaterial.getEducationalMaterialName,
                openFunction: EducationalMaterial.getEducationalMaterialUrl,
                updateFunction: EducationalMaterial.updateEducationalMaterial,
                refreshType: 'EducationalMaterial',
            },
            'NextAppointment': {
                icon: 'fa fa-calendar',
                color: '#ffc107',
                SerNum: 'AppointmentSerNum',
                searchFunction: Appointments.getAppointmentBySerNum,
                PageUrl: Appointments.getAppointmentUrl,
                refreshType: 'Appointments',
            },
            'AppointmentTimeChange': {
                icon: 'fa fa-calendar',
                color: '#ffc107',
                NameEN: 'AppointmentType_EN',
                NameFR: 'AppointmentType_FR',
                SerNum: 'AppointmentSerNum',
                readFunction: Appointments.readAppointmentBySerNum,
                searchFunction: Appointments.getAppointmentBySerNum,
                getName: Appointments.getAppointmentName,
                PageUrl: Appointments.getAppointmentUrl,
                refreshType: 'Appointments',
            },
            'NewMessage': {
                SerNum: 'DocumentSerNum',
                icon: 'ion-chatbubbles',
                color: '#0091EA',
            },
            'NewLabResult': {
                SerNum: 'DocumentSerNum',
                icon: 'ion-erlenmeyer-flask',
                color: '#8BC34A',
            },
            'CheckInNotification': {
                SerNum: 'AppointmentSerNum',
                icon: 'fa fa-check-square-o',
                color: '#4CAF50',
                readFunction: Appointments.readAppointmentBySerNum,
                searchFunction: Appointments.getAppointmentBySerNum,
                getName: Appointments.getAppointmentName,
                PageUrl: Appointments.getAppointmentUrl,
            },
            'CheckInError': {
                SerNum: 'AppointmentSerNum',
                icon: 'fa fa-check-square-o',
                color: '#F44336',
                readFunction: Appointments.readAppointmentBySerNum,
                searchFunction: Appointments.getAppointmentBySerNum,
                getName: Appointments.getAppointmentName,
                PageUrl: Appointments.getAppointmentUrl,
            },
            'Questionnaire': {
                SerNum: 'QuestionnaireSerNum',
                icon: 'ion-clipboard',
                color: '#607d8b',
                NameEN: 'QuestionnaireName_EN',
                PageUrl: Questionnaires.getQuestionnaireStartUrl,
                searchFunction: function () {
                    return true
                },
                readFunction: function () {
                    return true
                },
            },
            'LegacyQuestionnaire': {
                SerNum: 'QuestionnaireSerNum',
                icon: 'ion-clipboard',
                color: '#607d8b',
                NameEN: 'QuestionnaireName_EN',
                PageUrl: Questionnaires.getQuestionnaireStartUrl,
                searchFunction: function () {
                    return true
                },
                readFunction: function () {
                    return true
                },
            },
            'Other': {
                icon: 'fa fa-bell',
                color: '#FFC107',
            }
        };

        let service =  {
            initNotifications: initNotifications,
            updateUserNotifications: updateUserNotifications,
            getUserNotifications: getUserNotifications,
            readNotification: readNotification,
            getNumberUnreadNotifications: getNumberUnreadNotifications,
            getUnreadNotifications: getUnreadNotifications,
            getNewNotifications: getNewNotifications,
            getNotificationPost: getNotificationPost,
            goToPost: goToPost,
            setNotificationsLanguage: setNotificationsLanguage,
            clearNotifications: clearNotifications,
            requestNewNotifications: requestNewNotifications,
            getLastUpdated: getLastUpdated,
        };

        return service;

        ////////////////////////////////////////////////////////////////////

        /******************************
         *  PRIVATE FUNCTIONS
         ******************************/

        //Used by the update function, it iterates through the notifications if it finds the notification then it deletes it.
        function searchAndDeleteNotifications(notifications) {
            for (let i = 0; i < notifications.length; i++) {
                for (let j = 0; j < Notifications.length; j++) {
                    if (Notifications[j].NotificationSerNum === notifications[i].NotificationSerNum) {
                        Notifications.splice(j, 1);
                        break;
                    }
                }
            }
        }

        //Adds the notification to the notifications array and the localStorage array.
        function addUserNotifications(notifications) {
            if (typeof notifications === 'undefined') return;
            let temp = angular.copy(notifications);
            for (let i = 0; i < notifications.length; i++) {
                if (typeof notificationTypes[temp[i].NotificationType] === 'undefined') continue;
                temp[i].Custom = notificationTypes[temp[i].NotificationType].Custom;
                temp[i].Icon = notificationTypes[temp[i].NotificationType].icon;
                temp[i].Color = notificationTypes[temp[i].NotificationType].color;


                if (!notificationTypes[temp[i].NotificationType].hasOwnProperty('openFunction')) {
                    temp[i].PageUrl = notificationTypes[temp[i].NotificationType].PageUrl(temp[i].RefTableRowSerNum);
                }

                if (notificationTypes[temp[i].NotificationType].hasOwnProperty('getName')){
                    temp[i].Content = notificationTypes[temp[i].NotificationType].getName(temp[i].RefTableRowSerNum);
                }

                temp[i].DateAdded = $filter('formatDate')(temp[i].DateAdded);

                temp[i].refreshType = notificationTypes[temp[i].NotificationType].refreshType;
                Notifications.push(temp[i]);
            }

            Notifications = $filter('orderBy')(Notifications, '-DateAdded', true);
        }

        /**
         * @ngdoc method
         * @name setUserNotifications
         * @methodOf MUHCApp.service:Notifications
         * @param {Object} notifications Notifications array that contains the new notifications
         * @description Setter method for Notifications
         **/
        function setUserNotifications(notifications) {
            Notifications = [];
            addUserNotifications(notifications);
            hasFetchedAll = true;
        }

        /******************************
         *  PUBLIC FUNCTIONS
         ******************************/

        function initNotifications(notifications) {
            lastUpdated = new Date();
            lastUpdated.setSeconds(lastUpdated.getSeconds() - 10);    // Initialize time to 10 seconds "before" now

            setUserNotifications(notifications);

            /* SetNotificationsLanguage removes all broken notifications from the list.
             * Calling it here ensures that the unread notifications badge is initialized to the right value before
             * showing the Home tab.
             * -SB */
            setNotificationsLanguage(Notifications);
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

        /**
         * @ngdoc method
         * @name getUserNotifications
         * @methodOf MUHCApp.service:Notifications
         * @description Getter for the Notifications array
         * @returns {Array} Notifications array
         **/
        function getUserNotifications() {
            return Notifications;
        }

        /**
         * @ngdoc method
         * @name readNotification
         * @methodOf MUHCApp.service:Notifications
         * @param {Number} index Index in the Notification array which belongs to the notification to be read.
         * @param {String} notification Notification to be read
         * @description Sets ReadStatus in the notification to 1, sends request to backend, and syncs with device storage
         **/
        function readNotification(index, notification) {
            //If index is defined it the notification at that index matches the NotificationSerNum, then we can save
            //an array iteration look up.
            //Notification SerNum
            let serNum = notification.NotificationSerNum;

            //ReferenceTableSerNum, as in DocumentSerNum and such.
            let refSerNum = notification.RefTableRowSerNum;
            let type = notification.NotificationType;

            //If the index is not defined and the notificationSerNum matches then read that notification and sync the state of all services
            if (typeof Notifications[index] !== 'undefined' && Notifications[index].NotificationSerNum === serNum) {
                Notifications[index].ReadStatus = '1';
                notificationTypes[type].readFunction(refSerNum);
                RequestToServer.sendRequest('Read', {'Id': serNum, 'Field': 'Notifications'});
            } else {
                //If it doesn't match, iterate, find notification and update read status in all the states, i.e. localStorage, server, model.

                for (let i = 0; i < Notifications.length; i++) {

                    if (Notifications[i].NotificationSerNum === serNum) {
                        Notifications[i].ReadStatus = '1';
                        notificationTypes[type].readFunction(refSerNum);
                        RequestToServer.sendRequest('Read', {'Id': serNum, 'Field': 'Notifications'});
                        break;
                    }
                }
            }
        }

        /**
         * @ngdoc method
         * @name getNumberUnreadNotifications
         * @methodOf MUHCApp.service:Notifications
         * @description Iterates through the Notifications array and returns the number of unread notifications.
         * @returns {Number} Returns number of unread notifications
         **/
        function getNumberUnreadNotifications() {
            let number = 0;
            for (let i = 0; i < Notifications.length; i++) {
                if (Notifications[i].ReadStatus === '0') number++;
            }
            return number;
        }

        /**
         * @ngdoc method
         * @name getUnreadNotifications
         * @methodOf MUHCApp.service:Notifications
         * @description Gets unread notifications
         * @returns {Array} Returns all the unread notifications
         **/
        function getUnreadNotifications() {
            //Initialize array
            let array = [];
            for (let i = 0; i < Notifications.length; i++) {
                //If ReadStatus is 0, then find actual post for notification
                if (Notifications[i].ReadStatus === '0') {

                    //Get content from the notification... should already exist on the app... except for questionnaires
                    let content = notificationTypes[Notifications[i].NotificationType].searchFunction(Notifications[i].RefTableRowSerNum);

                    if (content) {
                        Notifications[i].Description_EN = Notifications[i].Description_EN.replace(/\$\w+/, content.RoomLocation_EN || "");
                        Notifications[i].Description_FR = Notifications[i].Description_FR.replace(/\$\w+/, content.RoomLocation_FR || "");

                        //If ReadStatus in post is also 0, Set the notification for showing in the controller
                        if ((content.ReadStatus && content.ReadStatus === '0') || Notifications[i].NotificationType === "RoomAssignment" || Notifications[i].NotificationType === "Questionnaire" || Notifications[i].NotificationType === "LegacyQuestionnaire") {
                            Notifications[i].Post = content;
                            Notifications[i].Number = 1;
                            array.push(Notifications[i]);
                        } else {
                            //If the ReadStatus of the actual post is not 0, then read the notification
                            readNotification(i, Notifications[i]);
                        }
                    }
                }
            }

            return array;
        }

        /**
         * @ngdoc method
         * @name getNewNotifications
         * @methodOf MUHCApp.service:Notifications
         * @description Gets unread notifications
         * @returns {Array} Returns all the unread notifications
         **/
        function getNewNotifications() {
            //Initialize array
            let array = [];
            for (let i = 0; i < Notifications.length; i++) {
                //If ReadStatus is 0, then find actual post for notification
                if (Notifications[i].ReadStatus === '0') array.push(Notifications[i]);
            }
            return array;
        }

        /**
         * @ngdoc method
         * @name getNotificationPost
         * @methodOf MUHCApp.service:Notifications
         * @param {Object} notification Notification that belongs to the post
         * @description Finds the post that belongs to a given notification by using the search service function for that post
         * @returns {Object} Returns object containing the post
         **/
        function getNotificationPost(notification) {
            return notificationTypes[notification.NotificationType].searchFunction(notification.RefTableRowSerNum);
        }

        /**
         * @ngdoc method
         * @name goToPost
         * @methodOf MUHCApp.service:Notifications
         * @param {String} type Notification type
         * @param {String} post Post object
         * @description Opens a post by using the opening function in each post found by {@link MUHCApp.service:Notifications#notificationTypes notificationTypes} array.
         * @returns {Object} Returns the return value of the post opening function, this function is defined in each post.
         **/
        function goToPost(type, post) {
            return notificationTypes[type].openFunction(post);
        }

        /**
         * @ngdoc method
         * @name setNotificationsLanguage
         * @methodOf MUHCApp.service:Notifications
         * @param {Array} notifications Array with notifications
         * @description Translates the array parameter containing notifications to the appropriate preferred language
         *              specified in {@link MUHCApp.service:UserPreferences UserPreferences}.
         *
         *              Note: notifications that cannot be processed successfully are removed from the list of
         *              notifications passed as a parameter to this function.
         * @returns {Array} Returns array with translated values
         **/
        function setNotificationsLanguage(notifications) {
            let language = UserPreferences.getLanguage();
            for (let i = notifications.length - 1; i >= 0; i--) {
                notifications[i].Title = (language === 'EN') ? notifications[i].Name_EN : notifications[i].Name_FR;
                try {
                    if (typeof notifications[i].Content == 'undefined' && notificationTypes[notifications[i].NotificationType].hasOwnProperty('getName')) {
                        notifications[i].Content = notificationTypes[notifications[i].NotificationType].getName(notifications[i].RefTableRowSerNum);
                    }

                    if (notifications[i].NotificationType === 'Questionnaire' || notifications[i].NotificationType === 'LegacyQuestionnaire') {
                        notifications[i].Desc = (language === 'EN') ? notifications[i].RefTableRowTitle_EN : notifications[i].RefTableRowTitle_FR;
                    }
                    else {
                        notifications[i].Desc = (language === 'EN') ? notifications[i].Content.NameEN : notifications[i].Content.NameFR;
                    }
                } catch (e) {
                    notifications.splice(i, 1);
                }
            }
            return notifications;
        }

        /**
         * @ngdoc method
         * @name clearNotifications
         * @methodOf MUHCApp.service:Notifications
         * @description Clears the service of any saved state; function used by {@link MUHCApp.service:CleanUp CleanUp}.
         **/
        function clearNotifications() {
            Notifications = [];
            lastUpdated = new Date();
            lastUpdated.setSeconds(lastUpdated.getSeconds() - 10);    // Initialize time to 10 seconds "before" now to force requestNewNotifications to run the very first time
        }

        /**
         * @ngdoc method
         * @name requestNewNotifications
         * @methodOf MUHCApp.service:Notifications
         * @description Grabs all the notifications from the server.
         **/
        function requestNewNotifications() {
            let r = $q.defer();

            if ((lastUpdated.getTime() > Date.now() - 10000) && (!CheckInService.checkinNotificationsExist()))
                r.resolve({});
            else {
                RequestToServer.sendRequestWithResponse('NotificationsNew', {LastUpdated: lastUpdated.getTime()})
                    .then(function (response) {
                        lastUpdated = new Date();
                        if (response.Data && response.Data.length > 0) {
                            response.Data.forEach(function (notif) {

                                // If notification content exists.. update the notification content
                                if (notif[1] !== "undefined" && notif[1] !== undefined
                                    && notificationTypes[notif[0].NotificationType].hasOwnProperty('updateFunction')) {
                                    notificationTypes[notif[0].NotificationType].updateFunction([notif[1]]);
                                }

                                let notification = (!!notif[0]) ? notif[0] : notif;
                                updateUserNotifications([notification]);
                            })
                        }

                        // If have just checked in.. then update boolean saying that we have received notification
                        if (CheckInService.checkinNotificationsExist()) {
                            CheckInService.retrievedCheckinNotifications();
                        }

                        r.resolve({});
                    })
                    .catch(function (error) {
                        console.log('Error in requestNewNotifications: ', error);
                        r.reject(error);
                    });
            }
            return r.promise;
        }

        function getLastUpdated() {
            return lastUpdated;
        }
    }
})();
