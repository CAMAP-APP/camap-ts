#!/usr/bin/perl

# Merge input file (typically .env.sample) with env vars and extra files to generate a final .env file
# Usage : perl tune-env-file.pl $pathToOutputFile $pathToInputFile [$extraFilesToMerge]
# Need to install libconfig-tiny-perl : "sudo apt install libconfig-tiny-perl"

use 5.14.0;
use strict;
use warnings;
use autodie;

use Config::Tiny;

my ($outfile, $mainfile, @infiles) = @ARGV;

my %custom;

# Get some vars from ENV

if (my $key = $ENV{PW_HASH_KEY}) {
    $custom{CAMAP_KEY} = $key;
}

if (my $front_url = $ENV{FRONT_URL}) {
    $custom{FRONT_URL} = $front_url;
    $custom{FRONT_GRAPHQL_URL} = "$front_url/graphql";
}

foreach my $varname (qw/CAMAP_HOST DB_DATABASE DB_HOST DB_USERNAME DB_PASSWORD API_PORT/) {
    $custom{$varname} = $ENV{$varname} if $ENV{$varname};
}

my $config = Config::Tiny->read( $mainfile ) or
        die "cannot read $mainfile: $!";;

# Config::Tiny is designed to handle Ini files. The "_" element
# contains parameters written outside of [Class] blocks, i.e. it
# contains the values of the inputfile
my $dotenv = $config->{_};

foreach my $in (@infiles) {
    my $cf = Config::Tiny->read( $in ) or
        die "cannot read $in file: $!";
    my $part = $cf->{_};
    @custom{keys %$part} = values %$part;
}

if (%custom) {
    say "Customized values:";
    for my $k (sort keys %custom) {
        my $redacted = $custom{$k};
        substr($redacted,3) = '<redacted>' if $k =~ /KEY|PW|PASS/;
        printf("%-18s = %s\n",$k, $redacted);
        $dotenv->{$k} = $custom{$k};        
    }
}
else {
    say "No customized end values";
}

$config->write($outfile) if $outfile;

