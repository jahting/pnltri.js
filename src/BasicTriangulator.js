/**
 * Simple Polygon Triangulation by Ear Clipping
 *
 * description of technique employed:
 *	http://www.siggraph.org/education/materials/HyperGraph/scanline/outprims/polygon1.htm
 *
 * This code is a quick port of code written in C++ which was submitted to
 *	flipcode.com by John W. Ratcliff  // July 22, 2000
 * See original code and more information here:
 *	http://www.flipcode.com/archives/Efficient_Polygon_Triangulation.shtml
 *
 * ported to actionscript by Zevan Rosser
 *	http://actionsnippet.com/?p=1462
 *
 * ported to javascript by Joshua Koo
 *	http://www.lab4games.net/zz85/blog
 *
 */

/** @constructor */
PNLTRI.BasicTriangulator = function ( inPolygonData ) {

	this.polyData	= inPolygonData;

};



PNLTRI.BasicTriangulator.prototype = {

	constructor: PNLTRI.BasicTriangulator,


	// triangulates first doubly linked segment list in this.polyData
	//	algorithm uses ear-clipping and runs in O(n^2) time

	triangulate_polygon_no_holes: function () {

		function isEarAt( vertex ) {

			var prevX = vertex.mprev.vFrom.x;
			var prevY = vertex.mprev.vFrom.y;

			var vertX = vertex.vFrom.x;
			var vertY = vertex.vFrom.y;

			var nextX = vertex.mnext.vFrom.x;
			var nextY = vertex.mnext.vFrom.y;

			var vnX = nextX - vertX,  vnY = nextY - vertY;
			var npX = prevX - nextX,  npY = prevY - nextY;
			var pvX = vertX - prevX,  pvY = vertY - prevY;

			// concave angle at vertex -> not an ear to cut off
			if ( PNLTRI.Math.EPSILON_P > ( ( pvX * vnY ) - ( vnX * pvY ) ) ) return false;

			// check whether any other point lieas within the triangle abc
			var vStop	= vertex.mprev.mprev;
			var vOther	= vertex.mnext;
			while ( vOther != vStop ) {
				vOther = vOther.mnext;
				var otherX = vOther.vFrom.x;
				var otherY = vOther.vFrom.y;

				var poX = otherX - prevX,  poY = otherY - prevY;
					// just in case there are several vertices with the same coordinate
					if ( ( poX == 0 ) && ( poY == 0 ) )		continue;	// vOther == vertex.mprev
				var voX = otherX - vertX,  voY = otherY - vertY;
					if ( ( voX == 0 ) && ( voY == 0 ) )		continue;	// vOther == vertex
				var noX = otherX - nextX,  noY = otherY - nextY;
					if ( ( noX == 0 ) && ( noY == 0 ) )		continue;	// vOther == vertex.mnext

				// if vOther is inside triangle abc -> not an ear to cut off
				if ( ( ( vnX * voY - vnY * voX ) >= PNLTRI.Math.EPSILON_N ) &&
					 ( ( pvX * poY - pvY * poX ) >= PNLTRI.Math.EPSILON_N ) &&
					 ( ( npX * noY - npY * noX ) >= PNLTRI.Math.EPSILON_N ) ) return false;
			}
			return true;

		};

		var myPolyData = this.polyData;
		var startSeg = myPolyData.getFirstSegment();

		// create a counter-clockwise ordered doubly linked list (monoChain links)

		var cursor = startSeg;
		if ( myPolyData.isClockWise( startSeg ) ) {
			do {	// reverses chain order
				cursor.mprev = cursor.snext;
				cursor.mnext = cursor.sprev;
				cursor = cursor.sprev;
			} while ( cursor != startSeg );
		} else {
			do {
				cursor.mprev = cursor.sprev;
				cursor.mnext = cursor.snext;
				cursor = cursor.snext;
			} while ( cursor != startSeg );
		}

		//  remove all vertices except 2, creating 1 triangle every time

		var vertex = startSeg;
		var fullLoop = vertex;   // prevent infinite loop on "defective" polygons
		
		while ( vertex.mnext != vertex.mprev ) {
			if ( isEarAt( vertex ) ) {
				// found a triangle ear to cut off
				this.polyData.addTriangle( vertex.mprev.vFrom, vertex.vFrom, vertex.mnext.vFrom );
				// remove vertex from the remaining chain
				vertex.mprev.mnext = vertex.mnext;
				vertex.mnext.mprev = vertex.mprev;
				vertex = vertex.mnext;
				fullLoop = vertex;			// reset error detection
			} else {
				vertex = vertex.mnext;
				// loop?: probably non-simple polygon -> stop with error
				if ( vertex == fullLoop )	return false;
			}
		}

		return true;

	},

};

