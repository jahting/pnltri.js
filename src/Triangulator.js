/**
 * @author jahting / http://www.ameco.tv/
 */

/*******************************************************************************
 *
 *	Triangulator for Simple Polygons with Holes
 *
 *  polygon with holes:
 *	- one closed contour polygon chain
 *  - zero or more closed hole polygon chains
 *
 *	polygon chain (closed):
 *	- Array of vertex Objects with attributes "x" and "y"
 *		- representing the sequence of line segments
 *		- closing line segment (last->first vertex) is implied
 *		- line segments are non-zero length and non-crossing
 *
 *	"global vertex index":
 *	- vertex number resulting from concatenation all polygon chains (starts with 0)
 *
 *
 *	Parameters (will not be changed):
 *		inPolygonChains:
 *		- Array of polygon chains
 *
 *	Results (are a fresh copy):
 *		triangulate_polygon:
 *		- Array of Triangles ( Array of 3 "global vertex index" values )
 *
 ******************************************************************************/

/** @constructor */
PNLTRI.Triangulator = function () {
	
	this.lastPolyData = null;		// for Debug purposes only
	
};


PNLTRI.Triangulator.prototype = {

	constructor: PNLTRI.Triangulator,

	
	triangulate_polygon: function ( inPolygonChains ) {
		if ( ( !inPolygonChains ) || ( inPolygonChains.length == 0 ) )		return	[];
		//
		// initializes general polygon data structure
		//
		var myPolygonData = new PNLTRI.PolygonData( inPolygonChains );
		//
		// splits polygon into uni-y-monotone sub-polygons
		//
		var	myMonoSplitter = new PNLTRI.MonoSplitter( myPolygonData );
		myMonoSplitter.monotonate_trapezoids();
		//
		// triangulates all uni-y-monotone sub-polygons
		//
		var	myTriangulator = new PNLTRI.MonoTriangulator( myPolygonData );
		myTriangulator.triangulate_all_polygons();
		//
		this.lastPolyData = myPolygonData;
		return	myPolygonData.getTriangles();	// copy of triangle list
	}

	
};

