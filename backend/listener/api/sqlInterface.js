const mysql             = require('mysql');
const filesystem        = require('fs');
const Q                 = require('q');
const queries           = require('./../sql/queries.js');
const config            = require('./../config.json');
const request           = require('request');
const questionnaires    = require('./../questionnaires/patientQuestionnaires.js');
const Mail              = require('./../mailer/mailer.js');
const utility           = require('./../utility/utility');
const logger            = require('./../logs/logger');


var exports = module.exports = {};

/******************************
 * CONFIGURATIONS
 ******************************/
const dbCredentials = {
	connectionLimit: 10,
	host: config.HOST,
	user: config.MYSQL_USERNAME,
	password: config.MYSQL_PASSWORD,
	database: config.MYSQL_DATABASE,
	dateStrings: true
};

/**
 * SQL POOL CONFIGURATION
 * @type {Pool}
 */
const pool = mysql.createPool(dbCredentials);

/////////////////////////////////////////////////////

/******************************
 * MAPPINGS
 ******************************/

/**
 * Table mappings and process data functions for results obtained from the database. Exporting function for testing purposes.
 * @type {{Patient: {sql, processFunction: loadProfileImagePatient, numberOfLastUpdated: number}, Documents: {sql, numberOfLastUpdated: number, table: string, serNum: string}, Doctors: {sql, processFunction: loadImageDoctor, numberOfLastUpdated: number}, Diagnosis: {sql, numberOfLastUpdated: number}, Questionnaires: {sql, numberOfLastUpdated: number, processFunction: *}, Appointments: {sql, numberOfLastUpdated: number, processFunction: combineResources, table: string, serNum: string}, Notifications: {sql, numberOfLastUpdated: number, table: string, serNum: string}, Tasks: {sql, numberOfLastUpdated: number}, LabTests: {sql, numberOfLastUpdated: number}, TxTeamMessages: {sql, numberOfLastUpdated: number, table: string, serNum: string}, EducationalMaterial: {sql, processFunction: getEducationTableOfContents, numberOfLastUpdated: number, table: string, serNum: string}, Announcements: {sql, numberOfLastUpdated: number, table: string, serNum: string}}}
 */
const requestMappings =
    {
        'Patient': {
            sql: queries.patientTableFields(),
            processFunction: loadProfileImagePatient,
            numberOfLastUpdated: 1
        },
        'Documents': {
            sql: queries.patientDocumentTableFields(),
            numberOfLastUpdated: 2,
            //processFunction:LoadDocuments,
            table: 'Document',
            serNum: 'DocumentSerNum'
        },
        'Doctors': {
            sql: queries.patientDoctorTableFields(),
            processFunction: loadImageDoctor,
            numberOfLastUpdated: 2
        },
        'Diagnosis': {
            sql: queries.patientDiagnosisTableFields(),
            numberOfLastUpdated: 1
        },
        'Questionnaires': {
            sql: queries.patientQuestionnaireTableFields(),
            numberOfLastUpdated: 2,
            processFunction: questionnaires.getPatientQuestionnaires

        },
        'Appointments': {
            sql: queries.patientAppointmentsTableFields(),
            numberOfLastUpdated: 5,
            processFunction: combineResources,
            table: 'Appointment',
            serNum: 'AppointmentSerNum'
        },
        'Notifications': {
            sql: queries.patientNotificationsTableFields(),
            numberOfLastUpdated: 2,
            table: 'Notification',
            serNum: 'NotificationSerNum'
        },
        'Tasks': {
            sql: queries.patientTasksTableFields(),
            numberOfLastUpdated: 2
        },
        'LabTests': {
            sql: queries.patientTestResultsTableFields(),
            numberOfLastUpdated: 1
        },
        'TxTeamMessages': {
            sql: queries.patientTeamMessagesTableFields(),
            numberOfLastUpdated: 2,
            table: 'TxTeamMessage',
            serNum: 'TxTeamMessageSerNum'
        },
        'EducationalMaterial': {
            sql: queries.patientEducationalMaterialTableFields(),
            processFunction: getEducationTableOfContents,
            numberOfLastUpdated: 5,
            table: 'EducationalMaterial',
            serNum: 'EducationalMaterialSerNum'
        },
        'Announcements': {
            sql: queries.patientAnnouncementsTableFields(),
            numberOfLastUpdated: 2,
            table: 'Announcement',
            serNum: 'AnnouncementSerNum'
        }
    };


