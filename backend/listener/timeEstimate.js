var exports = module.exports = {};
var q = require('q');
exports.getEstimate=function(AriaSerNum, Id)
{
  var r = q.defer();
  console.log("Inside get estimate;", 100*Math.random());
  var objectToSend = {};
    objectToSend =  {
      response:{
        type:'success'
      },
      info:{
        patientId:'51'
      },
      preceding:{
        'EN':'2 patients ahead of you',
        'FR':'2 patients avant vous'
      },
      estimate:{
        'EN':'20 - 30',
        'FR':'20 - 30'
      },
      schedule:{
        'EN':'Approximately 10 minutes ahead of schedule',
        'FR':"Environ 2 minutes d'avance"
      }
    };
    r.resolve(objectToSend);
  return r.promise;
};
