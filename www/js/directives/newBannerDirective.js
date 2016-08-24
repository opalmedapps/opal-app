'use strict';
/*
*Code by David Herrera May 20, 2015
*Github: dherre3
*Email:davidfherrerar@gmail.com
*/
/**
 * @ngdoc directive
 * @name bannersProjectApp.directive:newsBanner
 * @description
 * # newsBanner
 */
angular.module('MUHCApp').directive('newsBanner', function ($rootScope,$timeout, $q,$window,$cordovaNetwork,$filter) {
    var colorMappings =
    {
      'success':'#5cb85c',
      'danger':'#d9534f',
      'dead':'#777',
      'info':'#5bc0de'
    };
    var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
    var stack = [];
    var alertTypes = {
      'notifications':{Type:'notifications',Color:colorMappings.info,Icon:'ion-arrow-down-c', Message:"NEWNOTIFICATIONS",Duration:'finite'},
      'nointernet':{Type:'nointernet',Color:colorMappings.dead,Icon:'ion-alert-circled', Message:"NOINTERNETCONNECTION",Duration:'infinite'},
      'connected':{Type:'connected',Color:colorMappings.success,Icon:'', Message:"CONNECTED",Duration:'finite'}
    };
    return {
      template: "<div class=\"text-center element-banner\" align = \"center\" style=\"width:100vw;color:white;font-size:15px;background-color:DeepSkyBlue ;position: absolute;width:100vw;height:30px;top:0px;z-index:3\" ng-style=\"\"><p style=\"vertical-align:middle;\"><strong> <i style=\"font-size:20px\" ng-class=\"alertParameters.Icon\" ></i> <strong></strong></p></div>",
      restrict: 'E',
      scope:{
        'type':'=',
        'transition':'='
      },
      link: function postLink(scope, element, attrs) {
        if(app){
          if (!$cordovaNetwork.isOnline()) $rootScope.alertBanner = 'nointernet'; 
        }else{
          if (!navigator.onLine) $rootScope.alertBanner = 'nointernet'; 
        }
        element.addClass('element-banner');
           scope.$watch('type', function() {
             console.log(scope.type);
          if(typeof scope.type !== 'undefined')
          {
            if(stack.length>0) 
            {
              removeAlert().then(function(){
                updateBanner();
              });             
            }else{
              updateBanner();
            }
            
          }
          });
        //Code to be used when the transition of the main page is happening, only removes alert momentarily
       /* scope.$watch('transition',function(){
          if(typeof scope.transition !== 'undefined'&& typeof $rootScope.alertBanner)
          {
            console.log('deleting transition');
            removeAlert();
            delete $rootScope.transitionBanner;
          }
        });*/
       function removeAlert()
       {
          var r = $q.defer();
          element.removeClass('active-banner');
          var top = stack.pop();
          $timeout(function(){
            element.removeClass(top.Icon);
            r.resolve(true);
          },500);
          return r.promise;
       }
        
        function updateBanner()
        {
           
          scope.alertParameters = alertTypes[scope.type];
          element.addClass(alertTypes[scope.type].Icon);
          element.css(
            {'background-color':alertTypes[scope.type].Color,
            'color':'white',
            'width':'100vw',
            'height':'20px',
            'z-index':'2',
            'text-align':'center',
            'font-weight':'600'
            });  
            element.removeClass('inactive-banner');
            element.addClass('active-banner');
            stack.push(alertTypes[scope.type]);
          if(alertTypes[scope.type].Duration !== 'infinite')
          {
              $timeout(function(){
                removeAlert();
                delete $rootScope.alertBanner;
              },1500);
          }
          var message = 
          message = " "+ $filter('translate')(alertTypes[scope.type].Message);
          element.text(message);
        }
        element.on('$destroy', function() {
          console.log('destroy');
        });
        
        
        
         
      }
    };
  });
