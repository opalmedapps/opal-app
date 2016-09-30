<?php
	/* To get details on a particular educational material */

	// Include config module 
	// DEV
	include_once("config_ATO_DEV.php");

	/* PRO
	 * include_once("config_ATO_PRO.php");
	 */

	// Retrieve FORM params
	$callback = $_GET['callback'];
	$serial = $_GET['serial'];

	$eduMat = new EduMaterial; // Object

	// Call function
	$eduMatDetails = $eduMat->getEducationalMaterialDetails($serial);

	// Callback to http request
	print $callback.'('.json_encode($eduMatDetails).')';

?>
