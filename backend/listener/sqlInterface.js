var mysql       = require('mysql');
var filesystem  =require('fs');
var Q           =require('q');
var utility = require('./utility.js');
var queries=require('./queries.js');
var credentials=require('./credentials.js');
var CryptoJS=require('crypto-js');
var buffer=require('buffer');
var http = require('http');
var request = require('request');
var questionnaires = require('./patientQuestionnaires.js');
var timeEstimate = require('./timeEstimate.js');
var exec = require('child_process').exec;





/*var sqlConfig={
 port:'/Applications/MAMP/tmp/mysql/mysql.sock',
 user:'root',
 password:'root',
 database:'QPlusApp',
 dateStrings:true
 };
 /*
 *Connecting to mysql database
 */
var sqlConfig={
    host:credentials.HOST,
    user:credentials.MYSQL_USERNAME,
    password:credentials.MYSQL_PASSWORD,
    database:credentials.MYSQL_DATABASE,
    dateStrings:true
};
console.log(sqlConfig);
/*
 *Re-connecting the sql database, NodeJS has problems and disconnects if inactive,
 The handleDisconnect deals with that
 */
var connection = mysql.createConnection(sqlConfig);

function handleDisconnect(myconnection) {
    myconnection.on('error', function(err) {
        console.log('Re-connecting lost connection');
        connection.destroy();
        connection = mysql.createConnection(sqlConfig);
        handleDisconnect(connection);
        connection.connect();
    });
}

handleDisconnect(connection);

var exports=module.exports={};



//Table mappings and process data functions for results obtained from the database. Exporting function for testing purposes.
var requestMappings=
    {
        'Patient':{
            sql:queries.patientTableFields(),
            processFunction:loadProfileImagePatient,
            numberOfLastUpdated:1
        },
        'Documents':
            {
                sql:queries.patientDocumentTableFields(),
                numberOfLastUpdated:2,
                //processFunction:LoadDocuments,
                table:'Document',
                serNum:'DocumentSerNum'
            },
        'Doctors':{
            sql:queries.patientDoctorTableFields(),
            processFunction:loadImageDoctor,
            numberOfLastUpdated:2
        },
        'Diagnosis':{
            sql:queries.patientDiagnosisTableFields(),
            numberOfLastUpdated:1
        },
        'Questionnaires':{
            sql:queries.patientQuestionnaireTableFields(),
            numberOfLastUpdated:2,
            processFunction:questionnaires.getPatientQuestionnaires

        },
        /*,
         'Messages':{
         sql:queries.patientMessageTableFields(),
         processFunction:LoadAttachments,
         numberOfLastUpdated:1,
         table:'Messages',
         serNum:'MessageSerNum'
         }*/
        'Appointments':
            {
                sql:queries.patientAppointmentsTableFields(),
                numberOfLastUpdated:5,
                processFunction:combineResources,
                table:'Appointment',
                serNum:'AppointmentSerNum'
            },
        'Notifications':
            {
                sql:queries.patientNotificationsTableFields(),
                numberOfLastUpdated:2,
                table:'Notification',
                serNum:'NotificationSerNum'
            },
        'Tasks':
            {
                sql:queries.patientTasksTableFields(),
                numberOfLastUpdated:2
            },
        /*'TreatmentPlanning':
         {
         processFunction:planningStepsAndEstimates,
         numberOfLastUpdated:0
         },*/
        /*'LabTests':{
            sql:queries.patientTestResultsTableFields(),
            numberOfLastUpdated:1
        },*/
        'TxTeamMessages':{
            sql:queries.patientTeamMessagesTableFields(),
            numberOfLastUpdated:2,
            table:'TxTeamMessage',
            serNum:'TxTeamMessageSerNum'
        },
        'EducationalMaterial':{
            sql:queries.patientEducationalMaterialTableFields(),
            processFunction:getEducationTableOfContents,
            numberOfLastUpdated:5,
            table:'EducationalMaterial',
            serNum:'EducationalMaterialSerNum'
        },
        'Announcements':{
            sql:queries.patientAnnouncementsTableFields(),
            numberOfLastUpdated:2,
            table:'Announcement',
            serNum:'AnnouncementSerNum'
        }
    };

exports.getSqlApiMappings = function()
{
    return requestMappings;
};

