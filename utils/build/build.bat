
@set "LICENSE=// pnltri.js / raw.github.com/jahting/pnltri.js/master/LICENSE"

@set "SRCFILES=..\..\src\Pnltri.js ..\..\src\PnltriMath.js ..\..\src\PolygonData.js ..\..\src\Trapezoider.js ..\..\src\MonoSplitter.js ..\..\src\MonoTriangulator.js ..\..\src\Triangulator.js"

@set "DESTPLAIN=..\..\build\pnltri.js"
@set "DESTMINI=..\..\build\pnltri.min.js"


@rem	simple concatenation of source files
@echo %LICENSE% > %DESTPLAIN%
@FOR %%f in (%SRCFILES%) DO @type %%f >> %DESTPLAIN%


@rem	minified concatenation of source files
@echo %LICENSE% > %DESTMINI%
@java -jar compiler/compiler.jar --warning_level=VERBOSE --language_in=ECMASCRIPT5_STRICT --js %SRCFILES% >> %DESTMINI%
@rem further options:	--jscomp_off=globalThis --jscomp_off=checkTypes --externs externs.js

@pause

