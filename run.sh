#!/bin/bash
if [ $(whoami) = "root" ]; then
    echo "Warning: running as root is not recommend."
fi

if [ $# = 0 ]; then
    node ./node_modules/electron/cli.js .
elif [ $1 = "--help" ]; then
    VERSION=`(cat package.json | jq '.version' | sed -e 's/^"//' -e 's/"$//') || unknown`
    echo "Help command"
    echo "--help = Shows this message"
    echo "--log  = Start in debug mode"
    echo "FelidaBrowser v$VERSION"
else
    node ./node_modules/electron/cli.js . $*
fi