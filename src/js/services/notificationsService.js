// SPDX-FileCopyrightText: Copyright (C) 2015 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/*
 * Author David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
 * Refactored by Stacey Beard on 2020-07-14 according to the JohnPapa style guide
 */

/**
 * @ngdoc service
 * @requires $filter
 * @requires $q
 * @description API service used for patient notifications. This service is deeply linked to other services to extract
 *              information about the actual content of each notification.
 **/
(function() {
    'use strict';

    angular
        .module('OpalApp')
        .factory('Notifications', Notifications);

    Notifications.$inject = ['$filter','$injector','$q','Announcements','Appointments','CheckInService','Documents',
        'EducationalMaterial', 'PatientTestResults', 'Questionnaires', 'RequestToServer','TxTeamMessages','UserPreferences', 'Params'];

    function Notifications($filter, $injector, $q, Announcements, Appointments, CheckInService, Documents,
                           EducationalMaterial, PatientTestResults, Questionnaires, RequestToServer, TxTeamMessages, UserPreferences, Params) {
        /**
         * @ngdoc property
         * @description Initializing array that represents all the information for Notifications.
         *              This array is passed to appropriate controllers.
         */
        let Notifications = [];

        /**
         * @ngdoc property
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
                icon: 'fa-solid fa-file-circle-plus',
                color: '#90CAF9',
                readFunction: Documents.readDocument,
                searchFunction: Documents.getDocumentBySerNum,
                PageUrl: Documents.getDocumentUrl,
                refreshType: 'Documents',
            },
            [Params.NOTIFICATION_TYPES.UpdDocument]: {
                icon: 'fa-solid fa-file-circle-check',
                color: '#BA68C8',
                readFunction: Documents.readDocument,
                searchFunction: Documents.getDocumentBySerNum,
                PageUrl: Documents.getDocumentUrl,
                refreshType: 'Documents',
            },
            [Params.NOTIFICATION_TYPES.RoomAssignment]: {
                icon: 'fa-regular fa-calendar-days',
                color: '#ffc107',
                readFunction: Appointments.readAppointmentBySerNum,
                searchFunction: Appointments.getAppointmentBySerNum,
                PageUrl: Appointments.getAppointmentUrl,
                refreshType: 'Appointments',
            },
            [Params.NOTIFICATION_TYPES.TxTeamMessage]: {
                icon: 'fa fa-user-md',
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
                icon: 'fa-regular fa-calendar-days',
                color: '#ffc107',
                readFunction: Appointments.readAppointmentBySerNum,
                searchFunction: Appointments.getAppointmentBySerNum,
                PageUrl: Appointments.getAppointmentUrl,
                refreshType: 'Appointments',
            },
            [Params.NOTIFICATION_TYPES.AppointmentTimeChange]: {
                icon: 'fa-regular fa-calendar-days',
                color: '#ffc107',
                readFunction: Appointments.readAppointmentBySerNum,
                searchFunction: Appointments.getAppointmentBySerNum,
                PageUrl: Appointments.getAppointmentUrl,
                refreshType: 'Appointments',
            },
            [Params.NOTIFICATION_TYPES.CheckInNotification]: {
                icon: 'fa-solid fa-square-check',
                color: '#4CAF50',
                readFunction: Appointments.readAppointmentBySerNum,
                searchFunction: Appointments.getAppointmentBySerNum,
                PageUrl: Appointments.getAppointmentUrl,
                refreshType: 'Appointments',
            },
            [Params.NOTIFICATION_TYPES.CheckInError]: {
                icon: 'fa-solid fa-circle-xmark',
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
                icon: 'fa-regular fa-calendar-plus',
                color: '#5FAB61',
                readFunction: Appointments.readAppointmentBySerNum,
                searchFunction: Appointments.getAppointmentBySerNum,
                PageUrl: Appointments.getAppointmentUrl,
                refreshType: 'Appointments',
            },
            [Params.NOTIFICATION_TYPES.AppointmentCancelled]: {
                icon: 'fa-regular fa-calendar-times',
                color: '#ff0787',
                readFunction: Appointments.readAppointmentBySerNum,
                searchFunction: Appointments.getAppointmentBySerNum,
                PageUrl: Appointments.getAppointmentUrl,
                refreshType: 'Appointments',
            },
            // Special case: opens the general lab results page, not a specific lab
            [Params.NOTIFICATION_TYPES.NewLabResult]: {
                icon: 'ion-erlenmeyer-flask',
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
            appointmentNotificationTypes: appointmentNotificationTypes,
            updateUserNotifications: updateUserNotifications,
            getUserNotifications: getUserNotifications,
            readNotification: readNotification,
            getNotificationPost: getNotificationPost,
            downloadNotificationTarget: downloadNotificationTarget,
            setNotifications: setNotifications,
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
         * @name setNotifications
         * @param {Object} notifications Notifications array that contains the new notifications
         * @description Setter method for Notifications
         **/
        function setNotifications(notifications) {
            Notifications = [];
            addUserNotifications(notifications);
        }

        /******************************
         *  PUBLIC FUNCTIONS
         ******************************/

        /**
         *@ngdoc method
         *@name updateUserNotifications
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
         * @description Getter for the Notifications array
         * @returns {Array} Notifications array
         **/
        function getUserNotifications() {
            return Notifications;
        }

        /**
         * @ngdoc method
         * @name readNotification
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
         * @name getNotificationPost
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
            let savedItem = getNotificationPost(notification);
            if (!savedItem) throw new Error(`Failed to download or save notification target for '${notification.NotificationType}' with SerNum ${notification.RefTableRowSerNum}`);
            return savedItem;
        }

        /**
         * @ngdoc method
         * @name setNotificationsLanguage
         * @param {Array} notifications Array with notifications
         * @description Translates the array parameter containing notifications to the appropriate preferred language
         *              specified in {@link OpalApp.service:UserPreferences UserPreferences}.
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
                    console.error('Incorrectly formatted notification, not shown', notifications[i]);
                    notifications.splice(i, 1);
                }
            }
            return notifications;
        }

        /**
         * @description Returns a list of all notification types related to appointments.
         * @returns {(string)[]} The list of appointment notification types.
         */
        function appointmentNotificationTypes() {
            return [
                Params.NOTIFICATION_TYPES.RoomAssignment,
                Params.NOTIFICATION_TYPES.NextAppointment,
                Params.NOTIFICATION_TYPES.AppointmentTimeChange,
                Params.NOTIFICATION_TYPES.CheckInNotification,
                Params.NOTIFICATION_TYPES.CheckInError,
                Params.NOTIFICATION_TYPES.AppointmentNew,
                Params.NOTIFICATION_TYPES.AppointmentCancelled,
            ];
        }

        /**
         * @ngdoc method
         * @name clearNotifications
         * @description Clears the service of any saved state; function used by {@link OpalApp.service:CleanUp CleanUp}.
         **/
        function clearNotifications() {
            Notifications = [];
        }

        /**
         * @ngdoc method
         * @name implicitlyMarkCachedNotificationAsRead
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
