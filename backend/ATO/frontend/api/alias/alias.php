<?php
	/* To get a list of existing alias */

	// Include config module
	// DEV 
	include_once("config_ATO_DEV.php");
	
	/* PRO
	 * include_once("config_ATO_PRO.php");
	 */

	// Retrieve FORM param
	$callback = $_GET['callback'];

	$alias = new Alias; // Object

	// Call function
	$existingAliasList = $alias->getExistingAliases();

	// Callback to http request
	print $callback.'('.json_encode($existingAliasList).')';

?>
