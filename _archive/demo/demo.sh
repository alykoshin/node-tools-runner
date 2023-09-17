#!/usr/bin/env bash

this_file_dir=`dirname "$(readlink -f "$0")"`

#
#
#

#node cli.js spawn pwd
#node cli.js lookup ENOENT
#node cli.js confirm "Confirm [Y/N]?"
#node cli.js keypress "Press any key... "

#
# General JsonScript tests
#

node "$this_file_dir/../cli.js" test testAction '{"property_name":"property_value"}'

#
# Certificate generation
#

#node cli.js openssl ensureFile ./demo/gen-certs-config.json
#node cli.js openssl ensureNoFile ./demo/gen-certs-config.json
#node cli.js openssl gen_ca ./demo/gen-certs-config.json
#node cli.js openssl write_server_ext ./demo/gen-certs-config.json
#node cli.js openssl gen_all ./demo/gen-certs-config.json

#
# Git/Github utilities
#

#node cli.js git testEcho

#node cli.js git queryClean
#node cli.js git queryCommitHash
#node cli.js git queryBranch
#node cli.js git checkoutBranch "{ \"branch\": \"master\" }"

#node cli.js git readGitCredentials
#node cli.js git readSpecificGitCredentials '{"hostname":"github.com","username":"alykoshin"}'
#node cli.js git readGithubUsername
#node cli.js git readGithubToken

#node cli.js git createGithubRepo '{"username":"alykoshin","name":"test","description":"test"}'

#node "$this_file_dir/../cli.js" git initAndPush '{"username":"alykoshin","repository":"test"}'

#
# Mongodb utilities tests
#

#node cli.js mongo backup ./demo/mongo-backup.json
#node cli.js mongo backup ./demo/mongo-backup.json ./demo/mongo-restore.json

#
#
#