//Query processing function 
exports.runSqlQuery = function(query, parameters, processRawFunction)
{
    var r = Q.defer();

    var que = connection.query(query, parameters, function(err,rows,fields){
        if (err) r.reject(err);
        if(typeof rows !=='undefined')
        {
            if(processRawFunction&&typeof processRawFunction !=='undefined')
            {
                processRawFunction(rows).then(function(result)
                {
                    r.resolve(result);
                });
            }else{
                //console.log(rows);
                r.resolve(rows);
            }
        }else{
            r.resolve([]);
        }
    });
    return r.promise;
};

//Gets Patient tables based on userID,  if timestamp defined sends requests
//that are only updated after timestamp, third parameter is an array of table names, if not present all tables are gathered
exports.getPatientTableFields = function(userId,timestamp,arrayTables)
{
    var r=Q.defer();
    var timestp=0;
    if(arguments.length>2)
    {
        timestp=timestamp;
    }else if(arguments.length==2)
    {
        timestp=timestamp;
    }
    var objectToFirebase={};
    var index=0;
    Q.all(preparePromiseArrayFields(userId,timestp,arrayTables)).then(function(response){
        if(typeof arrayTables!=='undefined')
        {
            for (var i = 0; i < arrayTables.length; i++) {
                objectToFirebase[arrayTables[i]]=response[index];
                index++;
            }
        }else{
            for (var key in requestMappings) {
                objectToFirebase[key]=response[index];
                index++;
            }
        }
        r.resolve({Data:objectToFirebase,Response:'success'});
    },function(error){
        r.reject({Response:'error',Reason:'Problems querying the database due to '+error});
    });
    return r.promise;
};
//Helper function to format the table, userId and timestamp
function processSelectRequest(table, userId, timestamp)
{
    var r=Q.defer();
    var requestMappingObject = requestMappings[table];
    console.log(requestMappings[table]);
    var date=new Date(0);
    if(typeof timestamp!=='undefined')
    {
        date=new Date(Number(timestamp));
    }
    var paramArray=[userId];
    if(requestMappingObject.numberOfLastUpdated>0){
        for (var i = 0; i < requestMappingObject.numberOfLastUpdated; i++) {
            paramArray.push(date);
        }
    }
    if(requestMappingObject.hasOwnProperty('sql'))
    {
        exports.runSqlQuery(requestMappingObject.sql,paramArray,
            requestMappingObject.processFunction).then(function(rows)
        {
            if (table === 'Questionnaires'){
                console.log(rows);
            }
            r.resolve(rows);
        },function(err)
        {
            r.reject(err);
        });
    }else{
        console.log(requestMappingObject.processFunction);
        requestMappingObject.processFunction(userId,timestamp).then(function(rows)
        {
            console.log('adasdas');
            r.resolve(rows);
        },function(err)
        {
            r.reject(err);
        });
    }

    return r.promise;
}

//Preparing a promise array for later retrieval
function preparePromiseArrayFields(userId,timestamp,arrayTables)
{
    var array=[];
    if(typeof arrayTables!=='undefined')
    {
        for (var i = 0; i < arrayTables.length; i++) {
            array.push(processSelectRequest(arrayTables[i],userId,timestamp));
        }
    }else{
        for (var key in requestMappings) {
            array.push(processSelectRequest(key,userId,timestamp));
        }
    }
    return array;
}

//Update read status for a table
exports.updateReadStatus=function(userId, parameters)
{
    var r= Q.defer();
    table = requestMappings[parameters.Field].table;
    tableSerNum = requestMappings[parameters.Field].serNum;
    id=parameters.Id;
    var query=connection.query(queries.updateReadStatus(),[table,table, tableSerNum, id, table, userId],
        function(error,rows,fields){
            if(error) r.reject({Response:'error',Reason:error});
            r.resolve({Response:'success'});
        });
    return r.promise;
};

//Api call to insert a message into messages table
exports.sendMessage=function(requestObject)
{
    var r=Q.defer();
    connection.query(queries.sendMessage(requestObject),function(error,rows, fields)
    {

        if(error) r.reject({Response:'error',Reason:error});
        r.resolve({Response:'success'});
    });
    return r.promise;
};

