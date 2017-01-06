#!/usr/bin/perl
#---------------------------------------------------------------------------------
# A.Joseph 16-Dec-2015 ++ File: Photo.pm
#---------------------------------------------------------------------------------
# Perl module that creates a photo class. This module calls a constructor to 
# create a photo object that contains photo information stored as object 
# variables.
#
# There exists various subroutines to set photo information, get photo information
# and compare photo information between two photo objects. 
# There exists various subroutines that use the Database.pm module to update the
# MySQL database and check if a photo exists already in this database.

package Photo; # Declare package name


use Database; # Use our custom database module Database.pm
use Time::Piece; # To parse and convert date time
use Storable qw(dclone); # for deep copies
use POSIX;

use Patient; # Our patient module

#---------------------------------------------------------------------------------
# Connect to the databases
#---------------------------------------------------------------------------------

my $sourceDatabase	= $Database::sourceDatabase;
my $SQLDatabase		= $Database::targetDatabase;

#====================================================================================
# Constructor for our PatientDoctor class 
#====================================================================================
sub new
{
	my $class = shift;
    my $photo = {
        _ser        => undef, 
        _patientser => undef,
        _ariaser    => undef,
        _picture    => undef,
        _thumbnail  => undef,
    };
    # bless associates an object with a class so Perl knows which package to search for
	# when a method is envoked on this object
	bless $photo, $class;
	return $photo;
}

#====================================================================================
# Subroutine to set the photo serial
#====================================================================================
sub setPhotoSer
{
	my ($photo, $ser) = @_; # Photo object with provided serial in arguments
	$photo->{_ser} = $ser; # set the ser
	return $photo->{_ser};
}

#====================================================================================
# Subroutine to set the photo patientserial
#====================================================================================
sub setPhotoPatientSer
{
	my ($photo, $patientser) = @_; # Photo object with provided serial in arguments
	$photo->{_patientser} = $patientser; # set the ser
	return $photo->{_patientser};
}

#====================================================================================
# Subroutine to set the photo ARIA serial
#====================================================================================
sub setPhotoAriaSer
{
	my ($photo, $ariaser) = @_; # Photo object with provided serial in arguments
	$photo->{_ariaser} = $ariaser; # set the ser
	return $photo->{_ariaser};
}

#====================================================================================
# Subroutine to set the photo picture
#====================================================================================
sub setPhotoPicture
{
	my ($photo, $picture) = @_; # Photo object with provided picture in arguments
	$photo->{_picture} = $picture; # set the pic
	return $photo->{_picture};
}

#====================================================================================
# Subroutine to set the photo thumbnail
#====================================================================================
sub setPhotoThumbnail
{
	my ($photo, $thumbnail) = @_; # Photo object with provided thumbnail in arguments
	$photo->{_thumbnail} = $thumbnail; # set the thumbnail
	return $photo->{_thumbnail};
}

#====================================================================================
# Subroutine to get the photo ser
#====================================================================================
sub getPhotoSer
{
	my ($photo) = @_; # our Photo object
	return $photo->{_ser};
}

#====================================================================================
# Subroutine to get the photo patient ser
#====================================================================================
sub getPhotoPatientSer
{
	my ($photo) = @_; # our Photo object
	return $photo->{_patientser};
}

#====================================================================================
# Subroutine to get the photo ARIA ser
#====================================================================================
sub getPhotoAriaSer
{
	my ($photo) = @_; # our Photo object
	return $photo->{_ariaser};
}

#====================================================================================
# Subroutine to get the photo picture
#====================================================================================
sub getPhotoPicture
{
	my ($photo) = @_; # our Photo object
	return $photo->{_picture};
}

#====================================================================================
# Subroutine to get the photo thumbnail
#====================================================================================
sub getPhotoThumbnail
{
	my ($photo) = @_; # our Photo object
	return $photo->{_thumbnail};
}

#====================================================================================
# Subroutine to get all photo's from the ARIA db
#====================================================================================
sub getPhotosFromSourceDB
{
    my (@patientList) = @_; # a patient list from args
    my @photoList = (); # initialize a list for photo objects

    # for query results
    my ($ariaser, $picture, $thumbnail);

	foreach my $Patient (@patientList) { 

		my $patientSer		= $Patient->getPatientSer(); # get patient ser
		my $ariaSer		    = $Patient->getPatientAriaSer(); # get patient aria ser
		my $lastTransfer		= $Patient->getPatientLastTransfer(); # get last updated
    
        # query 
        my $photoInfo_sql = "
            SELECT DISTINCT
                Photo.PhotoSer,
                Photo.Picture,
                Photo.Thumbnail
            FROM
                Photo
            WHERE
                Photo.PatientSer    = '$ariaSer'
            AND Photo.HstryDateTime > '2000-01-01 00:00:00'
        ";

        # prepare query
    	my $query = $sourceDatabase->prepare($photoInfo_sql)
	    	or die "Could not prepare query: " . $sourceDatabase->errstr;

		# execute query
    	$query->execute()
	    	or die "Could not execute query: " . $query->errstr;

        my $data = $query->fetchall_arrayref();
    	foreach my $row (@$data) {

            my $photo = new Photo(); # new object

            $ariaser    = $row->[0];
            $picture    = $row->[1];
            $thumbnail  = $row->[2];

            # set photo information
            $photo->setPhotoPatientSer($patientSer);
            $photo->setPhotoAriaSer($ariaser);
            $photo->setPhotoPicture($picture);
            $photo->setPhotoThumbnail($thumbnail);

            push(@photoList, $photo);
        }
    }

    return @photoList;
}

