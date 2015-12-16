var Firebase    =require('firebase');
var utility =require('./utility.js');
var credentials=require('./credentials.js');
var ref=new Firebase(credentials.FIREBASE_REQUEST_URL);
//Refresh request
var request1={Request:'Login'};
request1=utility.encryptObject(request1,'5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5');
request1.UserID='ec00959e-7291-469b-87c8-1d302a676371';
request1.DeviceId='';

ref.push(request1,function(ds)
{
  console.log(ds);
});




/*Login Request
var request1={Type:'Login',UserId:'simplelogin:10',DeviceId:'e32'};
*/

/*Refresh Array
var refresh={Type:'Refresh', UserId:'simplelogin:10',DeviceId:'e32'
,Parameters:{
    Content: ['Messages','Tasks', 'Appointments']
  }
}
*/



/*Refresh only the one field
var refresh={Type:'MessageRead', UserId:'simplelogin:10',DeviceId:'e32'
,Parameters:{
    Content: 'Messages'
  }
}
*/

/*
Message Read Request
var request1={Type:'Refresh',UserId:'simplelogin:12',DeviceId:'e32',Parameters:{
  MessageSerNum:146
}};
*/

/*Notification Read
var notification={Type:'NotificationRead', UserId:'simplelogin:10',DeviceId:'e32'
,Parameters:{
    NotificationSerNum:3
  }
}
*/

/*Check in
var checin={Type:'NotificationRead', UserId:'simplelogin:10',DeviceId:'e32'
,Parameters:{
    AppointmentSerNum:3
  }
}
*/
/*Account Change
var accountChange={Type:'AccountChange',UserId:'simplelogin:10',DeviceId:'e32',Parameters:{
  Field:'Email',
  NewValue:'da@gmail.com'
}};
*/
/*Feedback
var feedback={Type:'Feedback', UserId:'simplelogin:10',DeviceId:'e32'
,Parameters:{
    PatientSerNum:54,
    FeedbackContent:'This app is awesome'
  }
}
*/
