#!/usr/bin/perl

#---------------------------------------------------------------------------------
# A.Joseph 07-Aug-2015 ++ File: Patient.pm
#---------------------------------------------------------------------------------
# Perl module that creates a patient class. This module calls a constructor to 
# create a patient object that contains patient information stored as object 
# variables.
#
# There exists various subroutines to set patient information and compare patient
# information between two patient objects. 
# There exists various subroutines that use the Database.pm module to update the
# MySQL database.

package Patient; # Declare package name

use Exporter; # To export subroutines and variables
use Database; # Use our custom database module Database.pm
use Time::Piece; 
use Storable qw(dclone); # for deep copies
use Data::Dumper;

#---------------------------------------------------------------------------------
# Connect to the database
#---------------------------------------------------------------------------------
my $SQLDatabase		= $Database::targetDatabase;

#====================================================================================
# Constructor for our Patient class 
#====================================================================================
sub new
{
	my $class = shift;
	my $patient = {
		_ser		    => undef,
        _userser        => undef,
        _sourcedbser    => undef,
		_sourceuid	    => undef,
        _id             => undef,
        _id2            => undef,
        _firstname      => undef,
        _lastname       => undef,
        _sex            => undef,
        _dob            => undef,
        _picture        => undef,
        _ssn            => undef,
		_lasttransfer	=> undef,
	};
	# bless associates an object with a class so Perl knows which package to search for
	# when a method is envoked on this object
	bless $patient, $class; 
	return $patient;
}

#======================================================================================
# Subroutine to set the patient serial
#======================================================================================
sub setPatientSer
{
	my ($patient, $ser) = @_; # patient object with provided serial in arguments
	$patient->{_ser} = $ser; # set the serial
	return $patient->{_ser};
}

#======================================================================================
# Subroutine to set the patient user serial
#======================================================================================
sub setPatientUserSer
{
	my ($patient, $userser) = @_; # patient object with provided serial in arguments
	$patient->{_userser} = $userser; # set the serial
	return $patient->{_userser};
}

#======================================================================================
# Subroutine to set the patient source db serial
#======================================================================================
sub setPatientSourceDatabaseSer
{
	my ($patient, $sourcedbser) = @_; # patient object with provided serial in arguments
	$patient->{_sourcedbser} = $sourcedbser; # set the serial
	return $patient->{_sourcedbser};
}

#======================================================================================
# Subroutine to set the patient source uid
#======================================================================================
sub setPatientSourceUID
{
	my ($patient, $sourceuid) = @_; # patient object with provided serial in arguments
	$patient->{_sourceuid} = $sourceuid; # set the serial
	return $patient->{_sourceuid};
}

#======================================================================================
# Subroutine to set the patient id
#======================================================================================
sub setPatientId
{
	my ($patient, $id) = @_; # patient object with provided id in arguments
	$patient->{_id} = $id; # set the id
	return $patient->{_id};
}

#======================================================================================
# Subroutine to set the patient id2
#======================================================================================
sub setPatientId2
{
	my ($patient, $id2) = @_; # patient object with provided id in arguments
	$patient->{_id2} = $id2; # set the id
	return $patient->{_id2};
}

#======================================================================================
# Subroutine to set the patient first name
#======================================================================================
sub setPatientFirstName
{
	my ($patient, $firstname) = @_; # patient object with provided name in arguments
	$patient->{_firstname} = $firstname; # set the name
	return $patient->{_firstname};
}

#======================================================================================
# Subroutine to set the patient last name
#======================================================================================
sub setPatientLastName
{
	my ($patient, $lastname) = @_; # patient object with provided name in arguments
	$patient->{_lastname} = $lastname; # set the name
	return $patient->{_lastname};
}

#======================================================================================
# Subroutine to set the patient date of birth
#======================================================================================
sub setPatientDOB
{
	my ($patient, $dob) = @_; # patient object with provided date in arguments
	$patient->{_dob} = $dob; # set the date
	return $patient->{_dob};
}

#======================================================================================
# Subroutine to set the patient sex
#======================================================================================
sub setPatientSex
{
	my ($patient, $sex) = @_; # patient object with provided sex in arguments
	$patient->{_sex} = $sex; # set the sex
	return $patient->{_sex};
}

#======================================================================================
# Subroutine to set the patient picture
#======================================================================================
sub setPatientPicture
{
	my ($patient, $picture) = @_; # patient object with provided picture in arguments
	$patient->{_picture} = $picture; # set the picture
	return $patient->{_picture};
}

