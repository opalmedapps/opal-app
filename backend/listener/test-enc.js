/**
 * Created by PhpStorm.
 * User: rob
 * Date: 2017-11-08
 * Time: 11:55 AM
 */

const CryptoJS = require('crypto-js');
const crypto = require('crypto');

crypto.DEFAULT_ENCODING = 'hex';
crypto.pbkdf2('secret', 'salt', 1000, 64, 'sha1', (err, derivedKey) => {
    if (err) throw err;
    console.log("new hash " + derivedKey);  // '3745e48...aa39b34'
});


var hash = CryptoJS.PBKDF2('secret', 'salt', {keySize: 512/32, iterations: 1000}).toString(CryptoJS.enc.Hex);

console.log("original hash: " + hash);


