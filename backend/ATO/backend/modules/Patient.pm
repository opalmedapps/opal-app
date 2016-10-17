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

#---------------------------------------------------------------------------------
# Connect to the databases
#---------------------------------------------------------------------------------
my $sourceDatabase	= $Database::sourceDatabase;
my $SQLDatabase		= $Database::targetDatabase;

#====================================================================================
# Constructor for our Patient class 
#====================================================================================
sub new
{
	my $class = shift;
	my $patient = {
		_ser		=> undef,
		_ariaser	=> undef,
		_lastupdated	=> undef,
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
# Subroutine to set the patient aria serial
#======================================================================================
sub setPatientAriaSer
{
	my ($patient, $ariaser) = @_; # patient object with provided serial in arguments
	$patient->{_ariaser} = $ariaser; # set the serial
	return $patient->{_ariaser};
}

#======================================================================================
# Subroutine to set the patient last updated
#======================================================================================
sub setPatientLastUpdated
{
	my ($patient, $lastupdated) = @_; # patient object with provided datetime in arguments
	$patient->{_lastupdated} = $lastupdated; # set the datetime
	return $patient->{_lastupdated};
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
# Subroutine to get the patient aria serial
#======================================================================================
sub getPatientAriaSer
{
	my ($patient) = @_; # our patient object
	return $patient->{_ariaser};
}

#======================================================================================
# Subroutine to get the patient last updated
#======================================================================================
sub getPatientLastUpdated
{
	my ($patient) = @_; # our patient object
	return $patient->{_lastupdated};
}

#======================================================================================
# Subroutine to get patients marked for update
#======================================================================================
sub getPatientsMarkedForUpdate
{
	my @patientList = (); # initialize list of patient objects
	my ($ser, $ariaser, $lastupdated);
	
	# Query
	my $patients_sql = "
		SELECT DISTINCT
			Patient.PatientSerNum,
			Patient.PatientAriaSer,
			PatientControl.LastTransferred
		FROM
			Patient,
			PatientControl
		WHERE
			Patient.PatientSerNum	= PatientControl.PatientSerNum
		AND	Patient.PatientAriaSer	!= 0
        AND PatientControl.PatientUpdate = 1
	";

	# prepare query
	my $query = $SQLDatabase->prepare($patients_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;

	while (my @data = $query->fetchrow_array()) {

		my $Patient = new Patient(); # patient object

		$ser		= $data[0];
		$ariaser	= $data[1];
		$lastupdated	= $data[2];

		# set patient infomation
		$Patient->setPatientSer($ser);
		$Patient->setPatientAriaSer($ariaser);
		$Patient->setPatientLastUpdated($lastupdated);

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
			LastTransferred	= '$current_datetime'
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

