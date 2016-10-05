var exports=module.exports={};
var Q=require('q');
var apiPatientUpdate=require('./apiPatientUpdate.js');
var apiHospitalUpdate=require('./apiHospitalUpdate.js');
var validate=require('./validate.js');
var API = {
  'Login':apiPatientUpdate.login,
  'Resume':apiPatientUpdate.resume,
  'Refresh':apiPatientUpdate.refresh,
  'CheckCheckin':apiPatientUpdate.checkCheckin,
  'Checkin':apiHospitalUpdate.checkIn,
  'CheckinUpdate':apiPatientUpdate.checkinUpdate,
  'MapLocation':apiPatientUpdate.getMapLocation,
  'DocumentContent':apiPatientUpdate.getDocumentsContent,
  'Message':apiHospitalUpdate.sendMessage,
  'Read':apiHospitalUpdate.updateReadStatus,
  'AccountChange':apiHospitalUpdate.accountChange,
  'Feedback':apiHospitalUpdate.inputFeedback,
  'Logout': apiHospitalUpdate.logout,
  'DeviceIdentifier':apiHospitalUpdate.updateDeviceIdentifier,
  'QuestionnaireRating':apiHospitalUpdate.inputEducationalMaterialRating,
  'QuestionnaireAnswers':apiHospitalUpdate.inputQuestionnaireAnswers
};

exports.processRequest=function(requestObject)
{
  console.log(requestObject);
  
  var r=Q.defer();
  var type = requestObject.Request;
  if(API.hasOwnProperty(type))
  {
    return  API[type](requestObject);
  }else{
    r.reject('error');
  }
  return r.promise;
};