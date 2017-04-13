var exports=module.exports={};
var Q=require('q');
var apiPatientUpdate=require('./apiPatientUpdate.js');
var apiHospitalUpdate=require('./apiHospitalUpdate.js');
var security = require('./../security/security');

var API = {

    'DeviceIdentifier':apiHospitalUpdate.updateDeviceIdentifier,
    'Log': apiPatientUpdate.logActivity,
    'Login':apiPatientUpdate.login,
    'Logout': apiHospitalUpdate.logout,
    'Resume':apiPatientUpdate.resume,
    'Refresh':apiPatientUpdate.refresh,

    'AccountChange':apiHospitalUpdate.accountChange,
    'CheckCheckin':apiPatientUpdate.checkCheckin,
    'Checkin':apiHospitalUpdate.checkIn,
    'CheckinUpdate':apiPatientUpdate.checkinUpdate,
    'DocumentContent':apiPatientUpdate.getDocumentsContent,
    'Feedback':apiHospitalUpdate.inputFeedback,
    'LabResults': apiPatientUpdate.getLabResults,
    'MapLocation':apiPatientUpdate.getMapLocation,
    'Message':apiHospitalUpdate.sendMessage,
    'Questionnaires': apiPatientUpdate.getQuestionnaires,
    'QuestionnaireRating':apiHospitalUpdate.inputEducationalMaterialRating,
    'QuestionnaireAnswers':apiHospitalUpdate.inputQuestionnaireAnswers,
    'Read':apiHospitalUpdate.updateReadStatus,
};

exports.securityAPI = {
    'PasswordReset': security.resetPasswordRequest,
    'SecurityQuestion': security.securityQuestion,
    'SetNewPassword': security.resetPasswordRequest,
    'VerifyAnswer': security.resetPasswordRequest
}

exports.processRequest=function(requestObject)
{

    var r=Q.defer();
    var type = requestObject.Request;

    if (API.hasOwnProperty(type))
    {
        return  API[type](requestObject);
    }else{
        r.reject('error');
    }
    return r.promise;
};