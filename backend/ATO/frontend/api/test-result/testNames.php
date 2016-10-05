<?php
	/* To get distinct test names */

    $currentFile = __FILE__; // Get location of this script

    // Find config file based on this location 
    $configFile = substr($currentFile, 0, strpos($currentFile, "ATO")) . "ATO/php/config.php";
	// Include config file 
	include_once($configFile);

	// Retrieve FORM param
	$callback = $_GET['callback'];

	$testResultObject = new TestResult; // Object

	// Call function
	$testNames = $testResultObject->getTestNames();

	// Callback to http request
	print $callback.'('.json_encode($testNames).')';

?>
