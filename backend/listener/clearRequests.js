var Firebase=require('firebase');
var credentials=require('./credentials.js');
 var ref=new Firebase(credentials.FIREBASE_URL+'/requests');
 ref.set(null);
