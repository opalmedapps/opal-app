var myApp=angular.module('MUHCApp');

myApp.service('Patient',function(){
    return{
        setUserFields:function(patientFields,diagnosis){
            this.FirstName=patientFields.FirstName;
            this.LastName=patientFields.LastName;
            this.Alias=patientFields.Alias;
            this.TelNum=patientFields.TelNum;
            this.Email=patientFields.Email;
            this.Diagnosis=diagnosis;
            this.UserSerNum=patientFields.PatientSerNum;
        },
        setDiagnosis:function(diagnosis){
            this.Diagnosis=diagnosis;
        },
        setFirstName:function(name){
            this.FirstName=name;
        },
        setLastName:function(name){
            this.LastName=name;
        },
        setAlias:function(name){
            this.Alias=name;
        },
        setTelNum:function(telephone){
            this.TelNum=telephone;
        },
        setEmail:function(email){
            this.Email=email;
        },
        getDiagnosis:function(){
            return this.Diagnosis;
        },
        getFirstName:function(){
            return this.FirstName;
        },
        getLastName:function(){
            return this.LastName;
        },
        getAlias:function(){
            return this.Alias;
        },
        getTelNum:function(){
            return this.TelNum;
        },
        getEmail:function(){
            return this.Email;
        },
        getUserSerNum:function(){
            return this.UserSerNum;
        }
    };
});
