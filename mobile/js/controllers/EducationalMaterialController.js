var myApp = angular.module('MUHCApp');
myApp.controller('EducationalMaterialController', function (NavigatorParameters, $scope, $timeout, $cordovaFileOpener2, $cordovaDevice, $cordovaDatePicker, FileManagerService, EducationalMaterial, UserPreferences) {

	//Android device backbutton
	$scope.educationDeviceBackButton = function () {
		console.log('device back button pressed do nothing');

	}
	init();
	//Init function
	function init() {
		//Obtaining materials from service
		$scope.noMaterials = !EducationalMaterial.isThereEducationalMaterial()
		var materials = EducationalMaterial.getEducationalMaterial();
		console.log(materials);
		//Setting the language for view
		materials = EducationalMaterial.setLanguageEduationalMaterial(materials);
		//Attaching to scope
		$scope.edumaterials = materials;
	}

	//Function to decide whether or not to show the header
	$scope.showHeader = function (index) {
		if (index == 0) {
			return true;
		} else if ($scope.edumaterials[index - 1].PhaseInTreatment !== $scope.edumaterials[index].PhaseInTreatment) {
			return true;
		}
		return false;
	}
	/**
	 * @method goToEducationalMaterial
	 * @description If not read reads material, then it opens the material into its individual controller
	 * 
	 */
	$scope.goToEducationalMaterial = function (edumaterial) {
		if (edumaterial.ReadStatus == '0') {
			edumaterial.ReadStatus = '1';
			EducationalMaterial.readEducationalMaterial(edumaterial.EducationalMaterialSerNum);
		}
		NavigatorParameters.setParameters({ 'Navigator': 'educationNavigator', 'Post': edumaterial });
		educationNavigator.pushPage('./views/education/individual-material.html');
	};

});
/**
 * @controller IndividualEducationalMaterialController
 * @description Controller receives each individual material and its in charge of the options to manipulate the material. i.e. This controller is in charge
 * of the following functions: opening, sharing, mailing, rating
 * 
 * 
 * 
 */
myApp.controller('IndividualEducationalMaterialController', ['$scope', '$timeout', 'NavigatorParameters', 'UserPreferences', 'EducationalMaterial', 'FileManagerService','$cordovaNetwork','$filter',function ($scope, $timeout, NavigatorParameters, UserPreferences, EducationalMaterial,FileManagerService,$cordovaNetwork,$filter) {
	/**
	 * Getting Parameters from navigation
	 */
	var param = NavigatorParameters.getParameters();
	var navigatorPage = param.Navigator;
	
	//Setting educational material
	$scope.edumaterial =EducationalMaterial.setLanguageEduationalMaterial(param.Post);
	
	//Determine if material has a ShareURL and is printable
	if($scope.edumaterial.hasOwnProperty('ShareURL')&&$scope.edumaterial.ShareURL !=="") $scope.isPrintable = FileManagerService.isPDFDocument($scope.edumaterial.ShareURL);
	
	//Determine if material is a booklet
	var isBooklet = $scope.edumaterial.hasOwnProperty('TableContents');
	
	//Determine if material is an app
	var app = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
	
	//If its a booklet, translate table of contents
	if (isBooklet) {
		$scope.tableOfContents = $scope.edumaterial['TableContents'];
		$scope.tableOfContents = EducationalMaterial.setLanguageEduationalMaterial($scope.tableOfContents);
	}
	
	//Determining if its an individual php page to show immediately.
	$scope.isIndividualHtmlPage = (FileManagerService.getFileType($scope.edumaterial.URL_EN) == 'php');
	if($scope.isIndividualHtmlPage) downloadIndividualPage();
	
	//Function to go to a specific educational material. 
	$scope.goToEducationalMaterial = function (index) {
		var nextStatus = EducationalMaterial.openEducationalMaterialDetails($scope.edumaterial);
		if (nextStatus !== -1) {
			console.log(nextStatus);
			NavigatorParameters.setParameters({ 'Navigator': navigatorPage, 'Index': index, 'Booklet': $scope.edumaterial, 'TableOfContents': $scope.tableOfContents });
			window[navigatorPage].pushPage(nextStatus.Url);
		}
	};
	//Instantiating popover controller
	$timeout(function () {
		ons.createPopover('./views/education/popover-material-options.html',{parentScope: $scope}).then(function (popover) {
			$scope.popoverSharing = popover;
		});
	}, 300);
	
	//On destroy clean up
	$scope.$on('$destroy', function () {
		console.log('on destroy');
		$scope.popoverSharing.destroy();
	});
		
	//Function to share material, if shareable
	$scope.shareMaterial = function () {
		FileManagerService.shareDocument($scope.edumaterial.Name, $scope.edumaterial.ShareURL);
		$scope.popoverSharing.hide();
	};

	//If material is printable, i.e. is a pdf, download material and print it.
	$scope.printMaterial = function()
	{
		//If no connection then simply alert the user to connect to the internet
		$scope.popoverSharing.hide();
		if(app&&$cordovaNetwork.isOnline())
		{
			
			//Get material from server
			var xhr = new XMLHttpRequest();
			xhr.open('GET',  $scope.edumaterial.ShareURL, true);
			xhr.responseType = 'blob';
			//If successful, convert to base64 and print
			xhr.onload = function() {
				if (this.status == 200) {

					var blob = new Blob([this.response], { type: 'application/pdf' });
					var fileReader = new FileReader();
					fileReader.readAsDataURL(blob); 
					fileReader.onloadend = function() {
						base64data = fileReader.result; 
						base64data = base64data.replace('data:application/pdf;base64,','');               
						window.plugins.PrintPDF.print({
						data: base64data,
						type: 'Data',
						title: $filter('translate')("PRINTDOCUMENT"),
						success: function(){
							console.log('success');
						},
						error: function(data){
							data = JSON.parse(data);
							console.log('failed: ' + data.error);
						}
					});
											
					}
				}else{
					//If unable to obtain, alert the user.
					ons.notification.alert({'message':$filter('translate')('UNABLETOOBTAINEDUCATIONALMATERIAL')});
				}
			};
			xhr.send();
		}else{
			$scope.popoverSharing.hide();			
			ons.notification.alert({'message':$filter('translate')("PRINTINGUNAVAILABLE")});
		}
		
	};
	//Function to download educational material
	function downloadIndividualPage()
	{
		if(!$scope.edumaterial.hasOwnProperty('Content'))
		{
			$.get($scope.edumaterial.Url, function (res) {
				$timeout(function () {
					//Sets content variable for material and hides loading 
					$scope.edumaterial.Content = res;
				});
			});
		}
		
	}
	
}]);

