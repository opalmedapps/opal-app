<?php
	/* To get a list of existing test results */

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
	$existingTestResultList = $testResult->getExistingTestResults();

	// Callback to http request
	print $callback.'('.json_encode($existingTestResultList).')';

?>
