/**
 * @author jahting / http://www.ameco.tv/
 */

/** @constructor */
PNLTRI.PolygonData = function ( inPolygonChainList ) {

	// list of polygon vertices
	//	.pt: coordinates
	//	.outSegs: Array of outgoing segments from this point
	//		{ vertTo: next vertex, segOut: outgoing segments-Entry }
	// outSegs[0] is the original polygon segment, the others are added
	//  during the subdivision into uni-y-monotone polygons
	this.vertices = [];

	// list of polygon segments, original and additional ones added
	//  during the subdivision into uni-y-monotone polygons (s. this.monoSubPolyChains)
	// doubly linked by: snext, sprev
	this.segments = [];
	
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
		this.addPolygonChain( inPolygonChainList[0], false );		// contour
		for (var i=1, j=inPolygonChainList.length; i<j; i++) {		// holes
			this.addPolygonChain( inPolygonChainList[i], true );
		}
	}

};


PNLTRI.PolygonData.prototype = {

	constructor: PNLTRI.PolygonData,
	
	
	/*	Accessors  */
	
	getSegments: function () {
		return	this.segments;
	},
	getMonoSubPolys: function () {
		return	this.monoSubPolyChains;
	},
	getTriangles: function () {
		return	this.triangles.concat();
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

	// calculates the area of a polygon
	polygon_area: function ( inContour ) {
		var cLen = inContour.length;
		var dblArea = 0.0;
		for( var p = cLen - 1, q = 0; q < cLen; p = q++ ) {
			dblArea += inContour[ p ].x * inContour[ q ].y - inContour[ q ].x * inContour[ p ].y;
		}
		return dblArea * 0.5;
	},

	
	/*	Operations  */
	
	appendVertexEntry: function ( inVertex ) {			// private
		var vertex = inVertex ? inVertex : {
			pt: null,		// coordinates: { x:, y: }
			outSegs: [],	// outbound segments (up to 4)
			};
		vertex.id = this.vertices.length;
		this.vertices.push( vertex );
		return	vertex;
	},


	createSegmentEntry: function ( inVertexFrom, inVertexTo ) {			// private
		return	{
			// end points of segment
			vFrom: inVertexFrom,	// -> start point entry in vertices
			vTo: inVertexTo,		// -> end point entry in vertices
			// upward segment? (i.e. vTo > vFrom)
			upward: ( this.compare_pts_yx(inVertexTo.pt, inVertexFrom.pt) == 1 ),
			// double linked list of original polygon chains (not the monoChains !)
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
	

	addVertexChain: function ( inRawPointList, inIsHole ) {			// private
		
		function verts_equal( inVert1, inVert2 ) {
			return ( ( Math.abs(inVert1.pt.x - inVert2.pt.x) < PNLTRI.Math.EPSILON_P ) &&
					 ( Math.abs(inVert1.pt.y - inVert2.pt.y) < PNLTRI.Math.EPSILON_P ) );
		}
		
		var reverse = false;
		if ( inIsHole != null ) {		// adapt segment direction to polygon chain type ?
			var orientation = ( this.polygon_area( inRawPointList ) < 0 );		// CW ?
			reverse = ( inIsHole != orientation );
		}
		//
		var newVertices = [];
		var newVertex, acceptVertex, prevIdx;
		for ( var i=0; i < inRawPointList.length; i++ ) {
			newVertex = this.appendVertexEntry( { pt: { x: inRawPointList[i].x,
														y: inRawPointList[i].y } } );
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
		if ( reverse ) {
			// console.log( "Polygon chain reversed! " + newVertices[0].pt.x + "/" + newVertices[0].pt.y );
			newVertices = newVertices.reverse();		// vertex-index preserving reversal !!!
		}
		
		return	newVertices;
	},
	

	addPolygonChain: function ( inRawPointList, inIsHole ) {			// <<<<<< public
		
		// vertices
		var newVertices = this.addVertexChain( inRawPointList, inIsHole );
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
		
		return	this.segments.length - saveSegListLength;
	},
	

	/* Monotone Polygon Chains */
	
	initMonoChains: function () {										// <<<<<< public
		// populate links for monoChains and vertex.outSegs
		for (var i = 0; i < this.segments.length; i++) {
			// already visited during unique monoChain creation ?
			this.segments[i].marked = false;
			// double linked list for monotone chains (sub-polygons)
			this.segments[i].mprev = this.segments[i].sprev;
			this.segments[i].mnext = this.segments[i].snext;
			// out-going segments of a vertex (max: 4)
//			this.segments[i].vFrom.outSegs = [ {vertTo: this.segments[i].snext.vFrom, 	// next vertex: first outgoing segment
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


	// Split the polygon chain (mprev, mnext !) including vert0 and vert1 into
	// two chains by adding two new segments (vert0, vert1) and (vert0, vert1).
	// vert0 and vert1 are specified in CCW order with respect to the
	// current polygon (index: currPoly).
	//
	// returns an index to the new polygon chain.

	splitPolygonChain: function ( currPoly, vert0, vert1 ) {			// <<<<<< public

		function get_out_segment_next_right_of(vert0, vert1) {

			// monotone mapping of the CCW angle between the wo vectors:
			//	inPtVertex->inPtFrom and inPtVertex->inPtTo
			//  from 0..360 degrees onto the range of 0..4
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
					// > 0:  v lies left of u
					// < 0:  v lies right of u
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


			var tmpSeg, tmpAngle;

			// search for the outSegment "segRight" so that the angle between
			//	vert0->segRight.vertTo and vert0->vert1 is smallest
			//	=> vert0->segRight.vertTo is the next to the right of vert0->vert1

			var segRight = null;
			var minAngle = 4.0;			// <=> 360 degrees
			for (var i = 0; i < vert0.outSegs.length; i++) {
				tmpSeg = vert0.outSegs[i]
				if ( ( tmpAngle = mapAngle( vert0.pt, tmpSeg.vertTo.pt, vert1.pt ) ) < minAngle ) {
					minAngle = tmpAngle;
					segRight = tmpSeg;
				}
			}
			return	segRight;
		}


		// (vert0, vert1) is the new diagonal to be added to the polygon.

		// find chains and outSegs to use for vert0 and vert1
		var vert0outSeg = get_out_segment_next_right_of(vert0, vert1);
		var vert1outSeg = get_out_segment_next_right_of(vert1, vert0);
		
		var segOutFromVert0 = vert0outSeg.segOut;
		var segOutFromVert1 = vert1outSeg.segOut;
		
		// modify linked lists
		var upward = ( this.compare_pts_yx(vert0.pt, vert1.pt) == 1 );
		var newSegPolyOrg = this.appendSegmentEntry( { vFrom: vert0, vTo: vert1, upward: !upward,
							mprev: segOutFromVert0.mprev, mnext: segOutFromVert1 } );
		var newSegPolyNew = this.appendSegmentEntry( { vFrom: vert1, vTo: vert0, upward: upward,
							mprev: segOutFromVert1.mprev, mnext: segOutFromVert0 } );
		
		segOutFromVert0.mprev.mnext = newSegPolyOrg;
		segOutFromVert1.mprev.mnext = newSegPolyNew;
		
		segOutFromVert0.mprev = newSegPolyNew;
		segOutFromVert1.mprev = newSegPolyOrg;
		
		// populate "outgoing segment" from vertices
		this.appendVertexOutsegEntry( vert0, { segOut: newSegPolyOrg, vertTo: vert1 } );
		this.appendVertexOutsegEntry( vert1, { segOut: newSegPolyNew, vertTo: vert0 } );

		this.monoSubPolyChains[currPoly] = segOutFromVert1;		// initially creates [0] on empty list !!
		this.monoSubPolyChains.push(segOutFromVert0);
		
		return	this.monoSubPolyChains.length - 1;				// index -> new monoSubPoly
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
			firstPt = ymaxPt = frontMono.vFrom.pt;

			frontMono.marked = true;
			frontMono = frontMono.mnext;
			
			var processed = false;
			while ( (frontPt = frontMono.vFrom.pt) != firstPt ) {
				if (frontMono.marked) {
					processed = true;
					break;		// break from while
				} else {
					frontMono.marked = true;
				}
				if ( this.compare_pts_yx( frontPt, ymaxPt ) == 1 ) {
					ymaxPt = frontPt;
					monoPosmax = frontMono;
				}
				frontMono = frontMono.mnext;
			}	// end while
			if (processed) continue;		// Go to next polygon
			uniqueMonoChainsMax.push(monoPosmax);
		}	// end for
		//
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

