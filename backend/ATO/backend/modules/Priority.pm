#!/usr/bin/perl

#---------------------------------------------------------------------------------
# A.Joseph 13-Aug-2014 ++ File: Priority.pm
#---------------------------------------------------------------------------------
# Perl module that creates a priority class. This module calls a constructor to 
# create a priority object that contains priority information stored as object 
# variables.
#
# There exists various subroutines to set priority information and compare priority
# information between two priority objects. 
# There exists various subroutines that use the Database.pm module to update the
# MySQL database and check if a priority exists already in this database.

package Priority; # Declare package name


use Exporter; # To export subroutines and variables
use Database; # Use our custom database module Database.pm
use Time::Piece;
use Storable qw(dclone); # for deep copies

use Patient; # our custom patient module

#---------------------------------------------------------------------------------
# Connect to our database
#---------------------------------------------------------------------------------
my $SQLDatabase		= $Database::targetDatabase;

#====================================================================================
# Constructor for our Priority class 
#====================================================================================
sub new
{
	my $class = shift;
	my $priority = {
		_ser		    => undef,
		_patientser	    => undef,
        _sourcedbser    => undef,
		_sourceuid		=> undef,
		_datestamp	    => undef,
		_code		    => undef,
	};

	# bless associates an object with a class so Perl knows which package to search for
	# when a method is envoked on this object
	bless $priority, $class; 
	return $priority;
}

#====================================================================================
# Subroutine to set the priority serial 
#====================================================================================
sub setPrioritySer
{
	my ($priority, $ser) = @_; # priority object with provided serial in arguments
	$priority->{_ser} = $ser; # set the serial
	return $priority->{_ser};
}

#====================================================================================
# Subroutine to set the priority patient serial 
#====================================================================================
sub setPriorityPatientSer
{
	my ($priority, $patientser) = @_; # priority object with provided serial in arguments
	$priority->{_patientser} = $patientser; # set the serial
	return $priority->{_patientser};
}

#====================================================================================
# Subroutine to set the priority source database serial 
#====================================================================================
sub setPrioritySourceDatabaseSer
{
	my ($priority, $sourcedbser) = @_; # priority object with provided serial in arguments
	$priority->{_sourcedbser} = $sourcedbser; # set the serial
	return $priority->{_sourcedbser};
}

#====================================================================================
# Subroutine to set the priority uid
#====================================================================================
sub setPrioritySourceUID
{
	my ($priority, $sourceuid) = @_; # priority object with provided uid in arguments
	$priority->{_sourceuid} = $sourceuid; # set the id
	return $priority->{_sourceuid};
}

#====================================================================================
# Subroutine to set priority DateStamp 
#====================================================================================
sub setPriorityDateStamp
{
	my ($priority, $datestamp) = @_; # priority object with provided datestamp in arguments
	$priority->{_datestamp} = $datestamp; # set the datestamp
	return $priority->{_datestamp};
}

#====================================================================================
# Subroutine to set priority code 
#====================================================================================
sub setPriorityCode
{
	my ($priority, $code) = @_; # priority object with provided code in arguments
	$priority->{_code} = $code; # set the code
	return $priority->{_code};
}

#======================================================================================
# Subroutine to get the priority serial
#======================================================================================
sub getPrioritySer
{
	my ($priority) = @_; # our priority object
	return $priority->{_ser};
}

#======================================================================================
# Subroutine to get the priority patient serial
#======================================================================================
sub getPriorityPatientSer
{
	my ($priority) = @_; # our priority object
	return $priority->{_patientser};
}

#======================================================================================
# Subroutine to get the priority source database serial
#======================================================================================
sub getPrioritySourceDatabaseSer
{
	my ($priority) = @_; # our priority object
	return $priority->{_sourcedbser};
}

#======================================================================================
# Subroutine to get the priority UID
#======================================================================================
sub getPrioritySourceUID
{
	my ($priority) = @_; # our priority object
	return $priority->{_sourceuid};
}

