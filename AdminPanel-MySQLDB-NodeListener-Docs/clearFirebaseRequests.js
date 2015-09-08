var Firebase    =require('firebase');

var Ref = new Firebase ( 'https://luminous-heat-8715.firebaseio.com/requests');

Ref.set({request1 : { name : 'john' , request : 'appointment'} });
