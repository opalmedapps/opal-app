#!/usr/bin/perl
#---------------------------------------------------------------------------------
# A.Joseph 03-May-2016 ++ File: Announcement.pm
#---------------------------------------------------------------------------------
# Perl module that creates an announcement class. This module calls a constructor to
# create an announcement object that contains announcement information stored as object
# variables.
#
# There exists various subroutines to set and get announcement information and compare
# announcement infomation between two announcement objects.

package Announcement; # Declaring package name

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
use PostControl; # Our custom post control module
use PushNotification;

#---------------------------------------------------------------------------------
# Connect to the databases
#---------------------------------------------------------------------------------
my $SQLDatabase		= $Database::targetDatabase;

#====================================================================================
# Constructor for our Announcement class 
#====================================================================================
sub new
{
    my $class = shift;
    my $announcement = {
        _ser            => undef,
        _patientser     => undef,
        _postcontrolser => undef,
        _readstatus     => undef,
    };

    # bless associates an object with a class so Perl knows which package to search for
	# when a method is envoked on this object
    bless $announcement, $class;
    return $announcement;
}

#====================================================================================
# Subroutine to set the Announcement Serial
#====================================================================================
sub setAnnouncementSer
{
    my ($announcement, $ser) = @_; # announcement object with provided serial in args
    $announcement->{_ser} = $ser; # set the announcement ser
    return $announcement->{_ser};
}

#====================================================================================
# Subroutine to set the Announcement Patient Serial
#====================================================================================
sub setAnnouncementPatientSer
{
    my ($announcement, $patientser) = @_; # announcement object with provided serial in args
    $announcement->{_patientser} = $patientser; # set the announcement ser
    return $announcement->{_patientser};
}

#====================================================================================
# Subroutine to set the Announcement Post Control Serial
#====================================================================================
sub setAnnouncementPostControlSer
{
    my ($announcement, $postcontrolser) = @_; # announcement object with provided serial in args
    $announcement->{_postcontrolser} = $postcontrolser; # set the announcement ser
    return $announcement->{_postcontrolser};
}

#====================================================================================
# Subroutine to set the Announcement Read Status
#====================================================================================
sub setAnnouncementReadStatus
{
    my ($announcement, $readstatus) = @_; # announcement object with provided status in args
    $announcement->{_readstatus} = $readstatus; # set the announcement status
    return $announcement->{_readstatus};
}

#====================================================================================
# Subroutine to get the Announcement Serial
#====================================================================================
sub getAnnouncementSer
{
	my ($announcement) = @_; # our announcement object
	return $announcement->{_ser};
}

#====================================================================================
# Subroutine to get the Announcement Patient Serial
#====================================================================================
sub getAnnouncementPatientSer
{
	my ($announcement) = @_; # our announcement object
	return $announcement->{_patientser};
}

#====================================================================================
# Subroutine to get the Announcement Post Control Serial
#====================================================================================
sub getAnnouncementPostControlSer
{
	my ($announcement) = @_; # our announcement object
	return $announcement->{_postcontrolser};
}

#====================================================================================
# Subroutine to get the Announcement Read Status
#====================================================================================
sub getAnnouncementReadStatus
{
	my ($announcement) = @_; # our announcement object
	return $announcement->{_readstatus};
}

