var mysql       = require('mysql');
var filesystem  =require('fs');
var Q           =require('q');
var queries=require('./queries.js');
var credentials=require('./credentials.js');
var CryptoJS=require('crypto-js');




/*
*Connecting to mysql database
*
*/

var connection  = mysql.createConnection({
  host:credentials.HOST,
  user:credentials.MYSQL_USERNAME,
  password:credentials.MYSQL_PASSWORD,
  database:credentials.MYSQL_DATABASE
});
                                          // If you're also serving http, display a 503 error.
connection.on('error', function(err) {
  console.log('db error', err);
  if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
    handleDisconnect();                         // lost due to either server restart, or a
  } else {                                      // connnection idle timeout (the wait_timeout
    throw err;                                  // server variable configures this)
  }
});
handleDisconnect();
function handleDisconnect() {
  var connection  = mysql.createConnection({
  host:credentials.HOST,
  user:credentials.MYSQL_USERNAME,
  password:credentials.MYSQL_PASSWORD,
  database:credentials.MYSQL_DATABASE
}); // Recreate the connection, since
                                                  // the old one cannot be reused.

  connection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });
  connection.on('error', function(err) {
  console.log('db error', err);
  if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
    handleDisconnect();                         // lost due to either server restart, or a
  } else {                                      // connnection idle timeout (the wait_timeout
    throw err;                                  // server variable configures this)
  }
});                                     // process asynchronous requests in the meantime.

}
//Changing string to match montreal time
Date.prototype.toISOString = function() {
  var a=this.getTimezoneOffset();

  var offset=a/60;
      return this.getUTCFullYear() +
        '-' + String(this.getUTCMonth() + 1) +
        '-' + this.getUTCDate() +
        'T' + String(this.getUTCHours()-offset) + //
        ':' + this.getUTCMinutes() +
        ':' + this.getUTCSeconds() +
        '.' + (this.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) +
        'Z';
    };
var exports=module.exports={};

exports.refreshField=function(UserID, field)
{
  var r=Q.defer();
  var objectData={};

  if(tableMappings[field])
  {

    var functionField=tableMappings[field];
    functionField(UserID).then(function(fieldObject)
    {

      objectData[field]=fieldObject;
      r.resolve(objectData);
    });
  }else{
    r.reject('Invalid');
  }
  return r.promise;
}
exports.apiRequestField=function(UserID, query, callbackFunction)
{
  connection.query(query, function(err,rows,fields){
    var r=Q.defer();
    if (err) r.reject(error);
    callbackFunction(rows).then(function(rows){
      r.resolve(rows);
    });
  });
  return r.promise;
}
/*
*@name cascadeFunction
*@param(string) UserID The patients user id
@param(string) queue queue of promises to be processed.
@param(startObject) startObject Object to return
@description Takes a queue of promises and executes them all sequentially
*@return (object) Return the object containing the patient information with
for all the fields listed in the queue
*/
exports.cascadeFunction=function(UserID,queue,startObject)
{
  var r=Q.defer();
  if(queue.isEmpty())
  {

    r.resolve(startObject);
  }else{
    var field=queue.dequeue();
    var functionField=tableMappings[field];
    functionField(UserID).then(function(rows){
      startObject[field]=rows;
      r.resolve(exports.cascadeFunction(UserID,queue,startObject));
    });
  }


  return r.promise;
}

exports.getPatient=function(UserID)
{
  var r=Q.defer();
  console.log(queries.patientQuery(UserID));
  connection.query(queries.patientQuery(UserID), function(error, rows, fields)
  {

    if (error) r.reject(error);
    loadProfileImagePatient(rows).then(function(rows){
    r.resolve(rows[0]);
    });
  });
  return r.promise;
}
exports.getPatientDoctors=function(UserID)
{
  var r=Q.defer();
  connection.query(queries.patientDoctorsQuery(UserID),function(error,rows,fields){
      if (error) r.reject(error);
      loadImageDoctor(rows).then(function(rows){
        r.resolve(rows);
      });
  });
  return r.promise;
}
exports.getPatientDiagnoses=function(UserID)
{
  var r=Q.defer();
  connection.query(queries.patientDiagnosesQuery(UserID),function(error,rows,fields){
      if (error) r.reject(error);
      r.resolve(rows);
  });
  return r.promise;
}
exports.getPatientMessages=function(UserID)
{
  var r=Q.defer();
  connection.query(queries.patientMessagesQuery(UserID),function(error,rows,fields){
      if (error) r.reject(error);
      LoadAttachments(rows).then(function(rows){
        r.resolve(rows);
      });
  });
  return r.promise;
}

