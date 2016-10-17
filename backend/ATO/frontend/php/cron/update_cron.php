<?php 

	/* To update cron with new information */

	// Include config module
	// DEV
	include_once("config_ATO_DEV.php");

	/* PRO
	 *include_once("config_ATO_PRO.php");
	 */

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
