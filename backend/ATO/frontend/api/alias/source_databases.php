<?php
	/* To get a list of source databases */

    $currentFile = __FILE__; // Get location of this script

    // Find config file based on this location 
    $configFile = substr($currentFile, 0, strpos($currentFile, "ATO")) . "ATO/php/config.php";
	// Include config file 
	include_once($configFile);

	// Retrieve FORM param
	$callback = $_GET['callback'];
	$type = $_GET['type'];

	$alias = new Alias; // Object

	// Call function
	$sourceDBList = $alias->getSourceDatabases();

	// Callback to http request
	print $callback.'('.json_encode($sourceDBList).')';

?>
