<?php

	/* To delete an alias */

    $currentFile = __FILE__; // Get location of this script

    // Find config file based on this location 
    $configFile = substr($currentFile, 0, strpos($currentFile, "ATO")) . "ATO/php/config.php";
	// Include config file 
	include_once($configFile);

	$alias = new Alias; // Object

	// Retrieve FORM param
	$serial = $_POST['serial'];

	// Call function
    $response = $alias->removeAlias($serial);
    print json_encode($response); // Return response

?>
