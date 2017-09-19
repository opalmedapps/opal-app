var myApp=angular.module('MUHCApp');
myApp.service('EducationalMaterial',function(){
 return {
   getEducationalMaterial:function()
   {
     this.educationalMaterialArray=[];
     var objectToMaterial={};
     objectToMaterial.name='Planning for your radiotherapy';
     objectToMaterial.description='Video';
     objectToMaterial.sourceType='video';
     objectToMaterial.source='http://www.youtube.com/watch?v=2dPfuxb1H8E&output=embed';
     objectToMaterial.icon='ion-ios-film';
     var objectToMaterial2={};
     objectToMaterial2.name='Radiotherapy at the Cedars Cancer Centre';
     objectToMaterial2.description='Booklet';
     objectToMaterial2.sourceType='PDF';
      objectToMaterial2.icon='ion-android-map';
     objectToMaterial2.source='pdfs/radiotherapy_journey.pdf';
     var objectToMaterial3={};
     objectToMaterial3.name='Prostate';
     objectToMaterial3.description='Treatment guidelines';
     objectToMaterial3.sourceType='PDF';
      objectToMaterial3.icon='ion-ios-paper-outline';
     var objectToMaterial4={};
     objectToMaterial4.name='When radiotherapy treatment ends';
     objectToMaterial4.description='Factsheet';
     objectToMaterial4.sourceType='PDF';
      objectToMaterial4.icon='ion-ios-list-outline';
      this.educationalMaterialArray.push(objectToMaterial2);
      this.educationalMaterialArray.push(objectToMaterial);
      this.educationalMaterialArray.push(objectToMaterial3);
      this.educationalMaterialArray.push(objectToMaterial4);

      return this.educationalMaterialArray;


   }


 }




});
