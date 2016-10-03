#!/usr/bin/perl
#---------------------------------------------------------------------------------
# A.Joseph 10-Aug-2015 ++ File: Doctor.pm
#---------------------------------------------------------------------------------
# Perl module that creates a doctor class. This module calls a constructor to 
# create a doctor object that contains doctor information stored as object 
# variables.
#
# There exists various subroutines to set doctor information, get doctor information
# and compare doctor information between two doctor objects. 
# There exists various subroutines that use the Database.pm module to update the
# MySQL database and check if a doctor exists already in this database.

package Doctor; # Declare package name

use Exporter; # To export subroutines and variables
use Database; # Use our custom database module Database.pm
use Patient; # Use our custom patient module
use Resource; # Resource.pm
use Storable qw(dclone); # for deep copies

#---------------------------------------------------------------------------------
# Connect to the databases
#---------------------------------------------------------------------------------

my $sourceDatabase	= $Database::sourceDatabase;
my $SQLDatabase		= $Database::targetDatabase;

#====================================================================================
# Constructor for our Doctor class 
#====================================================================================
sub new
{
	my $class = shift;
	my $doctor = {
		_ser		=> undef,
		_ariaser	=> undef,
		_resourceser	=> undef,
		_firstname	=> undef,
		_lastname	=> undef,
        _email      => undef,
	};
	# bless associates an object with a class so Perl knows which package to search for
	# when a method is envoked on this object
	bless $doctor, $class;
	return $doctor;
}

#====================================================================================
# Subroutine to set the doctor serial 
#====================================================================================
sub setDoctorSer
{
	my ($doctor, $ser) = @_; # doctor object with provided serial in arguments
	$doctor->{_ser} = $ser; # set the serial
	return $doctor->{_ser};
}

#====================================================================================
# Subroutine to set the doctor aria serial
#====================================================================================
sub setDoctorAriaSer
{
	my ($doctor, $ariaser) = @_; # doctor object with provided serial in arguments
	$doctor->{_ariaser} = $ariaser; # set the serial
	return $doctor->{_ariaser};
}

#====================================================================================
# Subroutine to set the doctor first name
#====================================================================================
sub setDoctorFirstName
{
	my ($doctor, $firstname) = @_; # doctor object with provided name in arguments
	$doctor->{_firstname} = $firstname; # set the name
	return $doctor->{_firstname};
}

#====================================================================================
# Subroutine to set the doctor last name
#====================================================================================
sub setDoctorLastName
{
	my ($doctor, $lastname) = @_; # doctor object with provided name in arguments
	$doctor->{_lastname} = $lastname; # set the name
	return $doctor->{_lastname};
}

#====================================================================================
# Subroutine to set the doctor resource serial
#====================================================================================
sub setDoctorResourceSer
{
	my ($doctor, $resourceser) = @_; # doctor object with provided serial in arguments
	$doctor->{_resourceser} = $resourceser; # set the serial
	return $doctor->{_resourceser};
}

#====================================================================================
# Subroutine to set the doctor email
#====================================================================================
sub setDoctorEmail
{
	my ($doctor, $email) = @_; # doctor object with provided email in arguments
	$doctor->{_email} = $email; # set the email
	return $doctor->{_email};
}

#======================================================================================
# Subroutine to get the doctor serial
#======================================================================================
sub getDoctorSer
{
	my ($doctor) = @_; # our doctor object
	return $doctor->{_ser};
}

#======================================================================================
# Subroutine to get the doctor aria serial
#======================================================================================
sub getDoctorAriaSer
{
	my ($doctor) = @_; # our doctor object
	return $doctor->{_ariaser};
}

#======================================================================================
# Subroutine to get the doctor first name
#======================================================================================
sub getDoctorFirstName
{
	my ($doctor) = @_; # our doctor object
	return $doctor->{_firstname};
}

#======================================================================================
# Subroutine to get the doctor last name
#======================================================================================
sub getDoctorLastName
{
	my ($doctor) = @_; # our doctor object
	return $doctor->{_lastname};
}

#======================================================================================
# Subroutine to get the doctor resource serial
#======================================================================================
sub getDoctorResourceSer
{
	my ($doctor) = @_; # our doctor object
	return $doctor->{_resourceser};
}

#======================================================================================
# Subroutine to get the doctor email
#======================================================================================
sub getDoctorEmail
{
	my ($doctor) = @_; # our doctor object
	return $doctor->{_email};
}


