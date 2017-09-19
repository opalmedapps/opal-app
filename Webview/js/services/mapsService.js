var myApp=angular.module('MUHCApp');

myApp.service('Maps',function(){

  return {
    getMaps:function(){
      this.maps=[];
      var objectToMaps={};
      objectToMaps.Name='Radiation Oncology/Cancer Care Clinic';
      objectToMaps.Url='img/D-S1_map_RadOnc-MedPhys_16June2015_en.png';
      this.maps.push(objectToMaps);
      var objectToMaps2={};
      objectToMaps2.Name='Palliative Care Day Hospital and Physhosocial Oncology';
      objectToMaps2.Url='./img/D2_Palliative_psychoncology_16June2015_en.png';
      this.maps.push(objectToMaps2);
      var objectToMaps3={};
      objectToMaps3.Name='Oncology Date Centre and Cancer Care Clinic';
      objectToMaps3.Url='./img/D-RC_ODC_16June2015_en_FNL.png';
      this.maps.push(objectToMaps3);
      return this.maps;
    }
  }



});
