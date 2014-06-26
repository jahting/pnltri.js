// pnltri.js / raw.github.com/jahting/pnltri.js/master/LICENSE
/**
 * @author jahting / http://www.ameco.tv/
 *
 *	(Simple) Polygon Near-Linear Triangulation
 *	  with fast ear-clipping for polygons without holes
 *
 */
 
var PNLTRI = { REVISION: '1.2' };

//	#####  Global Constants  #####


//	#####  Global Variables  #####


/**
 * @author jahting / http://www.ameco.tv/
 */

PNLTRI.Math = {

	log2: function ( inNum ) {
		// return	Math.log2(inNum);			// not everywhere defined !!
		return	Math.log(inNum)/Math.LN2;
	},

	random: Math.random,		// function to use for random number generation

	// generate random ordering in place:
	//	Fisher-Yates shuffle
	array_shuffle: function( inoutArray ) {
		for (var i = inoutArray.length - 1; i > 0; i-- ) {
			var j = Math.floor( PNLTRI.Math.random() * (i+1) );
			var tmp = inoutArray[i];
			inoutArray[i] = inoutArray[j];
			inoutArray[j] = tmp;
		}
		return	inoutArray;
	},

	ptsCrossProd: function ( inPtVertex, inPtFrom, inPtTo ) {
		// two vectors: ( inPtVertex -> inPtFrom ), ( inPtVertex -> inPtTo )
		return	( inPtFrom.x - inPtVertex.x ) * ( inPtTo.y - inPtVertex.y ) -
				( inPtFrom.y - inPtVertex.y ) * ( inPtTo.x - inPtVertex.x );
		// <=> crossProd( inPtFrom-inPtVertex, inPtTo-inPtVertex )
		// == 0: colinear (angle == 0 or 180 deg == PI rad)
		// > 0:  v lies left of u
		// < 0:  v lies right of u
	},

}

// precision of floating point arithmetic
//	PNLTRI.Math.EPSILON_P = Math.pow(2,-32);	// ~ 0.0000000001
	PNLTRI.Math.EPSILON_P = Math.pow(2,-43);	// ~ 0.0000000000001
	PNLTRI.Math.EPSILON_N = -PNLTRI.Math.EPSILON_P;

//	Problem with EPSILON-compares:
//	- especially when there is a x-coordinate ordering on equal y-coordinates
//		=> either NO EPSILON-compares on y-coordinates, since almost equal y
//			can have very different x - so they are not nearly close
//		or EPSILON must be bigger: Solution so far.
/**
 * @author jahting / http://www.ameco.tv/
 */

/** @constructor */
PNLTRI.PolygonData = function ( inPolygonChainList ) {

	// list of polygon vertices
	//	.x, .y: coordinates
	//	.outSegs: Array of outgoing segments from this point
	//		{ vertTo: next vertex, segOut: outgoing segments-Entry }
	// outSegs[0] is the original polygon segment, the others are added
	//  during the subdivision into uni-y-monotone polygons
	this.vertices = [];

	// list of polygon segments, original and additional ones added
	//  during the subdivision into uni-y-monotone polygons (s. this.monoSubPolyChains)
	// doubly linked by: snext, sprev
	this.segments = [];
	
	// for the ORIGINAL polygon chains
	this.idNextPolyChain = 0;
	//	for each original chain: lies the polygon inside to the left?
	//	"true": winding order is CCW for a contour or CW for a hole
	//	"false": winding order is CW for a contour or CCW for a hole
	this.PolyLeftArr = [];
	
	// indices into this.segments: at least one for each monoton chain for the polygon
	//  these subdivide the polygon into uni-y-monotone polygons, that is
	//  polygons that have only one segment between ymax and ymin on one side
	//  and the other side has monotone increasing y from ymin to ymax
	// the monoSubPolyChains are doubly linked by: mnext, mprev
	this.monoSubPolyChains = [];
	
	// list of triangles: each 3 indices into this.vertices
	this.triangles = [];
	
	// initialize optional polygon chains
	if ( inPolygonChainList ) {
		for (var i=0, j=inPolygonChainList.length; i<j; i++) {
			this.addPolygonChain( inPolygonChainList[i] );
		}
	}

};


