#!/usr/bin/perl
#---------------------------------------------------------------------------------
# A.Joseph 07-Aug-2015 ++ File: PatientDoctor.pm
#---------------------------------------------------------------------------------
# Perl module that creates a patientdoctor (PD) class. This module calls a constructor to 
# create a PD object that contains PD information stored as object variables.
#
# There exists various subroutines to set PD information, get PD information
# and compare PD information between two PD objects. 
# There exists various subroutines that use the Database.pm module to update the
# MySQL database and check if a PD exists already in this database.

package PatientDoctor; # Declare package name

use Exporter; # To export subroutines and variables
use Database; # Use our custom database module Database.pm
use Time::Piece; # To parse and convert date time
use Storable qw(dclone); # for deep copies

use Patient; # Our patient module
use Doctor; # Our Doctor module

#---------------------------------------------------------------------------------
# Connect to the databases
#---------------------------------------------------------------------------------
my $SQLDatabase		= $Database::targetDatabase;

#====================================================================================
# Constructor for our PatientDoctor class 
#====================================================================================
sub new
{
	my $class = shift;
	my $patientdoctor = {
		_ser		    => undef,
		_patientser	    => undef,
		_doctorser	    => undef,
		_oncflag	    => undef,
		_primaryflag	=> undef,
	};
	# bless associates an object with a class so Perl knows which package to search for
	# when a method is envoked on this object
	bless $patientdoctor, $class;
	return $patientdoctor;
}

#====================================================================================
# Subroutine to set the PD serial
#====================================================================================
sub setPatientDoctorSer
{
	my ($patientdoctor, $ser) = @_; # PD object with provided serial in arguments
	$patientdoctor->{_ser} = $ser; # set the ser
	return $patientdoctor->{_ser};
}

#====================================================================================
# Subroutine to set the PD patient serial
#====================================================================================
sub setPatientDoctorPatientSer
{
	my ($patientdoctor, $patientser) = @_; # PD object with provided patient serial in arguments
	$patientdoctor->{_patientser} = $patientser; # set the patientser
	return $patientdoctor->{_patientser};
}

#====================================================================================
# Subroutine to set the PD doctor serial
#====================================================================================
sub setPatientDoctorDoctorSer
{
	my ($patientdoctor, $doctorser) = @_; # PD object with provided doctor serial in arguments
	$patientdoctor->{_doctorser} = $doctorser; # set the doctor ser
	return $patientdoctor->{_doctorser};
}

#====================================================================================
# Subroutine to set the PD oncologist flag
#====================================================================================
sub setPatientDoctorOncFlag
{
	my ($patientdoctor, $oncflag) = @_; # PD object with provided flag in arguments
	$patientdoctor->{_oncflag} = $oncflag; # set the flag
	return $patientdoctor->{_oncflag};
}

#====================================================================================
# Subroutine to set the PD primary flag
#====================================================================================
sub setPatientDoctorPrimaryFlag
{
	my ($patientdoctor, $primaryflag) = @_; # PD object with provided flag in arguments
	$patientdoctor->{_primaryflag} = $primaryflag; # set the flag
	return $patientdoctor->{_primaryflag};
}

#====================================================================================
# Subroutine to get the PD ser
#====================================================================================
sub getPatientDoctorSer
{
	my ($patientdoctor) = @_; # our PD object
	return $patientdoctor->{_ser};
}

#====================================================================================
# Subroutine to get the PD patient ser
#====================================================================================
sub getPatientDoctorPatientSer
{
	my ($patientdoctor) = @_; # our PD object
	return $patientdoctor->{_patientser};
}

#====================================================================================
# Subroutine to get the PD doctor ser
#====================================================================================
sub getPatientDoctorDoctorSer
{
	my ($patientdoctor) = @_; # our PD object
	return $patientdoctor->{_doctorser};
}

#====================================================================================
# Subroutine to get the PD oncologist flag
#====================================================================================
sub getPatientDoctorOncFlag
{
	my ($patientdoctor) = @_; # our PD object
	return $patientdoctor->{_oncflag};
}

#====================================================================================
# Subroutine to get the PD primary flag
#====================================================================================
sub getPatientDoctorPrimaryFlag
{
	my ($patientdoctor) = @_; # our PD object
	return $patientdoctor->{_primaryflag};
}

