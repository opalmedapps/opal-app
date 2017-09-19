#!/usr/bin/perl
#---------------------------------------------------------------------------------
# A.Joseph 13-May-2016 ++ File: PushNotification.pm
#---------------------------------------------------------------------------------
# Perl module that creates a push notification class. This module calls a constructor
# to create a push notification object that contains push notification information stored as
# object variables
#
# There exists various subroutines to set / get information and compare information
# between two push notificaion objects.

package PushNotification; # Declaring package name

use Database; # Our custom database module
use Time::Piece; # perl module
use Array::Utils qw(:all);
use POSIX; # perl module

use Patient; # Our custom patient module

#---------------------------------------------------------------------------------
# Connect to the databases
#---------------------------------------------------------------------------------
my $SQLDatabase		= $Database::targetDatabase;

#====================================================================================
# Constructor for our notification class 
#====================================================================================
sub new
{
    my $class = shift;
    my $pushnotification = {
        _ser            => undef,
        _ptdidser       => undef,
        _patientser     => undef,
        _controlser     => undef,
        _reftablerowser => undef,
        _sendstatus     => undef,
        _sendlog        => undef,
    };

    # bless associates an object with a class so Perl knows which package to search for
	# when a method is envoked on this object
    bless $pushnotification, $class;
    return $pushnotification;
}

#====================================================================================
# Subroutine to set the Push Notification Serial
#====================================================================================
sub setPushNotificationSer
{
    my ($pushnotification, $ser) = @_; # push notification object with provided serial in args
    $pushnotification->{_ser} = $ser; # set the push notification ser
    return $pushnotification->{_ser};
}

#====================================================================================
# Subroutine to set the Push Notification PT DID Serial
#====================================================================================
sub setPushNotificationPTDIDSer
{
    my ($pushnotification, $ptdidser) = @_; # push notification object with provided serial in args
    $pushnotification->{_ptdidser} = $ptdidser; # set the push notification ser
    return $pushnotification->{_ptdidser};
}

#====================================================================================
# Subroutine to set the Push Notification Patient Serial
#====================================================================================
sub setPushNotificationPatientSer
{
    my ($pushnotification, $patientser) = @_; # push notification object with provided serial in args
    $pushnotification->{_patientser} = $patientser; # set the push notification ser
    return $pushnotification->{_patientser};
}

#====================================================================================
# Subroutine to set the Push Notification Control Ser
#====================================================================================
sub setPushNotificationControlSer
{
    my ($pushnotification, $controlser) = @_; # push notification object with provided serial in args
    $pushnotification->{_controlser} = $controlser; # set the push notification ser
    return $pushnotification->{_controlser};
}

#====================================================================================
# Subroutine to set the Push Notification Ref Table Row Serial
#====================================================================================
sub setPushNotificationRefTableRowSer
{
    my ($pushnotification, $reftablerowser) = @_; # pushnotification object with provided serial in args
    $pushnotification->{_reftablerowser} = $reftablerowser; # set the push notification ser
    return $pushnotification->{_reftablerowser};
}

#====================================================================================
# Subroutine to set the Push Notification Send status
#====================================================================================
sub setPushNotificationSendStatus
{
    my ($pushnotification, $sendstatus) = @_; # push notification object with provided status in args
    $pushnotification->{_sendstatus} = $sendstatus; # set the notification status
    return $pushnotification->{_sendstatus};
}

#====================================================================================
# Subroutine to set the Push Notification Send Log
#====================================================================================
sub setPushNotificationSendLog
{
    my ($pushnotification, $sendlog) = @_; # push notification object with provided log in args
    $pushnotification->{_sendlog} = $sendlog; # set the notification log
    return $pushnotification->{_sendlog};
}

#====================================================================================
# Subroutine to get the Push Notification Serial
#====================================================================================
sub getPushNotificationSer
{
	my ($pushnotification) = @_; # our push notification object
	return $pushnotification->{_ser};
}

#====================================================================================
# Subroutine to get the Push Notification PT DID Serial
#====================================================================================
sub getPushNotificationPTDIDSer
{
	my ($pushnotification) = @_; # our push notification object
	return $pushnotification->{_ptdidser};
}

#====================================================================================
# Subroutine to get the Push Notification Patient Serial
#====================================================================================
sub getPushNotificationPatientSer
{
	my ($pushnotification) = @_; # our push notification object
	return $pushnotification->{_patientser};
}

#====================================================================================
# Subroutine to get the Push Notification Control Serial
#====================================================================================
sub getPushNotificationControlSer
{
	my ($pushnotification) = @_; # our push notification object
	return $pushnotification->{_controlser};
}

#====================================================================================
# Subroutine to get the Push Notification Ref Table Row Serial
#====================================================================================
sub getPushNotificationRefTableRowSer
{
	my ($pushnotification) = @_; # our push notification object
	return $pushnotification->{_reftablerowser};
}

#====================================================================================
# Subroutine to get the Pust Notification Send Status
#====================================================================================
sub getPushNotificationSendStatus
{
	my ($pushnotification) = @_; # our push notification object
	return $pushnotification->{_sendstatus};
}

