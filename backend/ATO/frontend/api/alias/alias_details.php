<?php
	/* To get details on a particular alias */

    $currentFile = __FILE__; // Get location of this script

    // Find config file based on this location 
    $configFile = substr($currentFile, 0, strpos($currentFile, "ATO")) . "ATO/php/config.php";
	// Include config file 
	include_once($configFile);

	// Retrieve FORM params
	$callback = $_GET['callback'];
	$serial = $_GET['serial'];

	$alias = new Alias; // Object

	// Call function
	$AliasDetails = $alias->getAliasDetails($serial);

	// Callback to http request
	print $callback.'('.json_encode($AliasDetails).')';

?>
