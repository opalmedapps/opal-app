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
 * @requires MUHCApp.service:PatientTestResults
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

    Notifications.$inject = ['$filter','$injector','$q','Announcements','Appointments','CheckInService','Documents',
        'EducationalMaterial', 'PatientTestResults', 'Questionnaires', 'RequestToServer','TxTeamMessages','UserPreferences', 'Params'];

    function Notifications($filter, $injector, $q, Announcements, Appointments, CheckInService, Documents,
                           EducationalMaterial, PatientTestResults, Questionnaires, RequestToServer, TxTeamMessages, UserPreferences, Params) {
        /**
         * @ngdoc property
         * @name MUHCApp.service.#Notifications
         * @propertyOf MUHCApp.service:Notifications
         * @description Initializing array that represents all the information for Notifications.
         *              This array is passed to appropriate controllers.
         */
        let Notifications = [];

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
         *                      readFunction: Documents.readDocument,
         *                      searchFunction: Documents.getDocumentBySerNum,
         *                      PageUrl: Documents.getDocumentUrl,
         *                      refreshType: 'Documents'
         *                    } ...
         */
        let notificationTypes = {
            [Params.NOTIFICATION_TYPES.Document]: {
                icon: 'ion-android-document',
                color: '#90CAF9',
                readFunction: Documents.readDocument,
                searchFunction: Documents.getDocumentBySerNum,
                PageUrl: Documents.getDocumentUrl,
                refreshType: 'Documents',
            },
            [Params.NOTIFICATION_TYPES.UpdDocument]: {
                icon: 'ion-android-document',
                color: '#BA68C8',
                readFunction: Documents.readDocument,
                searchFunction: Documents.getDocumentBySerNum,
                PageUrl: Documents.getDocumentUrl,
                refreshType: 'Documents',
            },
            [Params.NOTIFICATION_TYPES.RoomAssignment]: {
                icon: 'fa fa-calendar-o',
                color: '#ffc107',
                readFunction: Appointments.readAppointmentBySerNum,
                searchFunction: Appointments.getAppointmentBySerNum,
                PageUrl: Appointments.getAppointmentUrl,
                refreshType: 'Appointments',
            },
            [Params.NOTIFICATION_TYPES.TxTeamMessage]: {
                icon: 'fa fa-user-md ',
                color: '#2196F3',
                readFunction: TxTeamMessages.readTxTeamMessage,
                searchFunction: TxTeamMessages.getTxTeamMessageBySerNum,
                PageUrl: TxTeamMessages.getTxTeamMessageUrl,
                refreshType: 'TxTeamMessages',
            },
            [Params.NOTIFICATION_TYPES.Announcement]: {
                icon: 'fa fa-bullhorn',
                color: '#FFC107',
                readFunction: Announcements.readAnnouncementBySerNum,
                searchFunction: Announcements.getAnnouncementBySerNum,
                PageUrl: Announcements.getAnnouncementUrl,
                refreshType: 'Announcements',
            },
            [Params.NOTIFICATION_TYPES.EducationalMaterial]: {
                icon: 'fa fa-book',
                color: '#9575CD',
                readFunction: EducationalMaterial.readEducationalMaterial,
                searchFunction: EducationalMaterial.getEducationaMaterialBySerNum,
                PageUrl: EducationalMaterial.getEducationalMaterialUrl,
                refreshType: 'EducationalMaterial',
            },
            [Params.NOTIFICATION_TYPES.NextAppointment]: {
                icon: 'fa fa-calendar',
                color: '#ffc107',
                readFunction: Appointments.readAppointmentBySerNum,
                searchFunction: Appointments.getAppointmentBySerNum,
                PageUrl: Appointments.getAppointmentUrl,
                refreshType: 'Appointments',
            },
            [Params.NOTIFICATION_TYPES.AppointmentTimeChange]: {
                icon: 'fa fa-calendar',
                color: '#ffc107',
                readFunction: Appointments.readAppointmentBySerNum,
                searchFunction: Appointments.getAppointmentBySerNum,
                PageUrl: Appointments.getAppointmentUrl,
                refreshType: 'Appointments',
            },
            [Params.NOTIFICATION_TYPES.CheckInNotification]: {
                icon: 'fa fa-check-square-o',
                color: '#4CAF50',
                readFunction: Appointments.readAppointmentBySerNum,
                searchFunction: Appointments.getAppointmentBySerNum,
                PageUrl: Appointments.getAppointmentUrl,
                refreshType: 'Appointments',
            },
            [Params.NOTIFICATION_TYPES.CheckInError]: {
                icon: 'fa fa-check-square-o',
                color: '#F44336',
                readFunction: Appointments.readAppointmentBySerNum,
                searchFunction: Appointments.getAppointmentBySerNum,
                PageUrl: Appointments.getAppointmentUrl,
                refreshType: 'Appointments',
            },
            // Special case: uses a dedicated download page in 'PageUrl' (questionnaireNotifRedirect.html) instead of 'refreshType'
            [Params.NOTIFICATION_TYPES.Questionnaire]: {
                icon: 'ion-clipboard',
                color: '#607d8b',
                PageUrl: Questionnaires.getQuestionnaireStartUrl,
                searchFunction: (refTableRowSerNum => refTableRowSerNum),
                readFunction: function () {
                    return true;
                },
            },
            // Special case: uses a dedicated download page in 'PageUrl' (questionnaireNotifRedirect.html) instead of 'refreshType'
            [Params.NOTIFICATION_TYPES.LegacyQuestionnaire]: {
                icon: 'ion-clipboard',
                color: '#607d8b',
                PageUrl: Questionnaires.getQuestionnaireStartUrl,
                searchFunction: (refTableRowSerNum => refTableRowSerNum),
                readFunction: function () {
                    return true;
                },
            },
            [Params.NOTIFICATION_TYPES.AppointmentNew]: {
                icon: 'fa fa-calendar-plus-o',
                color: '#5FAB61',
                readFunction: Appointments.readAppointmentBySerNum,
                searchFunction: Appointments.getAppointmentBySerNum,
                PageUrl: Appointments.getAppointmentUrl,
                refreshType: 'Appointments',
            },
            [Params.NOTIFICATION_TYPES.AppointmentCancelled]: {
                icon: 'fa fa-calendar-times-o',
                color: '#ff0787',
                readFunction: Appointments.readAppointmentBySerNum,
                searchFunction: Appointments.getAppointmentBySerNum,
                PageUrl: Appointments.getAppointmentUrl,
                refreshType: 'Appointments',
            },
            // Special case: opens the general lab results page, not a specific lab
            [Params.NOTIFICATION_TYPES.NewLabResult]: {
                icon: 'fa fa-flask ',
                color: '#8BC34A',
                PageUrl: PatientTestResults.getTestResultsUrl,
                refreshType: ['PatientTestDates', 'PatientTestTypes'],
                searchFunction: (refTableRowSerNum => refTableRowSerNum),
                readFunction: function () {
                    return true;
                },
            },
        };

        let service =  {
            initNotifications: initNotifications,
            updateUserNotifications: updateUserNotifications,
            getUserNotifications: getUserNotifications,
            readNotification: readNotification,
            getNumberUnreadNotifications: getNumberUnreadNotifications,
            getNotificationPost: getNotificationPost,
            downloadNotificationTarget: downloadNotificationTarget,
            setNotificationsLanguage: setNotificationsLanguage,
            clearNotifications: clearNotifications,
            markAllRead: markAllRead,
            implicitlyMarkCachedNotificationAsRead: implicitlyMarkCachedNotificationAsRead,
        };

        return service;

        ////////////////////////////////////////////////////////////////////

        /******************************
         *  PRIVATE FUNCTIONS
         ******************************/

        // Used by the update function, it iterates through the notifications if it finds the notification then it deletes it.
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

        // Adds the notification to the notifications array and the localStorage array.
        function addUserNotifications(notifications) {
            if (typeof notifications === 'undefined') return;
            let temp = angular.copy(notifications);
            for (let i = 0; i < notifications.length; i++) {
                if (typeof notificationTypes[temp[i].NotificationType] === 'undefined') {
                    console.warn(`Notification with unsupported type ${temp[i].NotificationType}:`, temp[i]);
                    continue;
                } 

                temp[i].Icon = notificationTypes[temp[i].NotificationType].icon;
                temp[i].Color = notificationTypes[temp[i].NotificationType].color;
                temp[i].PageUrl = notificationTypes[temp[i].NotificationType].PageUrl(temp[i].RefTableRowSerNum);
                temp[i].refreshType = notificationTypes[temp[i].NotificationType].refreshType;

                temp[i].DateAdded = $filter('formatDate')(temp[i].DateAdded);

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
        }

        /******************************
         *  PUBLIC FUNCTIONS
         ******************************/

        function initNotifications(notifications) {
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
         * @description Marks all unread notifications as read.
         */
        function markAllRead() {
            Notifications.forEach((notification, index) => {
                if (notification.ReadStatus === "0") readNotification(index, notification);
            });
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
         * @desc Downloads and returns the target item referenced by a notification (e.g. "You have a new document" -> the document).
         * @param notification The notification referencing a target item.
         * @returns {Promise<*>} Resolves with the target item once downloaded.
         */
        async function downloadNotificationTarget(notification) {
            let UpdateUI = $injector.get('UpdateUI');
            await UpdateUI.getSingleItem(notification.refreshType, notification.RefTableRowSerNum);

            // Look up the item to make sure it was correctly saved in a data service
            let savedItem = getNotificationPost(notification)
            if (!savedItem) throw new Error(`Failed to download or save notification target for '${notification.NotificationType}' with SerNum ${notification.RefTableRowSerNum}`);
            return savedItem;
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
                try {
                    notifications[i].Title = notifications[i][`Name_${language}`];
                    notifications[i].RefTableRowTitle = notifications[i][`RefTableRowTitle_${language}`];
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
        }

        /**
         * @ngdoc method 
         * @name implicitlyMarkCachedNotificationAsRead
         * @methodOf MUHCApp.service:Notifications
         * @desc Implicitly mark cached notifications as read.
         *       E.g., cached notification linked to a new/updated/canceled appointment.
         * @param {string} serNum Serial number of a category item for which a corresponding notifications is being updated.
         * @param {Array} notificationTypes Notification types that are associated with the category item.
         *        E.g., Document record is associated with "Document" and "UpdDocument" notification types.
         */
        function implicitlyMarkCachedNotificationAsRead(serNum, notificationTypes) {
            if (Array.isArray(Notifications) && Notifications.length)
            {
                Notifications.forEach(
                    (notif) => {
                        if (
                            notif.RefTableRowSerNum === serNum
                            && notificationTypes.includes(notif.NotificationType)
                        )
                            // Do not invoke readFunction if notification is implicitly read
                            // since it's already invoked in the corresponding category item.
                            notif.ReadStatus = '1';
                    });
            }
        }
    }
})();
