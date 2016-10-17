<?php
	/* To get details on a particular test result */

	// Include config module 
	// DEV
	include_once("config_ATO_DEV.php");

	/* PRO
	 * include_once("config_ATO_PRO.php");
	 */

	// Retrieve FORM params
	$callback = $_GET['callback'];
	$serial = $_GET['serial'];

	$testResult = new TestResult; // Object

	// Call function
	$testResultDetails = $testResult->getTestResultDetails($serial);

	// Callback to http request
	print $callback.'('.json_encode($testResultDetails).')';

?>
