// SPDX-FileCopyrightText: Copyright (C) 2016 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

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

var myApp=angular.module('OpalApp');
/**
 *@ngdoc service
 *@requires $q
 *@requires $filter
 *@description Sets the educational material and provides an API to interact with it and the server
 **/
myApp.service('EducationalMaterial',['$q','$filter','LocalStorage','FileManagerService', 'UserPreferences',
    'RequestToServer', '$http', 'Logger', 'Params',

function ($q, $filter, LocalStorage, FileManagerService, UserPreferences, RequestToServer, $http, Logger, Params) {

    // Title mapping depending on educational material category
    const CATEGORY_TITLE_MAP = {
        clinical: 'EDUCATION_SHORT',
        research: 'RESEARCH_REFERENCE_SHORT',
    };

    /**
     *@ngdoc property
     *@description Initializing array that represents all the information regarding educational material
     *             for the patient, this array is passed to appropriate controllers.
     **/
    var educationalMaterialArray=[];

    /**
     *@ngdoc property
     *@description Object contains the mapping between the type of educational material and the icon and color of the icon for that particular educational material.
     **/
    var educationalMaterialType = Params.educationalMaterial;

    function setLanguageEduMaterial(materials)
    {
        let language = UserPreferences.getLanguage();
        let materialList = Array.isArray(materials) ? materials : [materials];

        materialList.forEach(material => {
            // Delete content to be re-downloaded later in the right language (when switching languages)
            delete material.Content;
            material.Url = material[`URL_${language}`];
            material.Name = material[`Name_${language}`];
            material.ShareURL = material[`ShareURL_${language}`];
            material.Type = material[`EducationalMaterialType_${language}`];
        });

        return materials;
    }

    /**
     * @description Obtains the type of display to use for a given educational material. For example, a material
     *              ending in '.php' should be displayed as an embedded HTML page.
     * @param {Object} edumaterial The material for which to get the display type.
     * @returns {string} A string representing the type of display to use (such as 'pdf', 'html', 'video', etc.).
     **/
    function getDisplayType(edumaterial)
    {
        let type;

        if (edumaterial.hasOwnProperty('TableContents')) type = 'booklet';
        else if (edumaterial.EducationalMaterialType_EN === 'Video') type = 'video';
        else if (edumaterial.EducationalMaterialType_EN === 'Package') type = 'package';
        else {
            // In the remaining cases, use the material's file extension
            type = FileManagerService.getFileExtension(edumaterial[`URL_${UserPreferences.getLanguage()}`]);

            if (type === 'php') type = 'html';  // A php extension should be displayed as html
            else if (type !== 'pdf') type = 'link';  // All other extensions (including no extension, but excluding pdf) should default to a link
        }

        return type;
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

    //Formats the input dates and gets it ready for controllers, updates educationalMaterialArray
    function addEducationalMaterial(edumaterial)
    {
        //If educational materials are undefined simply return
        if(typeof edumaterial == 'undefined') return;
        for (var i = 0; i < edumaterial.length; i++) {
            //Format the date to javascript
            edumaterial[i].DateAdded=$filter('formatDate')(edumaterial[i].DateAdded);

            // Attach the icons and colours to the educational material contents.
            if(educationalMaterialType[edumaterial[i].EducationalMaterialType_EN]) {
                edumaterial[i].Icon = educationalMaterialType[edumaterial[i].EducationalMaterialType_EN].icon;
                edumaterial[i].Color = educationalMaterialType[edumaterial[i].EducationalMaterialType_EN].color;
            }
            else{
                edumaterial[i].Icon = educationalMaterialType['Other'].icon;
                edumaterial[i].Color = educationalMaterialType['Other'].color;
            }

            //Add to educational material array
            educationalMaterialArray.push(edumaterial[i]);
        }



        //Update local storage section
        LocalStorage.WriteToLocalStorage('EducationalMaterial',educationalMaterialArray);
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

    /**
     * @ngdoc method
     * @name hasReachedBottomOfScreen
     * @author Stacey Beard, based on work by Tongyou (Eason) Yang
     * @date 2018-11-29
     * @description Tests whether the user has reached the bottom of the page, either by scrolling down or by
     *              default if the page is too short to scroll.

     * @param {Object} documentElement object returned by a function call such as "document.getElementById(index)"
     * @param {*} documentElement.scrollHeight height of the material
     * @param {*} documentElement.scrollTop position of the top of our 'window' on the material
     * @param {*} documentElement.clientHeight height of our 'window' on the material

     * @returns {boolean} True if the user has reached the bottom of the screen; false if not.
     **/
    function hasReachedBottomOfScreen(documentElement){
        // Check whether the user has reached the bottom of the screen.
        // Smaller than 1 is used instead of equals 0 to make sure the check doesn't fail due to
        // decimals (since $.scrollHeight and $.clientHeight are integers but $.scrollTop is not).

        var spaceToTheBottomOfTheScreen = documentElement.scrollHeight - (documentElement.scrollTop + documentElement.clientHeight);

        if(spaceToTheBottomOfTheScreen < 1) return true;
        else return false;
    }

    return {
        /**
         *@ngdoc method
         *@name setEducationalMaterial
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
         *@name materialExists
         *@param {String} eduCategory String indicating the type of material, eg: 'clinical' (default) or 'research'
         *@description Checks whether educational material exists
         *@return {Boolean} Returns whether the patient has any educational material available.
         **/
        materialExists:function(eduCategory='clinical')
        {
            //Check if the educational material array has any elements
            return educationalMaterialArray.some(eduMaterial => eduMaterial.Category  === eduCategory);
        },
        /**
         *@ngdoc method
         *@name updateEducationalMaterial
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
         *@param {String} eduCategory String indicating the type of material, eg: 'clinical' (default) or 'research'
         *@description Getter for the educational material
         *@returns {Array} Returns array containing educational material
         **/
        getEducationalMaterial:function(eduCategory='clinical')
        {
            let educationalMaterialArrayByCategory = [];

            educationalMaterialArray.forEach(function(edumaterial){
                // get material for specified category
                if(edumaterial.Category === eduCategory){
                    educationalMaterialArrayByCategory.push(edumaterial);
                }
            });

            return educationalMaterialArrayByCategory;
        },

        /**
         *@ngdoc method
         *@name getEducationaMaterialBySerNum
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
         *@name readEducationalMaterial
         *@param {String} serNum EducationalMaterialSerNum to be read
         *@description Sets ReadStatus in educational material to 1, sends request to backend, and syncs with device storage
         **/
        readEducationalMaterial:function(serNum) {
            for (var i = 0; i < educationalMaterialArray.length; i++) {
                if (educationalMaterialArray[i].EducationalMaterialSerNum == serNum) {
                    educationalMaterialArray[i].ReadStatus = '1';
                    LocalStorage.WriteToLocalStorage('EducationalMaterial', educationalMaterialArray);
                    RequestToServer.sendRequest('Read', {'Id': serNum, 'Field': 'EducationalMaterial'});
                }
            }
        },

        /**
         * @ngdoc method
         * @name logScrolledToBottomIfApplicable
         * @author Stacey Beard, based on work by Tongyou (Eason) Yang
         * @date 2018-11-29
         * @description Tests whether the user has reached the bottom of the page, either by scrolling down or by
         *              default if the page is too short to scroll. If they have reached the bottom, calls a function
         *              to log the scroll in the database.

         * @param {Object} documentElement object returned by a function call such as "document.getElementById(index)"
         * @param {*} documentElement.scrollHeight height of the material
         * @param {*} documentElement.scrollTop position of the top of our 'window' on the material
         * @param {*} documentElement.clientHeight height of our 'window' on the material
         * @param {Object} serNum object containing the serNum to use in the logging
         * @param {*} serNum.EducationalMaterialTOCSerNum optional: if used, logSubScrolledToBottomEduMaterial
         *                                                          will be called
         * @param {*} serNum.EducationalMaterialControlSerNum optional: if used, logScrolledToBottomEduMaterial
         *                                                              will be called

         * @returns {boolean} True if a log request was sent; false if it was not.
         **/
        logScrolledToBottomIfApplicable:function(documentElement, serNum){

            if(hasReachedBottomOfScreen(documentElement)){

                // Logs the material as scrolled to the bottom, checking first if it is a material or a TOC sub-material.
                if (serNum.EducationalMaterialTOCSerNum){
                    Logger.logSubScrolledToBottomEduMaterial(serNum.EducationalMaterialTOCSerNum);
                    return true;
                }
                if (serNum.EducationalMaterialControlSerNum){
                    Logger.logScrolledToBottomEduMaterial(serNum.EducationalMaterialControlSerNum);
                    return true;
                }
            }
            return false;
        },

        getDisplayType: getDisplayType,

        /**
         *@ngdoc method
         *@name getEducationalMaterialUrl
         *@description Returns educational material url to be used by the {@link OpalApp.service:Notifications Notifications Service}.
         *@returns {String} Returns Url for individual educational materials
         **/
        getEducationalMaterialUrl:function()
        {
            return './views/personal/education/individual-material.html';
        },

        getMaterialPage:function(url){
            return $http.get(url);
        },
        /**
         *@ngdoc method
         *@name openEducationalMaterialDetails
         *@param {Object} edumaterial Educational material to be opened
         *@returns {Object} Return -1 if the material is to be opened by a cordova plugin, or the url the opening page if its to be opened and displayed by the app.
         *@description Opens educational material in parameter.
         **/
        openEducationalMaterialDetails:function(edumaterial)
        {
            //Get type of material
            let type = getDisplayType(edumaterial);

            if (type === "booklet") return {Url:'./views/personal/education/education-booklet.html'};
            else if (type === 'link')
            {
                // If it's a url, set the language, then open the url in another page
                edumaterial = setLanguageEduMaterial(edumaterial);
                FileManagerService.openUrl(edumaterial.Url);
                return -1;
            }
            else if (type === 'html') return {Url:'./views/personal/education/education-individual-page.html'};
            else return -1;
        },

        /**
         * @description Special case of "openEducationalMaterialDetails" for opening pdfs.
         *              Opens a pdf, and logs the fact that the pdf button was pressed.
         * @param eduMaterial The educational material representing the pdf to open.
         * @returns {Promise<void>} Resolves on success or rejects if an error occurs in "openPDF".
         */
        openEducationalMaterialPDF: async function (eduMaterial) {
            // Validate input
            let type = getDisplayType(eduMaterial);
            if (type !== 'pdf') throw `openEducationalMaterialPDF should only be used on pdfs; tried to call it on type = ${type}`;

            // Log the fact that the user clicked on the pdf download button
            Logger.logClickedPdfEduMaterial(eduMaterial.EducationalMaterialControlSerNum);

            // Use the file manager service to open the material
            let fileName = eduMaterial.Url.substring(eduMaterial.Url.lastIndexOf('/') + 1);
            await FileManagerService.openPDF(eduMaterial.Url, fileName);
        },

        /**
         * getPackageContents
         * @author Stacey Beard
         * @date 2018-11-19
         * @desc Gets an educational material package's contents in 2 steps:
         *       1. Sends a request to the server to get the contents of an educational material package.
         *       2. Adds the icon and color to each package material based on its type.
         * @param educationalMaterialControlSerNum The SerNum of the package for which to get the contents.
         * @returns {*}
         */
        getPackageContents:function(educationalMaterialControlSerNum)
        {
            let deferred = $q.defer();
            RequestToServer.sendRequestWithResponse('EducationalPackageContents', {
                'EducationalMaterialControlSerNum': educationalMaterialControlSerNum
            }).then((response)=>{
                let packageContents = response.Data;
                // Attach the icons and colours to the package contents.
                if (packageContents) {
                    packageContents.forEach((content) => {
                        if(educationalMaterialType[content.EducationalMaterialType_EN]) {
                            content.Icon = educationalMaterialType[content.EducationalMaterialType_EN].icon;
                            content.Color = educationalMaterialType[content.EducationalMaterialType_EN].color;
                        }
                        else{
                            content.Icon = educationalMaterialType['Other'].icon;
                            content.Color = educationalMaterialType['Other'].color;
                        }
                    });
                    deferred.resolve(packageContents);
                } else {
                    deferred.resolve([]);
                }

            }).catch((err)=>{
                deferred.reject(err);
            });
            return deferred.promise;
        },
        /**
         *@ngdoc method
         *@name setLanguage
         *@param {Array} array Array with educational material
         *@description Translates the array parameter containing educational material to appropriate preferred language specified in {@link OpalApp.service:UserPreferences UserPreferences}.
         *@returns {Array} Returns array with translated values
         **/
        setLanguage:function(array)
        {

            return setLanguageEduMaterial(array);
        },
        /**
         *@ngdoc method
         *@name clearEducationalMaterial
         *@description Clears the service of any saved state, function used by the {@link OpalApp.controller:LogoutController LogoutController}
         **/
        clearEducationalMaterial:function()
        {
            educationalMaterialArray=[];
        },
        /**
         *@ngdoc method
         *@name getEducationalMaterialTitle
         *@param {String} eduCategory String indicating the type of material, eg: 'clinical' (default) or 'research'
         *@description Gets title for the education views that corresponds to the educational category param.
         *@returns {String} The translated title for the education views
         **/
        getEducationalMaterialTitle:function(eduCategory='clinical')
        {
            return $filter('translate')(CATEGORY_TITLE_MAP[eduCategory]);
        },
    };
}]);
