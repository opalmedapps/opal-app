#!/usr/bin/perl
#---------------------------------------------------------------------------------
# A.Joseph 11-Mar-2014 ++ File: Staff.pm
#---------------------------------------------------------------------------------
# Perl module that creates a staff class. This module calls a constructor to 
# create a staff object that contains staff information stored as object 
# variables.
#
# There exists various subroutines to set staff information, get staff information
# and compare staff information between two staff objects. 
# There exists various subroutines that use the Database.pm module to update the
# MySQL database and check if a staff exists already in this database.

package Staff; # Declare package name

use Exporter; # To export subroutines and variables
use Database; # Use our custom database module Database.pm
use Storable qw(dclone); # for deep copies

#---------------------------------------------------------------------------------
# Connect to our database
#---------------------------------------------------------------------------------
my $SQLDatabase		= $Database::targetDatabase;

#====================================================================================
# Constructor for our Staff class 
#====================================================================================
sub new
{
	my $class = shift;
	my $staff = {
		_ser		    => undef,
        _sourcedbser    => undef,
		_sourceuid		=> undef,
		_firstname	    => undef,
		_lastname	    => undef,
		_initials	    => undef,
	};
	# bless associates an object with a class so Perl knows which package to search for
	# when a method is envoked on this object
	bless $staff, $class; 
	return $staff;
}

#====================================================================================
# Subroutine to set the staff serial
#====================================================================================
sub setStaffSer
{
	my ($staff, $ser) = @_; # staff object with provided serial in arguments
	$staff->{_ser} = $ser; # set the ser
	return $staff->{_ser};
}

#====================================================================================
# Subroutine to set the staff source database serial
#====================================================================================
sub setStaffSourceDatabaseSer
{
	my ($staff, $sourcedbser) = @_; # staff object with provided serial in arguments
	$staff->{_sourcedbser} = $sourcedbser; # set the ser
	return $staff->{_sourcedbser};
}

#====================================================================================
# Subroutine to set the staff source uid
#====================================================================================
sub setStaffSourceUID
{
	my ($staff, $sourceuid) = @_; # staff object with provided id in arguments
	$staff->{_sourceuid} = $sourceuid; # set the id
	return $staff->{_sourceuid};
}

#====================================================================================
# Subroutine to set the staff first name
#====================================================================================
sub setStaffFirstName
{
	my ($staff, $firstname) = @_; # staff object with provided first name in arguments
	$staff->{_firstname} = $firstname; # set the firstname
	return $staff->{_firstname};
}

#====================================================================================
# Subroutine to set the staff last name
#====================================================================================
sub setStaffLastName
{
	my ($staff, $lastname) = @_; # staff object with provided last name in arguments
	$staff->{_lastname} = $lastname; # set the last name
	return $staff->{_lastname};
}

#====================================================================================
# Subroutine to set the staff initials
#====================================================================================
sub setStaffInitials
{
	my ($staff, $initials) = @_; # staff object with provided initials in arguments
	$staff->{_initials} = $initials; # set the initials
	return $staff->{_initials};
}

#====================================================================================
# Subroutine to get the staff ser
#====================================================================================
sub getStaffSer
{
	my ($staff) = @_; # our staff object
	return $staff->{_ser};
}

#====================================================================================
# Subroutine to get the staff source database ser
#====================================================================================
sub getStaffSourceDatabaseSer
{
	my ($staff) = @_; # our staff object
	return $staff->{_sourcedbser};
}

#====================================================================================
# Subroutine to get the staff source uid
#====================================================================================
sub getStaffSourceUID
{
	my ($staff) = @_; # our staff object
	return $staff->{_sourceuid};
}

#====================================================================================
# Subroutine to get the staff first name
#====================================================================================
sub getStaffFirstName
{
	my ($staff) = @_; # our staff object
	return $staff->{_firstname};
}

#====================================================================================
# Subroutine to get the staff last name
#====================================================================================
sub getStaffLastName
{
	my ($staff) = @_; # our staff object
	return $staff->{_lastname};
}

