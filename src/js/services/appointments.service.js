/**
 * @author Stacey Beard, refactor of appointmentsService.js by David Herrera
 * @date 2024-08-27
 */
(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .service('Appointments', Appointments);

    Appointments.$inject = ['$filter', 'RequestToServer'];

    function Appointments($filter, RequestToServer) {
        /**
         * @description Array containing all of the current patient's appointments, organized chronologically from most recent to oldest.
         * @type {object[]}
         */
        let userAppointmentsArray = [];

        return {
            clearAppointments: clearAppointments,
            getAppointmentBySerNum: serNum => userAppointmentsArray.find(apt => apt.AppointmentSerNum == serNum),
            getAppointmentUrl: () => './views/personal/appointments/individual-appointment.html',
            getUserAppointments: () => userAppointmentsArray,
            readAppointmentBySerNum: readAppointmentBySerNum,
            setUserAppointments: setUserAppointments,
            updateUserAppointments: updateUserAppointments,
        }

        /********************************/
        /******* PUBLIC FUNCTIONS *******/
        /********************************/

        /**
         * @description Formats and saves the given appointments in the patient's appointment array.
         * @param appointments The appointments to set.
         */
        function setUserAppointments(appointments) {
            userAppointmentsArray = [];
            addAppointmentsToService(appointments);
        }

        /**
         * @description Updates the patient's appointment array by replacing data for updated appointments.
         * @param appointments The new appointment data to update in the patient's array.
         */
        function updateUserAppointments(appointments) {
            searchAppointmentsAndDelete(appointments);
            addAppointmentsToService(appointments);
        }

        /**
         * @description Sets an appointment as read locally and in the database.
         * @param serNum The AppointmentSerNum of the appointment to mark as read.
         */
        function readAppointmentBySerNum(serNum) {
            let aptToRead = userAppointmentsArray.find(apt => apt.AppointmentSerNum == serNum);
            if (aptToRead) aptToRead.ReadStatus = '1';
            RequestToServer.sendRequest('Read', {'Id': serNum, 'Field': 'Appointments'});
        }

        /**
         * @description Clears all data from this service.
         */
        function clearAppointments() {
            userAppointmentsArray = [];
        }

        /*********************************/
        /******* PRIVATE FUNCTIONS *******/
        /*********************************/

        /**
         * @description Formats and saves appointments to this service.
         */
        function addAppointmentsToService(appointments) {
            // Format date to javascript date
            appointments.forEach(appointment => {
                appointment.ScheduledStartTime = $filter('formatDate')(appointment.ScheduledStartTime);
                appointment.ScheduledEndTime =  $filter('formatDate')(appointment.ScheduledEndTime);
                appointment.LastUpdated =  $filter('formatDate')(appointment.LastUpdated);
                userAppointmentsArray.push(appointment);
            });

            // Sort chronologically with the most recent first
            userAppointmentsArray = $filter('orderBy')(userAppointmentsArray, 'ScheduledStartTime', false);
        }

        /**
         * @description Deletes appointments from the patient's appointment array.
         *              Matches are found based on AppointmentSerNum.
         * @param appointmentsToDelete The list of appointments to delete.
         */
        function searchAppointmentsAndDelete(appointmentsToDelete) {
            let serNumsToDelete = appointmentsToDelete.map(apt => apt.AppointmentSerNum);
            userAppointmentsArray = userAppointmentsArray.filter(apt => !serNumsToDelete.includes(apt.AppointmentSerNum));
        }
    }
})();
