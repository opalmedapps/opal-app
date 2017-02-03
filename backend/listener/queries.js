var exports=module.exports={};
//Get Patient table information for a particular patient
exports.patientTableFields=function()
{
    return "SELECT Patient.PatientSerNum,Patient.FirstName, Patient.LastName, Patient.TelNum, Patient.PatientId, Patient.Email, Patient.Alias, Patient.Language, Patient.EnableSMS,Patient.ProfileImage, Patient.SSN, Patient.AccessLevel FROM Patient, Users WHERE Users.Username LIKE ? AND Users.UserTypeSerNum=Patient.PatientSerNum AND Patient.LastUpdated > ?;";
};

exports.patientDoctorTableFields=function()
{
    return "SELECT Doctor.FirstName, Doctor.LastName, Doctor.DoctorSerNum, PatientDoctor.PrimaryFlag, PatientDoctor.OncologistFlag, Doctor.Email,Doctor.Phone, Doctor.ProfileImage, Doctor.Address FROM Doctor, PatientDoctor, Patient, Users WHERE Users.Username Like ? AND Patient.PatientSerNum=Users.UserTypeSerNum AND PatientDoctor.PatientSerNum = Patient.PatientSerNum AND Doctor.DoctorSerNum = PatientDoctor.DoctorSerNum AND (Doctor.LastUpdated > ? OR PatientDoctor.LastUpdated > ?);";
};

exports.patientDiagnosisTableFields=function()
{
    return "SELECT Diagnosis.CreationDate, Diagnosis.Description_EN, Diagnosis.Description_FR FROM Diagnosis, Patient, Users WHERE Users.UserTypeSerNum=Patient.PatientSerNum AND Diagnosis.PatientSerNum = Patient.PatientSerNum AND Users.Username Like ? AND Diagnosis.LastUpdated > ?;";
};

exports.patientMessageTableFields=function()
{
    return "SELECT Messages.MessageSerNum, Messages.LastUpdated, Messages.SenderRole, Messages.ReceiverRole, Messages.SenderSerNum, Messages.ReceiverSerNum, Messages.MessageContent, Messages.ReadStatus, Messages.MessageDate FROM Messages, Patient, Users WHERE Patient.PatientSerNum=Users.UserTypeSerNum AND ((Messages.ReceiverRole='Patient' AND Patient.PatientSerNum = Messages.ReceiverSerNum) OR (Messages.SenderRole='Patient' AND Patient.PatientSerNum = Messages.SenderSerNum)) AND Users.Username Like ? AND Messages.LastUpdated > ? ORDER BY Messages.MessageDate ASC;";
};

exports.patientAppointmentsTableFields=function()
{
    return "SELECT Appointment.AppointmentSerNum, Alias.AliasSerNum, Alias.AliasName_EN AS AppointmentType_EN, Alias.AliasName_FR AS AppointmentType_FR, Alias.AliasDescription_EN AS AppointmentDescription_EN, Alias.AliasDescription_FR AS AppointmentDescription_FR, Appointment.ScheduledStartTime, Appointment.ScheduledEndTime, Appointment.Checkin,Appointment.ReadStatus, Resource.ResourceName, Resource.ResourceType, HospitalMap.MapUrl,HospitalMap.MapName_EN,HospitalMap.MapName_FR,HospitalMap.MapDescription_EN,HospitalMap.MapDescription_FR, Appointment.Status, Appointment.RoomLocation_EN, Appointment.RoomLocation_FR, Appointment.LastUpdated FROM Appointment, AliasExpression, Alias,Resource, Patient, HospitalMap, ResourceAppointment,  Users WHERE HospitalMap.HospitalMapSerNum = Appointment.Location AND ResourceAppointment.AppointmentSerNum = Appointment.AppointmentSerNum AND ResourceAppointment.ResourceSerNum = Resource.ResourceSerNum AND Patient.PatientSerNum = Appointment.PatientSerNum AND AliasExpression.AliasExpressionSerNum=Appointment.AliasExpressionSerNum AND AliasExpression.AliasSerNum=Alias.AliasSerNum AND Users.UserTypeSerNum=Patient.PatientSerNum AND Users.Username = ? AND Appointment.State = 'Active' AND (Appointment.LastUpdated > ? OR Alias.LastUpdated > ? OR AliasExpression.LastUpdated > ? OR Resource.LastUpdated > ? OR HospitalMap.LastUpdated > ?) ORDER BY Appointment.AppointmentSerNum, ScheduledStartTime;";
};

