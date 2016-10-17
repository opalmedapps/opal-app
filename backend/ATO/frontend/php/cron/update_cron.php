<?php 

	/* To update cron with new information */

    $currentFile = __FILE__; // Get location of this script

    // Find config file based on this location 
    $configFile = substr($currentFile, 0, strpos($currentFile, "ATO")) . "ATO/php/config.php";
	// Include config file 
	include_once($configFile);

	$cron = new CronControl; // Object

	// Retrieve FORM params
	$nextCronDate 	= $_POST['nextCronDate'];
	$repeatUnits	= $_POST['repeatUnits'];
	$nextCronTime	= $_POST['nextCronTime'];
	$repeatInterval	= $_POST['repeatInterval'];

	// Contruct array
	$cronArray	= array(
		'nextCronDate' 	=> $nextCronDate, 
		'repeatUnits' 	=> $repeatUnits, 
		'nextCronTime' 	=> $nextCronTime, 
		'repeatInterval'=> $repeatInterval
	);

	// Call function
	$cron->updateCron($cronArray);

?>