#====================================================================================
# Subroutine to get doctors from the ARIA db since last cron
#====================================================================================
=pod
sub getDoctorsFromSourceDB
{

	my (@CoreAliasList) = @_; # Alias object
	my @doctorList = (); # initialize a list for Doctor objects

	# when we retrieve query results
	my ($id, $firstname, $lastname);
	
	foreach my $DoctorAlias (@CoreAliasList) {

		my $aliasSer		= $DoctorAlias->getAliasSer(); # get alias ser
		my $lastUpdated		= $DoctorAlias->getAliasLastUpdated(); # get last updated
		my $doctor_sql = "
			SELECT DISTINCT
				Doctor.DoctorId,
				Doctor.FirstName,
				Doctor.LastName,
				Doctor.OncologistFlag,
				Address.PostalCode
			FROM 
				Doctor,
				ResourceAddress,
				Address,
				Resource
			WHERE
				Doctor.ResourceSer		= Resource.ResourceSer
			AND	ResourceAddress.ResourceSer	= Resource.ResourceSer
			AND	ResourceAddress.AddressSer	= Address.AddressSer
			AND	ResourceAddress.PrimaryFlag	= 1
			AND	Resource.HstryDateTime		> '$lastUpdated'
		
			ORDER BY
				Doctor.DoctorId
			
		";

		# prepare query
		my $query = $sourceDatabase->prepare($doctor_sql)
			or die "Could not prepare query: " . $sourceDatabase->errstr;

		# execute query
		$query->execute()
			or die "Could not execute query: " . $query->errstr;

		while (my @data = $query->fetchrow_array()) {
	
			my $doctor = new Doctor(); # new doctor object

			# query results
			$id 		= $data[0];
			$firstname	= $data[1];
			$lastname	= $data[2];
			$oncflag	= $data[3];
			$postalcode	= $data[4];

			# set doctor information
			$doctor->setDoctorId($id);
			$doctor->setDoctorAliasSer($aliasSer);
			$doctor->setDoctorFirstName($firstname);
			$doctor->setDoctorLastName($lastname);
			$doctor->setDoctorOncFlag($oncflag);
			$doctor->setDoctorPostalCode($postalcode);
	
			push(@doctorList, $doctor); # append doctor to the list

		}
	}

	return @doctorList;
}
=cut
#====================================================================================
# Subroutine to get doctor information from the ARIA db given a serial
#====================================================================================
sub getDoctorInfoFromSourceDB
{

	my ($Doctor) = @_; # Doctor object

	my $doctorAriaSer = $Doctor->getDoctorAriaSer();

	# when we retrieve query results
	my ($resourcesernum, $firstname, $lastname, $email);
	
	my $doctor_sql = "
		SELECT DISTINCT
			Doctor.FirstName,
			Doctor.LastName,
            Address.EMailAddress
		FROM 
			Doctor
        LEFT JOIN ResourceAddress 
        ON ResourceAddress.ResourceSer      = Doctor.ResourceSer
        LEFT JOIN Address
        ON Address.AddressSer               = ResourceAddress.AddressSer
		WHERE
			Doctor.ResourceSer		= '$doctorAriaSer'
		
	";

	# prepare query
	my $query = $sourceDatabase->prepare($doctor_sql)
		or die "Could not prepare query: " . $sourceDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;

	while (my @data = $query->fetchrow_array()) {
	
		# query results
		$firstname	= $data[0];
		$lastname	= $data[1];
        $email      = $data[2];

		$resourcesernum = Resource::reassignResource($doctorAriaSer);
		

		# set doctor information
		$Doctor->setDoctorResourceSer($resourcesernum);
		$Doctor->setDoctorFirstName($firstname);
		$Doctor->setDoctorLastName($lastname);
        $Doctor->setDoctorEmail($email);

	}

	return $Doctor;
}


