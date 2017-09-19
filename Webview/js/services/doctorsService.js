var myApp=angular.module('MUHCApp');
myApp.service('Doctors',function($filter){
    return{
        setUserContacts:function(doctors)
        {
            this.Doctors=[];
            this.Oncologists=[];
            this.OtherDoctors=[];
            this.PrimaryPhysician=[];
            if(doctors!==undefined&&doctors){

                var doctorKeyArray=Object.keys(doctors);
                for (var i = 0; i < doctorKeyArray.length; i++) {

                   if(doctors[doctorKeyArray[i]].PrimaryFlag==1){
                        this.PrimaryPhysician.push(doctors[doctorKeyArray[i]]);
                   }else if(doctors[doctorKeyArray[i]].OncologistFlag==1)
                   {
                        this.Oncologists.push(doctors[doctorKeyArray[i]]);
                   }else{
                     this.OtherDoctors.push(doctors[doctorKeyArray[i]]);
                   }
                   this.Doctors.push(doctors[doctorKeyArray[i]]);
                };
                this.Oncologists=$filter('orderBy')(this.Oncologists,'LastName',false);
                this.Doctors=$filter('orderBy')(this.Doctors,'LastName',false);
                this.OtherDoctors=$filter('orderBy')(this.OtherDoctors,'LastName',false);

            }
        },
        isEmpty:function()
        {
          if(this.Doctors.length==0)
          {
            return true;
          }else{
            return false;
          }
        },
        getContacts:function(){
            return this.Doctors;
        },
        getPrimaryPhysician:function(){
            return this.PrimaryPhysician;
        },
        getOncologists:function(){
            return this.Oncologists;
        },
        getOtherDoctors:function(){
            return this.OtherDoctors;
        },
        getDoctorBySerNum:function(userSerNum){
            for (var i = 0; i < this.Doctors.length; i++) {
                if(this.Doctors[i].DoctorSerNum===userSerNum)
                {
                    console.log(this.Doctors[i]);
                    return this.Doctors[i];
                }
            };
        }

    }
});
