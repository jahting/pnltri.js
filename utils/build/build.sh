#!/bin/sh

LICENSE="// pnltri.js / raw.github.com/jahting/pnltri.js/master/LICENSE"

SRCFILES="../../src/Pnltri.js ../../src/PnltriMath.js ../../src/PolygonData.js ../../src/EarClipTriangulator.js ../../src/Trapezoider.js ../../src/MonoSplitter.js ../../src/MonoTriangulator.js ../../src/Triangulator.js"

DESTPLAIN="../../build/pnltri.js"
DESTMINI="../../build/pnltri.min.js"


# simple concatenation of source files
echo $LICENSE > $DESTPLAIN
cat $SRCFILES >> $DESTPLAIN

# minified concatenation of source files
echo $LICENSE > $DESTMINI
java -jar compiler/compiler.jar --warning_level=VERBOSE --language_in=ECMASCRIPT5_STRICT --compilation_level=ADVANCED_OPTIMIZATIONS --js $SRCFILES ./PnltriApi.js >> $DESTMINI
# further options:	--jscomp_off=globalThis --jscomp_off=checkTypes --externs externs.js

