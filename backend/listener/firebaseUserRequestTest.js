var Firebase = require('firebase');
var CryptoJS    =require('crypto-js');
var ref = new Firebase('https://brilliant-inferno-7679.firebaseio.com/test/requests');
ref.authWithPassword({
  email    : 'muhc.app.mobile@gmail.com',
  password : '12345'
}, authHandler);
function authHandler(authData)
{
    console.log(authData);
    var inter = setInterval(function()
    {
        if(index == 10) clearInterval(inter);
        ref.push({Request:CryptoJS.AES.encrypt('Resume',CryptoJS.SHA256('12345').toString()).toString(),Token:'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6Im11aGMuYXBwLm1vYmlsZUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlhdCI6MTQ2ODMzNDgwOCwidiI6MCwiZCI6eyJwcm92aWRlciI6InBhc3N3b3JkIiwidWlkIjoiYWM2ZWFlYWEtZjcyNS00YjA3LWJkYzAtNzJmYWVmNzI1OTg1In19.eAnFI3eeYHbH7ZpO91MZ9Dr9J2LJakI0oNndXIjxzuM',
        'DeviceId':'browser',
        UserID:'ac6eaeaa-f725-4b07-bdc0-72faef725985'});
        index++;
    },100);
}

var username = 'ac6eaeaa-f725-4b07-bdc0-72faef725985';
var index = 1;
