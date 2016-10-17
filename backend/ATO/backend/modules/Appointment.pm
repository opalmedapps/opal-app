#!/usr/bin/perl
#---------------------------------------------------------------------------------
# A.Joseph 10-Aug-2015 ++ File: Appointment.pm
#---------------------------------------------------------------------------------
# Perl module that creates an appointment class. This module calls a constructor to 
# create an appointment object that contains appt information stored as object 
# variables.
#
# There exists various subroutines to set appt information, get appt information
# and compare appt information between two appt objects. 
# There exists various subroutines that use the Database.pm module to update the
# MySQL database and check if an appt exists already in this database.

package Appointment; # Declare package name


use Exporter; # To export subroutines and variables
use Database; # Use our custom database module Database.pm
use Time::Piece; # To parse and convert date time
use Storable qw(dclone); # for deep copies
use POSIX;

use Patient; # Our patient module
use Alias; # Our alias module
use Resource; # Resource.pm
use Priority; # Priority.pm
use Diagnosis; # Diagnosis.pm

#---------------------------------------------------------------------------------
# Connect to the databases
#---------------------------------------------------------------------------------
my $sourceDatabase	= $Database::sourceDatabase;
my $SQLDatabase		= $Database::targetDatabase;

#====================================================================================
# Constructor for our Appointment class 
#====================================================================================
sub new
{
	my $class = shift;
	my $appointment = {
		_ser			=> undef,
		_ariaser		=> undef,
		_patientser		=> undef,
		_aliasexpressionser	=> undef,
		_startdatetime		=> undef,
		_enddatetime		=> undef,
        _diagnosisser       => undef,
        _priorityser        => undef,
	};

	# bless associates an object with a class so Perl knows which package to search for
	# when a method is envoked on this object
	bless $appointment, $class; 
	return $appointment;
}

#====================================================================================
# Subroutine to set the Appointment Serial
#====================================================================================
sub setApptSer
{
	my ($appointment, $ser) = @_; # appt object with provided serial in arguments
	$appointment->{_ser} = $ser; # set the appt ser
	return $appointment->{_ser};
}

#====================================================================================
# Subroutine to set the Appointment Aria serial
#====================================================================================
sub setApptAriaSer
{
	my ($appointment, $ariaser) = @_; # appt object with provided serial in arguments
	$appointment->{_ariaser} = $ariaser; # set the appt serial
	return $appointment->{_ariaser};
}

#====================================================================================
# Subroutine to set the Appointment Patient serial
#====================================================================================
sub setApptPatientSer
{
	my ($appointment, $patientser) = @_; # appt object with provided serial in arguments
	$appointment->{_patientser} = $patientser; # set the appt serial
	return $appointment->{_patientser};
}



#====================================================================================
# Subroutine to set the Appointment Alias Expression Ser
#====================================================================================
sub setApptAliasExpressionSer
{
	my ($appointment, $aliasexpressionser) = @_; # appt object with provided serial in arguments
	$appointment->{_aliasexpressionser} = $aliasexpressionser;
	return $appointment->{_aliasexpressionser};
}

#====================================================================================
# Subroutine to set the Appointment Actual Start DateTime
#====================================================================================
sub setApptStartDateTime
{
	my ($appointment, $startdatetime) = @_; # appt object with provided datetime in arguments
	$appointment->{_startdatetime} = $startdatetime; # set the appt datetime
	return $appointment->{_startdatetime};
}

#====================================================================================
# Subroutine to set the Appointment Actual End DateTime
#====================================================================================
sub setApptEndDateTime
{
	my ($appointment, $enddatetime) = @_; # appt object with provided datetime in arguments
	$appointment->{_enddatetime} = $enddatetime; # set the appt datetime
	return $appointment->{_enddatetime};
}

#====================================================================================
# Subroutine to set the Appointment Priority serial
#====================================================================================
sub setApptPrioritySer
{
	my ($appointment, $priorityser) = @_; # appt object with provided serial in arguments
	$appointment->{_priorityser} = $priorityser; # set the appt serial
	return $appointment->{_priorityser};
}

#====================================================================================
# Subroutine to set the Appointment Diagnosis serial
#====================================================================================
sub setApptDiagnosisSer
{
	my ($appointment, $diagnosisser) = @_; # appt object with provided serial in arguments
	$appointment->{_diagnosisser} = $diagnosisser; # set the appt serial
	return $appointment->{_diagnosisser};
}