#======================================================================================
# Subroutine to check if our photo exists in our MySQL db
#	@return: photo object (if exists) .. NULL otherwise
#======================================================================================
sub inOurDatabase
{
    my ($photo) = @_; # our photo object
    my $ariaser = $photo->getPhotoAriaSer(); # retrieve the serial

    my $PhotoAriaSerInDB = 0; # false by default. Will be true if photo exists
    my $ExistingPhoto = (); # data to be entered if photo exists

    # Other phot params, if photo exists
    my ($ser, $patientser, $picture, $thumbnail);

    my $inDB_sql = "
        SELECT DISTINCT
            Photo.PhotoSerNum,
            Photo.PhotoAriaSer,
            Photo.PatientSerNum,
            Photo.Picture,
            Photo.Thumbnail
        FROM
            Photo
        WHERE
            Photo.PhotoAriaSer  = '$ariaser'
    ";

	# prepare query
	my $query = $SQLDatabase->prepare($inDB_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;

	while (my @data = $query->fetchrow_array()) {

        $ser                = $data[0];
        $PhotoAriaSerInDB   = $data[1];
        $patientser         = $data[2];
        $picture            = $data[3];
        $thumbnail          = $data[4];
    }

    if ($PhotoAriaSerInDB) {

        $ExistingPhoto = new Photo(); # initialize photo object

        $ExistingPhoto->setPhotoSer($ser);
        $ExistingPhoto->setPhotoAriaSer($PhotoAriaSerInDB);
        $ExistingPhoto->setPhotoPatientSer($patientser);
        $ExistingPhoto->setPhotoPicture($picture);
        $ExistingPhoto->setPhotoThumbnail($thumbnail);

        return $ExistingPhoto; # this is true (ie. photo exists, return object)
    }

    else {return $ExistingPhoto;} # this is false (ie. photo DNE, return null)
}

#======================================================================================
# Subroutine to insert our photo info in our database
#======================================================================================
sub insertPhotoIntoOurDB
{
    my ($photo) = @_; # our photo object

    my $patientser      = $photo->getPhotoPatientSer();
    my $ariaser         = $photo->getPhotoAriaSer();
    my $picture         = $photo->getPhotoPicture();
    my $thumbnail       = $photo->getPhotoThumbnail();

    # Insert photo
    my $insert_sql = "
        INSERT INTO 
            Photo (
                PhotoSerNum,
                PatientSerNum,
                PhotoAriaSer,
                Picture,
                Thumbnail,
                DateAdded,
                LastUpdated
            )
        VALUES (
            NULL,
            '$patientser',
            '$ariaser',
            '$picture',
            '$thumbnail',
            NOW(),
            NULL
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

	# Set the Serial in our photo object
	$photo->setPhotoSer($ser);

	return $photo;
	
}

#======================================================================================
# Subroutine to update our database with the photo's updated info
#======================================================================================
sub updateDatabase
{

    my ($photo) = @_; # our photo object

    my $ariaser         = $photo->getPhotoAriaSer();
    my $picture         = $photo->getPhotoPicture();
    my $thumbnail       = $photo->getPhotoThumbnail();

    my $update_sql = "
        UPDATE
            Photo
        SET
            Picture     = '$picture',
            Thumbnail   = '$thumbnail'
        WHERE
            PhotoAriaSer    = '$ariaser'
    ";
    # prepare query
	my $query = $SQLDatabase->prepare($update_sql)
		or die "Could not prepare query: " . $SQLDatabase->errstr;

	# execute query
	$query->execute()
		or die "Could not execute query: " . $query->errstr;

}

#======================================================================================
# Subroutine to compare two photo objects. If different, use setter funtions
# to update photo object.
#======================================================================================
sub compareWith
{
    my ($SuspectPhoto, $OriginalPhoto) = @_; # our two photo objects from args
    my $UpdatedPhoto = dclone($OriginalPhoto);

    # retrieve params
    # Suspect Photo...
    my $Spicture        = $SuspectPhoto->getPhotoPicture();
    my $Sthumbnail      = $SuspectPhoto->getPhotoThumbnail();

    # Original Photo...
    my $Opicture        = $OriginalPhoto->getPhotoPicture();
    my $Othumbnail      = $OriginalPhoto->getPhotoThumbnail();

    # go through each param
    if ($Spicture ne $Opicture) {

        print "Picture has changed from '$Opicture' to '$Spicture'\n";
        my $updatedPicture = $UpdatedPhoto->setPhotoPicture($Spicture); # update picture
        print "Will update database entry to '$updatedPicture'.\n";
    }
    if ($Sthumbnail ne $Othumbnail) { 

        print "Photo thumbnail has changed from '$Othumbnail' to '$Sthumbnail'\n";
        my $updatedThumbnail = $UpdatedPhoto->setPhotoThumbnail($Sthumbnail); # update thumbnail
        print "Will update database entry to '$updatedThumbnail'.\n";
    }

    return $UpdatedPhoto;
}

# To exit/return always true (for the module itself)
1;	


