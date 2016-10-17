<?php
	/* To get details on a particular notification */

	// Include config module 
	// DEV
	include_once("config_ATO_DEV.php");

	/* PRO
	 * include_once("config_ATO_PRO.php");
	 */

	// Retrieve FORM params
	$callback = $_GET['callback'];
	$serial = $_GET['serial'];

	$notification = new Notification; // Object

	// Call function
	$notificationDetails = $notification->getNotificationDetails($serial);

	// Callback to http request
	print $callback.'('.json_encode($notificationDetails).')';

?>