#====================================================================================
# Subroutine to get the Appointment Serial
#====================================================================================
sub getApptSer
{
	my ($appointment) = @_; # our appt object
	return $appointment->{_ser};
}

#====================================================================================
# Subroutine to get the Appointment aria serial
#====================================================================================
sub getApptAriaSer
{
	my ($appointment) = @_; # our appt object
	return $appointment->{_ariaser};
}

#====================================================================================
# Subroutine to get the Appointment patient serial
#====================================================================================
sub getApptPatientSer
{
	my ($appointment) = @_; # our appt object
	return $appointment->{_patientser};
}

#====================================================================================
# Subroutine to get the Appointment Alias Expression Ser
#====================================================================================
sub getApptAliasExpressionSer
{
	my ($appointment) = @_; # our appt object
	return $appointment->{_aliasexpressionser};
}

#====================================================================================
# Subroutine to get the Appointment Start DateTime
#====================================================================================
sub getApptStartDateTime
{
	my ($appointment) = @_; # our appt object
	return $appointment->{_startdatetime};
}

#====================================================================================
# Subroutine to get the Appointment End DateTime
#====================================================================================
sub getApptEndDateTime
{
	my ($appointment) = @_; # our appt object
	return $appointment->{_enddatetime};
}

#====================================================================================
# Subroutine to get the Appointment priority serial
#====================================================================================
sub getApptPrioritySer
{
	my ($appointment) = @_; # our appt object
	return $appointment->{_priorityser};
}

#====================================================================================
# Subroutine to get the Appointment diagnosis serial
#====================================================================================
sub getApptDiagnosisSer
{
	my ($appointment) = @_; # our appt object
	return $appointment->{_diagnosisser};
}

#======================================================================================
# Subroutine to get our appointment info from the ARIA db for automatic cron
#======================================================================================
sub getApptsFromSourceDB
{
	my (@patientList) = @_; # patient list from args

	my @apptList = (); # initialize a list for appointment objects

	# when we retrieve query results
	my ($ariaser, $expressionname, $startdatetime, $enddatetime, $resourceser, $priorityser, $diagnosisser);
    my $lastupdated; 

    # retrieve all aliases that are marked for update
    my @aliasList = Alias::getAliasesMarkedForUpdate('Appointment');
  
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


    		my $apptInfo_sql = "
	    		SELECT DISTINCT
		    		ScheduledActivity.ScheduledActivitySer,
			    	vv_ActivityLng.Expression1,
				    ScheduledActivity.ScheduledStartTime,
    				ScheduledActivity.ScheduledEndTime
		    	FROM 
			    	Patient, 
				    ScheduledActivity, 
    				ActivityInstance, 
	    			Activity, 
		    		vv_ActivityLng, 
			    	Resource,
				    Attendee 
    			WHERE 
	    			ScheduledActivity.ActivityInstanceSer 		= ActivityInstance.ActivityInstanceSer 
		    	AND 	ActivityInstance.ActivitySer 			= Activity.ActivitySer 
			    AND 	Activity.ActivityCode 				    = vv_ActivityLng.LookupValue 
    			AND 	Patient.PatientSer 				        = ScheduledActivity.PatientSer 
	    		AND 	Patient.PatientSer				        = '$ariaSer'
		    	AND 	Attendee.ActivityInstanceSer 	        = ScheduledActivity.ActivityInstanceSer
    	    	AND 	Attendee.ResourceSer 		            = Resource.ResourceSer
 	    		AND 	ScheduledActivity.ObjectStatus 			!= 'Deleted' 
		    	AND 	ScheduledActivity.HstryDateTime	 		> '$lastupdated' 
                AND     vv_ActivityLng.Expression1              IN ($expressionText)
	
    		";
	    	#print "$apptInfo_sql\n";
		    # prepare query
    		my $query = $sourceDatabase->prepare($apptInfo_sql)
	    		or die "Could not prepare query: " . $sourceDatabase->errstr;

		    # execute query
    		$query->execute()
	    		or die "Could not execute query: " . $query->errstr;

            my $data = $query->fetchall_arrayref();
    		foreach my $row (@$data) {

    			my $appointment = new Appointment(); # new appointment object 
		
			    $ariaser	    = $row->[0];
			    $expressionname	= $row->[1];
			    $startdatetime	= convertDateTime($row->[2]); 
			    $enddatetime	= convertDateTime($row->[3]);

                $priorityser    = Priority::getClosestPriority($patientSer, $startdatetime);
                $diagnosisser   = Diagnosis::getClosestDiagnosis($patientSer, $startdatetime);
		
		    	# Search through alias expression list to find associated
    			# expression serial number (in our DB)
	    		my $expressionser;
		    	foreach my $checkExpression (@expressions) {
    
	    			if ($checkExpression->{_name} eq $expressionname) { # match
    
		    			$expressionser = $checkExpression->{_ser};
			    		last; # break out of loop
				    }
    			}

	    		$appointment->setApptPatientSer($patientSer);
		    	$appointment->setApptAriaSer($ariaser); 
		    	$appointment->setApptAliasExpressionSer($expressionser);
		    	$appointment->setApptStartDateTime($startdatetime); 
		    	$appointment->setApptEndDateTime($enddatetime); 
                $appointment->setApptPrioritySer($priorityser);
                $appointment->setApptDiagnosisSer($diagnosisser);

	    		push(@apptList, $appointment);
    		}

        }
	}

	return @apptList;
}