//////////////////////////////////////////////////////////////////

/******************************
 * FUNCTIONS
 ******************************/

/**
 * getSqlApiMapping
 * @return {{Patient: {sql, processFunction: loadProfileImagePatient, numberOfLastUpdated: number}, Documents: {sql, numberOfLastUpdated: number, table: string, serNum: string}, Doctors: {sql, processFunction: loadImageDoctor, numberOfLastUpdated: number}, Diagnosis: {sql, numberOfLastUpdated: number}, Questionnaires: {sql, numberOfLastUpdated: number, processFunction: *}, Appointments: {sql, numberOfLastUpdated: number, processFunction: combineResources, table: string, serNum: string}, Notifications: {sql, numberOfLastUpdated: number, table: string, serNum: string}, Tasks: {sql, numberOfLastUpdated: number}, LabTests: {sql, numberOfLastUpdated: number}, TxTeamMessages: {sql, numberOfLastUpdated: number, table: string, serNum: string}, EducationalMaterial: {sql, processFunction: getEducationTableOfContents, numberOfLastUpdated: number, table: string, serNum: string}, Announcements: {sql, numberOfLastUpdated: number, table: string, serNum: string}}}
 */
exports.getSqlApiMappings = function() {
    return requestMappings;
};


/**
 * runSqlQuery
 * @desc runs inputted query against SQL mapping by grabbing an available connection from connection pool
 * @param query
 * @param parameters
 * @param processRawFunction
 * @return {Promise}
 */
exports.runSqlQuery = function(query, parameters, processRawFunction) {
    let r = Q.defer();

    pool.getConnection(function(err, connection) {
        if(err) logger.log('error', err);
        logger.log('debug', 'grabbed connection: ' + connection);
        logger.log('info', 'Successfully grabbed connection from pool and about to perform following query: ', {query: query});

        const que = connection.query(query, parameters, function (err, rows, fields) {
            connection.release();

            logger.log('info', 'Successfully performed query', {query: que.sql, response: JSON.stringify(rows)});

            if (err) r.reject(err);
            if (typeof rows !== 'undefined') {
                if (processRawFunction && typeof processRawFunction !== 'undefined') {
                    processRawFunction(rows).then(function (result) {
                        r.resolve(result);
                    });
                } else {
                    r.resolve(rows);
                }
            } else {
                r.resolve([]);
            }
        });
    });
    return r.promise;
};

/**
 * getPatientTableFields
 * @desc Gets Patient tables based on userID,  if timestamp defined sends requests that are only updated after timestamp, third parameter is an array of table names, if not present all tables are gathered
 * @param userId
 * @param timestamp
 * @param arrayTables
 * @return {Promise}
 */
exports.getPatientTableFields = function(userId,timestamp,arrayTables) {
    const r = Q.defer();
    var timestp = (timestamp)?timestamp:0;
    const objectToFirebase = {};
    let index = 0;
    Q.all(preparePromiseArrayFields(userId,timestp,arrayTables)).then(function(response){
        if(arrayTables) {
            for (let i = 0; i < arrayTables.length; i++) {
                objectToFirebase[arrayTables[i]]=response[index];
                index++;
            }
        }else{
            for (const key in requestMappings) {
                objectToFirebase[key]=response[index];
                index++;
            }
        }
        r.resolve({Data:objectToFirebase,Response:'success'});
    },function(error){
        logger.log('error', 'Problems querying the database due to ' + error);
        r.reject({Response:'error',Reason:'Problems querying the database due to ' + error});
    });
    return r.promise;
};

/**
 * processSelectRequest
 * @desc Gets the correct request mapping object and runs the query against the sql function
 * @param table
 * @param userId
 * @param timestamp
 * @return {Promise}
 */
function processSelectRequest(table, userId, timestamp) {
    const r = Q.defer();
    const requestMappingObject = requestMappings[table];

    let date = new Date(0);
    if(timestamp) {
        date=new Date(Number(timestamp));
    }

    const paramArray = [userId];
    if(requestMappingObject.numberOfLastUpdated>0){
        for (let i = 0; i < requestMappingObject.numberOfLastUpdated; i++) {
            paramArray.push(date);
        }
    }

    if(requestMappingObject.hasOwnProperty('sql')) {
        exports.runSqlQuery(requestMappingObject.sql,paramArray, requestMappingObject.processFunction).then(function(rows) {
            if (table === 'Questionnaires'){  }
            r.resolve(rows);
        },function(err) {
            r.reject(err);
        });
    }else{
        requestMappingObject.processFunction(userId,timestamp).then(function(rows) {
            r.resolve(rows);
        },function(err) {
            r.reject(err);
        });
    }

    return r.promise;
}

