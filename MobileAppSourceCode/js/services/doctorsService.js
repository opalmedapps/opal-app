var myApp=angular.module('MUHCApp');
myApp.service('Doctors',function(){
    return{
        setUserContacts:function(doctors)
        {   
            this.Doctors=[];
            this.Oncologists=[];
            this.OtherDoctors=[];
            this.PrimaryPhysician={};
            if(doctors!==undefined){
                var doctorKeyArray=Object.keys(doctors);
                for (var i = 0; i < doctorKeyArray.length; i++) {
                   
                   if(doctors[doctorKeyArray[i]].PrimaryFlag==1){
                        this.PrimaryPhysician=doctors[doctorKeyArray[i]];
                   }else if(doctors[doctorKeyArray[i]].OncologistFlag==1)
                   {
                        this.Oncologists.push(doctors[doctorKeyArray[i]]);
                   }else{
                     this.OtherDoctors.push(doctors[doctorKeyArray[i]]);
                   }
                   this.Doctors.push(doctors[doctorKeyArray[i]]);
                };
            }
        },
        getContacts:function(){
            return this.Doctors;
        },
        getPrimaryPhysician:function(){
            console.log(this.PrimaryPhysician);
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