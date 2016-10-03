#!/usr/bin/perl
#---------------------------------------------------------------------------------
# A.Joseph 06-May-2016 ++ File: EducationalMaterialControl.pm
#---------------------------------------------------------------------------------
# Perl module that creates a educational material control class. This module calls
# a constructor to create an eduMat control object that contains eduMat control
# information stored as parameters.
#
# There exists various subroutines to set / get eduMat control information.

package EducationalMaterialControl; # Declare package name

use Database; # Our custom Database.pm
use Filter; # Our custom Filter.pm

#---------------------------------------------------------------------------------
# Connect to the database
#---------------------------------------------------------------------------------
my $SQLDatabase		= $Database::targetDatabase;

#====================================================================================
# Constructor for our EducationalMaterialControl class 
#====================================================================================
sub new
{
    my $class = shift;
    my $edumatcontrol = {
        _ser            => undef,
        _publishflag    => undef,
        _lastpublished  => undef,
        _filters        => undef,
    };

    # bless associates an object with a class so Perl knows which package to search for
	# when a method is envoked on this object
	bless $edumatcontrol, $class; 
	return $edumatcontrol;
}

#======================================================================================
# Subroutine to set the edumat control serial
#======================================================================================
sub setEduMatControlSer
{
	my ($edumatcontrol, $ser) = @_; # edumat control object with provided serial in arguments
	$edumatcontrol->{_ser} = $ser; # set the serial
	return $edumatcontrol->{_ser};
}

#======================================================================================
# Subroutine to set the edumat control publish flag
#======================================================================================
sub setEduMatControlPublishFlag
{
	my ($edumatcontrol, $publishflag) = @_; # edumat control object with provided flag in arguments
	$edumatcontrol->{_publishflag} = $publishflag; # set the flag
	return $edumatcontrol->{_publishflag};
}

#======================================================================================
# Subroutine to set the edumat control last published
#======================================================================================
sub setEduMatControlLastPublished
{
	my ($edumatcontrol, $lastpublished) = @_; # edumat control object with provided lastpublished in arguments
	$edumatcontrol->{_lastpublished} = $lastpublished; # set the LP
	return $edumatcontrol->{_lastpublished};
}

#======================================================================================
# Subroutine to set the edumat control filters
#======================================================================================
sub setEduMatControlFilters
{
	my ($edumatcontrol, $filters) = @_; # edumat control object with provided filters in arguments
	$edumatcontrol->{_filters} = $filters; # set the filters
	return $edumatcontrol->{_filters};
}

#======================================================================================
# Subroutine to get the edumat control serial
#======================================================================================
sub getEduMatControlSer
{
	my ($edumatcontrol) = @_; # our edumat control object
	return $edumatcontrol->{_ser};
}

#======================================================================================
# Subroutine to get the edumat control publish flag
#======================================================================================
sub getEduMatControlPublishFlag
{
	my ($edumatcontrol) = @_; # our edumat control object
	return $edumatcontrol->{_publishflag};
}

#======================================================================================
# Subroutine to get the edumat control last published
#======================================================================================
sub getEduMatControlLastPublished
{
	my ($edumatcontrol) = @_; # our edumat control object
	return $edumatcontrol->{_lastpublished};
}

#======================================================================================
# Subroutine to get the edumat control filters
#======================================================================================
sub getEduMatControlFilters
{
	my ($edumatcontrol) = @_; # our edumat control object
	return $edumatcontrol->{_filters};
}

#======================================================================================
# Subroutine to get a list of edumat controls marked for publish
#======================================================================================
sub getEduMatControlsMarkedForPublish
{
    my @eduMatControlList = (); # initialize a list

    my $info_sql = "
        SELECT DISTINCT
            em.EducationalMaterialControlSerNum,
            em.LastPublished
        FROM
            EducationalMaterialControl em
        WHERE
            em.PublishFlag      = 1
    ";

    # prepare query
	my $query = $SQLDatabase->prepare($info_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;

	while (my @data = $query->fetchrow_array()) {

        my $edumatControl = new EducationalMaterialControl(); # new object

        my $ser             = $data[0];
        my $lastpublished   = $data[1];

        # set information
        $edumatControl->setEduMatControlSer($ser);
        $edumatControl->setEduMatControlLastPublished($lastpublished);

        # get all the filters
        my $filters = Filter::getAllFiltersFromOurDB($ser, 'EducationalMaterialControl');

        $edumatControl->setEduMatControlFilters($filters);

        push(@eduMatControlList, $edumatControl);
    }

    return @eduMatControlList;
}

#======================================================================================
# Subroutine to set/update the "last published" field to current time 
#======================================================================================
sub setEduMatControlLastPublishedIntoOurDB
{
    my ($current_datetime) = @_; # our current datetime in args

    my $update_sql = "
        UPDATE
            EducationalMaterialControl
        SET
            LastPublished = '$current_datetime'
        WHERE
            PublishFlag = 1
    ";
    	
    # prepare query
	my $query = $SQLDatabase->prepare($update_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;
}

# exit smoothly for module
1;


