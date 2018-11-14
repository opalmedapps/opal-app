//
// Author David Herrera on Summer 2016, Email:davidfherrerar@gmail.com
//

/**
 * Modification History
 *
 * 2018 Nov: Project: Fertility Educate / Educational Material Packages / Education Material Interaction Logging
 *           Developed by Tongyou (Eason) Yang in Summer 2018
 *           Merged by Stacey Beard
 *           Commit # 6706edfb776eabef4ef4a2c9b69d834960863435
 */

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
myApp.service('EducationalMaterial',['$filter','LocalStorage','FileManagerService', 'UserPreferences',
    'RequestToServer', '$http' ,function ($filter, LocalStorage, FileManagerService, UserPreferences,
                                          RequestToServer, $http) {

    /**
     *@ngdoc property
     *@name  MUHCApp.service.#educationalMaterialArray
     *@propertyOf MUHCApp.service:EducationalMaterial
     *@description Initializing array that represents all the information regarding educational material
     *             for the patient, this array is passed to appropriate controllers.
     **/

    //Initializing array that represents all the informations for Announcements
    var educationalMaterialArray=[];
    //Initializing an object for pfpresources.
    var pfpresources={};
    //Types of educational material
    /**
     *@ngdoc property
     *@name  MUHCApp.service.#educationalMaterialType
     *@propertyOf MUHCApp.service:EducationalMaterial
     *@description Object contains the mapping betweem the type of educational material and the icon and color of the icon for that particular educational material.
     **/
    var educationalMaterialType={
        'Video':{
            icon:'fa fa-film',
            color:'#ef5350'
        },
        'Factsheet':{
            icon:'fa fa-list',
            color:'#1E88E5'
        },
        'Booklet':{
            icon:'fa fa-leanpub',
            color:'#66BB6A'
        },
        'Treatment Guidelines':{
            icon:'fa fa-list-ol',
            color:'#7E57C2'
        },
        'Other':{
            icon:'fa fa-book',
            color:'#FF7043'
        },
        'TestingType':{
            icon:'fa fa-question',
            color:'#818181'
        },
        'Package':{
            icon:'fa fa-cube',
            color:'#8A5B45'
        }
    };
    function setLanguageEduMaterial(array)
    {
        var language = UserPreferences.getLanguage();

        if (!array.hasOwnProperty("Language")) {
            array.Language = language;
        }

        //Check if array
        if (Object.prototype.toString.call( array ) === '[object Array]') {
            if (array.Language != language) {
                array.forEach(function (element) {
                    delete element.Content;
                });
                array.Language = language;
            }
            for (var i = 0; i < array.length; i++) {
                //set language
                array[i].PhaseInTreatment = (language ==='EN')? array[i].PhaseName_EN:array[i].PhaseName_FR;
                array[i].Url = (language ==='EN')?array[i].URL_EN:array[i].URL_FR;
                array[i].Name =(language==='EN')? array[i].Name_EN : array[i].Name_FR;
                array[i].ShareURL =(language ==='EN')? array[i].ShareURL_EN : array[i].ShareURL_FR;
                array[i].Type = (language ==='EN')? array[i].EducationalMaterialType_EN : array[i].EducationalMaterialType_FR;
            }
        }else{
            //set language if string
            if (array.Language != language) {
                delete array.Content;
                array.Language = language;
            }
            array.PhaseInTreatment = (language ==='EN')? array.PhaseName_EN:array.PhaseName_FR;
            array.Url = (language ==='EN')?array.URL_EN:array.URL_FR;
            array.Name =(language ==='EN')? array.Name_EN : array.Name_FR;
            array.Type = (language ==='EN')? array.EducationalMaterialType_EN : array.EducationalMaterialType_FR;
        }
        //console.log('Set edu material language:');
        //console.log(array);
        return array;
    }
    function getTypeMaterial(edumaterial)
    {
        if(edumaterial.EducationalMaterialType_EN === 'Video')
        {
            return 'url';
        }else{
            var index = edumaterial.URL_EN.lastIndexOf('.');
            return edumaterial.URL_EN.substring(index + 1, edumaterial.URL_EN.length);
        }
    }

    //When there is an update, find the matching material and delete it, its later added by addEducationalMaterial function
    function findAndDeleteEducationalMaterial(edumaterial)
    {
        for (var i = 0; i < edumaterial.length; i++) {
            for (var j = 0; j < educationalMaterialArray.length; j++) {
                if (educationalMaterialArray[j].EducationalMaterialControlSerNum == edumaterial[i].EducationalMaterialControlSerNum) {
                    educationalMaterialArray.splice(j, 1);
                }
            }
        }
    }
    // Returns educational material object matching that EducationalMaterialSerNum parameter
    // is returned as a service function in return{} section: getEducationaMaterialBySerNum
    function getEducationalMaterialByControlSerNum(cserNum)
    {


        for (var i = 0; i < educationalMaterialArray.length; i++) {
            if(educationalMaterialArray[i].EducationalMaterialControlSerNum==cserNum)
            {
                return angular.copy(educationalMaterialArray[i]);
            }
        }
    }
    //Formats the input dates and gets it ready for controllers, updates announcementsArray
    function addEducationalMaterial(edumaterial)
    {
        //If announcements are undefined simply return
        if(typeof edumaterial == 'undefined') return;
        for (var i = 0; i < edumaterial.length; i++) {
            //Format the date to javascript
            edumaterial[i].DateAdded=$filter('formatDate')(edumaterial[i].DateAdded);



            edumaterial[i].Icon = educationalMaterialType[edumaterial[i].EducationalMaterialType_EN].icon;
            edumaterial[i].Color = educationalMaterialType[edumaterial[i].EducationalMaterialType_EN].color;
            //Add to my annoucements array
            educationalMaterialArray.push(edumaterial[i]);
        }
        educationalMaterialArray = $filter('orderBy')(educationalMaterialArray, 'DateAdded');
        var temp1 = $filter('filter')(educationalMaterialArray, {PhaseName_EN:'Prior To Treatment'});
        educationalMaterialArray = temp1.concat(($filter('filter')(educationalMaterialArray, {PhaseName_EN:'During Treatment'})).concat($filter('filter')(educationalMaterialArray, {PhaseName_EN:'After Treatment'})));

        //Get pfpresources
        pfpresources=getEducationalMaterialByControlSerNum(310);
        //Exclude the pfp resources
        findAndDeleteEducationalMaterialByControlSerNum(educationalMaterialArray, 310);



        //Update local storage section
        LocalStorage.WriteToLocalStorage('EducationalMaterial',educationalMaterialArray);
        LocalStorage.WriteToLocalStorage('PfpResources',pfpresources);
    }

    //call this function to delete the certain educational material by indicate its control sernum
    function findAndDeleteEducationalMaterialByControlSerNum(edumaterial, csernum)
    {
        for (var i = 0; i < edumaterial.length; i++) {
            //
            //
            if(edumaterial[i].EducationalMaterialControlSerNum == csernum) {
                //
                edumaterial.splice(i,1);
            }
        }
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
        materialExists:function()
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
                if(educationalMaterialArray[i].ReadStatus ==='0')
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
                if(educationalMaterialArray[i].EducationalMaterialSerNum === serNum )
                {
                    return {NameEN: educationalMaterialArray[i].Name_EN, NameFR: educationalMaterialArray[i].Name_FR};
                }
            }
        },

        // Sends a request to the backend to mark the row numbered 'serNum' of the table EducationalMaterial as read.
        // Author: Tongyou (Eason) Yang
        readMaterial:function(serNum)
        {
            RequestToServer.sendRequestWithResponse('Read',{'Id':serNum, 'Field':'EducationalMaterial'})
            // // For testing
            // .then((res)=>{
            //     console.log(res);
            //     ons.notification.alert({message:"Set EducationalMaterial row "+serNum+" as read."});
            // }).catch((err)=>{
            //     console.log("Failed to set EducationalMaterial row "+serNum+" as read due to error:");
            //     console.log(err);
            // });
        },

        // Logs when a user clicks on an educational material.
        // Author: Tongyou (Eason) Yang, modified by Stacey Beard
        // Previously called writeClickedRequest()
        logClickedEduMaterial:function(EducationalMaterialControlSerNum)
        {
            return RequestToServer.sendRequestWithResponse('LogPatientAction', {
                'Action': 'CLICKED',
                'RefTable': 'EducationalMaterialControl',
                'RefTableSerNum': EducationalMaterialControlSerNum,
                'ActionTime': $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            })
            // // For testing
            // .then((res)=>{
            //     console.log(res);
            //     ons.notification.alert({message:"Successfully wrote CLICKED in DB"});
            // })
            // .catch((err)=>{
            //     console.log('Error in logClickedEduMaterial.');
            //     console.log(err);
            // });
        },

        // Logs when a user scrolls to the bottom of an educational material.
        // Author: Tongyou (Eason) Yang, modified by Stacey Beard
        // Previously called writeScrollToBottomRequest()
        logScrolledToBottomEduMaterial:function(EducationalMaterialControlSerNum){

            return RequestToServer.sendRequestWithResponse('LogPatientAction', {
                'Action': 'SCROLLED_TO_BOTTOM',
                'RefTable': 'EducationalMaterialControl',
                'RefTableSerNum': EducationalMaterialControlSerNum,
                'ActionTime': $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            })
            // // For testing
            // .then((res)=>{
            //     console.log(res);
            //     ons.notification.alert({message:"Successfully wrote SCROLLED_TO_BOTTOM in DB"});
            // })
            // .catch((err)=>{
            //     console.log('Error in logScrolledToBottomEduMaterial.');
            //     console.log(err);
            // });
        },

        // Logs when a user scrolls to the bottom of an educational sub-material (material contained in a booklet).
        // Author: Tongyou (Eason) Yang, modified by Stacey Beard
        // Previously called writeSubScrollToBottomRequest()
        logSubScrolledToBottomEduMaterial:function(EducationalMaterialTOCSerNum){

            return RequestToServer.sendRequestWithResponse('LogPatientAction', {
                'Action': 'SCROLLED_TO_BOTTOM',
                'RefTable': 'EducationalMaterialTOC',
                'RefTableSerNum': EducationalMaterialTOCSerNum,
                'ActionTime': $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            })
            // // For testing
            // .then((res)=>{
            //     console.log(res);
            //     ons.notification.alert({message:"Successfully wrote SCROLLED_TO_BOTTOM in DB"});
            // })
            // .catch((err)=>{
            //     console.log('Error in logSubScrolledToBottomEduMaterial.');
            //     console.log(err);
            // });
        },

        // Logs when a user clicks on an educational sub-material (material contained in a booklet).
        // Author: Tongyou (Eason) Yang, modified by Stacey Beard
        // Previously called writeSubClickedRequest()
        logSubClickedEduMaterial:function(EducationalMaterialTOCSerNum){

            return RequestToServer.sendRequestWithResponse('LogPatientAction', {
                'Action': 'CLICKED',
                'RefTable': 'EducationalMaterialTOC',
                'RefTableSerNum': EducationalMaterialTOCSerNum,
                'ActionTime': $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            })
            // // For testing
            // .then((res)=>{
            //     console.log(res);
            //     ons.notification.alert({message:"Successfully wrote CLICKED in DB"});
            // })
            // .catch((err)=>{
            //     console.log('Error in logSubClickedEduMaterial.');
            //     console.log(err);
            // });
        },

        // Logs when a user clicks back from an educational material.
        // Author: Tongyou (Eason) Yang, modified by Stacey Beard
        // Previously called writeClickedBackRequest()
        logClickedBackEduMaterial:function(EducationalMaterialControlSerNum){

            return RequestToServer.sendRequestWithResponse('LogPatientAction', {
                'Action': 'CLICKED_BACK',
                'RefTable': 'EducationalMaterialControl',
                'RefTableSerNum': EducationalMaterialControlSerNum,
                'ActionTime': $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            })
            // // For testing
            // .then((res)=>{
            //     console.log(res);
            //     ons.notification.alert({message:"Successfully wrote CLICKED_BACK in DB"});
            // })
            // .catch((err)=>{
            //     console.log('Error in logClickedBackEduMaterial.');
            //     console.log(err);
            // });
        },

        // Logs when a user clicks back from an educational sub-material (material contained in a booklet).
        // Author: Tongyou (Eason) Yang, modified by Stacey Beard
        // Previously called writeSubClickedBackRequest()
        logSubClickedBackEduMaterial:function(EducationalMaterialTOCSerNum){

            return RequestToServer.sendRequestWithResponse('LogPatientAction', {
                'Action': 'CLICKED_BACK',
                'RefTable': 'EducationalMaterialTOC',
                'RefTableSerNum': EducationalMaterialTOCSerNum,
                'ActionTime': $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            })
            // // For testing
            // .then((res)=>{
            //     console.log(res);
            //     ons.notification.alert({message:"Successfully wrote CLICKED_BACK in DB"});
            // })
            // .catch((err)=>{
            //     console.log('Error in logSubClickedBackEduMaterial.');
            //     console.log(err);
            // });
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
         *@name getPfpResources
         *@methodOf MUHCApp.service:EducationalMaterial
         *@description Returns the resources booklet for 'Patients for Patients'
         *@returns {String} Returns Url for individual educational materials
         **/
        getPfpResources:function()
        {
            return pfpresources;
        },

        getMaterialBinary:function(url){
            var config = { responseType: 'blob' };
            return $http.get(url, config)

        },


        getMaterialPage:function(url){
            return $http.get(url);
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
         *@name setLanguage
         *@methodOf MUHCApp.service:EducationalMaterial
         *@param {Array} array Array with educational material
         *@description Translates the array parameter containing educational material to appropiate preferred language specified in {@link MUHCApp.service:UserPreferences UserPreferences}.
         *@returns {Array} Returns array with translated values
         **/
        setLanguage:function(array)
        {

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