PNLTRI.PolygonData.prototype = {

	constructor: PNLTRI.PolygonData,
	
	
	/*	Accessors  */
	
	getSegments: function () {
		return	this.segments;
	},
	getFirstSegment: function () {
		return	this.segments[0];
	},
	getMonoSubPolys: function () {
		return	this.monoSubPolyChains;
	},
	getTriangles: function () {
		return	this.triangles.concat();
	},

	nbPolyChains: function () {
		return	this.idNextPolyChain;
	},
	
	// for the polygon data AFTER triangulation
	//	returns an Array of flags, one flag for each polygon chain:
	//		lies the inside of the polygon to the left?
	//		"true" implies CCW for contours and CW for holes
	get_PolyLeftArr: function () {
		return	this.PolyLeftArr.concat();
	},
	set_PolyLeft_wrong: function ( inChainId ) {
		this.PolyLeftArr[inChainId] = false;
	},

		
	/*	Helper  */
	
	//	like compare (<=>)
	//		yA > yB resp. xA > xB: 1, equal: 0, otherwise: -1
	compare_pts_yx: function ( inPtA, inPtB ) {
		var deltaY = inPtA.y - inPtB.y;
		if ( deltaY > PNLTRI.Math.EPSILON_P ) {
			return 1;
		} else if ( deltaY < PNLTRI.Math.EPSILON_N ) {
			return -1;
		} else {
			var deltaX = inPtA.x - inPtB.x;
			if ( deltaX > PNLTRI.Math.EPSILON_P ) {
				return  1;
			} else if ( deltaX < PNLTRI.Math.EPSILON_N ) {
				return -1;
			} else {
				return  0;
			}
		}
	},

	// checks winding order by calculating the area of the polygon
	isClockWise: function ( inStartSeg ) {
		var cursor = inStartSeg, doubleArea = 0;
		do {
			doubleArea += ( cursor.vFrom.x - cursor.vTo.x ) * ( cursor.vFrom.y + cursor.vTo.y );
			cursor = cursor.snext;
		} while ( cursor != inStartSeg );
		return	( doubleArea < 0 );
	},

	
	/*	Operations  */
	
	appendVertexEntry: function ( inVertex ) {			// private
		var vertex = inVertex ? inVertex : {
			x: null,		// coordinates
			y: null,
			outSegs: [],	// outbound segments (up to 4)
			};
		vertex.id = this.vertices.length;
		this.vertices.push( vertex );
		return	vertex;
	},


	createSegmentEntry: function ( inVertexFrom, inVertexTo ) {			// private
		return	{
			chainId: this.idNextPolyChain,
			// end points of segment
			vFrom: inVertexFrom,	// -> start point entry in vertices
			vTo: inVertexTo,		// -> end point entry in vertices
			// upward segment? (i.e. vTo > vFrom)
			upward: ( this.compare_pts_yx(inVertexTo, inVertexFrom) == 1 ),
			// doubly linked list of original polygon chains (not the monoChains !)
			sprev: null,			// previous segment
			snext: null,			// next segment
		};
	},
	
	appendSegmentEntry: function ( inSegment ) {				// private
		this.segments.push( inSegment );
		if ( this.monoSubPolyChains.length == 0 ) {
			this.monoSubPolyChains = [ this.segments[0] ];
		}
		return	inSegment;
	},
	

	addVertexChain: function ( inRawPointList ) {			// private
		
		function verts_equal( inVert1, inVert2 ) {
			return ( ( Math.abs(inVert1.x - inVert2.x) < PNLTRI.Math.EPSILON_P ) &&
					 ( Math.abs(inVert1.y - inVert2.y) < PNLTRI.Math.EPSILON_P ) );
		}
		
		var newVertices = [];
		var newVertex, acceptVertex, prevIdx;
		for ( var i=0; i < inRawPointList.length; i++ ) {
			newVertex = this.appendVertexEntry( { x: inRawPointList[i].x,
												  y: inRawPointList[i].y } );
			// suppresses zero-length segments
			acceptVertex = true;
			prevIdx = newVertices.length-1;
			if ( ( prevIdx >= 0 ) &&
				 verts_equal( newVertex, newVertices[prevIdx] ) ) {
			 	acceptVertex = false;
			}
			if ( acceptVertex )	newVertices.push( newVertex );
		}
		// compare last vertex to first: suppresses zero-length segment
		if ( ( newVertices.length > 1 ) &&
			 verts_equal( newVertices[newVertices.length-1], newVertices[0] ) ) {
			newVertices.pop();
		}
		
		return	newVertices;
	},
	

	addPolygonChain: function ( inRawPointList ) {			// <<<<<< public
		
		// vertices
		var newVertices = this.addVertexChain( inRawPointList );
		if ( newVertices.length < 3 ) {
			console.log( "Polygon has < 3 vertices!", newVertices );
			return	0;
		}
		
		// segments
		var	saveSegListLength = this.segments.length;
		//
		var	segment, firstSeg, prevSeg;
		for ( var i=0; i < newVertices.length-1; i++ ) {
			segment = this.createSegmentEntry( newVertices[i], newVertices[i+1] );
			if (prevSeg) {
				segment.sprev = prevSeg;
				prevSeg.snext = segment;
			} else {
				firstSeg = segment;
			}
			prevSeg = segment;
			this.appendSegmentEntry( segment );
		}
		// close polygon
		segment = this.createSegmentEntry( newVertices[newVertices.length-1], newVertices[0] );
		segment.sprev = prevSeg;
		prevSeg.snext = segment;
		this.appendSegmentEntry( segment );
		firstSeg.sprev = segment;
		segment.snext = firstSeg;
		
		this.PolyLeftArr[this.idNextPolyChain++] = true;
		return	this.segments.length - saveSegListLength;
	},

	
	// reverse winding order of a polygon chain
	reverse_polygon_chain: function ( inSomeSegment ) {
		this.set_PolyLeft_wrong( inSomeSegment.chainId );
		var tmp, frontSeg = inSomeSegment;
		do {
			// change link direction
			tmp = frontSeg.snext;
			frontSeg.snext = frontSeg.sprev;
			frontSeg.sprev = tmp;
			// exchange vertices
			tmp = frontSeg.vTo;
			frontSeg.vTo = frontSeg.vFrom;
			frontSeg.vFrom = tmp;
			frontSeg.upward = !frontSeg.upward;
			// continue with old snext
			frontSeg = frontSeg.sprev;
		} while ( frontSeg != inSomeSegment );
	},
	

	/* Monotone Polygon Chains */
	
	initMonoChains: function () {										// <<<<<< public
		// populate links for monoChains and vertex.outSegs
		for (var i = 0; i < this.segments.length; i++) {
			// already visited during unique monoChain creation ?
			this.segments[i].marked = false;
			// doubly linked list for monotone chains (sub-polygons)
			this.segments[i].mprev = this.segments[i].sprev;
			this.segments[i].mnext = this.segments[i].snext;
			// out-going segments of a vertex (max: 4)
			this.segments[i].vFrom.outSegs = [ { segOut: this.segments[i],			// first outgoing segment
												 vertTo: this.segments[i].vTo } ];	// next vertex: other end of outgoing segment
		}
	},

	
	appendVertexOutsegEntry: function ( inVertexFrom, inOutSegEntry ) {
		var outSegEntry = inOutSegEntry ? inOutSegEntry : {
			segOut: null,		// -> segments: outgoing segment
			vertTo: null,		// -> next vertex: other end of outgoing segment
			};
		inVertexFrom.outSegs.push( outSegEntry );
		return	outSegEntry;
	},
		

	// Split the polygon chain (mprev, mnext !) including inVertLow and inVertHigh into
	// two chains by adding two new segments (inVertLow, inVertHigh) and (inVertHigh, inVertLow).
	//
	// This function assumes that all segments have the polygon-"inside" to their left
	//	that means for contour CCW winding order and for holes CW winding order
	// This function can also work if all segments have the polygon-"inside" to their right
	//	(contour: CW, holes: CCW) with the following changes:
	//	- inverting whether currPoly gets (inVertLow -> inVertHigh) or (inVertHigh -> inVertLow)
	//	- looking for the outSegs to the left instead of to the right
	//  The function can work for both cases since the polygon winding order
	//	 can be detected internally after trapezoidation.
	//		-- All this can be seen below - commented out! --
	// BUT, if we make no assumption on the polygon winding order of the input
	//	polygons, we cannot even assume winding order to be consistent between
	//	contours and holes. Allowing for that would make this function much more
	//	complicated. So it's easier to change the winding order into a consistent state.
	// The last step - the triangulatin of the monotone polygons - currently
	//	also still needs the CCW winding order.
	//
	// So if we have to normalize winding order anyway, we can as well define
	//	'all segments have the polygon-"inside" to their left' as the norm.
	//
	// If inVertLow and inVertHigh shall be exchanged, only inCurrPolyLiesToTheLeft
	//	and the assignments of "upward" have to be inverted.
	//
	// returns an index to the new polygon chain.

	splitPolygonChain: function ( inCurrPolyIdx, inVertLow, inVertHigh, inCurrPolyLiesToTheLeft ) {			// <<<<<< public

		// monotone mapping of the CCW angle between the two vectors:
		//	inPtVertex->inPtFrom and inPtVertex->inPtTo
		//  from 0..360 degrees onto the range of 0..4
		//		0..90 -> 0..1, 90..180 -> 1..2, ...
		// result-curve (looking like an upward stair/wave) is:
		//	  0 to 180 deg: 1 - cos(theta)
		//  180 to 360 deg: 2 + cos(theta)    (same shape as for 0-180 but pushed up)

		function mapAngle( inPtVertex, inPtFrom, inPtTo ) {
		
			function vectorLength(v0) {		// LENGTH
				return	Math.sqrt( v0.x * v0.x + v0.y * v0.y );
			}
			function dotProd(v0, v1) {
				// DOT: cos(theta) * len(v0) * len(v1)
				return	( v0.x * v1.x + v0.y * v1.y );
			}
			function crossProd(v0, v1) {
				// CROSS_SINE: sin(theta) * len(v0) * len(v1)
				return	( v0.x * v1.y - v1.x * v0.y );
				// == 0: colinear (theta == 0 or 180 deg == PI rad)
				// > 0:  v1 lies left of v0, CCW angle from v0 to v1 is convex ( < 180 deg )
				// < 0:  v1 lies right of v0, CW angle from v0 to v1 is convex ( < 180 deg )
			}
			
			var v0 = {	x: inPtFrom.x - inPtVertex.x,			// Vector inPtVertex->inPtFrom
						y: inPtFrom.y - inPtVertex.y }
			var v1 = {	x: inPtTo.x - inPtVertex.x,				// Vector inPtVertex->inPtTo
						y: inPtTo.y - inPtVertex.y }
			var cosine = dotProd(v0, v1)/vectorLength(v0)/vectorLength(v1);
																// CCW angle from inPtVertex->inPtFrom
			if ( crossProd(v0, v1) >= 0 )	return 1-cosine;	// to inPtTo <= 180 deg. (convex, to the left)
			else							return 3+cosine;	// to inPtTo > 180 deg. (concave, to the right)
		}

		// search for the outSegment "segNext" so that the CCW angle between
		//	inVertFrom->segNext.vertTo and inVertFrom->inVertTo is smallest/biggest
		//	=> inVertFrom->segNext.vertTo is the next to the right/left of inVertFrom->inVertTo

		function get_out_segment_next_right_of( inVertFrom, inVertTo ) {

			var tmpSeg, tmpAngle;

			var segNext = null;
			var minAngle = 4.0;			// <=> 360 degrees
			for (var i = 0; i < inVertFrom.outSegs.length; i++) {
				tmpSeg = inVertFrom.outSegs[i]
				if ( ( tmpAngle = mapAngle( inVertFrom, tmpSeg.vertTo, inVertTo ) ) < minAngle ) {
					minAngle = tmpAngle;
					segNext = tmpSeg;
				}
			}
			return	segNext;
		}

/*		function get_out_segment_next_left_of( inVertFrom, inVertTo ) {

			var tmpSeg, tmpAngle;

			var segNext = null;
			var maxAngle = 0.0;			// <=> 0 degrees
			for (var i = 0; i < inVertFrom.outSegs.length; i++) {
				tmpSeg = inVertFrom.outSegs[i]
				if ( ( tmpAngle = mapAngle( inVertFrom, tmpSeg.vertTo, inVertTo ) ) > maxAngle ) {
					maxAngle = tmpAngle;
					segNext = tmpSeg;
				}
			}
			return	segNext;
		}


		var borderOutSeg = inVertLow.outSegs[0].segOut;
		var	insideToTheLeft = borderOutSeg.trLeft ?
				( borderOutSeg.upward == ( ( borderOutSeg.trLeft.depth % 2 ) == 1 ) ) :
				true;		// for tests before trapezoidation only !!		*/
		
		// (inVertLow, inVertHigh) is the new diagonal to be added to the polygon.
		
		// To keep polygon winding order consistent currPoly gets
		//	(inVertLow -> inVertHigh) or (inVertHigh -> inVertLow) depending on this existing
		//	winding order and on the side of (inVertLow, inVertHigh) where currPoly lies
		var currPoly_gets_newSegLow2High;

		// find the outSegs from inVertLow and inVertHigh which belong to the chain split by the new diagonal
		var vertLowOutSeg, vertHighOutSeg;
		
/*		if ( insideToTheLeft ) {	*/
			currPoly_gets_newSegLow2High = inCurrPolyLiesToTheLeft;
			vertLowOutSeg  = get_out_segment_next_right_of( inVertLow, inVertHigh );
			vertHighOutSeg = get_out_segment_next_right_of( inVertHigh, inVertLow );
/*		} else {
			currPoly_gets_newSegLow2High = !inCurrPolyLiesToTheLeft;
			vertLowOutSeg  = get_out_segment_next_left_of( inVertLow, inVertHigh );
			vertHighOutSeg = get_out_segment_next_left_of( inVertHigh, inVertLow );
		}		*/
		
		var segOutFromVertLow  = vertLowOutSeg.segOut;
		var segOutFromVertHigh = vertHighOutSeg.segOut;
		
		// create new segments
		var newSegLow2High = this.appendSegmentEntry( { vFrom: inVertLow, vTo: inVertHigh, upward: true,	// upward,
								mprev: segOutFromVertLow.mprev, mnext: segOutFromVertHigh } );
		var newSegHigh2Low = this.appendSegmentEntry( { vFrom: inVertHigh, vTo: inVertLow, upward: false,	// !upward,
								mprev: segOutFromVertHigh.mprev, mnext: segOutFromVertLow } );
		
		// populate "outgoing segment" from vertices
		this.appendVertexOutsegEntry( inVertLow, { segOut: newSegLow2High, vertTo: inVertHigh } );
		this.appendVertexOutsegEntry( inVertHigh, { segOut: newSegHigh2Low, vertTo: inVertLow } );
		
		// modify linked lists
		segOutFromVertLow.mprev.mnext  = newSegLow2High;
		segOutFromVertHigh.mprev.mnext = newSegHigh2Low;
		
		segOutFromVertLow.mprev  = newSegHigh2Low;
		segOutFromVertHigh.mprev = newSegLow2High;

		// add new segments to correct polygon chain to preserve winding order
		var newPolyIdx = this.monoSubPolyChains.length;
		if ( currPoly_gets_newSegLow2High ) {
			this.monoSubPolyChains[inCurrPolyIdx] = newSegLow2High;
			this.monoSubPolyChains[   newPolyIdx] = newSegHigh2Low;
		} else {
			this.monoSubPolyChains[inCurrPolyIdx] = newSegHigh2Low;
			this.monoSubPolyChains[   newPolyIdx] = newSegLow2High;
		}
		
		return	newPolyIdx;
	},

	// For each monotone polygon, find the ymax (to determine the two
	// y-monotone chains) and skip duplicate monotone polygons
	
	unique_monotone_chains_max: function () {		// private
		var frontMono, monoPosmax;
		var frontPt, firstPt, ymaxPt;
		
		var i;
		for ( i=0; i<this.segments.length; i++ ) { this.segments[i].marked = false; }
		
		var	uniqueMonoChainsMax = [];
		for ( i=0; i<this.monoSubPolyChains.length; i++ ) {
			// loop through uni-monotone chains
			frontMono = monoPosmax = this.monoSubPolyChains[i];
			firstPt = ymaxPt = frontMono.vFrom;

			frontMono.marked = true;
			frontMono = frontMono.mnext;
			
			var processed = false;
			while ( (frontPt = frontMono.vFrom) != firstPt ) {
				if (frontMono.marked) {
					processed = true;
					break;	// from while
				} else {
					frontMono.marked = true;
				}
				if ( this.compare_pts_yx( frontPt, ymaxPt ) == 1 ) {
					ymaxPt = frontPt;
					monoPosmax = frontMono;
				}
				frontMono = frontMono.mnext;
			}
			if (processed) continue;	// Go to next polygon
			uniqueMonoChainsMax.push(monoPosmax);
		}
		return	uniqueMonoChainsMax;
	},
	
	normalize_monotone_chains: function () {			// <<<<<< public
		this.monoSubPolyChains = this.unique_monotone_chains_max();
		
/*		function winding_order_ok( inSubPolyChains ) {
			for (var i=0, il = inSubPolyChains.length; i<il; i++ ) {
				var monoPosmax = inSubPolyChains[i];
				if ( !monoPosmax.trLeft )	continue;
				if ( ( monoPosmax.trLeft.depth % 2 ) == 1 )		return false;		// wrong winding order
			}
			return	true;
		}

		if ( !winding_order_ok( this.monoSubPolyChains ) ) {
			for ( i=0; i<this.segments.length; i++ ) {
				var tmp = this.segments[i].mprev;
				this.segments[i].mprev = this.segments[i].mnext;
				this.segments[i].mnext = tmp;
			}
		}	*/
		
		return	this.monoSubPolyChains.length;
	},

	
	/* Triangles */
	
	clearTriangles: function () {
		this.triangles = [];
	},
	
	addTriangle: function ( inVert1, inVert2, inVert3 ) {
		this.triangles.push( [ inVert1.id, inVert2.id, inVert3.id ] );
	},
	
};

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
 * adapted to doubly linked list by Juergen Ahting
 *	http://www.ameco.tv
 *
 */

