#!/usr/bin/perl
#---------------------------------------------------------------------------------
# A.Joseph 10-Aug-2015 ++ File: Task.pm
#---------------------------------------------------------------------------------
# Perl module that creates a task class. This module calls a constructor to 
# create a task object that contains task information stored as object 
# variables.
#
# There exists various subroutines to set task information, get task information
# and compare task information between two task objects. 
# There exists various subroutines that use the Database.pm module to update the
# MySQL database and check if a task exists already in this database.

package Task; # Declare package name


use Exporter; # To export subroutines and variables
use Database; # Use our custom database module Database.pm
use Time::Piece; # To parse and convert date time
use POSIX;
use Storable qw(dclone); # for deep copies

use Patient; # Our patient module
use Alias; # Our Alias module
use Priority; # Our priority module
use Diagnosis; # Our diagnosis module

#---------------------------------------------------------------------------------
# Connect to the databases
#---------------------------------------------------------------------------------

my $sourceDatabase	= $Database::sourceDatabase;
my $SQLDatabase		= $Database::targetDatabase;

#====================================================================================
# Constructor for our Task class 
#====================================================================================
sub new
{
	my $class = shift;
	my $task = {
		_ser			    => undef,
		_ariaser		    => undef,
		_patientser		    => undef,
		_aliasexpressionser	=> undef,
		_duedatetime		=> undef,
        _diagnosisser       => undef,
        _priorityser        => undef,
	};

	# bless associates an object with a class so Perl knows which package to search for
	# when a method is envoked on this object
	bless $task, $class; 
	return $task;
}

#====================================================================================
# Subroutine to set the task serial
#====================================================================================
sub setTaskSer
{
	my ($task, $ser) = @_; # task object with provided serial in arguments
	$task->{_ser} = $ser; # set the ser
	return $task->{_ser};
}

#====================================================================================
# Subroutine to set the task patient serial
#====================================================================================
sub setTaskPatientSer
{
	my ($task, $patientser) = @_; # task object with provided serial in arguments
	$task->{_patientser} = $patientser; # set the ser
	return $task->{_patientser};
}

#====================================================================================
# Subroutine to set the task aria serial
#====================================================================================
sub setTaskAriaSer
{
	my ($task, $ariaser) = @_; # task object with provided serial in arguments
	$task->{_ariaser} = $ariaser; # set the ser
	return $task->{_ariaser};
}

#====================================================================================
# Subroutine to set the task alias expression serial
#====================================================================================
sub setTaskAliasExpressionSer
{
	my ($task, $aliasexpressionser) = @_; # task object with provided serial in arguments
	$task->{_aliasexpressionser} = $aliasexpressionser; # set the serial
	return $task->{_aliasexpressionser};
}

#====================================================================================
# Subroutine to set the task Due DateTime 
#====================================================================================
sub setTaskDueDateTime
{
	my ($task, $duedatetime) = @_; # task object with provided due datetime in arguments
	$task->{_duedatetime} = $duedatetime; # set the due datetime
	return $task->{_duedatetime};
}

#====================================================================================
# Subroutine to set the task priority serial
#====================================================================================
sub setTaskPrioritySer
{
	my ($task, $priorityser) = @_; # task object with provided serial in arguments
	$task->{_priorityser} = $priorityser; # set the ser
	return $task->{_priorityser};
}

#====================================================================================
# Subroutine to set the task diagnosis serial
#====================================================================================
sub setTaskDiagnosisSer
{
	my ($task, $diagnosisser) = @_; # task object with provided serial in arguments
	$task->{_diagnosisser} = $diagnosisser; # set the ser
	return $task->{_diagnosisser};
}

#====================================================================================
# Subroutine to get the Task ser
#====================================================================================
sub getTaskSer
{
	my ($task) = @_; # our task object
	return $task->{_ser};
}

#====================================================================================
# Subroutine to get the Task patient serial
#====================================================================================
sub getTaskPatientSer
{
	my ($task) = @_; # our task object
	return $task->{_patientser};
}

#====================================================================================
# Subroutine to get the task aria serial
#====================================================================================
sub getTaskAriaSer
{
	my ($task) = @_; # our task object
	return $task->{_ariaser};
}