/**
 * preparePromiseArrayFields
 * @desc Preparing a promise array for later retrieval
 * @param userId
 * @param timestamp
 * @param arrayTables
 * @return {Array}
 */
function preparePromiseArrayFields(userId,timestamp,arrayTables) {
    const array = [];
    if(typeof arrayTables!=='undefined')
    {
        for (let i = 0; i < arrayTables.length; i++) {
            array.push(processSelectRequest(arrayTables[i],userId,timestamp));
        }
    }else{
        for (const key in requestMappings) {
            array.push(processSelectRequest(key,userId,timestamp));
        }
    }
    return array;
}

/**
 * updateReadStatus
 * @desc Update read status for a table
 * @param userId
 * @param parameters
 * @return {Promise}
 */
exports.updateReadStatus=function(userId, parameters)
{
    let r = Q.defer();
    let table, tableSerNum;
    if(parameters && parameters.Field && parameters.Id && requestMappings.hasOwnProperty(parameters.Field) ) {
        ({table, tableSerNum} = requestMappings[parameters.Field]);
    }else{
	    r.reject({Response:'error',Reason:'Invalid read status field'});
    }
	exports.runSqlQuery(queries.updateReadStatus(),[table,table, tableSerNum, id, table, userId])
    .then(()=>{
	    r.resolve({Response:'success'});
    }).catch((err)=>{
		r.reject({Response:'error',Reason:err});
    });
    return r.promise;
};

/**
 * sendMessage
 * @desc inserts a message into messages table
 * @param requestObject
 * @return {Promise}
 */
exports.sendMessage=function(requestObject) {
	return exports.runSqlQuery(queries.sendMessage(requestObject));
};


/**
 * CHECKIN FUNCTIONALITY
 * ============================================================
 */

/**
 * checkIn
 * @desc checks into aria and then logs the check in status to db
 * @param requestObject
 * @return {Promise}
 */
exports.checkIn=function(requestObject) {
    const r = Q.defer();
    const patientId = requestObject.Parameters.PatientId;
    const patientSerNum = requestObject.Parameters.PatientSerNum;

    hasAlreadyAttemptedCheckin(patientSerNum)
        .then(result => {
            if(result === false){
                //Check in to aria using Johns script
                checkIntoAriaAndMedi(patientId).then(() => {
                    //If successfully checked in, grab all the appointments that have been checked into in order to notify app
                    getCheckedInAppointments(patientSerNum)
                        .then(appts => r.resolve(appts))
                        .catch(err => r.reject({Response:'error', Reason:'CheckIn error due to '+ err}));
                }).catch(error => r.reject({Response:'error', Reason:error}));
            } else r.resolve([]);
        }).catch(err=> r.reject({Response:'error', Reason:'Error determining whether this patient has checked in or not due to : '+ error}));
    return r.promise;
};


/**
 * Calls John's PHP script in order to check in patient on Aria and Medivisit
 * @param patientId
 * @param apptSerNum
 * @returns {Promise}
 */
function checkIntoAriaAndMedi(patientId) {
    let r = Q.defer();
    let url = config.CHECKIN_PATH.replace('{ID}', patientId);

    request(url,function(error, response, body) {
        logger.log('debug', 'checked into aria and medi response: ' + JSON.stringify(response));
        logger.log('debug', 'checked into aria and medi body: ' + JSON.stringify(body));

        if(error) r.reject(error);
        else r.resolve(response);
    });
    return r.promise;
}

/**
 * Queries the database to see if any patient push notifications exist for the user today, hence whether or not they have attempted to check in already
 * @param patientSerNum
 * @returns {Promise}
 */
function hasAlreadyAttemptedCheckin(patientSerNum){
    return new Promise((resolve, reject) => {
        if(!patientSerNum) reject("No Patient SerNum Provided");
        else {
            exports.runSqlQuery(queries.getPatientCheckinPushNotifications(), [patientSerNum]).then((rows) => {
                if (rows.length === 0) resolve(false);
                else resolve(true);
            }).catch((err) => {
                reject({Response: 'error', Reason: err});
            })
        }
    });
}