exports.patientDocumentTableFields=function()
{
    return "SELECT Document.FinalFileName, Alias.AliasName_EN, Alias.AliasName_FR, Document.ReadStatus, Alias.AliasDescription_EN, Alias.AliasDescription_FR, Document.DocumentSerNum, Document.DateAdded, Document.LastUpdated, Document.ApprovedTimeStamp, Staff.FirstName, Staff.LastName FROM Document, Patient, Alias, AliasExpression, Users, Staff WHERE Patient.AccessLevel = 3 AND Staff.StaffSerNum = Document.ApprovedBySerNum AND Document.AliasExpressionSerNum=AliasExpression.AliasExpressionSerNum AND AliasExpression.AliasSerNum=Alias.AliasSerNum AND Patient.PatientSerNum=Document.PatientSerNum AND Users.UserTypeSerNum=Patient.PatientSerNum AND Users.Username LIKE ? AND (Document.LastUpdated > ? OR Alias.LastUpdated > ?);";
};
exports.getDocumentsContentQuery = function()
{
    return "SELECT Document.DocumentSerNum, Document.FinalFileName FROM Document, Patient, Users WHERE Document.DocumentSerNum IN ? AND Document.PatientSerNum = Patient.PatientSerNum AND Patient.PatientSerNum = Users.UserTypeSerNum AND Users.Username = ?";
};

