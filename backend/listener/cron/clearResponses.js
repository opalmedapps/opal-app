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

process.send('Clear Response Cron Successfully Initialized');

// Periodically clear requests that are still on Firebase
setInterval(function(){
    clearResponses();
}, 300000);

/**
 * clearTimeoutRequests
 * @desc Erase response data on firebase in case the response has not been processed
 */
function clearResponses() {
    ref.child('users').once('value').then(function(snapshot){
        const now = (new Date()).getTime();
        const usersData = snapshot.val();
        for (const user in usersData) {
            for(const requestKey in usersData[user])
            {
                if(usersData[user][requestKey].hasOwnProperty('Timestamp')&&now-usersData[user][requestKey].Timestamp>300000)
                {
                    logger.log('info','Deleting leftover response on firebase', {
                        request: requestKey
                    });
                    ref.child('users/'+user+'/'+requestKey).set(null);
                }
            }
        }
    });
}