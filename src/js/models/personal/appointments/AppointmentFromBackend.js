/**
 * @description Transforms an appointment formatted from the backend (Django) into the legacy format
 *              expected by the app.
 */
export class AppointmentFromBackend {
    constructor(
        {
            alias,
            appointmentsernum,
            checkin,
            checkininstruction_en,
            checkininstruction_fr,
            checkinpossible,
            hospitalmap,
            lastupdated,
            patient,
            roomlocation_en,
            roomlocation_fr,
            scheduledendtime,
            scheduledstarttime,
            state,
        },
        language,
    ) {
        this.AppointmentSerNum = appointmentsernum;
        this.AppointmentType_EN = alias?.aliasname_en;
        this.AppointmentType_FR = alias?.aliasname_fr;
        this.Checkin = checkin;
        this.CheckinInstruction_EN = checkininstruction_en;
        this.CheckinInstruction_FR = checkininstruction_fr;
        this.CheckinPossible = checkinpossible;
        this.LastUpdated = Date.parse(lastupdated);
        this.MapDescription_EN = hospitalmap?.mapdescription_en;
        this.MapDescription_FR = hospitalmap?.mapdescription_fr;
        this.MapName_EN = hospitalmap?.mapname_en;
        this.MapName_FR = hospitalmap?.mapname_fr;
        this.MapUrl_EN = hospitalmap?.mapurl_en;
        this.MapUrl_FR = hospitalmap?.mapurl_fr;
        this.PatientSerNum = patient?.patientsernum;
        this.ResourceDescription = language === 'EN' ? alias?.aliasname_en : alias?.aliasname_fr;
        this.RoomLocation_EN = roomlocation_en;
        this.RoomLocation_FR = roomlocation_fr;
        this.ScheduledStartTime = Date.parse(scheduledstarttime);
        this.ScheduledEndTime = Date.parse(scheduledendtime);
        this.State = state;
    }
}
