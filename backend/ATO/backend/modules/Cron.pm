#!/usr/bin/perl
#---------------------------------------------------------------------------------
# A.Joseph 17-Nov-2015 ++ File: Cron.pm
#---------------------------------------------------------------------------------
# Perl module that handles the backend cron controls (logs)
#

package Cron; # Declare package name


use Time::Piece;
use Time::Seconds;
use POSIX;
use Database;

#---------------------------------------------------------------------------------
# Connect to the database
#---------------------------------------------------------------------------------
my $SQLDatabase		= $Database::targetDatabase;

#====================================================================================
# Subroutine to set the cron log
#====================================================================================
sub setCronLog
{
    my ($status, $datetime) = @_; # cron information

    my $insert_sql = "
        INSERT INTO
            CronLog (
                CronLogSerNum,
                CronSerNum,
                CronStatus,
                CronDateTime
            )
        VALUES (
            NULL,
            '1',
            '$status',
            '$datetime'
        )
    ";
	# prepare query
	my $query = $SQLDatabase->prepare($insert_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;

}


#====================================================================================
# Subroutine to set the next cron 
#====================================================================================
sub setNextCron
{
    my ($nextCronDate, $repeatUnits, $nextCronTime, $repeatInterval);
    my $sql = "
        SELECT
            Cron.NextCronDate,
            Cron.RepeatUnits,
            Cron.NextCronTime,
            Cron.RepeatInterval
        FROM
            Cron
        WHERE
            Cron.CronSerNum = 1
    ";
	# prepare query
	my $query = $SQLDatabase->prepare($sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;

    while (my @data = $query->fetchrow_array()) {
    
        $nextCronDate       = $data[0];
        $repeatUnits        = $data[1];
        $nextCronTime       = $data[2];
        $repeatInterval     = $data[3];
    }

    # Concat date and time
    my $nextCron = $nextCronDate . " " . $nextCronTime;
    # Convert to datetime object
    $nextCron = Time::Piece->strptime($nextCron, "%Y-%m-%d %H:%M:%S");

    if ($repeatUnits eq "Minutes") {
        $minutes = $nextCron->minute;
        # because cron runs on every multiple of $repeatInterval (starting from 0)
        # we only need to add the neccesary minutes that result in a multiple of $repeatInterval
        # for ex: if $repeatInterval = 5 and the cron was set at 2:03;
        # the crontab will execute on every 5 (so, 2:05); so we only need to add
        # 2 minutes to the initial cron set. 
        $minutesToAdd = $repeatInterval - ($minutes % $repeatInterval);
        $nextCron += 60*$minutesToAdd; # add (in seconds)
    }
    if ($repeatUnits eq "Hours") {
        $hours = $nextCron->hour;
        $hoursToAdd = $repeatInterval - ($hours % $repeatInterval);
        $nextCron += 60*60*$hoursToAdd;
    }

    # Separate back date and time
    $nextCronDate = $nextCron->strftime("%Y-%m-%d");
    $nextCronTime = $nextCron->strftime("%H:%M:%S");

    # Place it back into database
    $sql = "
        UPDATE
            Cron
        SET
            NextCronDate = '$nextCronDate',
            NextCronTime = '$nextCronTime'
        WHERE
            CronSerNum = 1
    ";
    # prepare query
	my $query = $SQLDatabase->prepare($sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;

}

# To exit/return always true (for the module itself)
1;
