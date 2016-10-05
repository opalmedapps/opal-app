angular.module('ATO_InterfaceApp.controllers.homeController', ['ngAnimate', 'ui.bootstrap']).


	/******************************************************************************
	* Home Page controller 
	*******************************************************************************/
	controller('homeController', function($scope, $uibModal, cronAPIservice) {


        $scope.banner = {
            message: "",
            alertClass: "alert-success"
        };
        // Function to show page banner 
        $scope.showBanner = function() {
            $(".bannerMessage").slideDown(function()  {
                setTimeout(function() {             
                    $(".bannerMessage").slideUp(); 
                }, 3000); 
            });
        }

        $scope.changesMade = false;

        $scope.setChangesMade = function() {
            $scope.changesMade = true;
        }
    
        $scope.loginDisplayed = true; // Defaults 
        $scope.formLoaded = false; // Defaults

        // Initialize login object
        $scope.login = {
            username: "",
            password: ""
        }

        // Initialize register object
        $scope.register = {
            username: "",
            password: "",
            passConfirm: ""
        }

        // Function to return boolean on completed login form
        $scope.loginFormComplete = function() {
            if( ($scope.login.username && $scope.login.password) )
                return true;
            else
                return false;
        }
            
        // Function to return boolean on completed register form
        $scope.registerFormComplete = function() {
            if( ($scope.register.username && $scope.register.password && $scope.register.passConfirm) )
                return true;
            else
                return false;
        }

        // Function to switch between login register forms + animations
        $scope.switchForm = function() {
            $scope.loginDisplayed = !$scope.loginDisplayed;
            $scope.formLoaded = true;
            $('.form-box').addClass('bounceIn');
            setTimeout(function() {
                $('.form-box').removeClass('bounceIn');
            }, 1000);
        }

     
        // Function to "shake" form container if fields are incorrect
        $scope.shakeForm = function() {
            $scope.formLoaded = true;
            $('.form-box').addClass('shake');
            setTimeout(function() {
                $('.form-box').removeClass('shake');
            }, 1000);
        } 

        // Function to submit login
        $scope.submitLogin = function () {
            if($scope.loginFormComplete()) {
                $.ajax({
                    type: "POST",
                    url: "php/user/checklogin.php",
                    data: $scope.login,
                    success: function(response) {
                        if (response == 0) {
                            $scope.banner.message = "Wrong username and/or password!";
                            $scope.banner.alertClass = 'alert-danger';
                            $scope.shakeForm();
                            $scope.$apply();
                            $scope.showBanner();
                        }
                        if (response == 1) {
                            location.reload();
                        }
                    }
                });
            }
        }

        // Function to submit register
        $scope.submitRegister = function () {
            if ($scope.registerFormComplete()) {
                $.ajax({
                    type: "POST",
                    url: "php/user/checkregister.php",
                    data: $scope.register,
                    success: function(response) {
                        console.log(response);
                        if (response == 0) {
                            $scope.banner.message = "Passwords are not the same! Try again.";
                            $scope.banner.alertClass = 'alert-danger';
                            $scope.shakeForm();
                            $scope.$apply();
                            $scope.showBanner();
                        }
                        if (response == 1) {
                            $scope.banner.message = "Register successful! You may now login.";
                            $scope.banner.alertClass = 'alert-success';
                            $scope.switchForm();
                            $scope.register.username = "";
                            $scope.register.password = "";
                            $scope.register.passConfirm = "";
                            $scope.$apply();
                            $scope.showBanner();
                        }

                    }
                });
            }
        }

    
       /**********************************************************************************
        * CRON 
        * ********************************************************************************/
		$scope.showWeeks = true; // show weeks sidebar 
  		$scope.toggleWeeks = function () {
    			$scope.showWeeks = ! $scope.showWeeks;
  		};
		
		// set minimum date (today's date)
  		$scope.toggleMin = function() {
    			$scope.minDate = ( $scope.minDate ) ? null : new Date();
  		};
  		$scope.toggleMin();

		// Open popup calendar
  		$scope.open = function($event) {
    			$event.preventDefault();
    			$event.stopPropagation();

    			$scope.opened = true;
  		};

  		$scope.dateOptions = {
    			'year-format': "'yy'",
    			'starting-day': 1
  		};

		// Date format
  		$scope.format = 'yyyy-MM-dd';

		// object for cron repeat units
		$scope.repeatUnits = [
			'Minutes',
			'Hours'
		];

		// Initialize object for cron details
		$scope.cronDetails = {};
		$scope.cronDetailsMod = {};

		$scope.editCron = false;

		// Call our API to get the cron details from our DB
		cronAPIservice.getCronDetails().success(function (response) {
			$scope.cronDetails = response; // assign value

			// Split the hours and minutes to display them in their respective text boxes
			var hours = $scope.cronDetails.nextCronTime.split(":")[0];
			var minutes = $scope.cronDetails.nextCronTime.split(":")[1];
			var d = new Date();
			d.setHours(hours);
			d.setMinutes(minutes);
			$scope.cronDetails.nextCronTime = d;

			$scope.cronDetailsMod = jQuery.extend(true, {}, $scope.cronDetails); // deep copy
            var year = $scope.cronDetailsMod.nextCronDate.split("-")[0];
            var month = parseInt($scope.cronDetailsMod.nextCronDate.split("-")[1]) - 1;
            var day = parseInt($scope.cronDetailsMod.nextCronDate.split("-")[2]) + 1;
            $scope.cronDetailsMod.nextCronDate = new Date(Date.UTC(year,month,day));
		});

		// Ajax call when cron details are submitted
		$scope.submitCronChange = function() {
		
            if ($scope.checkForm()) {
    			// Convert date formats of all datetime fields
	    		$scope.cronDetailsMod.nextCronDate = moment($scope.cronDetailsMod.nextCronDate).format("YYYY-MM-DD");
		    	$scope.cronDetailsMod.nextCronTime = moment($scope.cronDetailsMod.nextCronTime).format("HH:mm");

			    $.ajax({
				    type: "POST",
    				url: "php/cron/update_cron.php",
	    			data: $scope.cronDetailsMod,
		    		success: function () {

			    		// Call our API to get the cron details from our DB
				    	cronAPIservice.getCronDetails().success(function (response) {
					    	$scope.cronDetails = response; // assign value

    						// Split the hours and minutes to display them in their respective text boxes
	    					var hours = $scope.cronDetails.nextCronTime.split(":")[0];
		    				var minutes = $scope.cronDetails.nextCronTime.split(":")[1];
			    			var d = new Date();
				    		d.setHours(hours);
					    	d.setMinutes(minutes);
						    $scope.cronDetails.nextCronTime = d;
			
    						$scope.cronDetailsMod = jQuery.extend(true, {}, $scope.cronDetails); // deep copy
                            var year = $scope.cronDetailsMod.nextCronDate.split("-")[0];
                            var month = parseInt($scope.cronDetailsMod.nextCronDate.split("-")[1]) - 1;
                            var day = parseInt($scope.cronDetailsMod.nextCronDate.split("-")[2]) + 1;
                            $scope.cronDetailsMod.nextCronDate = new Date(Date.UTC(year,month,day));
					    });

                        $scope.bannerMessage = "Saved Cron Settings!";
                        $scope.showBanner();
                        $scope.editCron = false;
                        $scope.changesMade = false;
    				}
	    		});
	        }
		}

        // Function to check necessary form fields are complete
        $scope.checkForm = function() {
            if ($scope.cronDetailsMod.nextCronDate && $scope.cronDetailsMod.nextCronTime
                    && $scope.cronDetailsMod.repeatInterval && $scope.cronDetailsMod.repeatUnits
                    && $scope.changesMade) {
                return true;
            }
            else
                return false;
        }

	});

