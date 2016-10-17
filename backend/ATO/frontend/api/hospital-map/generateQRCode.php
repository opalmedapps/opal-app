<?php
    /* To generate a QRCode and return the path length */

    // Include config module
	// DEV 
	include_once("config_ATO_DEV.php");
	
	/* PRO
	 * include_once("config_ATO_PRO.php");
	 */

	// Retrieve FORM param
	$callback   = $_GET['callback'];
    $qrid       = $_GET['qrid'];
    $oldqrid    = $_GET['oldqrid'];

    $hosMap = new HospitalMap; // Object

    // Call function 
    $qrCode = $hosMap->generateQRCode($qrid, $oldqrid);

    // Callback to http request
    print $callback.'('.json_encode($qrCode).')';
?>
