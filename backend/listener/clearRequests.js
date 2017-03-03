var Firebase=require('firebase');
var credentials=require('./config.json');
 var ref=new Firebase(credentials.FIREBASE_URL+'/requests');
 ref.set(null);
