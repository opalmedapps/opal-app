#!/usr/bin/perl
#---------------------------------------------------------------------------------
# A.Joseph 10-Aug-2015 ++ File: Resource.pm
#---------------------------------------------------------------------------------
# Perl module that creates a resource class. This module calls a constructor to 
# create a resource object that contains resource information stored as object 
# variables.
#
# There exists various subroutines to set resource information, get resource information
# There exists various subroutines that use the Database.pm module to update the
# MySQL database and check if a resource exists already in this database.

package Resource; # Declare package name

use Database; # Use our custom database module Database.pm
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
	my $resource = {
		_ser		=> undef,
		_ariaser	=> undef,
		_name		=> undef,
        _type       => undef,
	};
	# bless associates an object with a class so Perl knows which package to search for
	# when a method is envoked on this object
	bless $resource, $class;
	return $resource;
}

#====================================================================================
# Subroutine to set the resource serial 
#====================================================================================
sub setResourceSer
{
	my ($resource, $ser) = @_; # resource object with provided serial in arguments
	$resource->{_ser} = $ser; # set the serial
	return $resource->{_ser};
}

#====================================================================================
# Subroutine to set the resource aria serial 
#====================================================================================
sub setResourceAriaSer
{
	my ($resource, $ariaser) = @_; # resource object with provided serial in arguments
	$resource->{_ariaser} = $ariaser; # set the serial
	return $resource->{_ariaser};
}

#====================================================================================
# Subroutine to set the resource name 
#====================================================================================
sub setResourceName
{
	my ($resource, $name) = @_; # resource object with provided name in arguments
	$resource->{_name} = $name; # set the name
	return $resource->{_name};
}

#====================================================================================
# Subroutine to set the resource type
#====================================================================================
sub setResourceType
{
	my ($resource, $type) = @_; # resource object with provided type in arguments
	$resource->{_type} = $type; # set the type
	return $resource->{_type};
}

#======================================================================================
# Subroutine to get the resource serial
#======================================================================================
sub getResourceSer
{
	my ($resource) = @_; # our resource object
	return $resource->{_ser};
}

#======================================================================================
# Subroutine to get the resource aria serial
#======================================================================================
sub getResourceAriaSer
{
	my ($resource) = @_; # our resource object
	return $resource->{_ariaser};
}

#======================================================================================
# Subroutine to get the resource name
#======================================================================================
sub getResourceName
{
	my ($resource) = @_; # our resource object
	return $resource->{_name};
}

#======================================================================================
# Subroutine to get the resource type
#======================================================================================
sub getResourceType
{
	my ($resource) = @_; # our resource object
	return $resource->{_type};
}

#====================================================================================
# Subroutine to get resource information from the ARIA db given a serial
#====================================================================================
sub getResourceInfoFromSourceDB
{
	my ($Resource) = @_; # Resource object from args

	my $ariaser = $Resource->getResourceAriaSer();

	# when we retrieve query result
	my ($name, $type);

	my $resource_sql = "
		SELECT DISTINCT 
			vv_ResourceName.ResourceName,
            Resource.ResourceType
		FROM
			vv_ResourceName,
            Resource
		WHERE
			vv_ResourceName.ResourceSer = '$ariaser'
        AND vv_ResourceName.ResourceSer = Resource.ResourceSer
	";
	# prepare query
	my $query = $sourceDatabase->prepare($resource_sql)
		or die "Could not prepare query: " . $sourceDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;

	while (my @data = $query->fetchrow_array()) {

		# query results
		$name = $data[0];
        $type = $data[1];

		$Resource->setResourceName($name);
        $Resource->setResourceType($type);
	}

	return $Resource;
}