/** @constructor */
PNLTRI.EarClipTriangulator = function ( inPolygonData ) {

	this.polyData	= inPolygonData;

};


PNLTRI.EarClipTriangulator.prototype = {

	constructor: PNLTRI.EarClipTriangulator,


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
			myPolyData.set_PolyLeft_wrong(0);
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

/*	// takes one element of a double linked segment list
	//	works on array of vertices

	triangulate_polygon_no_holes: function () {
		var startSeg = this.polyData.getFirstSegment();

		function vertList( inStartSeg ) {
			var verts = [];
			// we want a counter-clockwise polygon in verts
			var doubleArea = 0.0;
			var cursor = inStartSeg;
			var p,q;
			var idx = 0;
			do {
				p = cursor.sprev.vFrom;
				q = cursor.vFrom;
				doubleArea += p.x * q.y - q.x * p.y;
				verts[idx++] = q;
				cursor = cursor.snext;
			} while ( cursor != inStartSeg );
			if ( doubleArea < 0.0 ) {
				verts = verts.reverse();
				var tmp = verts.pop();
				verts.unshift( tmp );
			}
			return	verts;
		}

		function snip( verts, u, v, w, n ) {

			var ax = verts[ u ].x;
			var ay = verts[ u ].y;

			var bx = verts[ v ].x;
			var by = verts[ v ].y;

			var cx = verts[ w ].x;
			var cy = verts[ w ].y;

			if ( PNLTRI.Math.EPSILON_P > ( ( bx - ax ) * ( cy - ay ) - ( by - ay ) * ( cx - ax ) ) ) return false;

			var aX, aY, bX, bY, cX, cY;

			aX = cx - bx;  aY = cy - by;
			bX = ax - cx;  bY = ay - cy;
			cX = bx - ax;  cY = by - ay;

			var p, px, py;

			var apx, apy, bpx, bpy, cpx, cpy;
			var cCROSSap, bCROSScp, aCROSSbp;

			for ( p = 0; p < n; p ++ ) {

				px = verts[ p ].x
				py = verts[ p ].y

				apx = px - ax;  apy = py - ay;
					if ( ( apx == 0 ) && ( apy == 0 ) )		continue;
				bpx = px - bx;  bpy = py - by;
					if ( ( bpx == 0 ) && ( bpy == 0 ) )		continue;
				cpx = px - cx;  cpy = py - cy;
					if ( ( cpx == 0 ) && ( cpy == 0 ) )		continue;

				// see if p is inside triangle abc

				aCROSSbp = aX * bpy - aY * bpx;
				cCROSSap = cX * apy - cY * apx;
				bCROSScp = bX * cpy - bY * cpx;

				if ( ( aCROSSbp >= PNLTRI.Math.EPSILON_N ) &&
					 ( bCROSScp >= PNLTRI.Math.EPSILON_N ) &&
					 ( cCROSSap >= PNLTRI.Math.EPSILON_N ) ) return false;

			}

			return true;

		};

		var result = [];

		var	verts = vertList( startSeg );

		var n = verts.length;
		var nv = n;

		var u, v, w;

		//  remove nv - 2 vertices, creating 1 triangle every time

		var count = 2 * nv;   // error detection

		for ( v = nv - 1; nv > 2; ) {

			// if we loop, it is probably a non-simple polygon

			if ( ( count -- ) <= 0 )	return false;

			// three consecutive vertices in current polygon, <u,v,w>

			u = v; 	 	if ( nv <= u ) u = 0;     // previous
			v = u + 1;  if ( nv <= v ) v = 0;     // new v
			w = v + 1;  if ( nv <= w ) w = 0;     // next

			if ( snip( verts, u, v, w, nv ) ) {

				// output Triangle

				this.polyData.addTriangle( verts[ u ], verts[ v ], verts[ w ] );

				// remove v from the remaining polygon

				var s, t;

				for ( s = v, t = v + 1; t < nv; s++, t++ ) {

					verts[ s ] = verts[ t ];

				}
				
				nv --;

				v --;
				if ( v < 0 )	v = nv-1;

				// reset error detection counter

				count = 2 * nv;

			}

		}

		return true;

	},		*/

};

/**
 * @author jahting / http://www.ameco.tv/
 *
 *	Algorithm to create the trapezoidation of a polygon with holes
 *	 according to Seidel's algorithm [Sei91]
 */

PNLTRI.trapCnt = 0;		// Sequence for trapezoid IDs

/** @constructor */
PNLTRI.Trapezoid = function ( inHigh, inLow, inLeft, inRight ) {
	
	this.trapID = PNLTRI.trapCnt++;			// for Debug

	this.vHigh = inHigh ? inHigh : { x: Number.POSITIVE_INFINITY, y: Number.POSITIVE_INFINITY };
	this.vLow  = inLow  ? inLow  : { x: Number.NEGATIVE_INFINITY, y: Number.NEGATIVE_INFINITY };
	
	this.lseg = inLeft;
	this.rseg = inRight;
		
//	this.sink = null;			// link to corresponding node (T_SINK) in QueryStructure
		
//	this.usave = null;			// temp: uL/uR, preserved for next step
//	this.uside = null;			// temp: PNLTRI.S_LEFT(uL), PNLTRI.S_RIGHT(uR)
	
	this.depth = -1;			// no depth assigned yet
	
	this.monoDiag = null;		// splitting diagonal during monotonization ?
	
};

PNLTRI.Trapezoid.prototype = {

	constructor: PNLTRI.Trapezoid,

	clone: function () {
		var newTrap = new PNLTRI.Trapezoid( this.vHigh, this.vLow, this.lseg, this.rseg );
		
		newTrap.uL = this.uL;
		newTrap.uR = this.uR;
		
		newTrap.dL = this.dL;
		newTrap.dR = this.dR;
		
		newTrap.sink = this.sink;

		return	newTrap;
	},

	
	setAbove: function ( inTrap1, inTrap2 ) {
		this.uL = inTrap1;
		this.uR = inTrap2;
	},
	setBelow: function ( inTrap1, inTrap2 ) {
		this.dL = inTrap1;
		this.dR = inTrap2;
	},

	
	splitOffLower: function ( inSplitPt ) {
		var trLower = this.clone();				// new lower trapezoid
		
		this.vLow = trLower.vHigh = inSplitPt;
		
		this.setBelow( trLower, null );		// L/R unknown, anyway changed later
		trLower.setAbove( this, null );		// L/R unknown, anyway changed later
		
		if ( trLower.dL )	trLower.dL.uL = trLower;	// dL always connects to uL
		if ( trLower.dR )	trLower.dR.uR = trLower;	// dR always connects to uR
		
		return	trLower;
	},

};


/*==============================================================================
 *
 *============================================================================*/

// QS-Node types
PNLTRI.T_Y = 1;
PNLTRI.T_X = 2;
PNLTRI.T_SINK = 3;

// for split-direction
PNLTRI.S_LEFT	= 1;
PNLTRI.S_RIGHT	= 2;


/** @constructor */
PNLTRI.QsNode = function ( inTrapezoid ) {
	// Only nodes of type T_SINK are created directly.
	// The others T_Y, T_X originate from splitting trapezoids
	// - by a horizontal line: T_SINK -> T_Y
	// - by a segment: T_SINK -> T_X
	this.nodetype = PNLTRI.T_SINK;
	this.trap = inTrapezoid;
	inTrapezoid.sink = this;
};