#====================================================================================
# Subroutine to get the staff initials
#====================================================================================
sub getStaffInitials
{
	my ($staff) = @_; # our staff object
	return $staff->{_initials};
}


#====================================================================================
# Subroutine to get staff information from the source db given an id
#====================================================================================
sub getStaffInfoFromSourceDB
{
	my ($Staff) = @_; # Staff object
		
	my $sourceuid   = $Staff->getStaffSourceUID();
    my $sourcedbser = $Staff->getStaffSourceDatabaseSer();

	# when we retrieve query results
	my ($firstname, $lastname, $initials);

    # ARIA
    if ($sourcedbser eq 1) {

        my $sourceDatabase = Database::connectToSourceDatabase($sourcedbser);
        my $staffInfo_sql = "
    		SELECT
	    		userid.user_first_name,
		    	userid.user_last_name,
			    userid.user_initial
    		FROM 
	    		varianenm.dbo.userid userid
		    WHERE
			    userid.stkh_id = '$id'
    	";

    	# prepare query
	    my $query = $sourceDatabase->prepare($staffInfo_sql)
		    or die "Could not prepare query: " . $sourceDatabase->errstr;

    	# execute query
	    $query->execute()
		    or die "Could not execute query: " . $query->errstr;

    	while (my @data = $query->fetchrow_array()) {
    
	    	$firstname	= $data[0];
		    $lastname	= $data[1];
    		$initials	= $data[2];
	    
		    $Staff->setStaffFirstName($firstname);
    		$Staff->setStaffLastName($lastname);
	    	$Staff->setStaffInitials($initials);
    	}

        $sourceDatabase->disconnect();
    }
	return $Staff;
}