#======================================================================================
# Subroutine to check if our resource exists in our MySQL db
#	@return: resource object (if exists) .. NULL otherwise
#======================================================================================
sub inOurDatabase
{
	my ($resource) = @_; # resource object from args
	my $ariaser = $resource->getResourceAriaSer(); # get aria serial

	my $ResourceAriaSerInDB = 0; # false by default. Will be true if resource exists
	my $ExistingResource = (); # data to be entered if resource exists

	# vars
	my ($ser, $name, $type);

	my $inDB_sql = "
		SELECT DISTINCT
			Resource.ResourceSerNum,
			Resource.ResourceAriaSer,
			Resource.ResourceName,
            Resource.ResourceType
		FROM
			Resource
		WHERE
			Resource.ResourceAriaSer = '$ariaser'
	";
	# prepare query
	my $query = $SQLDatabase->prepare($inDB_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;
	
	while (my @data = $query->fetchrow_array()) {

		$ser			= $data[0];
		$ResourceAriaSerInDB	= $data[1];
		$name			= $data[2];
        $type           = $data[3];

	}

	if ($ResourceAriaSerInDB) {
		
		$ExistingResource = new Resource(); # initialize new object

		$ExistingResource->setResourceSer($ser);
		$ExistingResource->setResourceAriaSer($ResourceAriaSerInDB);
		$ExistingResource->setResourceName($name);
        $ExistingResource->setResourceType($type);

		return $ExistingResource; # this is truthful (ie. resource exists) return object
	}
	
	else {return $ExistingResource;} # this is false (ie. resource DNE) return empty
}

#======================================================================================
# Subroutine to insert our resource info in our database
#======================================================================================
sub insertResourceIntoOurDB
{
	my ($resource) = @_; # our resource object

	# get all necessary details
	my $ariaser	= $resource->getResourceAriaSer();
	my $name	= $resource->getResourceName();
    my $type    = $resource->getResourceType();

	my $insert_sql = "
		INSERT INTO
			Resource (
				ResourceSerNum,
				ResourceAriaSer,
				ResourceName,
                ResourceType,
				LastUpdated
			)
		VALUES (
			NULL,
			'$ariaser',
			\"$name\",
            '$type',
			NULL
		)
	";

	# prepare query
	my $query = $SQLDatabase->prepare($insert_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;

	# Retrieve the ResourceSerNum
	my $ser = $SQLDatabase->last_insert_id(undef, undef, undef, undef);

	# Set the serial in our resource object
	$resource->setResourceSer($ser);

	return $resource;
}

#======================================================================================
# Subroutine to update our database with the resource's updated info
#======================================================================================
sub updateDatabase
{

	my ($resource) = @_; # our resource object

	# get all necessary details
	my $ariaser	= $resource->getResourceAriaSer();
	my $name	= $resource->getResourceName();
    my $type    = $resource->getResourceType();

	my $update_sql = "
		UPDATE
			Resource
		SET
			ResourceName	= \"$name\",
            ResourceType    = '$type'
		WHERE
			ResourceAriaSer	= '$ariaser'
	";
	# prepare query
	my $query = $SQLDatabase->prepare($update_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;	
}

#======================================================================================
# Subroutine to compare two resource objects. If different, use setter functions
# to update resource object.
#======================================================================================
sub compareWith
{
	my ($SuspectResource, $OriginalResource) = @_; # two resource objects 
	my $UpdatedResource = dclone($OriginalResource); # deep copy

	# retrieve params
	# Suspect resource
	my $Sname	= $SuspectResource->getResourceName();
    my $Stype   = $SuspectResource->getResourceType();

	# Original resource
	my $Oname	= $OriginalResource->getResourceName();
    my $Otype   = $OriginalResource->getResourceType();

	# go through each parameter
	if ($Sname ne $Oname) {
		print "Resource Name has changed from '$Oname' to '$Sname'\n";
		my $updatedName = $UpdatedResource->setResourceName($Sname); # update
		print "Will update database entry to '$updatedName'.\n";
	}
	if ($Stype ne $Otype) {
		print "Resource Type has changed from '$Otype' to '$Stype'\n";
		my $updatedType = $UpdatedResource->setResourceType($Stype); # update 
		print "Will update database entry to '$updatedType'.\n";
	}

	return $UpdatedResource;
}

#======================================================================================
# Subroutine to reassign our resource serial in ARIA to a resource serial in MySQL. 
# In the process, insert resource into our database if it DNE
#======================================================================================
sub reassignResource
{
	my ($ariaser) = @_; # aria serial from arguments 

    # first check if the resource serial is defined
    # if not, return zero
    if (!$ariaser) {
        return 0;
    }

	my $Resource = new Resource(); # initialize resource object

	$Resource->setResourceAriaSer($ariaser); # assign aria serial

	# get resource info from source DB (ARIA)
	$Resource = $Resource->getResourceInfoFromSourceDB();

	# check if the resource exists in our database
	my $ResourceExists = $Resource->inOurDatabase();

	if ($ResourceExists) {

		my $ExistingResource = dclone($ResourceExists); # reassign variable

        my $UpdatedResource = $Resource->compareWith($ExistingResource);

        # update database
        $UpdatedResource->updateDatabase();

		my $resourceSer = $ExistingResource->getResourceSer(); # get serial

		return $resourceSer;
	}
	else { # resource DNE

		# get resource info from source DB (ARIA)
        #$Resource = $Resource->getResourceInfoFromSourceDB();

		# insert resource into our DB
		$Resource = $Resource->insertResourceIntoOurDB();

		# get serial
		my $resourceSer = $Resource->getResourceSer();

		return $resourceSer;
	}
}

# To exit/return always true (for the module itself)
1;	
