var Firebase    =require('firebase');
var mysql       = require('mysql');
var filesystem  =require('fs');
var Q           =require('q');
var CryptoJS      =require('crypto-js');
// Changed the prototype function of the Date method that JSON.stringify uses to parse a datetime into a string, so that it creates a local time.
Date.prototype.toISOString = function() {
      return this.getUTCFullYear() +
        '-' + String(this.getUTCMonth() + 1) +
        '-' + this.getUTCDate() +
        'T' + String(this.getUTCHours()-4) + // The -4 is added to return a Montreal Local Time instead of a UTC Time
        ':' + this.getUTCMinutes() +
        ':' + this.getUTCSeconds() +
        '.' + (this.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) +
        'Z';
    };
// A connection to MySQL is made
var connection  = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  database : 'QplusApp'
});
///////////////////////////////
// functions to encrypt and decrypt objects
var password='';
function encryptObject(object)
{
  for (var key in object)
  {
    if (typeof object[key]=='object')
    {
      encryptObject(object[key]);
    } else
    {
      if (typeof object[key] !=='string') object[key]=String(object[key]);
      var ciphertext = CryptoJS.AES.encrypt(object[key], password);
      object[key]=ciphertext.toString();
    }
  }
};
function decryptRequest(object)
{
      for (var key in object)
      {
        if (typeof object[key]=='object')
        {
          decryptRequest(object[key]);
        } else
        {
          if (key=='UserID')
          {
            object[key]=object[key];
          }
          else
          {
            var decipherbytes = CryptoJS.AES.decrypt(object[key], password);
            object[key]=decipherbytes.toString(CryptoJS.enc.Utf8);
          }
        }
      }
};