//Check if user is already checkedin 
exports.checkCheckinInAria = function(requestObject)
{
    var r = Q.defer();
    var serNum = requestObject.Parameters.AppointmentSerNum;
    var username = requestObject.UserID;
    //Get the appointment aria ser
    getAppointmentAriaSer(username, serNum).then(function(response){
        var ariaSerNum = response[0].AppointmentAriaSer;
        console.log('Appointment aria ser', ariaSerNum);
        //Check using Ackeem's script whether the patient has checked in at the kiosk
        checkIfCheckedIntoAriaHelper(ariaSerNum).then(function(success){
            console.log('the user has checked in ', success);
            //Check in the user into mysql if they have indeed checkedin at kiosk
            if(success) exports.runSqlQuery(queries.checkin(),['Kiosk', serNum, username]);
            r.resolve({Response:'success', Data:{'CheckedIn':success, AppointmentSerNum:serNum}});
        }).catch(function(error){
            //Error occur while checking patient status
            r.reject({Response:'error', Reason:error});
        });
    });
    return r.promise;
};
exports.checkinUpdate = function(requestObject)
{
    var r = Q.defer();
    console.log('hello world');
    connection.query(queries.getAppointmentAriaSer(),[requestObject.UserID,requestObject.Parameters.AppointmentSerNum],function(error,rows,fields)
    {
        if(error||rows.length==0) r.reject({'Response':'error'});
        console.log('AppAriaSerNums',rows);
        var appointmentAriaSer = rows[0].AppointmentAriaSer;
        exports.getTimeEstimate(appointmentAriaSer).then(function(data)
        {
            r.resolve(data);
        }).catch(function(error)
        {
            r.reject({'Response':'Problem resolving time estimate.'});
        });
    });
    // exports.runSqlQuery(queries.getAppointmentAriaSer(),[requestObject.UserID,requestObject.Parameters.AppointmentSerNum], exports.getTimeEstimate).then(
    // function(response)
    // {
    //   console.log(response);
    //   r.resolve({Response:'success',Data:response});
    // }).catch(function(error)
    // {
    //   r.reject({Response:'error',Reason:'Checkin update error due to '+error});
    //});
    return r.promise;
};


//Api call to checkin to an Appointment (Implementation in Aria is yet to be done)
exports.checkIn=function(requestObject)
{
    var r=Q.defer();
    var serNum = requestObject.Parameters.AppointmentSerNum;
    var latitude = requestObject.Parameters.Latitude;
    var longitude = requestObject.Parameters.Longitude;
    var accuracy = requestObject.Parameters.Accuracy;
    var username = requestObject.UserID;
    var session = requestObject.Token;
    var deviceId = requestObject.DeviceId;
    //Getting the appointment ariaSer to checkin to aria
    getAriaPatientId(username).then(function(response){
        var patientId = response[0].PatientId;
        console.log(response, ' patientId', patientId, ' username ', username);
        //Check in to aria using Johns script
        checkIntoAria(patientId,serNum, username).then(function(response){
            if(response)
            {
                console.log('Checked in successfully done in aria', response);
                //If successfully checked in change field in mysql
                var promises = []

                for (var i=0; i!=serNum.length; ++i){
                    console.log(serNum[i]);
                    promises.push(
                        exports.runSqlQuery(queries.checkin(),[session, serNum[i], username])
                            .then(exports.runSqlQuery(queries.logCheckin(),[serNum[i], deviceId,latitude, longitude, accuracy, new Date()])));
                }

                Q.all(promises)
                    .then(function(response){
                        console.log('Checkin done successfully', 'Finished writint to database');
                        r.resolve({Response:'success'});
                    })
                    .catch(function(error){
                        console.log('error checkin dur to', error);
                        r.reject({Response:'error',Reason:'CheckIn error due to '+error});
                    });


            }else{
                r.reject({Response:'error', Reason:'Unable to checkin Aria'});
            }
        }).catch(function(error){
            console.log('Unable to checkin aria',error);
            r.reject({Response:'error', Reason:error});
        });
    }).catch(function(error){
        console.log('Error while grabbing aria ser num', error);
        r.reject({Response:'error', Reason:'Error grabbing aria ser num from aria'+error});
    });
    return r.promise;
};
exports.getDocumentsContent = function(requestObject)
{

    var r = Q.defer();
    var documents = requestObject.Parameters;

    var userID = requestObject.UserID;
    if(!(typeof documents.constructor !=='undefined'&&documents.constructor=== Array)){
        r.reject({Response:'error',Reason:'Not an array'});
    }else{
        console.log('line 370', documents);
        var quer = connection.query(queries.getDocumentsContentQuery(),[[documents],userID],function(err,rows,fields)
        {

            console.log(rows);
            if(err){
                r.reject({Response:'error',Reason:err});
            }else if(rows.length==0)
            {
                r.resolve({Response:'success',Data:'DocumentNotFound'});
            }else{
                LoadDocuments(rows).then(function(documents)
                {
                    if(documents.length==1)r.resolve({Response:'success',Data:documents[0
                        ]});
                    else r.resolve({Response:'success',Data:documents});

                });

            }

        });
    }
    return r.promise;

};
//Updating field in the database tables
exports.updateAccountField=function(requestObject)
{
    var r=Q.defer();
    var UserEmail=requestObject.UserEmail;
    getUserFromEmail(UserEmail).then(function(user)
    {

        var patientSerNum=user.PatientSerNum;
        var field=requestObject.Parameters.FieldToChange;
        var newValue=requestObject.Parameters.NewValue;
        if(field=='Password')
        {
            newValue=CryptoJS.SHA256(newValue);
            connection.query(queries.setNewPassword(newValue,patientSerNum,requestObject.Token),
                function(error, rows, fields)
                {
                    if(error) r.reject({Response:'error',Reason:error});
                    delete requestObject.Parameters.NewValue;
                    r.resolve({Response:'success'});
                });
        }else{
            connection.query(queries.accountChange(patientSerNum,field,newValue,requestObject.Token),
                function(error, rows, fields)
                {
                    if(error) r.reject({Response:'error',Reason:error});
                    r.resolve({Response:'success'});
                });
        }
    });
    return r.promise;
};
//Inputing feedback into feedback table
exports.inputFeedback=function(requestObject)
{
    var r =Q.defer();
    var UserEmail=requestObject.UserEmail;
    getUserFromEmail(UserEmail).then(function(user)
    {
        var quer = connection.query(queries.inputFeedback(),[user.PatientSerNum,requestObject.Parameters.FeedbackContent,requestObject.Parameters.AppRating, requestObject.Token],
            function(error, rows, fields)
            {
                if(error) r.reject({Response:'error',Reason:error});
                r.resolve({Response:'success'});
            });
    });
    return r.promise;
};

