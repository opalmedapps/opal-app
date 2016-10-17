<?php
	/* To get a list of existing test results */

    $currentFile = __FILE__; // Get location of this script

    // Find config file based on this location 
    $configFile = substr($currentFile, 0, strpos($currentFile, "ATO")) . "ATO/php/config.php";
	// Include config file 
	include_once($configFile);

	// Retrieve FORM param
	$callback = $_GET['callback'];

	$testResult = new TestResult; // Object

	// Call function
	$existingTestResultList = $testResult->getExistingTestResults();

	// Callback to http request
	print $callback.'('.json_encode($existingTestResultList).')';

?>
