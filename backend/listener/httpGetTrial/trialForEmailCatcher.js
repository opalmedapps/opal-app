var http = require('http');
var options = {
    path: 'http://172.26.66.41/devDocuments/david/muhc/qplus/listener/httpGetTrial/checkInPatient_David.php?CheckinVenue=8225&ScheduledActivitySer=1668402'
  }
var x = http.request(options,function(res){
res.on('data',function(data){
    console.log(data.toString());
});
//devDocuments/ackeem/getCheckins.php?AppointmentAriaSer=123123123
});
x.on('error',function(data){
	console.log('asdasfsafsda');
})
x.end()