#======================================================================================
# Subroutine to set the patient ssn
#======================================================================================
sub setPatientSSN
{
	my ($patient, $ssn) = @_; # patient object with provided ssn in arguments
	$patient->{_ssn} = $ssn; # set the ssn
	return $patient->{_ssn};
}

#======================================================================================
# Subroutine to set the patient last transfer
#======================================================================================
sub setPatientLastTransfer
{
	my ($patient, $lasttransfer) = @_; # patient object with provided datetime in arguments
	$patient->{_lasttransfer} = $lasttransfer; # set the datetime
	return $patient->{_lasttransfer};
}

#======================================================================================
# Subroutine to get the patient serial
#======================================================================================
sub getPatientSer
{
	my ($patient) = @_; # our patient object
	return $patient->{_ser};
}

#======================================================================================
# Subroutine to get the patient user serial
#======================================================================================
sub getPatientUserSer
{
	my ($patient) = @_; # our patient object
	return $patient->{_userser};
}

#======================================================================================
# Subroutine to get the patient source db serial
#======================================================================================
sub getPatientSourceDatabaseSer
{
	my ($patient) = @_; # our patient object
	return $patient->{_sourcedbser};
}

#======================================================================================
# Subroutine to get the patient source uid
#======================================================================================
sub getPatientSourceUID
{
	my ($patient) = @_; # our patient object
	return $patient->{_sourceuid};
}

#======================================================================================
# Subroutine to get the patient id
#======================================================================================
sub getPatientId
{
	my ($patient) = @_; # our patient object
	return $patient->{_id};
}

#======================================================================================
# Subroutine to get the patient id2
#======================================================================================
sub getPatientId2
{
	my ($patient) = @_; # our patient object
	return $patient->{_id2};
}

#======================================================================================
# Subroutine to get the patient first name
#======================================================================================
sub getPatientFirstName
{
	my ($patient) = @_; # our patient object
	return $patient->{_firstname};
}

#======================================================================================
# Subroutine to get the patient last name
#======================================================================================
sub getPatientLastName
{
	my ($patient) = @_; # our patient object
	return $patient->{_lastname};
}

#======================================================================================
# Subroutine to get the patient date of birth
#======================================================================================
sub getPatientDOB
{
	my ($patient) = @_; # our patient object
	return $patient->{_dob};
}

#======================================================================================
# Subroutine to get the patient sex
#======================================================================================
sub getPatientSex
{
	my ($patient) = @_; # our patient object
	return $patient->{_sex};
}

#======================================================================================
# Subroutine to get the patient picture
#======================================================================================
sub getPatientPicture
{
	my ($patient) = @_; # our patient object
	return $patient->{_picture};
}

#======================================================================================
# Subroutine to get the patient ssn
#======================================================================================
sub getPatientSSN
{
	my ($patient) = @_; # our patient object
	return $patient->{_ssn};
}

#======================================================================================
# Subroutine to get the patient last transfer
#======================================================================================
sub getPatientLastTransfer
{
	my ($patient) = @_; # our patient object
	return $patient->{_lasttransfer};
}

