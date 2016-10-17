<?php 

	/* To call Alias Object to update alias when the "Update" checkbox
	 * has been changed
	 */

    $currentFile = __FILE__; // Get location of this script

    // Find config file based on this location 
    $configFile = substr($currentFile, 0, strpos($currentFile, "ATO")) . "ATO/php/config.php";
	// Include config file 
	include_once($configFile);

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
    print json_encode($response); // Return response

?>


