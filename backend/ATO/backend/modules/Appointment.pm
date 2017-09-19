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
# Connect to the database
#---------------------------------------------------------------------------------
my $SQLDatabase		= $Database::targetDatabase;

#====================================================================================
# Constructor for our Appointment class 
#====================================================================================
sub new
{
	my $class = shift;
	my $appointment = {
		_ser			    => undef,
        _sourcedbser        => undef,
		_sourceuid	        => undef,
		_patientser		    => undef,
        _aliasser           => undef,
		_aliasexpressionser	=> undef,
		_startdatetime		=> undef,
		_enddatetime		=> undef,
        _diagnosisser       => undef,
        _priorityser        => undef,
        _status             => undef,
        _state              => undef,
        _actualstartdate    => undef,
        _actualenddate      => undef,
	};

	# bless associates an object with a class so Perl knows which package to search for
	# when a method is envoked on this object
	bless $appointment, $class; 
	return $appointment;
}

# HETR HJDEWS HJDE
#====================================================================================
# Subroutine to set the Appointment Serial
#====================================================================================
sub setApptSer
{
	my ($appointment, $ser) = @_; # appt object with provided serial in arguments
	$appointment->{_ser} = $ser; # set the appt ser
	return $appointment->{_ser};
}


#======================================================================================
# Subroutine to set the Appointment Source DB Serial
#====================================================================================
sub setApptSourceDatabaseSer
{
	my ($appointment, $sourcedbser) = @_; # appt object with provided serial in arguments
	$appointment->{_sourcedbser} = $sourcedbser; # set the appt ser
	return $appointment->{_sourcedbser};
}
#
#==================================================================================
# Subroutine to set the Appointment Source UID
#====================================================================================
sub setApptSourceUID
{
	my ($appointment, $sourceuid) = @_; # appt object with provided serial in arguments
	$appointment->{_sourceuid} = $sourceuid; # set the appt serial
	return $appointment->{_sourceuid};
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
# Subroutine to set the Appointment Alias Ser
#====================================================================================
sub setApptAliasSer
{
	my ($appointment, $aliasser) = @_; # appt object with provided serial in arguments
	$appointment->{_aliasser} = $aliasser;
	return $appointment->{_aliasser};
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
# Subroutine to set the Appointment Status
#====================================================================================
sub setApptStatus
{
	my ($appointment, $status) = @_; # appt object with provided status in arguments
	$appointment->{_status} = $status; # set the appt status
	return $appointment->{_status};
}

#====================================================================================
# Subroutine to set the Appointment State
#====================================================================================
sub setApptState
{
	my ($appointment, $state) = @_; # appt object with provided state in arguments
	$appointment->{_state} = $state; # set the appt state
	return $appointment->{_state};
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
# Subroutine to set the Appointment Actual Start DateTime
#====================================================================================
sub setApptActualStartDate
{
	my ($appointment, $actualstartdate) = @_; # appt object with provided datetime in arguments
	$appointment->{_actualstartdate} = $actualstartdate; # set the appt datetime
	return $appointment->{_actualstartdate};
}

#====================================================================================
# Subroutine to set the Appointment Actual End DateTime
#====================================================================================
sub setApptActualEndDate
{
	my ($appointment, $actualenddate) = @_; # appt object with provided datetime in arguments
	$appointment->{_actualenddate} = $actualenddate; # set the appt datetime
	return $appointment->{_actualenddate};
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
# Subroutine to get the Appointment Source DB Serial
#====================================================================================
sub getApptSourceDatabaseSer
{
	my ($appointment) = @_; # our appt object
	return $appointment->{_sourcedbser};
}

#====================================================================================
# Subroutine to get the Appointment Source UID
#====================================================================================
sub getApptSourceUID
{
	my ($appointment) = @_; # our appt object
	return $appointment->{_sourceuid};
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
# Subroutine to get the Appointment Alias Ser
#====================================================================================
sub getApptAliasSer
{
	my ($appointment) = @_; # our appt object
	return $appointment->{_aliasser};
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
# Subroutine to get the Appointment Status
#====================================================================================
sub getApptStatus
{
	my ($appointment) = @_; # our appt object
	return $appointment->{_status};
}

#====================================================================================
# Subroutine to get the Appointment State
#====================================================================================
sub getApptState
{
	my ($appointment) = @_; # our appt object
	return $appointment->{_state};
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
# Subroutine to get the Appointment Actual Start Date
#====================================================================================
sub getApptActualStartDate
{
	my ($appointment) = @_; # our appt object
	return $appointment->{_actualstartdate};
}

#====================================================================================
# Subroutine to get the Appointment Actual End Date
#====================================================================================
sub getApptActualEndDate
{
	my ($appointment) = @_; # our appt object
	return $appointment->{_actualenddate};
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
	my ($sourceuid, $expressionname, $startdatetime, $enddatetime, $resourceser, $priorityser, $diagnosisser);
    my ($status, $state, $actualstartdate, $actualenddate);
    my $lasttransfer; 

    # retrieve all aliases that are marked for update
    my @aliasList = Alias::getAliasesMarkedForUpdate('Appointment');
  
    foreach my $Patient (@patientList) {

		my $patientSer		    = $Patient->getPatientSer(); # get patient serial
		my $patientSSN          = $Patient->getPatientSSN(); # get ssn
		my $patientLastTransfer	= $Patient->getPatientLastTransfer(); # get last updated

        foreach my $Alias (@aliasList) {

            my $aliasSer            = $Alias->getAliasSer(); 
            my @expressions         = $Alias->getAliasExpressions(); 
            my $aliasLastTransfer   = $Alias->getAliasLastTransfer();
            my $sourceDBSer         = $Alias->getAliasSourceDatabaseSer();
	        # convert expression list into a string enclosed in quotes
		    my $expressionText = join ',', map { qq/'$_->{_name}'/ } @expressions;

            # compare last updates to find the earliest date 
            my $formatted_PLU = Time::Piece->strptime($patientLastTransfer, "%Y-%m-%d %H:%M:%S");
            my $formatted_ALU = Time::Piece->strptime($aliasLastTransfer, "%Y-%m-%d %H:%M:%S");
            # get the diff in seconds
            my $date_diff = $formatted_PLU - $formatted_ALU;
            if ($date_diff < 0) {
                $lasttransfer = $patientLastTransfer;
            } else {
                $lasttransfer = $aliasLastTransfer;
            }

            # ARIA
            if ($sourceDBSer eq 1) {

                my $sourceDatabase	= Database::connectToSourceDatabase($sourceDBSer);
        		my $apptInfo_sql = "
	        		SELECT DISTINCT
		        		sa.ScheduledActivitySer,
			        	vva.Expression1,
				        sa.ScheduledStartTime,
        				sa.ScheduledEndTime,
                        sa.ScheduledActivityCode,
                        sa.ObjectStatus,
                        sa.ActualStartDate,
                        sa.ActualEndDate
	    	    	FROM 
		    	    	variansystem.dbo.Patient pt, 
			    	    variansystem.dbo.ScheduledActivity sa, 
    			    	variansystem.dbo.ActivityInstance ai, 
	    			    variansystem.dbo.Activity act, 
    		    		variansystem.dbo.vv_ActivityLng vva, 
	    		    	variansystem.dbo.Resource re,
		    		    variansystem.dbo.Attendee att
    		    	WHERE 
	    		        sa.ActivityInstanceSer 		= ai.ActivityInstanceSer 
    		    	AND ai.ActivitySer 			    = act.ActivitySer 
	    		    AND act.ActivityCode 		    = vva.LookupValue 
    	    		AND pt.PatientSer 				= sa.PatientSer 
	    	    	AND pt.SSN				        LIKE '$patientSSN%'
    		    	AND att.ActivityInstanceSer 	= sa.ActivityInstanceSer
        	    	AND att.ResourceSer 		    = re.ResourceSer
		        	AND sa.HstryDateTime	 		> '$lasttransfer' 
                    AND vva.Expression1             IN ($expressionText)
	
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
		    
			        $sourceuid	    = $row->[0];
    			    $expressionname	= $row->[1];
	    		    $startdatetime	= convertDateTime($row->[2]); 
		    	    $enddatetime	= convertDateTime($row->[3]);
                    $status         = $row->[4];
                    $state          = $row->[5];
                    $actualstartdate    = convertDateTime($row->[6]);
                    $actualenddate      = convertDateTime($row->[7]);

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
	    	    	$appointment->setApptSourceUID($sourceuid);
                    $appointment->setApptSourceDatabaseSer($sourceDBSer);
		        	$appointment->setApptAliasExpressionSer($expressionser);
		    	    $appointment->setApptStartDateTime($startdatetime); 
    		    	$appointment->setApptEndDateTime($enddatetime); 
                    $appointment->setApptPrioritySer($priorityser);
                    $appointment->setApptDiagnosisSer($diagnosisser);
    		        $appointment->setApptStatus($status);
	    		    $appointment->setApptState($state);
		    	    $appointment->setApptActualStartDate($actualstartdate); 
			        $appointment->setApptActualEndDate($actualenddate);
    
	        		push(@apptList, $appointment);
    	    	}

                $sourceDatabase->disconnect();
            }

            # WaitRoomManagement
            if ($sourceDBSer eq 2) {

                my $sourceDatabase = Database::connectToSourceDatabase($sourceDBSer);
        		my $apptInfo_sql = "
                    SELECT DISTINCT
                        mval.AppointmentSerNum,
                        mval.AppointmentCode,
                        mval.ScheduledDateTime,
                        mval.Status
                    FROM
                        MediVisitAppointmentList mval,
                        Patient pt
                    WHERE
                        mval.PatientSerNum      = pt.PatientSerNum
                    AND pt.SSN                  LIKE '$patientSSN%'
                    AND mval.LastUpdated        > '$lasttransfer'
                    AND mval.AppointmentCode    IN ($expressionText)
                ";
                  		    
                print "$apptInfo_sql\n";
                my $query = $sourceDatabase->prepare($apptInfo_sql)
	    		    or die "Could not prepare query: " . $sourceDatabase->errstr;

    		    # execute query
        		$query->execute()
	        		or die "Could not execute query: " . $query->errstr;

                my $data = $query->fetchall_arrayref();
        		foreach my $row (@$data) {

                    my $appointment = new Appointment(); # new appointment object

                    $sourceuid      = $row->[0];
                    $expressionname = $row->[1];
                    $startdatetime  = $row->[2];
                    $enddatetime    = $row->[2];
                    $status         = $row->[3];

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
                    $appointment->setApptSourceUID($sourceuid);
                    $appointment->setApptSourceDatabaseSer($sourceDBSer);
                    $appointment->setApptAliasExpressionSer($expressionser);
                    $appointment->setApptStartDateTime($startdatetime);
                    $appointment->setApptEndDateTime($enddatetime);
                    $appointment->setApptStatus($status);
                    $appointment->setApptState('Active'); # Set default for WRM

                    push(@apptList, $appointment);
                }

                $sourceDatabase->disconnect();
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
            ap.DiagnosisSerNum,
            ap.SourceDatabaseSerNum
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
        my $sourceUID       = $data[2];
        my $scheduledST     = $data[3];
        my $scheduledET     = $data[4];
        my $diagnosisser    = $data[5];
        my $sourceDBSer     = $data[6];

        $appointment = new Appointment();

        $appointment->setApptSer($ser);
        $appointment->setApptAliasExpressionSer($expressionser);
        $appointment->setApptSourceUID($sourceUID);
        $appointment->setApptPatientSer($patientSer);
        $appointment->setApptStartDateTime($scheduledST);
        $appointment->setApptEndDateTime($scheduledET);
        $appointment->setApptDiagnosisSer($diagnosisser);
        $appointment->setApptSourceDatabaseSer($sourceDBSer);

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
            ap.DiagnosisSerNum,
            ap.SourceDatabaseSerNum
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
        my $sourceUID       = $data[2];
        my $scheduledST     = $data[3];
        my $scheduledET     = $data[4];
        my $diagnosisser    = $data[5];
        my $sourcedbser     = $data[6];

        $appointment = new Appointment();

        $appointment->setApptSer($ser);
        $appointment->setApptAliasExpressionSer($expressionser);
        $appointment->setApptSourceUID($sourceUID);
        $appointment->setApptPatientSer($patientSer);
        $appointment->setApptStartDateTime($scheduledST);
        $appointment->setApptEndDateTime($scheduledET);
        $appointment->setApptDiagnosisSer($diagnosisser);
        $appointment->setApptSourceDatabaseSer($sourcedbser);

        push(@appointments, $appointment);

    }

    return @appointments;

}

#======================================================================================
# Subroutine to get appointment info from the source db given a serial
#======================================================================================
sub getApptInfoFromSourceDB 
{

	my ($appointment) = @_; # Appt object
	my $apptSourceUID   = $appointment->getApptSourceUID();
	my $aliasSer	    = $appointment->getApptAliasSer();
    my $apptSourceDBSer = $appointment->getApptSourceDatabaseSer();
    my $patientSer      = $appointment->getApptPatientSer();

	# get the list of expressions for this alias (they will be of appointment type)
	my $alias = new Alias(); # initialize object
	$alias->setAliasSer($aliasSer);
	my @expressions = Alias::getAliasExpressionsFromOurDB($alias);

	# when we retrieve query results
	my ($expressionname, $startdatetime, $enddatetime);
	my ($priorityser, $diagnosisser);
    my ($status, $state, $actualstartdate, $actualenddate);

    # ARIA
    if ($apptSourceDBSer eq 1) {
                
        my $sourceDatabase	= Database::connectToSourceDatabase($sourceDBSer);
    	my $apptInfo_sql = "
	    	SELECT DISTINCT
		    	vva.Expression1,
			    sa.ScheduledStartTime,
    			sa.ScheduledEndTime,
                sa.ScheduledActivityCode,
                sa.ObjectStatus,
                sa.ActualStartDate,
                sa.ActualEndDate
	    	FROM 
		    	variansystem.dbo.Patient pt, 
			    variansystem.dbo.ScheduledActivity sa, 
    			variansystem.dbo.ActivityInstance ai, 
	    		variansystem.dbo.Activity act, 
		    	variansystem.dbo.vv_ActivityLng vva, 
			    variansystem.dbo.Resource re,
    			variansystem.dbo.Attendee att 
	    	WHERE 
		        sa.ActivityInstanceSer 	    = ai.ActivityInstanceSer 
    		AND au.ActivitySer 			    = act.ActivitySer 
	    	AND act.ActivityCode 			= vva.LookupValue 
		    AND pt.PatientSer 				= sa.PatientSer 
    		AND att.ActivityInstanceSer 	= sa.ActivityInstanceSer
	    	AND att.ResourceSer 			= re.ResourceSer
    		AND sa.ScheduledActivitySer     = '$apptSourceUID'  
	    
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
            $status         = $data[3];
            $state          = $data[4];
            $actualstartdate    = convertDateTime($data[5]);
            $actualenddate      = convertDateTime($data[6]);

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
    		$appointment->setApptState($state);
	    	$appointment->setApptStatus($status);
		    $appointment->setApptActualStartDate($actualstartdate); 
    		$appointment->setApptActualEndDate($actualenddate); 
    	}

        $sourceDatabase->disconnect();

    }

    # WaitRoomManagement
    if ($apptSourceDBSer eq 2) {

        my $sourceDatabase = Database::connectToSourceDatabase($sourceDBSer);
        my $apptInfo_sql = "
            SELECT DISTINCT
                mval.AppointmentCode,
                mval.ScheduledDateTime
            FROM
                MediVisitAppointmentList mval
            WHERE
                mval.AppointmentSerNum  = '$apptSourceUID'
        ";
                  		    
        my $query = $sourceDatabase->prepare($apptInfo_sql)
	    	or die "Could not prepare query: " . $sourceDatabase->errstr;

        # execute query
    	$query->execute()
	        or die "Could not execute query: " . $query->errstr;

        my $data = $query->fetchall_arrayref();
    	foreach my $row (@$data) {

            $expressionname = $row->[0];
            $startdatetime  = $row->[1];
            $enddatetime    = $row->[1];

            # Search through alias expression list to find associated
        	# expression serial number (in our DB)
	        my $expressionser;
	        foreach my $checkExpression (@expressions) {
    
    	    	if ($checkExpression->{_name} eq $expressionname) { # match
        
					$expressionser = $checkExpression->{_ser};
	        		last; # break out of loop
				}
        	}

            $appointment->setApptAliasExpressionSer($expressionser);
            $appointment->setApptStartDateTime($startdatetime);
            $appointment->setApptEndDateTime($enddatetime);
                
        }

        $sourceDatabase->disconnect();
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
	my $sourceUID   = $appointment->getApptSourceUID(); # retrieve appt source uid
    my $sourceDBSer = $appointment->getApptSourceDatabaseSer(); 

	my $ApptSourceUIDInDB = 0; # false by default. Will be true if appointment exists
	my $ExistingAppt = (); # data to be entered if appt exists

	# Other appt variables, if appt exists
	my ($ser, $patientser, $aliasexpressionser, $startdatetime, $enddatetime);
    my ($priorityser, $diagnosisser, $sourcedbser);
    my ($status, $state, $actualstartdate, $actualenddate);

	my $inDB_sql = "
		SELECT
			Appointment.AppointmentAriaSer,
			Appointment.AliasExpressionSerNum,
			Appointment.ScheduledStartTime,
			Appointment.ScheduledEndTime,
			Appointment.AppointmentSerNum,
			Appointment.PatientSerNum,
            Appointment.PrioritySerNum,
            Appointment.DiagnosisSerNum,
            Appointment.SourceDatabaseSerNum,
            Appointment.Status,
            Appointment.State,
            Appointment.ActualStartDate,
            Appointment.ActualEndDate
		FROM
			Appointment
		WHERE
			Appointment.AppointmentAriaSer      = $sourceUID
        AND Appointment.SourceDatabaseSerNum    = $sourceDBSer
	";

	# prepare query
	my $query = $SQLDatabase->prepare($inDB_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;
	
	while (my @data = $query->fetchrow_array()) {

		$ApptSourceUIDInDB	= $data[0];
		$aliasexpressionser	= $data[1];
		$startdatetime		= $data[2];
		$enddatetime		= $data[3];
		$ser			    = $data[4];
		$patientser		    = $data[5];
        $priorityser        = $data[6];
        $diagnosisser       = $data[7];
        $sourcedbser        = $data[8];
        $status             = $data[9];
        $state              = $data[10];
        $actualstartdate    = $data[11];
        $actualenddate      = $data[12];
	}

	if ($ApptSourceUIDInDB) {

		$ExistingAppt = new Appointment(); # initialize appointment object

		$ExistingAppt->setApptSourceUID($ApptSourceUIDInDB); # set the Appt aria serial
		$ExistingAppt->setApptAliasExpressionSer($aliasexpressionser); # set expression serial
		$ExistingAppt->setApptStartDateTime($startdatetime); # set the appt start datetime
		$ExistingAppt->setApptEndDateTime($enddatetime); # set the appt end datetime
		$ExistingAppt->setApptSer($ser); # set the serial
		$ExistingAppt->setApptPatientSer($patientser); 
        $ExistingAppt->setApptPrioritySer($priorityser);
        $ExistingAppt->setApptDiagnosisSer($diagnosisser);
        $ExistingAppt->setApptSourceDatabaseSer($sourcedbser);
		$ExistingAppt->setApptStatus($status); # set the appt status
		$ExistingAppt->setApptState($state); # set the appt state
		$ExistingAppt->setApptActualStartDate($actualstartdate); # set the appt start datetime
		$ExistingAppt->setApptActualEndDate($actualenddate); # set the appt end datetime

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
	my $sourceuid           = $appointment->getApptSourceUID();
    my $sourcedbser         = $appointment->getApptSourceDatabaseSer();
	my $aliasexpressionser	= $appointment->getApptAliasExpressionSer();
	my $startdatetime	    = $appointment->getApptStartDateTime();
	my $enddatetime		    = $appointment->getApptEndDateTime();
    my $priorityser         = $appointment->getApptPrioritySer();
    my $diagnosisser        = $appointment->getApptDiagnosisSer();
	my $status		        = $appointment->getApptStatus();
	my $state		        = $appointment->getApptState();
	my $actualstartdate	    = $appointment->getApptActualStartDate();
	my $actualenddate		= $appointment->getApptActualEndDate();

	my $insert_sql = "
		INSERT INTO 
			Appointment (
				AppointmentSerNum,
				PatientSerNum,
                SourceDatabaseSerNum,
				AppointmentAriaSer,
				AliasExpressionSerNum,
                Status,
                State,
				ScheduledStartTime,		
				ScheduledEndTime,
                ActualStartDate,
                ActualEndDate,
                PrioritySerNum,
                DiagnosisSerNum,
                DateAdded,
				LastUpdated
			)
		VALUES (
			NULL,
			'$patientser',
            '$sourcedbser',
			'$sourceuid',
			'$aliasexpressionser',
            '$status',
            '$state',
			'$startdatetime',
			'$enddatetime',
            '$actualstartdate',
            '$actualenddate',
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

	my $sourceuid	        = $appointment->getApptSourceUID();
    my $sourcedbser         = $appointment->getApptSourceDatabaseSer();
	my $aliasexpressionser	= $appointment->getApptAliasExpressionSer();
	my $startdatetime	    = $appointment->getApptStartDateTime();
	my $enddatetime		    = $appointment->getApptEndDateTime();
    my $priorityser         = $appointment->getApptPrioritySer();
    my $diagnosisser        = $appointment->getApptDiagnosisSer();
	my $status		= $appointment->getApptStatus();
	my $state		= $appointment->getApptState();
	my $actualstartdate	= $appointment->getApptActualStartDate();
	my $actualenddate		= $appointment->getApptActualEndDate();

	my $update_sql = "

		UPDATE
			Appointment
		SET
			AliasExpressionSerNum	= '$aliasexpressionser',
            Status                  = '$status',
            State                   = '$state',
			ScheduledStartTime	    = '$startdatetime',
			ScheduledEndTime	    = '$enddatetime',
            ActualStartDate         = '$actualstartdate',
            ActualEndDate           = '$actualenddate',
            PrioritySerNum          = '$priorityser',
            DiagnosisSerNum         = '$diagnosisser',
            ReadStatus              = 0
		WHERE
			AppointmentAriaSer	    = '$sourceuid'
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
	my $SStatus		        = $SuspectAppt->getApptStatus();
	my $SState		        = $SuspectAppt->getApptState();
	my $SActualStartDate	= $SuspectAppt->getApptActualStartDate();
    my $SActualEndDate	    = $SuspectAppt->getApptActualEndDate();

	# Original Appointment...
	my $OAliasExpressionSer	= $OriginalAppt->getApptAliasExpressionSer();
	my $OStartDateTime	    = $OriginalAppt->getApptStartDateTime();
	my $OEndDateTime	    = $OriginalAppt->getApptEndDateTime();
    my $OPrioritySer        = $OriginalAppt->getApptPrioritySer();
    my $ODiagnosisSer       = $OriginalAppt->getApptDiagnosisSer();
	my $OStatus		        = $OriginalAppt->getApptStatus();
	my $OState		        = $OriginalAppt->getApptState();
	my $OActualStartDate	= $OriginalAppt->getApptActualStartDate();
	my $OActualEndDate	    = $OriginalAppt->getApptActualEndDate();

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
	if ($SStatus ne $OStatus) {
		print "Appointment Status has changed from '$OStatus' to '$SStatus'\n";
		my $updatedStatus = $UpdatedAppt->setApptStatus($SStatus); # update status
		print "Will update database entry to '$updatedStatus'.\n";
	}
    if ($SState ne $OState) {
		print "Appointment State has changed from '$OState' to '$SState'\n";
		my $updatedState = $UpdatedAppt->setApptState($SState); # update state
		print "Will update database entry to '$updatedState'.\n";
	}
	if ($SActualStartDate ne $OActualStartDate) {
		print "Appointment Actual Scheduled Start Date has change from '$OActualStartDate' to '$SActualStartDate'\n";
		my $updatedSDT = $UpdatedAppt->setApptActualStartDate($SActualStartDate); # update start datetime
		print "Will update database entry to '$updatedSDT'.\n";
	}
	if ($SActualEndDate ne $OActualEndDate) {
		print "Appointment Actual Scheduled End Date has changed from '$OActualEndDate' to '$SActualEndDate'\n";
		my $updatedEDT = $UpdatedAppt->setApptActualEndDate($SActualEndDate); # update end datetime
		print "Will update database entry to '$updatedEDT'.\n";
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
	my ($sourceUID, $sourceDBSer, $aliasSer, $patientSer) = @_; # appt ser from arguments
	
	my $Appointment = new Appointment(); # initialize appt object

	$Appointment->setApptSourceUID($sourceUID); # assign our uid
    $Appointment->setApptSourceDatabaseSer($sourceDBSer);
    $Appointment->setApptAliasSer($aliasSer);
    $Appointment->setApptPatientSer($patientSer);

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