PNLTRI.QsNode.prototype = {

	constructor: PNLTRI.QsNode,

};

/*==============================================================================
 *
 *============================================================================*/

/** @constructor */
PNLTRI.QueryStructure = function ( inPolygonData ) {
	// initialise the query structure and trapezoid list
	PNLTRI.trapCnt = 0;
	
	var initialTrap = new PNLTRI.Trapezoid( null, null, null, null );

	this.root = new PNLTRI.QsNode( initialTrap );

	this.trapArray = [ initialTrap ];

	if ( inPolygonData ) {
		var segListArray = inPolygonData.getSegments();
		/*
		 * adds and initializes specific attributes for all segments
		 *	// -> QueryStructure: roots of partial tree where vertex is located
		 *	rootFrom, rootTo:	for vFrom, vTo
		 *	// marker
		 *	is_inserted:	already inserted into QueryStructure ?
		 */
		for ( var i = 0; i < segListArray.length; i++ ) {
			segListArray[i].rootFrom = segListArray[i].rootTo = this.root;
			segListArray[i].is_inserted = false;
		}
		this.compare_pts_yx = inPolygonData.compare_pts_yx;
	} else {
		this.compare_pts_yx = PNLTRI.PolygonData.prototype.compare_pts_yx;
	}
};

PNLTRI.QueryStructure.prototype = {

	constructor: PNLTRI.QueryStructure,

	getRoot: function () {
		return this.root;
	},
		
	
	cloneTrap: function ( inTrapezoid ) {
		var trap = inTrapezoid.clone();
		this.trapArray.push( trap );
		return	trap;
	},
	
	
	splitNodeAtPoint: function ( inNode, inPoint, inReturnUpper ) {
		// inNode: PNLTRI.T_SINK with trapezoid containing inPoint
		var trUpper = inNode.trap;							// trUpper: trapezoid includes the point
		if (trUpper.vHigh == inPoint)	return	inNode;				// (ERROR) inPoint is already inserted
		if (trUpper.vLow == inPoint)	return	inNode;				// (ERROR) inPoint is already inserted
		var trLower = trUpper.splitOffLower( inPoint );		// trLower: new lower trapezoid
		this.trapArray.push( trLower );
		
		inNode.nodetype = PNLTRI.T_Y;
		inNode.yval = inPoint;
		inNode.trap = null;		// no SINK anymore !!
		
		inNode.right = new PNLTRI.QsNode( trUpper );		// Upper trapezoid sink
		inNode.left = new PNLTRI.QsNode( trLower );			// Lower trapezoid sink
		
		return	inReturnUpper ? trUpper.sink : trLower.sink;
	},


	/*
	 * Mathematics & Geometry helper methods
	 */

	fpEqual: function ( inNum0, inNum1 ) {
		 return		Math.abs( inNum0 - inNum1 ) < PNLTRI.Math.EPSILON_P;
	},

	
	// Checks, whether the vertex inPt is to the left of line segment inSeg.
	//	Returns:
	//		>0: inPt is left of inSeg,
	//		<0: inPt is right of inSeg,
	//		=0: inPt is co-linear with inSeg
	//
	//	ATTENTION: always viewed from -y, not as if moving along the segment chain !!
	 
	is_left_of: function ( inSeg, inPt, inBetweenY ) {
		var	retVal, retVal2;
		var dXfrom = inSeg.vFrom.x - inPt.x;
		var dXto = inSeg.vTo.x - inPt.x;
		if ( Math.abs( inSeg.vTo.y - inPt.y ) < PNLTRI.Math.EPSILON_P ) {
			retVal = dXto; retVal2 = dXfrom;
		} else if ( Math.abs( inSeg.vFrom.y - inPt.y ) < PNLTRI.Math.EPSILON_P ) {
			retVal = dXfrom; retVal2 = dXto;
//		} else if ( inBetweenY && ( dXfrom * dXto > 0 ) ) {
			// both x-coordinates of inSeg are on the same side of inPt
//			retVal = dXto; retVal2 = dXfrom;
		} else {
			if ( inSeg.upward ) {
				return	PNLTRI.Math.ptsCrossProd( inSeg.vFrom, inSeg.vTo, inPt );
			} else {
				return	PNLTRI.Math.ptsCrossProd( inSeg.vTo, inSeg.vFrom, inPt );
			}
		}
		if ( Math.abs( retVal ) < PNLTRI.Math.EPSILON_P ) {
			if ( Math.abs( retVal2 ) < PNLTRI.Math.EPSILON_P )	return	0;
			return	retVal2;
		}
		return	retVal;
	},


	/*
	 * Query structure main methods
	 */
	
	//	This method finds the Node in the QueryStructure corresponding
	//   to the trapezoid that contains inPt, starting from Node inQsNode.
	//  If inPt lies on a border (y-line or segment) inPtOther is used
	//	 to determine on which side.
	
	ptNode: function ( inPt, inPtOther, inQsNode ) {

		var compPt, compRes;
		var sideRightAbove = true;			// above, right
		switch (inQsNode.nodetype) {
			case PNLTRI.T_SINK:		return inQsNode;
			case PNLTRI.T_Y:
				compPt = inPt;
				if ( compPt == inQsNode.yval )	compPt = inPtOther;				// the point is already inserted.
				compRes = this.compare_pts_yx( compPt, inQsNode.yval );
				if ( compRes == -1 )								sideRightAbove = false;		// below
/*				if ( compRes == 0 ) {			// TODO: Testcase
					console.log("ptNode: Pts too close together#1: ", compPt, inQsNode.yval );
				}		*/
				break;
			case PNLTRI.T_X:
				if ( ( inPt == inQsNode.seg.vFrom ) ||						// the point is already inserted.
					 ( inPt == inQsNode.seg.vTo ) ) {
					if ( this.fpEqual( inPt.y, inPtOther.y ) ) {
						// horizontal segment
						if ( inPtOther.x < inPt.x )		sideRightAbove = false;		// left
						break;
					} else {
						compRes = this.is_left_of( inQsNode.seg, inPtOther, false );
						if ( compRes > 0 )				sideRightAbove = false;		// left
						else if ( compRes == 0 ) {
							// co-linear reversal
							//	a co-linear continuation would not reach this point
							//  since the previous Y-node comparison would have led to a sink instead
//							console.log("ptNode: co-linear, going back on previous segment", inPt, inPtOther, inQsNode );
							// now as we have two consecutive co-linear segments we have to avoid a cross-over
							//	for this we need the far point on the "next" segment to the shorter of our two
							//	segments to avoid that "next" segment to cross the longer of our two segments
							if ( inPt == inQsNode.seg.vFrom ) {
								// connected at inQsNode.seg.vFrom
//								console.log("ptNode: co-linear, going back on previous segment, connected at inQsNode.seg.vFrom", inPt, inPtOther, inQsNode );
								sideRightAbove = true;				// ??? TODO: for test_add_segment_spezial_4B !!
							} else {
								// connected at inQsNode.seg.vTo
//								console.log("ptNode: co-linear, going back on previous segment, connected at inQsNode.seg.vTo", inPt, inPtOther, inQsNode );
								sideRightAbove = false;				// ??? TODO: for test_add_segment_spezial_4A !!
							}
						}
					}
					break;
				} else { 
/*					if ( ( this.compare_pts_yx( compPt, inQsNode.seg.vFrom ) *			// TODO: Testcase
					 	    this.compare_pts_yx( compPt, inQsNode.seg.vTo )
					 	   ) == 0 ) {
						console.log("ptNode: Pts too close together#2: ", compPt, inQsNode.seg );
					}		*/
					compPt = inPt;
					compRes = this.is_left_of( inQsNode.seg, compPt, true );
					if ( compRes > 0 )				sideRightAbove = false;		// left
					else if ( compRes == 0 ) {
						// ???TODO: for test_add_segment_spezial_4B !!
						// sideRightAbove = false;		// left
						sideRightAbove = true;		// right
					}
				}
				break;
			default:
				console.log("ptNode: undef. NodeType: ", inQsNode.nodetype);
		}
		if ( sideRightAbove )	return this.ptNode( inPt, inPtOther, inQsNode.right);
		else					return this.ptNode( inPt, inPtOther, inQsNode.left);
	},


 	// Add a new segment into the trapezoidation and update QueryStructure and Trapezoids
	// 1) locates the two endpoints of the segment in the QueryStructure and inserts them
	// 2) goes from the high-end trapezoid down to the low-end trapezoid
	//		changing all the trapezoids in between.
	// Except for the high-end and low-end no new trapezoids are created.
	// For all in between either:
	// - the existing trapezoid is restricted to the left of the new segment
	//		and on the right side the trapezoid from above is extended downwards
	// - or the other way round:
	//	 the existing trapezoid is restricted to the right of the new segment
	//		and on the left side the trapezoid from above is extended downwards
	
	add_segment: function ( inSegment ) {
		var scope = this;
		
		// functions handling the relationship to the upper neighbors (uL, uR)
		//	of trNewLeft and trNewRight
		
		function	fresh_seg_or_upward_cusp() {
			// trCurrent has at most 1 upper neighbor
			//	and should also have at least 1, since the high-point trapezoid
			//	has been split off another one, which is now above
			var trUpper = trCurrent.uL || trCurrent.uR;

			if ( trUpper.dL && trUpper.dR ) {
				// upward cusp: top forms a triangle

				// ATTENTION: the decision whether trNewLeft or trNewRight is the
				//	triangle trapezoid formed by the two segments has already been taken
				//	when selecting trCurrent as the left or right lower neighbor to trCurrent.uL !!
				
				if ( trCurrent == trUpper.dR ) {
					//	*** Case: FUC_UC_RIGHT; prev: ----
					// console.log( "fresh_seg_or_upward_cusp: upward cusp, new seg from the right!" );
					// !! trNewLeft and trNewRight cannot have been extended from above !!
					//		  upper
					//   -------*-------
					//		   / +
					//		  /   +	 NR
					//		 /	NL +
					//		/		+
					trNewLeft.setAbove( null, null );
					trNewRight.setAbove( null, trUpper );			// uL: unchanged -- TODO: always BOTH unchanged?
					trUpper.setBelow( trUpper.dL, trNewRight );		// dL: unchanged, NEVER null
				} else {
					//	*** Case: FUC_UC_LEFT; prev: ----
					// console.log( "fresh_seg_or_upward_cusp: upward cusp, new seg to the left!" );
					// !! trNewLeft and trNewRight cannot have been extended from above !!
					//		  upper
					//   -------*-------
					//		   + \
					//	  NL  +   \
					//		 +	NR \
					//		+		\
					trNewRight.setAbove( null, null );
					trNewLeft.setAbove( trUpper, null );			// uL: unchanged -- TODO: always BOTH unchanged?
					trUpper.setBelow( trNewLeft, trUpper.dR );		// dR: unchanged, NEVER null
				}
			} else {
				//	*** Case: FUC_FS; prev: ----
				// console.log( "fresh_seg_or_upward_cusp: fresh segment, high adjacent segment still missing" );
				// !! trNewLeft and trNewRight cannot have been extended from above !!
				//		  upper
				//   -------*-------
				//		   +
				//	  NL  +
				//		 +	NR
				//		+
				trNewLeft.setAbove( trUpper, null );			// TODO: redundant, if dL is default for unknown L/R ?
				trNewRight.setAbove( null, trUpper );
				trUpper.setBelow( trNewLeft, trNewRight );
			}
 		}
		
		function	continue_chain_from_above() {
			// trCurrent has at least 2 upper neighbors
			if ( trCurrent.usave ) {
				// 3 upper neighbors (part II)
				if ( trCurrent.uside == PNLTRI.S_LEFT ) {
					//	*** Case: CC_3UN_LEFT; prev: 1B_3UN_LEFT
					// console.log( "continue_chain_from_above: 3 upper neighbors (part II): u0a, u0b, uR(usave)" );
					// => left gets one, right gets two of the upper neighbors
					// !! trNewRight cannot have been extended from above
					//		and trNewLeft must have been !!
					//		   +		/
					//	  C.uL  + C.uR / C.usave
					//   --------+----*----------
					//		NL	  +		NR
					trNewRight.setAbove( trCurrent.uR, trCurrent.usave );
					trNewRight.uL.setBelow( trNewRight, null );
					trNewRight.uR.setBelow( null, trNewRight );
				} else {
					//	*** Case: CC_3UN_RIGHT; prev: 1B_3UN_RIGHT
					// console.log( "continue_chain_from_above: 3 upper neighbors (part II): uL(usave), u1a, u1b" );
					// => left gets two, right gets one of the upper neighbors
					// !! trNewLeft cannot have been extended from above
					//		and trNewRight must have been !!
					//			\		 +
					//	 C.usave \ C.uL + C.uR
					//   ---------*----+-------
					//			NL    +   NR
					trNewLeft.setAbove( trCurrent.usave, trCurrent.uL );
					trNewLeft.uL.setBelow( trNewLeft, null );
					trNewLeft.uR.setBelow( null, trNewLeft );
				}
				trNewLeft.usave = trNewRight.usave = null;
			} else if ( trCurrent.vHigh == trFirst.vHigh ) {		// && meetsHighAdjSeg ??? TODO
				//	*** Case: CC_2UN_CONN; prev: ----
				// console.log( "continue_chain_from_above: 2 upper neighbors, fresh seg, continues high adjacent seg" );
				// !! trNewLeft and trNewRight cannot have been extended from above !!
				//	  C.uL	 /  C.uR
				//   -------*---------
				//	   NL  +	NR
				trNewRight.setAbove( null, trCurrent.uR );			// uR unchanged ?
				trNewRight.uR.setBelow( null, trNewRight );
				trNewLeft.setAbove( trCurrent.uL, null );
			} else {
				//	*** Case: CC_2UN; prev: 1B_1UN_CONT, 2B_NCON_RIGHT, 2B_NCON_LEFT, 2B_NCON_TOUCH
				// console.log( "continue_chain_from_above: simple case, 2 upper neighbors (no usave, not fresh seg)" );
				// !! trNewLeft OR trNewRight will have been extended from above !!
				//	  C.uL	 +  C.uR
				//   -------+---------
				//	   NL  +	NR
				if ( changeRightUp ) {
					trNewRight.setAbove( trCurrent.uR, null );
					// second parameter is NOT always null (prev: 2B_NCON_LEFT, 2B_NCON_TOUCH)
					trNewRight.uL.setBelow( trNewRight, trNewRight.uL.dR );		// dR: unchanged
				}
				if ( changeLeftUp )	trNewLeft.setAbove( null, trCurrent.uL );
			}
 		}

		// functions handling the relationship to the lower neighbors (dL, dR)
		//	of trNewLeft and trNewRight

		function	only_one_trap_below( inTrNext ) {
			// console.log( "only_one_trap_below: (act.vLow.y, last.vLow.y)", trCurrent.vLow.y, trLast.vLow.y );
			// make trNewLeft and trNewRight the upper neighbors of the sole lower trapezoid inTrNext
			if ( ( trCurrent.vLow == trLast.vLow ) && meetsLowAdjSeg ) {
				// downward cusp: bottom forms a triangle

				// ATTENTION: the decision whether trNewLeft and trNewRight are to the
				//	left or right of the already inserted segment the new one meets here
				//	has already been taken when selecting trLast to the left or right
				//	of that already inserted segment !!

				if ( trCurrent.dL ) {
					//	*** Case: 1B_DC_LEFT; next: ----
					// console.log( "only_one_trap_below: downward cusp, new seg from the left!" );
					//		+		/
					//		 +  NR /
					//	  NL  +	  /
					//		   + /
					//   -------*-------
					//	   C.dL = next
					trNewLeft.setBelow( inTrNext, null );
					trNewRight.setBelow( null, null );
					inTrNext.setAbove( trNewLeft, inTrNext.uR );	// uR: unchanged, NEVER null
				} else {
					//	*** Case: 1B_DC_RIGHT; next: ----
					// console.log( "only_one_trap_below: downward cusp, new seg to the right!" );
					//		\		+
					//		 \  NL +
					//		  \	  +  NR
					//		   \ +
					//   -------*-------
					//	   C.dR = next
					trNewRight.setBelow( null, inTrNext );
					trNewLeft.setBelow( null, null );
					inTrNext.setAbove( inTrNext.uL, trNewRight );	// uL: unchanged, NEVER null
				}
			} else {
				if ( inTrNext.uL && inTrNext.uR ) {
					// inTrNext has two upper neighbors
					// => a segment ends on the upper Y-line of inTrNext
					// => inTrNext has temporarily 3 upper neighbors
					// => marks whether the new segment cuts through
					//		uL or uR of inTrNext and saves the other in .usave
					if ( inTrNext.uL == trCurrent ) {
						//	*** Case: 1B_3UN_LEFT; next: CC_3UN_LEFT
						// console.log( "only_one_trap_below: inTrNext has 3 upper neighbors (part I): u0a, u0b, uR(usave)" );
						//		 +		  /
						//	  NL  +	 NR	 /
						//		   +	/
						//   -------+--*----
						//			 +
						//		  next
						inTrNext.usave = inTrNext.uR;
						inTrNext.uside = PNLTRI.S_LEFT;

						trNewLeft.setBelow( inTrNext, null );		// L/R undefined, will be extended down and changed anyway
						trNewRight.setBelow( inTrNext, null );
					} else {
						//	*** Case: 1B_3UN_RIGHT; next: CC_3UN_RIGHT
						// console.log( "only_one_trap_below: inTrNext has 3 upper neighbors (part I): uL(usave), u1a, u1b" );
						//	 \		   +
						//	  \	  NL  +  NR
						//	   \	 +
						//   ---*---+-------
						//		   +
						//		  next
						inTrNext.usave = inTrNext.uL;
						inTrNext.uside = PNLTRI.S_RIGHT;

						trNewLeft.setBelow( null, inTrNext );
						trNewRight.setBelow( null, inTrNext );		// L/R undefined, will be extended down and changed anyway
					}		    
				} else {
					if ( trCurrent.vLow == trLast.vLow ) {
						//	*** Case: 1B_1UN_END; next: ----
						// console.log( "only_one_trap_below: simple case, new seg ends here, low adjacent seg still missing" );
						//			  +
						//		NL	 +  NR
						//			+
						//   ------*-------
						//		  next
						trNewLeft.setBelow( inTrNext, null );
						trNewRight.setBelow( null, inTrNext );
					} else {
						//	*** Case: 1B_1UN_CONT; next: CC_2UN
						// console.log( "only_one_trap_below: simple case, new seg continues down" );
						//			  +
						//		NL	 +  NR
						//			+
						//   ------+-------
						//	 	  +
						//		next
						
						// L/R in one case undefined, which one is not fixed
						//	but that one will be extended down and changed anyway
						trNewLeft.setBelow( null, inTrNext );		// if defined, vLow is to the left
						trNewRight.setBelow( inTrNext, null );		// if defined, vLow is to the right
					}
				}
				inTrNext.setAbove( trNewLeft, trNewRight );
			}
		}
	
		function two_trap_below() {
			// Find out which one (dL,dR) is intersected by this segment and
			//	continue down that one
			var trNext;
			if ( ( trCurrent.vLow == trLast.vLow ) && meetsLowAdjSeg ) {	// meetsLowAdjSeg necessary? TODO
				//	*** Case: 2B_CON_END; next: ----
				// console.log( "two_trap_below: finished, meets low adjacent segment" );
				//			  +
				//		NL	 +  NR
				//			+
				//   ------*-------
				//	 		\  C.dR
				//	  C.dL	 \
				trCurrent.dL.setAbove( trNewLeft, null );
				trCurrent.dR.setAbove( null, trNewRight );
				
				trNext = trCurrent.dR;		// temporary store, in case: trCurrent == trNewLeft
				trNewLeft.setBelow( trCurrent.dL, null );
				trNewRight.setBelow( null, trNext );
				
				trNext = null;	      	// segment finished
			} else {
				// passes left or right of an already inserted NOT connected segment
				//	trCurrent.vLow: high-end of existing segment
				var compRes = scope.is_left_of( inSegment, trCurrent.vLow, true );
				if ( compRes > 0 ) {				// trCurrent.vLow is left of inSegment
					//	*** Case: 2B_NCON_RIGHT; next: CC_2UN
					// console.log( "two_trap_below: (intersecting dR)" );
					//		 +
					//	  NL  +  NR
					//		   +
					//   ---*---+-------
					//		 \	 +
					//	 C.dL \	C.dR
					trNext = trCurrent.dR;
					
					trCurrent.dL.setAbove( trNewLeft, null );
					trCurrent.dR.setAbove( trNewLeft, trNewRight );
					
					// change FIRST trNewLeft then trNewRight !!
					trNewLeft.setBelow( trCurrent.dL, trCurrent.dR );
					trNewRight.setBelow( null, trCurrent.dR );		// L/R undefined, will be extended down and changed anyway
				} else if ( compRes < 0 ) {			// trCurrent.vLow is right of inSegment
					//	*** Case: 2B_NCON_LEFT; next: CC_2UN
					// console.log( "two_trap_below: (intersecting dL)" );
					//			  +
					//		NL	 +  NR
					//			+
					//   ------+---*-------
					//	 	  +		\  C.dR
					//	 	 C.dL	 \
					trNext = trCurrent.dL;
		
					trCurrent.dL.setAbove( trNewLeft, trNewRight );
					trCurrent.dR.setAbove( null, trNewRight );
					
					// change FIRST trNewRight then trNewLeft !!
					trNewRight.setBelow( trCurrent.dL, trCurrent.dR );
					trNewLeft.setBelow( trCurrent.dL, null );		// L/R undefined, will be extended down and changed anyway
				} else {							// trCurrent.vLow lies ON inSegment
					//	*** Case: 2B_NCON_TOUCH_LEFT; next: CC_2UN
					// console.log( "two_trap_below: vLow ON new segment, touching from left" );
					//			  +
					//		NL	 +  NR
					//			+
					//   ------*-------
					//	 	  +	\  C.dR
					//	  C.dL	 \
					trNext = trCurrent.dL;				// TODO: for test_add_segment_spezial_4A -> like intersecting dL
		
					trCurrent.dL.setAbove( trNewLeft, trNewRight );
					trCurrent.dR.setAbove( null, trNewRight );
					
					// change FIRST trNewRight then trNewLeft !!
					trNewRight.setBelow( trCurrent.dL, trCurrent.dR );
					trNewLeft.setBelow( trCurrent.dL, null );		// L/R undefined, will be extended down and changed anyway
					//
					// OR:			TODO
					//	*** Case: 2B_NCON_TOUCH_RIGHT; next: CC_2UN
					// console.log( "two_trap_below: vLow ON new segment, touching from right" );
					//		 +
					//	  NL  +  NR
					//		   +
					//   -------*-------
					//		   / +
					//	 C.dL /	C.dR
//					trNext = trCurrent.dR;				// TODO: -> like intersecting dR
				}
			}	    
			
 			return	trNext;
		}

		//
		//	main function body
		//
		
/*		if ( ( inSegment.sprev.vTo != inSegment.vFrom ) || ( inSegment.vTo != inSegment.snext.vFrom ) ) {
			console.log( "add_segment: inconsistent point order of adjacent segments: ",
						 inSegment.sprev.vTo, inSegment.vFrom, inSegment.vTo, inSegment.snext.vFrom );
			return;
		}		*/
		
		var segHighVert, segHighRoot, meetsHighAdjSeg;	// y-max vertex
		var segLowVert , segLowRoot, meetsLowAdjSeg;		// y-min vertex
		
		if ( inSegment.upward ) {
			segLowVert	= inSegment.vFrom;
			segHighVert	= inSegment.vTo;
			segLowRoot		= inSegment.rootFrom;
			segHighRoot		= inSegment.rootTo;
			// was lower point already inserted earlier? => segments meet at their ends
			meetsLowAdjSeg	= inSegment.sprev.is_inserted;
			// was higher point already inserted earlier? => segments meet at their ends
			meetsHighAdjSeg	= inSegment.snext.is_inserted;
		} else {
			segLowVert	= inSegment.vTo;
			segHighVert	= inSegment.vFrom;
			segLowRoot		= inSegment.rootTo;
			segHighRoot		= inSegment.rootFrom;
			meetsLowAdjSeg	= inSegment.snext.is_inserted;
			meetsHighAdjSeg	= inSegment.sprev.is_inserted;
		}

		//	insert higher vertex into QueryStructure
		//		Get the top-most intersecting trapezoid
		var qsNodeSinkWithPt = this.ptNode( segHighVert, segLowVert, segHighRoot );
		if ( !meetsHighAdjSeg ) {
			// higher vertex not yet inserted => split trapezoid horizontally
			qsNodeSinkWithPt = this.splitNodeAtPoint( qsNodeSinkWithPt, segHighVert, false );
		}
		var trFirst = qsNodeSinkWithPt.trap;		// top-most trapezoid for this segment

		// check for robustness		// TODO
		if ( !trFirst.uL && !trFirst.uR ) {
			console.log("ERR add_segment: missing trFirst.uX: ", trFirst );
			return;
		}

		//	insert lower vertex into QueryStructure
		//		Get the bottom-most intersecting trapezoid
		qsNodeSinkWithPt = this.ptNode( segLowVert, segHighVert, segLowRoot );
		if ( !meetsLowAdjSeg ) {
			// lower vertex not yet inserted => split trapezoid horizontally
			qsNodeSinkWithPt = this.splitNodeAtPoint( qsNodeSinkWithPt, segLowVert, true );
		}
		var trLast = qsNodeSinkWithPt.trap;			// bottom-most trapezoid for this segment
		
		//
		// Thread the segment into the query "tree" from top to bottom.
		// All the trapezoids which are intersected by inSegment are "split" into two.
		// For each the QsNode (T_SINK) is converted into one of type T_X and
		//  new sinks for the new partial trapezoids are added.
		// In fact a real split only happens at the top and/or bottom end of the segment
		//	since at every y-line seperating two trapezoids is traverses it
		//	cuts off the "beam" from the y-vertex on one side, so that at that side
		//	the trapezoid from above can be extended down.
		//

		var trCurrent = trFirst;
		
		var trNewLeft, trNewRight, trPrevLeft, trPrevRight;
		var changeLeftUp, changeRightUp;
		
		var counter = this.trapArray.length + 2;		// just to prevent infinite loop
		var trNext;
		while ( trCurrent ) {
			if ( --counter < 0 ) {
				console.log( "ERR add_segment: infinite loop", trCurrent, inSegment, this );
				return;
			}
			if ( !trCurrent.dL && !trCurrent.dR ) {
				// ERROR: no successors, cannot arise if data is correct
				console.log( "ERR add_segment: missing successors", trCurrent, inSegment, this );
				return;
			}
			
			var qs_trCurrent = trCurrent.sink;
			qs_trCurrent.nodetype = PNLTRI.T_X;
			qs_trCurrent.seg = inSegment;
			qs_trCurrent.trap = null;			// no SINK anymore !!!
			//
			// successive trapezoids bordered by the same segments are merged
			//  by extending the trPrevRight or trPrevLeft down
			//  and redirecting the parent PNLTRI.T_X-Node to the extended sink
			// !!! destroys tree structure since several nodes now point to the same PNLTRI.T_SINK !!!
			// TODO: maybe it's not a problem;
			//  merging of PNLTRI.T_X-Nodes is no option, since they are used as "rootFrom/rootTo" !
			//
			changeLeftUp = changeRightUp = true;
			if ( trPrevRight && ( trPrevRight.rseg == trCurrent.rseg ) ) {
				changeRightUp = false;
				// console.log( "add_segment: extending right predecessor down!", trPrevRight );
				trNewLeft = trCurrent;
				trNewRight = trPrevRight;
				trNewRight.vLow = trCurrent.vLow;
				// redirect parent PNLTRI.T_X-Node to extended sink
				qs_trCurrent.right = trPrevRight.sink;
				qs_trCurrent.left = new PNLTRI.QsNode( trNewLeft );			// left trapezoid sink (use existing one)
			} else if ( trPrevLeft && ( trPrevLeft.lseg == trCurrent.lseg ) ) {
				changeLeftUp = false;
				// console.log( "add_segment: extending left predecessor down!", trPrevLeft );
				trNewRight = trCurrent;
				trNewLeft = trPrevLeft;
				trNewLeft.vLow = trCurrent.vLow;
				// redirect parent PNLTRI.T_X-Node to extended sink
				qs_trCurrent.left = trPrevLeft.sink;
				qs_trCurrent.right = new PNLTRI.QsNode( trNewRight );		// right trapezoid sink (use existing one)
			} else {
				trNewLeft = trCurrent;
				trNewRight = this.cloneTrap(trCurrent); 					// split-right: (allocate new)
				qs_trCurrent.right = new PNLTRI.QsNode( trNewRight );		// right trapezoid sink
				qs_trCurrent.left = new PNLTRI.QsNode( trNewLeft );			// left trapezoid sink (use existing one)
			}
		
			// handle neighbors above
			if ( trCurrent.uL && trCurrent.uR )	{
				continue_chain_from_above();
			} else {
				fresh_seg_or_upward_cusp();
			}

			// handle neighbors below
			if ( trCurrent.dL && trCurrent.dR ) {
				trNext = two_trap_below();
			} else {
				if ( trCurrent.dL ) {
					// console.log( "add_segment: only_one_trap_below! (dL)" );
					trNext = trCurrent.dL;
				} else {
					// console.log( "add_segment: only_one_trap_below! (dR)" );
					trNext = trCurrent.dR;
				}
				only_one_trap_below( trNext );
			}
      
			if ( trNewLeft.rseg )	trNewLeft.rseg.trLeft = trNewRight;
			if ( trNewRight.lseg )	trNewRight.lseg.trRight = trNewLeft;
			trNewLeft.rseg = trNewRight.lseg  = inSegment;
			inSegment.trLeft = trNewLeft;
			inSegment.trRight = trNewRight;

			// further loop-step down ?
			if ( trCurrent.vLow != trLast.vLow ) {
				trPrevLeft = trNewLeft;
				trPrevRight = trNewRight;
				
				trCurrent = trNext;
			} else {
				trCurrent = null;
			}
		}	// end while
		
		inSegment.is_inserted = true;
		// console.log( "add_segment: ###### DONE ######" );
	},

	
	// Assigns a depth to all trapezoids;
	//	0: outside, 1: main polygon, 2: holes, 3:polygons in holes, ...
	// Checks segment orientation and reverses polyChain winding order if necessary
	//	=> Goal: contour in CCW, holes in CW
	//	=> all trapezoids lseg/rseg have opposing directions,
	//		assumed, the missing outer segments have CW orientation !
	assignDepths: function ( inPolyData ) {
		var thisDepth = [ this.trapArray[0] ];
		var nextDepth = [];
		
		var thisTrap, otherSide, curDepth = 0;
		do {
			// rseg should exactely go upward on trapezoids inside the polygon (odd depth)
			var expectedRsegUpward = ( ( curDepth % 2 ) == 1 );
			while ( thisTrap = thisDepth.pop() ) {
				if ( thisTrap.depth != -1 )	continue;
				thisTrap.depth = curDepth;
				//
				if ( thisTrap.uL )	thisDepth.push( thisTrap.uL );
				if ( thisTrap.uR )	thisDepth.push( thisTrap.uR );
				if ( thisTrap.dL )	thisDepth.push( thisTrap.dL );
				if ( thisTrap.dR )	thisDepth.push( thisTrap.dR );
				//
				if ( ( otherSide = thisTrap.lseg ) && ( otherSide.trLeft.depth == -1 ) )
					nextDepth.push( otherSide.trLeft );
				if ( ( otherSide = thisTrap.rseg ) && ( otherSide.trRight.depth == -1 ) ) {
					nextDepth.push( otherSide.trRight );
					if ( otherSide.upward != expectedRsegUpward ) {
						inPolyData.reverse_polygon_chain( otherSide );
//						inPolyData.set_PolyLeft_wrong( otherSide.chainId );
					}
				}
			}
			thisDepth = nextDepth; nextDepth = [];
			curDepth++;
		} while ( thisDepth.length > 0 );
	},
	

	// Find one triangular trapezoid which lies inside the polygon
	// !! does NOT depend on the orientation of segments CCW/CW !!
	
	find_first_inside: function () {
		var thisTrap;
		for (var i=0, j=this.trapArray.length; i<j; i++) {
			thisTrap = this.trapArray[i];
			if ( ( ( thisTrap.depth % 2 ) == 1 ) && ( !thisTrap.monoDiag ) &&
				 ( ( !thisTrap.uL && !thisTrap.uR ) || ( !thisTrap.dL && !thisTrap.dR ) )
			 	) {
				return	thisTrap;
			}
		}
		return	null;
	},

	
};


