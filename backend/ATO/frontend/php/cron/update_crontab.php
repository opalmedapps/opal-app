<?php

	/* To update crontab when this file is called from the command line */

	// Include config module
	// DEV
	include_once("config_ATO_DEV.php");

	/* PRO
	 *include_once("config_ATO_PRO.php");
	 */

	$cron = new CronControl; // Object

	// The argument pass is the cronSer
	$cronSer = $argv[1];
		
	// Call function
	$cron->updateCrontab($cronSer);
?>
