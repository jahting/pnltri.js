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

	// list of polygon segments, original polygons ane holes
	//	and additional ones added during the subdivision into
	//	uni-y-monotone polygons (s. this.monoSubPolyChains)
	//	doubly linked by: snext, sprev
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
		if ( deltaY < PNLTRI.Math.EPSILON_N ) {
			return -1;
		} else if ( deltaY > PNLTRI.Math.EPSILON_P ) {
			return 1;
		} else {
			var deltaX = inPtA.x - inPtB.x;
			if ( deltaX < PNLTRI.Math.EPSILON_N ) {
				return -1;
			} else if ( deltaX > PNLTRI.Math.EPSILON_P ) {
				return  1;
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
	
	appendVertexEntry: function ( inVertexX, inVertexY ) {			// private
		var vertex = {
				id: this.vertices.length,	// vertex id, representing input sequence
				x: inVertexX,				// coordinates
				y: inVertexY,
				//
				//	for performance reasons:
				//	 initialization of all fields added later
				//
				// for monochains
				outSegs: [],				// outbound segments (up to 4)
			};
		this.vertices.push( vertex );
		return	vertex;
	},


	createSegmentEntry: function ( inVertexFrom, inVertexTo ) {			// private
		return	{
			chainId: this.idNextPolyChain,
			// end points of segment
			vFrom: inVertexFrom,	// -> start point entry in vertices
			vTo: inVertexTo,		// -> end point entry in vertices
			// upward segment? (i.e. vTo > vFrom) !!! only valid for sprev,snext NOT for mprev,mnext !!!
			upward: ( this.compare_pts_yx(inVertexTo, inVertexFrom) == 1 ),
			// doubly linked list of original polygon chains (not the monoChains !)
			sprev: null,			// previous segment
			snext: null,			// next segment
			//
			//	for performance reasons:
			//	 initialization of all fields added later
			//
			// for assigning depth: trapezoids
			trLeft: null,		// one trapezoid bordering on the left of this segment
			trRight: null,		// one trapezoid bordering on the right of this segment
			// for monochains
			mprev: null,		// doubly linked list for monotone chains (sub-polygons)
			mnext: null,
			marked: false,		// already visited during unique monoChain identification ?
		};
	},
	
	appendSegmentEntry: function ( inSegment ) {				// private
		this.segments.push( inSegment );
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
			newVertex = this.appendVertexEntry( inRawPointList[i].x, inRawPointList[i].y );
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


	/* Monotone Polygon Chains */

	initMonoChains: function () {										// <<<<<< public
		var newMono;
		// populate links for monoChains and vertex.outSegs
		for (var i = 0; i < this.segments.length; i++) {
			newMono = this.segments[i];
			if ( this.PolyLeftArr[newMono.chainId] ) {
				// preserve winding order
				newMono.mprev = newMono.sprev;		// doubly linked list for monotone chains (sub-polygons)
				newMono.mnext = newMono.snext;
				// initial out-going monoChain segment of the vertex (max: 4)
				newMono.vFrom.outSegs.push( {	segOut: newMono,			// -> MonoChainSegment
												vertTo: newMono.vTo } );	// next vertex: other end of outgoing monoChain segment
			} else {
				// reverse winding order
				newMono = newMono.snext;
				newMono.mprev = newMono.snext;
				newMono.mnext = newMono.sprev;
				newMono.vFrom.outSegs.push( {	segOut: newMono,
												vertTo: this.segments[i].vFrom } );
			}
		}
	},


	createMonoSegment: function ( inSegment ) {					// private
		this.appendSegmentEntry( inSegment );				// this.monoArray.push( inSegment );
		// populate "outgoing segment" from vertices
		inSegment.vFrom.outSegs.push( {
				segOut: inSegment,			// -> segments: outgoing segment
				vertTo: inSegment.vTo,		// -> next vertex: other end of outgoing segment
			} );
		return	inSegment;													// this.appendMonoEntry( inSegment );
	},


	newMonoChain: function ( inSegment ) {						// <<<<<< public
		var newIdx = this.monoSubPolyChains.length;
		this.monoSubPolyChains[newIdx] = inSegment;
		return	newIdx;
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
	//		-- All this can be seen below in previous versions - commented out! --
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

		// (inVertLow, inVertHigh) is the new diagonal to be added to the polygon.

		// To keep polygon winding order consistent currPoly gets
		//	(inVertLow -> inVertHigh) or (inVertHigh -> inVertLow) depending on this existing
		//	winding order and on the side of (inVertLow, inVertHigh) where currPoly lies
		var currPoly_gets_newSegLow2High;

		// find the outSegs from inVertLow and inVertHigh which belong to the chain split by the new diagonal
		var vertLowOutSeg, vertHighOutSeg;

		currPoly_gets_newSegLow2High = inCurrPolyLiesToTheLeft;
		vertLowOutSeg  = get_out_segment_next_right_of( inVertLow, inVertHigh );
		vertHighOutSeg = get_out_segment_next_right_of( inVertHigh, inVertLow );

		var segOutFromVertLow  = vertLowOutSeg.segOut;
		var segOutFromVertHigh = vertHighOutSeg.segOut;

		// create new segments
		var newSegLow2High = this.createMonoSegment( { vFrom: inVertLow, vTo: inVertHigh, upward: true,	// upward,
								mprev: segOutFromVertLow.mprev, mnext: segOutFromVertHigh } );
		var newSegHigh2Low = this.createMonoSegment( { vFrom: inVertHigh, vTo: inVertLow, upward: false,	// !upward,
								mprev: segOutFromVertHigh.mprev, mnext: segOutFromVertLow } );

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

		// assumes attribute "marked" is NOT yet "true" for any mono chain segment
		var	uniqueMonoChainsMax = [];
		for ( var i=0; i<this.monoSubPolyChains.length; i++ ) {
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

