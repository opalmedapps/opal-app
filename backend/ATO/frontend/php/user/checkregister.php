<?php 

	/* To call Users Object to validate registration to application */


	// Include config module
	// DEV
	include_once("config_ATO_DEV.php");

	/* PRO
	 *include_once("config_AEHRA_PRO.php");
	 */

	$usr = new Users; // Object

	// Store FORM params
	$usr->storeFormValues( $_POST );

	// If both password fields are the same 
	if( $_POST['password'] == $_POST['passConfirm'] ) {
		$usr->register($_POST);	// Register User
	    session_start(); // Start a session
		$_SESSION['ATO_DEV_registerAttempt'] = 1;
	
        print 1;

	} else { // Password fields different 

        print 0;
	}
?>
