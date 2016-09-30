<?php

	/* To delete a hospital map */

	// Include config module
	// DEV
	include_once("config_ATO_DEV.php");

	/* PRO
	 *include_once("config_ATO_PRO.php");
	 */

	$hosMap = new HospitalMap; // Object

	// Retrieve FORM param
	$serial = $_POST['serial'];

	// Call function
	$hosMap->removeHospitalMap($serial);

?>