exports.patientNotificationsTableFields=function()
{
    return "SELECT Notification.NotificationSerNum, Notification.DateAdded, Notification.ReadStatus, Notification.RefTableRowSerNum, NotificationControl.NotificationType, NotificationControl.Name_EN, NotificationControl.Name_FR, NotificationControl.Description_EN, NotificationControl.Description_FR FROM Notification, NotificationControl, Patient, Users WHERE NotificationControl.NotificationControlSerNum = Notification.NotificationControlSerNum AND Notification.PatientSerNum=Patient.PatientSerNum AND Patient.PatientSerNum=Users.UserTypeSerNum AND Users.Username= ? AND (Notification.LastUpdated > ? OR NotificationControl.LastUpdated > ?);";
};
exports.patientTeamMessagesTableFields=function()
{
    return "SELECT TxRecords.TxTeamMessageSerNum, TxRecords.DateAdded, TxRecords.ReadStatus, Post.PostType, Post.Body_EN, Post.Body_FR, Post.PostName_EN, Post.PostName_FR FROM PostControl as Post, TxTeamMessage as TxRecords, Patient, Users WHERE Post.PostControlSerNum=TxRecords.PostControlSerNum AND TxRecords.PatientSerNum=Patient.PatientSerNum AND Patient.PatientSerNum=Users.UserTypeSerNum AND Users.Username= ? AND (TxRecords.LastUpdated > ? OR Post.LastUpdated > ?);";
};
exports.patientAnnouncementsTableFields=function()
{
    return "SELECT Announcement.AnnouncementSerNum, Announcement.DateAdded, Announcement.ReadStatus, PostControl.PostType, PostControl.Body_EN, PostControl.Body_FR, PostControl.PostName_EN, PostControl.PostName_FR FROM PostControl, Announcement, Users, Patient WHERE PostControl.PostControlSerNum = Announcement.PostControlSerNum AND Announcement.PatientSerNum=Patient.PatientSerNum AND Patient.PatientSerNum=Users.UserTypeSerNum AND Users.Username= ? AND (Announcement.LastUpdated > ? OR PostControl.LastUpdated > ?);";
};
exports.patientEducationalMaterialTableFields=function()
{
    return "SELECT DISTINCT EduMat.EducationalMaterialSerNum, EduControl.ShareURL_EN, EduControl.ShareURL_FR, EduControl.EducationalMaterialControlSerNum, EduMat.DateAdded, EduMat.ReadStatus, EduControl.EducationalMaterialType_EN, EduControl.EducationalMaterialType_FR, EduControl.Name_EN, EduControl.Name_FR, EduControl.URL_EN, EduControl.URL_FR, Phase.Name_EN as PhaseName_EN, Phase.Name_FR as PhaseName_FR FROM Users, Patient, EducationalMaterialControl as EduControl, EducationalMaterial as EduMat, PhaseInTreatment as Phase, EducationalMaterialTOC as TOC WHERE (EduMat.EducationalMaterialControlSerNum = EduControl.EducationalMaterialControlSerNum OR (TOC.ParentSerNum = EduMat.EducationalMaterialControlSerNum AND TOC.EducationalMaterialControlSerNum = EduControl.EducationalMaterialControlSerNum)) AND Phase.PhaseInTreatmentSerNum = EduControl.PhaseInTreatmentSerNum AND  EduMat.PatientSerNum = Patient.PatientSerNum AND Patient.PatientSerNum = Users.UserTypeSerNum AND Users.Username = ? AND (EduMat.LastUpdated > ? OR EduControl.LastUpdated > ? OR Phase.LastUpdated > ? OR TOC.LastUpdated > ?) order by FIELD(PhaseName_EN,'Prior To Treatment','During Treatment','After Treatment') ;";
};
exports.patientEducationalMaterialContents=function()
{
    return "SELECT EducationalMaterialTOC.OrderNum, EducationalMaterialTOC.ParentSerNum, EducationalMaterialTOC.EducationalMaterialControlSerNum, EduControl.EducationalMaterialType_EN, EduControl.EducationalMaterialType_FR, EduControl.Name_EN, EduControl.Name_FR, EduControl.URL_FR, EduControl.URL_EN FROM EducationalMaterialControl as EduControl, EducationalMaterialTOC WHERE EduControl.EducationalMaterialControlSerNum = EducationalMaterialTOC.EducationalMaterialControlSerNum AND EducationalMaterialTOC.ParentSerNum = ? ORDER BY OrderNum;";
};
exports.patientTasksTableFields=function()
{
    return "SELECT Patient.PatientAriaSer, Alias.AliasName_EN AS TaskName_EN,Alias.AliasName_FR AS TaskName_FR,Alias.AliasDescription_EN AS TaskDescription_EN,Alias.AliasDescription_FR AS TaskDescription_FR,Task.DueDateTime FROM Task,Alias,AliasExpression,Patient,Users WHERE Patient.PatientSerNum = Task.PatientSerNum AND AliasExpression.AliasExpressionSerNum =Task.AliasExpressionSerNum AND AliasExpression.AliasSerNum = Alias.AliasSerNum AND Users.UserTypeSerNum=Patient.PatientSerNum AND Users.Username LIKE ? AND (Task.LastUpdated > ? OR Alias.LastUpdated > ?);";
};
exports.patientTestResultsTableFields=function()
{
    return 'SELECT ComponentName, FacComponentName, AbnormalFlag, MaxNorm, MinNorm, TestValue, TestValueString, UnitDescription, CAST(TestDate AS char(30)) as `TestDate` FROM TestResult, Users, Patient WHERE Patient.AccessLevel = 3 AND Users.UserTypeSerNum=Patient.PatientSerNum AND TestResult.PatientSerNum = Patient.PatientSerNum AND Users.Username LIKE ? AND TestResult.LastUpdated > ?;';
};
exports.patientQuestionnaireTableFields = function()
{
    return "SELECT Questionnaire.CompletedFlag, Questionnaire.DateAdded, Questionnaire.PatientQuestionnaireDBSerNum, Questionnaire.CompletionDate, Questionnaire.QuestionnaireSerNum, QuestionnaireControl.QuestionnaireDBSerNum FROM QuestionnaireControl, Questionnaire, Patient, Users WHERE QuestionnaireControl.QuestionnaireControlSerNum = Questionnaire.QuestionnaireControlSerNum AND Questionnaire.PatientSerNum = Patient.PatientSerNum AND Users.UserTypeSerNum = Patient.PatientSerNum AND Users.Username = ? AND QuestionnaireControl.LastUpdated > ? AND Questionnaire.LastUpdated > ?";
};
/*exports.getPatientFieldsForPasswordReset=function(userID)
 {
 return 'SELECT Patient.SSN, Patient.PatientSerNum FROM Patient, Users WHERE Users.Username LIKE '+"\'"+ userID+"\'"+'AND Users.UserTypeSerNum = Patient.PatientSerNum';
 };*/