/**
 * @module sqlInterface
 * @name updateDeviceIdentifiers
 * @description Updates the device identifer for a particular user and a particular device.
 * @input {object} Object containing the device identifiers
 * @returns {promise} Promise with success or failure.
 */
exports.updateDeviceIdentifier = function(requestObject, parameters)
{
    var r = Q.defer();
    var identifiers = parameters || requestObject.Parameters;
    var deviceType = null;

    console.log(identifiers);

    if (identifiers.deviceType == 'browser') {
        deviceType = 3;
    } else{
        deviceType = (identifiers.deviceType == 'iOS')?0:1;
    }

    var UserEmail = requestObject.UserEmail;
    console.log("Device Type is  ", deviceType);
    getUserFromEmail(UserEmail).then(function(user){
        exports.runSqlQuery(queries.updateDeviceIdentifiers(),[user.PatientSerNum, requestObject.DeviceId, identifiers.registrationId, deviceType,requestObject.Token, identifiers.registrationId, requestObject.Token]).then(function(response){
            r.resolve({Response:'success'});
        }).catch(function(error){
            console.log("UPDATE USER IDENTIFIER requestObject: " + requestObject);
            r.reject({Response:'error', Reason:'Error updating device identifiers due to '+error});
        });
    }).catch(function(error){
        r.reject({Response:'error', Reason:'Error getting patient fields due to '+error});
    });
    return r.promise;

};
//Adding action to activity log
exports.addToActivityLog=function(requestObject)
{
    var r = Q.defer();
    connection.query(queries.logActivity(requestObject),
        function(error, rows, fields)
        {
            if(error) r.reject({Response:'error', Reason:error});
            r.resolve({Response:'success'});

        });
    return r.promise;
};
//Gets user password for encrypting/decrypting
exports.getEncryption=function(requestObject)
{
    var r=Q.defer();
    console.log("USERNAME IS " + requestObject.UserID);
    console.log("ID IS " + requestObject.DeviceId);
    connection.query(queries.userEncryption(),[requestObject.UserID, requestObject.DeviceId],function(error,rows,fields)
    {
        console.log("PASSWORD IS " + rows);
        if(error) {
            console.log("sumtingwong" + error);
            r.reject(error);
        }
        r.resolve(rows);
    });
    return r.promise;
};

