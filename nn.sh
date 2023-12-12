#!/bin/bash

# Parse command line arguments
for i in "$@"
do
case $i in
	--input=*)
	INPUT="${i#*=}"
	shift
	;;
	--output=*)
	OUTPUT="${i#*=}"
	shift
	;;
esac
done

echo "OUTPUT: $OUTPUT"
find $OUTPUT -mindepth 1 ! -path '*/.git/*' ! -name '.git' ! -name '.env' ! -name '.env.test' -delete

# Copy all files from the input directory to the output directory
cp -r "$INPUT/." "$OUTPUT"