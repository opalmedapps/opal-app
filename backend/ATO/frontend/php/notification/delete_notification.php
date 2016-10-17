<?php

	/* To delete a notification */

	// Include config module
	// DEV
	include_once("config_ATO_DEV.php");

	/* PRO
	 *include_once("config_ATO_PRO.php");
	 */

	$notification = new Notification; // Object

	// Retrieve FORM param
	$serial = $_POST['serial'];

	// Call function
	$response = $notification->removeNotification($serial);
    print json_encode($response);
?>
