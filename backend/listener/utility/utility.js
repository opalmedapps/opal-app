const CryptoJS          = require('crypto-js');
const stablelibutf8     = require('@stablelib/utf8');
const nacl              = require('tweetnacl');
const stablelibbase64   = require('@stablelib/base64');
const crypto            = require('crypto');
const Q                 = require('q');
const logger            = require('./../logs/logger');


//crypto.DEFAULT_ENCODING = 'hex';


var exports=module.exports={};

/**
 * resolveEmptyResponse
 * @desc Returns empty response, function used by refresh, resume, login
 * @param data
 * @return {*}
 */
exports.resolveEmptyResponse=function(data) {
  var counter=0;
  for (var key in data) {
    if(data[key].length>0) {
      counter++;
      break;
    }
  }
  if(counter === 0) data = 'empty';
  return data;
};

/**
 * toMYSQLString
 * @desc Converts date object to mysql date
 * @param date
 * @return Date
 */
exports.toMYSQLString=function(date) {
  let month = date.getMonth();
  let day=date.getDate();
  let hours=date.getHours();
  let minutes=date.getMinutes();
  let seconds=date.getSeconds();

  month++;

  if(hours<10) hours='0'+hours;
  if(minutes<10) minutes='0'+minutes;
  if(seconds<10) seconds='0'+seconds;
  if (day<10) day='0'+day;
  if (month<10) month='0'+month;

  return date.getFullYear()+'-'+month+'-'+day+' '+hours+':'+minutes+':'+seconds;
};


/**
 * unixToMYSQLTimestamp
 * @desc Converts from milliseconds since 1970 to a mysql date
 * @param time
 * @return {Date}
 */
exports.unixToMYSQLTimestamp=function(time) {
    const date = new Date(time);
    return exports.toMYSQLString(date);
};

/**
 * generatePBKDFHash
 * @desc generates encryption hash using PBKDF2 Hashing Algorithm
 * @param secret
 * @param salt
 * @return {string}
 */
exports.generatePBKDFHash = function(secret,salt) {
    return CryptoJS.PBKDF2(secret, salt, {keySize: 512/32, iterations: 1000}).toString(CryptoJS.enc.Hex);
};

/**
 * encrypt
 * @desc Encrypts a response object using PBKDF2 hash as key and NACL as encryption tool
 * @param object
 * @param secret
 * @param salt
 * @returns {Promise}
 * @notes link for NACL encryption documentation: https://tweetnacl.js.org/#/
 */
exports.encrypt = function(object,secret,salt) {
    let r = Q.defer();

    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
    // secret = (salt)?CryptoJS.PBKDF2(secret, salt, {keySize: 512/32, iterations: 1000}).toString(CryptoJS.enc.Hex):secret;

    if(salt){
        crypto.pbkdf2(secret, salt, 1000, 64, 'sha1', (err, derivedKey) => {
            if (err) r.reject(err);
	        derivedKey = derivedKey.toString('hex');
            derivedKey = stablelibutf8.encode(derivedKey.substring(0,nacl.secretbox.keyLength));
            r.resolve(exports.encryptObject(object,derivedKey,nonce));
        });
    } else {
        secret = stablelibutf8.encode(secret.substring(0,nacl.secretbox.keyLength));
        r.resolve(exports.encryptObject(object,secret,nonce));
    }

    return r.promise;
};

/**
 * decrypt
 * @desc Decrypts a request object so that it can be handled by the server
 * @param object
 * @param secret
 * @param salt
 * @returns {Promise}
 * @notes link for NACL encryption documentation: https://tweetnacl.js.org/#/
 */
exports.decrypt= function(object,secret,salt) {

  let r = Q.defer();

  // secret = (salt)?CryptoJS.PBKDF2(secret, salt, {keySize: 512/32, iterations: 1000}).toString(CryptoJS.enc.Hex):secret;

  if(salt){
      crypto.pbkdf2(secret, salt, 1000, 64, 'sha1', (err, derivedKey) => {
          if (err) r.reject(err);
	      derivedKey = derivedKey.toString('hex');
          derivedKey = stablelibutf8.encode(derivedKey.substring(0,nacl.secretbox.keyLength));
          let decrypted;
          try{
	          decrypted = exports.decryptObject(object, derivedKey);
	          r.resolve(decrypted);
          }catch(err){
              r.reject(err);
          }
      });
  } else {

      logger.log('debug', 'reached here');
      try {
          var decrypted = exports.decryptObject(object, stablelibutf8.encode(secret.substring(0, nacl.secretbox.keyLength)));
          r.resolve(decrypted);
      }catch(err){
          r.reject(err);
      }
  }

  return r.promise;
};

//Encrypts an object, array, number, date or string
exports.encryptObject=function(object,secret,nonce)
{
  if(typeof object === 'string')
  {
    object = stablelibbase64.encode(exports.concatUTF8Array(nonce, nacl.secretbox(stablelibutf8.encode(object),nonce,secret)));
    return object;
  }else{
    for (let key in object)
    {

      if (typeof object[key] === 'object')
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
        object[key] = stablelibbase64.encode(exports.concatUTF8Array(nonce,nacl.secretbox(stablelibutf8.encode(object[key]),nonce,secret)));
      }
    }
    return object;
  }

};

exports.hash=function(input) {
    return CryptoJS.SHA512(input).toString();
};

//Decryption function, returns an object whose values are all strings
exports.decryptObject=function(object,secret)
{
    if(typeof object ==='string')
    {
        let enc = splitNonce(object);
        let object = stablelibutf8.decode(nacl.secretbox.open(enc[1],enc[0],secret));
        if(object === null) throw new Error('Encryption failed');

    }else{
        for (let key in object)
        {
            if (typeof object[key]==='object')
            {
                exports.decryptObject(object[key],secret);
            }else {
                let enc = splitNonce(object[key]);
                let dec = stablelibutf8.decode(nacl.secretbox.open(enc[1], enc[0], secret));
                if(dec === null) throw new Error('Encryption failed');
                object[key] = dec;
            }
        }
    }
    return object;
};

exports.concatUTF8Array = function(a1,a2)
{
    let c = new Uint8Array(a1.length + a2.length);
    c.set(new Uint8Array(a1),0);
    c.set(new Uint8Array(a2), a1.length);
    return c;
};

function splitNonce(str)
{
    const ar = stablelibbase64.decode(str);
    return [ar.slice(0,nacl.secretbox.nonceLength),ar.slice(nacl.secretbox.nonceLength)];
}

//Create copy of object if no nested object
exports.copyObject = function(object)
{
    const copy = {};
    for (const key in object) {
        copy[key] = object[key];
    }
    return copy;
};
