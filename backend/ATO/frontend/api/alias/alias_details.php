<?php
	/* To get details on a particular alias */

	// Include config module 
	// DEV
	include_once("config_ATO_DEV.php");

	/* PRO
	 * include_once("config_ATO_PRO.php");
	 */

	// Retrieve FORM params
	$callback = $_GET['callback'];
	$serial = $_GET['serial'];

	$alias = new Alias; // Object

	// Call function
	$AliasDetails = $alias->getAliasDetails($serial);

	// Callback to http request
	print $callback.'('.json_encode($AliasDetails).')';

?>
