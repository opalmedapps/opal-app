
var app=angular.module('adminPanelApp');
app.service('AllPatients',function(api,$q,URLs){
  return{
    setPatients:function(patients)
    {
      this.Patients=patients;
    },
    getPatients:function()
    {
      return this.Patients;

    },
    findPatient:function(serNum){
      if(this.Patients!='No Users!'){

        for (key in this.Patients){

          if(this.Patients[key].PatientSerNum==serNum)
          {
            return this.Patients[key];
          }else{
            return 'No Users!'
          }
        };
      }else{
        return 'No Users!';
      }

    }
  };

});