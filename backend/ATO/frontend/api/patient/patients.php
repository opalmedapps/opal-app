<?php
	/* To get a list of existing patients */

	// Include config module
	// DEV 
	include_once("config_ATO_DEV.php");
	
	/* PRO
	 * include_once("config_ATO_PRO.php");
	 */

	// Retrieve FORM param
	$callback = $_GET['callback'];

	$patient = new Patient; // Object

	// Call function
	$existingPatientList = $patient->getExistingPatients();

	// Callback to http request
	print $callback.'('.json_encode($existingPatientList).')';

?>