/**
 * @name EducationalMaterialSinglePageController
 * @description Once the material has gone through the first show page, this controller is in charge of opening the material that is simple a individual html page, such as the charter and such and its not a table of 
 * contents. Or in backend language is a parent element without a table of contents and simple material content.
 * 
 */
myApp.controller('EducationalMaterialSinglePageController', ['$scope', '$timeout', 'NavigatorParameters', 'EducationalMaterial', function ($scope, $timeout, NavigatorParameters, EducationalMaterial) {
	//Obtaining educational material and other parameters such as the navigatorName
	var parameters = NavigatorParameters.getParameters();
	var material = parameters.Booklet;
	var navigatorName = parameters.Navigator;
	
	//Setting the educational material
	$scope.edumaterial = material;
	
	//Ajax call to obtain material
	$.get(material.Url, function (res) {
		console.log("res", res.replace(/(\r\n|\n|\r)/gm, " "));
		$timeout(function () {
			//Sets content variable for material and hides loading 
			$scope.edumaterial.Content = res;
		});

	});
}]);

/**
 * @method BookletEduMaterialController
 * @description This controller takes care of the displying the educational material that has a table of contents in a carousel fashion. It also takes care of the popover that controls the table of contents and 
 * rating.
 * 
 */
myApp.controller('BookletEduMaterialController', ['$scope', '$timeout', 'NavigatorParameters', 'EducationalMaterial', '$rootScope', '$filter', function ($scope, $timeout, NavigatorParameters, EducationalMaterial, $rootScope, $filter) {
	
	//Obtaining educational material parameters
	var parameters = NavigatorParameters.getParameters();
	var navigatorName = parameters.Navigator;

	initBooklet();

	 //Initialization variables for material
	function initBooklet() {
		$rootScope.contentsEduBooklet = parameters;
		$scope.booklet = parameters.Booklet;
		$scope.activeIndex = parameters.Index;
		$scope.tableOfContents = parameters.TableOfContents;
	}
	$scope.isFullscreen = false;

	/**
	 * Event listeners for carousel element
	 */
	document.addEventListener('ons-carousel:init', handleInitEventCarousel);
	document.addEventListener('ons-carousel:postchange', handlePostChangeEventCarousel);

	/**
	 * Function handlers for advancing with the carousel
	 */
	$scope.goNext = function () {
		if ($scope.activeIndex < $scope.tableOfContents.length - 1) {
			$scope.activeIndex++;
			$scope.carousel.setActiveCarouselItemIndex($scope.activeIndex);
			console.log('go next');
		}
	};
	$scope.goBack = function () {
		if ($scope.activeIndex > 0) {
			$scope.activeIndex--;
			$scope.carousel.setActiveCarouselItemIndex($scope.activeIndex);
			console.log('go back');
		}

	};
	/*
	* Method in charge of fullscreen functionality. **deprecated!!
	*/
	// $scope.fullScreenToggle = function () {
	// 	$scope.isFullscreen = !$scope.isFullscreen;
	// 	setHeightElement();
	// }
	
	/**
	 * Instantiation the popover for table of contents, delayed is to prevent the transition animation from lagging.
	 */
	$timeout(function () {
		ons.createPopover('./views/education/table-contents-popover.html').then(function (popover) {
			$scope.popover = popover;
			$rootScope.popoverEducation = popover;
			$scope.popover.on('posthide', function () {
				if (typeof $rootScope.indexEduMaterial !== 'undefined') $scope.carousel.setActiveCarouselItemIndex($rootScope.indexEduMaterial);
			});
		});
	}, 300);

	//Popover method to jump between educational material sections from a table of contents
	$rootScope.goToSectionBooklet = function (index) {
		$rootScope.indexEduMaterial = index;
		$rootScope.popoverEducation.hide();
	};
	//Cleaning up controller after its uninstantiated. Destroys all the listeners and extra variables 
	$scope.$on('$destroy', function () {
		console.log('on destroy');
		ons.orientation.off("change");
		delete $rootScope.contentsEduBooklet;
		document.removeEventListener('ons-carousel:postchange', handlePostChangeEventCarousel);
		document.removeEventListener('ons-carousel:init', handleInitEventCarousel);
		$scope.carousel.off('init');
		$scope.carousel.off('postchange');
		$scope.popover.off('posthide');
		$scope.popover.destroy();
		delete $rootScope.indexEduMaterial;
		delete $rootScope.popoverEducation;
		delete $rootScope.goToSectionBooklet;
	});
	/**
	 * Set height of container carousel element
	 * 
	 */
	function setHeightElement() {
		$timeout(function () {
			var constantHeight = (ons.platform.isIOS()) ? 120 : 100;
			var divTitleHeight = $('#divTitleBookletSection').height();
			if ($scope.isFullscreen) {
				divTitleHeight = 0;
				constantHeight -= 48;
			}
			var heightChange = document.documentElement.clientHeight - constantHeight - divTitleHeight;
			$scope.heightSection = heightChange + 'px';
			$('#contentMaterial').height(heightChange);
		}, 10);
	}
	//Handles the post change even carousel, basically updates activeIndex, sets height of view and lazily loads slides
	function handlePostChangeEventCarousel(ev) {
		setHeightSection(ev.activeIndex);
		$scope.carousel = ev.component;
		$scope.activeIndex = ev.activeIndex;
		setHeightElement();
		lazilyLoadSlides(ev.activeIndex);
	}
	
	//Sets the height dynamically for educational material contents. Fixing the bug from Onsen.
	function setHeightSection(index) {
		$scope.heightSection = $('#sectionContent' + index).height();
	}
	
	//This method is in charge of "lazy loading". It only loads the material if it has not been loaded yet and only for the current, previous and next slides.
	function lazilyLoadSlides(index) {
		if (index - 1 >= 0 && !$scope.tableOfContents[index - 1].hasOwnProperty("Content")) {
			$.get($scope.tableOfContents[index - 1].Url, function (res) {
				$timeout(function () {
					$scope.tableOfContents[index - 1].Content = $filter('removeTitleEducationalMaterial')(res);
				});
			});
		}
		if (!$scope.tableOfContents[index].hasOwnProperty("Content")) {
			$.get($scope.tableOfContents[index].Url, function (res) {
				$timeout(function () {
					$scope.tableOfContents[index].Content = $filter('removeTitleEducationalMaterial')(res);
				});
			});
		};
		if (index + 1 < $scope.tableOfContents.length && !$scope.tableOfContents[index + 1].hasOwnProperty("Content")) {
			$.get($scope.tableOfContents[index + 1].Url, function (res) {
				$timeout(function () {
					$scope.tableOfContents[index + 1].Content = $filter('removeTitleEducationalMaterial')(res);
				});
			});
		}
	}
	//Function that handles the initialization of the carousel. Basically deals with instantiation of carousel, loading the first slides, settings initial height, and then instaitiating a listener to watch the
	//change from portrait to landscape. 
	function handleInitEventCarousel(ev) {
		console.log('initializing carouse');
		$scope.carousel = ev.component;
		$timeout(function () {
			$scope.carousel.setActiveCarouselItemIndex(parameters.Index);
			$scope.carousel.refresh();
			lazilyLoadSlides(parameters.Index);
			setHeightElement();

		}, 10);

		console.log('done lazy instantiation', parameters.Index)
		if (app) {
			ons.orientation.on("change", function (event) {
				console.log(event.isPortrait); // e.g. portrait
				//$scope.carousel.refresh();
				console.log('orientation changed');
				setHeightElement();
				var i = $scope.carousel._scroll / $scope.carousel._currentElementSize;
				delete $scope.carousel._currentElementSize;
				$scope.carousel.setActiveCarouselItemIndex(i);
			});
		}
	}


}]);