exports.inputQuestionnaireAnswers = function(requestObject)
{
    var r = Q.defer();

    var parameters = requestObject.Parameters;
    questionnaires.inputQuestionnaireAnswers(parameters).then(function(patientQuestionnaireSerNum)
    {
        connection.query(queries.setQuestionnaireCompletedQuery(),[patientQuestionnaireSerNum, parameters.DateCompleted, requestObject.Token,parameters.QuestionnaireSerNum],
            function(error, rows, fields){
                if(error) r.reject({Response:'error',Reason:error});
                r.resolve({Response:'success'});
            });
    }).catch(function(error){
        r.reject(error);
    });
    return r.promise;
};
exports.getMapLocation=function(requestObject)
{
    var qrCode=requestObject.Parameters.QRCode;
    var r=Q.defer();
    connection.query(queries.getMapLocation(qrCode),function(error,rows,fields)
    {
        if(error) r.reject({Response:'error', Reason:'Problem fetching maps'});
        r.resolve({Response:'success', Data:{MapLocation:rows[0]}});
    });
    return r.promise;
};
//Api call to get patient fields for password reset
exports.getPatientFieldsForPasswordReset=function(requestObject)
{
    var r=Q.defer();
    //console.log(requestObject, requestObject.DeviceId);

    var UserEmail = requestObject.UserEmail;

    console.log("Inside get getPatientFields",UserEmail);

    connection.query(queries.getPatientFieldsForPasswordReset(),[UserEmail, requestObject.DeviceId],function(error,rows,fields)
    {
        if(error) {
            console.log("Error querying patient fields", error);
            r.reject(error);
        }
        //console.log(rows);
        r.resolve(rows);
    });
    return r.promise;
};
exports.setNewPassword=function(password,patientSerNum)
{
    var r=Q.defer();

    // Create a salt

    // Use pbkdf2 algorithm to hash and store passwords


    connection.query(queries.setNewPassword(),[password,patientSerNum],function(error,rows,fields)
    {
        if(error) r.reject(error);
        r.resolve(rows);
    });
    return r.promise;
};
//Getting planning estimate from Marc's script
exports.planningStepsAndEstimates = function(userId, timestamp)
{
    return planningStepsAndEstimates(userId, timestamp);
};

exports.getPatientDeviceLastActivity=function(userid,device)
{
    var r=Q.defer();
    connection.query(queries.getPatientDeviceLastActivity(userid,device),function(error,rows,fields)
    {
        if(error) r.reject(error);
        r.resolve(rows[0]);
    });
    return r.promise;
};
/**
 *@module sqlInterface
 *@name inputQuestionnaireRating
 *@require queries
 *@descrption Inputs educational material rating
 *@parameter {string} patientSerNum SerNum in database for user that rated the material
 *@parameter {string} edumaterialSerNum serNum for educational material
 *@parameter {string} ratingValue value from 1 to 5 for educational material
 */

exports.inputEducationalMaterialRating = function(requestObject)
{
    var r = Q.defer();
    var parameters = requestObject.Parameters;
    var sql = connection.query(queries.insertEducationalMaterialRatingQuery(),[ parameters.EducationalMaterialControlSerNum,parameters.PatientSerNum, parameters.RatingValue, requestObject.Token],
        function(err,rows,fields){
            if(err) r.reject({Response:'error',Reason:err});
            else r.resolve({Response:'success'});
        });
    return r.promise;
};
exports.updateLogout=function(fields)
{
    var r=Q.defer();
    connection.query(queries.updateLogout(),fields,function(err, rows, fields){
        if(err) r.reject(err);
        r.resolve(rows);
    });
    return r.promise;
};

function getUserFromEmail(email)
{
    var r=Q.defer();
    connection.query(queries.getUserFromEmail(),[email],function(error, rows, fields){
        if(error) r.reject(error);
        r.resolve(rows[0]);
    });
    return r.promise;
}

function LoadDocuments(rows)
{
    /**
     * @ngdoc method
     * @methodOf Qplus Firebase Listener
     *@name LoadImages
     *@description  Uses the q module to make a promise to load images. The promise is resolved after all of them have been read from file system using the fs module. The code continues to run only if the promise is resolved.
     **/
    var imageCounter=0 ;
    var deferred = Q.defer();
    if (rows.length === 0) { deferred.resolve([]); }
    for (var key = 0; key < rows.length; key++)
    {

        var n = rows[key].FinalFileName.lastIndexOf(".");
        var substring=rows[key].FinalFileName.substring(n+1,rows[key].FinalFileName.length);
        rows[key].DocumentType=substring;
        // var/www/Documents/opalAdmin/backend/clinical/documents
        rows[key].Content=filesystem.readFileSync('/var/www/Documents/opalAdmin/backend/clinical/documents/' + rows[key].FinalFileName,'base64');
        imageCounter++;
    }
    deferred.resolve(rows);
    return deferred.promise;
}


