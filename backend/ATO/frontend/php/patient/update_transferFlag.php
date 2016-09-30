<?php 

	/* To call Patient Object to update patient when the "Transfer Flag" checkbox
	 * has been changed
	 */

	// Include config module
	// DEV
	include_once("config_ATO_DEV.php");
	
	/* PRO
	 *include_once("config_ATO_PRO.php");
	 */

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


