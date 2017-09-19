<?php 

	/* To call Users Object to validate registration to application */

    $currentFile = __FILE__; // Get location of this script

    // Find config file based on this location 
    $configFile = substr($currentFile, 0, strpos($currentFile, "ATO")) . "ATO/php/config.php";
	// Include config file 
	include_once($configFile);

	$usr = new Users; // Object

	// Store FORM params
	$usr->storeFormValues( $_POST );

	// If both password fields are the same 
	if( $_POST['password'] == $_POST['passConfirm'] ) {
		$usr->register($_POST);	// Register User
	    session_start(); // Start a session
		$_SESSION[SESSION_KEY_REGISTER] = 1;
	
        print 1;

	} else { // Password fields different 

        print 0;
	}
?>
