<?php 
	/* To get details on a cron profile */

	// Include config module
	// DEV
	include_once("config_ATO_DEV.php");
	
	/* PRO
	 * include_once("config_ATO_PRO.php");
	 */

	// Retrieve FORM params
	$callback = $_GET['callback'];

	$cron = new CronControl; // Object

	// Call function
	$cronDetails = $cron->getCronDetails();

	// Callback to http request
	print $callback.'('.json_encode($cronDetails).')';

?>