#======================================================================================
# Subroutine to publish announcement
#======================================================================================
sub publishAnnouncements
{
    my (@patientList) = @_; # patient list from args

    my $today_date = strftime("%Y-%m-%d", localtime(time));
    my $now = Time::Piece->strptime(strftime("%Y-%m-%d %H:%M:%S", localtime(time)), "%Y-%m-%d %H:%M:%S");

    # Date object of today at 8AM
    my $today_at_eightAM = Time::Piece->strptime($today_date . " 08:00:00", "%Y-%m-%d %H:%M:%S");
    # Date object of today at 8PM
    my $today_at_eightPM = Time::Piece->strptime($today_date . " 20:00:00", "%Y-%m-%d %H:%M:%S");

    # If we are not within the window to publish announcements then return
    if ( (($now - $today_at_eightAM) < 0) or (($now - $today_at_eightPM) > 0) ) {return;}

    my @announcementControls = PostControl::getPostControlsMarkedForPublish('Announcement');

    print "After announce controls\n";
    foreach my $Patient (@patientList) {

        my $patientSer          = $Patient->getPatientSer(); # get patient serial

        foreach my $PostControl (@announcementControls) {

            my $postControlSer          = $PostControl->getPostControlSer();
            my $postPublishDate         = $PostControl->getPostControlPublishDate();
            my $postFilters             = $PostControl->getPostControlFilters();

            if ($postPublishDate) { # which there should be for announcements

                # Make datetime into object
                $postPublishDate = Time::Piece->strptime($postPublishDate, "%Y-%m-%d %H:%M:%S");
                # Extract date part only
                $postPublishDate = $postPublishDate->date;
                
                # Retrieve the patient's appointment if one (or more) lands on the publish date
                my @patientAppointments = Appointment::getPatientsAppointmentsFromDateInOurDB($patientSer, $postPublishDate, 0);
                #if(!@patientAppointments) {next;}

                my @expressionNames = ();
                my @diagnosisNames = ();
                my @patientResources = ();

                # we build all possible expression names, diagnoses, and resources for each appointment found
                foreach my $appointment (@patientAppointments) {

                    my $expressionSer = $appointment->getApptAliasExpressionSer();
                    my $expressionName = Alias::getExpressionNameFromOurDB($expressionSer);
                    push(@expressionNames, $expressionName) unless grep{$_ == $expressionName} @expressionNames;

                    my $diagnosisSer = $appointment->getApptDiagnosisSer();
                    my $diagnosisName = Diagnosis::getDiagnosisNameFromOurDB($diagnosisSer);
                    push(@diagnosisNames, $diagnosisName) unless grep{$_ == $diagnosisName} @diagnosisNames;

                    my $appointmentSer  = $appointment->getApptSer();
                    my @resources = ResourceAppointment::getPatientsResourcesFromOurDB($appointmentSer);
                    push(@patientResources, @resources);
                }

                my @patientDoctors = PatientDoctor::getPatientsDoctorsFromOurDB($patientSer);
                
                # Fetch expression filters (if any)
                my @expressionFilters =  $postFilters->getExpressionFilters();
                if (@expressionFilters) {

                    # Finding the existence of the patient expressions in the expression filters
                    # If there is an intersection, then patient is part of this publishing announcement
                    # If not, then continue to next announcement
                    if (!intersect(@expressionFilters, @expressionNames)) {next;} 
                }

                # Fetch diagnosis filters (if any)
                my @diagnosisFilters = $postFilters->getDiagnosisFilters();
                if (@diagnosisFilters) {

                    # Finding the intersection of the patient's diagnosis and the diagnosis filters
                    # If there is an intersection, then patient is part of this publishing announcement
                    # If not, then continue to next announcement
                    if (!intersect(@diagnosisFilters, @diagnosisNames)) {next;} 
                }

                # Fetch doctor filters (if any)
                my @doctorFilters = $postFilters->getDoctorFilters();
                if (@doctorFilters) {

                    # Finding the intersection of the patient's doctor(s) and the doctor filters
                    # If there is an intersection, then patient is part of this publishing announcement
                    # If not, then continue to next announcement
                    if (!intersect(@doctorFilters, @patientDoctors)) {next;} 
                }

                # Fetch resource filters (if any)
                my @resourceFilters = $postFilters->getResourceFilters();
                if (@resourceFilters) {

                    # Finding the intersection of the patient resource(s) and the resource filters
                    # If there is an intersection, then patient is part of this publishing announcement
                    # If not, then continue to next announcement
                    if (!intersect(@resourceFilters, @patientResources)) {next;} 
                }


                # If we've reached this point, we've passed all catches (filter restrictions). We make
                # an announcement object, check if it exists already in the database. If it does 
                # this means the announcement has already been published to the patient. If it doesn't
                # exist then we publish to the patient (insert into DB).
                $announcement = new Announcement();

                # set the necessary values
                $announcement->setAnnouncementPatientSer($patientSer);
                $announcement->setAnnouncementPostControlSer($postControlSer);

                if (!$announcement->inOurDatabase()) {
    
                    $announcement = $announcement->insertAnnouncementIntoOurDB();

                    # send push notification
                    my $announcementSer = $announcement->getAnnouncementSer();
                    my $patientSer = $announcement->getAnnouncementPatientSer();
                    PushNotification::sendPushNotification($patientSer, $announcementSer, 'Announcement');

                }
            } # End if postPublishDate

        } # End forEach PostControl   

    } # End forEach Patient

}

#======================================================================================
# Subroutine to check if our announcement exists in our MySQL db
#	@return: announcement object (if exists) .. NULL otherwise
#======================================================================================
sub inOurDatabase
{
    my ($announcement) = @_; # our announcement object
    my $patientser = $announcement->getAnnouncementPatientSer(); # get patient serial
    my $postcontrolser = $announcement->getAnnouncementPostControlSer(); # get post control serial

    my $serInDB = 0; # false by default. Will be true if announcement exists
    my $ExistingAnnouncement = (); # data to be entered if announcement exists

    # Other variables, if announcement exists
    my ($readstatus);

    my $inDB_sql = "
        SELECT
            an.AnnouncementSerNum,
            an.ReadStatus
        FROM
            Announcement an
        WHERE
            an.PatientSerNum = '$patientser'
        AND an.PostControlSerNum = '$postcontrolser'
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

        $ExistingAnnouncement = new Announcement(); # initialize object

        # set parameters
        $ExistingAnnouncement->setAnnouncementSer($serInDB); 
        $ExistingAnnouncement->setAnnouncementPatientSer($patientser);
        $ExistingAnnouncement->setAnnouncementPostControlSer($postcontrolser); 
        $ExistingAnnouncement->setAnnouncementReadStatus($readstatus);

        return $ExistingAnnouncement; # this is true (ie. announcement exists, return object)
    }

    else {return $ExistingAnnouncement;} # this is false (ie. announcement DNE, return empty)
}

#======================================================================================
# Subroutine to insert our announcement info in our database
#======================================================================================
sub insertAnnouncementIntoOurDB
{
    my ($announcement) = @_; # our announcement object 

    my $patientser      = $announcement->getAnnouncementPatientSer();
    my $postcontrolser  = $announcement->getAnnouncementPostControlSer();

    my $insert_sql = "
        INSERT INTO
            Announcement (
                PatientSerNum,
                PostControlSerNum,
                DateAdded
            )
        VALUES (
            '$patientser',
            '$postcontrolser',
            NOW()
        )
    ";

    # prepare query
	my $query = $SQLDatabase->prepare($insert_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;

	# Retrieve the serial
	my $ser = $SQLDatabase->last_insert_id(undef, undef, undef, undef);

	# Set the Serial in our object
	$announcement->setAnnouncementSer($ser);
	
	return $announcement;
}


