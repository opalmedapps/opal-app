#!/usr/bin/perl
#---------------------------------------------------------------------------------
# A.Joseph 06-May-2016 ++ File: TxTeamMessage.pm
#---------------------------------------------------------------------------------
# Perl module that creates a treatment team message (ttm) class. This module calls 
# a contructor to create a ttm object that contains ttm information stored as 
# object variables.
#
# There exists various subroutines to set and get ttm information and compare ttm
# information between two ttm objects.
#

package TxTeamMessage; # Declaring package name

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

#---------------------------------------------------------------------------------
# Connect to the databases
#---------------------------------------------------------------------------------
my $SQLDatabase		= $Database::targetDatabase;

#====================================================================================
# Constructor for our ttm class 
#====================================================================================
sub new
{
    my $class = shift;
    my $ttm = {
        _ser            => undef,
        _patientser     => undef,
        _postcontrolser => undef,
        _readstatus     => undef,
    };

    # bless associates an object with a class so Perl knows which package to search for
	# when a method is envoked on this object
    bless $ttm, $class;
    return $ttm;
}

#====================================================================================
# Subroutine to set the Treatment Team Message Serial
#====================================================================================
sub setTTMSer
{
    my ($ttm, $ser) = @_; # ttm object with provided serial in args
    $ttm->{_ser} = $ser; # set the ttm ser
    return $ttm->{_ser};
}

#====================================================================================
# Subroutine to set the Treatment Team Message Patient Serial
#====================================================================================
sub setTTMPatientSer
{
    my ($ttm, $patientser) = @_; # ttm object with provided serial in args
    $ttm->{_patientser} = $patientser; # set the ttm ser
    return $ttm->{_patientser};
}

#====================================================================================
# Subroutine to set the Treatment Team Message Post Control Serial
#====================================================================================
sub setTTMPostControlSer
{
    my ($ttm, $postcontrolser) = @_; # ttm object with provided serial in args
    $ttm->{_postcontrolser} = $postcontrolser; # set the ttm ser
    return $ttm->{_postcontrolser};
}

#====================================================================================
# Subroutine to set the Treatment Team Message Read Status
#====================================================================================
sub setTTMReadStatus
{
    my ($ttm, $readstatus) = @_; # ttm object with provided status in args
    $ttm->{_readstatus} = $readstatus; # set the ttm status
    return $ttm->{_readstatus};
}

#====================================================================================
# Subroutine to get the Treatment Team Message Serial
#====================================================================================
sub getTTMSer
{
	my ($ttm) = @_; # our ttm object
	return $ttm->{_ser};
}

#====================================================================================
# Subroutine to get the Treatment Team Message Patient Serial
#====================================================================================
sub getTTMPatientSer
{
	my ($ttm) = @_; # our ttm object
	return $ttm->{_patientser};
}

#====================================================================================
# Subroutine to get the Treatment Team Message Post Control Serial
#====================================================================================
sub getTTMPostControlSer
{
	my ($ttm) = @_; # our ttm object
	return $ttm->{_postcontrolser};
}

#====================================================================================
# Subroutine to get the Treatment Team Message Read Status
#====================================================================================
sub getTTMReadStatus
{
	my ($ttm) = @_; # our ttm object
	return $ttm->{_readstatus};
}