//A function to get current time in javascript
function getDateTime() {
  /**
  * @ngdoc method
  * @methodOf Qplus Firebase Listener
  *@name getDateTime
  *@description  Gets the current time and date from the system. This function can be used as a part of all of the dataHandler functions to timestamp user's timestamp sub-field in firebase ,
  *keeping a record of the time of the most recent request of any type. This will help make sure that the most recent request has gone through.
  * If the timestamp doesn't update it means the request has failed and needs to be re-submitted. ( Not used in the code yet).
  *@returns {string} - Current date-time as a string.
  **/
    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;
}
// We watch the 'request' subset of our firebase tree, We filter and handle them on a first-come first-served basis using firebase.on() method of the provided API !
var Ref= new Firebase('https://luminous-heat-8715.firebaseio.com/requests');
Ref.on('child_added',function(childsnapshot,prevchildname)
{
      /**
      * @ngdoc service
      * @name Qplus Firebase Listener
      * @requires mysql - npm install mysql :  node module to connect to MySQL databases.
      * @requires firebase - npm install firebase : node  module that provides firebase's real-time API.
      * @requires fs - Included with node.js :  node module to manipulate the local file system.
      * @requires q - npm install q : node  module for implementing promises(Asynchronous Calls in functions).
      * @requires crypto-js - npm install crypto-js : node  module used for encryption of data.
      * @description
      * The request listener , written in Node.js fits right in with firebase's powerful API.
      * It uses firebase's .on('child_added') Method to watch the "requests" subtree of our Qplus firebase DB.
      * Every time there is a new request submitted to firebase, the listener will read the contents of the request object ( using  .once('value') and snapshot.val() ) and trigger the proper tasks and queries based on it's type ( if statements ).
      * Node's mysql module is used to establish a connection to hospital's MySQL and send queries which will send or receive information ,
      *process it and eventually send back the proper response to firebase which then will be received by the mobile app itself. The most important request is login as it involves the highest amount of data that needs to be fetched and handled. The queries to different tables are nested in each other, Each of them happens after the previous one is successful.
      **/
      var newRequest = "empty"; // -> Type of the new request that is made.
      var userID = "empty"; // -> The UserID who made the new request ( example : simplelogin:77 ).
      var PatientSerNum="";
      var PatientPassword='';
      var dataObject={}; // -> The final Object that is going to hold all of the proper patient data.
      var requestObject = {AppointmentSerNum:' ',DateRange:' ', Reason:' ',ReceiverSerNum:' ',SenderRole:' ',ReceiverRole:' ',MessageContent:' ',SenderSerNum:' ',FieldToChange:' ',NewValue:' ',MessageSerNum:' ',MessageDate:' ',NotificationSerNum:' ',TimeOfDay:'',StartDate:'',EndDate:'',FeedbackContent:''};
      var rows={0:{Password:' '}};
      var AppointmentSerNum=' ';
      var NotificationSerNum=' ';
      var MessageSerNum=' ';
      var SenderSerNum=' ';
      // Read the contents of the request:
      var encryptedRequest=childsnapshot.val();
      if (encryptedRequest['UserID']) // Only Proceed if the request has a UserID field defined.
      {
      connection.query("SELECT Password,PatientSerNum from patient where patient.LoginID LIKE '"+encryptedRequest['UserID']+"'",function (err, rows, fields )
        {
          if (err) throw err;
          console.log("USerID is : ",encryptedRequest['UserID']);
          console.log('Password is : ',JSON.stringify(rows));
          PatientSerNum=rows[0].PatientSerNum;
          password=rows[0].Password;
          decryptRequest(encryptedRequest);
          console.log('I decrypted the object: ',JSON.stringify(encryptedRequest));
            //After decrypting the request , proceed based on it's type :
            newRequest=encryptedRequest['Request'];
            if ( newRequest == 'AccountChange' || newRequest=='AppointmentChange' || newRequest=='Message' || newRequest=='Feedback')
            {
                  requestObject=encryptedRequest['Content'];
            }
            else if (newRequest=='Checkin')
            {
                AppointmentSerNum=encryptedRequest['AppointmentSerNum'];
            }
            else if (newRequest=='NotificationRead')
            {
                NotificationSerNum=encryptedRequest['NotificationSerNum'];
            }
            else if (newRequest=='MessageRead')
            {
                MessageSerNum=encryptedRequest['MessageSerNum'];
            } else
            {
              console.log('Other type of request !!');
            }

            console.log(newRequest);
            userID=encryptedRequest['UserID'];
            console.log(userID);
      var newRef=new Firebase('https://luminous-heat-8715.firebaseio.com/users').child(String(userID));
      var LoginDataHandler= function ()
      {
        /**
        * @ngdoc method
        * @methodOf Qplus Firebase Listener
        *@name loginDataHandler
        *@description  Sends data to firebase as a response to a login request.
        **/
        var updateToFirebase={};
        dataObject['login']='true';
        dataObject['checkin']='false';
        updateToFirebase[String(userID)]=dataObject;
        newRef.parent().update(updateToFirebase);
      };
      var CheckinDataHandler= function ()
      {
        /**
        * @ngdoc method
        * @methodOf Qplus Firebase Listener
        *@name CheckinDataHandler
        *@description  Sends data to firebase as a response to a checkin request.
        **/
         newRef.update({checkin:'true'});
      };
      var LogoutDataHandler= function ()
      {
        /**
        * @ngdoc method
        * @methodOf Qplus Firebase Listener
        *@name LogoutDataHandler
        *@description  Sends data to firebase as a response to a logout request.
        **/
         newRef.update({login:'false'});
       };
      var AppointmentChangeDataHandler= function ()
      {
        /**
        * @ngdoc method
        * @methodOf Qplus Firebase Listener
        *@name AppointmentChangeDataHandler
        *@description  Sends data to firebase as a response to a change of appointment request.
        **/
       } ;
      var AccountChangeDataHandler= function ()
      {
        /**
        * @ngdoc method
        * @methodOf Qplus Firebase Listener
        *@name AccountChangeDataHandler
        *@description  Sends data to firebase as a response to a change of account information request.
        **/
       } ;
      var MessageDataHandler= function ()
      {
        /**
        * @ngdoc method
        * @methodOf Qplus Firebase Listener
        *@name MessageDataHandler
        *@description  Sends data to firebase as a response to a message delivery request.
        **/
      } ;
      var MessageReadDataHandler= function ()
      {
        /**
        * @ngdoc method
        * @methodOf Qplus Firebase Listener
        *@name MessageReadDataHandler
        *@description  Sends data to firebase as a response to a message read request.
        **/
      } ;
      var NotificationReadDataHandler= function ()
      {
        /**
        * @ngdoc method
        * @methodOf Qplus Firebase Listener
        *@name NotificationReadDataHandler
        *@description  Sends data to firebase as a response to a notification read request.
        **/
      } ;
      var FeedbackDataHandler= function ()
      {
        /**
        * @ngdoc method
        * @methodOf Qplus Firebase Listener
        *@name FeedbackDataHandler
        *@description  Sends data to firebase as a response to a Feedback message request.
        **/
      } ;
      var RefreshDataHandler= function ()
      {
        /**
        * @ngdoc method
        * @methodOf Qplus Firebase Listener
        *@name RefreshDataHandler
        *@description  Sends data to firebase as a response to a information refresh request.
        **/
        var FeedRef= new Firebase('https://luminous-heat-8715.firebaseio.com/Feedback');
        FeedRef.update({UserID : {LastRefreshTime : getDateTime() }});
      } ;
      var completeRequest= function (dataHandlerFunction,user,request)
      {
          /**
          * @ngdoc method
          * @methodOf Qplus Firebase Listener
          *@name completeRequest
          *@param {function}  dataHandlerFunction - a function that sends data feedback based on the type of the request
          *@param {string} UserID - A user's firebase login id
          *@param {string} Request - Type of the request that's being processed
          *@description  Calls the corresponding datahandler function and logs the activity in MySQL's activitylog table. It will remove the submitted request from the firebase subtree after it's processed successfully.
          **/
         	//Send feedback to firebase
          dataHandlerFunction();
          //Log the activity in MySQL
          console.log('Im going to log this activity: ', user,request);
          if ( typeof user !== undefined && typeof request !== undefined && user!==null)
           {
               connection.query("INSERT INTO patientactivitylog (`ActivitySerNum`,`PatientSerNum`, `ActivityType`,`ActivityDescription` ,`ActivityDateTime`,`LastUpdated`) VALUES (NULL,'"+PatientSerNum+ "', '"+request+"','no description',CURRENT_TIMESTAMP ,CURRENT_TIMESTAMP )", function(err, rows, fields)
               {
                  if (err) throw err;
                  // Remove the Request from firebase
                  Ref.child(String(childsnapshot.key())).set(null);
                });
            } else { console.log('That is a Bad Activity !'); }
      };
      //Proceed based on the type of the request :
///////////////////////////////////////////////////////////////
      if (newRequest=="MessageRead" )
      {
        console.log('MessageSerNum: is : ',MessageSerNum);
        var MessageReadQuery="UPDATE `messages` SET ReceiverReadStatus=1 WHERE messages.MessageSerNum='"+MessageSerNum+"'";
        console.log(MessageReadQuery);
        connection.query(MessageReadQuery,function (err, rows, fields )
        {
          if (err) throw err ;
          completeRequest(MessageReadDataHandler,userID,newRequest);
        });
      }
///////////////////////////////////////////////////////////////
      else if (newRequest=="NotificationRead" )
      {
        connection.query("UPDATE patientnotifications SET ReadStatus=1 WHERE `patientnotifications`.`NotificationSerNum`='"+NotificationSerNum+"'",function (err, rows, fields )
        {
          if (err) throw err ;
          completeRequest(NotificationReadDataHandler,userID,newRequest);
        });

      }
///////////////////////////////////////////////////////////////
      else if (newRequest=="Checkin" )
      {
        console.log('checking in for the Appointment : ',AppointmentSerNum);
        connection.query("UPDATE appointment SET Checkin=1 WHERE appointment.Checkin=0 AND appointment.AppointmentSerNum='"+AppointmentSerNum+"'",function (err, rows, fields )
        {
            if (err) throw err ;
            completeRequest(CheckinDataHandler,userID,newRequest);
            // Write MSSQL Query to Checkin to ARIA
            //* * *
            //HERE
            //* * *
        });
      }
///////////////////////////////////////////////////////////////
      else if (newRequest=="AccountChange" )
      {
        if (requestObject.FieldToChange=="TelNum")
        {
          requestObject.FieldToChange=="TelNumForSMS";
        }
          var ChangeSQL="UPDATE patient SET "+requestObject.FieldToChange+"='"+requestObject.NewValue+"' WHERE LoginID LIKE '"+userID+"'";
        console.log("Account Change Query is : \n ",ChangeSQL);
        connection.query(ChangeSQL,function (err,rows,fields)
        {
          if (err) throw err;
          completeRequest(AccountChangeDataHandler,userID,newRequest);
        });
      }
///////////////////////////////////////////////////////////////
      else if (newRequest=="AppointmentChange" )
      {
        var AppointmentChangeSQL="INSERT INTO appointmentchangerequests "+
        "(`RequestSerNum`,"+
        " `AppointmentSerNum`,"+
        " `PreferredStartDate`,"+
        "`PreferredEndDate`,"+
        "`PatientSerNum`,`TimeOfDay`)"+
        " VALUES (NULL,'"+
         requestObject.AppointmentSerNum + "','"+
         requestObject.StartDate +"','"+
         requestObject.EndDate +"','"+
         PatientSerNum +"','"+
         requestObject.TimeOfDay +
         "') "
          console.log(AppointmentChangeSQL);
          connection.query(AppointmentChangeSQL, function(err, rows, fields)
          {
              if (err) throw err;
              // Mark the appointment to indicate that a change has already been requested by the patient.
              connection.query(" UPDATE appointment SET ChangeRequest=1 WHERE appointment.ChangeRequest=0 AND appointment.AppointmentSerNum='"+
              requestObject.AppointmentSerNum+"'" ,function(err, rows, fields)
              {
                completeRequest(AppointmentChangeDataHandler,userID,newRequest);
              });
          });
      }
///////////////////////////////////////////////////////////////
      else if (newRequest=="Logout" )
      {
        completeRequest(LogoutDataHandler,userID,newRequest);
      }
//////////////////////////////////////////////////////////////
      else if (newRequest=="Feedback" )
      {
        connection.query("INSERT INTO feedback (`FeedbackSerNum`,`PatientSerNum`,`FeedbackContent`,`LastUpdated`) VALUES (NULL,'"+PatientSerNum+"','"+ requestObject.FeedbackContent + "',"+"CURRENT_TIMESTAMP )", function(err, rows, fields)
        {
          if (err) throw err;
          completeRequest(FeedbackDataHandler,userID,newRequest);
        });
      }
///////////////////////////////////////////////////////////////
      else if (newRequest=="Message" )
      {
            connection.query("INSERT INTO messages (`MessageSerNum`, `SenderRole`,`ReceiverRole`, `SenderSerNum`, `ReceiverSerNum`,`MessageContent`,`ReceiverReadStatus`,`MessageDate`,`LastUpdated`) VALUES (NULL,'"+requestObject.SenderRole+"','"+ requestObject.ReceiverRole + "', '"+requestObject.SenderSerNum+"','"+ requestObject.ReceiverSerNum +"','" +requestObject.MessageContent+"',0,'"+requestObject.MessageDate+"' ,CURRENT_TIMESTAMP )", function(err, rows, fields)
            {
                if (err) throw err;
                completeRequest(MessageDataHandler,userID,newRequest);
            });
      }
///////////////////////////////////////////////////////////////
      else if (newRequest=="Login" || newRequest=="Refresh")
      {
        console.log('it was a Login Request so im doing it');
        // Get the basic patient information . !!!!(( We Should maybe make this independant of the fields later ))!!!!
        // We query different tables in the QplusApp database to gather all the relevant patient information and save them to dataObject.
        connection.query('SELECT ' +
                            'patient.PatientSerNum,' +
                            'patient.FirstName, ' +
                            'patient.LastName,' +
                            'patient.Alias,' +
                            'patient.TelNumForSMS,' +
                            'patient.Email,' +
                            'patient.Language,' +
                            'patient.LoginID,' +
                            'patient.Password,' +
                            'patient.EnableSMS ' +
                          'From ' +
                            'patient '+
                          'WHERE '+
                            'patient.LoginID Like '+"\'"+ userID+"\'", function(err, rows, fields)
                            {
                            if (err) throw err;
                              dataObject.Patient= // Maybe you should return !?
                              {
                              PatientSerNum   : rows[0].PatientSerNum,
                              FirstName       : rows[0].FirstName,
                              LastName        : rows[0].LastName,
                              Alias           : rows[0].Alias,
                              TelNum          : rows[0].TelNumForSMS,
                              Email           : rows[0].Email,
                              LoginID         : rows[0].LoginID,
                              Language        : rows[0].Language,
                              EnableSMS       : rows[0].EnableSMS,
                              };
                              // Use crypto-js to create a Hash of the password and use that as the encryption passkey,Right now we are using the password itself.
                              PatientPassword = rows[0].Password ;
                              password = PatientPassword;
                              PatientSerNum   = rows[0].PatientSerNum ;
                              // Query the patient's Doctors and their information
                              connection.query('SELECT '+
                                                  'doctor.FirstName, '+
                                                  'doctor.LastName, '+
                                                  'doctor.DoctorSerNum, '+
                                                  'patientdoctor.PrimaryFlag, '+
                                                  'patientdoctor.OncologistFlag, '+
                                                  'doctor.Email, '+
                                                  'doctor.Phone, '+
                                                  'doctor.Address '+
                                                  'FROM '+
                                                    'doctor, '+
                                                    'patientdoctor, '+
                                                    'patient '+
                                                  'WHERE '+
                                                    'patient.LoginID Like '+ "'" + userID +"'" +
                                                   ' AND '+
                                                    'patientdoctor.PatientSerNum = patient.PatientSerNum AND '+
                                                    'doctor.DoctorSerNum = patientdoctor.DoctorSerNum', function(err, rows, fields)
                              {
                                // We use JSON.stringify and JSON.parse to get a object output instead of the initial Array .
                              dataObject.Doctors = JSON.parse(JSON.stringify(rows));
                              //Query for Diagnosis
                              connection.query('SELECT '+
                                                  'diagnosis.Description_EN, '+
                                                  'diagnosis.Description_FR '+
                                                  'FROM '+
                                                    'diagnosis, '+
                                                    'patient '+
                                                  'WHERE '+
                                                    'patient.LoginID Like '+ "'" + userID +"'" +
                                                   ' AND '+
                                                    'diagnosis.PatientSerNum = patient.PatientSerNum', function(err, rows, fields)
                              {
                              dataObject.Diagnosis = JSON.parse(JSON.stringify(rows));
                              console.log('it was a Login Request im in the middle data object is ',JSON.stringify(dataObject));
                              //Next query is for loading patient-doctor or patient-admin messages ( including file attachments)
                              connection.query('SELECT '+
                                                  'messages.MessageSerNum, '+
                                                  'messages.SenderRole, '+
                                                  'messages.ReceiverRole, '+
                                                  'messages.SenderSerNum, '+
                                                  'messages.ReceiverSerNum, '+
                                                  'messages.MessageContent, '+
                                                  'messages.ReceiverReadStatus AS ReadStatus, '+
                                                  'messages.MessageDate '+
                                                  'FROM '+
                                                    'messages, '+
                                                    'patient '+
                                                  'WHERE '+
                                                    '(patient.LoginID Like '+ "'" + userID +"' )" +
                                                   ' AND '+
                                                    "( (messages.ReceiverRole='Patient' AND patient.PatientSerNum = messages.ReceiverSerNum) OR (messages.SenderRole='Patient' AND patient.PatientSerNum = messages.SenderSerNum) )", function(err, rows, fields)
                              {
                              // ReadStatus is always 1 for the sender itself ! :
                              for (var key in rows)
                              {
                                if (PatientSerNum!==rows[key].ReceiverSerNum)
                                {
                                  rows[key].ReadStatus=1;
                                }
                              }
                              var LoadAttachments = function ()
                              {
                                /**
                                * @ngdoc method
                                * @methodOf Qplus Firebase Listener
                                *@name LoadAttachments
                                *@description  Uses the q module to make a promise to load attachments. The promise is resolved after all of them have been read from file system using the fs module. The code continues to run only if the promise is resolved.
                                **/
                                  var messageCounter=0 ;
                                  var deferred = Q.defer();
                                  if (Object.keys(rows).length==0) { deferred.resolve('All attachments were loaded!'); }
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
                                  return deferred.promise;
                                };
                                // Appointments :
                                LoadAttachments().then(function () { connection.query('SELECT '+
                                                    'aliasexpression.ExpressionName AS AppointmentType, '+
                                                    'appointment.ScheduledStartTime, '+
                                                    'appointment.AppointmentSerNum, '+
                                                    'appointment.ScheduledEndTime, '+
                                                    'appointment.Location, '+
                                                    'appointment.Checkin, '+
                                                    'appointment.ChangeRequest, '+
                                                    'resource.ResourceName '+
                                                  'From '+
                                                    'appointment, '+
                                                    'aliasexpression, '+
                                                    'resource, '+
                                                    'patient '+
                                                  'WHERE '+
                                                    'resource.ResourceSerNum = appointment.ResourceSerNum AND '+
                                                    'patient.PatientSerNum = appointment.PatientSerNum AND '+
                                                    'aliasexpression.AliasExpressionSerNum=appointment.AliasExpressionSerNum AND '+
                                                    'patient.LoginID Like '+"'"+ userID+"'", function(err, rows, fields)
                              {
                              if (err) throw err;
                              dataObject.Appointments= JSON.parse(JSON.stringify(rows));
                              //Query the images
                              connection.query('SELECT '+
                                                  'patientimages.ImagePathLocation, '+
                                                  'patientimages.ImageHospitalDescription_FR, '+
                                                  'patientimages.ImageHospitalDescription_EN, '+
                                                  'patientimages.ImageHospitalName_EN, '+
                                                  'patientimages.ImageHospitalName_FR '+
                                                'From '+
                                                  'patientimages,'+
                                                  'patient '+
                                                'WHERE '+
                                                  'patient.PatientSerNum = patientimages.PatientSerNum AND '+
                                                  'patient.LoginID Like '+"\'"+ userID+"\'", function(err, rows, fields)
                              {
                              if (err) throw err;
                              var LoadImages = function ()
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
                                    rows[key].Content=filesystem.readFileSync(__dirname + rows[key].ImagePathLocation,'base64' );
                                    imageCounter++;
                                    console.log('imagecounter is : ',imageCounter);
                                    if (imageCounter == Object.keys(rows).length )
                                     {
                                       dataObject.Images= JSON.parse(JSON.stringify(rows));
                                       deferred.resolve('All images were loaded!');
                                     }
                                  }
                                  return deferred.promise;
                              };
                              // Query for notifications after Images are loaded
                              LoadImages().then( function () {
                                connection.query('SELECT '+
                                                    'patientnotifications.NotificationSerNum, '+
                                                    'patientnotifications.NotificationName_FR, '+
                                                    'patientnotifications.NotificationName_EN, '+
                                                    'patientnotifications.NotificationContent_FR, '+
                                                    'patientnotifications.NotificationContent_EN, '+
                                                    'patientnotifications.ReadStatus, '+
                                                    'patientnotifications.DateTime, '+
                                                    'resource.ResourceName AS IssuedBy '+
                                                  'From '+
                                                    'patientnotifications, '+
                                                    'patient, '+
                                                    'resource '+
                                                  'WHERE '+
                                                    'patient.PatientSerNum = patientnotifications.PatientSerNum AND '+
                                                    'resource.ResourceSerNum = patientnotifications.ResourceSerNum AND '+
                                                    'patient.LoginID Like '+"\'"+ userID+"\'", function(err, rows, fields)
                              {
                              if (err) throw err;
                                dataObject.Notifications= JSON.parse(JSON.stringify(rows));
                                //console.log('it was a Login Request after notifications data object is ',JSON.stringify(dataObject));
                                connection.query('SELECT '+
                                                    'aliasexpression.ExpressionName AS TaskName, '+
                                                    'task.DueDateTime '+
                                                  'From '+
                                                    'task, '+
                                                    'aliasexpression, '+
                                                    'patient '+
                                                  'WHERE '+
                                                    'patient.PatientSerNum = task.PatientSerNum AND ' +
                                                    'aliasexpression.AliasExpressionSerNum = task.AliasExpressionSerNum AND '+
                                                    'patient.LoginID Like '+"\'"+ userID+"\'", function(err, rows, fields)
                                                    {
                                                    if (err) throw err;
                                                      dataObject.Tasks= JSON.parse(JSON.stringify(rows));
                                                              console.log('dataObject right now : \n');
                                                              console.log(JSON.stringify(dataObject));
                                                              // !!!!!!!!!!!!!!!!!!!!  ENCRYPTION HAPPENS HERE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                                                              encryptObject(dataObject);
                                                              completeRequest(LoginDataHandler,userID,newRequest);
                              });
                              });
                            });
                            });
                            });
                            });
                            });
                            });
                            });
                            });
      }
    });
  }
});
