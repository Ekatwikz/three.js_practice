#!/bin/bash

# Script to sync up two folders

main () {
	if [ $# -lt 2 ]; then usage; fi
	checkdir $1

	INDIR=$(cleanupArg $1)
	OUTDIR=$(cleanupArg $2)

	printf $INDIR" -> "$OUTDIR"\n---\n\n"
	rsync -rltg -vh $INDIR $OUTDIR
	printf "\n---\n"$INDIR" -> "$OUTDIR"\n"
}

checkdir() {
	if [ ! -d $1 ]; then
		echo "\"$1\" doesn't exist"
		exit 1
	fi
}

usage () {
	echo "Usage:"
	echo "./$0 indir netpath"
	exit 1
}

cleanupArg () {
	if [ "${1: -1}" == "/" ]; then
		echo ${1::-1}
		exit
	fi
	echo $1
}

main "$@"
