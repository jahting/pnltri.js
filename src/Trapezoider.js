/**
 * @author jahting / http://www.ameco.tv/
 *
 *	Algorithm to create the trapezoidation of a polygon with holes
 *	 according to Seidel's algorithm [Sei91]
 */

// for splitting trapezoids
//  on which segment lies the point defining the top or bottom y-line?
//	all combinations are possible, except two cusps
PNLTRI.TRAP_MIDDLE	= 0;		// middle: 2 neighbors, separated by a cusp
PNLTRI.TRAP_LEFT	= 1;		// left: point lies on the left segment
PNLTRI.TRAP_RIGHT	= 2;		// right: point lies on the right segment
PNLTRI.TRAP_CUSP	= 1+2;		// cusp: point is the tip of a cusp of a triangular trapezoid
								//	lying on the left and right segment

PNLTRI.trapCnt = 0;		// Sequence for trapezoid IDs

/** @constructor */
PNLTRI.Trapezoid = function ( inHigh, inLow, inLeft, inRight ) {
	
	this.trapID = PNLTRI.trapCnt++;			// for Debug

	this.vHigh = inHigh ? inHigh : { x: Number.POSITIVE_INFINITY, y: Number.POSITIVE_INFINITY };
	this.vLow  = inLow  ? inLow  : { x: Number.NEGATIVE_INFINITY, y: Number.NEGATIVE_INFINITY };
	
	this.lseg = inLeft;
	this.rseg = inRight;
		
//	this.sink = null;			// link to corresponding node (T_SINK) in QueryStructure
		
//	this.usave = null;			// temp: u0/u1, preserved for next step
//	this.uside = null;			// temp: PNLTRI.S_LEFT(u0), PNLTRI.S_RIGHT(u1)
	
	this.depth = -1;			// no depth assigned yet
	
	this.monoDiag = null;		// splitting diagonal during monotonization ?
	
};

