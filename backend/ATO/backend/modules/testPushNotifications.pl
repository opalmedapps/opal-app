#!/usr/bin/perl

use Configs;

use LWP::UserAgent; # for post requests
use JSON; 
use Net::Address::IP::Local;
use Cwd;
use Data::Dumper;

my $ipaddress = Net::Address::IP::Local->public; 
my $thisURL = 'http://' . $ipaddress . $Configs::URL_ABS . 'php/sendCallPatientNotification.php';

print "$thisURL\n";

my $browser = LWP::UserAgent->new;
my $returnStatus = $browser->post($thisURL, 
    [
        'patientid'            => '9999996',
        'room'                  => 'A1',
        'appointment_ariaser'   => '717771'
    ]
);

# json decode
my $returnStatuss = decode_json($returnStatus->content);

print Dumper($returnStatuss);
print '\n';

1;
