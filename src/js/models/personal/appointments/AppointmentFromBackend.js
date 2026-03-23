// SPDX-FileCopyrightText: Copyright (C) 2024 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/**
 * @description Transforms an appointment formatted from the backend (Django) into the legacy format
 *              expected by the app.
 */
// TODO rename to "Appointment" once all related code has been moved to Django and appointments are no longer also fetched from the listener
export class AppointmentFromBackend {
    constructor(
        {
            alias,
            appointmentsernum,
            checkin,
            checkininstruction,
            checkinpossible,
            educational_material_url,
            hospitalmap,
            patient,
            roomlocation,
            scheduledstarttime,
            state,
        },
    ) {
        this.AppointmentSerNum = appointmentsernum;
        this.AppointmentDescription = alias?.alias_description;
        this.AppointmentType = alias?.aliasname;
        this.Checkin = checkin;
        this.CheckinInstruction = checkininstruction;
        this.CheckinPossible = checkinpossible;
        this.MapDescription = hospitalmap?.mapdescription;
        this.MapName = hospitalmap?.mapname;
        this.MapUrl = hospitalmap?.mapurl;
        this.PatientSerNum = patient?.patientsernum;
        this.RoomLocation = roomlocation;
        this.ScheduledStartTime = Date.parse(scheduledstarttime);
        this.State = state;
        this.URL = educational_material_url;
    }
}