#======================================================================================
# Subroutine to get all patient info from source dbs
#======================================================================================
sub getPatientInfoFromSourceDBs 
{
    my ($Patient) = @_; # our patient object

    my @patientList = (); # initialize a list 

    my $patientSSN      = $Patient->getPatientSSN(); # retreive the ssn
    my $lastTransfer    = $Patient->getPatientLastTransfer();
    #my $patientUserSer  = $Patient->getPatientUserSer();
    

	#=========================================================================================
	# Retrieve all patient info 
	#=========================================================================================
    # ARIA, for now only...
    my $sourceDBSer = 1; # ARIA
    my $sourceDatabase = Database::connectToSourceDatabase($sourceDBSer);
    my $sourcePatient  = undef;

    my $patientInfo_sql = "
        SELECT DISTINCT 
            pt.PatientSer,
            pt.FirstName,
            pt.LastName,
            pt.PatientId,
            pt.PatientId2,
            pt.DateOfBirth,
            ph.Picture,
            pt.Sex
        FROM 
            variansystem.dbo.Patient pt,
            variansystem.dbo.Photo ph
        WHERE
            pt.SSN              LIKE '$patientSSN%'
        AND pt.PatientSer       = ph.PatientSer
        --AND pt.HstryDateTime    > '$lastTransfer' 
    ";

	# prepare query
	my $query = $sourceDatabase->prepare($patientInfo_sql)
	    or die "Could not prepare query: " . $sourceDatabase->errstr;

    # execute query
    $query->execute()
        or die "Could not execute query: " . $query->errstr;

    while (my @data = $query->fetchrow_array()) {
    
        $sourcePatient  = new Patient();

        my $sourceuid      = $data[0];
        my $firstname      = $data[1];
        my $lastname       = $data[2];
        my $id             = $data[3];
        my $id2            = $data[4];
        my $dob            = convertDateTime($data[5]);
        my $picture        = $data[6];
        my $sex            = $data[7];

        # set the information
        $sourcePatient->setPatientSSN($patientSSN);
        $sourcePatient->setPatientLastTransfer($lastTransfer);
        #$sourcePatient->setPatientUserSer($patientUserSer);

        $sourcePatient->setPatientSourceUID($sourceuid);
        $sourcePatient->setPatientSourceDatabaseSer($sourceDBSer);
        $sourcePatient->setPatientFirstName($firstname);
        $sourcePatient->setPatientLastName($lastname);
        $sourcePatient->setPatientId($id);
        $sourcePatient->setPatientId2($id2);
        $sourcePatient->setPatientDOB($dob);
        $sourcePatient->setPatientPicture($picture);
        $sourcePatient->setPatientSex($sex);
    }

    if ($sourcePatient) {push(@patientList, $sourcePatient);}

    # db disconnect
    $sourceDatabase->disconnect();

    #--------------------------------------------------------------------------
    # Uncomment if necessary. Same patient info, no need to have multiple patient entries
    # from multiple databases. But uncomment if necessary.
=pod
    # WaitRoomManagement
    my $sourceDBSer = 2; # WaitRoomManagement
    my $sourceDatabase = Database::connectToSourceDatabase($sourceDBSer);
    my $sourcePatient  = undef;

    my $patientInfo_sql = "
        SELECT DISTINCT 
            pt.PatientSerNum,
            pt.FirstName,
            pt.LastName,
            pt.PatientId
        FROM
            Patient pt
        WHERE
            pt.SSN      LIKE '$patientSSN%'
    ";    $currentFile = __FILE__; // Get location of this script

    // Find config file based on this location 
    $configFile = substr($currentFile, 0, strpos($currentFile, "ATO")) . "ATO/php/config.php";
	// Include config file 
	include_once($configFile);


	# prepare query
	my $query = $sourceDatabase->prepare($patientInfo_sql)
	    or die "Could not prepare query: " . $sourceDatabase->errstr;

    # execute query
    $query->execute()
        or die "Could not execute query: " . $query->errstr;

    while (my @data = $query->fetchrow_array()) {

        $sourcePatient  = new Patient();

        my $sourceuid      = $data[0];
        my $firstname      = $data[1];
        my $lastname       = $data[2];
        my $id             = $data[3];

        $sourcePatient->setPatientSSN($patientSSN);
        $sourcePatient->setPatientLastTransfer($lastTransfer);
        $sourcePatient->setPatientUserSer($patientUserSer);

        $sourcePatient->setPatientSourceUID($sourceuid);
        $sourcePatient->setPatientSourceDatabaseSer($sourceDBSer);
        $sourcePatient->setPatientFirstName($firstname);
        $sourcePatient->setPatientLastName($lastname);
        $sourcePatient->setPatientId($id);
    }

    if ($sourcePatient) {push(@patientList, $sourcePatient);}

    # db disconnect
    $sourceDatabase->disconnect();
=cut

    return @patientList;

}