#====================================================================================
# Subroutine to get the Push Notification Send Log
#====================================================================================
sub getPushNotificationSendLog
{
	my ($pushnotification) = @_; # our push notification object
	return $pushnotification->{_sendlog};
}

#====================================================================================
# Subroutine to send/log push notification
#====================================================================================
sub sendPushNotifications
{
    my ($pushnotification) = @_; # args

    # retrieve parameters
    my $patientser          = $pushnotification->getPushNotificationPatientSer();
    my $controlser          = $pushnotification->getPushNotificationControlSer();
    my $reftablerowser      = $pushnotification->getPushNotificationRefTableRowSer();

    # Get the actual notification message
    my $message = getNotificationMessage($controlser, $patientser);
    my ($sendstatus, $sendlog); # initialize

    # get a list of the patient's device information
    my @PTDIDs  = $pushnotification->getPatientDeviceIdentifiers();

    if (!@PTDIDs) { # not identifiers listed
        $sendstatus     = "W"; # warning
        $sendlog        = "Patient has no device identifier! No push notification sent.";

        my $insert_sql = "
            INSERT INTO 
                PushNotification (
                    PatientDeviceIdentifierSerNum,
                    PatientSerNum,
                    NotificationControlSerNum,
                    RefTableRowSerNum,
                    DateAdded,
                    SendStatus,
                    SendLog
                )
            VALUES (
                NULL,
                '$patientser',
                '$controlser',
                '$reftablerowser',
                NOW(),
                \"$sendstatus\",
                \"$sendlog\"
            )
        ";
        # prepare query
	    my $query = $SQLDatabase->prepare($insert_sql)
		    or die "Could not prepare query: " . $SQLDatabase->errstr;

    	# execute query
	    $query->execute()
		    or die "Could not execute query: " . $query->errstr;

    }

    foreach my $PTDID (@PTDIDs) {

        # retrieve params
        my $ptdidser        = $PTDID->{ser};
        my $registrationid  = $PTDID->{registrationid};
        my $devicetype      = $PTDID->{devicetype};

        # system command to call Amro's push notification script
        my $returnStatus = ``;
        if ($returnStatus eq "True") {
            
            $sendstatus = "T"; # successful
            $sendlog    = "Push notification successfully sent! Message: $message";

        }
        if ($returnStatus eq "False") {

            $sendstatus = "F"; # failed
            $sendlog    = "Failed to send push notification!";
                
        }

        my $insert_sql = "
            INSERT INTO 
                PushNotification (
                    PatientDeviceIdentifierSerNum,
                    PatientSerNum,
                    NotificationControlSerNum,
                    RefTableRowSerNum,
                    DateAdded,
                    SendStatus,
                    SendLog
                )
            VALUES (
                '$ptdidser',
                '$patientser',
                '$controlser',
                '$reftablerowser',
                NOW(),
                \"$sendstatus\",
                \"$sendlog\"
            )
        ";
        # prepare query
	    my $query = $SQLDatabase->prepare($insert_sql)
		    or die "Could not prepare query: " . $SQLDatabase->errstr;

    	# execute query
	    $query->execute()
		    or die "Could not execute query: " . $query->errstr;

    }

}

#====================================================================================
# Subroutine to get notification message
#====================================================================================
sub getNotificationMessage
{
    my ($controlser, $patientser) = @_; # notification control & patient serial in args

    my $message;

    my $select_sql = "
        SELECT 
            CASE
                WHEN Patient.Language = 'EN' THEN NotificationControl.Description_EN
                WHEN Patient.Language = 'FR' THEN NotificationControl.Description_FR
            END AS Message
        FROM
            Patient,
            NotificationControl
        WHERE
            Patient.PatientSerNum                           = '$patientser'
        AND NotificationControl.NotificationControlSerNum   = '$controlser'
    ";

    # prepare query
	my $query = $SQLDatabase->prepare($select_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;
	
	while (my @data = $query->fetchrow_array()) {
        $message = $data[0];
    }

    return $message;
}

#====================================================================================
# Subroutine to get all patient device identifiers
#====================================================================================
sub getPatientDeviceIdentifiers
{
    my ($pushnotification) = @_; # args

    # get patient serial
    my $patientser          = $pushnotification->getPushNotificationPatientSer();

    # initialize list
    my @PTDIDs = ();

    my $select_sql = "
        SELECT DISTINCT
            ptdid.PatientDeviceIdentifierSerNum,
            ptdid.RegistrationId,
            CASE
                WHEN ptdid.DeviceType = 0 THEN 'Iphone'
                WHEN ptdid.DeviceType = 1 THEN 'Android'
            END AS DeviceType
        FROM 
            PatientDeviceIdentifier ptdid
        WHERE
            ptdid.PatientSerNum = '$patientser'
    ";
    # prepare query
	my $query = $SQLDatabase->prepare($select_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;
	
	while (my @data = $query->fetchrow_array()) {

        my $ser             = $data[0];
        my $registrationid  = $data[1];
        my $devicetype      = $data[2];

        my $ptdid = {   
            'ser'               => $ser,
            'registrationid'    => $registrationid,
            'devicetype'        => $devicetype
        };

        push(@PTDIDs, $ptdid);
    }

    return @PTDIDs;
}

# Exit smoothly 
1;