exports.getPatientAppointments=function(UserID)
{
  var r=Q.defer();
  connection.query(queries.patientAppointmentsQuery(UserID),function(error,rows,fields){
      if (error) r.reject(error);
      r.resolve(rows);
  });
  return r.promise;
}
exports.getPatientDocuments=function(UserID)
{
  var r=Q.defer();
  connection.query(queries.patientDocumentsQuery(UserID),function(error,rows,fields){
      if (error) r.reject(error);
      console.log(error);
      LoadDocuments(rows).then(function(response){
      if(response=='All images were loaded!')
      {
        r.resolve(rows);
      }else{
        r.resolve(response);
      }
        
      });
  });
  return r.promise;
}
exports.getPatientNotifications=function(UserID)
{
  var r=Q.defer();
  connection.query(queries.patientNotificationsQuery(UserID),function(error,rows,fields){
      if (error) r.reject(error);
      r.resolve(rows);
  });
  return r.promise;

}
exports.getPatientTasks=function(UserID)
{
  var r=Q.defer();
  connection.query(queries.patientTasksQuery(UserID),function(error,rows,fields){
      if (error) r.reject(error);
      r.resolve(rows);
  });
  return r.promise;
}
exports.sendMessage=function(objectRequest)
{
  var r=Q.defer();
  connection.query(queries.sendMessage(objectRequest),function(error,rows, fields)
  {

    if(error) r.reject(error);
    r.resolve(objectRequest);
  });
  return r.promise;
}
exports.readMessage=function(requestObject)
{
  var r=Q.defer();
  var serNum=requestObject.Parameters.MessageSerNum;
  connection.query(queries.readMessage(serNum),function(error, rows, fields)
  {
    if(error) r.reject(error);
    r.resolve(requestObject);
  });
  return r.promise;
}
exports.readNotification=function(requestObject)
{
  var r=Q.defer();
  var serNum=requestObject.Parameters.NotificationSerNum;
  connection.query(queries.readNotification(serNum),function(error, rows, fields)
  {
    if(error) r.reject(error);
    r.resolve(requestObject);
  });
  return r.promise;
}

exports.checkIn=function(requestObject)
{
  var r=Q.defer();
  console.log(requestObject);
  var serNum=requestObject.Parameters.AppointmentSerNum;

  connection.query(queries.checkin(serNum),function(error, rows, fields)
  {
    if(error) r.reject(error);
    r.resolve(requestObject);
  });
  return r.promise;
}

exports.updateAccountField=function(requestObject)
{
  var r=Q.defer();
  var UserID=requestObject.UserID;
  console.log(requestObject);
  getPatientFromUserID(UserID).then(function(user)
  {

    var patientSerNum=user.UserTypeSerNum;
    var field=requestObject.Parameters.FieldToChange;
    var newValue=requestObject.Parameters.NewValue;
    if(field=='Password')
    {
      newValue=CryptoJS.SHA256(newValue);
      console.log(newValue);
      connection.query(queries.setNewPassword(newValue,patientSerNum),
      function(error, rows, fields)
      {
        delete requestObject.Parameters.NewValue;
        r.resolve(requestObject);
      });

    }else{
      connection.query(queries.accountChange(patientSerNum,field,newValue),
      function(error, rows, fields)
      {
        r.resolve(requestObject);
      });
    }


  });
  return r.promise;
}

exports.inputFeedback=function(requestObject)
{
  var r =Q.defer();
  var UserID=requestObject.UserID;
  getPatientFromUserID(UserID).then(function(user)
  {
    var userSerNum=user.UserSerNum;
    var content=requestObject.Parameters.FeedbackContent;
    connection.query(queries.inputFeedback(userSerNum,content),
    function(error, rows, fields)
    {
      r.resolve(requestObject);
    });
  });
  return r.promise;
}
exports.addToActivityLog=function(requestObject)
{
  connection.query(queries.logActivity(requestObject),
  function(error, rows, fields)
  {
    console.log(rows);
  });
}
exports.getUsersPassword=function(username)
{
  var r=Q.defer();
  connection.query(queries.userPassword(username),function(error,rows,fields)
  {
    if(error) r.reject(error);
    r.resolve(rows[0].Password);
  });
  return r.promise;
}
exports.logActivity=function(requestObject)
{
  var r =Q.defer();
  connection.query(queries.logActivity(requestObject),
  function(error, rows, fields)
  {
    r.resolve(requestObject);
  });
  return r.promise;
}

