/**
 * User: Yick Mo
 * Date: 2017-12-04
 *
 * NOTE: This is copy from the original heartbeat.js on 2017-11-29
 * Important : Do not forget to change "/dev3" back to "/dev2" before merging
 * 
 */

"use strict";

/**
 * HEARTBEAT DB DEPENDENCIES
 */
const admin		= require("firebase-admin");
const config   	= require('./../config.json');
const logger	= require('./../logs/logger');
const mysql		= require('mysql');
const q			= require("q");

/**
 * FIREBASE INITIALIZATION
 **/
// Initialize firebase connection
const serviceAccount = require(config.FIREBASE_ADMIN_KEY);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: config.DATABASE_URL
});
const db = admin.database();
const ref = db.ref("/dev2/DBrequest");

/******************************
 * Set the request for firebase to identify as HearBeatDB
 * This is used to check if Firebase is still connected before pushing the stats of MySQL to it
 ******************************/
const request = {
    "Request": "HeartBeatDB",
    "Timestamp": {".sv": "timestamp"}
};

/******************************
 * DATABASE CONFIGURATIONS
 * Query to retrieve stats from the database
 * The procedure is currently located on 172.26.66.39 (Listener) in table "mysql" and the procedure is "my_memory()
 ******************************/
const dbQuery = "call mysql.my_memory();";

/******************************
 * Use for POOL connection to MySQL.  Not being used now since
 * this is a simple query to get the stats of MySQL, but might be used in the future
 ******************************/
// const dbCredentials = {
	// connectionLimit: 10,
	// host: config.HOST,
	// user: config.MYSQL_USERNAME,
	// password: config.MYSQL_PASSWORD,
	// database: config.MYSQL_DATABASE,
	// dateStrings: true
// };

/******************************
 * Use for POOL connection to MySQL.  Not being used now since
 * this is a simple query, but might be used in the future
 * SQL POOL CONFIGURATION
 * @type {Pool}
 *
 * const pool = mysql.createPool(dbCredentials);
 ******************************/
 
/******************************
 * DATABASE connection to MySQL
 * The configuration is from 
 * "const config = require('./../config.json');" at the top
 ******************************/
var conn = mysql.createConnection({
	host: config.HOST,
	user: config.MYSQL_USERNAME,
	password: config.MYSQL_PASSWORD,
	database: config.MYSQL_DATABASE
});


// output to a log that the database is connected
logger.log('info','Initialize SQL configuration');

//////////////////////////////////////////////////////////////////////////

/**
 * START THE HEARTBEAT DB
 */
init();


//////////////////////////////////////////////////////////////////////////
/*********************************************
 * BEGINING OF FUNCTIONS
 *********************************************/

/**
 * @name init
 * @desc initialize the heartbeat DB
 * 
 * The intervals are in ms, so 30000 is 30 seconds
 */
function init(){
	logger.log('info','Start of Heartbeat DB Cron');

	setInterval(() => {
        startHeartBeatDB()
    }, 600000);
}

/**
 * @name submitSimpleQuery
 * @desc submit a simple query to retrieve MySQL stats
 *
 * dbQuery is the query statement that is create from the top
 */
function submitSimpleQuery(){
	let r = q.defer();
    var d = new Date();
    var n = d.getTime();

	// Where to write the log file
	const filename = './logs/heartbeatdb.log';
	var fs = require('fs');

	// Execute the query
	const que = conn.query(dbQuery, function (err, rows, fields) {

		if (err) {
			// Log any errors
			logger.log('error', err);
			r.reject(err);
		} else {
			// if no error, push MySQL stats to Firebase
			ref.push({Timestamp: n, response: rows[0]}); //  The [0] will exclude the result set (fieldcount, affectedRows, insertId, etc...)
			logger.log('info', 'Results : ', {Timestamp: n, response: rows[0]}); // Log the result in the regular log
			
			// Log the results to the heart beat DB logs
			// NOTE: The logs are manage by using the  logrotate to control the settings of the log
			fs.appendFile(filename, JSON.stringify(rows[0])  + "\n", function (err) {
			  if (err) {
					// Log any errors
					logger.log('error', err);
			  }
			});
			
			r.resolve(rows);
			// ref.remove(); // Remove reference from firebase
		}
	});

	return r.promise;
}

/**
 * @name startHeartBeat
 * @desc sends heartbeat request to listener every 30 seconds
 *
 * 	First check if FireBase there
 *		Second get the MySQL stats
 */
function startHeartBeatDB(){

    logger.log('info', 'Requesting heartbeat db from listener');

	// push a request to see if FireBase is there
    ref.push(request)
        .then(()=>{
			// ref.remove(); // Remove reference from firebase
			
			// call a function to retrieve basic stats from MySQL
			submitSimpleQuery()
				.then(()=> logger.log('info',  'Finished simple query'))
				.catch(()=>logger.log('error', 'Error while performing query'));
        })
        .catch(err => {
            logger.log('error', 'Error sending heartbeat db request', err);
        });

}