#======================================================================================
# Subroutine to get patients marked for update
#======================================================================================
sub getPatientsMarkedForUpdate
{
	my @patientList = (); # initialize list of patient objects
	my ($lasttransfer, $ssn);
	
	# Query
	my $patients_sql = "
		SELECT DISTINCT
			PatientControl.LastTransferred,
            Patient.SSN
		FROM
			PatientControl,
            Patient
		WHERE
            PatientControl.PatientUpdate        = 1
        AND Patient.PatientSerNum               = PatientControl.PatientSerNum
	";

	# prepare query
	my $query = $SQLDatabase->prepare($patients_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;

	while (my @data = $query->fetchrow_array()) {

		my $Patient = new Patient(); # patient object

		$lasttransfer	= $data[0];
        $ssn            = $data[1];

		# set patient infomation
		$Patient->setPatientLastTransfer($lasttransfer);
        $Patient->setPatientSSN($ssn);

		push(@patientList, $Patient);
	}

	return @patientList;
}

#======================================================================================
# Subroutine to set/update the "last transferred" field to current time 
#======================================================================================
sub setPatientLastTransferredIntoOurDB
{
	my ($current_datetime) = @_; # current datetime in args

	my $update_sql = "

		UPDATE 
			PatientControl
		SET
			LastTransferred	= '$current_datetime',
            LastUpdated     = LastUpdated
		WHERE
			PatientUpdate 	= 1
	";

	# prepare query
	my $query = $SQLDatabase->prepare($update_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;
}

#======================================================================================
# Subroutine to check if our patient exists in our MySQL db
#	@return: patient object (if exists) .. NULL otherwise
#======================================================================================
sub inOurDatabase
{
    my ($patient) = @_; # our patient object

    my $ssn             = $patient->getPatientSSN();
    my $lastTransfer    = $patient->getPatientLastTransfer();
    my $sourcedbser     = $patient->getPatientSourceDatabaseSer();


    my $PatientSSNInDB = 0; # false by default. Will be true if patient exists
	my $ExistingPatient = (); # data to be entered if patient exists

	# for query results
    my ($ser, $sourceuid, $id, $id2, $firstname, $lastname, $sex, $dob, $picture);
 
    my $inDB_sql = "
        SELECT DISTINCT
            Patient.PatientSerNum,
            Patient.PatientAriaSer,
            Patient.PatientId,
            Patient.PatientId2,
            Patient.FirstName,
            Patient.LastName,
            Patient.Sex,
            Patient.DateOfBirth,
            Patient.ProfileImage,
            Patient.SSN
        FROM
            Patient
        WHERE
            Patient.SSN     = '$ssn'
    ";
	# prepare query
	my $query = $SQLDatabase->prepare($inDB_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;

	while (my @data = $query->fetchrow_array()) {

        $ser                    = $data[0];
        $sourceuid              = $data[1];
        $id                     = $data[2];
        $id2                    = $data[3];
        $firstname              = $data[4];
        $lastname               = $data[5];
        $sex                    = $data[6];
        $dob                    = $data[7];
        $picture                = $data[8];
        $PatientSSNInDB         = $data[9];
    }

    if ($PatientSSNInDB) {

        $ExistingPatient = new Patient(); # initialze patient object

        $ExistingPatient->setPatientSer($ser);
        $ExistingPatient->setPatientSourceUID($sourceuid);
        $ExistingPatient->setPatientId($id);
        $ExistingPatient->setPatientId2($id2);
        $ExistingPatient->setPatientFirstName($firstname);
        $ExistingPatient->setPatientLastName($lastname);
        $ExistingPatient->setPatientSex($sex);
        $ExistingPatient->setPatientDOB($dob);
        $ExistingPatient->setPatientPicture($picture);
        $ExistingPatient->setPatientLastTransfer($lastTransfer);
        $ExistingPatient->setPatientSSN($PatientSSNInDB);
        $ExistingPatient->setPatientSourceDatabaseSer($sourcedbser);

        return $ExistingPatient; # this is true (ie. patient exists, return object)
	}

	else {return $ExistingPatient;} # this is false (ie. patient DNE, return empty)
}
    
#======================================================================================
# Subroutine to insert our patient info in our database
#======================================================================================
sub insertPatientIntoOurDB
{
	my ($patient) = @_; # our patient object to insert

	# Retrieve all the neccesary details from this object
    my $sourceuid           = $patient->getPatientSourceUID();
    my $id                  = $patient->getPatientId();
    my $id2                 = $patient->getPatientId2();
    my $firstname           = $patient->getPatientFirstName();
    my $lastname            = $patient->getPatientLastName();
    my $sex                 = $patient->getPatientSex();
    my $dob                 = $patient->getPatientDOB();
    my $picture             = $patient->getPatientPicture();

    my $insert_sql = "
        INSERT INTO
            Patient (
                PatientAriaSer,
                PatientId,
                PatientId2,
                FirstName,
                LastName,
                Sex,
                DateOfBirth,
                ProfileImage
            )
        VALUES (
            '$sourceuid',
            '$id',
            '$id2',
            \"$firstname\",
            \"$lastname\",
            '$sex',
            '$dob',
            '$picture'
        )
    ";

	# prepare query
	my $query = $SQLDatabase->prepare($insert_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;

	# Retrieve the PatientSer
	my $ser = $SQLDatabase->last_insert_id(undef, undef, undef, undef);

	# Set the Serial in our patient object
	$patient->setPatientSer($ser);

	return $patient;
}
    
#======================================================================================
# Subroutine to update our database with the patient's updated info
#======================================================================================
sub updateDatabase
{
    my ($patient) = @_; # our patient object to update

    my $patientId           = $patient->getPatientId();
    my $patientId2          = $patient->getPatientId2();
    my $patientFirstName    = $patient->getPatientFirstName();
    my $patientLastName     = $patient->getPatientLastName();
    my $patientDOB          = $patient->getPatientDOB();
    my $patientPicture      = $patient->getPatientPicture();
    my $patientSex          = $patient->getPatientSex();
    my $patientSSN          = $patient->getPatientSSN();

    my $update_sql = "
        UPDATE
            Patient
        SET
            PatientId               = '$patientId',
            PatientId2              = '$patientId2',
            FirstName               = \"$patientFirstName\",
            LastName                = \"$patientLastName\",
            Sex                     = '$patientSex',
            DateOfBirth             = '$patientDOB',
            ProfileImage            = '$patientPicture'
        WHERE
            SSN                     = '$patientSSN'
    ";

    #print "$update_sql\n";
 	# prepare query
	my $query = $SQLDatabase->prepare($update_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;

}

#======================================================================================
# Subroutine to compare two patient objects. If different, use setter funtions
# to update patient object.
#======================================================================================
sub compareWith
{
	my ($SuspectPatient, $OriginalPatient) = @_; # our two patient objects from arguments
	my $UpdatedPatient = dclone($OriginalPatient); 

	# retrieve parameters
	# Suspect Patient...
	my $SPatientId			= $SuspectPatient->getPatientId();
	my $SPatientId2			= $SuspectPatient->getPatientId2();
	my $SPatientDOB			= $SuspectPatient->getPatientDOB();
	my $SPatientSex			= $SuspectPatient->getPatientSex();
    my $SPatientFirstName   = $SuspectPatient->getPatientFirstName();
    my $SPatientLastName    = $SuspectPatient->getPatientLastName();
    my $SPatientPicture     = $SuspectPatient->getPatientPicture();
	
	# Original Patient...	
	my $OPatientId			= $OriginalPatient->getPatientId();
	my $OPatientId2			= $OriginalPatient->getPatientId2();
	my $OPatientDOB			= $OriginalPatient->getPatientDOB();
	my $OPatientSex			= $OriginalPatient->getPatientSex();
    my $OPatientFirstName   = $OriginalPatient->getPatientFirstName();
    my $OPatientLastName    = $OriginalPatient->getPatientLastName();
    my $OPatientPicture     = $OriginalPatient->getPatientPicture();

	# go through each parameter
	if ($SPatientId ne $OPatientId) {

		print "Patient ID has changed from $OPatientId to $SPatientId!\n";
		my $updatedId = $UpdatedPatient->setPatientId($SPatientId); # update patient id
		print "Will update database entry to '$updatedId'.\n";
	}
	if ($SPatientId2 ne $OPatientId2) {

		print "Patient ID2 has changed from $OPatientId2 to $SPatientId2!\n";
		my $updatedId2 = $UpdatedPatient->setPatientId2($SPatientId2); # update patient id2
		print "Will update database entry to \"$updatedId2\".\n";
	}	
	if ($SPatientDOB ne $OPatientDOB) {

		print "Patient Date of Birth has changed from $OPatientDOB to $SPatientDOB!\n";
		my $updatedDOB = $UpdatedPatient->setPatientDOB($SPatientDOB); # update patient date of birth
		print "Will update database entry to \"$updatedDOB\".\n";
	}
	if ($SPatientSex ne $OPatientSex) {

		print "Patient Sex has changed from $OPatientSex to $SPatientSex!\n";
		my $updatedSex = $UpdatedPatient->setPatientSex($SPatientSex); # update patient sex
		print "Will update database entry to \"$updatedSex\".\n";
	}
	if ($SPatientFirstName ne $OPatientFirstName) {

		print "Patient First Name has changed from $OPatientFirstName to $SPatientFirstName!\n";
		my $updatedFirstName = $UpdatedPatient->setPatientFirstName($SPatientFirstName); # update patient first name
		print "Will update database entry to \"$updatedFirstName\".\n";
	}
	if ($SPatientLastName ne $OPatientLastName) {

		print "Patient Last Name has changed from $OPatientLastName to $SPatientLastName!\n";
		my $updatedLastName = $UpdatedPatient->setPatientLastName($SPatientLastName); # update patient last name
		print "Will update database entry to \"$updatedLastName\".\n";
	}
	if ($SPatientPicture ne $OPatientPicture) {

		print "Patient Picture has changed from $OPatientPicture to $SPatientPicture!\n";
		my $updatedPicture = $UpdatedPatient->setPatientPicture($SPatientPicture); # update patient picture
		print "Will update database entry to \"$updatedPicture\".\n";
	}
	
	return $UpdatedPatient;
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

#exit module 
1;
