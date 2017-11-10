var exports = module.exports = {};
const Q                     = require('q');
const apiPatientUpdate      = require('./apiPatientUpdate.js');
const apiHospitalUpdate     = require('./apiHospitalUpdate.js');
const security              = require('./../security/security');
const logger                = require('./../logs/logger');

/**
 * API HANDLERS FOR GENERAL REQUESTS
 * @type {{DeviceIdentifier: *, Log: *, Login: *, Logout: *, Resume: *, Refresh: *, AccountChange: *, CheckCheckin: *, Checkin: *, CheckinUpdate: *, DocumentContent: *, Feedback: *, LabResults: *, MapLocation: *, Message: *, NotificationsAll: *, Questionnaires: *, QuestionnaireRating: *, QuestionnaireAnswers: *, Read: *, PFPMembers: *}}
 */
const API = {
    'DeviceIdentifier': apiHospitalUpdate.updateDeviceIdentifier,
    'Log': apiPatientUpdate.logActivity,
    'Login': apiPatientUpdate.login,
    'Logout': apiHospitalUpdate.logout,
    'Resume': apiPatientUpdate.resume,
    'Refresh': apiPatientUpdate.refresh,
    'AccountChange': apiHospitalUpdate.accountChange,
    'CheckCheckin': apiPatientUpdate.checkCheckin,
    'Checkin': apiHospitalUpdate.checkIn,
    'CheckinUpdate': apiPatientUpdate.checkinUpdate,
    'DocumentContent': apiPatientUpdate.getDocumentsContent,
    'Feedback': apiHospitalUpdate.inputFeedback,
    'LabResults': apiPatientUpdate.getLabResults,
    'MapLocation': apiPatientUpdate.getMapLocation,
    'Message': apiHospitalUpdate.sendMessage,
    'NotificationsAll': apiHospitalUpdate.getAllNotifications,
    'Questionnaires': apiPatientUpdate.getQuestionnaires,
    'QuestionnaireRating': apiHospitalUpdate.inputEducationalMaterialRating,
    'QuestionnaireAnswers': apiHospitalUpdate.inputQuestionnaireAnswers,
    'Read': apiHospitalUpdate.updateReadStatus,
    'PFPMembers': apiPatientUpdate.getPatientsForPatientsMembers
};

/**
 * API HANDLERS FOR SECURITY SPECIFIC REQUESTS
 * @type {{PasswordReset: *, SecurityQuestion: *, SetNewPassword: *, VerifyAnswer: *}}
 */
exports.securityAPI = {
    'PasswordReset': security.resetPasswordRequest,
    'SecurityQuestion': security.securityQuestion,
    'SetNewPassword': security.resetPasswordRequest,
    'VerifyAnswer': security.resetPasswordRequest
};

/**
 * processRequest
 * @desc Maps the incoming requestObject to the correct API function to handle it
 * @param requestObject
 * @return {Promise}
 */
exports.processRequest=function(requestObject) {
    const r = Q.defer();
    const type = requestObject.Request;
    if (API.hasOwnProperty(type)) {
        logger.log('debug', 'Processing request of type: ' + type);
        return  API[type](requestObject);
    }else{
        logger.log('error', 'Invalid request type: ' + type);
        r.reject('Invalid request type');
    }
    return r.promise;
};
