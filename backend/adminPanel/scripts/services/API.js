var app=angular.module('adminPanelApp');

app.service('api',function ($rootScope, $http,$q,URLs) {
  return{

    getAllPatients:function(){
//First Name, Last Name, patient Id, ram q on patient id card.
//Patients per schedule date.
//Patients today, then Currently being treated.
//


    	var r=$q.defer();
    	var userDoctor=$rootScope.currentUser.DoctorSerNum;
    	var userAdmin=$rootScope.currentUser.AdminSerNum;
    	var patientsURL='';
      if(userDoctor){
       	patientsURL=URLs.getBasicURLPHP()+"getAllPatients.php?DoctorSerNum="+userDoctor;
       }else if(userAdmin){
       	 patientsURL=URLs.getBasicURLPHP()+"getAllPatients.php?AdminSerNum="+userAdmin;
       	console.log(patientsURL);
       }
      $http.get(patientsURL).success( function (response){
        if(typeof response[0].LastName!== 'undefined'){
   			console.log(response);
          r.resolve(response);

        }else if(response='No users!!'){
          r.reject({message:'Doctor has no patients using the app!',
            type:'alert-warning'});

        }else{
        	console.log('error');
        	r.reject('error');
        }
      });
      return r.promise;
    }
  ,getFieldFromServer:function (url, objectToSend){
    var r=$q.defer();
    var req = {
     method: 'POST',
     url: url,
     headers: {
       'Content-Type': undefined
     },
     data: objectToSend
    }

    $http(req).then(function(data){
        console.log(data);
        r.resolve(data.data);

    }, function(error){
      r.reject(error);

    });
    return r.promise;
  }
}
});