#====================================================================================
# Subroutine to get all PD's from the ARIA db
#====================================================================================
sub getPatientDoctorsFromSourceDB
{
	my (@patientList) = @_; # a patient list from args 
	my @PDList = (); # initialize a list for PD objects

	# for query results
	my ($doctorsernum, $oncflag, $primaryflag);
	
	foreach my $Patient (@patientList) {

		my $patientSer		    = $Patient->getPatientSer();
		my $patientSourceUID	= $Patient->getPatientSourceUID(); 
        my $sourceDBSer         = $Patient->getPatientSourceDatabaseSer();
		my $lastTransfer	    = $Patient->getPatientLastTransfer();

        # ARIA
        if ($sourceDBSer eq 1) {

            my $sourceDatabase = Database::connectToSourceDatabase($sourceDBSer);
    		my $pd_sql = "
	    		SELECT DISTINCT
		    		dr.ResourceSer,
			    	pd.OncologistFlag,
				    pd.PrimaryFlag
    			FROM	
	    			variansystem.dbo.Doctor dr,
		    		variansystem.dbo.PatientDoctor pd
			    WHERE
    				pd.PatientSer	    = '$patientSourceUID'
	    		AND	dr.ResourceSer	    = pd.ResourceSer
		    	AND	pd.HstryDateTime	> '$lastTransfer'
    		";  
    
	    	# prepare query
		    my $query = $sourceDatabase->prepare($pd_sql)
			    or die "Could not prepare query: " . $sourceDatabase->errstr;
        
    		# execute query
	        $query->execute()
		    	or die "Could not execute query: " . $query->errstr;

    		while (my @data = $query->fetchrow_array()) {
	
	    		my $patientdoctor = new PatientDoctor(); # new PD object
	    
		    	$doctorsernum	= Doctor::reassignDoctor($data[0], $sourceDBSer);
			    $oncflag	    = $data[1];
    			$primaryflag	= $data[2];
	    
		    	# set PD information
			    $patientdoctor->setPatientDoctorPatientSer($patientSer);
    			$patientdoctor->setPatientDoctorDoctorSer($doctorsernum);
	    		$patientdoctor->setPatientDoctorOncFlag($oncflag);
		    	$patientdoctor->setPatientDoctorPrimaryFlag($primaryflag);
    	
	    		push(@PDList, $patientdoctor);
		    }
        }
	}

	return @PDList;
}