#====================================================================================
# Subroutine to get the task alias expression serial 
#====================================================================================
sub getTaskAliasExpressionSer
{
	my ($task) = @_; # our task object
	return $task->{_aliasexpressionser};
}

#====================================================================================
# Subroutine to get the task Due DateTime 
#====================================================================================
sub getTaskDueDateTime
{
	my ($task) = @_; # our task object
	return $task->{_duedatetime};
}

#====================================================================================
# Subroutine to get the Task priority serial
#====================================================================================
sub getTaskPrioritySer
{
	my ($task) = @_; # our task object
	return $task->{_priorityser};
}

#====================================================================================
# Subroutine to get the Task diagnosis ser
#====================================================================================
sub getTaskDiagnosisSer
{
	my ($task) = @_; # our task object
	return $task->{_diagnosisser};
}

#======================================================================================
# Subroutine to get tasks from the ARIA db for automatic cron
#======================================================================================
sub getTasksFromSourceDB
{
	my (@patientList) = @_; # a list of patients from args 

	my @taskList = (); # initialize a list for task objects

	# when we retrieve query results
	my ($ariaser, $expressionname, $duedatetime, $priorityser, $diagnosisser); 
    my $lastupdated;

    # retrieve all aliases that are marked for update
    my @aliasList = Alias::getAliasesMarkedForUpdate('Task');

	foreach my $Patient (@patientList) {

		my $patientSer		    = $Patient->getPatientSer(); # get patient serial
		my $ariaSer		        = $Patient->getPatientAriaSer(); # get aria serial
		my $patientlastupdated	= $Patient->getPatientLastUpdated(); # get last updated

        foreach my $Alias (@aliasList) {

            my $aliasSer            = $Alias->getAliasSer(); # get alias serial
            my @expressions         = $Alias->getAliasExpressions(); 
            my $aliaslastupdated    = $Alias->getAliasLastUpdated();
	        # convert expression list into a string enclosed in quotes
		    my $expressionText = join ',', map { qq/'$_->{_name}'/ } @expressions;

            # compare last updates to find the earliest date 
            my $formatted_PLU = Time::Piece->strptime($patientlastupdated, "%Y-%m-%d %H:%M:%S");
            my $formatted_ALU = Time::Piece->strptime($aliaslastupdated, "%Y-%m-%d %H:%M:%S");
            # get the diff in seconds
            my $date_diff = $formatted_PLU - $formatted_ALU;
            if ($date_diff < 0) {
                $lastupdated = $patientlastupdated;
            } else {
                $lastupdated = $aliaslastupdated;
            }

    		my $taskInfo_sql = "
	    		SELECT DISTINCT
		    		NonScheduledActivity.NonScheduledActivitySer,
			    	vv_ActivityLng.Expression1, 
				    NonScheduledActivity.DueDateTime
    			FROM  
	    			Patient,
		    		NonScheduledActivity,
			    	ActivityInstance,
           		    Activity,
    	           	vv_ActivityLng
            	WHERE     
                     		NonScheduledActivity.ActivityInstanceSer 	= ActivityInstance.ActivityInstanceSer
	                AND 	ActivityInstance.ActivitySer 			    = Activity.ActivitySer
        	        AND 	Activity.ActivityCode 				        = vv_ActivityLng.LookupValue
    	    		AND 	Patient.PatientSer 				            = NonScheduledActivity.PatientSer     
	    		    AND	    Patient.PatientSer				            = '$ariaSer'
		        	AND 	NonScheduledActivity.ObjectStatus 		    != 'Deleted' 
			        AND 	NonScheduledActivity.HstryDateTime		    > '$lastupdated' 
                    AND     vv_ActivityLng.Expression1                  IN ($expressionText)
      		";
	    	# prepare query
    		my $query = $sourceDatabase->prepare($taskInfo_sql)
	    		or die "Could not prepare query: " . $sourceDatabase->errstr;

		    # execute query
    		$query->execute()
	    		or die "Could not execute query: " . $query->errstr;

            my $data = $query->fetchall_arrayref();
    		foreach my $row (@$data) {
		
	    		my $task = new Task(); # new task object

    			$ariaser	    = $row->[0];
    			$expressionname	= $row->[1];
	    		$duedatetime	= convertDateTime($row->[2]); # convert date format
			
                $priorityser	= Priority::getClosestPriority($patientSer, $duedatetime);
    			$diagnosisser	= Diagnosis::getClosestDiagnosis($patientSer, $duedatetime);

                # Search through alias expression list to find associated
    			# expression serial number (in our DB)
	    		my $expressionser;
		    	foreach my $checkExpression (@expressions) {
    
	    			if ($checkExpression->{_name} eq $expressionname) { # match
    
		    			$expressionser = $checkExpression->{_ser};
			    		last; # break out of loop
				    }
    			}

    			$task->setTaskPatientSer($patientSer);
	    		$task->setTaskAriaSer($ariaser); # assign id
		    	$task->setTaskAliasExpressionSer($expressionser); # assign expression serial
			    $task->setTaskDueDateTime($duedatetime); # assign duedatetime
				$task->setTaskPrioritySer($priorityser);
			    $task->setTaskDiagnosisSer($diagnosisser);

    			push(@taskList, $task);
				
	    	}

        }
	}

	return @taskList;
}

