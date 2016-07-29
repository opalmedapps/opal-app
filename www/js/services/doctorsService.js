var myApp=angular.module('MUHCApp');
myApp.service('Doctors',['$q','LocalStorage','$filter','FileManagerService','$cordovaDevice', function($q,LocalStorage,$filter,FileManagerService,$cordovaDevice){

  //Arrays containining the different doctors.
  var Doctors=[];
  var Oncologists=[];
  var OtherDoctors=[];
  var PrimaryPhysician=[];

  //Array without the actually doctor pictures that goes into the localStarge
  var doctorsStorage=[];

  //Function finds if there are doctors that had their fields updated and deletes them from the appropiate arrays.
  function searchDoctorsAndDelete(doctors)
  {
    //Go through the new doctors
    for (var i = 0; i < doctors.length; i++) {
      //Go through the old Doctors array
      for (var j = 0; j < Doctors.length; j++) {
        //If they have the same ser num delete from the doctorsStorage and Doctors
        if(Doctors[j].DoctorSerNum==doctors[i].DoctorSerNum)
        {
          //Delete from arrays
          doctorsStorage.splice(j,1);
          //If also a primary doctor, delete primary doctors
          if(Doctors[j].PrimaryFlag=='1'&&Doctors[j].OncologistFlag=='0'){
               PrimaryPhysician=[];
               Doctors.splice(j,1);
               break;
          }else if(Doctors[j].OncologistFlag=='1')
          {
            //If oncologist delete oncologist
               for (var k = 0; k < Oncologists.length; k++) {
                 if(Doctors[j].DoctorSerNum==Oncologists[k].DoctorSerNum)
                 {
                   Oncologists.splice(k,1);
                   Doctors.splice(j,1);
                   break;
                 }
               }
          }else{
            //If other doctor delete from other doctor
            for (var k = 0; k < OtherDoctors.length; k++) {
              if(Doctors[j].DoctorSerNum==OtherDoctors[k].DoctorSerNum)
              {
                OtherDoctors.splice(k,1);
                Doctors.splice(j,1);
                break;
              }
            }
          }
          break;
        }
      }
    }
  }
  //Adds array of doctors to doctor array and downloads the doctor pictures into storage.
    function addPatientContacts(doctors)
    {
      var r=$q.defer();
      var promises=[];

      if(typeof doctors!=='undefined'&&doctors){
          var doctorKeyArray=Object.keys(doctors);
          for (var i = 0; i < doctorKeyArray.length; i++) {
            //doctors[doctorKeyArray[i]].Phone=$filter('FormatPhoneNumber')(doctors[doctorKeyArray[i]].Phone);
            if(typeof doctors[doctorKeyArray[i]].ProfileImage!=='undefined'&&doctors[doctorKeyArray[i]].ProfileImage!=='')
            {
              if(doctors[doctorKeyArray[i]].DocumentType=='pdf')
              {
                doctors[doctorKeyArray[i]].ProfileImage='data:application/pdf;base64,'+doctors[doctorKeyArray[i]].ProfileImage;
              }else{
                doctors[doctorKeyArray[i]].ProfileImage='data:image/'+doctors[doctorKeyArray[i]].DocumentType+';base64,'+doctors[doctorKeyArray[i]].ProfileImage;
              }
              console.log(doctors[doctorKeyArray[i]]);
            }
          }
          var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
          if(app){
            for (var i = 0; i < doctorKeyArray.length; i++) {
              if(typeof doctors[doctorKeyArray[i]].ProfileImage!=='undefined'&&doctors[doctorKeyArray[i]].ProfileImage!=='' )
              {
                var platform=$cordovaDevice.getPlatform();
                var targetPath='';
                doctors[i].NameFileSystem='doctor'+doctors[i].DoctorSerNum+"."+doctors[i].DocumentType;
                if(platform==='Android'){
                    targetPath = cordova.file.dataDirectory+'Doctors/doctor'+doctors[doctorKeyArray[i]].DoctorSerNum+"."+doctors[doctorKeyArray[i]].DocumentType;
                    doctors[i].CDVfilePath="cdvfile://localhost/files/Doctors/"+doctors[i].NameFileSystem;
                }else if(platform==='iOS'){
                  targetPath = cordova.file.documentsDirectory+ 'Doctors/doctor'+doctors[doctorKeyArray[i]].DoctorSerNum+"."+doctors[doctorKeyArray[i]].DocumentType;
                  doctors[i].CDVfilePath="cdvfile://localhost/persistent/Doctors/"+doctors[i].NameFileSystem;
                }
                var url = doctors[doctorKeyArray[i]].ProfileImage;
                var trustHosts = true
                var options = {};
                doctors[i].PathFileSystem=targetPath;

                promises.push(FileManagerService.downloadFileIntoStorage(url, targetPath));
              }
            }
          }
          for (var i = 0; i < doctors.length; i++) {
            var copyDoctor=angular.copy(doctors[i]);
            delete doctors[i].ProfileImage;
            doctorsStorage.push(doctors[i]);
            if(typeof copyDoctor.ProfileImage=='undefined'||copyDoctor.ProfileImage=='')
            {
              copyDoctor.ProfileImage='./img/doctor.png';
            }
             if(copyDoctor.PrimaryFlag=='1'&&copyDoctor.OncologistFlag=='0'){
                  PrimaryPhysician.push(copyDoctor);
             }else if(copyDoctor.OncologistFlag=='1')
             {
                  Oncologists.push(copyDoctor);
             }else{
               OtherDoctors.push(copyDoctor);
             }
             Doctors.push(copyDoctor);
          };
          Doctors=$filter('orderBy')(Doctors,'LastName',false);
          Oncologists=$filter('orderBy')(Oncologists,'LastName',false);
          OtherDoctors=$filter('orderBy')(OtherDoctors,'LastName',false);
          LocalStorage.WriteToLocalStorage('Doctors',doctorsStorage);
          $q.all(promises).then(function(){
            r.resolve(true);
          });
      }else{
        r.resolve(true);
      }
      return r.promise;
    }
    return{
        setUserContactsOnline:function(doctors)
        {
            var r=$q.defer();

            Doctors=[];
            doctorsStorage=[];
            Oncologists=[];
            OtherDoctors=[];
            PrimaryPhysician=[];
            return addPatientContacts(doctors);

        },
        updateUserContacts:function(doctors)
        {
          var r=$q.defer();
          searchDoctorsAndDelete(doctors);
          return addPatientContacts(doctors);
        },
        setUserContactsOffline:function(doctors)
        {
            var r=$q.defer();
            Doctors=[];
            Oncologists=[];
            OtherDoctors=[];
            PrimaryPhysician=[];
            var promises=[];

            /*
            *Add code for offline extraction of doctors photos
            */

            if(typeof doctors!=='undefined'&&doctors){
              var doctorKeyArray=Object.keys(doctors);
              for (var i = 0; i < doctors.length; i++) {
                var copyDoctor=angular.copy(doctors[i]);
                if(doctors[i].PathFileSystem)
                {
                  copyDoctor.ProfileImage=copyDoctor.CDVfilePath;
                }else{
                  copyDoctor.ProfileImage='./img/doctor.png';
                }
                 if(copyDoctor.PrimaryFlag=='1'&&copyDoctor.OncologistFlag=='0'){
                      PrimaryPhysician.push(copyDoctor);
                 }else if(copyDoctor.OncologistFlag=='1')
                 {
                      Oncologists.push(copyDoctor);
                 }else{
                   OtherDoctors.push(copyDoctor);
                 }
                 Doctors.push(copyDoctor);
              };
              Oncologists=$filter('orderBy')(Oncologists,'LastName',false);
              Doctors=$filter('orderBy')(Doctors,'LastName',false);
              OtherDoctors=$filter('orderBy')(OtherDoctors,'LastName',false);
              r.resolve(true);
            }else{
              r.resolve(true);
            }

            return r.promise;
        },
        isEmpty:function()
        {
          if(Doctors.length===0)
          {
            return true;
          }else{
            return false;
          }
        },
        isThereDoctors:function()
        {
          return (Doctors.length>0)?true:false;
        },
        getContacts:function(){
            return Doctors;
        },
        getPrimaryPhysician:function(){
            return PrimaryPhysician;
        },
        getOncologists:function(){
            return Oncologists;
        },
        getOtherDoctors:function(){
            return OtherDoctors;
        },
        getDoctorBySerNum:function(userSerNum){
            for (var i = 0; i < Doctors.length; i++) {
                if(Doctors[i].DoctorSerNum===userSerNum)
                {
                    console.log(Doctors[i]);
                    return Doctors[i];
                }
            }
        },
        getDoctorIndexBySerNum:function(userSerNum){
            for (var i = 0; i < Doctors.length; i++) {
                if(Doctors[i].DoctorSerNum===userSerNum)
                {
                    console.log(i);
                    return i;
                }
            }
        },
        clearDoctors:function()
        {
            Doctors=[];
            Oncologists=[];
            OtherDoctors=[];
            PrimaryPhysician=[];
            doctorsStorage=[];
        }

    };
}]);