#======================================================================================
# Subroutine to get patient appointment(s) from our db given a patient serial and date
#======================================================================================
sub getPatientsAppointmentsFromDateInOurDB
{
    my ($patientSer, $dateOfInterest, $dayInterval) = @_; # args

    my @appointments = (); 

    my $select_sql = "
        SELECT DISTINCT
            ap.AppointmentSerNum,
            ap.AliasExpressionSerNum,
            ap.AppointmentAriaSer,
            ap.ScheduledStartTime,
            ap.ScheduledEndTime,
            ap.DiagnosisSerNum
        FROM 
            Appointment ap
        WHERE
            ap.PatientSerNum            = '$patientSer'
        AND ap.ScheduledStartTime       <= '$dateOfInterest 11:59:59'
        AND ap.ScheduledStartTime       >= DATE_SUB('$dateOfInterest', INTERVAL $dayInterval DAY) 
    ";

    # prepare query
	my $query = $SQLDatabase->prepare($select_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;
	
	while (my @data = $query->fetchrow_array()) {

        my $ser             = $data[0];
        my $expressionser   = $data[1];
        my $ariaser         = $data[2];
        my $scheduledST     = $data[3];
        my $scheduledET     = $data[4];
        my $diagnosisser    = $data[5];

        $appointment = new Appointment();

        $appointment->setApptSer($ser);
        $appointment->setApptAliasExpressionSer($expressionser);
        $appointment->setApptAriaSer($ariaser);
        $appointment->setApptPatientSer($patientSer);
        $appointment->setApptStartDateTime($scheduledST);
        $appointment->setApptEndDateTime($scheduledET);
        $appointment->setApptDiagnosisSer($diagnosisser);

        push(@appointments, $appointment);

    }

    return @appointments;

}

#======================================================================================
# Subroutine to get all patient's appointment(s) up until tomorrow
#======================================================================================
sub getAllPatientsAppointmentsFromOurDB
{
    my ($patientSer) = @_; # args 

    my @appointments = (); # initialize a list 

    my $select_sql = "
        SELECT DISTINCT
            ap.AppointmentSerNum,
            ap.AliasExpressionSerNum,
            ap.AppointmentAriaSer,
            ap.ScheduledStartTime,
            ap.ScheduledEndTime,
            ap.DiagnosisSerNum
        FROM
            Appointment ap
        WHERE
            ap.PatientSerNum            = '$patientSer'
        AND ap.ScheduledStartTime       <= DATE_ADD(NOW(), INTERVAL 1 DAY)
    ";
    # prepare query
	my $query = $SQLDatabase->prepare($select_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;
	
	while (my @data = $query->fetchrow_array()) {

        my $ser             = $data[0];
        my $expressionser   = $data[1];
        my $ariaser         = $data[2];
        my $scheduledST     = $data[3];
        my $scheduledET     = $data[4];
        my $diagnosisser    = $data[5];

        $appointment = new Appointment();

        $appointment->setApptSer($ser);
        $appointment->setApptAliasExpressionSer($expressionser);
        $appointment->setApptAriaSer($ariaser);
        $appointment->setApptPatientSer($patientSer);
        $appointment->setApptStartDateTime($scheduledST);
        $appointment->setApptEndDateTime($scheduledET);
        $appointment->setApptDiagnosisSer($diagnosisser);

        push(@appointments, $appointment);

    }

    return @appointments;

}

#======================================================================================
# Subroutine to get appointment info from the ARIA db given a serial
#======================================================================================
sub getApptInfoFromSourceDB 
{

	my ($appointment) = @_; # Appt object
	my $apptAriaSer = $appointment->getApptAriaSer();
	my $aliasSer	= $appointment->getApptAliasSer();

	# get the list of expressions for this alias (they will be of appointment type)
	my $alias = new Alias(); # initialize object
	$alias->setAliasSer($aliasSer);
	my @expressions = Alias::getAliasExpressionsFromOurDB($alias);

	# when we retrieve query results
	my ($expressionname, $startdatetime, $enddatetime);
	my ($priorityser, $diagnosisser);

	my $apptInfo_sql = "
		SELECT DISTINCT
			vv_ActivityLng.Expression1,
			ScheduledActivity.ScheduledStartTime,
			ScheduledActivity.ScheduledEndTime
		FROM 
			Patient , 
			ScheduledActivity, 
			ActivityInstance, 
			Activity, 
			vv_ActivityLng, 
			Resource,
			Attendee 
		WHERE 
		 	( ScheduledActivity.ActivityInstanceSer 	= ActivityInstance.ActivityInstanceSer) 
		AND ( ActivityInstance.ActivitySer 			= Activity.ActivitySer) 
		AND ( Activity.ActivityCode 				= vv_ActivityLng.LookupValue) 
		AND ( Patient.PatientSer 				= ScheduledActivity.PatientSer) 
		AND ( Attendee.ActivityInstanceSer 			= ScheduledActivity.ActivityInstanceSer)
		AND ( Attendee.ResourceSer 				= Resource.ResourceSer)
 		AND ( ScheduledActivity.ObjectStatus 			!= 'Deleted' )
		AND ( ScheduledActivity.ScheduledActivitySer 		= '$apptAriaSer' ) 
	
	";
	#print "$apptInfo_sql\n";
	# prepare query
	my $query = $sourceDatabase->prepare($apptInfo_sql)
		or die "Could not prepare query: " . $sourceDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;

	while (my @data = $query->fetchrow_array()) {

		$expressionname	= $data[0];
		$startdatetime	= convertDateTime($data[1]); 
		$enddatetime	= convertDateTime($data[2]);

		$priorityser	= Priority::getClosestPriority($patientSer, $startdatetime);
		$diagnosisser	= Diagnosis::getClosestDiagnosis($patientSer, $startdatetime);
				
		# Search through alias expression list to find associated
		# expression serial number (in our DB)
		my $expressionSer;
		foreach my $checkExpression (@expressions) {

			if ($checkExpression->{_name} eq $expressionname) { # match
				$expressionSer = $checkExpression->{_ser};
				last; # break out of loop
			}
		}

		$appointment->setApptPatientSer($patientSer);
		$appointment->setApptAliasExpressionSer($expressionSer);
		$appointment->setApptStartDateTime($startdatetime); 
		$appointment->setApptEndDateTime($enddatetime); 
		$appointment->setApptPrioritySer($priorityser);
		$appointment->setApptDiagnosisSer($diagnosisser);
	}


	return $appointment;
}

#======================================================================================
# Subroutine to check if our appointment exists in our MySQL db
#	@return: appt object (if exists) .. NULL otherwise
#======================================================================================
sub inOurDatabase
{
	my ($appointment) = @_; # our appt object	
	my $ariaser = $appointment->getApptAriaSer(); # retrieve appt aria serial

	my $ApptAriaSerInDB = 0; # false by default. Will be true if appointment exists
	my $ExistingAppt = (); # data to be entered if appt exists

	# Other appt variables, if appt exists
	my ($ser, $patientser, $aliasexpressionser, $startdatetime, $enddatetime);
    my ($priorityser, $diagnosisser);

	my $inDB_sql = "
		SELECT
			Appointment.AppointmentAriaSer,
			Appointment.AliasExpressionSerNum,
			Appointment.ScheduledStartTime,
			Appointment.ScheduledEndTime,
			Appointment.AppointmentSerNum,
			Appointment.PatientSerNum,
            Appointment.PrioritySerNum,
            Appointment.DiagnosisSerNum
		FROM
			Appointment
		WHERE
			Appointment.AppointmentAriaSer = $ariaser
	";

	# prepare query
	my $query = $SQLDatabase->prepare($inDB_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;
	
	while (my @data = $query->fetchrow_array()) {

		$ApptAriaSerInDB	= $data[0];
		$aliasexpressionser	= $data[1];
		$startdatetime		= $data[2];
		$enddatetime		= $data[3];
		$ser			    = $data[4];
		$patientser		    = $data[5];
        $priorityser        = $data[6];
        $resourceser        = $data[7];
	}

	if ($ApptAriaSerInDB) {

		$ExistingAppt = new Appointment(); # initialize appointment object

		$ExistingAppt->setApptAriaSer($ApptAriaSerInDB); # set the Appt aria serial
		$ExistingAppt->setApptAliasExpressionSer($aliasexpressionser); # set expression serial
		$ExistingAppt->setApptStartDateTime($startdatetime); # set the appt start datetime
		$ExistingAppt->setApptEndDateTime($enddatetime); # set the appt end datetime
		$ExistingAppt->setApptSer($ser); # set the serial
		$ExistingAppt->setApptPatientSer($patientser); 
        $ExistingAppt->setApptPrioritySer($priorityser);
        $ExistingAppt->setApptDiagnosisSer($diagnosisser);
		
		return $ExistingAppt; # this is true (ie. appt exists, return object)
	}
	
	else {return $ExistingAppt;} # this is false (ie. appt DNE, return empty)
}

#======================================================================================
# Subroutine to insert our appointment info in our database
#======================================================================================
sub insertApptIntoOurDB
{
	my ($appointment) = @_; # our appointment object 
	
	my $patientser		    = $appointment->getApptPatientSer();
	my $ariaser		        = $appointment->getApptAriaSer();
	my $aliasexpressionser	= $appointment->getApptAliasExpressionSer();
	my $startdatetime	    = $appointment->getApptStartDateTime();
	my $enddatetime		    = $appointment->getApptEndDateTime();
    my $priorityser         = $appointment->getApptPrioritySer();
    my $diagnosisser        = $appointment->getApptDiagnosisSer();

	my $insert_sql = "
		INSERT INTO 
			Appointment (
				AppointmentSerNum,
				PatientSerNum,
				AppointmentAriaSer,
				AliasExpressionSerNum,
				ScheduledStartTime,		
				ScheduledEndTime,
                PrioritySerNum,
                DiagnosisSerNum,
                DateAdded,
				LastUpdated
			)
		VALUES (
			NULL,
			'$patientser',
			'$ariaser',
			'$aliasexpressionser',
			'$startdatetime',
			'$enddatetime',
            '$priorityser',
            '$diagnosisser',
            NOW(),
			NULL
		)
	";

	# prepare query
	my $query = $SQLDatabase->prepare($insert_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;

	# Retrieve the ApptSer
	my $ser = $SQLDatabase->last_insert_id(undef, undef, undef, undef);

	# Set the Serial in our appointment object
	$appointment->setApptSer($ser);
	
	return $appointment;
}

#======================================================================================
# Subroutine to update our database with the appointment's updated info
#======================================================================================
sub updateDatabase
{
	my ($appointment) = @_; # our appt object to update

	my $ariaser		= $appointment->getApptAriaSer();
	my $aliasexpressionser	= $appointment->getApptAliasExpressionSer();
	my $startdatetime	= $appointment->getApptStartDateTime();
	my $enddatetime		= $appointment->getApptEndDateTime();
    my $priorityser         = $appointment->getApptPrioritySer();
    my $diagnosisser        = $appointment->getApptDiagnosisSer();

	my $update_sql = "

		UPDATE
			Appointment
		SET
			AliasExpressionSerNum	= '$aliasexpressionser',
			ScheduledStartTime	    = '$startdatetime',
			ScheduledEndTime	    = '$enddatetime',
            PrioritySerNum          = '$priorityser',
            DiagnosisSerNum         = '$diagnosisser'
		WHERE
			AppointmentAriaSer	= '$ariaser' 
		";

	# prepare query
	my $query = $SQLDatabase->prepare($update_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;
	
}

#======================================================================================
# Subroutine to compare two appt objects. If different, use setter functions
# to update appt object.
#======================================================================================
sub compareWith
{
	my ($SuspectAppt, $OriginalAppt) = @_; # our two appt objects from arguments
	my $UpdatedAppt = dclone($OriginalAppt); 

	# retrieve parameters
	# Suspect Appointment...
	my $SAliasExpressionSer	= $SuspectAppt->getApptAliasExpressionSer();
	my $SStartDateTime	    = $SuspectAppt->getApptStartDateTime();
	my $SEndDateTime	    = $SuspectAppt->getApptEndDateTime();
    my $SPrioritySer        = $SuspectAppt->getApptPrioritySer();
    my $SDiagnosisSer       = $SuspectAppt->getApptDiagnosisSer();

	# Original Appointment...
	my $OAliasExpressionSer	= $OriginalAppt->getApptAliasExpressionSer();
	my $OStartDateTime	    = $OriginalAppt->getApptStartDateTime();
	my $OEndDateTime	    = $OriginalAppt->getApptEndDateTime();
    my $OPrioritySer        = $OriginalAppt->getApptPrioritySer();
    my $ODiagnosisSer       = $OriginalAppt->getApptDiagnosisSer();

	# go through each parameter
	
	if ($SAliasExpressionSer ne $OAliasExpressionSer) {
		print "Appointment Alias Expression Serial has changed from '$OAliasExpressionSer' to '$SAliasExpressionSer'\n";
		my $updatedAESer = $UpdatedAppt->setApptAliasExpressionSer($SAliasExpressionSer); # update serial
		print "Will update database entry to '$updatedAESer'.\n";
	}
	if ($SStartDateTime ne $OStartDateTime) {
		print "Appointment Scheduled Start DateTime has change from '$OStartDateTime' to '$SStartDateTime'\n";
		my $updatedSDT = $UpdatedAppt->setApptStartDateTime($SStartDateTime); # update start datetime
		print "Will update database entry to '$updatedSDT'.\n";
	}
	if ($SEndDateTime ne $OEndDateTime) {
		print "Appointment Scheduled End DateTime has changed from '$OEndDateTime' to '$SEndDateTime'\n";
		my $updatedEDT = $UpdatedAppt->setApptEndDateTime($SEndDateTime); # update end datetime
		print "Will update database entry to '$updatedEDT'.\n";
	}
    if ($SPrioritySer ne $OPrioritySer) {
		print "Appointment Priority has changed from '$OPrioritySer' to '$SPrioritySer'\n";
		my $updatedPrioritySer = $UpdatedAppt->setApptPrioritySer($SPrioritySer); # update 
		print "Will update database entry to '$updatedPrioritySer'.\n";
	}
	if ($SDiagnosisSer ne $ODiagnosisSer) {
		print "Appointment Diagnosis has changed from '$ODiagnosisSer' to '$SDiagnosisSer'\n";
		my $updatedDiagnosisSer = $UpdatedAppt->setApptDiagnosisSer($SDiagnosisSer); # update 
		print "Will update database entry to '$updatedDiagnosisSer'.\n";
	}


	return $UpdatedAppt;
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

#======================================================================================
# Subroutine to reassign our appointment ser in ARIA to an appointment serial in MySQL. 
# In the process, insert appointment into our database if it DNE
#======================================================================================
sub reassignAppointment
{
	my ($apptSer) = @_; # appt ser from arguments
	
	my $Appointment = new Appointment(); # initialize appt object

	$Appointment->setApptAriaSer($apptSer); # assign our serial

	# check if our appointment exists in our database
	my $ApptExists = $Appointment->inOurDatabase();

	if ($ApptExists) {

		my $ExistingAppt = dclone($ApptExists); # reassign variable

		my $apptSerNum = $ExistingAppt->getApptSer(); # get serial

		return $apptSerNum;
	}
	else {# appointment DNE

		# get appt info from source database (ARIA)
		$Appointment = $Appointment->getApptInfoFromSourceDB();

		# insert appointment into our database
		$Appointment = $Appointment->insertApptIntoOurDB();

		# get serial
		my $apptSerNum = $Appointment->getApptSer();

		return $apptSerNum;
	}
}
# To exit/return always true (for the module itself)
1;	




