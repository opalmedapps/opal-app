var exports = module.exports = {};
var Q = require('q');
var sqlInterface = require('./sqlInterface.js');
var utility = require('./utility.js');
var validate = require('./validate.js');
/*
 *@name login
 *@requires slqInterface
 *@parameter(string) UserID Patients user ID
 *@description Grabs all the tables for the user and updates them to firebase
 */

exports.login = function (requestObject) {
    var r = Q.defer();
    var UserID=requestObject.UserID;
    var objectToFirebase = {};
    if(!validate('Login',UserID))
    {
      sqlInterface.getPatient(UserID).then(function (rows) {
          objectToFirebase.Patient = rows;

          sqlInterface.getPatientDoctors(UserID).then(function (rows) {
              objectToFirebase.Doctors = rows;

              sqlInterface.getPatientDiagnoses(UserID).then(function (rows) {
                  objectToFirebase.Diagnoses = rows;

                  sqlInterface.getPatientMessages(UserID).then(function (rows) {
                      objectToFirebase.Messages = rows;

                      sqlInterface.getPatientAppointments(UserID).then(function (rows) {
                          objectToFirebase.Appointments = rows;

                          sqlInterface.getPatientDocuments(UserID).then(function (rows) {
                              objectToFirebase.Documents = rows;

                              sqlInterface.getPatientNotifications(UserID).then(function (rows) {
                                  objectToFirebase.Notifications = rows;

                                  sqlInterface.getPatientTasks(UserID).then(function (rows) {
                                      objectToFirebase.Tasks = rows;
                                      /*
                                       * Add additional fields for login in here!!!!
                                       */
                                      sqlInterface.addToActivityLog(requestObject);
                                      r.resolve(objectToFirebase);
                                  });
                              });
                          });
                      });
                  });
              });
          });
      });
    }else{
      r.reject('Invalid');
    }

    return r.promise;
};
/*
*@name refresh
*@requires sqlInterface
*@parameter(string) UserID Patients User Id
*@parameter(string) Parameters, either an array of fields to be uploaded,
or a single table field.
*/
exports.refresh = function (requestObject) {
    var UserID=requestObject.UserID;
    var parameters=requestObject.Parameters;
    var r = Q.defer();
    var objectToFirebase = {};
    if(!validate("Defined",parameters))
    {

      r.reject('Invalid');
    }
    var paramArray=parameters.replace(" ","").split(",");
    if (paramArray.length>1) {
        if (!validate('RefreshArray', paramArray)) {
            r.reject('Invalid');
        }
        var queue = utility.Queue();
        queue.enqueueArray(paramArray);
        sqlInterface.cascadeFunction(UserID, queue, {}).then(function (rows) {
            objectToFirebase = rows;
            sqlInterface.addToActivityLog(requestObject);
            r.resolve(objectToFirebase);
        });
    } else if(parameters=='All'){
      exports.login(requestObject).then(function(objectToFirebase){
        r.resolve(objectToFirebase);
      });
    }else {
        if (!validate('RefreshField', parameters)) {
            r.reject('Invalid');
        }
        //validate(parameters)
        sqlInterface.refreshField(UserID, parameters).then(function (rows) {
            objectToFirebase = rows;
            sqlInterface.addToActivityLog(requestObject);
            r.resolve(objectToFirebase);
        });
    }
    return r.promise;
};

exports.logRequest = function (requestObject) {
    console.log('logged request');
};

exports.readMessage = function (requestObject) {
    var r = Q.defer();
    if (!validate('Digit', requestObject)) {
        r.reject('Invalid');
    } else {
        sqlInterface.readMessage(requestObject).then(function (response) {
            sqlInterface.addToActivityLog(requestObject);
            r.resolve(response);
        });
    }
    return r.promise;
};
exports.readNotification = function (requestObject) {
    var r = Q.defer();
    if (!validate('Digit', requestObject)) {
        console.log('digit');
        r.reject('Invalid');
    } else {
        sqlInterface.readNotification(requestObject).then(function (requestObject) {
          sqlInterface.addToActivityLog(requestObject);
          r.resolve(requestObject);
        });
    }
    return r.promise;
};
exports.checkIn = function (requestObject) {
    var r = Q.defer();
    if (!validate(requestObject)) {
        r.reject('Invalid');
    } else {
        sqlInterface.checkIn(requestObject).then(function (requestObject) {
          sqlInterface.addToActivityLog(requestObject);
          r.resolve(requestObject);
        });
    }
    return r.promise;
};

exports.accountChange = function (requestObject) {
    var r = Q.defer();
    if (!validate(requestObject)) {
        r.reject('Invalid');
    } else {
        sqlInterface.updateAccountField(requestObject).then(function (requestObject) {
            sqlInterface.addToActivityLog(requestObject);
            r.resolve(requestObject);
        });
    }
    return r.promise;
};
exports.inputFeedback=function(requestObject)
{
  var r = Q.defer();
  if (!validate(requestObject)) {
      r.reject('Invalid');
  } else {
      sqlInterface.inputFeedback(requestObject).then(function (requestObject) {
          sqlInterface.addToActivityLog(requestObject);
          r.resolve(requestObject);
      });
  }
  return r.promise;
}
exports.logActivity=function(requestObject)
{
  var r = Q.defer();
  if (!validate(requestObject)) {
      r.reject('Invalid');
  } else {
      sqlInterface.logActivity(requestObject).then(function (requestObject) {
          r.resolve(requestObject);
      });
  }
  return r.promise;
}
exports.sendMessage=function(requestObject)
{
  var r = Q.defer();
  if (!validate(requestObject)) {
      r.reject('Invalid');
  } else {

      sqlInterface.sendMessage(requestObject).then(function (objectRequest) {
          sqlInterface.addToActivityLog(requestObject);
          r.resolve(objectRequest);
      });
  }
  return r.promise;
}
