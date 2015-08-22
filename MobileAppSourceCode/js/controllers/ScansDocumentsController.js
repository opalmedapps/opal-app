 var myApp = angular.module('MUHCApp');
  myApp.controller('ScansDocumentController',['Patient','Documents','UpdateUI', '$scope','$timeout','UserPreferences', function (Patient,Documents, UpdateUI,$scope,$timeout, UserPreferences) {
        $scope.closeAlert = function () {
   
        $rootScope.showAlert=false;
    };

    $scope.photoAlbum=Documents.getPhotos();
    console.log($scope.photoAlbum);
    if(UserPreferences.getLanguage()=='EN'){
      for(var i=0;i<$scope.photoAlbum.length;i++){
        $scope.photoAlbum[i].Name=$scope.photoAlbum[i].ImageHospitalName_EN;
        $scope.photoAlbum[i].Description=$scope.photoAlbum[i].ImageHospitalDescription_EN;
      }
      
    }else{
      for(var i=0;i<$scope.photoAlbum.length;i++){
        $scope.photoAlbum[i].Name=$scope.photoAlbum[i].ImageHospitalName_FR;
        $scope.photoAlbum[i].Description=$scope.photoAlbum[i].ImageHospitalDescription_FR;
      }
    }
      $('[data-toggle="popover"]').popover();  
      $scope.showFullPhotos=false;
      $scope.showListCarousel=true;
          //  $scope.imageList = {};
    $scope.imageList=Documents.getPhotos();
    $scope.showMe=true;
    
      $scope.$watch('pickPic.name',function(val){
        if(val==='angelFalls'){
           app.carousel.setActiveCarouselItemIndex(0);
        }else if(val==='mountEverest'){
          app.carousel.setActiveCarouselItemIndex(1);
        }else if(val==='colisium'){
          app.carousel.setActiveCarouselItemIndex(2);
        }else if(val==='volcano'){
          app.carousel.setActiveCarouselItemIndex(3);
        }
      });

var options = {
  animation: 'slide', // What animation to use
  onTransitionEnd: function() {} // Called when finishing transition animation
};


$scope.clickMe=function(){
  setTimeout(function(){
      $scope.$apply(function(){
        var currentCarouselIndex=app.carousel.getActiveCarouselItemIndex();
        console.log(currentCarouselIndex);
        app.carouselFull.setActiveCarouselItemIndex(currentCarouselIndex);

       $scope.showFullPhotos=true;
       $scope.showListCarousel=false;
       //.pushPage("views/documentsDisplay.html", options);
    });
  },100)
}
$scope.clickBack=function(){
  setTimeout(function(){
      $scope.$apply(function(){


        $scope.showFullPhotos=false;
        $scope.showListCarousel=true;
    });
  },100)


};


      $(document.body).on("pageinit", '#my-page', function() {
  var mylist = $('#mylist');
  var btn = $("#show-modal",this);

  mylist.hide();
  mylist.isShown = false;
  
  btn.click(function() {
    if (!mylist.isShown) {
      mylist.show();
      console.log(mylist);
      mylist.isShown = true;
      btn.addClass('hbtn');
    } else {
      mylist.hide();
      mylist.isShown = false;
      btn.removeClass('hbtn');

    }
  });
});
       function loadInfoDocu(){
                var UserData=UpdateUI.UpdateUserFields();
                UserData.then(function(dataValues){
                    console.log(dataValues);
                    setTimeout(function(){
                        $scope.$apply(function(){
                            $scope.imageList=Documents.getPhotos();
                        });
                    },100);
                },function(error){
                    console.log(error);
                });
        };


         $scope.loadDocu = function($done) {
          $timeout(function() {
            loadInfoDocu();
                $done();
                
          }, 2000);
        };
      $scope.nameImage=['image1','image2','image3'];          
          $scope.displayCurrentImage=function(img){
          	setTimeout(function () {
              $scope.$apply(function () {
                 $scope.currentImg=img;


              });

          }, 1000);
          
          $scope.clickMe=function(){
          	console.log('boom');
          	
          };
          	
          }
          $scope.date=new Date();
  }]);

 myApp.controller('SingleDocumentController',['Documents', '$timeout', '$scope', function(Documents, $timeout,$scope){
  console.log('Simgle Document Controller');
  var page = myNavigatorDocuments.getCurrentPage();

  var image=page.options.param;
  console.log(image);
  $scope.header=image.Name;
  $scope.imageContent=image.Content;
  var gesturableImg = new ImgTouchCanvas({
            canvas: document.getElementById('mycanvas'),
            path: $scope.imageContent
        });
  /*var gesturableImg = new ImgTouchCanvas({
          canvas: document.getElementById('mycanvas2'),
          path: "./img/D-RC_ODC_16June2015_en_FNL.png"
      });*/

}]);