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
            checkininstruction_en,
            checkininstruction_fr,
            checkinpossible,
            educational_material_url_en,
            educational_material_url_fr,
            hospitalmap,
            patient,
            roomlocation_en,
            roomlocation_fr,
            scheduledstarttime,
            state,
        },
    ) {
        this.AppointmentSerNum = appointmentsernum;
        this.AppointmentDescription_EN = alias?.alias_description_en;
        this.AppointmentDescription_FR = alias?.alias_description_fr;
        this.AppointmentType_EN = alias?.aliasname_en;
        this.AppointmentType_FR = alias?.aliasname_fr;
        this.Checkin = checkin;
        this.CheckinInstruction_EN = checkininstruction_en;
        this.CheckinInstruction_FR = checkininstruction_fr;
        this.CheckinPossible = checkinpossible;
        this.MapDescription_EN = hospitalmap?.mapdescription_en;
        this.MapDescription_FR = hospitalmap?.mapdescription_fr;
        this.MapName_EN = hospitalmap?.mapname_en;
        this.MapName_FR = hospitalmap?.mapname_fr;
        this.MapUrl_EN = hospitalmap?.mapurl_en;
        this.MapUrl_FR = hospitalmap?.mapurl_fr;
        this.PatientSerNum = patient?.patientsernum;
        this.RoomLocation_EN = roomlocation_en;
        this.RoomLocation_FR = roomlocation_fr;
        this.ScheduledStartTime = Date.parse(scheduledstarttime);
        this.State = state;
        this.URL_EN = educational_material_url_en;
        this.URL_FR = educational_material_url_fr;
    }
}