/*==============================================================================
 *
 *============================================================================*/

/** @constructor */
PNLTRI.Trapezoider = function ( inPolygonData ) {

	this.polyData		= inPolygonData;
	this.queryStructure	= new PNLTRI.QueryStructure( this.polyData );
	
};

PNLTRI.Trapezoider.prototype = {

	constructor: PNLTRI.Trapezoider,
	
	find_first_inside: function () {
		return	 this.queryStructure.find_first_inside();
	},
	
	/*
	 * Mathematics & Geometry helper methods
	 */

	//
	//	The two CENTRAL methods for the near-linear performance	!!!
	//
	math_logstar_n: function ( inNum ) {
		var i, v;
		for ( i = 0, v = inNum; v >= 1; i++ ) { v = PNLTRI.Math.log2(v) }
		return	( i - 1 );
	},
	math_NH: function ( inN, inH ) {
		var i, v;
		for ( i = 0, v = inN; i < inH; i++ ) { v = PNLTRI.Math.log2(v) }
		return	Math.ceil( 1.0 * inN / v );
	},

	
	optimise_randomlist: function ( inOutSegListArray ) {
		// makes sure that the first N segments are one from each of the N polygon chains
		var mainIdx = 0;
		var helpIdx = this.polyData.nbPolyChains();
		if ( helpIdx == 1 )		return;
		var chainMarker = new Array(helpIdx);
		var oldSegListArray = inOutSegListArray.concat();
		for (var i=0; i<oldSegListArray.length; i++) {
			var chainId = oldSegListArray[i].chainId;
			if ( chainMarker[chainId] ) {
				inOutSegListArray[helpIdx++] = oldSegListArray[i];
			} else {
				inOutSegListArray[mainIdx++] = oldSegListArray[i];
				chainMarker[chainId] = true;
			}
		}
	},


	/*
	 * main methods
	 */

	// To speed up the segment insertion into the trapezoidation
	//	the endponts of those segments not yet inserted are
	//	repeatedly pre-located,
	// thus the their final location-query can start at the top
	//	of the appropriate sub-tree instead of the root of the
	//	whole query structure.
	
	find_new_roots: function ( inSegment ) {					// <<<< private
		if ( !inSegment.is_inserted ) {
			inSegment.rootFrom = this.queryStructure.ptNode( inSegment.vFrom, inSegment.vTo, inSegment.rootFrom );
			inSegment.rootTo = this.queryStructure.ptNode( inSegment.vTo, inSegment.vFrom, inSegment.rootTo );
		}
	},

	// Creates the trapezoidation of the polygon
	//  and returns one triangular trapezoid which lies inside the polygon.
	// All other inside trapezoids can be reached from this one using the
	//	neighbor links.
	
	trapezoide_polygon: function () {							// <<<< public
		var randSegListArray = this.polyData.getSegments().concat();
//		console.log( "Polygon Chains: ", dumpSegmentList( randSegListArray ) );
		PNLTRI.Math.array_shuffle( randSegListArray );
		this.optimise_randomlist( randSegListArray );
//		console.log( "Random Segment Sequence: ", dumpRandomSequence( randSegListArray ) );
		
		var anzSegs = randSegListArray.length;
		var myQs = this.queryStructure;
		var i, h;

		var logStarN = this.math_logstar_n(anzSegs);
		for (h = 1; h <= logStarN; h++) {
			for (i = this.math_NH(anzSegs, h -1); i < this.math_NH(anzSegs, h); i++) {
				myQs.add_segment( randSegListArray[i-1] );
//				myQs.add_segment_consistently( randSegListArray[i-1], 'RandomA#'+(i-1) );
			}
			// Find a new sub-tree root for each of the segment endpoints
			for (i = 0; i < anzSegs; i++) {
				this.find_new_roots( randSegListArray[i] );
			}
		}
		
		for (i = this.math_NH( anzSegs, logStarN ); i <= anzSegs; i++) {
			myQs.add_segment( randSegListArray[i-1] );
//			myQs.add_segment_consistently( randSegListArray[i-1], 'RandomB#'+(i-1) );
		}
		
		myQs.assignDepths( this.polyData );
	},

};

