<?php
	/* To get a list of ARIA expressions */

	// Include config module
	// DEV 
	include_once("config_ATO_DEV.php");
	
	/* PRO
	 * include_once("config_ATO_PRO.php");
	 */

	// Retrieve FORM param
	$callback = $_GET['callback'];
	$type = $_GET['type'];

	$alias = new Alias; // Object

	// Call function
	$expressionList = $alias->getExpressions($type);

	// Callback to http request
	print $callback.'('.json_encode($expressionList).')';

?>