#====================================================================================
# Subroutine to get all patient's primary doctors given a patient serial
#====================================================================================
sub getPatientsDoctorsFromOurDB
{
    my ($patientSer) = @_; # args

    my @doctors = (); # initialize a list

    my $select_sql = "
        SELECT DISTINCT 
            dr.DoctorAriaSer
        FROM
            PatientDoctor pd,
            Doctor dr
        WHERE
            pd.PatientSerNum        = '$patientSer'
        AND pd.DoctorSerNum         = dr.DoctorSerNum
        AND pd.OncologistFlag       = 1
        AND pd.PrimaryFlag          = 1
    ";

    # prepare query
	my $query = $SQLDatabase->prepare($select_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;

	while (my @data = $query->fetchrow_array()) {
        push(@doctors, $data[0]);
    }

    return @doctors;
}

#======================================================================================
# Subroutine to check if a particular PD exists in our MySQL db
#	@return: PD object (if exists) .. NULL otherwise
#======================================================================================
sub inOurDatabase
{
	my ($patientdoctor) = @_; # our PD object 
	my $patientSer = $patientdoctor->getPatientDoctorPatientSer();
	my $doctorSer = $patientdoctor->getPatientDoctorDoctorSer();

	my $PDSerInDB = 0; # false by default. Will be true if PD exists
	my $ExistingPD = (); # data to be entered if PD exists

	# Other PD variables, if it exists
	my ($oncflag, $primaryflag);

	my $inDB_sql = "
		SELECT
			PatientDoctor.PatientDoctorSerNum,
			PatientDoctor.OncologistFlag,
			PatientDoctor.PrimaryFlag
		FROM
			PatientDoctor
		WHERE
			PatientDoctor.PatientSerNum	= $patientSer
		AND	PatientDoctor.DoctorSerNum	= $doctorSer
	";

	# prepare query
	my $query = $SQLDatabase->prepare($inDB_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;
	
	while (my @data = $query->fetchrow_array()) {

		$PDSerInDB		= $data[0];
		$oncflag		= $data[1];
		$primaryflag		= $data[2];

	}

	if ($PDSerInDB) {
		$ExistingPD = new PatientDoctor(); # initialize PD object

		$ExistingPD->setPatientDoctorSer($PDSerInDB);
		$ExistingPD->setPatientDoctorPatientSer($patientSer);
		$ExistingPD->setPatientDoctorDoctorSer($doctorSer);
		$ExistingPD->setPatientDoctorOncFlag($oncflag);
		$ExistingPD->setPatientDoctorPrimaryFlag($primaryflag);
		
		return $ExistingPD; # this is truthful (ie. PD exists, return object)
	}
	
	else {return $ExistingPD;} # this is falseful (ie. PD DNE, return empty)
}

#======================================================================================
# Subroutine to insert our PD info in our database
#======================================================================================
sub insertPatientDoctorIntoOurDB
{
	my ($patientdoctor) = @_; # our PD object to insert
	
	my $patientSer 		= $patientdoctor->getPatientDoctorPatientSer();
	my $doctorSer		= $patientdoctor->getPatientDoctorDoctorSer();
	my $oncflag		= $patientdoctor->getPatientDoctorOncFlag();
	my $primaryflag		= $patientdoctor->getPatientDoctorPrimaryFlag();

	my $insert_sql = "
		INSERT INTO 
			PatientDoctor (
				PatientDoctorSerNum, 
				PatientSerNum, 
				DoctorSerNum, 
				OncologistFlag, 
				PrimaryFlag, 
				LastUpdated
			)
		VALUES (
			NULL,
			'$patientSer',
			'$doctorSer',
			'$oncflag',
			'$primaryflag',
			NULL
		)
	";
	# prepare query
	my $query = $SQLDatabase->prepare($insert_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;

	return $patientdoctor;
}

#======================================================================================
# Subroutine to update our database with the patientdoctor's updated info
#======================================================================================
sub updateDatabase
{
	my ($patientdoctor) = @_; # our PD object to update

	my $patientSer 		= $patientdoctor->getPatientDoctorPatientSer();
	my $doctorSer		= $patientdoctor->getPatientDoctorDoctorSer();
	my $oncflag		= $patientdoctor->getPatientDoctorOncFlag();
	my $primaryflag		= $patientdoctor->getPatientDoctorPrimaryFlag();

	my $update_sql = "
		UPDATE
			PatientDoctor
		SET
			OncologistFlag	= '$oncflag',
			PrimaryFlag	= '$primaryflag'
		WHERE
			PatientSerNum	= '$patientSer'
		AND	DoctorSerNum	= '$doctorSer'
	";

	# prepare query
	my $query = $SQLDatabase->prepare($update_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;
}

#======================================================================================
# Subroutine to compare two PD objects. If different, use setter functions
# to update PD object.
#======================================================================================
sub compareWith
{
	my ($SuspectPD, $OriginalPD) = @_; # our two PD objects from arguments 
	my $UpdatedPD = dclone($OriginalPD);

	# retrieve parameters...
	# suspect patient doctor
	my $Soncflag		= $SuspectPD->getPatientDoctorOncFlag();
	my $Sprimaryflag	= $SuspectPD->getPatientDoctorPrimaryFlag();

	# original patient doctor...
	my $Ooncflag		= $OriginalPD->getPatientDoctorOncFlag();
	my $Oprimaryflag	= $OriginalPD->getPatientDoctorPrimaryFlag();

	# go through each parameter
	if ($Soncflag ne $Ooncflag) {

		print "PatientDoctor Oncologist Flag has changed from '$Ooncflag' to '$Soncflag'\n";
		my $updatedOncFlag = $UpdatedPD->setPatientDoctorOncFlag($Soncflag); # update
		print "Will update database entry to '$updatedOncFlag'.\n";
	}
	if ($Sprimaryflag ne $Oprimaryflag) {

		print "PatientDoctor Primary Flag has changed from '$Oprimaryflag' to '$Sprimaryflag'\n";
		my $updatedPrimaryFlag = $UpdatedPD->setPatientDoctorPrimaryFlag($Sprimaryflag); # update
		print "Will update database entry to '$updatedPrimaryFlag'.\n";
	}

	return $UpdatedPD;
}



# To exit/return always true (for the module itself)
1;		
