<?php
	/* To get a list of phase in treatments */

	// Include config module
	// DEV 
	include_once("config_ATO_DEV.php");
	
	/* PRO
	 * include_once("config_ATO_PRO.php");
	 */

	// Retrieve FORM param
	$callback = $_GET['callback'];

	$eduMat = new EduMaterial; // Object

	// Call function
	$phases = $eduMat->getPhaseInTreatments();

	// Callback to http request
	print $callback.'('.json_encode($phases).')';

?>
