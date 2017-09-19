#!/usr/bin/perl
#---------------------------------------------------------------------------------
# A.Joseph 06-Oct-2015 ++ File: ResourceAppointment.pm
#---------------------------------------------------------------------------------
# Perl module that creates a resourceappointment (RA) class. This module calls a constructor to 
# create an RA object that contains RA information stored as object 
# variables.
#
# There exists various subroutines to set RA information, get RA information
# and compare RA information between two RA objects. 
# There exists various subroutines that use the Database.pm module to update the
# MySQL database and check if an RA exists already in this database.

package ResourceAppointment; # Declare package name

use Exporter; # To export subroutines and variables
use Database; # Use our custom database module Database.pm
use Time::Piece; # To parse and convert date time
use Storable qw(dclone); # for deep copies

use Appointment; # Our appointment module
use Resource; # Our resource module

use Data::Dumper;

#---------------------------------------------------------------------------------
# Connect to our database
#---------------------------------------------------------------------------------
my $SQLDatabase		= $Database::targetDatabase;

#====================================================================================
# Constructor for our PatientDoctor class 
#====================================================================================
sub new
{
	my $class = shift;
	my $resappt = {
		_ser		    => undef,
		_resourceser	=> undef,
		_appointmentser	=> undef,
		_exclusiveflag	=> undef,
		_primaryflag	=> undef,
	};
	# bless associates an object with a class so Perl knows which package to search for
	# when a method is envoked on this object
	bless $resappt, $class;
	return $resappt;
}

#====================================================================================
# Subroutine to set the RA  serial
#====================================================================================
sub setResourceAppointmentSer
{
	my ($resappt, $ser) = @_; # RA object with provided serial in arguments
	$resappt->{_ser} = $ser; # set the ser
	return $resappt->{_ser};
}

#====================================================================================
# Subroutine to set the RA resource serial
#====================================================================================
sub setResourceAppointmentResourceSer
{
	my ($resappt, $resourceser) = @_; # RA object with provided serial in arguments
	$resappt->{_resourceser} = $resourceser; # set the ser
	return $resappt->{_resourceser};
}

#====================================================================================
# Subroutine to set the RA appointment serial
#====================================================================================
sub setResourceAppointmentAppointmentSer
{
	my ($resappt, $apptser) = @_; # RA object with provided serial in arguments
	$resappt->{_appointmentser} = $apptser; # set the ser
	return $resappt->{_appointmentser};
}

#====================================================================================
# Subroutine to set the RA exclusive flag
#====================================================================================
sub setResourceAppointmentExclusiveFlag
{
	my ($resappt, $exclusiveflag) = @_; # RA object with provided flag in arguments
	$resappt->{_exclusiveflag} = $exclusiveflag; # set the flag
	return $resappt->{_exclusiveflag};
}

#====================================================================================
# Subroutine to set the RA primary flag
#====================================================================================
sub setResourceAppointmentPrimaryFlag
{
	my ($resappt, $primaryflag) = @_; # RA object with provided flag in arguments
	$resappt->{_primaryflag} = $primaryflag; # set the flag
	return $resappt->{_primaryflag};
}

#====================================================================================
# Subroutine to get the RA serial
#====================================================================================
sub getResourceAppointmentSer
{
	my ($resappt) = @_; # our RA object
	return $resappt->{_ser};
}

#====================================================================================
# Subroutine to get the RA resource serial
#====================================================================================
sub getResourceAppointmentResourceSer
{
	my ($resappt) = @_; # our RA object
	return $resappt->{_resourceser};
}
		
#====================================================================================
# Subroutine to get the RA appointment serial
#====================================================================================
sub getResourceAppointmentAppointmentSer
{
	my ($resappt) = @_; # our RA object
	return $resappt->{_appointmentser};
}

#====================================================================================
# Subroutine to get the RA exclusive flag
#====================================================================================
sub getResourceAppointmentExclusiveFlag
{
	my ($resappt) = @_; # our RA object
	return $resappt->{_exclusiveflag};
}

