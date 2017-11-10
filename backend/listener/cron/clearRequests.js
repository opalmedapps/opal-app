/**
 * Created by PhpStorm.
 * User: rob
 * Date: 2017-11-10
 * Time: 2:28 PM
 */

const logger            = require('../logs/logger.js');
const config            = require('../config.json');
const admin             = require("firebase-admin");

// Initialize firebase connection
const serviceAccount = require(config.FIREBASE_ADMIN_KEY);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: config.DATABASE_URL
});

// Get reference to correct data element
const db = admin.database();
const ref = db.ref("/dev2");

process.send('Clear Request Cron Successfully Initialized');

// Periodically clear requests that are still on Firebase
setInterval(function(){
    clearRequests();
}, 300000);

/**
 * clearRequests
 * @desc Erase requests data on firebase in case the request has not been processed
 */
function clearRequests(){
    logger.log('debug', 'clearRequest called');
    ref.child('requests').once('value').then(function(snapshot){
        const now = (new Date()).getTime();
        const requestData = snapshot.val();
        for (const requestKey in requestData) {
            if(requestData[requestKey].hasOwnProperty('Timestamp')&&now-requestData[requestKey].Timestamp>300000) {
                logger.log('info', 'Deleting leftover request on firebase', {
                    requestKey: requestKey
                });
                ref.child('requests/' + requestKey).set(null);
            }
        }
    });
}