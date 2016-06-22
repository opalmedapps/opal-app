var myApp=angular.module('MUHCApp');
myApp.service('EducationalMaterial',['$filter','LocalStorage','FileManagerService', 'UserPreferences', 'RequestToServer',function ($filter, LocalStorage, FileManagerService,UserPreferences,RequestToServer) {
  //Types of educational material
  var educationalMaterialType={
    'Video':{
      icon:'ion-social-youtube',
      color:'red'
    },
    'Factsheet':{
      icon:'ion-ios-list-outline',
      color:'DarkSlateBlue'
    },
    'Booklet':{
      icon:'ion-android-map',
      color:'SeaGreen'
    },
    'Treatment Guidelines':{
      icon:'ion-android-list',
      color:'SaddleBrown'
    },
    'Other':{
      icon:'fa fa-book',
      color:'DarkSlateGrey'
    }
  };
  function setLanguageEduMaterial(array)
  {
    var language = UserPreferences.getLanguage();
    console.log(array);
    console.log(Object.prototype.toString.call( array ));
    //Check if array
    if (Object.prototype.toString.call( array ) === '[object Array]') {
      for (var i = 0; i < array.length; i++) {
        //set language
        array[i].PhaseInTreatment = (language=='EN')? array[i].PhaseName_EN:array[i].PhaseName_FR;
        array[i].Url = (language=='EN')?array[i].URL_EN:array[i].URL_FR;
        array[i].Name =(language=='EN')? array[i].Name_EN : array[i].Name_FR;
        array[i].ShareURL =(language=='EN')? array[i].ShareURL_EN : array[i].ShareURL_FR;
        array[i].Type = (language=='EN')? array[i].EducationalMaterialType_EN : array[i].EducationalMaterialType_FR;
      }
    }else{
      console.log(array);
      //set language if string
      array.PhaseInTreatment = (language=='EN')? array.PhaseName_EN:array.PhaseName_FR;
      array.Url = (language=='EN')?array.URL_EN:array.URL_FR;
      array.Name =(language=='EN')? array.Name_EN : array.Name_FR;
      array.Type = (language=='EN')? array.EducationalMaterialType_EN : array.EducationalMaterialType_FR;
    }
    return array;
  }
  function getTypeMaterial(edumaterial)
  {
  			if(edumaterial.EducationalMaterialType_EN == 'Video')
  			{
  				return 'url';
  			}else{
  				var index = edumaterial.URL_EN.lastIndexOf('.');
  				var substring=edumaterial.URL_EN.substring(index+1,edumaterial.URL_EN.length);
  				return substring;
  			}
  }
  //Initializing array that represents all the informations for Announcements
  var educationalMaterialArray=[];

  //When there is an update, find the matching material and delete it, its later added by addEducationalMaterial function
  function findAndDeleteEducationalMaterial(edumaterial)
  {
    for (var i = 0; i < edumaterial.length; i++) {
      for (var j = 0; j < educationalMaterialArray.length; j++) {
        if(educationalMaterialArray[j].EducationalMaterialControlSerNum==edumaterial[i].EducationalMaterialControlSerNum)
        {
          educationalMaterialArray.splice(j,1);
        }
      }
    }
  }
  //Formats the input dates and gets it ready for controllers, updates announcementsArray
  function addEducationalMaterial(edumaterial)
  {
    console.log(edumaterial);
    //If announcements are undefined simply return
    if(typeof edumaterial=='undefined') return;
    for (var i = 0; i < edumaterial.length; i++) {
      //Format the date to javascript
      edumaterial[i].DateAdded=$filter('formatDate')(edumaterial[i].DateAdded);
      edumaterial[i].Icon = educationalMaterialType[edumaterial[i].EducationalMaterialType_EN].icon;
      edumaterial[i].Color = educationalMaterialType[edumaterial[i].EducationalMaterialType_EN].color;
      //Add to my annoucements array
      educationalMaterialArray.push(edumaterial[i]);
    }
    console.log(educationalMaterialArray);
    educationalMaterialArray = $filter('orderBy')(educationalMaterialArray, 'DateAdded');
    var temp1 = $filter('filter')(educationalMaterialArray, {PhaseName_EN:'Prior To Treatment'});
    educationalMaterialArray = temp1.concat(($filter('filter')(educationalMaterialArray, {PhaseName_EN:'During Treatment'})).concat($filter('filter')(educationalMaterialArray, {PhaseName_EN:'After Treatment'})));
    //Update local storage section
    LocalStorage.WriteToLocalStorage('EducationalMaterial',educationalMaterialArray);
  }
  return {
    //Setter the announcements from 0
    setEducationalMaterial:function(edumaterial)
    {
      console.log(edumaterial);
      educationalMaterialArray=[];
      addEducationalMaterial(edumaterial)
    },
    isThereEducationalMaterial:function()
    {
      return educationalMaterialArray.length>0;
    },
    //Update the announcements
    updateEducationalMaterial:function(edumaterial)
    {
      //Find and delete to be added later
      console.log(edumaterial);
      findAndDeleteEducationalMaterial(edumaterial);
      //Call formatting function
      addEducationalMaterial(edumaterial);
    },
    //Getter for the main array
    getEducationalMaterial:function()
    {
      return educationalMaterialArray;
    },
    //Gets Last Announcement to display on main tab pages
    getLastEducationalMaterial:function()
    {
      if(educationalMaterialArray.length==0) return null;
      return educationalMaterialArray[0];
    },
    //Gets unread announcements
    getUnreadEducationalMaterials:function()
    {
      var array=[];
      for (var i = 0; i < educationalMaterialArray.length; i++) {
        if(educationalMaterialArray[i].ReadStatus=='0')
        {
          array.push(educationalMaterialArray[i]);
        }
      }
      return array;
    },
    getEducationaMaterialBySerNum:function(serNum)
    {
      console.log(serNum);
      console.log(educationalMaterialArray);
      for (var i = 0; i < educationalMaterialArray.length; i++) {
        if(educationalMaterialArray[i].EducationalMaterialSerNum==serNum)
        {
          return angular.copy(educationalMaterialArray[i]);
        }
      }
    },
    getEducationalMaterialName:function(serNum)
    {
      for (var i = 0; i < educationalMaterialArray.length; i++) {
        if(educationalMaterialArray[i].EducationalMaterialSerNum = serNum )
        {
          return {NameEN: educationalMaterialArray[i].Name_EN, NameFR: educationalMaterialArray[i].Name_FR};
        }
      }
    },
    //Reads announcement and sends request to backend
    readEducationalMaterial:function(serNum)
    {
      for (var i = 0; i < educationalMaterialArray.length; i++) {
        if(educationalMaterialArray[i].EducationalMaterialSerNum==serNum)
        {
          educationalMaterialArray[i].ReadStatus='1';
          LocalStorage.WriteToLocalStorage('EducationalMaterial',educationalMaterialArray);
          RequestToServer.sendRequest('Read',{'Id':serNum, 'Field':'EducationalMaterial'});
        }
      }
    },
    getTypeEducationaMaterial:function(edumaterial)
    {
      return getTypeMaterial(edumaterial);
    },  
    openEducationalMaterial:function(edumaterial)
    {
		  return {Url:'./views/education/individual-material.html'};
    },
    openEducationalMaterialDetails:function(edumaterial)
    {
      var type = getTypeMaterial(edumaterial);
      if (edumaterial.hasOwnProperty('TableContents'))
      {
        return {Url:'./views/education/education-booklet.html'};
      }else{
        if(type == 'url')
        {
          edumaterial = setLanguageEduMaterial(edumaterial);
          FileManagerService.openUrl(edumaterial.Url);
          return -1;
        }else if (type == 'pdf')
        {
          FileManagerService.openPDF(edumaterial.Url);
          return -1;
        }
        else if(type == 'php')
        {
           return {Url:'./views/education/education-individual-page.html'};
        }
      }
    },
    setLanguageEduationalMaterial:function(array)
    {
      console.log('Inside language edumat');
      return setLanguageEduMaterial(array);
    }
  };


  }]);
