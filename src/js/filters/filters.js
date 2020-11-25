/*
 *Code by David Herrera May 20, 2015
 *Github: dherre3
 *Email:davidfherrerar@gmail.com
 */
import moment from "moment";

var myApp=angular.module('MUHCApp');

myApp.filter('notifications',function(){
    return function(input){
        if(input==='DoctorNote'){
            return 'Doctor Note';
        }else if(input==='DocumentReady'){
            return 'Document Ready';
        }else if(input==='AppointmentChange'){
            return 'Appointment Change';
        }

    };
});

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

myApp.filter('formatDateAppointmentTask',function($filter){
    return function(dateApp)
    {
        var today=new Date();
        if(typeof dateApp!=='undefined'){
            if(dateApp.getFullYear()==today.getFullYear())
            {
                return $filter('date')(dateApp,"EEE MMM d 'at' h:mm a");
            }else{
                return $filter('date')(dateApp,"EEE MMM d yyyy");
            }
        }else{
            return '';
        }
    };
});

myApp.filter('formatDateDicom',function($filter){
    return function(date)
    {
        var year = date.substring(0,4);
        var month = date.substring(4,6);
        var day = date.substring(6,8);

        return year + '-' + month + '-' + day;
    };
});

myApp.filter('formatDateToFirebaseString',function(){
    return function(date){
        var month=date.getMonth()+1;
        var year=date.getFullYear();
        var day=date.getDate();
        var minutes=date.getMinutes();
        var seconds=date.getSeconds();
        var hours=date.getHours();
        return year + '-' + month + '-' + day + 'T' + hours + ':' + minutes + ':' + seconds + '.000' + 'Z';
    }
});


myApp.filter('formatDate',function(){
    return function(str) {
        if(typeof str==='string'){
            return new Date(moment(str).format());
        }
    };
});

myApp.filter('ellipsis', function () {
    return function (text, length) {
        if (text && text.length > length) {
            var subtext = text.substr(0, length);
            var index = subtext.lastIndexOf(" ");
            return subtext.substr(0, index) + "...";
        }
        return text;
    };
});

myApp.filter('dateEmail',function($filter){
    return function(date){
        if(Object.prototype.toString.call(date) === '[object Date]')
        {
            var day=date.getDate();
            var month=date.getMonth();
            var year=date.getFullYear();
            var newDate=new Date();
            if(newDate.getMonth()==month&&newDate.getFullYear()==year)
            {
                if(day==newDate.getDate())
                {
                    return 'Today, ' +$filter('date')(date, 'h:mm a');
                }else if(day-newDate.getDate()==1){
                    return 'Yesterday';
                }else{
                    return $filter('date')(date, 'dd/MM/yyyy');
                }
            }else{
                return $filter('date')(date, 'dd/MM/yyyy');
            }
        }else{
            return date;
        }
    };
});

myApp.filter('limitLetters',function($filter){
    return function(string,num)
    {
        if(string&&typeof string!=='undefined'&&string.length>num)
        {
            string=$filter('limitTo')(string,num);
            string=string+'...';
        }
        return string;
    };
});

myApp.filter('propsFilter', function() {
    return function(items, props) {
        var out = [];
        if (angular.isArray(items)) {
            items.forEach(function(item) {
                var itemMatches = false;
                var keys = Object.keys(props);
                for (var i = 0; i < keys.length; i++) {
                    var prop = keys[i];
                    var text = props[prop].toLowerCase();
                    if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                        itemMatches = true;
                        break;
                    }
                }
                if (itemMatches) {
                    out.push(item);
                }
            });
        } else {
            // Let the output be the input untouched
            out = items;
        }
        return out;
    };
});

myApp.filter('filterDateLabTests',function()
{
    return function(items,option)
    {
        var ret=[];
        if(option=='All')
        {
            return items;
        }else if(option=='LastTwoMonths'){
            var lastTwoMonths=new Date();
            lastTwoMonths.setMonth(lastTwoMonths.getMonth()-2);
            for (var i = 0; i < items.length; i++) {
                if(items[i].testDateFormat > lastTwoMonths)
                {
                    ret.push(items[i]);
                }
            }
            return ret;
        }else if(option=='LastTwelveMonths'){
            var lastTwelveMonths=new Date();
            lastTwelveMonths.setFullYear(lastTwelveMonths.getFullYear()-1);
            for (var i = 0; i < items.length; i++) {
                if(items[i].testDateFormat>lastTwelveMonths)
                {
                    ret.push(items[i]);
                }
            }
            return ret;
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

myApp.filter('standardDate', function($filter){
    return function (date) {
        return $filter('date')(date, 'EEE MMM dd yyyy')
    }
});

myApp.filter('capitalizeFirstLetter', function () {
    return function (name) {
        if(name){
            return name.charAt(0) + name.slice(1).toLowerCase();
        }
    }
});

myApp.filter('FormatEditPhoneNumber',function(){
    return function(phone)
    {
        if(typeof phone =='string')
        {
            var phoneLength = phone.length;
            var firstDigits = '';
            var secondDigits = '';
            var thirdDigits = '';
            if(phoneLength === 0)
            {
                return '';
            }else if(phoneLength<=3)
            {
                firstDigits=phone.substring(0,3);
                return "("+firstDigits+")";
            }else if(phoneLength>3&&phoneLength<=6)
            {
                firstDigits=phone.substring(0,3);
                secondDigits=phone.substring(3,6);
                return "("+firstDigits+")"+" "+secondDigits;
            }else{
                firstDigits=phone.substring(0,3);
                secondDigits=phone.substring(3,6);
                thirdDigits=phone.substring(6,phone.length);
                return "("+firstDigits+")"+" "+secondDigits+"-"+thirdDigits;
            }
        }
    };
});

myApp.filter('toTrusted', function ($sce) {
    return function (value) {
        return $sce.trustAsHtml(value);
    };
});
myApp.filter('capitalize', function () {
    /**
     * Capitalizes the string
     * @param {string} value String to transform
     */
    return function (value) {
        return value.charAt(0).toUpperCase()+ value.slice(1);
    };
});