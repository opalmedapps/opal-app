  var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
  if(app){
    document.addEventListener("deviceready", function() {
      var loadingElement = document.getElementById('loadingData');
      loadingElement.style.display = 'block';
      //Your code
      // Find the DOM element where you want to add ng-app
      var element = document.getElementById('boots');
      angular.bootstrap(element, ["MUHCApp"]); //Or simple document in place of element
    //loading data ng-cloak
}, false);
  }else{
    $('document').ready(function(){
      var element = document.getElementById('boots');
      angular.bootstrap(element, ["MUHCApp"]);
      var loadingElement = document.getElementById('loadingData');
      loadingElement.style.display = 'block';
      $('#loadingData').css({'display':'block'});
    });
  }