#======================================================================================
# Subroutine to check if a particular staff exists in our MySQL db
#	@return: staff object (if exists) .. NULL otherwise
#======================================================================================
sub inOurDatabase
{
	my ($staff) = @_;

	my $sourceuid   = $staff->getStaffSourceUID(); # retrieve staff id
    my $sourcedbser = $staff->getStaffSourceDatabaseSer();

	my $StaffSourceUIDInDB = 0; # false by default. Will be true if staff exists
	my $ExistingStaff = (); # data to be entered if staff exists

	# other staff variables, if it exists
	my ($ser, $firstname, $lastname);

	my $inDB_sql = "
		SELECT
			Staff.StaffSerNum,
			Staff.StaffId,
			Staff.FirstName,
			Staff.LastName
		FROM
			Staff
		WHERE 
			Staff.StaffId               = '$sourceuid'
        AND Staff.SourceDatabaseSerNum  = '$sourcedbser'
	";

	# prepare query
	my $query = $SQLDatabase->prepare($inDB_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;
	
	while (my @data = $query->fetchrow_array()) {

		$ser		        = $data[0];
		$StaffSourceUIDInDB	= $data[1];
		$firstname	        = $data[2];
		$lastname	        = $data[3];
	}

	if ($StaffSourceUIDInDB) {

		$ExistingStaff = new Staff(); # initialize new staff object

		$ExistingStaff->setStaffSer($ser);
		$ExistingStaff->setStaffSourceUID($StaffSourceUIDInDB);
        $ExistingStaff->setStaffSourceDatabaseSer($sourcedbser);
		$ExistingStaff->setStaffFirstName($firstname);
		$ExistingStaff->setStaffLastName($lastname);

		return $ExistingStaff; # this is truthful (ie. staff exists) return object
	}

	else {return $ExistingStaff;} # this is falseful (ie. staff DNE) return empty
}

#======================================================================================
# Subroutine to insert our staff info in our database
#======================================================================================
sub insertStaffIntoOurDB
{
	my ($staff) = @_; # our staff object

	my $sourceuid		= $staff->getStaffSourceUID();
    my $sourcedbser     = $staff->getStaffSourceDatabaseSer();
	my $firstname	    = $staff->getStaffFirstName();
	my $lastname	    = $staff->getStaffLastName();

	my $insert_sql = "
		INSERT INTO 
			Staff (
				StaffSerNum, 
                SourceDatabaseSerNum,
				StaffId, 
				FirstName, 	
				LastName, 
				LastUpdated
			)
		VALUES (
			NULL,
            '$sourcedbser',
			'$sourceuid',
			\"$firstname\",
			\"$lastname\",
			NULL
		)
	";

	# prepare query
	my $query = $SQLDatabase->prepare($insert_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;

	# Retrieve the StaffSer
	my $ser = $SQLDatabase->last_insert_id(undef, undef, undef, undef);

	# Set the serial in our staff object
	$staff->setStaffSer($ser);

	return $staff;
}

#======================================================================================
# Subroutine to update our database with the staff's updated info
#======================================================================================
sub updateDatabase
{
	my ($staff) = @_; # our staff object to update

	my $sourceuid		= $staff->getStaffSourceUID();
    my $sourcedbser     = $staff->getStaffSourceDatabaseSer();
	my $firstname	    = $staff->getStaffFirstName();
	my $lastname	    = $staff->getStaffLastName();

	my $update_sql = "
		UPDATE
			Staff
		SET
			FirstName	= \"$firstname\",
			LastName	= \"$lastname\",
		WHERE
			StaffId		            = '$sourceuid'
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
# Subroutine to compare two staff objects. If different, use setter functions
# to update staff object.
#======================================================================================
sub compareWith
{
	my ($SuspectStaff, $OriginalStaff) = @_; # our two staff objects
	my $UpdatedStaff = dclone($OriginalStaff); # deep copy object

	# retrieve parameters...
	# Suspect staff...
	my $Sfirstname	= $SuspectStaff->getStaffFirstName();
	my $Slastname	= $SuspectStaff->getStaffLastName();

	# Original staff....
	my $Ofirstname	= $OriginalStaff->getStaffFirstName();
	my $Olastname	= $OriginalStaff->getStaffLastName();
	
	# go through each parameter

	if ($Sfirstname ne $Ofirstname) {
		print "Staff First Name has changed from '$Ofirstname' to '$Sfirstname'\n";
		my $updatedFirstName = $UpdatedStaff->setStaffFirstName($Sfirstname); # update
		print "Will update database entry to '$updatedFirstName'.\n";
	}
	if ($Slastname ne $Olastname) {
		print "Staff Last Name has changed from '$Olastname' to '$Slastname'\n";
		my $updatedLastName = $UpdatedStaff->setStaffLastName($Slastname); # update
		print "Will update database entry to '$updatedLastName'.\n";
	}

	return $UpdatedStaff;
}

#======================================================================================
# Subroutine to reassign our staff id to a staff serial. In the process, insert
# staff into our database if it DNE. 
#======================================================================================
sub reassignStaff
{
	my ($sourceuid, $sourcedbser) = @_; # staff id from arguments

	if (!$sourceuid) { # there is no assigned staff
		return 0;
	}

	else {
	    
        my $Staff = new Staff(); # initialize staff object
		
        $Staff->setStaffSourceUID($sourceuid); # assign our id
        $Staff->setStaffSourceDatabaseSer($sourcedbser);

		# check if our staff exists in our database 
		my $StaffExists = $Staff->inOurDatabase();

		if ($StaffExists) {
			
			my $ExistingStaff = dclone($StaffExists); # reassign variable

			my $staffSer = $ExistingStaff->getStaffSer(); # get serial

			return $staffSer;
		}

		else { # staff DNE 

			# get staff info from source database (ARIA)
			$Staff = $Staff->getStaffInfoFromSourceDB();

			# insert staff into our database
			$Staff = $Staff->insertStaffIntoOurDB();
		
			# get serial
			my $staffSer = $Staff->getStaffSer(); 

			return $staffSer;
		}
	}
}

# To exit/return always true (for the module itself)
1;	


