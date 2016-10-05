<?php
	/* To get a list of existing hospital maps */

    $currentFile = __FILE__; // Get location of this script

    // Find config file based on this location 
    $configFile = substr($currentFile, 0, strpos($currentFile, "ATO")) . "ATO/php/config.php";
	// Include config file 
	include_once($configFile);

	// Retrieve FORM param
	$callback = $_GET['callback'];

	$hosMap = new HospitalMap; // Object

	// Call function
	$existingHosMapList = $hosMap->getHospitalMaps();

	// Callback to http request
	print $callback.'('.json_encode($existingHosMapList).')';

?>
