<?php
	/* To get details on a particular hospital map */

	// Include config module 
	// DEV
	include_once("config_ATO_DEV.php");

	/* PRO
	 * include_once("config_ATO_PRO.php");
	 */

	// Retrieve FORM params
	$callback = $_GET['callback'];
	$serial = $_GET['serial'];

	$hosMap = new HospitalMap; // Object

	// Call function
	$hosMapDetails = $hosMap->getHospitalMapDetails($serial);

	// Callback to http request
	print $callback.'('.json_encode($hosMapDetails).')';

?>
