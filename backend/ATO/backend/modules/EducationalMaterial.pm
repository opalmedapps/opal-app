#!/usr/bin/perl
#---------------------------------------------------------------------------------
# A.Joseph 06-May-2016 ++ File: EducationalMaterial.pm
#---------------------------------------------------------------------------------
# Perl module that creates an educational material class. This module calls a 
# constructor to create an edumat object that contains edumat information stored
# as object variables.
#
# There exists various subroutines to set and get edumat information and compare
# edumat information between two edumat objects.

package EducationalMaterial; # Declaring package name 

use Database; # Our custom database module
use Time::Piece; # perl module
use Array::Utils qw(:all);
use POSIX; # perl module

use Patient; # Our custom patient module
use PatientDoctor; # PatientDoctor.pm
use Alias; # Alias.pm
use ResourceAppointment; # ResourceAppointment.pm
use Diagnosis; # Diagnosis.pm
use Appointment; # Our custom appointment module
use Filter; # Our custom filter module
use EducationalMaterialControl; # Our custom educatinal material control module
use PushNotification;

#---------------------------------------------------------------------------------
# Connect to the databases
#---------------------------------------------------------------------------------
my $SQLDatabase		= $Database::targetDatabase;

#====================================================================================
# Constructor for our edumat class 
#====================================================================================
sub new
{
    my $class = shift;
    my $edumat = {
        _ser                => undef,
        _patientser         => undef,
        _edumatcontrolser   => undef,
        _readstatus         => undef,
    };

    # bless associates an object with a class so Perl knows which package to search for
	# when a method is envoked on this object
    bless $edumat, $class;
    return $edumat;
}

#====================================================================================
# Subroutine to set the Educational Material Serial
#====================================================================================
sub setEduMatSer
{
    my ($edumat, $ser) = @_; # edumat object with provided serial in args
    $edumat->{_ser} = $ser; # set the edumat ser
    return $edumat->{_ser};
}

#====================================================================================
# Subroutine to set the Educational Material Patient Serial
#====================================================================================
sub setEduMatPatientSer
{
    my ($edumat, $patientser) = @_; # edumat object with provided serial in args
    $edumat->{_patientser} = $patientser; # set the edumat ser
    return $edumat->{_patientser};
}

#====================================================================================
# Subroutine to set the Educational Material control Serial
#====================================================================================
sub setEduMatControlSer
{
    my ($edumat, $edumatcontrolser) = @_; # edumat object with provided serial in args
    $edumat->{_edumatcontrolser} = $edumatcontrolser; # set the edumat ser
    return $edumat->{_edumatcontrolser};
}

#====================================================================================
# Subroutine to set the Educational Material Read Status
#====================================================================================
sub setEduMatReadStatus
{
    my ($edumat, $readstatus) = @_; # edumat object with provided status in args
    $edumat->{_readstatus} = $readstatus; # set the edumat status
    return $edumat->{_readstatus};
}

#====================================================================================
# Subroutine to get the Educational Material Serial
#====================================================================================
sub getEduMatSer
{
	my ($edumat) = @_; # our edumat object
	return $edumat->{_ser};
}

#====================================================================================
# Subroutine to get the Educational Material Patient Serial
#====================================================================================
sub getEduMatPatientSer
{
	my ($edumat) = @_; # our edumat object
	return $edumat->{_patientser};
}

#====================================================================================
# Subroutine to get the Educational Material Control Serial
#====================================================================================
sub getEduMatControlSer
{
	my ($edumat) = @_; # our edumat object
	return $edumat->{_edumatcontrolser};
}

#====================================================================================
# Subroutine to get the Educational Material Read Status
#====================================================================================
sub getEduMatReadStatus
{
	my ($edumat) = @_; # our edumat object
	return $edumat->{_readstatus};
}

