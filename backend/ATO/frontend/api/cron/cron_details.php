<?php 
	/* To get details on a cron profile */

    $currentFile = __FILE__; // Get location of this script

    // Find config file based on this location 
    $configFile = substr($currentFile, 0, strpos($currentFile, "ATO")) . "ATO/php/config.php";
	// Include config file 
	include_once($configFile);

	// Retrieve FORM params
	$callback = $_GET['callback'];

	$cron = new CronControl; // Object

	// Call function
	$cronDetails = $cron->getCronDetails();

	// Callback to http request
	print $callback.'('.json_encode($cronDetails).')';

?>