#====================================================================================
# Subroutine to get the RA primary flag
#====================================================================================
sub getResourceAppointmentPrimaryFlag
{
	my ($resappt) = @_; # our RA object
	return $resappt->{_primaryflag};
}

#====================================================================================
# Subroutine to get all RA's from the source db
#====================================================================================
sub getResourceAppointmentsFromSourceDB
{
	my (@patientList) = @_; # a list of appointments

	my @resapptList = (); # initialize a list for ResourceAppointment objects

	my ($resourceser, $apptser, $exclusiveflag, $primaryflag); # for query results
    my $lasttransfer;

    my @aliasList = Alias::getAliasesMarkedForUpdate('Appointment');

    print "Got alias list\n";

	foreach my $Patient (@patientList) {

        my $patientSer          = $Patient->getPatientSer(); 
		my $patientSSN          = $Patient->getPatientSSN(); # get patient ssn
		my $patientLastTransfer	= $Patient->getPatientLastTransfer(); # get last transfer

        foreach my $Alias (@aliasList) {

    		my $aliasSer		    = $Alias->getAliasSer(); # get alias serial
            my $sourceDBSer         = $Alias->getAliasSourceDatabaseSer();
	    	my @expressions		    = $Alias->getAliasExpressions(); # get expressions
		    my $aliasLastTransfer	= $Alias->getAliasLastTransfer(); # get last transfer

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

                my $sourceDatabase = Database::connectToSourceDatabase($sourceDBSer);
        		my $raInfo_sql = "
                    use variansystem;
	        		SELECT DISTINCT
		        		ra.ResourceSer,
			        	ra.ScheduledActivitySer,
				        ra.ExclusiveFlag,
    				    ra.PrimaryFlag
    	    		FROM
                        Patient AS pt,
		        		ResourceActivity AS ra,
			        	ScheduledActivity AS sa,
				        ActivityInstance AS ai,
    				    Activity,
    	    			vv_ActivityLng AS va
	    	    	WHERE
		    	    	sa.ActivityInstanceSer		= ai.ActivityInstanceSer
                    AND sa.PatientSer               = pt.PatientSer
                    AND pt.SSN                      LIKE '$patientSSN%'
        			AND ai.ActivitySer			    = Activity.ActivitySer
	        		AND	Activity.ActivityCode		= va.LookupValue
		        	AND	sa.ScheduledActivitySer		= ra.ScheduledActivitySer
			        AND	ra.HstryDateTime		    > '$lasttransfer'
	    		    AND	va.Expression1			    IN ($expressionText)
        
	        		ORDER BY 
		        		ra.ScheduledActivitySer
    		    ";
                #print "$raInfo_sql\n";	
	        	#print "Start query\n";
		        # prepare query
    		    my $query = $sourceDatabase->prepare($raInfo_sql)
	    		    or die "Could not prepare query: " . $sourceDatabase->errstr;

        		# execute query
	        	$query->execute()
		        	or die "Could not execute query: " . $query->errstr;
    
        		# Fetched all data, instead of fetching each row
        		my $data = $query->fetchall_arrayref();
		        foreach my $row (@$data) {
			    
    			    my $resappt = new ResourceAppointment(); # new RA object

    	    		$resourceser			= Resource::reassignResource($row->[0], $sourceDBSer);
        			$apptser			    = Appointment::reassignAppointment($row->[1], $sourceDBSer, $aliasSer, $patientSer);
	        		$exclusiveflag			= $row->[2];
		        	$primaryflag			= $row->[3];

        			$resappt->setResourceAppointmentResourceSer($resourceser);
	        		$resappt->setResourceAppointmentAppointmentSer($apptser);
		        	$resappt->setResourceAppointmentExclusiveFlag($exclusiveflag);
			        $resappt->setResourceAppointmentPrimaryFlag($primaryflag);

    	    		push(@resapptList, $resappt);
                }

                $sourceDatabase->disconnect();
            }

            # WaitRoomManagement
            if ($sourceDBSer eq 2) {
  
                my $sourceDatabase = Database::connectToSourceDatabase($sourceDBSer);
        		my $raInfo_sql = "
                    SELECT DISTINCT
                        mval.AppointmentSerNum,
                        mval.ClinicResourcesSerNum
                    FROM
                        MediVisitAppointmentList mval,
                        Patient pt
                    WHERE
                        mval.PatientSerNum      = pt.PatientSerNum
                    AND pt.SSN                  LIKE '$patientSSN%'
                    AND mval.LastUpdated        > '$lasttransfer'
                    AND mval.AppointmentCode    IN ($expressionText)
                ";

		        # prepare query
    		    my $query = $sourceDatabase->prepare($raInfo_sql)
	    		    or die "Could not prepare query: " . $sourceDatabase->errstr;

        		# execute query
	        	$query->execute()
		        	or die "Could not execute query: " . $query->errstr;
    
        		# Fetched all data, instead of fetching each row
        		my $data = $query->fetchall_arrayref();
		        foreach my $row (@$data) {
			    
    			    my $resappt = new ResourceAppointment(); # new RA object

                    $apptser                = Appointment::reassignAppointment($row->[0], $sourceDBSer, $aliasSer, $patientSer);
                    $resourceser            = Resource::reassignResource($row->[1], $sourceDBSer);
                    $exclusiveflag          = 1; # not defined yet in source db
                    $primaryflag            = 0; # not defined yet in source db
	
                    $resappt->setResourceAppointmentResourceSer($resourceser);
	        		$resappt->setResourceAppointmentAppointmentSer($apptser);
		        	$resappt->setResourceAppointmentExclusiveFlag($exclusiveflag);
			        $resappt->setResourceAppointmentPrimaryFlag($primaryflag);

    	    		push(@resapptList, $resappt);
                }

                $sourceDatabase->disconnect();
            }
                
		}
	}

	return @resapptList;

}
			
