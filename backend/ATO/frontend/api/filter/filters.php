<?php
	/* To get filters (expression, dx, doctor, resource)*/

    $currentFile = __FILE__; // Get location of this script

    // Find config file based on this location 
    $configFile = substr($currentFile, 0, strpos($currentFile, "ATO")) . "ATO/php/config.php";
	// Include config file 
	include_once($configFile);

	// Retrieve FORM param
	$callback = $_GET['callback'];

	$filterObject = new Filter; // Object

	// Call function
	$filters = $filterObject->getFilters();

	// Callback to http request
	print $callback.'('.json_encode($filters).')';

?>
