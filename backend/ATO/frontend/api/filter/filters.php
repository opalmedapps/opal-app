<?php
	/* To get filters (expression, dx, doctor, resource)*/

	// Include config module
	// DEV 
	include_once("config_ATO_DEV.php");
	
	/* PRO
	 * include_once("config_ATO_PRO.php");
	 */

	// Retrieve FORM param
	$callback = $_GET['callback'];

	$filterObject = new Filter; // Object

	// Call function
	$filters = $filterObject->getFilters();

	// Callback to http request
	print $callback.'('.json_encode($filters).')';

?>