#======================================================================================
# Subroutine to check if a particular task exists in our MySQL db
#	@return: task object (if exists) .. NULL otherwise
#======================================================================================
sub inOurDatabase
{
	my ($task) = @_; # our task object	
	my $ariaser = $task->getTaskAriaSer(); # retrieve Task aria serial

	my $TaskAriaSerInDB = 0; # false by default. Will be true if task exists
	my $ExistingTask = (); # data to be entered if task exists

	# Other task variable, if task exists
	my ($ser, $patientser, $aliasexpressionser, $duedatetime, $priorityser, $diagnosisser);

	my $inDB_sql = "
		SELECT
			Task.TaskAriaSer,
			Task.AliasExpressionSerNum,
			Task.DueDateTime,
			Task.TaskSerNum,
			Task.PatientSerNum,
            Task.PrioritySerNum,
            Task.DiagnosisSerNum
		FROM
			Task
		WHERE
			Task.TaskAriaSer = $ariaser
	";

	# prepare query
	my $query = $SQLDatabase->prepare($inDB_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;
	
	while (my @data = $query->fetchrow_array()) {

		$TaskAriaSerInDB	= $data[0];
		$aliasexpressionser	= $data[1];
		$duedatetime		= $data[2];
		$ser			    = $data[3];
		$patientser		    = $data[4];
        $priorityser        = $data[5];
        $diagnosisser       = $data[6];
	}

	if ($TaskAriaSerInDB) {

		$ExistingTask = new Task(); # initialize task object

		$ExistingTask->setTaskAriaSer($TaskAriaSerInDB); # set the task aria serial
		$ExistingTask->setTaskAliasExpressionSer($aliasexpressionser); # set the expression serial
		$ExistingTask->setTaskDueDateTime($duedatetime); # set the due datetime
		$ExistingTask->setTaskSer($ser);
		$ExistingTask->setTaskPatientSer($patientser);
        $ExistingTask->setTaskPrioritySer($priorityser);
        $ExistingTask->setTaskDiagnosisSer($diagnosisser);
		
		return $ExistingTask; # this is true (ie. task exists, return object)
	}
	
	else {return $ExistingTask;} # this is false (ie. task DNE, return empty)
}

#======================================================================================
# Subroutine to insert our task info in our database
#======================================================================================
sub insertTaskIntoOurDB
{
	my ($task) = @_; # our task object to insert

	my $patientser		    = $task->getTaskPatientSer();
	my $ariaser		        = $task->getTaskAriaSer();
	my $aliasexpressionser	= $task->getTaskAliasExpressionSer();
	my $duedatetime		    = $task->getTaskDueDateTime();
	my $diagnosisser		= $task->getTaskDiagnosisSer();
	my $priorityser		    = $task->getTaskPrioritySer();

	my $insert_sql = "
		INSERT INTO 
			Task (
				PatientSerNum,
				TaskAriaSer,
				AliasExpressionSerNum,
				DueDateTime,
                PrioritySerNum,
                DiagnosisSerNum,
                DateAdded
			)
		VALUES (
			'$patientser',
			'$ariaser',
			'$aliasexpressionser',
			'$duedatetime',
            '$priorityser',
            '$diagnosisser',
            NOW()
		)
	";
	
	# prepare query
	my $query = $SQLDatabase->prepare($insert_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;

	# Retrieve the TaskSer
	my $ser = $SQLDatabase->last_insert_id(undef, undef, undef, undef);

	# Set the Serial in our task object
	$task->setTaskSer($ser);

	return $task;
}

#======================================================================================
# Subroutine to update our database with the task's updated info
#======================================================================================
sub updateDatabase
{
	my ($task) = @_; # our task object to update

	my $ariaser		        = $task->getTaskAriaSer();
	my $aliasexpressionser	= $task->getTaskAliasExpressionSer();
	my $duedatetime		    = $task->getTaskDueDateTime();
	my $diagnosisser		= $task->getTaskDiagnosisSer();
	my $priorityser		    = $task->getTaskPrioritySer();

	my $update_sql = "
		
		UPDATE
			Task
		SET
			AliasExpressionSerNum	= '$aliasexpressionser',
			DueDateTime		        = '$duedatetime',
            PrioritySerNum          = '$priorityser',
            DiagnosisSerNum         = '$diagnosisser'
		WHERE
			TaskAriaSer		= '$ariaser'
	";

	# prepare query
	my $query = $SQLDatabase->prepare($update_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;
	
}

#======================================================================================
# Subroutine to compare two task objects. If different, use setter functions
# to update task object.
#======================================================================================
sub compareWith
{
	my ($SuspectTask, $OriginalTask) = @_; # our two task objects from arguments
	my $UpdatedTask = dclone($OriginalTask); 

	# retrieve parameters
	# Suspect Task...
	my $Sduedatetime	= $SuspectTask->getTaskDueDateTime();
	my $Saliasexpressionser	= $SuspectTask->getTaskAliasExpressionSer();
    my $Spriorityser        = $SuspectTask->getTaskPrioritySer();
    my $Sdiagnosisser       = $SuspectTask->getTaskDiagnosisSer();

	# Original Task...
	my $Oduedatetime	= $OriginalTask->getTaskDueDateTime();
	my $Oaliasexpressionser	= $OriginalTask->getTaskAliasExpressioSer();
    my $Opriorityser        = $OriginalTask->getTaskPrioritySer();
    my $Odiagnosisser       = $OriginalTask->getTaskDiagnosisSer();

	# go through each parameter
	
	if ($Sduedatetime ne $Oduedatetime) {

		print "Task Due Date has changed from '$Oduedatetime' to '$Sduedatetime'\n";
		my $updatedDueDateTime = $UpdatedTask->setTaskDueDateTime($Sduedatetime); # update 
		print "Will update database entry to '$updatedDueDateTime'.\n";
	}
	if ($Saliasexpressionser ne $Oaliasexpressionser) {

		print "Task Alias Expression Serial has changed from '$Oaliasexpressionser' to '$Saliasexpressionser'\n";
		my $updatedAESer = $UpdatedTask->setTaskAliasExpressionSer($Saliasexpressionser); # update 
		print "Will update database entry to '$updatedAESer'.\n";
	}
	if ($Spriorityser ne $Opriorityser) {

		print "Task Priority serial has changed from '$Opriorityser' to '$Spriorityser'\n";
		my $updatedPrioritySer = $UpdatedTask->setTaskPrioritySer($Spriorityser); # update 
		print "Will update database entry to '$updatedPrioritySer'.\n";
	}
	if ($Sdiagnosisser ne $Odiagnosisser) {

		print "Task Diagnosis serial has changed from '$Odiagnosisser' to '$Sdiagnosisser'\n";
		my $updatedDiagnosisSer = $UpdatedTask->setTaskDiagnosisSer($Sdiagnosisser); # update 
		print "Will update database entry to '$updatedDiagnosisSer'.\n";
	}

	return $UpdatedTask;
}

#======================================================================================
# Subroutine to convert date format
# 	Converts "Jul 13 2013 4:23pm" to "2013-07-13 16:23:00"
#======================================================================================
sub convertDateTime 
{
	my ($inputDate) = @_;

	my $dateFormat = Time::Piece->strptime($inputDate,"%b %d %Y %I:%M%p");

	my $convertedDate = $dateFormat->strftime("%Y-%m-%d %H:%M:%S");

	return $convertedDate;
}

# To exit/return always true (for the module itself)
1;	




