/**
 * @author David Herrera
 */
var Firebase=require('Firebase');
var fs=require('fs');
var startTime=(new Date()).getTime();
var firebaseLink=new Firebase('https://blazing-inferno-1723.firebaseio.com');
firebaseLink.child('Photos').on('child_changed',function(snapshot){
	console.log(snapshot.key());
});
var Image={};
fs.readdir('/Users/davidherrera/Documents/KnowledgeSummer2015/photos/',function(err, files){
	if(err) throw err;
	for (file in files){
		
		fs.readFile('/Users/davidherrera/Documents/KnowledgeSummer2015/photos/'+files[file],function(err,data){
			var base64=data.toString('base64');
			//console.log(base64);
			Image[file]=base64;
			firebaseLink.child('Photos').set(base64, function(){
				var endTime=(new Date()).getTime();
				console.log((endTime-startTime)/1000);
			});
		
			//console.log(Image);
		});
	
		
}
	

})






