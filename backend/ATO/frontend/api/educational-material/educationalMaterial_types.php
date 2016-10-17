<?php
	/* To get a list of existing educational material types */

    $currentFile = __FILE__; // Get location of this script

    // Find config file based on this location 
    $configFile = substr($currentFile, 0, strpos($currentFile, "ATO")) . "ATO/php/config.php";
	// Include config file 
	include_once($configFile);

	// Retrieve FORM param
	$callback = $_GET['callback'];

	$eduMat = new EduMaterial; // Object

	// Call function
	$types = $eduMat->getEducationalMaterialTypes();

	// Callback to http request
	print $callback.'('.json_encode($types).')';

?>
