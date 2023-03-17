# Test tune-env-file.pl
# Needs "sudo apt install libtest-script-perl"
# Run "prove scripts/t"


use strict;
use warnings;
use 5.26.0;
use feature qw/postderef signatures/;
no warnings qw/experimental::postderef experimental::signatures/;

use Test::More;
use Test::Script;

# this file mostly tests the transformation of FRONT_URL in the
# several FRONT_* variables

my $head = "Customized values:\n";
my $script_to_test = 'scripts/tune-env-file.pl';

script_compiles($script_to_test);

# cleanup variables that may lead to test failures
for my $var (qw/PW_HASH_KEY DB_HOST API_PORT CAMAP_HOST FRONT_URL/ ) {
    delete $ENV{$var}
}

sub check ($var,$value,$expect) {
    $ENV{$var}=$value;

    script_runs([$script_to_test, '/dev/null', '.env.sample' ], "run test $var with $value" );
    script_stdout_is( $head. $expect, "check test $var");
    delete $ENV{$var};
}

subtest "test injection from env variables" => sub {
    check(PW_HASH_KEY => "a-test-key", <<~"EOF");
        CAMAP_KEY        = a-t<redacted>
        EOF

    check(DB_HOST => "plopdb", <<~"EOF");
        DB_HOST            = plopdb
        EOF

    check(API_PORT => "3010", <<~"EOF");
        API_PORT           = 3010
        EOF

    check(FRONT_URL => 'http://plop.fr', <<~"EOF");
        FRONT_GRAPHQL_URL  = http://plop.fr/graphql
        FRONT_URL          = http://plop.fr
        EOF

    check(FRONT_URL => 'https://plop.fr:8080', <<~"EOF");
        FRONT_GRAPHQL_URL  = https://plop.fr:8080/graphql
        FRONT_URL          = https://plop.fr:8080
        EOF

    check(CAMAP_HOST => 'https://plop.fr', <<~"EOF");
        CAMAP_HOST       = https://plop.fr
        EOF
};

subtest "test env file merge" => sub {
    my $var = 'FRONT_URL';
    my $value = 'https://plop.fr:8080';
    my $var2 = 'CAMAP_HOST';
    my $value2 = 'https://plop.fr';
    $ENV{$var}=$value;
    $ENV{$var2}=$value2;

    script_runs(
        [$script_to_test, '/dev/null', '.env.sample', 'scripts/t/test.env' ],
        "run test $var with $value and $var2 with $value2"
    );
    script_stdout_is( $head. <<~"EOF" , "check test $var");
        CAMAP_HOST       = https://plop.fr
        FRONT_GRAPHQL_URL  = https://plop.fr:8080/graphql
        FRONT_URL          = https://plop.fr:8080
        SMTP_AUTH_PASS     = xyz<redacted>
        SMTP_AUTH_USER     = amail\@ethereal.email
        SMTP_HOST          = smtp.ethereal.email
        SMTP_PORT          = 587
        SMTP_SECURE        = false
        EOF

    delete $ENV{$var};
};


done_testing;
