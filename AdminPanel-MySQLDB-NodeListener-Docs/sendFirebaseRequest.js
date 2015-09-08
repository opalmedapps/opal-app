var Firebase    = require('firebase');
var Q           = require('q');
var mysql       = require('mysql');
var CryptoJS      =require('crypto-js');

var Ref = new Firebase ( 'https://luminous-heat-8715.firebaseio.com/requests');

var connection  = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  database : 'QplusApp'
});
function encryptRequest(object)
{
  var deferred=Q.defer();
  connection.query("SELECT Password from patient WHERE LoginID LIKE '"+object['UserID']+"'", function(err, rows, fields)
  {
    var decryptCounter=0;
    if (err ) throw err;
    var password=rows[0].Password;
    console.log('I got the password for encryption ! : ',password);
    for (var key in object)
    {
      if (typeof object[key]=='object')
      {
        decryptRequest(object[key]);
        decryptCounter++;
      } else
      {
        if (key=='UserID')
        {
          decryptCounter++;
          object[key]=object[key];
        }
        else
        {
          var ciphertext = CryptoJS.AES.encrypt(object[key], password);
          object[key]=ciphertext.toString();
          decryptCounter++;
        }
      }
      if (decryptCounter == Object.keys(rows).length ) { deferred.resolve('RequestDecrypted'); }
    }
  });
  return deferred.promise;
};

function sendRequest(userid,requesttype,object)
{
        var requestObject={};
        if (requesttype=='Login' || requesttype=='Refresh')
        {
          requestObject= { Request : requesttype, UserID: userid }
          encryptRequest(requestObject).then(function(){Ref.push(requestObject);});
        }

        else if (requesttype=='Logout')
        {
          Ref.push({ Request : 'Logout', UserID: userid });
        }

        else if (requesttype=='Checkin')
        {
          Ref.push({ Request : 'Checkin', UserID:userid, AppointmentSerNum : object.AppointmentSerNum });
        }

        else if (requesttype=='AccountChange')
        {
          Ref.push({ Request : 'AccountChange', UserID:userid, Content : object}); // 1.FieldToChange:[Password , Name,Email,TelNum,EnableSMS,Language], 2.NewValue
        }

        else if (requesttype=='AppointmentChange')
        {
          Ref.push({ Request : 'AppointmentChange', UserID:userid, Content : object }); // DateRange , AppointmentSerNum
        }

        else if (requesttype=='MessageRead')
        {
            Ref.push({ Request : 'MessageRead', UserID:userid, MessageSerNum : object.MessageSerNum });
        }

        else if (requesttype=='NotificationRead')
        {
          Ref.push({ Request : 'NotificationRead', UserID:userid, NotificationSerNum : object.NotificationSerNum });
        }

        else if (requesttype=='Message')
        {
          Ref.push({ Request : 'Message', UserID:userid, Content : object });// ALL the things about mesage   1.SenderRole,2.SenderSerNum,3.ReceiverRole,4.ReceiverSerNum,5.MessageContent,6.MessageDate
        }
};
//console.log(Date.prototype.toISOString.toString());
//sendRequest('simplelogin:16','Login');
//sendRequest('simplelogin:17','Logout');
//sendRequest('simplelogin:17','Checkin',{AppointmentSerNum:4});
//sendRequest('simplelogin:17','AccountChange',{FieldToChange:'Password',NewValue:'newpassword'});
sendRequest('simplelogin:17','AppointmentChange',{StartDate:' ',EndDate:' ',TimeOfDay:' ',AppointmentSerNum:'14'});
//sendRequest('simplelogin:17','Message',);
//sendRequest('simplelogin:17','MessageRead',{MessageSerNum:'24'});
//sendRequest('simplelogin:17','NotificationRead',);
//sendRequest('simplelogin:17','Refresh',);
