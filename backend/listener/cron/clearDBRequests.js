/**
 * Created by PhpStorm.
 * User: rob
 * Date: 2017-11-10
 * Time: 2:28 PM
 *
 * *********************************************
 * User: Yick Mo
 * Date: 2017-12-15
 *
 * NOTE: This is copy from the original clearRequests.js on 2017-12-13
 * Important : Do not forget to change "/dev3" back to "/dev2" before merging
 *
 */

const logger            = require('../logs/logger.js');
const config             = require('../config.json');
const admin             = require("firebase-admin");
const gTimestamp	= 300000;

// Initialize firebase connection
const serviceAccount = require(config.FIREBASE_ADMIN_KEY);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: config.DATABASE_URL
});

// Get reference to correct data element
const db = admin.database();
const ref = db.ref("/dev2");

process.send('Clear DB Request Cron Successfully Initialized');

// Periodically clear requests that are still on Firebase
// Original interval 300000
// The intervals are in ms, so 120000 is 120 seconds which is 2 minutes
setInterval(function(){
    clearRequests();
}, gTimestamp);

/**
 * clearRequests
 * @desc Erase requests data on firebase in case the request has not been processed
 *
 * NOTES: the Timestamp should match the same time as the setInterval time
 */
function clearRequests(){
    logger.log('debug', 'clearDBRequest called');
    ref.child('DBrequest').once('value').then(function(snapshot){
        const now = (new Date()).getTime();
        const requestData = snapshot.val();
        for (const requestKey in requestData) {
            if(requestData[requestKey].hasOwnProperty('Timestamp')&&now-requestData[requestKey].Timestamp>gTimestamp) {
                logger.log('info', 'Deleting leftover DB request on firebase', {
                    requestKey: requestKey
                });
                ref.child('DBrequest/' + requestKey).set(null);
            }
        }
    });
}