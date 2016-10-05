<?php

	/* To delete a hospital map */

    $currentFile = __FILE__; // Get location of this script

    // Find config file based on this location 
    $configFile = substr($currentFile, 0, strpos($currentFile, "ATO")) . "ATO/php/config.php";
	// Include config file 
	include_once($configFile);

	$hosMap = new HospitalMap; // Object

	// Retrieve FORM param
	$serial = $_POST['serial'];

	// Call function
	$hosMap->removeHospitalMap($serial);

?>
