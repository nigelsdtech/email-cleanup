#!/bin/sh

. ~/bin/setup_node_env.sh


# Default instance
DEPLOYMENT="general"

# extract options and their arguments into variables.
while getopts d: FLAG; do
	case $FLAG in
		d)
			DEPLOYMENT=$OPTARG
			;;
		\?) echo "Internal error! Unrecognized argument $FLAG" ; exit 1 ;;
	esac
done



appname=${PWD##*/}
export NODE_APP_INSTANCE="${appname}"

export NODE_ENV="${DEPLOYMENT}"

node index.js
