<?php

	/* To update crontab when this file is called from the command line */

    $currentFile = __FILE__; // Get location of this script

    // Find config file based on this location 
    $configFile = substr($currentFile, 0, strpos($currentFile, "ATO")) . "ATO/php/config.php";
	// Include config file 
	include_once($configFile);

	$cron = new CronControl; // Object

	// The argument pass is the cronSer
	$cronSer = $argv[1];
		
	// Call function
	$cron->updateCrontab($cronSer);
?>