/**
 * Gets and returns all of a patients appointments on today's date
 * @param patientSerNum
 * @return {Promise}
 */
function getCheckedInAppointments(patientSerNum){
    return new Promise((resolve, reject) => {
        exports.runSqlQuery(queries.getTodaysCheckedInAppointments(), [patientSerNum])
            .then(rows => resolve(rows))
            .catch(err => reject({Response: 'error', Reason: err}));
    })
}

/**
 * getDocumentsContent
 * @desc fetches a document's content from DB
 * @param requestObject
 * @return {Promise}
 */
exports.getDocumentsContent = function(requestObject) {

    let r = Q.defer();
    let documents = requestObject.Parameters;
    let userID = requestObject.UserID;
    if(!(typeof documents.constructor !=='undefined'&&documents.constructor=== Array)){
        r.reject({Response:'error',Reason:'Not an array'});
    }else{
        exports.runSqlQuery(queries.getDocumentsContentQuery(), [[documents],userID]).then((rows)=>{
	        if(rows.length === 0) {
		        r.resolve({Response:'success',Data:'DocumentNotFound'});
	        } else {
		        LoadDocuments(rows).then(function(documents) {
			        if(documents.length === 1) r.resolve({Response:'success',Data:documents[0]});
			        else r.resolve({Response:'success',Data:documents});
		        }).catch(function (err) {
			        r.reject({Response:'error', Reason:err});
		        });
	        }
        }).catch((err)=>{
	        r.reject({Response:'error',Reason:err});
        });
    }
    return r.promise;
};

/**
 * @name updateAccountField
 * @description Updates the fields in the patient table
 * @param requestObject
 */
exports.updateAccountField=function(requestObject) {
    let r = Q.defer();

    let email = requestObject.UserEmail;
    if(!email) r.reject({Response:'error',Reason:`Invalid parameter email`}); //Check for valid email
    getPatientFromEmail(email).then(function(patient) {
        //Valid fields
        let validFields = ['Email', 'TelNum', 'Language'];
        let { field, newValue } = requestObject.Parameters;
        if ( !field || !newValue || typeof field !== 'string' || typeof newValue !== 'string')
                r.resolve({Response:'error',Reason:'Invalid Parameters'});
        if(field === 'Password')
        {
            //Hash the password before storing
            let hashedPassword = utility.hash(newValue);
            //Update database
            exports.runSqlQuery(queries.setNewPassword(), [hashedPassword, patient.PatientSerNum])
                .then(()=>{
	                delete requestObject.Parameters.NewValue;
	                r.resolve({Response:'success'});
                }).catch((err)=>{
	                r.reject({Response:'error',Reason:err});
                });
            //If not a password field update
        }else if(validFields.includes(field)){
            exports.runSqlQuery(queries.accountChange(), [field, newValue, requestObject.Token, patient.PatientSerNum])
	            .then(()=>{
		            r.resolve({Response:'success'});
	            }).catch((err)=>{
	            r.reject({Response:'error',Reason:err});
            });
        }
    });
    return r.promise;
};

/**
 * @name inputFeedback
 * @description Manages feedback content for the app, sends feedback to pfp committee if directed there.
 * @param requestObject
 */
