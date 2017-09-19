<?php
    /* To generate a QRCode and return the path length */

    $currentFile = __FILE__; // Get location of this script

    // Find config file based on this location 
    $configFile = substr($currentFile, 0, strpos($currentFile, "ATO")) . "ATO/php/config.php";
	// Include config file 
	include_once($configFile);

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