#====================================================================================
# Subroutine to get all patient's resources given an appointment serial
#====================================================================================
sub getPatientsResourcesFromOurDB 
{
    my ($appointmentSer) = @_; # args

    my @resources = (); # initialize a list

    my $select_sql = "
        SELECT DISTINCT
            re.ResourceAriaSer
        FROM
            ResourceAppointment ra,
            Resource re
        WHERE
            ra.AppointmentSerNum    = '$appointmentSer'
        AND ra.ResourceSerNum       = re.ResourceSerNum
    ";

    # prepare query
	my $query = $SQLDatabase->prepare($select_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;

	while (my @data = $query->fetchrow_array()) {
        push(@resources, $data[0]);
    }

    return @resources;
}


#======================================================================================
# Subroutine to check if a particular RA exists in our MySQL db
#	@return: RA object (if exists) .. NULL otherwise
#======================================================================================
sub inOurDatabase
{
	my ($resappt) = @_; # ResourceAppointment object
	
	my $resourceSer	= $resappt->getResourceAppointmentResourceSer();
	my $apptSer	= $resappt->getResourceAppointmentAppointmentSer();

	my $RASerInDB = 0; # false by default. Will be true if RA exists
	my $ExistingRA = (); # data to be entered if RA exists

	# Other RA variables, if it exists
	my ($exclusiveflag, $primaryflag);

	my $inDB_sql = "
		SELECT
			ra.ResourceAppointmentSerNum,
			ra.ExclusiveFlag,
			ra.PrimaryFlag
		FROM
			ResourceAppointment AS ra
		WHERE
			ra.ResourceSerNum	= $resourceSer
		AND	ra.AppointmentSerNum	= $apptSer
	";

	# prepare query
	my $query = $SQLDatabase->prepare($inDB_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;
	
	while (my @data = $query->fetchrow_array()) {

		$RASerInDB		= $data[0];
		$exclusiveflag		= $data[1];
		$primaryflag		= $data[2];

	}
	if ($RASerInDB) {
		$ExistingRA = new ResourceAppointment(); # initialize RA object

		$ExistingRA->setResourceAppointmentSer($RASerInDB);
		$ExistingRA->setResourceAppointmentResourceSer($resourceSer);
		$ExistingRA->setResourceAppointmentAppointmentSer($apptSer);
		$ExistingRA->setResourceAppointmentExclusiveFlag($exclusiveflag);
		$ExistingRA->setResourceAppointmentPrimaryFlag($primaryflag);

		return $ExistingRA; # this is truthful (ie. RA exists, return object)

	}

	else {return $ExistingRA;} # this is falseful (ie. RA DNE, return empty)
}

#======================================================================================
# Subroutine to insert our RA info in our database
#======================================================================================
sub insertResourceAppointmentIntoOurDB
{

	my ($resappt) = @_; # our RA object to insert

	my $resourceSer		= $resappt->getResourceAppointmentResourceSer();
	my $apptSer		    = $resappt->getResourceAppointmentAppointmentSer();
	my $exclusiveflag	= $resappt->getResourceAppointmentExclusiveFlag();
	my $primaryflag		= $resappt->getResourceAppointmentPrimaryFlag();

	my $insert_sql = "
		INSERT INTO 
			ResourceAppointment (
				ResourceSerNum,
				AppointmentSerNum,
				ExclusiveFlag,
				PrimaryFlag,
                DateAdded
			)
		VALUES (
			'$resourceSer',
			'$apptSer',
			'$exclusiveflag',
			'$primaryflag',
			NOW()
		)
	";

	# prepare query
	my $query = $SQLDatabase->prepare($insert_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;

	return $resappt;
}

#======================================================================================
# Subroutine to update our database with the RA's updated info
#======================================================================================
sub updateDatabase
{	
	my ($resappt) = @_; # our RA object to insert

	my $resourceApptSer	= $resappt->getResourceAppointmentSer();
	my $resourceSer		= $resappt->getResourceAppointmentResourceSer();
	my $apptSer		    = $resappt->getResourceAppointmentAppointmentSer();
	my $exclusiveflag	= $resappt->getResourceAppointmentExclusiveFlag();
	my $primaryflag		= $resappt->getResourceAppointmentPrimaryFlag();

	my $update_sql = "
		UPDATE
			ResourceAppointment
		SET
			ExclusiveFlag		= '$exclusiveflag',
			PrimaryFlag		    = '$primaryflag'
		WHERE
			ResourceAppointmentSerNum	= $resourceApptSer
	";

	# prepare query
	my $query = $SQLDatabase->prepare($update_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;
}


#======================================================================================
# Subroutine to compare two RA objects. If different, use setter functions
# to update RA object.
#======================================================================================
sub compareWith
{	
	my ($SuspectRA, $OriginalRA) = @_; # our two RA objects
	my $UpdatedRA = dclone($OriginalRA);

	# retrieve params...
	# suspect RA
	my $Sexclusiveflag		= $SuspectRA->getResourceAppointmentExclusiveFlag(); # yes, Sexclusive...
	my $Sprimaryflag		= $SuspectRA->getResourceAppointmentPrimaryFlag();

	# original RA
	my $Oexclusiveflag		= $OriginalRA->getResourceAppointmentExclusiveFlag();
	my $Oprimaryflag		= $OriginalRA->getResourceAppointmentPrimaryFlag();

	# go through each param
	if ($Sexclusiveflag ne $Oexclusiveflag) {

		print "ResourceAppointment Exclusive Flag has changed from '$Oexclusiveflag' to '$Sexclusiveflag'\n";
		my $updatedExclusiveFlag = $UpdatedRA->setResourceAppointmentExclusiveFlag($Sexclusiveflag); # update
		print "Will update database entry to '$updatedExclusiveFlag'.\n";
	}
	if ($Sprimaryflag ne $Oprimaryflag) {

		print "ResourceAppointment Primary Flag has changed from '$Oprimaryflag' to '$Sprimaryflag'\n";
		my $updatedPrimaryFlag = $UpdatedRA->setResourceAppointmentPrimaryFlag($Sprimaryflag); # update
		print "Will update database entry to '$updatedPrimaryFlag'.\n";
	}
	
	return $UpdatedRA;
}

# To exit/return always true (for the module itself)
1;



	
		
				