/**
 * @author jahting / http://www.ameco.tv/
 *
 *	Algorithm to split a polygon into uni-y-monotone sub-polygons
 *
 *	1) creates a trapezoidation of the main polygon according to Seidel's
 *	   algorithm [Sei91]
 *	2) traverses the trapezoids and uses diagonals as additional segments
 *		to split the main polygon into uni-y-monotone sub-polygons
 */

/** @constructor */
PNLTRI.MonoSplitter = function ( inPolygonData ) {
	
	this.polyData = inPolygonData;
	
	this.trapezoider = null;
	
	// trianglular trapezoid inside the polygon,
	//	from which the monotonization is started
	this.startTrap	= null;
	
};

	
PNLTRI.MonoSplitter.prototype = {

	constructor: PNLTRI.MonoSplitter,
	
	
	monotonate_trapezoids: function () {					// <<<<<<<<<< public
		
		// Trapezoidation
		this.trapezoider = new PNLTRI.Trapezoider( this.polyData );
		//	=> one triangular trapezoid which lies inside the polygon
		this.trapezoider.trapezoide_polygon();
		this.startTrap = this.trapezoider.find_first_inside();
				
		// Generate the uni-y-monotone sub-polygons from
		//	the trapezoidation of the polygon.
		//	!!  for the start triangle trapezoid it doesn't matter
		//	!!	from where we claim to enter it
		this.polyData.initMonoChains();
		
		var curChain = 0;
		var curStart = this.startTrap;
		while (curStart) {
			this.polyData.monoSubPolyChains[curChain] = curStart.lseg;
			this.alyTrap( curChain, curStart, null, null, null );
			if ( curStart = this.trapezoider.find_first_inside() ) {
				// console.log("another Polygon");
				curChain = this.polyData.monoSubPolyChains.length;
			}
		};

		// return number of UNIQUE sub-polygons created
		return	this.polyData.normalize_monotone_chains();
	},

	
	// Splits the current polygon (index: inCurrPoly) into two sub-polygons
	//	using the diagonal (inVertLow, inVertHigh) either from low to high or high to low		// TODO: new explanation
	// returns an index to the new sub-polygon
	//
	//	!! public for Mock-Tests only !!

	doSplit: function ( inChain, inVertLow, inVertHigh, inLow2High ) {
		return this.polyData.splitPolygonChain( inChain, inVertLow, inVertHigh, inLow2High );
	},

	// In a loop analyses all connected trapezoids for possible splitting diagonals
	//	Inside of the polygon holds:
	//		rseg: always goes upwards
	//		lseg: always goes downwards
	//	This is preserved during the splitting.
		
	alyTrap: function ( inChain, inTrap, inFromUp, inFromLeft, inOneStep ) {

		var trapQueue = [];
		var thisTrap, fromUp, fromLeft, curChain, newChain;
		
		function trapList_addItem( inTrap, inFromUp, inFromLeft, inChain ) {
			if ( inTrap )	trapQueue.push( [ inTrap, inFromUp, inFromLeft, inChain ] );
		}
		
		function trapList_getItem() {
			var trapQItem;
			if ( trapQItem = trapQueue.pop() ) {
				thisTrap = trapQItem[0];
				fromUp	 = trapQItem[1];
				fromLeft = trapQItem[2];
				curChain = trapQItem[3];
				return	true;
			} else	return	false;
		}
		
		//
		// main function body
		//
		
		if ( inFromUp == null ) {
			inFromLeft = true;
			if ( inTrap.uL )		inFromUp = true;
			else if ( inTrap.dL )	inFromUp = false;
			else {
				inFromLeft = false;
				if ( inTrap.uR )	inFromUp = true;
				else				inFromUp = false;
			}
		}
		trapList_addItem( inTrap, inFromUp, inFromLeft, inChain );
		
		while ( trapList_getItem() ) {
			if ( thisTrap.monoDiag )	continue;
		
			if ( !thisTrap.lseg || !thisTrap.rseg ) {
				console.log("ERR alyTrap: lseg/rseg missing", thisTrap);
				return	trapQueue;
			}

			// mirror neighbors into norm-position
			var neighIn, neighSameUD, neighSameLR, neighAcross;
			if ( fromUp ) {
				if ( fromLeft ) {
					neighIn = thisTrap.uL;
					neighSameUD = thisTrap.uR;
					neighSameLR = thisTrap.dL;
					neighAcross = thisTrap.dR;
				} else {
					neighIn = thisTrap.uR;
					neighSameUD = thisTrap.uL;
					neighSameLR = thisTrap.dR;
					neighAcross = thisTrap.dL;
				}
			} else {
				if ( fromLeft ) {
					neighIn = thisTrap.dL;
					neighSameUD = thisTrap.dR;
					neighSameLR = thisTrap.uL;
					neighAcross = thisTrap.uR;
				} else {
					neighIn = thisTrap.dR;
					neighSameUD = thisTrap.dL;
					neighSameLR = thisTrap.uR;
					neighAcross = thisTrap.uL;
				}
			}

			if ( neighSameUD || neighAcross ) {
				// TM|BM: TM_BM, TM_BL, TL_BM, TM_BR, TR_BM, TLR_BM, TM_BLR; TL_BR, TR_BL
				// console.log( "2 neighbors on at least one side or 1 neighbor on each with vHigh and vLow on different L/R-sides => split" );
				newChain = this.doSplit( curChain, thisTrap.vLow, thisTrap.vHigh, fromLeft );
			// } else {
				// TL_BL, TR_BR; degenerate cases (triangle trapezoid): TLR_BL, TLR_BR; TL_BLR, TR_BLR
				// console.log( "1 neighbor on in-Side, 1 on same L/R-side or none on the other => no split possible" );
			}

			trapList_addItem( neighAcross,  fromUp, !fromLeft, newChain );
			trapList_addItem( neighSameUD, !fromUp, !fromLeft, newChain );
			trapList_addItem( neighSameLR,  fromUp,  fromLeft, curChain );

			if ( !neighSameLR && !neighAcross ) {
				// TLR_BL, TLR_BR; TL_BLR, TR_BLR,    TLR_BM, TM_BLR
				// console.log( "degenerate case: triangle (cusp), 1 or 2 neighbors on in-side, nothing on the other side" );
				//	could be start triangle -> visit IN-neighbor in any case !
				trapList_addItem( neighIn, !fromUp, fromLeft, curChain );
			}
			
			thisTrap.monoDiag = true;

			if ( inOneStep )	return trapQueue;
		}
		return	[];
	},

};

