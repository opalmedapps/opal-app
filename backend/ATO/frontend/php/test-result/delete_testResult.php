<?php

	/* To delete an educational material */

	// Include config module
	// DEV
	include_once("config_ATO_DEV.php");

	/* PRO
	 *include_once("config_ATO_PRO.php");
	 */

	$testResult = new TestResult; // Object

	// Retrieve FORM param
	$serial = $_POST['serial'];

	// Call function
    $response = $testResult->removeTestResult($serial);
    print json_encode($response);

?>