#======================================================================================
# Subroutine to publish tx team message
#======================================================================================
sub publishTxTeamMessages
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

    my @txTeamMessageControls = PostControl::getPostControlsMarkedForPublish('Treatment Team Message');

    foreach my $Patient (@patientList) {

        my $patientSer          = $Patient->getPatientSer(); # get patient serial

        foreach my $PostControl (@txTeamMessageControls) {
            
            my $postControlSer          = $PostControl->getPostControlSer();
            my $postFilters             = $PostControl->getPostControlFilters();

            my @expressionNames = ();

            my @diagnosisNames = Diagnosis::getPatientsDiagnosesFromOurDB($patientSer);

            my @patientDoctors = PatientDoctor::getPatientsDoctorsFromOurDB($patientSer);
                
            # Fetch expression filters (if any)
            my @expressionFilters =  $postFilters->getExpressionFilters();
            if (@expressionFilters) {
  
                # Retrieve the patient appointment(s) if one (or more) lands within one day of today
                my @patientAppointments = Appointment::getPatientsAppointmentsFromDateInOurDB($patientSer, $today_date, 1);

                # we build all possible expression names, and diagnoses for each appointment found
                foreach my $appointment (@patientAppointments) {

                    my $expressionSer = $appointment->getApptAliasExpressionSer();
                    my $expressionName = Alias::getExpressionNameFromOurDB($expressionSer);
                    push(@expressionNames, $expressionName) unless grep{$_ == $expressionName} @expressionNames;

                }

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

            # If we've reached this point, we've passed all catches (filter restrictions). We make
            # a tx team message object, check if it exists already in the database. If it does 
            # this means the mesasge has already been publish to the patient. If it doesn't
            # exist then we publish to the patient (insert into DB).
            $txTeamMessage = new TxTeamMessage();

            # set the necessary values
            $txTeamMessage->setTTMPatientSer($patientSer);
            $txTeamMessage->setTTMPostControlSer($postControlSer);

            if (!$txTeamMessage->inOurDatabase()) {
    
                $txTeamMessage = $txTeamMessage->insertTxTeamMessageIntoOurDB();

                # send push notification
                my $txTeamMessageSer = $txTeamMessage->getTTMSer();
                my $patientSer = $txTeamMessage->getTTMPatientSer();
                PushNotification::sendPushNotification($patientSer, $txTeamMessageSer, 'TxTeamMessage');


            }

        } # End forEach PostControl   

    } # End forEach Patient

}

#======================================================================================
# Subroutine to check if our ttm exists in our MySQL db
#	@return: ttm object (if exists) .. NULL otherwise
#======================================================================================
sub inOurDatabase
{
    my ($txTeamMessage) = @_; # our ttm object in args

    my $patientser = $txTeamMessage->getTTMPatientSer(); # get patient serial 
    my $postcontrolser = $txTeamMessage->getTTMPostControlSer(); # get post control serial

    my $serInDB = 0; # false by default. Will be true if message exists
    my $ExistingTTM = (); # data to be entered if ttm exists

    # Other variables, if ttm exists
    my ($readstatus);

    my $inDB_sql = "
        SELECT
            ttm.TxTeamMessageSerNum,
            ttm.ReadStatus
        FROM   
            TxTeamMessage ttm
        WHERE
            ttm.PatientSerNum       = '$patientser'
        AND ttm.PostControlSerNum   = '$postcontrolser'
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

        $ExistingTTM = new TxTeamMessage(); # initlaize object

        # set params
        $ExistingTTM->setTTMSer($serInDB);
        $ExistingTTM->setTTMPatientSer($patientser);
        $ExistingTTM->setTTMPostControlSer($postcontrolser);
        $ExistingTTM->setTTMReadStatus($readstatus);

        return $ExistingTTM; # this is true (ie. ttm exists. return object)

    }

    else {return $ExistingTTM;} # this is false (ie. ttm DNE)

}

#======================================================================================
# Subroutine to insert our treatment team message info in our database
#======================================================================================
sub insertTxTeamMessageIntoOurDB
{
    my ($txTeamMessage) = @_; # our ttm object

    my $patientser      = $txTeamMessage->getTTMPatientSer();
    my $postcontrolser  = $txTeamMessage->getTTMPostControlSer();

    my $insert_sql = "
        INSERT INTO 
            TxTeamMessage (
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
	$txTeamMessage->setTTMSer($ser);
	
	return $txTeamMessage;
}


# Exit smoothly 
1;
