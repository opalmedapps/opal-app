<?php
	/* To get details on a particular notification */

    $currentFile = __FILE__; // Get location of this script

    // Find config file based on this location 
    $configFile = substr($currentFile, 0, strpos($currentFile, "ATO")) . "ATO/php/config.php";
	// Include config file 
	include_once($configFile);

	// Retrieve FORM params
	$callback = $_GET['callback'];
	$serial = $_GET['serial'];

	$notification = new Notification; // Object

	// Call function
	$notificationDetails = $notification->getNotificationDetails($serial);

	// Callback to http request
	print $callback.'('.json_encode($notificationDetails).')';

?>
