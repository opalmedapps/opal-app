var CryptoJS    =require('crypto-js');
var credentials=require('./../config.json');
var exports=module.exports={};

//Returns empty response, function used by refresh, resume, login
exports.resolveEmptyResponse=function(data)
{
  var counter=0;
  for (var key in data) {
    if(data[key].length>0)
    {
      console.log(data[key]);
      counter++;
      break;
    }
  }
  console.log('line 16',counter);
  if(counter === 0) data = 'empty';
  return data;
};

//Converts date object to mysql date
exports.toMYSQLString=function(date)
{
  var month=date.getMonth();
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

//Encrypts an object, array, number, date or string
exports.encryptObject=function(object,secret)
{
  /*console.log(object.Appointments[0].ScheduledStartTime);
  var dateString=object.Appointments[0].ScheduledStartTime.toISOString();
  console.log(dateString);*/
  //var object=JSON.parse(JSON.stringify(object));
  if(typeof object=='string')
  {
    var ciphertextString = CryptoJS.AES.encrypt(object, secret);
    object=ciphertextString.toString();
    return object;
  }else{
    for (var key in object)
    {

      if (typeof object[key]=='object')
      {

        if(object[key] instanceof Date )
        {
          object[key]=object[key].toISOString();
          var ciphertextDate = CryptoJS.AES.encrypt(object[key], secret);
          object[key]=ciphertextDate.toString();
        }else{
            exports.encryptObject(object[key],secret);
        }

      } else
      {
        //console.log('I am encrypting right now!');
        if (typeof object[key] !=='string') {
          //console.log(object[key]);
          object[key]=String(object[key]);
        }
        //console.log(object[key]);
        var ciphertext = CryptoJS.AES.encrypt(object[key], secret);
        object[key]=ciphertext.toString();
      }
    }
    return object;
  }

};
//Decryption function, returns an object whose values are all strings
exports.decryptObject=function(object,secret)
{
  if(typeof object =='string')
  {
    var decipherbytesString = CryptoJS.AES.decrypt(object, secret);
    object=decipherbytesString.toString(CryptoJS.enc.Utf8);
  }else{
    for (var key in object)
    {
      if (typeof object[key]=='object')
      {
        exports.decryptObject(object[key],secret);
      } else
      {
        if (key=='UserID')
        {
          object[key]=object[key];
        }else if(key=='DeviceId')
        {
          object[key]=object[key];
        }
        else
        {
          //console.log("Decrypting", object[key]);
          var decipherbytes = CryptoJS.AES.decrypt(object[key], secret);
          object[key]= decipherbytes.toString(CryptoJS.enc.Utf8);
        }
      }
    }
  }
  return object;
};

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
      console.log('Queue is empty');
    }
  };
}


/*
* For test mocha
var https = require('https');
exports.sanitize= function(word)
{
  word = word.toLowerCase();
   return word;
};
exports.tokenize = function(sentence)
{
  return sentence.split(" ");
};
var url = 'https://api.github.com/repos/sayenee/build-podcast';
exports.info = function(callback)
{
  var options = {
    host:'api.github.com',
    path: '/users/dherre3/events',
    method:'GET',
    headers:{
      'User-Agent':'dherre3'
    }
  };
  var str = '';
  https.request(options,function(response){
     response.on('data',function(data)
     {
       str+= data;
     });
     response.on('end',function(data)
     {
       callback(JSON.parse(str));
     });
     response.on('error',function(error)
     {
       console.log(error);
     });
   
  }).end();
};
exports.infoLang = function(infoFunc,callback)
{
  infoFunc(function(reply){
     callback('Language is '+reply.Language);
  });
};
*/