<?php

	/* To delete an educational material */

    $currentFile = __FILE__; // Get location of this script

    // Find config file based on this location 
    $configFile = substr($currentFile, 0, strpos($currentFile, "ATO")) . "ATO/php/config.php";
	// Include config file 
	include_once($configFile);

	$testResult = new TestResult; // Object

	// Retrieve FORM param
	$serial = $_POST['serial'];

	// Call function
    $response = $testResult->removeTestResult($serial);
    print json_encode($response); // Return response

?>
