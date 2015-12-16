var myApp=angular.module('MUHCApp');

myApp.service('Patient',['UserPreferences',function(UserPreferences){
    return{
        setUserFields:function(patientFields,diagnosis){
            this.FirstName=patientFields.FirstName;
            this.LastName=patientFields.LastName;
            this.Alias=patientFields.Alias;
            this.TelNum=patientFields.TelNum;
            this.Email=patientFields.Email;
            this.Diagnosis=diagnosis;
            this.UserSerNum=patientFields.PatientSerNum;
            this.ProfileImage='data:image/png;base64,'+patientFields.ProfileImage;
            console.log(patientFields.Status_EN);
            if(UserPreferences.getLanguage()=='EN'){
                this.Status=patientFields.Status_EN;
            }else{
                this.Status=patientFields.Status_FR;
            }
        },
        getPatientFields:function()
        {
          return {
            FirstName:this.FirstName,
            LastName:this.LastName,
            TelNum:this.TelNum,
            Email:this.Email,
            Diagnosis:this.Diagnosis,
            UserSerNum:this.UserSerNum,
            ProfileImage:this.ProfileImage
          }
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
        },
        setProfileImage:function(img){
            this.ProfileImage='data:image/png;base64,'+img;
        },
        getProfileImage:function(){
            return this.ProfileImage;
        },
        getStatus:function(){
            return this.Status;
        }
    };
}]);
