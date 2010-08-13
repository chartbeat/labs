#!/bin/bash
#
# Downloads the latest closure compiler library and compiler

set -e

svn checkout http://closure-library.googlecode.com/svn/trunk/ closure-library

wget http://closure-compiler.googlecode.com/files/compiler-latest.zip
unzip compiler-latest.zip compiler.jar
rm compiler-latest.zip