//Function toobtain Doctors images
function loadImageDoctor(rows){
    var deferred = Q.defer();
    for (var key in rows){
        if((typeof rows[key].ProfileImage !=="undefined" )&&rows[key].ProfileImage){

            var n = rows[key].ProfileImage.lastIndexOf(".");
            var substring=rows[key].ProfileImage.substring(n+1,rows[key].ProfileImage.length);
            rows[key].DocumentType=substring;
            rows[key].ProfileImage=filesystem.readFileSync(__dirname+'/Doctors/'+rows[key].ProfileImage,'base64' );

        }
    }
    deferred.resolve(rows);
    return deferred.promise;
}

//function to format patient image to base 64
function loadProfileImagePatient(rows){
    var deferred = Q.defer();

    if(rows[0]&&rows[0].ProfileImage && rows[0].ProfileImage!=='')
    {
        var buffer=new Buffer(rows[0].ProfileImage,'hex');
        var base64Buffer=buffer.toString('base64');
        rows[0].DocumentType='jpg';
        rows[0].ProfileImage=base64Buffer;
        deferred.resolve(rows);
        /*var n = rows[0].ProfileImage.lastIndexOf(".");
         var substring=rows[0].ProfileImage.substring(n+1,rows[0].ProfileImage.length);
         rows[0].DocumentType=substring;
         rows[0].ProfileImage=filesystem.readFileSync(__dirname + '/Patients/'+ rows[0].ProfileImage,'base64' );
         deferred.resolve(rows);*/
    }else{
        deferred.resolve(rows);
    }

    return deferred.promise;
}
//Obtains educational material table of contents
function getEducationalMaterialTableOfContents(rows)
{
    var r = Q.defer();
    if(rows.length>0)
    {
        var array=[];
        for (var i = 0; i < rows.length; i++) {
            array.push(exports.runSqlQuery(queries.patientEducationalMaterialContents(), [rows[i].EducationalMaterialControlSerNum]));
        }
        Q.all(array).then(function(results)
        {
            for (var i = 0; i < results.length; i++) {
                rows[i].TableContents=results[i];
            }
            r.resolve(rows);
        });
    }else{
        r.resolve(rows);
    }
    return r.promise;
}

//Obtains the educational material table of contents and adds it to the pertinent materials
function getEducationTableOfContents(rows)
{
    var r = Q.defer();
    var indexes = [];
    var promises =[];
    for (var i = rows.length-1; i >= 0; i--) {
        if(!rows[i].URL_EN || typeof rows[i].URL_EN == 'undefined'|| rows[i].URL_EN.length === 0)
        {
            var array=[];
            for (var j = rows.length-1; j >= 0; j--) {
                if(rows[j].EducationalMaterialSerNum == rows[i].EducationalMaterialSerNum && rows[j].EducationalMaterialControlSerNum !== rows[i].EducationalMaterialControlSerNum)
                {
                    indexes.push(j);
                }
            }
        }
    }
    //Delete
    for (var k = rows.length-1; k >= 0; k--) {
        if(indexes.indexOf(k) !== -1)
        {
            rows.splice(k,1);
        }
    }
    for (var l = 0; l < rows.length; l++) {
        promises.push(exports.runSqlQuery(queries.patientEducationalMaterialContents(),[rows[l].EducationalMaterialControlSerNum] ));
    }
    Q.all(promises).then(
        function(results){
            for (var i = 0; i < results.length; i++) {
                if(results[i].length !== 0)
                {
                    for (var j = 0; j < rows.length; j++) {
                        if(rows[j].EducationalMaterialControlSerNum ==results[i][0].ParentSerNum)
                        {
                            rows[j].TableContents = results[i];
                        }
                    }
                }
            }
            r.resolve(rows);
        }
    ).catch(function(error){r.reject(error);});
    return r.promise;
}
//Attachements for messages, not yet implemented to be added eventually
var LoadAttachments = function (rows )
{

    var messageCounter=0 ;
    var r = Q.defer();
    r.resolve(rows);
    return r.promise;

};

