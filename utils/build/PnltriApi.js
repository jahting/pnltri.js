/**
 * @author jahting / http://www.ameco.tv/
 *
 *	API: square bracket notation for names which shall be preserved
 *		 by Closure Compiler under option --compilation_level=ADVANCED_OPTIMIZATIONS
 *		http://code.google.com/closure/compiler/docs/api-tutorial3.html#export
 */

window['PNLTRI'] = PNLTRI;
PNLTRI['REVISION'] = PNLTRI.REVISION;

PNLTRI['Math'] = PNLTRI.Math;

PNLTRI['Triangulator'] = PNLTRI.Triangulator;
PNLTRI.Triangulator.prototype['clear_lastData'] = PNLTRI.Triangulator.prototype.clear_lastData;
PNLTRI.Triangulator.prototype['get_PolyLeftArr'] = PNLTRI.Triangulator.prototype.get_PolyLeftArr;
PNLTRI.Triangulator.prototype['triangulate_polygon'] = PNLTRI.Triangulator.prototype.triangulate_polygon;