/**
 * @author jahting / http://www.ameco.tv/
 *
 *	Algorithm to triangulate uni-y-monotone polygons [FoM84]
 *
 *	expects list of doubly linked monoChains, with Y-max as first vertex
 */


/** @constructor */
PNLTRI.MonoTriangulator = function ( inPolygonData ) {
	
	this.polyData	= inPolygonData;
	
};

	
PNLTRI.MonoTriangulator.prototype = {

	constructor: PNLTRI.MonoTriangulator,
	

	// Pass each uni-y-monotone polygon with start at Y-max for greedy triangulation.
	
	triangulate_all_polygons: function () {					// <<<<<<<<<< public
		var	normedMonoChains = this.polyData.getMonoSubPolys();
		this.polyData.clearTriangles();
		for ( var i=0; i<normedMonoChains.length; i++ ) {
			// loop through uni-y-monotone chains
			// => monoPosmin is next to monoPosmax (left or right)
			var monoPosmax = normedMonoChains[i];
			var prevMono = monoPosmax.mprev;
			var nextMono = monoPosmax.mnext;
			
			if ( nextMono.mnext == prevMono ) {		// already a triangle
				this.polyData.addTriangle( monoPosmax.vFrom, nextMono.vFrom, prevMono.vFrom );
			} else {								// triangulate the polygon
				this.triangulate_monotone_polygon( monoPosmax );
			}
		}
	},

	//	algorithm to triangulate an uni-y-monotone polygon in O(n) time.[FoM84]
	 
	triangulate_monotone_polygon: function ( monoPosmax ) {
		var scope = this;
		
		function error_cleanup() {
			// Error in algorithm OR polygon is not uni-y-monotone
			console.log( "ERR uni-y-monotone: only concave angles left", vertBackLog );
			// push all "wrong" triangles => loop ends
			while (vertBackLogIdx > 1) {
				vertBackLogIdx--;
				scope.polyData.addTriangle(	vertBackLog[vertBackLogIdx-1],
											vertBackLog[vertBackLogIdx],
											vertBackLog[vertBackLogIdx+1] );
			}
		}

		//
		// Decisive for this algorithm to work correctly is to make sure
		//  the polygon stays uni-y-monotone when cutting off ears, i.e.
		//  to make sure the top-most and bottom-most vertices are removed last
		// Usually this is done by handling the LHS-case ("LeftHandSide is a single segment")
		//	and the RHS-case ("RightHandSide segment is a single segment")
		//	differently by starting at the bottom for LHS and at the top for RHS.
		// This is not necessary. It can be seen easily, that starting
		//	from the vertex next to top handles both cases correctly.
		//

		var frontMono = monoPosmax.mnext;		// == LHS: YminPoint; RHS: YmaxPoint.mnext
		var endVert = monoPosmax.vFrom;

		var vertBackLog = [ frontMono.vFrom ];
		var vertBackLogIdx = 0;

		frontMono = frontMono.mnext;
		var frontVert = frontMono.vFrom;
		
		// check for robustness		// TODO
		if (frontVert == endVert)	return;		// Error: only 2 vertices

		while ( (frontVert != endVert) || (vertBackLogIdx > 1) ) {
			if (vertBackLogIdx > 0) {
				// vertBackLog is not empty
				if ( PNLTRI.Math.ptsCrossProd( frontVert, vertBackLog[vertBackLogIdx-1], vertBackLog[vertBackLogIdx] ) > 0 ) {		// TODO !!
					// convex corner: cut if off
					this.polyData.addTriangle( vertBackLog[vertBackLogIdx-1], vertBackLog[vertBackLogIdx], frontVert );
					vertBackLogIdx--;
				} else {
					// non-convex: add frontVert to the vertBackLog
					vertBackLog[++vertBackLogIdx] = frontVert;
					if (frontVert == endVert)	error_cleanup();	// should never happen !!
					else {
						frontMono = frontMono.mnext;
						frontVert = frontMono.vFrom;
					}
				}
			} else {
				// vertBackLog contains only start vertex:
				//	add frontVert to the vertBackLog and advance frontVert
				vertBackLog[++vertBackLogIdx] = frontVert;
				frontMono = frontMono.mnext;
				frontVert = frontMono.vFrom;
			}
		}
		// reached the last vertex. Add in the triangle formed
		this.polyData.addTriangle( vertBackLog[vertBackLogIdx - 1], vertBackLog[vertBackLogIdx], frontVert );
	},
	
};

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


	clear_lastData: function () {	// save memory after Debug
		this.lastPolyData = null;
	},
	
	// for the polygon data AFTER triangulation
	//	returns an Array of flags, one flag for each polygon chain:
	//		lies the inside of the polygon to the left?
	//		"true" implies CCW for contours and CW for holes
	get_PolyLeftArr: function () {
		if ( this.lastPolyData )	return this.lastPolyData.get_PolyLeftArr();
		return	null;
	},


	triangulate_polygon: function ( inPolygonChains, inForceTrapezoidation ) {

		// collected conditions for selecting EarClipTriangulator over Seidel's algorithm
		function is_basic_polygon() {
			if (inForceTrapezoidation)	return	false;
			return	( myPolygonData.nbPolyChains() == 1 );
		}


		if ( ( !inPolygonChains ) || ( inPolygonChains.length == 0 ) )		return	[];
		//
		// initializes general polygon data structure
		//
		var myPolygonData = new PNLTRI.PolygonData( inPolygonChains );
		//
		var basicPolygon = is_basic_polygon();
		if ( basicPolygon ) {
			//
			// triangulates single polygon without holes
			//
			var	myTriangulator = new PNLTRI.EarClipTriangulator( myPolygonData );
			basicPolygon = myTriangulator.triangulate_polygon_no_holes();
		}
		if ( !basicPolygon ) {
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
		}
		//
		this.lastPolyData = myPolygonData;
		return	myPolygonData.getTriangles();	// copy of triangle list
	}

	
};

