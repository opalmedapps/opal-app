// var credentials=require('./../credentials.js');
var sqlInterface=require('./../api/sqlInterface.js');
// var queries=require('./../queries.js');
// var updatePatient = require('../apiPatientUpdate.js');
// var Firebase    =require('firebase');
// var CryptoJS = require('crypto-js');
// var utility = require('./../utility.js');
// var http = require('http');
// var q = require('q');
// var exec = require('child_process').exec;
// exec('python3 /var/www/devDocuments/marc/ML_Algorithm_MUHC/predictor.py 43235', function(error, stdout, stderr){
//   if (error) {
//     console.error(error);
//     return;
//   } 
//   stdout = stdout.toString();
//   var firstParenthesis = stdout.indexOf('{');
//   var lastParenthesis = stdout.lastIndexOf('}');
//   var length = lastParenthesis - firstParenthesis+1;
//   var data = JSON.parse(stdout.substring(firstParenthesis, length).replace(/'/g, "\""));
//   console.log(data);

// });
var requestObject = {
  UserID:'ac6eaeaa-f725-4b07-bdc0-72faef725985',
  Token:'sdfasdfasdfasdf',
  DeviceId:'browser', 
  Parameters:{'AppointmentSerNum':'196'}
};
sqlInterface.checkinUpdate(requestObject).then(function(data)
{
  console.log(data);
}).catch(function(error){
  console.log(error);
});
// sqlInterface.planningStepsAndEstimates('ac6eaeaa-f725-4b07-bdc0-72faef725985',12312312).then(function(data)
// {
//   console.log(data);
// }).catch(function(error)
// {
//   console.log(error);
// });
// ls = exec('python3', ['/var/www/devDocuments/marc/ML_Algorithm_MUHC/predictor.py','4654']);
// var result = '';
// ls.stdout.on('data',function(data){
//   data = data.toString();
//   result+=data;
  

// });
// ls.stderr.on('data',function(data)
// {
//   console.log('error',data.toString());
// });
// ls.on('close', function(){
//   console.log(JSON.parse(result));
// });


// var requestObject = {
//     UserID:'ac6eaeaa-f725-4b07-bdc0-72faef725985',
//     Parameters:["2","7"]
//   };
//   sqlInterface.getDocumentsContent(requestObject).then(function(data)
//   {
//     console.log(data);
//   });
//sqlInterface.runSqlQuery(queries.checkin(),['Kiosk', requestObject.UserID, requestObject.UserID]);
/*sqlInterface.checkIn(requestObject).then(function(response){
  console.log(response);
});*/
// sqlInterface.getPatientTableFields(requestObject.UserID,undefined,['Questionnaires']).then(function(rows){
//   console.log(rows);
// }).catch(function(error){
//   console.log(error);
// });
/*sqlInterface.runSqlQuery("SELECT AppointmentSerNum FROM Appointment WHERE PatientSerNum = ? ORDER BY ScheduledStartTime ASC",[51]).then(function(results){
  console.log(results);
  var today = new Date();
  today.setHours(18,0,0,0);
  later = new Date(today);
  later.setMinutes(today.getMinutes()+15);
  var array = [];
  for (var i = 0; i < results.length; i++) {
    array.push(sqlInterface.runSqlQuery("UPDATE Appointment SET ScheduledStartTime = ?, ScheduledEndTime = ? WHERE AppointmentSerNum = ?",[today,later,results[i].AppointmentSerNum]));
    console.log(today);
    console.log(later);
    today.setDate(today.getDate()+1);
    later.setDate(today.getDate()+1);
  }
  Q.all(array).then(function(results){
    console.log(results);
  });
});/*
var ref=new Firebase(credentials.FIREBASE_URL);
ref.auth(credentials.FIREBASE_SECRET);
//getCheckinEstimate(requestObject);
function getCheckinEstimate(requestObject)
{
  var serNum = requestObject.AppointmentSerNum;
  sqlInterface.runSqlQuery(queries.getCheckinFieldsQuery(),[requestObject.UserID,serNum]).then(function(result)
  {
    result = result[0];
    console.log(result);
    var deviceId=requestObject.DeviceId;
    var UserID=requestObject.UserID;
    var userFieldsPath='Users/'+UserID+'/'+deviceId+'/'+'Checkin';
    var interval = setInterval(function(){
      timeEstimate.getEstimate(result.AppointmentAriaSer).then(function(result)
      {
        console.log('Estimate:', result);
        if(typeof result == 'string'&& result =='Closed')
        {
          clearInterval(interval);
        }else{
          ref.child(userFieldsPath).update(result,function(){
            console.log('I just finished writing to firebase');

          });
        }
      });
    },2000)

  });
}



/*var options = {
    host: 'localhost',
    port: 8888,
    path: '/muhc/qplus/php/try.php',
    method: 'GET',
    headers: {
        accept: 'application/json'
    }
};

console.log("Start");
var x = http.request(options,function(res){
    console.log("Connected");
    res.on('data',function(data){
        console.log(data.toString());
    });
});

x.end();*/
//var q=require('Q');

/*sqlInterface.runSqlQuery(sqlInterface.requestMappings['EducationalMaterial'].sql, [ 'ac6eaeaa-f725-4b07-bdc0-72faef725985', new Date('Wed Dec 31 1969 19:00:00 GMT-0500 (EST)'), new Date('Wed Dec 31 1969 19:00:00 GMT-0500 (EST)'),new Date('Wed Dec 31 1969 19:00:00 GMT-0500 (EST)'), new Date('Wed Dec 31 1969 19:00:00 GMT-0500 (EST)'),new Date('Wed Dec 31 1969 19:00:00 GMT-0500 (EST)')], sqlInterface.requestMappings['EducationalMaterial'].processFunction).then(
  function(result)
  {
    console.log(result);
    console.log(result[0].TableContents);
  }).catch(function(error){
    console.log('afasda');
  });*/
