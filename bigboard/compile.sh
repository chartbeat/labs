#!/bin/bash
closure-library/closure/bin/calcdeps.py \
  -i main.js \
  -c compiler.jar \
  -p . \
  -o compiled \
  -f "--compilation_level=ADVANCED_OPTIMIZATIONS" \
  -f "--jscomp_warning=visibility" \
  -f "--jscomp_warning=accessControls" \
  -f "--jscomp_warning=checkTypes" \
> main-compiled.js
