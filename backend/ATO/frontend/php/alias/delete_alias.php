<?php

	/* To delete an alias */

	// Include config module
	// DEV
	include_once("config_ATO_DEV.php");

	/* PRO
	 *include_once("config_ATO_PRO.php");
	 */

	$alias = new Alias; // Object

	// Retrieve FORM param
	$serial = $_POST['serial'];

	// Call function
    $response = $alias->removeAlias($serial);
    print json_encode($response);

	// Redirect page
	//header("Location: ".ABS_URL."main.php#/control/db-population");

?>