/*sqlInterface.updateReadStatus('ac6eaeaa-f725-4b07-bdc0-72faef725985',{Field:'Notifications',Id:'2'}).then(function(result)
{
  console.log(result);
}).catch(function(error)
{
  console.log(error);
})
/*sqlInterface.runSqlQuery(sqlInterface.requestMappings['Appointments'].sql, [ 'ac6eaeaa-f725-4b07-bdc0-72faef725985', new Date('Wed Dec 31 1969 19:00:00 GMT-0500 (EST)'), new Date('Wed Dec 31 1969 19:00:00 GMT-0500 (EST)'),new Date('Wed Dec 31 1969 19:00:00 GMT-0500 (EST)'), new Date('Wed Dec 31 1969 19:00:00 GMT-0500 (EST)'),new Date('Wed Dec 31 1969 19:00:00 GMT-0500 (EST)')], sqlInterface.requestMappings['EducationalMaterial'].processFunction).then(
  function(result)
  {
    console.log(result);
    console.log(result[0].TableContents);
  }).catch(function(error){
    console.log('afasda');
  });*/

/*var ref = new Firebase('https://brilliant-inferno-7679.firebaseio.com');
ref.auth(credentials.FIREBASE_SECRET);
ref.child('/Users/d4232c51-e11d-410e-bfe5-d3aaf1a11443/demo').on('value',function(snapshot){
    var snap = snapshot.val();
    var voom = utility.decryptObject(snap, CryptoJS.SHA256('12345').toString());
    console.log(voom);
});*/
/*sqlInterface.runSqlQuery("SELECT Records.RecordSerNum, Records.DateAdded, Records.ReadStatus, EduMat.EducationalMaterialSerNum, EduMat.EducationalMaterialType_EN, EduMat.EducationalMaterialType_FR, EduMat.Name_EN, EduMat.Name_FR, EduMat.URL_EN, EduMat.URL_FR, EduMat.PhaseInTreatment, EduMat.DateAdded FROM EducationalMaterialTOC as TOC, Records as Records, EducationalMaterial  as EduMat, Patient WHERE EduMat.EducationalMaterialSerNum=Records.EducationalMaterialSerNum AND TOC.EducationalMaterialSerNum=EduMat.EducationalMaterialSerNum AND Patient.PatientSerNum = Records.PatientSerNum AND Patient.PatientSerNum=Users.UserTypeSerNum AND Users.Username = 'ac6eaeaa-f725-4b07-bdc0-72faef725985'  AND (EduMat.LastUpdated > ? OR Records.LastUpdated > ? OR TOC.LastUpdated > ?);",
[ 'ac6eaeaa-f725-4b07-bdc0-72faef725985',
  new Date('Wed Dec 31 1969 19:00:00 GMT-0500 (EST)'),
  new Date('Wed Dec 31 1969 19:00:00 GMT-0500 (EST)'),
  new Date('Wed Dec 31 1969 19:00:00 GMT-0500 (EST)')]
).then(function(res){
  console.log(res);
})*/
/*
sqlInterface.updateReadStatus('ac6eaeaa-f725-4b07-bdc0-72faef725985',{Field:'TxTeamMessages',Id:'2'}).then(function(result)
{
  console.log(result);
}).catch(function(error)
{
  console.log(error);
})*/

/*sqlInterface.getPatientTableFields('ac6eaeaa-f725-4b07-bdc0-72faef725985','2015-12-14 11:16:16',['Patient','Documents']).then(function(result){
  console.log(result);
});
testParameters('david',12312312,['1131','312312']);
testParameters('david',['1131','312312']);
testParameters('david',12312312);
testParameters('david');

function testParameters(userId, timestamp, array)
{
  if(arguments.length==3)
  {
    console.log('all three parameters, update only some fields')
  }else if(arguments.length==2)
  {
    if(typeof arguments[1] === 'object' && arguments[1].constructor === Array)
    {
      console.log('array')
    }else{
      console.log('timestamp')
    }
  }else{
    console.log('User name grab all fields');
  }
}*/


//if(variable.constructor === Array)

//processSelectRequest('Tasks','ac6eaeaa-f725-4b07-bdc0-72faef725985','2015-12-14 11:16:16');


/*var requestSim={};
var username='ac6eaeaa-f725-4b07-bdc0-72faef725985';
var deviceId='browser';
sqlInterface.getPatientDeviceLastActivity(username, deviceId).then(function(result){
  var date=new Date(result.DateTime);
  console.log(result.DateTime);
  date.setDate(date.getDate()+1);
  var today=new Date();
  if(result.Request=='Login')
  {
       console.log(date);
      result.Request='Logout';
      result.DateTime=utility.toMYSQLString(date);
      console.log(result.DateTime);
      sqlInterface.updateLogout(result);
  }
});
function processSelectRequest(table, userId, timestamp)
{
  var r=q.defer();
  var requestMappingObject=sqlInterface.requestMappings[table];
  if(typeof timestamp=='undefined')
  {
    var date=new Date(0);
  }else{
    var date=new Date(timestamp);
  }
  sqlInterface.runSqlQuery(requestMappingObject.sql, [userId,date],
    requestMappingObject.processFunction).then(function(rows)
    {
      r.resolve(rows);
    },function(err)
    {
      console.log(err);
      r.reject(err);
    });
  return r.promise;
}

*/
