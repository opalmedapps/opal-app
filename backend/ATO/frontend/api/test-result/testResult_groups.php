<?php
	/* To get a list of existing test result groups */

	// Include config module
	// DEV 
	include_once("config_ATO_DEV.php");
	
	/* PRO
	 * include_once("config_ATO_PRO.php");
	 */

	// Retrieve FORM param
	$callback = $_GET['callback'];

	$testResult = new TestResult; // Object

	// Call function
	$groups = $testResult->getTestResultGroups();

	// Callback to http request
	print $callback.'('.json_encode($groups).')';

?>
