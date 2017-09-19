<?php

	/* To delete a notification */

    $currentFile = __FILE__; // Get location of this script

    // Find config file based on this location 
    $configFile = substr($currentFile, 0, strpos($currentFile, "ATO")) . "ATO/php/config.php";
	// Include config file 
	include_once($configFile);

	$notification = new Notification; // Object

	// Retrieve FORM param
	$serial = $_POST['serial'];

	// Call function
	$response = $notification->removeNotification($serial);
    print json_encode($response); // Return response
?>
