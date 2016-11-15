
                  ons.ready(function() {
            console.log("Onsen UI is ready!");
        });
var app = angular.module('myApp', ['onsen']);
app.controller('AppController', function() {
            this.pushes = 0;
            this.pops = 0;
          });
