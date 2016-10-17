<?php 

	/* To call Test Result Object to update when the "Publish Flag" checkbox
	 * has been changed
	 */

	// Include config module
	// DEV
	include_once("config_ATO_DEV.php");
	
	/* PRO
	 *include_once("config_ATO_PRO.php");
	 */

	$testResultObject = new TestResult; // Object

	// Retrieve FORM params
	$testResultPublishes	= $_POST['publishList'];
	
	// Construct array
	$testResultList = array();

	foreach($testResultPublishes as $testResult) {
		array_push($testResultList, array('serial' => $testResult['serial'], 'publish' => $testResult['publish']));
	}

	// Call function
    $response = $testResultObject->updatePublishFlags($testResultList);
    print json_encode($response);
?>