PNLTRI.Trapezoid.prototype = {

	constructor: PNLTRI.Trapezoid,

	clone: function () {
		var newTrap = new PNLTRI.Trapezoid( this.vHigh, this.vLow, this.lseg, this.rseg );
		
		newTrap.u0 = this.u0;
		newTrap.u1 = this.u1;
		newTrap.topLoc = this.topLoc;
		
		newTrap.d0 = this.d0;
		newTrap.d1 = this.d1;
		newTrap.botLoc = this.botLoc;
		
		newTrap.sink = this.sink;

		return	newTrap;
	},

	
	setAbove: function ( inTrap1, inTrap2 ) {
		if ( inTrap1 != '' )	this.u0 = inTrap1;
		if ( inTrap2 != '' )	this.u1 = inTrap2;
	},
	setBelow: function ( inTrap1, inTrap2 ) {
		if ( inTrap1 != '' )	this.d0 = inTrap1;
		if ( inTrap2 != '' )	this.d1 = inTrap2;
	},

	setSink: function ( inQsSink ) {
		this.sink = inQsSink;
	},

	
	replaceAbove: function ( inTrapOld, inTrapNew ) {
		if ( this.u0 == inTrapOld ) {
			this.u0 = inTrapNew;
		} else if ( this.u1 == inTrapOld ) {
			this.u1 = inTrapNew;
		}
	},

	
	splitOffLower: function ( inSplitPt ) {
		var trLower = this.clone();				// new lower trapezoid
		
		this.vLow = trLower.vHigh = inSplitPt;
		this.botLoc = trLower.topLoc = PNLTRI.TRAP_MIDDLE;
		
		this.setBelow( trLower, null);
		trLower.setAbove( this, null );
		
		if ( trLower.d0 )	trLower.d0.replaceAbove( this, trLower );
		if ( trLower.d1 )	trLower.d1.replaceAbove( this, trLower );
		
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
PNLTRI.S_LEFT = 1;
PNLTRI.S_RIGHT = 2;

PNLTRI.qsCounter = 0;

/** @constructor */
PNLTRI.QsNode = function ( inNodetype, inParent, inData ) {

	this.qsNodeID = PNLTRI.qsCounter++;			// for Debug

	this.nodetype = inNodetype;
	
	if ( inData ) {
		if ( inNodetype == PNLTRI.T_Y )
			this.yval = inData;
		else if ( inNodetype == PNLTRI.T_X )
			this.seg = inData;
		else	// PNLTRI.T_SINK
			this.trap = inData;
	}
};

PNLTRI.QsNode.prototype = {

	constructor: PNLTRI.QsNode,

	
	newRight: function ( inNodetype, inData ) {

		this.right = new PNLTRI.QsNode( inNodetype, this, inData );

		return this.right;
	},

	newLeft: function ( inNodetype, inData ) {

		this.left = new PNLTRI.QsNode( inNodetype, this, inData );

		return this.left;
	},


};


/*==============================================================================
 *
 *============================================================================*/

/** @constructor */
PNLTRI.QueryStructure = function ( inPolygonData ) {
	// initialise the query structure and trapezoid list
	PNLTRI.trapCnt = 0;
	PNLTRI.qsCounter = 0;
	
	this.root = new PNLTRI.QsNode( PNLTRI.T_SINK, null, null );

	var initialTrap = new PNLTRI.Trapezoid( null, null, null, null );
	initialTrap.setSink( this.root );
	this.root.trap = initialTrap;

	this.trapArray = [ initialTrap ];

	this.segListArray = null;
	if ( inPolygonData ) {
		this.segListArray = inPolygonData.getSegments();
		/*
		 * adds and initializes specific attributes for all segments
		 *	// -> QueryStructure: roots of partial tree where vertex is located
		 *	rootFrom, rootTo:	for vFrom, vTo
		 *	// marker
		 *	is_inserted:	already inserted into QueryStructure ?
		 */
		for ( var i = 0; i < this.segListArray.length; i++ ) {
			this.segListArray[i].rootFrom = this.segListArray[i].rootTo = this.root;
			this.segListArray[i].is_inserted = false;
		}
		this.compare_pts_yx = inPolygonData.compare_pts_yx;
	} else {
		var myPolygonData = new PNLTRI.PolygonData( null );
		this.compare_pts_yx = myPolygonData.compare_pts_yx;
	}
};

PNLTRI.QueryStructure.prototype = {

	constructor: PNLTRI.QueryStructure,

	getRoot: function () {
		return this.root;
	},
	getSegListArray: function () {
		return this.segListArray;
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
		
		trUpper.sink = inNode.newRight( PNLTRI.T_SINK, trUpper );	// Upper trapezoid sink
		trLower.sink = inNode.newLeft( PNLTRI.T_SINK, trLower );		// Lower trapezoid sink
		
		return	inReturnUpper ? trUpper.sink : trLower.sink;
	},


	/*
	 * Mathematics & Geometry helper methods
	 */

	fpEqual: function ( inNum0, inNum1 ) {
		 return		Math.abs( inNum0 - inNum1 ) < PNLTRI.Math.EPSILON_P;
	},

	
	// Returns TRUE if the trapezoid is triangular and lies inside the polygon.
	// !! depends on the correct orientation of segments (contour: CCW, hole: CW) !!
	
	inside_polygon: function ( inTrap ) {

		var rseg = inTrap.rseg;
		
		if ( !inTrap.lseg || !inTrap.rseg )		return false;
		
		if ( ( !inTrap.u0 && !inTrap.u1 ) || ( !inTrap.d0 && !inTrap.d1 ) ) {
			// triangle shaped trapezoid
			//  CCW ordering of the contour segments:
			//	 right segment is going upwards <=> triangle is inside the polygon
			return ( rseg.upward );
		}
		
		return false;
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
		
		// functions handling the relationship to the upper neighbors (u0, u1)
		//	of trNewLeft and trNewRight
		
		function	fresh_seg_or_upward_cusp() {
			// trCurrent has at most 1 upper neighbor
			//	and should also have at least 1, since the high-point trapezoid
			//	has been split off another one, which is now above

			if ( trCurrent.u0.d0 && trCurrent.u0.d1 ) {
				// upward cusp: top forms a triangle

				// ATTENTION: the decision whether trNewLeft or trNewRight is the
				//	triangle trapezoid formed by the two segments has already been taken
				//	when selecting trCurrent as the left or right lower neighbor to trCurrent.u0 !!
				
				if ( trCurrent == trCurrent.u0.d1 ) {
					//	*** Case: FUC_UC_RIGHT; prev: ----
					// console.log( "fresh_seg_or_upward_cusp: upward cusp, new seg from the right!" );
					// !! trNewLeft and trNewRight cannot have been extended from above !!
					//		  C.u0
					//   -------*-------
					//		   / +
					//		  /   +	 NR
					//		 /	NL +
					//		/		+
					trNewLeft.setAbove( null, null );
					trNewLeft.topLoc = PNLTRI.TRAP_CUSP;
					trNewRight.topLoc = PNLTRI.TRAP_LEFT;
					trNewRight.setAbove( '', null );
					// first parameter is NEVER null (trCurrent.u0.d0)
					trNewRight.u0.setBelow( '', trNewRight );
				} else {
					//	*** Case: FUC_UC_LEFT; prev: ----
					// console.log( "fresh_seg_or_upward_cusp: upward cusp, new seg to the left!" );
					// !! trNewLeft and trNewRight cannot have been extended from above !!
					//		  C.u0
					//   -------*-------
					//		   + \
					//	  NL  +   \
					//		 +	NR \
					//		+		\
					trNewRight.setAbove( null, null );
					trNewRight.topLoc = PNLTRI.TRAP_CUSP;
					trNewLeft.topLoc = PNLTRI.TRAP_RIGHT;
					trNewLeft.setAbove( '', null );
					// second parameter is NEVER null (trCurrent.u0.d1)
					trNewLeft.u0.setBelow( trNewLeft, '' );
				}
			} else {
				//	*** Case: FUC_FS; prev: ----
				// console.log( "fresh_seg_or_upward_cusp: fresh segment, high adjacent segment still missing" );
				// !! trNewLeft and trNewRight cannot have been extended from above !!
				//		  C.u0
				//   -------*-------
				//		   +
				//	  NL  +
				//		 +	NR
				//		+
				trNewLeft.u0.setBelow( trNewLeft, trNewRight );
				trNewLeft.u0.botLoc = PNLTRI.TRAP_MIDDLE;
				trNewLeft.topLoc = PNLTRI.TRAP_RIGHT;
				trNewRight.topLoc = PNLTRI.TRAP_LEFT;
			}
 		}
		
		function	continue_chain_from_above() {
			// trCurrent has at least 2 upper neighbors
			if ( trCurrent.usave ) {
				// 3 upper neighbors (part II)
				if ( trCurrent.uside == PNLTRI.S_LEFT ) {
					//	*** Case: CC_3UN_LEFT; prev: 1B_3UN_LEFT
					// console.log( "continue_chain_from_above: 3 upper neighbors (part II): u0a, u0b, u1(usave)" );
					// => left gets one, right gets two of the upper neighbors
					// !! trNewRight cannot have been extended from above
					//		and trNewLeft must have been !!
					//		   +		/
					//	  C.u0  + C.u1 / C.usave
					//   --------+----*----------
					//		NL	  +		NR
					trNewRight.setAbove( trCurrent.u1, trCurrent.usave );
					trNewRight.u0.setBelow( trNewRight, null );
					trNewRight.u1.setBelow( trNewRight, null );
					trNewRight.topLoc = PNLTRI.TRAP_MIDDLE;
				} else {
					//	*** Case: CC_3UN_RIGHT; prev: 1B_3UN_RIGHT
					// console.log( "continue_chain_from_above: 3 upper neighbors (part II): u0(usave), u1a, u1b" );
					// => left gets two, right gets one of the upper neighbors
					// !! trNewLeft cannot have been extended from above
					//		and trNewRight must have been !!
					//			\		 +
					//	 C.usave \ C.u0 + C.u1
					//   ---------*----+-------
					//			NL    +   NR
					trNewLeft.setAbove( trCurrent.usave, trCurrent.u0 );
					trNewLeft.u0.setBelow( trNewLeft, null );
					trNewLeft.u1.setBelow( trNewLeft, null );
					trNewLeft.topLoc = PNLTRI.TRAP_MIDDLE;
				}
				trNewLeft.usave = trNewRight.usave = null;
			} else {
				//	*** Case: CC_2UN; prev: 1B_1UN_CONT, 2B_NCON_LEFT, 2B_NCON_RIGHT, 2B_NCON_TOUCH
				// console.log( "continue_chain_from_above: simple case, 2 neighbors above (no usave)" );
				//	  C.u0	 +  C.u1
				//   -------+---------
				//	   NL  +	NR
				
				//
				//	Alternativ: Continuation of other segment ?			TODO
				//
				
				if ( changeRightUp ) {
					trNewRight.setAbove( trCurrent.u1, null );
					// second parameter is NOT always null (prev: 2B_NCON_LEFT, 2B_NCON_TOUCH)
					trNewRight.u0.setBelow( trNewRight, '' );
					if ( trCurrent.vHigh == trFirst.vHigh ) {		// && meetsHighAdjSeg ??? TODO
						trNewRight.topLoc = PNLTRI.TRAP_LEFT;
					}
				}
				if ( changeLeftUp ) {
					trNewLeft.setAbove( trCurrent.u0, null );
					if ( trCurrent.vHigh == trFirst.vHigh ) {
						trNewLeft.topLoc = PNLTRI.TRAP_RIGHT;
					}
				}
			}
 		}
		
		// functions handling the relationship to the lower neighbors (d0, d1)
		//	of trNewLeft and trNewRight
		
		function	only_one_trap_below( inTrNext ) {
			// console.log( "only_one_trap_below: (act.vLow.y, last.vLow.y)", trCurrent.vLow.y, trLast.vLow.y );
			// make trNewLeft and trNewRight the upper neighbors of the sole lower trapezoid inTrNext
			if ( ( trCurrent.vLow == trLast.vLow ) && meetsLowAdjSeg ) {
				// downward cusp: bottom forms a triangle
				
				// ATTENTION: the decision whether trNewLeft or trNewRight is the
				//	triangle trapezoid formed by the two segments has already been taken
				//	when selecting trLast to the right or left of segLowAdjSeg !!
				
				if ( trCurrent.rseg == segLowAdjSeg ) {
					//	*** Case: 1B_DC_LEFT; next: ----
					// console.log( "only_one_trap_below: downward cusp, new seg from the left!" );
					//		+		/
					//		 +  NR /
					//	  NL  +	  /
					//		   + /
					//   -------*-------
					//		  next
					trNewLeft.setBelow( inTrNext, null );
					trNewLeft.botLoc = PNLTRI.TRAP_RIGHT;
					trNewRight.botLoc = PNLTRI.TRAP_CUSP;
					trNewRight.setBelow( null, null );
					// second parameter is NEVER null (inTrNext.u1)
					inTrNext.setAbove( trNewLeft, '' );
				} else {
					//	*** Case: 1B_DC_RIGHT; next: ----
					// console.log( "only_one_trap_below: downward cusp, new seg to the right!" );
					//		\		+
					//		 \  NL +
					//		  \	  +  NR
					//		   \ +
					//   -------*-------
					//		  next
					trNewRight.setBelow( inTrNext, null );
					trNewRight.botLoc = PNLTRI.TRAP_LEFT;
					trNewLeft.botLoc = PNLTRI.TRAP_CUSP;
					trNewLeft.setBelow( null, null );
					// first parameter is NEVER null (inTrNext.u0)
					inTrNext.setAbove( '', trNewRight );
				}
			} else {
				if ( inTrNext.u0 && inTrNext.u1 ) {
					// inTrNext has two upper neighbors
					// => a segment ends on the upper Y-line of inTrNext
					// => inTrNext has temporarily 3 upper neighbors
					// => marks whether the new segment cuts through
					//		u0 or u1 of inTrNext and saves the other in .usave
					if ( inTrNext.u0 == trCurrent ) {
						//	*** Case: 1B_3UN_LEFT; next: CC_3UN_LEFT
						// console.log( "only_one_trap_below: inTrNext has 3 upper neighbors (part I): u0a, u0b, u1(usave)" );
						//		 +		  /
						//	  NL  +	 NR	 /
						//		   +	/
						//   -------+--*----
						//			 +
						//		  next
						inTrNext.usave = inTrNext.u1;
						inTrNext.uside = PNLTRI.S_LEFT;
					} else {
						//	*** Case: 1B_3UN_RIGHT; next: CC_3UN_RIGHT
						// console.log( "only_one_trap_below: inTrNext has 3 upper neighbors (part I): u0(usave), u1a, u1b" );
						//	 \		   +
						//	  \	  NL  +  NR
						//	   \	 +
						//   ---*---+-------
						//		   +
						//		  next
						inTrNext.usave = inTrNext.u0;
						inTrNext.uside = PNLTRI.S_RIGHT;
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
						inTrNext.topLoc = PNLTRI.TRAP_MIDDLE;
						trNewLeft.botLoc = PNLTRI.TRAP_RIGHT;
						trNewRight.botLoc = PNLTRI.TRAP_LEFT;
					// } else {
						//	*** Case: 1B_1UN_CONT; next: CC_2UN
						// console.log( "only_one_trap_below: simple case, new seg continues down" );
						//			  +
						//		NL	 +  NR
						//			+
						//   ------+-------
						//	 	  +
						//		next
					}
				}
				inTrNext.setAbove( trNewLeft, trNewRight );
				
				trNewLeft.setBelow( inTrNext, null );
				trNewRight.setBelow( inTrNext, null );
			}
		}
	
		function two_trap_below() {
			// Find out which one (d0,d1) is intersected by this segment and
			//	continue down that one
			var trNext;
			if ( ( trCurrent.vLow == trLast.vLow ) && meetsLowAdjSeg ) {
				//	*** Case: 2B_CON_END; next: ----
				// console.log( "two_trap_below: finished, meets low adjacent segment" );
				//			  +
				//		NL	 +  NR
				//			+
				//   ------*-------
				//	 		\  C.d1
				//	  C.d0	 \
				trCurrent.d0.setAbove( trNewLeft, null );
				trCurrent.d1.setAbove( trNewRight, null );
				
				trNext = trCurrent.d1;		// temporary store, in case: trCurrent == trNewLeft
				trNewLeft.setBelow( trCurrent.d0, null );
				trNewRight.setBelow( trNext, null );

				trNewLeft.botLoc = PNLTRI.TRAP_RIGHT;
				trNewRight.botLoc = PNLTRI.TRAP_LEFT;
				
				trNext = null;	      	// segment finished
			} else {
				// passes left or right of an already inserted NOT connected segment
				//	trCurrent.vLow: high-end of existing segment
				var compRes = scope.is_left_of( inSegment, trCurrent.vLow, true );
				if ( compRes > 0 ) {				// trCurrent.vLow is left of inSegment
					//	*** Case: 2B_NCON_RIGHT; next: CC_2UN
					// console.log( "two_trap_below: (intersecting d1)" );
					//		 +
					//	  NL  +  NR
					//		   +
					//   ---*---+-------
					//		 \	 +
					//	 C.d0 \	C.d1
					trNext = trCurrent.d1;
					
					trCurrent.d0.setAbove( trNewLeft, null );
					trCurrent.d1.setAbove( trNewLeft, trNewRight );
					
					// change FIRST trNewLeft then trNewRight !!
					trNewLeft.setBelow( trCurrent.d0, trCurrent.d1 );
					trNewRight.setBelow( trCurrent.d1, null );
				} else if ( compRes < 0 ) {			// trCurrent.vLow is right of inSegment
					//	*** Case: 2B_NCON_LEFT; next: CC_2UN
					// console.log( "two_trap_below: (intersecting d0)" );
					//			  +
					//		NL	 +  NR
					//			+
					//   ------+---*-------
					//	 	  +		\  C.d1
					//	 	 C.d0	 \
					trNext = trCurrent.d0;
		
					trCurrent.d0.setAbove( trNewLeft, trNewRight );
					trCurrent.d1.setAbove( trNewRight, null );
					
					// change FIRST trNewRight then trNewLeft !!
					trNewRight.setBelow( trCurrent.d0, trCurrent.d1 );
					trNewLeft.setBelow( trCurrent.d0, null );
				} else {							// trCurrent.vLow lies ON inSegment
					//	*** Case: 2B_NCON_TOUCH; next: CC_2UN
					// console.log( "two_trap_below: vLow ON new segment" );
					//			  +
					//		NL	 +  NR
					//			+
					//   ------*-------
					//	 	  +	\  C.d1
					//	  C.d0	 \
					// OR:
					//		 +
					//	  NL  +  NR
					//		   +
					//   -------*-------
					//		   / +
					//	 C.d0 /	C.d1
					trNext = trCurrent.d0;				// TODO: for test_add_segment_spezial_4A -> like intersecting d0
//					trNext = trCurrent.d1;				// TODO: for test_add_segment_spezial_9 -> like intersecting d1
		
					trCurrent.d0.setAbove( trNewLeft, trNewRight );
					trCurrent.d1.setAbove( trNewRight, null );
					
					// change FIRST trNewRight then trNewLeft !!
					trNewRight.setBelow( trCurrent.d0, trCurrent.d1 );
					trNewLeft.setBelow( trCurrent.d0, null );
				}
			}	    
			
 			return	trNext;
		}

		//
		//	function body
		//
		
		var segHighPt, segHighRoot, segHighAdjSeg;		// y-max vertex
		var segLowPt , segLowRoot , segLowAdjSeg;		// y-min vertex
		
/*		if ( ( inSegment.sprev.vTo != inSegment.vFrom ) || ( inSegment.vTo != inSegment.snext.vFrom ) ) {
			console.log( "add_segment: inconsistent point order of adjacent segments: ",
						 inSegment.sprev.vTo, inSegment.vFrom, inSegment.vTo, inSegment.snext.vFrom );
			return;
		}		*/
		
		if ( inSegment.upward ) {
			segLowPt	= inSegment.vFrom;
			segHighPt	= inSegment.vTo;
			segLowRoot		= inSegment.rootFrom;
			segHighRoot		= inSegment.rootTo;
			segLowAdjSeg	= inSegment.sprev;
			segHighAdjSeg	= inSegment.snext;
		} else {
			segLowPt	= inSegment.vTo;
			segHighPt	= inSegment.vFrom;
			segLowRoot		= inSegment.rootTo;
			segHighRoot		= inSegment.rootFrom;
			segLowAdjSeg	= inSegment.snext;
			segHighAdjSeg	= inSegment.sprev;
		}

		var qs_area, meetsLowAdjSeg = false;

		//	insert higher point into QueryStructure
		//		Get the top-most intersecting trapezoid
		qs_area = this.ptNode( segHighPt, segLowPt, segHighRoot );
		if ( !segHighAdjSeg.is_inserted ) {
			// higher point not yet inserted => split trapezoid horizontally
			qs_area = this.splitNodeAtPoint( qs_area, segHighPt, false );
		}
		var trFirst = qs_area.trap;		// top-most trapezoid

		//	insert lower point into QueryStructure
		//		Get the bottom-most intersecting trapezoid
		qs_area = this.ptNode( segLowPt, segHighPt, segLowRoot );
		if ( !segLowAdjSeg.is_inserted ) {
			// lower point not yet inserted => split trapezoid horizontally
			qs_area = this.splitNodeAtPoint( qs_area, segLowPt, true );
		} else {
			// lower point already inserted earlier => segments meet at the end
			meetsLowAdjSeg = true;
		}
		var trLast = qs_area.trap;			// bottom-most trapezoid
		
		//
		// Thread the segment into the query tree creating a new X-node first,
		//	then split all the trapezoids which are intersected by
		//	inSegment into two
		// Traverse from top to bottom
		//

		var trCurrent = trFirst;
		
		var qs_trCurrent;
		var trNewLeft, trNewRight, trPrevLeft, trPrevRight;
		var changeLeftUp, changeRightUp;
		
		var counter = this.trapArray.length + 2;		// just to prevent infinite loop
		var trNext;
		while ( trCurrent ) {
			if ( --counter < 0 ) {
				console.log( "ERR add_segment: infinite loop", trCurrent, inSegment, this );
				return;
			}
			if ( !trCurrent.d0 && !trCurrent.d1 ) {
				// ERROR: no successors, cannot arise if data is correct
				console.log( "ERR add_segment: missing successors", trCurrent, inSegment, this );
				return;
			}
			
			qs_trCurrent = trCurrent.sink;
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
				trNewRight.botLoc = trCurrent.botLoc;
				// redirect parent PNLTRI.T_X-Node to extended sink
				qs_trCurrent.right = trPrevRight.sink;
				trNewLeft.sink  = qs_trCurrent.newLeft( PNLTRI.T_SINK, trNewLeft );		// left trapezoid sink (use existing one)
			} else if ( trPrevLeft && ( trPrevLeft.lseg == trCurrent.lseg ) ) {
				changeLeftUp = false;
				// console.log( "add_segment: extending left predecessor down!", trPrevLeft );
				trNewRight = trCurrent;
				trNewLeft = trPrevLeft;
				trNewLeft.vLow = trCurrent.vLow;
				trNewLeft.botLoc = trCurrent.botLoc;
				// redirect parent PNLTRI.T_X-Node to extended sink
				qs_trCurrent.left = trPrevLeft.sink;
				trNewRight.sink = qs_trCurrent.newRight( PNLTRI.T_SINK, trNewRight );	// right trapezoid sink (use existing one)
			} else {
				trNewLeft = trCurrent;
				trNewRight = this.cloneTrap(trCurrent); 								// split-right: (allocate new)
				trNewRight.sink = qs_trCurrent.newRight( PNLTRI.T_SINK, trNewRight );	// right trapezoid sink
				trNewLeft.sink  = qs_trCurrent.newLeft( PNLTRI.T_SINK, trNewLeft );		// left trapezoid sink (use existing one)
			}
		
			// handle neighbors above
			if ( trCurrent.u0 && trCurrent.u1 )	{
				continue_chain_from_above();
			} else {
				fresh_seg_or_upward_cusp();
			}

			// handle neighbors below
			if ( trCurrent.d0 && trCurrent.d1 ) {
				trNext = two_trap_below();
			} else {
				if ( trCurrent.d0 ) {
					// console.log( "add_segment: only_one_trap_below! (d0)" );
					trNext = trCurrent.d0;
				} else {
					// console.log( "add_segment: only_one_trap_below! (d1)" );
					trNext = trCurrent.d1;
				}
				only_one_trap_below( trNext );
			}
      
			trNewLeft.rseg = trNewRight.lseg  = inSegment;

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

	
	// Find one triangular trapezoid which lies inside the polygon
	
	find_first_inside: function () {
		for (var i=0, j=this.trapArray.length; i<j; i++) { 
			if ( this.inside_polygon( this.trapArray[i] ) ) {
				return this.trapArray[i];
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
		
		var randSegListArray = this.queryStructure.segListArray.slice(0);
		PNLTRI.Math.array_shuffle( randSegListArray );
//		this.random_sequence_log( randSegListArray );
		
		var i, h;
		var anzSegs = randSegListArray.length;

		var logStarN = this.math_logstar_n(anzSegs);
		for (h = 1; h <= logStarN; h++) {
			for (i = this.math_NH(anzSegs, h -1); i < this.math_NH(anzSegs, h); i++) {
				this.queryStructure.add_segment( randSegListArray[i-1] );
//				this.queryStructure.add_segment_consistently( randSegListArray[i-1], 'RandomA#'+(i-1) );
			}
			// Find a new sub-tree root for each of the segment endpoints
			for (i = 0; i < anzSegs; i++) {
				this.find_new_roots( randSegListArray[i] );
			}
		}
		
		for (i = this.math_NH( anzSegs, logStarN ); i <= anzSegs; i++) {
			this.queryStructure.add_segment( randSegListArray[i-1] );
//			this.queryStructure.add_segment_consistently( randSegListArray[i-1], 'RandomB#'+(i-1) );
		}
		
		return	this.queryStructure.find_first_inside();
	},

};