exports.inputFeedback = function(requestObject) {
    let r = Q.defer();
    let email = requestObject.UserEmail;
	if(!email) r.reject({Response:'error',Reason:`Invalid parameter email`});
	getPatientFromEmail(email).then((patient)=> {
        let {type, feedback, appRating} = requestObject.Parameters;
        if((!type||!feedback)) r.reject({Response:'error',Reason:`Invalid parameter type`});
        exports.runSqlQuery(queries.inputFeedback(),[ patient.PatientSerNum, feedback, appRating, requestObject.Token ])
            .then(()=>{
	            let replyTo = null;
	            let email;
                let title;
	            // Determine if the feedback is for the app or patients committee
	            if (type === 'pfp'){
		            email = "patients4patients.contact@gmail.com";
		            title = "New Suggestion - Opal";
		            replyTo = email;
	            } else {
		            email = "muhc.app.mobile@gmail.com";
		            title = "New Feedback - Opal";
	            }
                (new Mail()).sendMail(email, title, feedback, replyTo);
	            r.resolve({Response:'success'});
            }).catch((err)=>{
	            r.reject({Response:'error',Reason:err});
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
exports.updateDeviceIdentifier = function(requestObject, parameters) {

    let r = Q.defer();

    logger.log('debug', 'in update device id with : ' + JSON.stringify(requestObject));

    let identifiers = parameters || requestObject.Parameters;
    let deviceType = null;


    //Validation deviceType
    if (identifiers.deviceType === 'browser') {
        deviceType = 3;
    } else if ( identifiers.deviceType === 'iOS'){
        deviceType = 0;
    }else if ( identifiers.deviceType === 'Android'){
        deviceType = 1;
    }else{
        r.reject({Response:'error', Reason:'Incorrect device type'});
        return r.promise;
    }

    let email = requestObject.UserEmail;

    getPatientFromEmail(email).then(function(user){

        exports.runSqlQuery(queries.updateDeviceIdentifiers(),[user.PatientSerNum, requestObject.DeviceId, identifiers.registrationId, deviceType,requestObject.Token, identifiers.registrationId, requestObject.Token])
            .then(()=>{
            logger.log('debug', 'successfully updated device identifiers');
            r.resolve({Response:'success'});
        }).catch((error)=>{
            logger.log('error', 'Error updating device identifiers due to '+ error);
            r.reject({Response:'error', Reason:'Error updating device identifiers due to '+error});
        });
    }).catch((error)=>{
        logger.log('error', 'Error getting patient fields due to '+ error);
        r.reject({Response:'error', Reason:'Error getting patient fields due to '+error});
    });
    return r.promise;
};

/**
 * @name addToActivityLog
 * @desc Adding action to activity log
 * @param requestObject
 */
exports.addToActivityLog=function(requestObject)
{
    let r = Q.defer();
    let {Request, UserID, DeviceId, Token} = requestObject;
    exports.runSqlQuery(queries.logActivity(),[Request, UserID, DeviceId, Token])
        .then(()=>{
	        r.resolve({Response:'success'});
        }).catch((err)=>{
	        r.reject({Response:'error', Reason:err});
        });
    return r.promise;
};

/**
 * @name getFirstEncryption
 * @param requestObject
 */
exports.getFirstEncryption=function(requestObject) {
    let r=Q.defer();
	exports.runSqlQuery(queries.securityQuestionEncryption(),[requestObject.UserID])
		.then((rows)=>{
			r.resolve(rows);
		}).catch((err)=>{
		r.reject({Response:'error', Reason:err});
	});
    return r.promise;
};


/**
 * getEncryption
 * @desc Gets user password for encrypting/decrypting to return security question
 * @param requestObject
 * @return {Promise}
 */
exports.getEncryption=function(requestObject)
{
	return exports.runSqlQuery(queries.userEncryption(),[requestObject.UserID, requestObject.DeviceId]);
};

/**
 * inputQuestionnaireAnswers
 * @desc Input questionnaire answers into DB
 * @param requestObject
 * @return {Promise}
 */
exports.inputQuestionnaireAnswers = function(requestObject) {
    let r = Q.defer();
    let parameters = requestObject.Parameters;
    questionnaires.inputQuestionnaireAnswers(parameters).then(function(patientQuestionnaireSerNum) {
        exports.runSqlQuery(queries.setQuestionnaireCompletedQuery(),
            [patientQuestionnaireSerNum, parameters.DateCompleted, requestObject.Token,parameters.QuestionnaireSerNum])
            .then(()=>{
	            r.resolve({Response:'success'});
            });
    }).catch(function(err){
        r.reject({Response:'error',Reason:err});
    });
    return r.promise;
};

/**
 * @name getMapLocation
 * @description Obtains map location via QR code
 * @deprecated
 * @param requestObject
 */
exports.getMapLocation=function(requestObject) {
    let r = Q.defer();

    if(!requestObject.Parameters || !requestObject.Parameters.QRCode) {
        r.reject({Response:'error', Reason:'Incorrect parameter'});
    }

    exports.runSqlQuery(queries.getMapLocation(),[requestObject.Parameters.QRCode]).then((rows)=>{
       r.resolve({Response:'success', Data:{MapLocation:rows[0]}});
    }).catch((err)=>{
	    r.reject({Response:'error', Reason:err});
    });

    return r.promise;
};

/**
 * @name increaseSecurityAnswerAttempt
 * @description Increase security answer attempt by one
 * @param requestObject
 */
exports.increaseSecurityAnswerAttempt = function(requestObject) {
    return exports.runSqlQuery(queries.increaseSecurityAnswerAttempt(),[requestObject.DeviceId]);
};

/**
 * @name resetSecurityAnswerAttempt
 * @description Sets the security answer attempt to zero
 * @param requestObject
 */
exports.resetSecurityAnswerAttempt = function(requestObject) {
	return exports.runSqlQuery(queries.resetSecurityAnswerAttempt(),[requestObject.DeviceId]);
};

/**
 * @name setTimeoutSecurityAnswer
 * @description Sets up timeout for device with incorrect security answer
 * @param requestObject
 * @param timestamp
 */
exports.setTimeoutSecurityAnswer = function(requestObject, timestamp) {
	return exports.runSqlQuery(queries.setTimeoutSecurityAnswer(),[new Date(timestamp), requestObject.DeviceId]);
};

/**
 * getPatientFieldsForPasswordReset
 * @desc gets patient fields for password reset
 * @param requestObject
 * @return {Promise}
 */
exports.getPatientFieldsForPasswordReset=function(requestObject) {
    return exports.runSqlQuery(queries.getPatientFieldsForPasswordReset(),[requestObject.UserEmail, requestObject.DeviceId]);
};

/**
 * setNewPassword
 * @desc updates user's password in DB
 * @param password
 * @param patientSerNum
 * @return {Promise}
 */
exports.setNewPassword=function(password,patientSerNum) {
    return exports.runSqlQuery(queries.setNewPassword(),[password,patientSerNum]);
};

/**
 * planningStepsAndEstimates
 * @desc Getting planning estimate from Marc's script
 * @param userId
 * @param timestamp
 */
exports.planningStepsAndEstimates = function(userId, timestamp) {
    return planningStepsAndEstimates(userId, timestamp);
};

/**
 * getPatientDeviceLastActivity
 * @desc gets the patient's last active timestamp
 * @param userid
 * @param device
 * @return {Promise}
 */
exports.getPatientDeviceLastActivity = function(userid,device)
{
    let r = Q.defer();
    exports.runSqlQuery(queries.getPatientDeviceLastActivity(), [userid,device]).then((rows)=>{
        r.resolve(rows[0]);
    }).catch((err)=>{
        r.reject(err);
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
    let r = Q.defer();
    let {EducationalMaterialControlSerNum, PatientSerNum, RatingValue} = requestObject.Parameters;
    if(!EducationalMaterialControlSerNum||!PatientSerNum||!RatingValue) {
        r.reject({Response:'error',Reason:'Invalid Parameters'});
    }

    exports.runSqlQuery(queries.insertEducationalMaterialRatingQuery(),
        [ EducationalMaterialControlSerNum, PatientSerNum, RatingValue, requestObject.Token])
        .then(()=>{
	        r.resolve({Response:'success'});
        }).catch((err)=>{
            r.reject({Response:'error',Reason:err});
        });
    return r.promise;
};

/**
 * updateLogout
 * @param fields
 * @return {Promise}
 */
exports.updateLogout = function(fields) {
    return exports.runSqlQuery(queries.updateLogout(), fields);
};

/**
 * getPatientFromEmail
 * @desc gets patient information based on inputted email
 * @param email
 * @return {Promise}
 */
function getPatientFromEmail(email) {
    let r = Q.defer();
	exports.runSqlQuery(queries.getPatientFromEmail(),[email])
        .then((rows)=>{
	        if(rows.length === 0) r.reject({Response:'error',Reason:"No User match in DB"});
	        r.resolve(rows[0]);
        }).catch((err)=>{
		    r.reject(err);
        });
    return r.promise;
}

/**
 * @name getPasswordForVerification
 * @desc gets the user's password to crosscheck during login to verify that Firebase and DB passwords are synced
 * @param email
 * @return {Promise}
 */
exports.getPasswordForVerification = function(email) {
    let r=Q.defer();
    exports.runSqlQuery(queries.getPatientPasswordForVerification(), [email])
	    .then((rows)=>{
		    if(rows.length === 0) r.reject({Response:'error',Reason:"No User match in DB"});
		    r.resolve(rows[0]);
	    }).catch((err)=> {
	        r.reject({Response: err, Reason:"Problem Fetching Password for verification"});
        });
    return r.promise;
};

/**
 * LoadDocuments
 * @desc Grabs file object to be loaded
 * @param rows
 * @return {Promise}
 */
function LoadDocuments(rows) {

    const defer = Q.defer();

    if (rows.length === 0) { return defer.resolve([]); }

    for (let key = 0; key < rows.length; key++) {

        // Get extension for filetype
        const n = rows[key].FinalFileName.lastIndexOf(".");
        rows[key].DocumentType= rows[key].FinalFileName.substring(n + 1, rows[key].FinalFileName.length);

        try{
            rows[key].Content=filesystem.readFileSync(config.DOCUMENTS_PATH + rows[key].FinalFileName,'base64');
            defer.resolve(rows)
        } catch(err) {
            if (err.code == "ENOENT"){
                defer.reject("No file found");
            }
            else {
                throw err;
            }
        }
    }
    return defer.promise;
}

/**
 * loadImageDoctor
 * @desc loads a doctor's image fetched from DB
 * @param rows
 * @return {Promise}
 */
function loadImageDoctor(rows){
    const deferred = Q.defer();
    for (const key in rows){
        if((typeof rows[key].ProfileImage !=="undefined" )&&rows[key].ProfileImage){
            const n = rows[key].ProfileImage.lastIndexOf(".");
            rows[key].DocumentType=rows[key].ProfileImage.substring(n + 1, rows[key].ProfileImage.length);
            rows[key].ProfileImage=filesystem.readFileSync('./Doctors/'+rows[key].ProfileImage,'base64' );
        }
    }
    deferred.resolve(rows);
    return deferred.promise;
}

/**
 * loadProfileImagePatient
 * @desc formats patient image to base64
 * @param rows
 * @return {Promise}
 */
function loadProfileImagePatient(rows){
    const deferred = Q.defer();

    if(rows[0]&&rows[0].ProfileImage && rows[0].ProfileImage!=='') {
        const buffer = new Buffer(rows[0].ProfileImage, 'hex');
        const base64Buffer = buffer.toString('base64');
        rows[0].DocumentType='jpg';
        rows[0].ProfileImage=base64Buffer;
        deferred.resolve(rows);
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

//Attachments for messages, not yet implemented to be added eventually
var LoadAttachments = function (rows ) {
    var messageCounter=0 ;
    var r = Q.defer();
    r.resolve(rows);
    return r.promise;

};

//Get the appointment aria ser num for a particular AppointmentSerNum, Username is passed as a security measure
function getAppointmentAriaSer(username, appSerNum) {
    return exports.runSqlQuery(queries.getAppointmentAriaSer(),[username, appSerNum]);
}

/**
 * @name getPatientId
 * @desc gets the patients Aria sernum from DB
 * @param username
 * @return {Promise}
 */
function getPatientId(username) {
    return exports.runSqlQuery(queries.getPatientId(),[username]);
}


//Get time estimate from Ackeem's scripts
exports.getTimeEstimate = function(appointmentAriaSer)
{
    console.log(appointmentAriaSer);
    var r = Q.defer();
    var url = config.WT_PATH+appointmentAriaSer.Parameters;
    console.log(url);
    request(url, function(error, response, body)
    {
        if(!error&&response.statusCode=='200')
        {
            console.log('Time Estimate ', body);
            body = JSON.parse(body);
            body['appointmentAriaSer'] = appointmentAriaSer.Parameters;
            if(body.length>=1){
                r.resolve(body);
            } else{
                r.reject({Response:'No data from getEstimate script'});
            }
        }else{
            r.resolve(error);
        }
    });
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

/*function planningStepsAndEstimates (userId, timestamp)
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
}*/

exports.getLabResults = function(requestObject)
{

    var r = Q.defer();
    //var labResults = requestObject.Parameters;

    var userID = requestObject.UserID;
    //console.log('Getting LabResults ');
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

    logger.log('debug', 'in get secyurity wquestuion in sql interface');

    var obj={};
    var Data = {};
    var userEmail = requestObject.UserEmail;

    exports.runSqlQuery(queries.getSecQuestion(),[userEmail])
        .then(function (queryRows) {

            if (queryRows.length != 1 ) r.reject({Response:'error', Reason:'More or less than one question returned'});
            Data.securityQuestion = {
                securityQuestion_EN: queryRows[0].QuestionText_EN,
                securityQuestion_FR: queryRows[0].QuestionText_FR
            }
            obj.Data = Data;
            return exports.runSqlQuery(queries.setDeviceSecurityAnswer(), [queryRows[0].SecurityAnswerSerNum, requestObject.DeviceId, queryRows[0].PatientSerNum])
        })
        .then(function () {
            r.resolve(obj);
        })
        .catch(function (error) {
            r.reject({Response:'error', Reason:'Error getting security question due to '+error});
        });

    return r.promise;
};

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

/**
 * Returns a promise containing the questionnaires and answers
 * @param {object} requestObject the request
 * @returns {Promise} Returns a promise that contains the questionnaire data
 */

exports.getQuestionnaires = function(requestObject){
    "use strict";
    var r = Q.defer();
    exports.runSqlQuery(queries.patientQuestionnaireTableFields(), [requestObject.UserID, null, null])
        .then(function (queryRows) {
            return questionnaires.getPatientQuestionnaires(queryRows)
        })
        .then(function (result) {
            var obj = {};
            obj.Data = result;
            r.resolve(obj);
        })
        .catch(function (error) {
            r.reject(error);
        });

    return r.promise
};

/**
 * NOTIFICATIONS FUNCTIONALITY
 * =====================================
 */

/**
 * Returns a promise containing all the notifications
 * @param {object} requestObject the request
 * @returns {Promise} Returns a promise that contains the notification data
 */

exports.getAllNotifications = function(requestObject){
    let r = Q.defer();
    exports.runSqlQuery(queries.getAllNotifications(), [requestObject.UserID])
        .then(rows => r.resolve({Data: rows})
        .catch(err => r.reject(err)));
    return r.promise
};

/**
 * Returns a promise containing all new notifications
 * @param {object} requestObject the request
 * @returns {Promise} Returns a promise that contains the notification data
 */

exports.getNewNotifications = function(requestObject){
    let r = Q.defer();
    exports.runSqlQuery(queries.getNewNotifications(), [requestObject.UserID, requestObject.Parameters.LastUpdated, requestObject.Parameters.LastUpdated])
        .then(rows => {

            logger.log('debug', 'new notifications: ' + JSON.stringify(rows));

            if(rows.length > 0){
                assocNotificationsWithItems(rows, requestObject)
                    .then(tuples => r.resolve(tuples))
                    .catch(err => r.reject(err))
            } else r.resolve({Data: rows});
        })
        .catch(error => {
            r.reject(error);
        });

    return r.promise
};

function assocNotificationsWithItems(notifications, requestObject){

    return new Promise((resolve, reject) => {
        const itemList = ['Document', 'Announcement', 'TxTeamMessage', 'EducationalMaterial'];

        let fields = [];
        fields = notifications.map(notif => {
            if(itemList.includes(notif.NotificationType) && !fields.includes(notif.NotificationType)) return notif.NotificationType + 's'
        });

        if(fields.length > 0) {
            refresh(fields, requestObject)
                .then(results => {
                    logger.log('debug', 'results: ' + JSON.stringify(results));
                    if(results.length > 0){
                        let tuples = notifications.map(notif => {
                            let tuple = [];

                            let item = results.find(result => {
                                logger.log('debug', 'result: ' + JSON.stringify(result));
                                let serNumField = notif.NotificationType + "SerNum";
                                if(result.hasOwnProperty(serNumField)) return result[serNumField] === notif.RefTableRowSerNum;
                                return false;
                            });
                            tuple.push(notif);
                            tuple.push(item);
                            return tuple;
                        });
                        resolve(tuples);
                    }
                    reject({Response:'error', Reason:'Could not associate any notifications to its content'});
                })
                .catch(err => resolve(err))
        } else resolve(notifications)
    })
}

function refresh (fields, requestObject) {
    let r = Q.defer();
    let UserId=requestObject.UserID;
    let today = new Date();
    let timestamp = today.setHours(0,0,0,0);

    exports.getPatientTableFields(UserId, timestamp, fields).then(rows => {
            rows.Data= utility.resolveEmptyResponse(rows.Data);
            r.resolve(rows);
        })
        .catch(err => r.reject(err));

    return r.promise;
}