//Get the appointment aria ser num for a particular AppointmentSerNum, Username is passed as a security measure
function getAppointmentAriaSer(username, appSerNum)
{
    return exports.runSqlQuery(queries.getAppointmentAriaSer(),[username, appSerNum]);
}

function getAriaPatientId(username)
{
    return exports.runSqlQuery(queries.getPatientId(),[username]);
}

//Checks user into Aria
function checkIntoAria(patientId, serNum, username)
{
    var r = Q.defer();
    var url = 'http://172.26.66.41/devDocuments/screens/php/checkInPatientAriaMedi.php?CheckinVenue=OPAL%20PHONE%20APP&PatientId='+patientId;
    //making request to checkin
    console.log(url, username, serNum);
    // getAppointmentAriaSer(username, serNum).then(function(res){
    //     console.log(res);
    //     var ariaSerNum = res[0].AppointmentAriaSer;
        request(url,function(error, response, body)
        {
            console.log(response);
            if(error){console.log('line770,sqlInterface',error);r.reject(error);}
            if(!error&&response.statusCode=='200')
            {
                var promises = [];
                for (var i=0; i!=serNum.length; ++i){
                    promises.push(checkIfCheckedIntoAriaHelper(serNum[i]));
                }
                Q.all(promises).then(function(response){
                    r.resolve(response);
                }).catch(function(error){
                    console.log('line778',error);
                    r.reject(error);
                });
                //r.resolve(true);
            }
        });
    // }).catch(function(error){
    //     console.log('line778',error);
    //     r.reject(error);
    // });
    return r.promise;
}

//Check if checked in for an appointment in aria
function checkIfCheckedIntoAriaHelper(patientActivitySerNum)
{
    var r = Q.defer();
    var url = 'http://172.26.66.41/devDocuments/ackeem/getCheckins.php?AppointmentAriaSer='+patientActivitySerNum;
    request(url,function(error, response, body)
    {
        if(error){console.log('line811,sqlInterface',error);r.reject(error);}
        if(!error&&response.statusCode=='200')
        {
            body = JSON.parse(body);
            console.log("checkin checks bro", body);
            if(body.length>0 && body[0].CheckedInFlag == 1) r.resolve(true);
            else r.resolve(false);
        }
    });
    return r.promise;
}
//Get time estimate from Ackeem's scripts
exports.getTimeEstimate = function(appointmentAriaSer)
{
    var r = Q.defer();
    var url = 'http://172.26.66.41/devDocuments/WTSim/api/getEstimate.php?appt_aria_ser='+appointmentAriaSer;
    request(url,function(error, response, body)
    {
        if(error){console.log('getTimeEstimate,sqlInterface',error);r.reject(error);}
        if(!error&&response.statusCode=='200')
        {
            console.log('Time Estimate ', body);
            body = JSON.parse(body);

            if(body.length>1){
                r.resolve(body[0]);
            } else{
                r.reject({Response:'No data from getEstimate script'});
            }
        }else{
            r.resolve(error);
        }
    });
    // timeEstimate.getEstimate(result.AppointmentAriaSer).then(
    //     function(estimate){
    //         r.resolve( estimate);
    //     },function(error)
    //     {
    //       r.resolve(error);
    //   });
    return r.promise;
};
/**
 * @module sqlInterface
 * @name combineResources
 * @method combineResources
 * @parameters {void}
 * @description Modifies all the appointments for the user to only obtain
 */
function combineResources(rows)
{
    var r = Q.defer();
    var resource = {};
    var index = 0;
    if(rows.length>0)
    {
        resource[rows[rows.length-1].ResourceType] = rows[rows.length-1].ResourceName;
        for (var i=rows.length-2;i>=0;i--) {
            if(rows[i].AppointmentSerNum == rows[i+1].AppointmentSerNum)
            {
                resource[rows[i].ResourceType] = rows[i].ResourceName;
                rows.splice(i+1,1);
            }else{
                var resourceObject={};
                for (var key in resource) {
                    resourceObject[key] = resource[key];
                }
                rows[i+1].Resource = resourceObject;
                resource = {};
                resource[rows[i].ResourceType] = rows[i].ResourceName;
                delete rows[i+1].ResourceName;
                delete rows[i+1].ResourceType;
            }
        }
        delete rows[0].ResourceName;
        delete rows[0].ResourceType;
        rows[0].Resource = resource;

    }
    r.resolve(rows);
    return r.promise;
}

