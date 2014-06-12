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
//		var myPolygonData = new PNLTRI.PolygonData( null );
//		this.compare_pts_yx = myPolygonData.compare_pts_yx;
		this.compare_pts_yx = PNLTRI.PolygonData.prototype.compare_pts_yx;
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

	
	// Assign a depth to the trapezoids; 0: outside, 1: main polygon, 2: holes
	assignDepths: function () {
		var thisDepth = [ this.trapArray[0] ];
		var nextDepth = [];
		
		function assignDepth( inTrap, inDepth ) {
			if ( !inTrap )				return;
			if ( inTrap.depth != -1 )	return;
			inTrap.depth = inDepth;
			//
			var otherSide;
			if ( ( otherSide = inTrap.lseg ) && ( otherSide.trLeft.depth == -1 ) )
				nextDepth.push( otherSide.trLeft );
			if ( ( otherSide = inTrap.rseg ) && ( otherSide.trRight.depth == -1 ) )
				nextDepth.push( otherSide.trRight );
			//
			assignDepth( inTrap.uL, inDepth );
			assignDepth( inTrap.uR, inDepth );
			assignDepth( inTrap.dL, inDepth );
			assignDepth( inTrap.dR, inDepth );
		};
		
		var thisTrap, curDepth = 0;
		do {
			while ( thisTrap = thisDepth.shift() ) {
				assignDepth( thisTrap, curDepth );
			}
			thisDepth = nextDepth; nextDepth = [];
			curDepth++;
		} while ( thisDepth.length > 0 );
	},
	

	// reverse winding order of a polygon chain
	reverse_polygon_chain: function ( inSomeSegment ) {
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


	// Check segment orientation and reverse polyChain winding order if necessary
	//	=> contour: CCW, holes: CW
	//	=> all trapezoids lseg/rseg have opposing directions,
	//		assumed, the missing outer segments have CW orientation !
	
	normalize_segment_orientation: function () {
		var thisSeg;
		for ( var i = 0; i < this.segListArray.length; i++ ) {
			thisSeg = this.segListArray[i];
			if ( thisSeg.upward == ( ( thisSeg.trLeft.depth % 2 ) == 0 ) )
				this.reverse_polygon_chain( thisSeg );
		}
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
		var myQs = this.queryStructure;
		
		var randSegListArray = myQs.segListArray.slice(0);
//		console.log( "Polygon Chains: ", dumpSegmentList( randSegListArray ) );
		PNLTRI.Math.array_shuffle( randSegListArray );
//		console.log( "Random Segment Sequence: ", dumpRandomSequence( randSegListArray ) );
		
		var i, h;
		var anzSegs = randSegListArray.length;

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
		
		myQs.assignDepths();
		myQs.normalize_segment_orientation();
	},

};

