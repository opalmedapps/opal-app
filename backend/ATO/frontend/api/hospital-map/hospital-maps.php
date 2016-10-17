<?php
	/* To get a list of existing hospital maps */

	// Include config module
	// DEV 
	include_once("config_ATO_DEV.php");
	
	/* PRO
	 * include_once("config_ATO_PRO.php");
	 */

	// Retrieve FORM param
	$callback = $_GET['callback'];

	$hosMap = new HospitalMap; // Object

	// Call function
	$existingHosMapList = $hosMap->getHospitalMaps();

	// Callback to http request
	print $callback.'('.json_encode($existingHosMapList).')';

?>
