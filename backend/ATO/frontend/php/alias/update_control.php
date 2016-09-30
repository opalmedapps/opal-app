<?php 

	/* To call Alias Object to update alias when the "Update" checkbox
	 * has been changed
	 */

	// Include config module
	// DEV
	include_once("config_ATO_DEV.php");
	
	/* PRO
	 *include_once("config_ATO_PRO.php");
	 */

	$aliasObject = new Alias; // Object

	// Retrieve FORM params
	$aliasUpdates	= $_POST['updateList'];
	
	// Construct array
	$aliasList = array();

	foreach($aliasUpdates as $alias) {
		array_push($aliasList, array('serial' => $alias['serial'], 'update' => $alias['update']));
	}

	// Call function
    $response = $aliasObject->updateAliasControls($aliasList);
    print json_encode($response);

?>