exports.getPatientFieldsForPasswordReset=function()
{
    return 'SELECT DISTINCT pat.Email, u.Password, u.UserTypeSerNum, sa.AnswerText FROM Users u, Patient pat, SecurityAnswer sa, PatientDeviceIdentifier pdi WHERE pat.Email= ? AND pat.PatientSerNum = u.UserTypeSerNum AND pdi.DeviceId = ? AND sa.SecurityAnswerSerNum = pdi.SecurityAnswerSerNum';
};
exports.setNewPassword=function(password,patientSerNum, token)
{
    return "UPDATE Users SET Password='"+password+"', SessionId='"+token+"' WHERE UserType = 'Patient' AND UserTypeSerNum="+patientSerNum;
};

//For checkin
exports.getAppointmentAriaSer=function()
{
    return "SELECT Appointment.AppointmentAriaSer FROM Patient, Users, Appointment WHERE Users.Username = ? AND Appointment.AppointmentSerNum = ? AND Patient.PatientSerNum = Users.UserTypeSerNum ";
};
exports.checkin=function()
{
    return "UPDATE Appointment, Patient, Users SET Appointment.Checkin=1, Appointment.SessionId=? WHERE Appointment.AppointmentSerNum=? AND Appointment.PatientSerNum = Patient.PatientSerNum AND Patient.PatientSerNum = Users.UserTypeSerNum AND Users.Username = ? ";
};

exports.logCheckin = function()
{
    return "INSERT INTO `CheckinLog`(`CheckinLogSerNum`, `AppointmentSerNum`, `DeviceId`, `Latitude`, `Longitude`, `Accuracy`, `DateAdded`, `LastUpdated`) VALUES (NULL,?,?,?,?,?,?,NULL)";
};

exports.accountChange=function( serNum, field, newValue, token)
{
    return "UPDATE Patient SET "+field+"='"+newValue+"', SessionId='"+token+"' WHERE PatientSerNum LIKE '"+serNum+"'";
};
exports.inputFeedback=function(UserSerNum, content)
{
    return "INSERT INTO Feedback (`FeedbackSerNum`,`PatientSerNum`,`FeedbackContent`,`AppRating`,`DateAdded`, `SessionId`, `LastUpdated`) VALUES (NULL,?,?,?,NOW(),?, CURRENT_TIMESTAMP )";
};
//As the name implies, sends the message, this message function needs to be improved to account for injection attacks
exports.sendMessage=function(objectRequest)
{
    var token=objectRequest.Token;
    objectRequest=objectRequest.Parameters;
    var senderRole=objectRequest.SenderRole;
    var receiverRole=objectRequest.ReceiverRole;
    var senderSerNum=objectRequest.SenderSerNum;
    var receiverSerNum=objectRequest.ReceiverSerNum;
    var messageContent=objectRequest.MessageContent;
    var messageDate=objectRequest.MessageDate;
    return "INSERT INTO Messages (`MessageSerNum`, `SenderRole`,`ReceiverRole`, `SenderSerNum`, `ReceiverSerNum`,`MessageContent`,`ReadStatus`,`MessageDate`,`SessionId`,`LastUpdated`) VALUES (NULL,'"+senderRole+"','"+ receiverRole + "', '"+senderSerNum+"','"+ receiverSerNum +"','" +messageContent+"',0,'"+messageDate+"','"+token+"' ,CURRENT_TIMESTAMP )";
};
exports.getUserFromUserId=function(userID)
{
    return "SELECT UserTypeSerNum, UserSerNum FROM Users WHERE Username LIKE"+"\'"+ userID+"\'"+" AND UserType LIKE 'Patient'";
};
exports.logActivity=function(requestObject)
{

    return "INSERT INTO PatientActivityLog (`ActivitySerNum`,`Request`,`Username`, `DeviceId`,`SessionId`,`DateTime`,`LastUpdated`) VALUES (NULL,'"+requestObject.Request+ "', '"+requestObject.UserID+ "', '"+requestObject.DeviceId+"','"+requestObject.Token+"', CURRENT_TIMESTAMP ,CURRENT_TIMESTAMP )";
};

