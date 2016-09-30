<?php
	/* To get distinct test names */

	// Include config module
	// DEV 
	include_once("config_ATO_DEV.php");
	
	/* PRO
	 * include_once("config_ATO_PRO.php");
	 */

	// Retrieve FORM param
	$callback = $_GET['callback'];

	$testResultObject = new TestResult; // Object

	// Call function
	$testNames = $testResultObject->getTestNames();

	// Callback to http request
	print $callback.'('.json_encode($testNames).')';

?>