exports.getSecurityQuestions=function(PatientSerNum)
{
  var r=Q.defer();
  connection.query(queries.getSecurityQuestions(PatientSerNum),function(error,rows,fields)
  {
    if(error) r.reject(error);
    r.resolve(rows);
  });
  return r.promise;
}
exports.getPatientFieldsForPasswordReset=function(userID)
{
  var r=Q.defer();
  connection.query(queries.getPatientFieldsForPasswordReset(userID),function(error,rows,fields)
  {
    if(error) r.reject(error);
    r.resolve(rows[0]);
  });
  return r.promise;
}
exports.setNewPassword=function(password,patientSerNum)
{
  var r=Q.defer();
  connection.query(queries.setNewPassword(password,patientSerNum),function(error,rows,fields)
  {
    if(error) r.reject(error);
    r.resolve(rows);
  });
  return r.promise;
}
var tableMappings=
{
  'Messages':exports.getPatientMessages,
  'Patient':exports.getPatient,
  'Doctors':exports.getPatientDoctors,
  'Diagnoses':exports.getPatientDiagnoses,
  'Appointments':exports.getPatientAppointments,
  'Notifications':exports.getPatientNotifications,
  'Tasks':exports.getPatientTasks,
  'Documents':exports.getPatientDocuments
};

function getPatientFromUserID(UserID)
{
  var r=Q.defer();
  connection.query(queries.getPatientFromUserId(UserID),function(error, rows, fields){
    if(error) r.reject(error);
    r.resolve(rows[0]);
  });
  return r.promise;
}

var LoadDocuments = function (rows)
{
  /**
  * @ngdoc method
  * @methodOf Qplus Firebase Listener
  *@name LoadImages
  *@description  Uses the q module to make a promise to load images. The promise is resolved after all of them have been read from file system using the fs module. The code continues to run only if the promise is resolved.
  **/
    var imageCounter=0 ;
    var deferred = Q.defer();
    if (Object.keys(rows).length==0) { deferred.resolve('All images were loaded!'); }
    for (var key in rows)
    {

      var n = rows[key].FinalFileName.lastIndexOf(".");
      var substring=rows[key].FinalFileName.substring(n+1,rows[key].FinalFileName.length);
      rows[key].DocumentType=substring;
      rows[key].Content=filesystem.readFileSync(__dirname +  '/Documents/' + rows[key].FinalFileName,'base64' );

      imageCounter++;
      //console.log('imagecounter is : ',imageCounter);
      if (imageCounter == Object.keys(rows).length )
       {
         deferred.resolve(rows);
       }
    }
    return deferred.promise;
};

var LoadAttachments = function (rows )
{
  /**
  * @ngdoc method
  * @methodOf Qplus Firebase Listener
  *@name LoadAttachments
  *@description  Uses the q module to make a promise to load attachments. The promise is resolved after all of them have been read from file system using the fs module. The code continues to run only if the promise is resolved.
  **/
    var messageCounter=0 ;
    var r = Q.defer();
    r.resolve(rows);
    return r.promise;
    /*if (Object.keys(rows).length==0) { deferred.resolve('All attachments were loaded!'); }
    for (var key in rows)
    {
      // It fetches all of the attachment every time a user logs in. Very bad for bandwidth !
      if (rows[key].Attachment && rows[key].Attachment!=="No" )
      {
        rows[key].Attachment=filesystem.readFileSync(__dirname + rows[key].Attachment,'base64' );
      }
      messageCounter++;
      if (messageCounter == Object.keys(rows).length )
       {
         dataObject.Messages= JSON.parse(JSON.stringify(rows));
         deferred.resolve('All attachments were loaded!');
       }
    }
    return deferred.promise;*/
  };

function loadImageDoctor(rows){
  var deferred = Q.defer();
  for (var key in rows){
    console.log(rows[key].ProfileImage.length);
    if((typeof rows[key].ProfileImage !=="undefined" )&&rows[key].ProfileImage){

      var n = rows[key].ProfileImage.lastIndexOf(".");
      var substring=rows[key].ProfileImage.substring(n+1,rows[key].ProfileImage.length);
      rows[key].DocumentType=substring;
      rows[key].ProfileImage=filesystem.readFileSync(__dirname + '/Doctors/'+rows[key].ProfileImage,'base64' );

    }
  }
  deferred.resolve(rows);
  return deferred.promise;
}


function loadProfileImagePatient(rows){
  var deferred = Q.defer();
  if(typeof rows[0].ProfileImage!=='undefined' && rows[0].ProfileImage!=='')
  {
    var n = rows[0].ProfileImage.lastIndexOf(".");
    var substring=rows[0].ProfileImage.substring(n+1,rows[0].ProfileImage.length);
    rows[0].DocumentType=substring;
    rows[0].ProfileImage=filesystem.readFileSync(__dirname + '/Patients/'+ rows[0].ProfileImage,'base64' );
    deferred.resolve(rows);
  }else{
    deferred.resolve(rows);
  }
  
  return deferred.promise;
}

/*function Queue()
{
  var array=[];
  var head=0;
  this.isEmpty:function()
  {
    if(head==0)
    {
      return true;
    }else{
      return false;
    }
  }
  this.enqueue:function(field)
  {
    array.push(field);
    head++;
  }
  this.dequeue:function()
  {
    if(head!=0)
    {
      head--;
      return array[head];
    }else{
      console.log('Queue is empty');
    }
  }
}*/