#======================================================================================
# Subroutine to get the priority DateStamp
#======================================================================================
sub getPriorityDateStamp
{
	my ($priority) = @_; # our priority object
	return $priority->{_datestamp};
}
	
#======================================================================================
# Subroutine to get the priority code
#======================================================================================
sub getPriorityCode
{
	my ($priority) = @_; # our priority object
	return $priority->{_code};
}

#======================================================================================
# Subroutine to get all priority info from the ARIA db since the last cron
#======================================================================================
sub getPrioritiesFromSourceDB
{
	my (@patientList) = @_; # args
	my @priorityList = (); # initialize a list of priority objects
	
	my ($patientser, $sourceuid, $datestamp, $code); # when we retrieve query results

	foreach my $Patient (@patientList) { 

		my $patientSer		    = $Patient->getPatientSer(); # get patient ser
		my $patientSourceUID	= $Patient->getPatientSourceUID(); # get patient uid
        my $sourceDBSer         = $Patient->getPatientSourceDatabaseSer();
		my $lastTransfer        = $Patient->getPatientLastTransfer(); # get last updated

        # ARIA
        if ($sourceDBSer eq 1) {

            my $sourceDatabase = Database::connectToSourceDatabase($sourceDBSer);
    		my $priorInfo_sql = "
	    		SELECT DISTINCT
		    		nsa.NonScheduledActivitySer,
			    	nsa.DueDateTime,
				    vva.Expression1
    			FROM	
	    			variansystem.dbo.Patient pt,
		    		variansystem.dbo.NonScheduledActivity nsa,
			    	variansystem.dbo.ActivityInstance ai,
				    variansystem.dbo.Activity act,
    				variansystem.dbo.vv_ActivityLng vva
	    		WHERE
		    	    nsa.ActivityInstanceSer 	= ai.ActivityInstanceSer
	            AND ai.ActivitySer 			    = act.ActivitySer
    	        AND act.ActivityCode 			= vva.LookupValue
	    	   	AND pt.PatientSer 				= nsa.PatientSer
                AND pt.PatientSer               = '$patientSourceUID'  
			    AND nsa.ObjectStatus 		    != 'Deleted' 
    			AND vva.Expression1			    IN ('SGAS_P1','SGAS_P2','SGAS_P3','SGAS_P4')
	    		AND	nsa.HstryDateTime		    > '$lastTransfer'
		    ";
    		# prepare query
	    	my $query = $sourceDatabase->prepare($priorInfo_sql)
		    	or die "Could not prepare query: " . $sourceDatabase->errstr;

    		# execute query
	    	$query->execute()
		    	or die "Could not execute query: " . $query->errstr;
    
	    	my $data = $query->fetchall_arrayref();
		    foreach my $row (@$data) {

    			my $priority = new Priority(); # new priority object
    
	    		$sourceuid	    = $row->[0];
		    	$datestamp		= convertDateTime($row->[1]);
			    $code			= $row->[2];
    
	    		# set priority information
		    	$priority->setPrioritySourceUID($sourceuid);
                $priority->setPrioritySourceDatabaseSer($sourceDBSer);
			    $priority->setPriorityDateStamp($datestamp);
    			$priority->setPriorityCode($code);
	    		$priority->setPriorityPatientSer($patientSer);
    
	    		push(@priorityList, $priority);
            }

            $sourceDatabase->disconnect();
        }

    
	}

	return @priorityList;
}