function planningStepsAndEstimates (userId, timestamp)
{
    var r = Q.defer();
    //Obtaing patient aria ser num
    var que= connection.query(queries.getPatientAriaSerQuery(),[userId],function(error,rows,fields)
    {
        if(error) r.reject(error);
        var command = 'python3 /var/www/devDocuments/marc/ML_Algorithm_MUHC/predictor.py '+rows[0].PatientAriaSer;
        //Execute Marc's script
        exec(command, function(error, stdout, stderr){
            if (error) {
                r.reject(error);
            }
            stdout = stdout.toString();
            //Parse through the response
            var firstParenthesis = stdout.indexOf('{');
            var lastParenthesis = stdout.lastIndexOf('}');
            var length = lastParenthesis - firstParenthesis+1;
            //Convert into object
            var data = JSON.parse(stdout.substring(firstParenthesis, length).replace(/'/g, "\""));
            //Return data
            r.resolve(data);
        });
    });
    return r.promise;
}

exports.getLabResults = function(requestObject)
{

    var r = Q.defer();
    //var labResults = requestObject.Parameters;

    var userID = requestObject.UserID;
    console.log('Getting LabResults ');
    exports.runSqlQuery(queries.patientTestResultsTableFields(),[userID, requestObject.Timestamp])
        .then(function (queryRows) {
            var labs={};
            labs.labResults = queryRows;
            r.resolve(labs);
        })
        .catch(function (error) {
            r.reject({Response:'error', Reason:'Error getting lab results due to '+error});
        });

    return r.promise;

};

exports.getSecurityQuestion = function (requestObject){
    var r = Q.defer();
    var obj={};
    var Data = {};
    var userEmail = requestObject.UserEmail;
    console.log('Getting Security Question');
    exports.runSqlQuery(queries.getSecQuestion(),[userEmail])
        .then(function (queryRows) {
            console.log(queryRows);
            if (queryRows.length != 1 ) r.reject({Response:'error', Reason:'More or less than one question returned'});
            Data.securityQuestion = queryRows[0].QuestionText;
            obj.Data = Data;
            return exports.runSqlQuery(queries.setDeviceSecurityAnswer(), [queryRows[0].SecurityAnswerSerNum, requestObject.DeviceId])
        })
        .then(function () {
            r.resolve(obj);
        })
        .catch(function (error) {
            r.reject({Response:'error', Reason:'Error getting security question due to '+error});
        });

    return r.promise;
};

// exports.setTrustedDevice = function (requestObject){
//     var r = Q.defer();
//     var obj = {};
//
//     var userID = requestObject.UserID;
//     console.log('Checking for trusted device');
//     exports.runSqlQuery(queries.getTrustedDevice(),[userID, requestObject.DeviceId])
//         .then(function (queryRows) {
//             if (queryRows.length >1 ) r.reject({Response:'error', Reason:'More than one deviceID returned'});
//
//             else if (queryRows.length == 0 || (queryRows.length == 1 && queryRows[0].Trusted == 0)) {
//                 Data.isTrusted = false;
//                 console.log('Device is not trusted. Sending security question');
//                 exports.getSecurityQuestion(requestObject)
//                     .then(function (response) {
//                         Data.securityQuestion = response.securityQuestion;
//                         obj.Data = Data;
//                         console.log(response.securityQuestion[0].SecurityAnswerSerNum);
//                         console.log(requestObject.DeviceId);
//                     })
//                     .catch(function (error) {
//                         r.reject({Response:'error', Reason: error});
//                     })
//             } else {
//                 console.log('Device is trusted');
//                 Data.isTrusted = true;
//                 obj.Data = Data;
//                 r.resolve(obj);
//             }
//
//         })
//         .catch(function (error) {
//             r.reject({Response:'error', Reason:'Error getting security question due to '+error});
//         });
//
//     return r.promise;
// };

exports.setTrusted = function(requestObject)
{

    var r = Q.defer();
    exports.runSqlQuery(queries.setTrusted(),[requestObject.DeviceId])
        .then(function (queryRows) {
            r.resolve({Response:'success'});
        })
        .catch(function (error) {
            r.reject({Response:'error', Reason:'Error getting setting trusted device '+error});
        });

    return r.promise;

};