#======================================================================================
# Subroutine to check if our doctor exists in our MySQL db
#	@return: doctor object (if exists) .. NULL otherwise
#======================================================================================
sub inOurDatabase
{
	my ($doctor) = @_;
	my $doctorAriaSer = $doctor->getDoctorAriaSer(); # retrieve doctor aria serial

	my $DoctorAriaSerInDB = 0; # false by default. Will be true if doctor exists
	my $ExistingDoctor = (); # data to be entered if doctor exists

	# other doctor variables, if it exists
	my ($ser, $resourceser, $firstname, $lastname, $email);

	my $inDB_sql = "
		SELECT DISTINCT
			Doctor.DoctorSerNum,
			Doctor.ResourceSerNum,
			Doctor.DoctorAriaSer,
			Doctor.FirstName,
			Doctor.LastName,
            Doctor.Email
		FROM	
			Doctor
		WHERE
			Doctor.DoctorAriaSer = '$doctorAriaSer'
		";

	# prepare query
	my $query = $SQLDatabase->prepare($inDB_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;
	
	while (my @data = $query->fetchrow_array()) {

		$ser			= $data[0];
		$resourceser		= $data[1];
		$DoctorAriaSerInDB	= $data[2];
		$firstname		= $data[3];
		$lastname		= $data[4];
        $email              = $data[5];
		
	}

	if ($DoctorAriaSerInDB) {

		$ExistingDoctor = new Doctor(); # initialize new doctor object

		$ExistingDoctor->setDoctorSer($ser);
		$ExistingDoctor->setDoctorResourceSer($resourceser);
		$ExistingDoctor->setDoctorAriaSer($DoctorAriaSerInDB);
		$ExistingDoctor->setDoctorFirstName($firstname);
		$ExistingDoctor->setDoctorLastName($lastname);
        $ExistingDoctor->setDoctorEmail($email);

		return $ExistingDoctor; # this is truthful (ie. doctor exists) return object
	}
	
	else {return $ExistingDoctor;} # this is falseful (ie. doctor DNE) return empty
}

#======================================================================================
# Subroutine to insert our doctor info in our database
#======================================================================================
sub insertDoctorIntoOurDB
{
	my ($doctor) = @_; # our doctor object
	
	# Retrieve all the necessary details from this object
	my $ariaser	= $doctor->getDoctorAriaSer();
	my $resourceser	= $doctor->getDoctorResourceSer();
	my $firstname	= $doctor->getDoctorFirstName();
	my $lastname	= $doctor->getDoctorLastName();
    my $email       = $doctor->getDoctorEmail();

	my $insert_sql = "
		INSERT INTO 
			Doctor (
				DoctorSerNum, 
				DoctorAriaSer,
				ResourceSerNum, 
				FirstName, 
				LastName,
                Email
			)
		VALUES (
			NULL,
			'$ariaser',
			'$resourceser',
			\"$firstname\",
			\"$lastname\",
            \"$email\"
		)
	";

	# prepare query
	my $query = $SQLDatabase->prepare($insert_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;

	# Retrieve the DoctorSer
	my $ser = $SQLDatabase->last_insert_id(undef, undef, undef, undef);

	# Set the serial in our doctor object
	$doctor->setDoctorSer($ser);

	return $doctor;
}

#======================================================================================
# Subroutine to update our database with the doctor's updated info
#======================================================================================
sub updateDatabase
{
	my ($doctor) = @_; # our doctor object to update 
	
	my $ariaser	= $doctor->getDoctorAriaSer();
	my $firstname	= $doctor->getDoctorFirstName();
	my $lastname	= $doctor->getDoctorLastName();
    my $email       = $doctor->getDoctorEmail();

	my $update_sql = "
		UPDATE
			Doctor
		SET
			FirstName	= \"$firstname\",
			LastName	= \"$lastname\",
            Email       = \"$email\"
		WHERE
			DoctorAriaSer	= '$ariaser'
		";
	# prepare query
	my $query = $SQLDatabase->prepare($update_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;	
}

#======================================================================================
# Subroutine to compare two doctor objects. If different, use setter functions
# to update doctor object.
#======================================================================================
sub compareWith
{
	my ($SuspectDoctor, $OriginalDoctor) = @_; # our two doctor objects
	my $UpdatedDoctor = dclone($OriginalDoctor); # deep copy doctor object

	# retrieve parameters...
	# Suspect doctor...
	my $Sfirstname	= $SuspectDoctor->getDoctorFirstName();
	my $Slastname	= $SuspectDoctor->getDoctorLastName();
    my $Semail      = $SuspectDoctor->getDoctorEmail();

	# Original doctor....
	my $Ofirstname	= $OriginalDoctor->getDoctorFirstName();
	my $Olastname	= $OriginalDoctor->getDoctorLastName();
    my $Oemail      = $OriginalDoctor->getDoctorEmail();
	
	# go through each parameter
	if ($Sfirstname ne $Ofirstname) {
		print "Doctor First Name has changed from '$Ofirstname' to '$Sfirstname'\n";
		my $updatedFirstName = $UpdatedDoctor->setDoctorFirstName($Sfirstname); # update
		print "Will update database entry to '$updatedFirstName'.\n";
	}
	if ($Slastname ne $Olastname) {
		print "Doctor Last Name has changed from '$Olastname' to '$Slastname'\n";
		my $updatedLastName = $UpdatedDoctor->setDoctorLastName($Slastname); # update
		print "Will update database entry to '$updatedLastName'.\n";
	}
	if ($Semail ne $Oemail) {
		print "Doctor Email has changed from '$Oemail' to '$Semail'\n";
		my $updatedEmail = $UpdatedDoctor->setDoctorEmail($Semail); # update
		print "Will update database entry to '$updatedEmail'.\n";
	}

	return $UpdatedDoctor;
}

#======================================================================================
# Subroutine to reassign our doctor id to a doctor serial in MySQL. 
# In the process, insert doctor into our database if it DNE
#======================================================================================
sub reassignDoctor
{
	my ($doctorAriaSer) = @_; # doctor aria serial from arguments
	
	my $Doctor = new Doctor(); # initialize doctor object

	$Doctor->setDoctorAriaSer($doctorAriaSer); # assign our aria serial

	# check if our doctor exists in our database
	my $DoctorExists = $Doctor->inOurDatabase();

	if ($DoctorExists) {

		my $ExistingDoctor = dclone($DoctorExists); # reassign variable

		my $doctorSer = $ExistingDoctor->getDoctorSer(); # get serial

		return $doctorSer;
	}
	else {# doctor DNE

		# get doctor info from source database (ARIA)
		$Doctor = $Doctor->getDoctorInfoFromSourceDB();

		# insert doctor into our database
		$Doctor = $Doctor->insertDoctorIntoOurDB();

		# get serial
		my $doctorSer = $Doctor->getDoctorSer();

		return $doctorSer;
	}
}

# To exit/return always true (for the module itself)
1;	