exports.userEncryption=function()
{
    return "SELECT u.Password, sa.AnswerText FROM Users u, SecurityAnswer sa WHERE u.Username = ? AND sa.PatientSerNum = u.UserTypeSerNum";
};
exports.getSecurityQuestions=function(serNum)
{
    return "SELECT SecurityQuestion.QuestionText, SecurityAnswer.AnswerText FROM SecurityQuestion, SecurityAnswer WHERE SecurityAnswer.PatientSerNum="+serNum +" AND SecurityQuestion.SecurityQuestionSerNum = SecurityAnswer.SecurityQuestionSerNum";
};

exports.getSecQuestion=function()
{
    return "SELECT sq.QuestionText, sa.SecurityAnswerSerNum FROM SecurityQuestion sq, SecurityAnswer sa, Users u WHERE u.Username = ? AND sa.PatientSerNum= u.UserTypeSerNum AND sq.SecurityQuestionSerNum = sa.SecurityQuestionSerNum ORDER BY RAND() LIMIT 1";
};

exports.updateLogout=function()
{
    return "INSERT INTO PatientActivityLog (`ActivitySerNum`,`Request`,`Username`, `DeviceId`,`SessionId`,`DateTime`,`LastUpdated`) VALUES (NULL,?,?,?,?,?,CURRENT_TIMESTAMP )";
};
exports.updateDeviceIdentifiers = function()
{
    return "INSERT INTO `PatientDeviceIdentifier`(`PatientDeviceIdentifierSerNum`, `PatientSerNum`, `DeviceId`, `RegistrationId`, `DeviceType`,`SessionId`, `Trusted`,`LastUpdated`) VALUES (NULL, ?,?,?,?,?, 0, NULL) ON DUPLICATE KEY UPDATE RegistrationId = ?, SessionId = ?;"
};
exports.getMapLocation=function(qrCode)
{
    console.log("SELECT * FROM HospitalMap WHERE QRMapAlias = '"+qrCode+"';");
    return "SELECT * FROM HospitalMap WHERE QRMapAlias = '"+qrCode+"';";
};

exports.updateReadStatus=function()
{
    return "UPDATE ?? , Patient, Users SET ReadStatus = 1 WHERE ??.?? = ? AND Patient.PatientSerNum = ??.PatientSerNum AND Patient.PatientSerNum = Users.UserTypeSerNum AND Users.Username = ?;";
};

exports.getPatientDeviceLastActivity=function(userid,device)
{
    return "SELECT * FROM PatientActivityLog WHERE Username='"+userid+"' AND DeviceId='"+device+"' ORDER BY ActivitySerNum DESC LIMIT 1;";
};
exports.insertEducationalMaterialRatingQuery=function()
{
    return "INSERT INTO `EducationalMaterialRating`(`EducationalMaterialRatingSerNum`, `EducationalMaterialControlSerNum`, `PatientSerNum`, `RatingValue`, `SessionId`, `LastUpdated`) VALUES (NULL,?,?,?,?,NULL)";
};
exports.setQuestionnaireCompletedQuery = function()
{
    return "UPDATE `Questionnaire` SET PatientQuestionnaireDBSerNum = ?, CompletedFlag = 1, CompletionDate = ?, SessionId = ? WHERE Questionnaire.QuestionnaireSerNum = ?;";
};

exports.getPatientAriaSerQuery = function()
{
    return "SELECT Patient.PatientAriaSer FROM Patient, Users WHERE Patient.PatientSerNum = Users.UserTypeSerNum && Users.Username = ?"
};

exports.getPatientId= function()
{
    return "SELECT Patient.PatientId FROM Patient, Users WHERE Patient.PatientSerNum = Users.UserTypeSerNum && Users.Username = ?"
};

exports.getTrustedDevice = function () {
    return "SELECT pdi.Trusted FROM PatientDeviceIdentifier pdi, Users u WHERE pdi.PatientSerNum = u.UserTypeSerNum AND u.Username = ? AND DeviceId = ?"
};

exports.setDeviceSecurityAnswer = function () {
    return "UPDATE PatientDeviceIdentifier SET SecurityAnswerSerNum = ? WHERE DeviceId = ?";
};

exports.setTrusted = function () {
    return "UPDATE PatientDeviceIdentifier SET Trusted = 1 WHERE DeviceId = ?";
};