<?php
	/* To get a list of *unused* notification types */

	// Include config module
	// DEV 
	include_once("config_ATO_DEV.php");
	
	/* PRO
	 * include_once("config_ATO_PRO.php");
	 */

	// Retrieve FORM param
	$callback = $_GET['callback'];

	$notification = new Notification; // Object

	// Call function
	$types = $notification->getNotificationTypes();

	// Callback to http request
	print $callback.'('.json_encode($types).')';

?>
