<?php
	/* To get a list of existing notification */

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
	$existingNotificationList = $notification->getNotifications();

	// Callback to http request
	print $callback.'('.json_encode($existingNotificationList).')';

?>
