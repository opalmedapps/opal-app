// SPDX-FileCopyrightText: Copyright (C) 2015 Opal Health Informatics Group at the Research Institute of the McGill University Health Centre <john.kildea@mcgill.ca>
//
// SPDX-License-Identifier: Apache-2.0

/*
 *Code by David Herrera May 20, 2015
 *Github: dherre3
 *Email:davidfherrerar@gmail.com
 */
import moment from "moment";

var myApp=angular.module('OpalApp');

myApp.filter('removeTitleEducationalMaterial',function()
{
    return function(string)
    {
        var length = string.indexOf("titleMaterialId");
        if(length>-1)
        {
            var preceding = string.substring(0,length+1);
            //Index for first instance of < for heading tag
            var lastIndex = preceding.lastIndexOf('<');
            preceding = preceding.substring(0,preceding.lastIndexOf('<'));
            //index of next closing tag
            var proceeding = string.substring(string.indexOf('>',length+1)+2);
            proceeding = proceeding.substring(proceeding.indexOf('>')+1);
            return preceding.concat(proceeding);
        }else{
            return string;
        }
    };
});

myApp.filter('trustThisUrl',['$sce',function($sce){
    return function(url)
    {
        return $sce.trustAsResourceUrl(url);
    }
}]);

myApp.filter('formatDate',function(){
    return function(str) {
        if(typeof str==='string'){
            return new Date(moment(str).format());
        }
    };
});

myApp.filter('FormatPhoneNumber',function(){
    return function(phone)
    {
        if(typeof phone =='string'&&phone.length==10)
        {
            var firstDigits=phone.substring(0,3);
            var secondDigits=phone.substring(3,6);
            var thirdDigits=phone.substring(6,phone.length);
            return "("+firstDigits+")"+" "+secondDigits+"-"+thirdDigits;
        }else{
            return phone;
        }
    };
});

myApp.filter('capitalizeFirstLetter', function () {
    return function (name) {
        if(name){
            return name.charAt(0) + name.slice(1).toLowerCase();
        }
    }
});

myApp.filter('trustHTML', ['$sce', function ($sce) {
    return function (value) {
        return $sce.trustAsHtml(value);
    };
}]);

myApp.filter('capitalize', function () {
    /**
     * Capitalizes the string
     * @param {string} value String to transform
     */
    return function (value) {
        return value.charAt(0).toUpperCase()+ value.slice(1);
    };
});
