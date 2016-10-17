<?php 

	/* To call Patient Object to update patient when the "Transfer Flag" checkbox
	 * has been changed
	 */

    $currentFile = __FILE__; // Get location of this script

    // Find config file based on this location 
    $configFile = substr($currentFile, 0, strpos($currentFile, "ATO")) . "ATO/php/config.php";
	// Include config file 
	include_once($configFile);

	$patientObject = new Patient; // Object

	// Retrieve FORM params
	$patientTransfers	= $_POST['transferList'];
	
	// Construct array
	$patientList = array();

	foreach($patientTransfers as $patient) {
		array_push($patientList, array('serial' => $patient['serial'], 'transfer' => $patient['transfer']));
	}

	// Call function
	$patientObject->updatePatientTransferFlags($patientList);
?>


