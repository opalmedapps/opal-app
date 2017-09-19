<?php 

	/* To call Users Object to validate login */

	// Include config module
	// DEV
	include_once("config_ATO_DEV.php");

	/* PRO
	 *include_once("config_AEHRA_PRO.php");
	 */

	$usr = new Users; // Object 
	
	// Store FORM params
	$usr->storeFormValues( $_POST );
	
	// Successful login
	if( $usr->userLogin() ) {
	
	    session_start(); // Begin session
		// Add session params
		$_SESSION['ATO_DEV_username'] = $usr->username; 
		$_SESSION['ATO_DEV_loginAttempt'] = 1;
		$_SESSION['ATO_DEV_userid'] = $usr->userid;

        print 1;
	} else { // Failed login

        print 0;

    }
?>
