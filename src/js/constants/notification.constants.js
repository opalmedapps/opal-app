// SPDX-FileCopyrightText: Copyright (C) 2024 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

(function() {
    'use strict';

    /**
     * This is a angular constant to store all the constants related to notifications.
     *
     * This file is injected into the Params (src/js/app.values.js) and the constants are accessed from there.
     */
    angular
        .module('OpalApp')
        .constant('NotificationConstants', {
            NOTIFICATION_TYPES: {
                'Document': 'Document',
                'UpdDocument': 'UpdDocument',
                'RoomAssignment': 'RoomAssignment',
                'TxTeamMessage': 'TxTeamMessage',
                'Announcement': 'Announcement',
                'EducationalMaterial': 'EducationalMaterial',
                'NextAppointment': 'NextAppointment',
                'AppointmentTimeChange': 'AppointmentTimeChange',
                'CheckInNotification': 'CheckInNotification',
                'CheckInError': 'CheckInError',
                'Questionnaire': 'Questionnaire',
                'LegacyQuestionnaire': 'LegacyQuestionnaire',
                'AppointmentNew': 'AppointmentNew',
                'AppointmentCancelled': 'AppointmentCancelled',
                'NewLabResult': 'NewLabResult',
            }
        });
})();
