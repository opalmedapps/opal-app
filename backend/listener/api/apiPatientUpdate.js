var exports = module.exports = {};
var Q = require('q');
var sqlInterface = require('./sqlInterface.js');
var utility = require('./../utility/utility.js');
var validate = require('./../utility/validate.js');
var queries = require('./../sql/queries.js');
var logger = require('./../logs/logger.js');
const fs = require('fs');
const config = require('../config.json');
/**
 *@name login
 *@requires sqlInterface
 *@parameter(string) UserID Patients user ID
 *@description Grabs all the tables for the user and updates them to firebase
 */
exports.login = function (requestObject) {
  //console.log('Inside Login function', requestObject);
  
  // sqlInterface.getPatientDeviceLastActivity(requestObject.UserID,requestObject.DeviceId).then(function(result){
  //     var date=new Date(result.DateTime);
  //     date.setDate(date.getDate()+1);
  //     var today=new Date();
  //     if(typeof result !=='undefined'&&result.Request=='Login')
  //     {
  //        result.Request='Logout';
  //        sqlInterface.updateLogout([result.Request,result.Username,result.DeviceId,result.SessionId,date]).then(function(response){
  //           //console.log('Updating logout', response);
  //        },function(error){
  //           //console.log('Error updating logout', error);
  //        });
  //     }
  //   });
    //sqlInterface.addToActivityLog(requestObject);
    return sqlInterface.getPatientTableFields(requestObject.UserID, requestObject.Parameters.timestamp, requestObject.Parameters.Fields );
};

/**
*@name refresh
*@requires sqlInterface
*@parameter(string) UserID Patients User Id
*@parameter(string) Parameters, either an array of fields to be uploaded,
or a single table field.
*/
exports.resume=function(requestObject)
{
  return sqlInterface.getPatientTableFields(requestObject.UserID);
};

exports.refresh = function (requestObject) {
    var r = Q.defer();
    var UserId=requestObject.UserID;
    var parameters=requestObject.Parameters;
    var fields =parameters.Fields;
    var timestamp=parameters.Timestamp;

    if(!validate("Defined",fields))
    {
      r.reject({Response:'error',Reason:'Undefined Parameters'});
    }
    if(fields=='All'){
      sqlInterface.getPatientTableFields(UserId,timestamp).then(function(objectToFirebase){
        objectToFirebase.Data = utility.resolveEmptyResponse(objectToFirebase.Data);
        //console.log('Hello World');
        r.resolve(objectToFirebase);
      }).catch(function(error){
        r.reject(error);
      });
    }else {
      if(!(typeof fields.constructor !=='undefined'&&fields.constructor=== Array)) fields=[fields];
        if (!validate('RefreshArray', fields)) {
            r.reject({Reason:'Incorrect refresh parameters',Response:'error'});
        }
        sqlInterface.getPatientTableFields(UserId, timestamp, fields).then(function (rows) {
            rows.Data=utility.resolveEmptyResponse(rows.Data);
            r.resolve(rows);
        },function(error)
        {
            r.reject(error);        
        });
    }
    return r.promise;
};

//Check checkin API call
exports.checkCheckin = function(requestObject)
{
  return sqlInterface.checkCheckinInAria(requestObject);
};

//Get checkin update API call
exports.checkinUpdate = function(requestObject)
{
  //console.log('Checkin update!');
  return sqlInterface.checkinUpdate(requestObject);
};

//Get Map Location API call 
exports.getMapLocation=function(requestObject)
{
   return sqlInterface.getMapLocation(requestObject);
};

//Get Document Content
exports.getDocumentsContent=function(requestObject)
{

   return sqlInterface.getDocumentsContent(requestObject);
};

exports.getLabResults = function (requestObject) {
    return sqlInterface.getLabResults(requestObject);
};

exports.getSecurityQuestion = function (requestObject) {
    return sqlInterface.getSecurityQuestion(requestObject);
};

// exports.isTrustedDevice = function (requestObject) {
//     return sqlInterface.isTrustedDevice(requestObject);
// };

exports.logActivity = function (requestObject) {
    logger.log('info', 'User Activity', {
        deviceID:requestObject.DeviceId,
        userID:requestObject.UserID,
        request:requestObject.Request,
        activity:requestObject.Parameters.Activity,
        activityDetails: requestObject.Parameters.ActivityDetails
    });
    return Q.resolve({Response:'success'});
};

exports.getQuestionnaires = function (requestObject) {
    return sqlInterface.getQuestionnaires(requestObject);
};



function getPatientForPatientMembersImage(members)
{
  return new Promise((resolve, reject) => {
    members.forEach((member)=>{
      if(member.ProfileImage)
      {
        try{
          let profileImage = fs.readFileSync(config.PFP_PATH + member.ProfileImage, "base64");
          member.ProfileImage = profileImage;
          resolve(members);
        }catch(err) {
          reject(err);
        } 
      }
    });
  });
}

exports.getPatientsForPatientsMembers = function ()
{
  return new Promise((resolve, reject)=>{
      sqlInterface.runSqlQuery(queries.getPatientForPatientMembers(),[],getPatientForPatientMembersImage).then((members)=>{
          console.log(members);
         resolve({Response:members});
      }).catch((err) => reject({Response:error, Reason:err}));
  });
};