#======================================================================================
# Subroutine to publish educational materials
#======================================================================================
sub publishEducationalMaterials
{
    my (@patientList) = @_; # patient list from args

    my $today_date = strftime("%Y-%m-%d", localtime(time));
    my $now = Time::Piece->strptime(strftime("%Y-%m-%d %H:%M:%S", localtime(time)), "%Y-%m-%d %H:%M:%S");

    # Date object of today at 8AM
    my $today_at_eightAM = Time::Piece->strptime($today_date . " 08:00:00", "%Y-%m-%d %H:%M:%S");
    # Date object of today at 8PM
    my $today_at_eightPM = Time::Piece->strptime($today_date . " 20:00:00", "%Y-%m-%d %H:%M:%S");

    # If we are not within the window to publish the messages then return
    if ( (($now - $today_at_eightAM) < 0) or (($now - $today_at_eightPM) > 0) ) {return;}

    # Retrieve all the controls
    my @eduMatControls = EducationalMaterialControl::getEduMatControlsMarkedForPublish();

    foreach my $Patient (@patientList) {

        my $patientSer          = $Patient->getPatientSer(); # get patient serial

        foreach my $EduMatControl (@eduMatControls) {

            my $eduMatControlSer    = $EduMatControl->getEduMatControlSer();
            my $eduMatFilters       = $EduMatControl->getEduMatControlFilters();

            # Retrieve all patient's appointment(s) up until tomorrow
            my @patientAppointments = Appointment::getAllPatientsAppointmentsFromOurDB($patientSer);
            #if (!@patientAppointments) {next;}

            my @expressionNames = ();
            my @diagnosisNames = ();

            # we build all possible expression names, and diagnoses for each appointment found
            foreach my $appointment (@patientAppointments) {

                my $expressionSer = $appointment->getApptAliasExpressionSer();
                my $expressionName = Alias::getExpressionNameFromOurDB($expressionSer);
                push(@expressionNames, $expressionName) unless grep{$_ == $expressionName} @expressionNames;

                my $diagnosisSer = $appointment->getApptDiagnosisSer();
                my $diagnosisName = Diagnosis::getDiagnosisNameFromOurDB($diagnosisSer);
                push(@diagnosisNames, $diagnosisName) unless grep{$_ == $diagnosisName} @diagnosisNames;

            }

            my @patientDoctors = PatientDoctor::getPatientsDoctorsFromOurDB($patientSer);
                
            # Fetch expression filters (if any)
            my @expressionFilters =  $eduMatFilters->getExpressionFilters();
            if (@expressionFilters) {

                # Finding the existence of the patient expressions in the expression filters
                # If there is an intersection, then patient is part of this publishing announcement
                # If not, then continue to next announcement
                if (!intersect(@expressionFilters, @expressionNames)) {next;} 
            }

            # Fetch diagnosis filters (if any)
            my @diagnosisFilters = $eduMatFilters->getDiagnosisFilters();
            if (@diagnosisFilters) {

                # Finding the intersection of the patient's diagnosis and the diagnosis filters
                # If there is an intersection, then patient is part of this publishing announcement
                # If not, then continue to next announcement
                if (!intersect(@diagnosisFilters, @diagnosisNames)) {next;} 
            }

            # Fetch doctor filters (if any)
            my @doctorFilters = $eduMatFilters->getDoctorFilters();
            if (@doctorFilters) {

                # Finding the intersection of the patient's doctor(s) and the doctor filters
                # If there is an intersection, then patient is part of this publishing announcement
                # If not, then continue to next announcement
                if (!intersect(@doctorFilters, @patientDoctors)) {next;} 
            }

            # If we've reached this point, we've passed all catches (filter restrictions). We make
            # an educational material object, check if it exists already in the database. If it does 
            # this means the edumat has already been publish to the patient. If it doesn't
            # exist then we publish to the patient (insert into DB).
            $eduMat = new EducationalMaterial();

            # set the necessary values
            $eduMat->setEduMatPatientSer($patientSer);
            $eduMat->setEduMatControlSer($eduMatControlSer);

            if (!$eduMat->inOurDatabase()) {
    
                $eduMat = $eduMat->insertEducationalMaterialIntoOurDB();
    
                # send push notification
                my $eduMatSer = $eduMat->getEduMatSer();
                my $patientSer = $eduMat->getEduMatPatientSer();
                PushNotification::sendPushNotification($patientSer, $eduMatSer, 'EducationalMaterial');

            }

        } # End forEach Educational Material Control   

    } # End forEach Patient

}

#======================================================================================
# Subroutine to check if our edumat exists in our MySQL db
#	@return: edumat object (if exists) .. NULL otherwise
#======================================================================================
sub inOurDatabase
{
    my ($edumat) = @_; # our edumat object in args

    my $patientser          = $edumat->getEduMatPatientSer();
    my $edumatcontrolser    = $edumat->getEduMatControlSer();

    my $serInDB = 0; # false by default. Will be true if edumat exists
    my $ExistingEduMat = (); # data to be entered if edumat exists

    # Other variables, if edumat exists
    my ($readstatus);

    my $inDB_sql = "
        SELECT
            em.EducationalMaterialSerNum,
            em.ReadStatus
        FROM
            EducationalMaterial em
        WHERE
            em.PatientSerNum                    = '$patientser'
        AND em.EducationalMaterialControlSerNum = '$edumatcontrolser'
    ";

    # prepare query
	my $query = $SQLDatabase->prepare($inDB_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;
	
	while (my @data = $query->fetchrow_array()) {

        $serInDB    = $data[0];
        $readstatus = $data[1];
    }

    if ($serInDB) {

        $ExistingEduMat = new EducationalMaterial(); # initialize

        # set params
        $ExistingEduMat->setEduMatSer($serInDB);
        $ExistingEduMat->setEduMatPatientSer($patientser);
        $ExistingEduMat->setEduMatControlSer($edumatcontrolser);
        $ExistingEduMat->setEduMatReadStatus($readstatus);

        return $ExistingEduMat; # this is true (ie. edumat exists. return object)
    }

    else {return $ExistingEduMat}; # this is false (ie. edumat DNE)
}

#======================================================================================
# Subroutine to insert our educational material in our database
#======================================================================================
sub insertEducationalMaterialIntoOurDB
{
    my ($edumat) = @_; # our edumat object

    my $patientser          = $edumat->getEduMatPatientSer();
    my $edumatcontrolser    = $edumat->getEduMatControlSer();

    my $insert_sql = "
        INSERT INTO 
            EducationalMaterial (
                PatientSerNum,
                EducationalMaterialControlSerNum,
                DateAdded
            )
        VALUES (
            '$patientser',
            '$edumatcontrolser',
            NOW()
        )
    ";
        
    #print "$insert_sql\n";
    # prepare query
	my $query = $SQLDatabase->prepare($insert_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;

	# Retrieve the serial
	my $ser = $SQLDatabase->last_insert_id(undef, undef, undef, undef);

	# Set the Serial in our object
	$edumat->setEduMatSer($ser);
	
	return $edumat;
}


# Exit smoothly 
1;

