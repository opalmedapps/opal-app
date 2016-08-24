//
// Author David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//
var myApp=angular.module('MUHCApp');
/**
*@ngdoc service
*@name MUHCApp.service:EducationalMaterial
*@requires MUHCApp.service:UserPreferences
*@requires MUHCApp.service:RequestToServer
*@requires MUHCApp.service:LocalStorage
*@requires MUHCApp.service:FileManagerService
*@requires $filter
*@description Sets the educational material and provides an API to interact with it and the server
**/
myApp.service('EducationalMaterial',['$filter','LocalStorage','FileManagerService', 'UserPreferences', 'RequestToServer',function ($filter, LocalStorage, FileManagerService,UserPreferences,RequestToServer) {
  
  /**
  *@ngdoc property
  *@name  MUHCApp.service.#educationalMaterialArray
  *@propertyOf MUHCApp.service:EducationalMaterial
  *@description Initializing array that represents all the information regarding educational material for the patient, this array is passed to appropiate controllers.
  **/
    //Initializing array that represents all the informations for Announcements
  var educationalMaterialArray=[];
  //Types of educational material
  /**
  *@ngdoc property
  *@name  MUHCApp.service.#educationalMaterialType
  *@propertyOf MUHCApp.service:EducationalMaterial
  *@description Object contains the mapping betweem the type of educational material and the icon and color of the icon for that particular educational material.
  **/
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
    /**
		*@ngdoc method
		*@name setEducationalMaterial
		*@methodOf MUHCApp.service:EducationalMaterial
		*@param {Object} edumaterial Educational Material array from firebase used to set the educational materials for the patient
		*@description Setter method for educational materials, orders the materials chronogically descending, and converts dates to javascript date objects
		**/
    setEducationalMaterial:function(edumaterial)
    {
      console.log(edumaterial);
      educationalMaterialArray=[];
      addEducationalMaterial(edumaterial);
    },
     /**
		*@ngdoc method
		*@name isThereEducationalMaterial
		*@methodOf MUHCApp.service:EducationalMaterial
		*@description Setter method for educational material
    *@return {Boolean} Returns whether the patient has any educational material available.
		**/
    isThereEducationalMaterial:function()
    {
      //Check if the educationa material array has any elements
      return educationalMaterialArray.length>0;
    },
      /**
		*@ngdoc method
		*@name updateEducationalMaterial
		*@methodOf MUHCApp.service:EducationalMaterial
    *@param {Array} edumaterial Array containing latest educational material to add or update existing array of materials.
		*@description Update method for educational material
		**/
    updateEducationalMaterial:function(edumaterial)
    {
      //Find and delete to be added later
      console.log(edumaterial);
      findAndDeleteEducationalMaterial(edumaterial);
      //Call formatting function
      addEducationalMaterial(edumaterial);
    },
    //Getter for the main array
    /**
		*@ngdoc method
		*@name getEducationalMaterial
		*@methodOf MUHCApp.service:EducationalMaterial
    *@description Getter for the educational material
		*@returns {Array} Returns array containing educational material
		**/
    getEducationalMaterial:function()
    {
      return educationalMaterialArray;
    },
      /**
		*@ngdoc method
		*@name getUnreadEducationalMaterials
		*@methodOf MUHCApp.service:EducationalMaterial
    *@description Filters the educationalMaterialArray by a ReadStatus of '0'.
		*@returns {Array} Returns array containing unread educational material
		**/
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
    /**
		*@ngdoc method
		*@name getEducationaMaterialBySerNum
		*@methodOf MUHCApp.service:EducationalMaterial
    *@params {String} serNum EducationalMaterialSerNum
		*@returns {Object} Returns educational material object matching that EducationalMaterialSerNum parameter
		**/
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
    /**
		*@ngdoc method
		*@name getEducationalMaterialName
		*@methodOf MUHCApp.service:EducationalMaterial
		*@param {String} serNum EducationalMaterialSerNum to be read
		*@description Gets the Name_EN, and Name_FR for the notifications
		*@returns {Object} Returns object containing only the names for a particular educational material, used by the {@link MUHCApp.service:Notifications Notifications Service} 
		**/
    getEducationalMaterialName:function(serNum)
    {
      for (var i = 0; i < educationalMaterialArray.length; i++) {
        if(educationalMaterialArray[i].EducationalMaterialSerNum == serNum )
        {
          return {NameEN: educationalMaterialArray[i].Name_EN, NameFR: educationalMaterialArray[i].Name_FR};
        }
      }
    },
    //Reads announcement and sends request to backend
    /**
		*@ngdoc method
		*@name readEducationalMaterial
		*@methodOf MUHCApp.service:EducationalMaterial
		*@param {String} serNum EducationalMaterialSerNum to be read
		*@description Sets ReadStatus in educational material to 1, sends request to backend, and syncs with device storage
		**/
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
    /**
		*@ngdoc method
		*@name readEducationalMaterial
		*@methodOf MUHCApp.service:EducationalMaterial
		*@param {Object} edumaterial EducationalMaterialSerNum
		*@description Obtains the type for that particular educational material
    *@returns {String} Returns string containing the appropiate type or link to open the educational material
		**/
    getTypeEducationaMaterial:function(edumaterial)
    {
      return getTypeMaterial(edumaterial);
    },  
    /**
		*@ngdoc method
		*@name getEducationalMaterialUrl
		*@methodOf MUHCApp.service:EducationalMaterial
		*@description Returns educational material url to be used by the {@link MUHCApp.service:Notifications Notifications Service}.
		*@returns {String} Returns Url for individual educational materials
		**/
    getEducationalMaterialUrl:function()
    {
		  return {Url:'./views/education/individual-material.html'};
    },
    /**
		*@ngdoc method
		*@name openEducationalMaterialDetails
		*@methodOf MUHCApp.service:EducationalMaterial
    *@param {Object} edumaterial Educational material to be opened
    *@returns {Object} Return -1 if the material is to be opened by a cordova plugin, or the url the opening page if its to be opened and displayed by the app.
		*@description Opens educational material in parameter.
		**/
    openEducationalMaterialDetails:function(edumaterial)
    {
      //Get type of material
      var type = getTypeMaterial(edumaterial);
      if (edumaterial.hasOwnProperty('TableContents'))
      {
        //If its a booklet return url to redirect
        return {Url:'./views/education/education-booklet.html'};
      }else{
        if(type == 'url')
        {
          //If its a url, set the language, then open the url in another page
          edumaterial = setLanguageEduMaterial(edumaterial);
          FileManagerService.openUrl(edumaterial.Url);
          return -1;
        }else if (type == 'pdf')
        {
          //If its a pdf, the use the file manager service to open the material and return -1
          FileManagerService.openPDF(edumaterial.Url);
          return -1;
        }
        else if(type == 'php')
        {
           return {Url:'./views/education/education-individual-page.html'};
        }
      }
    },
     /**
		*@ngdoc method
		*@name setLanguageEduationalMaterial
		*@methodOf MUHCApp.service:EducationalMaterial
		*@param {Array} array Array with educational material
		*@description Translates the array parameter containing educational material to appropiate preferred language specified in {@link MUHCApp.service:UserPreferences UserPreferences}.
		*@returns {Array} Returns array with translated values
		**/
    setLanguageEduationalMaterial:function(array)
    {
      console.log('Inside language edumat');
      return setLanguageEduMaterial(array);
    },
    /**
		*@ngdoc method
		*@name clearEducationalMaterial
		*@methodOf MUHCApp.service:EducationalMaterial
		*@description Clears the service of any saved state, function used by the {@link MUHCApp.controller:LogoutController LogoutController}
		**/
    clearEducationalMaterial:function()
    {
      educationalMaterialArray=[];
    }
  };


  }]);