#======================================================================================
# Subroutine to get the closest priority in time given the patient serial and a date
# 	@return: priority serial 
#======================================================================================
sub getClosestPriority
{
	my ($patientSer, $referencedate) = @_; # get the patient serial and a ref date

	my ($closestdate, $prioritySer);

	# Since the priority datetime will be ascending,
	# if the first priority date is already passed the ref date in time,
 	# then we'll just take the first priority, and break. 
	my $first = 1;

	my $date_sql = "
		SELECT DISTINCT
			Priority.PriorityDateTime,
			Priority.PrioritySerNum
		FROM
			Priority
		WHERE
			Priority.PatientSerNum	= '$patientSer'
		ORDER BY 
			Priority.PriorityDateTime ASC
	";	

	# prepare query
	my $query = $SQLDatabase->prepare($date_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;

	# how this will work is that we loop each due date until 
	# said date passes the reference date. In other words, the 
	# delay gets smaller and may turn negative. The smallest,
	# non-negative delay is the closest date.
	while (my @data = $query->fetchrow_array()) {

		$closestdate = $data[0];
		my $delay_sql = "
			SELECT TIMESTAMPDIFF(DAY, '$closestdate', '$referencedate')
		";
		# prepare query
		my $delayquery = $SQLDatabase->prepare($delay_sql)
			or die "Could not prepare query: " . $SQLDatabase->errstr;

		# execute query
		$delayquery->execute()
			or die "Could not execute query: " . $delayquery->errstr;

		my @delaydata = $delayquery->fetchrow_array();

		my $delay = int($delaydata[0]);

		# reached negative delay, break out of loop
		if ($delay < 0) {
			# however, if the first priority is passed the ref date
			# by less than 100 days, then count it as the closest priority
			if ($first and $delay > -100) { 
				$prioritySer = $data[1];
				last;
			}
			last;
		}

		# assign priority serial 
		$prioritySer = $data[1];

		$first = undef;	 # passed the first priority

	}
		
	return $prioritySer;
}

#======================================================================================
# Subroutine to check if our priority exists in our MySQL db
#	@return: priority object (if exists) .. NULL otherwise
#======================================================================================
sub inOurDatabase
{
	my ($priority) = @_; # our priority object
    
	my $prioritySourceUID   = $priority->getPrioritySourceUID(); # retrieve the id from our object
    my $sourceDBSer         = $priority->getPrioritySourceDatabaseSer();

	my $PrioritySourceUIDInDB = 0; # false by default. Will be true if priority exists
	my $ExistingPriority = (); # data to be entered if priority exists
	
	# Other priority variables, if priority exists
	my ($ser, $patientser, $datestamp, $code);

	my $inDB_sql = "
		SELECT
			Priority.PriorityAriaSer,
			Priority.PrioritySerNum,
			Priority.PriorityDateTime,
			Priority.PriorityCode,
			Priority.PatientSerNum
		FROM
			Priority
		WHERE
			Priority.PriorityAriaSer 	    = $prioritySourceUID
        AND Priority.SourceDatabaseSerNum   = $sourceDBSer
	";
	
	# prepare query
	my $query = $SQLDatabase->prepare($inDB_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;

	while (my @data = $query->fetchrow_array()) {
		
		$PrioritySourceUIDInDB 	    = $data[0];
		$ser			            = $data[1];
		$datestamp		            = $data[2];
		$code			            = $data[3];
		$patientser		            = $data[4];
	}

	if ($PrioritySourceUIDInDB) {
		
		$ExistingPriority = new Priority(); # initialize priority object

		$ExistingPriority->setPrioritySourceUID($PrioritySourceUIDInDB);
        $ExistingPriority->setPrioritySourceDatabaseSer($sourceDBSer);
		$ExistingPriority->setPrioritySer($ser);
		$ExistingPriority->setPriorityDateStamp($datestamp);
		$ExistingPriority->setPriorityCode($code);
		$ExistingPriority->setPriorityPatientSer($patientser);

		return $ExistingPriority; # this is true (ie. priority exists, return object)
	}

	else {return $ExistingPriority;} # this is false (ie. priority DNE, return 0)
}

#======================================================================================
# Subroutine to insert our priority info in our database
#======================================================================================
sub insertPriorityIntoOurDB
{
	my ($priority) = @_; # our priority object and patient serial

	my $patientser		= $priority->getPriorityPatientSer();
	my $sourceuid 		= $priority->getPrioritySourceUID();
    my $sourcedbser     = $priority->getPrioritySourceDatabaseSer();
	my $datestamp		= $priority->getPriorityDateStamp();
	my $code		= $priority->getPriorityCode();
	
	# Insert priority
	my $insert_sql = "
		INSERT INTO 
			Priority (
				PatientSerNum,
                SourceDatabaseSerNum,
				PriorityAriaSer,
				PriorityDateTime,
				PriorityCode,
                DateAdded
			)
		VALUES (
			'$patientser',
            '$sourcedbser',
			'$sourceuid',
			'$datestamp',
			'$code',
            NOW()
		)
	";

	# prepare query
	my $query = $SQLDatabase->prepare($insert_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;

	# Retrieve the PrioritySer
	my $ser = $SQLDatabase->last_insert_id(undef, undef, undef, undef);

	# Set the Serial in our priority object
	$priority->setPrioritySer($ser);

	return $priority;
	
}
#======================================================================================
# Subroutine to update our database with the priority's updated info
#======================================================================================
sub updateDatabase
{
	my ($priority) = @_; # our priority object to update

	my $patientser		= $priority->getPriorityPatientSer();
	my $sourceuid		= $priority->getPrioritySourceUID();
    my $sourcedbser     = $priority->getPrioritySourceDatabaseSer();
	my $datestamp		= $priority->getPriorityDateStamp();
	my $code		    = $priority->getPriorityCode();

	my $update_sql = "
		
		UPDATE
			Priority
		SET
			PatientSerNum		= '$patientser',
			PriorityDateTime	= '$datestamp',
			PriorityCode		= '$code'
		WHERE
			PriorityAriaSer	        = '$sourceuid'
        AND SourceDatabaseSerNum    = '$sourcedbser'
		";

	# prepare query
	my $query = $SQLDatabase->prepare($update_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;

}


#======================================================================================
# Subroutine to compare two priority objects. If different, use setter funtions
# to update priority object.
#======================================================================================
sub compareWith
{
	my ($SuspectPriority, $OriginalPriority) = @_; # our two priority objects from arguments
	my $UpdatedPriority = dclone($OriginalPriority); 

	# retrieve parameters
	# Suspect Priority...
	my $Spatientser		= $SuspectPriority->getPriorityPatientSer();
	my $Sdatestamp		= $SuspectPriority->getPriorityDateStamp();
	my $Scode		= $SuspectPriority->getPriorityCode();

	# Original Priority...
	my $Opatientser		= $OriginalPriority->getPriorityPatientSer();
	my $Odatestamp		= $OriginalPriority->getPriorityDateStamp();
	my $Ocode		= $OriginalPriority->getPriorityCode();
	

	# go through each parameter
	
	if ($Spatientser ne $Opatientser) {

		print "Priority Patient serial has changed from '$Opatientser' to '$Spatientser'\n";
		my $updatedPatientSer = $UpdatedPriority->setPriorityPatientSer($Spatientser); # update priority alias ser 
		print "Will update database entry to '$updatedPatientSer'.\n";
	}
	if ($Sdatestamp ne $Odatestamp) {

		print "Priority DateStamp has changed from '$Odatestamp' to '$Sdatestamp'\n";
		my $updatedDateStamp = $UpdatedPriority->setPriorityDateStamp($Sdatestamp); # update priority datestamp
		print "Will update database entry to '$updatedDateStamp'.\n";
	}
	if ($Scode ne $Ocode) {

		print "Priority Code has changed from '$Ocode' to '$Scode'\n";
		my $updatedCode = $UpdatedPriority->setPriorityCode($Scode); # update priority code 
		print "Will update database entry to '$updatedCode'.\n";
	}

	return $UpdatedPriority;
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
