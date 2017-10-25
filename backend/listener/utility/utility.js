const CryptoJS    =require('crypto-js');
const stablelibutf8=require('@stablelib/utf8');
const nacl = require('tweetnacl');
const stablelibbase64=require('@stablelib/base64');

var exports=module.exports={};

//Returns empty response, function used by refresh, resume, login
exports.resolveEmptyResponse=function(data)
{
  var counter=0;
  for (var key in data) {
    if(data[key].length>0)
    {
      //console.log(data[key]);
      counter++;
      break;
    }
  }
  //console.log('line 16',counter);
  if(counter === 0) data = 'empty';
  return data;
};

//Converts date object to mysql date
exports.toMYSQLString=function(date)
{
  var month = date.getMonth();
  var day=date.getDate();
  var hours=date.getHours();
  var minutes=date.getMinutes();
  var seconds=date.getSeconds();
  month++;
  if(hours<10) hours='0'+hours;
  if(minutes<10) minutes='0'+minutes;
  if(seconds<10) seconds='0'+seconds;
  if (day<10) day='0'+day;
  if (month<10) month='0'+month;

  return date.getFullYear()+'-'+month+'-'+day+' '+hours+':'+minutes+':'+seconds;

};
//Convers from milliseconds since 1970 to a mysql date
exports.unixToMYSQLTimestamp=function(time)
{
  var date=new Date(time);
  return exports.toMYSQLString(date);
};
exports.generatePBKDFHash = function(secret,salt)
{
  return CryptoJS.PBKDF2(secret, salt, {keySize: 512/32, iterations: 1000}).toString(CryptoJS.enc.Hex);
}
exports.encrypt = function(object,secret,salt)
{
  var nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  secret = (salt)?CryptoJS.PBKDF2(secret, salt, {keySize: 512/32, iterations: 1000}).toString(CryptoJS.enc.Hex):secret;
  secret = stablelibutf8.encode(secret.substring(0,nacl.secretbox.keyLength));
  return exports.encryptObject(object,secret,nonce);
};
exports.decrypt= function(object,secret,salt)
{

  secret = (salt)?CryptoJS.PBKDF2(secret, salt, {keySize: 512/32, iterations: 1000}).toString(CryptoJS.enc.Hex):secret;

  console.log("temp enc hash: " + secret);

  return exports.decryptObject(object, stablelibutf8.encode(secret.substring(0,nacl.secretbox.keyLength)));
};

//Encrypts an object, array, number, date or string
exports.encryptObject=function(object,secret,nonce)
{

  if(typeof object=='string')
  {

    object=stablelibbase64.encode(exports.concatUTF8Array(nonce, nacl.secretbox(stablelibutf8.encode(object),nonce,secret)));

    return object;
  }else{
    for (var key in object)
    {

      if (typeof object[key]=='object')
      {

        if(object[key] instanceof Date )
        {
          object[key]=object[key].toISOString();
          object[key] = stablelibbase64.encode(exports.concatUTF8Array(nonce, nacl.secretbox(stablelibutf8.encode(object[key]),nonce,secret)));

        }else{
            exports.encryptObject(object[key],secret,nonce);
        }

      } else
      {
        if (typeof object[key] !=='string') {
          object[key]=String(object[key]);
        }
        object[key]=stablelibbase64.encode(exports.concatUTF8Array(nonce,nacl.secretbox(stablelibutf8.encode(object[key]),nonce,secret)));
      }
    }
    return object;
  }

};

exports.hash=function(input){
  return CryptoJS.SHA512(input).toString();

};
//Decryption function, returns an object whose values are all strings
exports.decryptObject=function(object,secret)
{
  if(typeof object ==='string')
  {
    var enc = splitNonce(object);
    let dec = stablelibutf8.decode(nacl.secretbox.open(enc[1],enc[0],secret));
    object = (typeof dec === 'boolean')?"":dec;
  }else{
    for (var key in object)
    {
      if (typeof object[key]==='object')
      {
        exports.decryptObject(object[key],secret);
      } else if (key!=='UserID' && key!=='DeviceId') {
          var enc = splitNonce(object[key]);


          let dec = stablelibutf8.decode(nacl.secretbox.open(enc[1], enc[0], secret));
          object[key] = (typeof dec === 'boolean') ? "" : dec;
      }
    }
  }
  return object;
};
exports.concatUTF8Array = function(a1,a2)
{
  var c = new Uint8Array(a1.length + a2.length);
  c.set(new Uint8Array(a1),0);
  c.set(new Uint8Array(a2), a1.length);
  return c;
};

function splitNonce(str)
{
  var ar = stablelibbase64.decode(str);
  return [ar.slice(0,nacl.secretbox.nonceLength),ar.slice(nacl.secretbox.nonceLength)];
}

//Create copy of object if no nested object
exports.copyObject = function(object)
{
  var copy = {};
  for (var key in object) {
    copy[key] = object[key];
  }
  return copy;
};

exports.Queue=function(){
  return new Queue();
};

//Creates Queue class for cascading purposes
function Queue()
{
  var array=[];
  var head=0;
  this.isEmpty=function()
  {
    if(head === 0)
    {
      return true;
    }else{
      return false;
    }
  };
  this.size = function()
  {
    return array.length;
  };
  this.enqueueArray=function(arr)
  {

    for (var i = 0; i < arr.length; i++) {
      array.push(arr[i]);
      head++;
    }
  };
  this.enqueue=function(field)
  {
    array.push(field);
    head++;
  };
  this.dequeue=function()
  {
    if(head !== 0)
    {
      head--;
      var poppedElement = array[head];
      array.splice(head,1);
      return poppedElement;
    }else{
    }
  };
}

