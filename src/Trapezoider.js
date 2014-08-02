/**
 * @author jahting / http://www.ameco.tv/
 *
 *	Algorithm to create the trapezoidation of a polygon with holes
 *	 according to Seidel's algorithm [Sei91]
 */

/** @constructor */
PNLTRI.Trapezoid = function ( inHigh, inLow, inLeft, inRight ) {

	this.vHigh = inHigh ? inHigh : { x: Number.POSITIVE_INFINITY, y: Number.POSITIVE_INFINITY };
	this.vLow  = inLow  ? inLow  : { x: Number.NEGATIVE_INFINITY, y: Number.NEGATIVE_INFINITY };

	this.lseg = inLeft;
	this.rseg = inRight;

//	this.uL = null;				// -> Trapezoid: upper left neighbor
//	this.uR = null;				// -> Trapezoid: upper right neighbor
//	this.dL = null;				// -> Trapezoid: lower left neighbor
//	this.dR = null;				// -> Trapezoid: lower right neighbor

//	this.sink = null;			// link to corresponding SINK-Node in QueryStructure

//	this.usave = null;			// temp: uL/uR, preserved for next step
//	this.uleft = null;			// temp: from uL? (true) or uR (false)

	this.depth = -1;			// no depth assigned yet

	this.monoDone = false;		// monotonization: done with trying to split this trapezoid ?

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


	splitOffLower: function ( inSplitPt ) {
		var trLower = this.clone();				// new lower trapezoid

		this.vLow = trLower.vHigh = inSplitPt;

		// L/R unknown, anyway changed later
		this.dL = trLower;		// setBelow
		trLower.uL = this;		// setAbove
		this.dR = trLower.uR = null;

		// setAbove
		if ( trLower.dL )	trLower.dL.uL = trLower;	// dL always connects to uL
		if ( trLower.dR )	trLower.dR.uR = trLower;	// dR always connects to uR

		return	trLower;
	},

};


/*==============================================================================
 *
 *============================================================================*/

// PNLTRI.qsCounter = 0;

/** @constructor */
PNLTRI.QsNode = function ( inTrapezoid ) {
//	this.qsId = PNLTRI.qsCounter++;				// Debug only
	// Only SINK-nodes are created directly.
	// The others originate from splitting trapezoids
	// - by a horizontal line: SINK-Node -> Y-Node
	// - by a segment: SINK-Node -> X-Node
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
	var initialTrap = new PNLTRI.Trapezoid( null, null, null, null );
	this.trapArray = [];
	this.appendTrapEntry( initialTrap );

//	PNLTRI.qsCounter = 0;
	this.root = new PNLTRI.QsNode( initialTrap );

	if ( inPolygonData ) {
		/*
		 * adds and initializes specific attributes for all segments
		 *	// -> QueryStructure: roots of partial tree where vertex is located
		 *	rootFrom, rootTo:	for vFrom, vTo
		 *	// marker
		 *	is_inserted:	already inserted into QueryStructure ?
		 */
		var segListArray = inPolygonData.getSegments();
		for ( var i = 0; i < segListArray.length; i++ ) {
			segListArray[i].rootFrom = segListArray[i].rootTo = this.root;
			segListArray[i].is_inserted = false;
		}
	}
};

PNLTRI.QueryStructure.prototype = {

	constructor: PNLTRI.QueryStructure,

	getRoot: function () {
		return this.root;
	},


	appendTrapEntry: function ( inTrapezoid ) {
		inTrapezoid.trapID = this.trapArray.length;			// for Debug
		this.trapArray.push( inTrapezoid );
	},
	cloneTrap: function ( inTrapezoid ) {
		var trap = inTrapezoid.clone();
		this.appendTrapEntry( trap );
		return	trap;
	},


	splitNodeAtPoint: function ( inNode, inPoint, inReturnUpper ) {
		// inNode: SINK-Node with trapezoid containing inPoint
		var trUpper = inNode.trap;							// trUpper: trapezoid includes the point
		if (trUpper.vHigh == inPoint)	return	inNode;				// (ERROR) inPoint is already inserted
		if (trUpper.vLow == inPoint)	return	inNode;				// (ERROR) inPoint is already inserted
		var trLower = trUpper.splitOffLower( inPoint );		// trLower: new lower trapezoid
		this.appendTrapEntry( trLower );

		// SINK-Node -> Y-Node
		inNode.yval = inPoint;
		inNode.trap = null;

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
		var retVal;
		var dXfrom = inSeg.vFrom.x - inPt.x;
		var dXto = inSeg.vTo.x - inPt.x;
		var dYfromZero = ( Math.abs( inSeg.vFrom.y - inPt.y ) < PNLTRI.Math.EPSILON_P );
		if ( Math.abs( inSeg.vTo.y - inPt.y ) < PNLTRI.Math.EPSILON_P ) {
			if ( dYfromZero )	return 0;		// all points on a horizontal line
			retVal = dXto;
		} else if ( dYfromZero ) {
			retVal = dXfrom;
/*		} else if ( inBetweenY && ( dXfrom * dXto > 0 ) ) {
			// both x-coordinates of inSeg are on the same side of inPt
			if ( Math.abs( dXto ) >= PNLTRI.Math.EPSILON_P )	return	dXto;
			retVal = dXfrom;	*/
		} else {
			if ( inSeg.upward ) {
				return	PNLTRI.Math.ptsCrossProd( inSeg.vFrom, inSeg.vTo, inPt );
			} else {
				return	PNLTRI.Math.ptsCrossProd( inSeg.vTo, inSeg.vFrom, inPt );
			}
		}
		if ( Math.abs( retVal ) < PNLTRI.Math.EPSILON_P )		return	0;
		return	retVal;
	},


	/*
	 * Query structure main methods
	 */

	//	This method finds the Node in the QueryStructure corresponding
	//   to the trapezoid that contains inPt, starting from Node rootFrom/rootTo.
	//  If inPt lies on a border (y-line or segment) inPtOther is used
	//	 to determine on which side.

	// TODO: may need to prevent infinite loop in case of messed up
	//	trapezoid structure (s. test_add_segment_special_6)

	segNodes: function ( inSegment ) {
		this.ptNode( inSegment, true );
		this.ptNode( inSegment, false );
	},

	ptNode: function ( inSegment, inUseFrom ) {
		if ( inUseFrom ) {
			var inPt = inSegment.vFrom;
			var inPtOther = inSegment.vTo;
			var	qsNode = inSegment.rootFrom;
		} else {
			inPt = inSegment.vTo;
			inPtOther = inSegment.vFrom;
			qsNode = inSegment.rootTo;
		}
		var compPt, compRes;
		var isInSegmentShorter;

		while ( qsNode ) {
			if ( qsNode.yval ) {			// Y-Node: horizontal line
											// 4 times as often as X-Node
				if ( inPt == qsNode.yval )	compPt = inPtOther;				// the point is already inserted.
				else						compPt = inPt;
				compRes = PNLTRI.Math.compare_pts_yx( compPt, qsNode.yval );
/*				if ( compRes == 0 ) {			// TODO: Testcase
					console.log("ptNode: Pts too close together#1: ", compPt, qsNode.yval );
				}		*/
				qsNode = ( compRes == -1 ) ? qsNode.left : qsNode.right;		// below : above
			} else if ( qsNode.seg ) {		// X-Node: segment (~vertical line)
											// 0.8 to 1.5 times as often as SINK-Node
				if ( ( inPt == qsNode.seg.vFrom ) ||						// the point is already inserted.
					 ( inPt == qsNode.seg.vTo ) ) {
					if ( this.fpEqual( inPt.y, inPtOther.y ) ) {
						// horizontal segment
						if ( !this.fpEqual( qsNode.seg.vFrom.y, qsNode.seg.vTo.y ) ) {
							qsNode = ( inPtOther.x < inPt.x ) ? qsNode.left : qsNode.right;		// left : right
						} else {	// co-linear horizontal reversal: test_add_segment_special_7
							if ( inPt == qsNode.seg.vFrom ) {
								// connected at qsNode.seg.vFrom
								isInSegmentShorter = ( inPtOther.x > inPt.x ) ?
										( inPtOther.x <  qsNode.seg.vTo.x ) :
										( inPtOther.x >= qsNode.seg.vTo.x );
							/*	if ( isInSegmentShorter ) {
									if ( inSegment.sprev.upward )
										console.log("ptNode: co-linear horizontal reversal, connected at qsNode.seg.vFrom, inSeg: short & up", inUseFrom, inSegment, qsNode )
									else
										console.log("ptNode: co-linear horizontal reversal, connected at qsNode.seg.vFrom, inSeg: short & down", inUseFrom, inSegment, qsNode );
								} else {
									if ( qsNode.seg.snext.upward )
										console.log("ptNode: co-linear horizontal reversal, connected at qsNode.seg.vFrom, inSegLong, qsSegUp", inUseFrom, inSegment, qsNode );
									else
										console.log("ptNode: co-linear horizontal reversal, connected at qsNode.seg.vFrom, inSegLong, qsSegDown", inUseFrom, inSegment, qsNode );
								}	*/
								qsNode = isInSegmentShorter ?
									( inSegment.sprev.upward  ? qsNode.right : qsNode.left ) :		// above : below
									( qsNode.seg.snext.upward ? qsNode.right : qsNode.left );		// above : below
							} else {
								// connected at qsNode.seg.vTo
								isInSegmentShorter = ( inPtOther.x > inPt.x ) ?
										( inPtOther.x <  qsNode.seg.vFrom.x ) :
										( inPtOther.x >= qsNode.seg.vFrom.x );
							/*	if ( isInSegmentShorter ) {
									if ( inSegment.sprev.upward )
										console.log("ptNode: co-linear horizontal reversal, connected at qsNode.seg.vTo, inSeg: short & up", inUseFrom, inSegment, qsNode );
									else
										console.log("ptNode: co-linear horizontal reversal, connected at qsNode.seg.vTo, inSeg: short & down", inUseFrom, inSegment, qsNode );
								} else {
									if ( qsNode.seg.sprev.upward )
										console.log("ptNode: co-linear horizontal reversal, connected at qsNode.seg.vTo, inSegLong, qsSegUp", inUseFrom, inSegment, qsNode );
									else
										console.log("ptNode: co-linear horizontal reversal, connected at qsNode.seg.vTo, inSegLong, qsSegDown", inUseFrom, inSegment, qsNode );
								}		*/
								qsNode = isInSegmentShorter ?
									( inSegment.snext.upward  ? qsNode.left : qsNode.right ) :		// below : above
									( qsNode.seg.sprev.upward ? qsNode.left : qsNode.right);		// below : above
							}
						}
					} else {
						compRes = this.is_left_of( qsNode.seg, inPtOther, false );
						if ( compRes > 0 ) {
							qsNode = qsNode.left;
						} else if ( compRes < 0 ) {
							qsNode = qsNode.right;
						} else {
							// co-linear reversal
							//	a co-linear continuation would not reach this point
							//  since the previous Y-node comparison would have led to a sink instead
//							console.log("ptNode: co-linear, going back on previous segment", inPt, inPtOther, qsNode );
							// now as we have two consecutive co-linear segments we have to avoid a cross-over
							//	for this we need the far point on the "next" segment to the SHORTER of our two
							//	segments to avoid that "next" segment to cross the longer of our two segments
							if ( inPt == qsNode.seg.vFrom ) {
								// connected at qsNode.seg.vFrom
//								console.log("ptNode: co-linear, going back on previous segment, connected at qsNode.seg.vFrom", inPt, inPtOther, qsNode );
								isInSegmentShorter = qsNode.seg.upward ?
										( inPtOther.y <  qsNode.seg.vTo.y ) :
										( inPtOther.y >= qsNode.seg.vTo.y );
								compRes = isInSegmentShorter ?
										this.is_left_of( qsNode.seg, inSegment.sprev.vFrom, false ) :
										-this.is_left_of( qsNode.seg, qsNode.seg.snext.vTo, false );
							} else {
								// connected at qsNode.seg.vTo
//								console.log("ptNode: co-linear, going back on previous segment, connected at qsNode.seg.vTo", inPt, inPtOther, qsNode );
								isInSegmentShorter = qsNode.seg.upward ?
										( inPtOther.y >= qsNode.seg.vFrom.y ) :
										( inPtOther.y <  qsNode.seg.vFrom.y );
								compRes = isInSegmentShorter ?
										this.is_left_of( qsNode.seg, inSegment.snext.vTo, false ) :
										-this.is_left_of( qsNode.seg, qsNode.seg.sprev.vFrom, false );
							}
							if ( compRes > 0 ) {
								qsNode = qsNode.left;
							} else if ( compRes < 0 ) {
								qsNode = qsNode.right;
							} else {
								// ???	TODO - not reached with current tests
								return qsNode;
								// qsNode = qsNode.left;		// left
								// qsNode = qsNode.right;		// right
							}
						}
					}
				} else {
/*					if ( ( PNLTRI.Math.compare_pts_yx( inPt, qsNode.seg.vFrom ) *			// TODO: Testcase
							PNLTRI.Math.compare_pts_yx( inPt, qsNode.seg.vTo )
						   ) == 0 ) {
						console.log("ptNode: Pts too close together#2: ", inPt, qsNode.seg );
					}		*/
					compRes = this.is_left_of( qsNode.seg, inPt, true );
					if ( compRes > 0 ) {
						qsNode = qsNode.left;
					} else if ( compRes < 0 ) {
						qsNode = qsNode.right;
					} else {
						// touching: inPt lies on qsNode.seg but is none of its endpoints
						//	should happen quite seldom
						compRes = this.is_left_of( qsNode.seg, inPtOther, false );
						if ( compRes > 0 ) {
							qsNode = qsNode.left;
						} else if ( compRes < 0 ) {
							qsNode = qsNode.right;
						} else {
							// co-linear: inSegment and qsNode.seg
							//	includes case with inPtOther connected to qsNode.seg
							var tmpPtOther = inUseFrom ? inSegment.sprev.vFrom : inSegment.snext.vTo;
							compRes = this.is_left_of( qsNode.seg, tmpPtOther, false );
							if ( compRes > 0 ) {
								qsNode = qsNode.left;
							} else if ( compRes < 0 ) {
								qsNode = qsNode.right;
							} else {
								// ???	TODO - not reached with current tests
								//				possible at all ?
								return qsNode;
								// qsNode = qsNode.left;		// left
								// qsNode = qsNode.right;		// right
							}
						}
					}
				}
			} else {		// SINK-Node: trapezoid area
							// least often
				if ( !qsNode.trap ) {
					console.log("ptNode: unknown type", qsNode);
				}
				if ( inUseFrom )	inSegment.rootFrom = qsNode
				else				inSegment.rootTo = qsNode;
				return qsNode;
			}
		}	// end while - should not exit here
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

		function fresh_seg_or_upward_cusp() {
			// trCurrent has at most 1 upper neighbor
			//	and should also have at least 1, since the high-point trapezoid
			//	has been split off another one, which is now above
			var trUpper = trCurrent.uL || trCurrent.uR;

			// trNewLeft and trNewRight CANNOT have been extended from above
			if ( trUpper.dL && trUpper.dR ) {
				// upward cusp: top forms a triangle

				// ATTENTION: the decision whether trNewLeft or trNewRight is the
				//	triangle trapezoid formed by the two segments has already been taken
				//	when selecting trCurrent as the left or right lower neighbor to trUpper !!

				if ( trCurrent == trUpper.dL ) {
					//	*** Case: FUC_UC_LEFT; prev: ----
					// console.log( "fresh_seg_or_upward_cusp: upward cusp, new seg to the left!" );
					//		  upper
					//   -------*-------
					//		   + \
					//	  NL  +   \
					//		 +	NR \
					//		+		\
					trNewRight.uL	= null;			// setAbove; trNewRight.uR, trNewLeft unchanged
					trUpper.dL		= trNewLeft;	// setBelow; dR: unchanged, NEVER null
				} else {
					//	*** Case: FUC_UC_RIGHT; prev: ----
					// console.log( "fresh_seg_or_upward_cusp: upward cusp, new seg from the right!" );
					//		  upper
					//   -------*-------
					//		   / +
					//		  /   +	 NR
					//		 /	NL +
					//		/		+
					trNewLeft.uR	= null;			// setAbove; trNewLeft.uL, trNewRight unchanged
					trUpper.dR		= trNewRight;	// setBelow; dL: unchanged, NEVER null
				}
			} else {
				//	*** Case: FUC_FS; prev: "splitOffLower"
				// console.log( "fresh_seg_or_upward_cusp: fresh segment, high adjacent segment still missing" );
				//		  upper
				//   -------*-------
				//		   +
				//	  NL  +
				//		 +	NR
				//		+
				trNewRight.uL = null;			// setAbove; trNewLeft unchanged, set by "splitOffLower"
				trNewRight.uR = trUpper;
				trUpper.dR = trNewRight;		// setBelow; trUpper.dL unchanged, set by "splitOffLower"
			}
 		}

		function continue_chain_from_above() {
			// trCurrent has at least 2 upper neighbors
			if ( trCurrent.usave ) {
				// 3 upper neighbors (part II)
				if ( trCurrent.uleft ) {
					//	*** Case: CC_3UN_LEFT; prev: 1B_3UN_LEFT
					// console.log( "continue_chain_from_above: 3 upper neighbors (part II): u0a, u0b, uR(usave)" );
					// => left gets one, right gets two of the upper neighbors
					// !! trNewRight cannot have been extended from above
					//		and trNewLeft must have been !!
					//		   +		/
					//	  C.uL  + C.uR / C.usave
					//    - - - -+----*----------
					//		NL	  +		NR
					trNewRight.uL = trCurrent.uR;		// setAbove
					trNewRight.uR = trCurrent.usave;
					trNewRight.uL.dL = trNewRight;		// setBelow; trNewRight.uL.dR == null, unchanged
					trNewRight.uR.dR = trNewRight;		// setBelow; trNewRight.uR.dL == null, unchanged
				} else {
					//	*** Case: CC_3UN_RIGHT; prev: 1B_3UN_RIGHT
					// console.log( "continue_chain_from_above: 3 upper neighbors (part II): uL(usave), u1a, u1b" );
					// => left gets two, right gets one of the upper neighbors
					// !! trNewLeft cannot have been extended from above
					//		and trNewRight must have been !!
					//			\		 +
					//	 C.usave \ C.uL + C.uR
					//   ---------*----+- - - -
					//			NL    +   NR
					trNewLeft.uR = trCurrent.uL;		// setAbove; first uR !!!
					trNewLeft.uL = trCurrent.usave;
					trNewLeft.uL.dL = trNewLeft;		// setBelow; dR == null, unchanged
					trNewLeft.uR.dR = trNewLeft;		// setBelow; dL == null, unchanged
				}
				trNewLeft.usave = trNewRight.usave = null;
			} else if ( trCurrent.vHigh == trFirst.vHigh ) {		// && meetsHighAdjSeg ??? TODO
				//	*** Case: CC_2UN_CONN; prev: ----
				// console.log( "continue_chain_from_above: 2 upper neighbors, fresh seg, continues high adjacent seg" );
				// !! trNewLeft and trNewRight cannot have been extended from above !!
				//	  C.uL	 /  C.uR
				//   -------*---------
				//	   NL  +	NR
				trNewRight.uR.dR = trNewRight;			// setBelow; dL == null, unchanged
				trNewLeft.uR = trNewRight.uL = null;	// setAbove; trNewLeft.uL, trNewRight.uR unchanged
			} else {
				//	*** Case: CC_2UN; prev: 1B_1UN_CONT, 2B_NOCON_RIGHT/LEFT, 2B_TOUCH_RIGHT/LEFT, 2B_COLIN_RIGHT/LEFT
				// console.log( "continue_chain_from_above: simple case, 2 upper neighbors (no usave, not fresh seg)" );
				// !! trNewLeft XOR trNewRight will have been extended from above !!
				//	  C.uL	 +  C.uR
				//   -------+---------
				//	   NL  +	NR
				if ( trNewRight == trCurrent ) {		// trNewLeft has been extended from above
					// setAbove
					trNewRight.uL = trNewRight.uR;
					trNewRight.uR = null;
					// setBelow; dR: unchanged, is NOT always null (prev: 2B_NOCON_LEFT, 2B_TOUCH_LEFT, 2B_COLIN_LEFT)
					trNewRight.uL.dL = trNewRight;
				} else {								// trNewRight has been extended from above
					trNewLeft.uR = trNewLeft.uL;	// setAbove; first uR !!!
					trNewLeft.uL = null;
				}
			}
		}

		// functions handling the relationship to the lower neighbors (dL, dR)
		//	of trNewLeft and trNewRight
		// trNewLeft or trNewRight MIGHT have been extended from above
		//  !! in that case dL and dR are different from trCurrent and MUST be set here !!

		function only_one_trap_below( inTrNext ) {

			if ( trCurrent.vLow == trLast.vLow ) {
				// final part of segment

				if ( meetsLowAdjSeg ) {
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

						// setAbove
						inTrNext.uL = trNewLeft;	// uR: unchanged, NEVER null
						// setBelow part 1
						trNewLeft.dL = inTrNext;
						trNewRight.dR = null;
					} else {
						//	*** Case: 1B_DC_RIGHT; next: ----
						// console.log( "only_one_trap_below: downward cusp, new seg to the right!" );
						//		\		+
						//		 \  NL +
						//		  \	  +  NR
						//		   \ +
						//   -------*-------
						//	   C.dR = next

						// setAbove
						inTrNext.uR = trNewRight;	// uL: unchanged, NEVER null
						// setBelow part 1
						trNewLeft.dL = null;
						trNewRight.dR = inTrNext;
					}
				} else {
					//	*** Case: 1B_1UN_END; next: ----
					// console.log( "only_one_trap_below: simple case, new seg ends here, low adjacent seg still missing" );
					//			  +
					//		NL	 +  NR
					//			+
					//   ------*-------
					//		  next

					// setAbove
					inTrNext.uL = trNewLeft;									// trNewLeft must
					inTrNext.uR = trNewRight;		// must
					// setBelow part 1
					trNewLeft.dL = trNewRight.dR = inTrNext;					// Error
//					trNewRight.dR = inTrNext;
				}
				// setBelow part 2
				trNewLeft.dR = trNewRight.dL = null;
			} else {
				// NOT final part of segment

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
						//   - - - -+--*----
						//			 +
						//		  next
//						if ( inTrNext.uR != trNewRight ) {		// for robustness	TODO: prevent
							inTrNext.usave = inTrNext.uR;
							inTrNext.uleft = true;
							// trNewLeft: L/R undefined, will be extended down and changed anyway
						// } else {
							// ERROR: should not happen
							// console.log( "ERR add_segment: Trapezoid Loop right", inTrNext, trCurrent, trNewLeft, trNewRight, inSegment, this );
//						}
					} else {
						//	*** Case: 1B_3UN_RIGHT; next: CC_3UN_RIGHT
						// console.log( "only_one_trap_below: inTrNext has 3 upper neighbors (part I): uL(usave), u1a, u1b" );
						//	 \		   +
						//	  \	  NL  +  NR
						//	   \	 +
						//   ---*---+- - - -
						//		   +
						//		  next
//						if ( inTrNext.uL != trNewLeft ) {		// for robustness	TODO: prevent
							inTrNext.usave = inTrNext.uL;
							inTrNext.uleft = false;
							// trNewRight: L/R undefined, will be extended down and changed anyway
						// } else {
							// ERROR: should not happen
							// console.log( "ERR add_segment: Trapezoid Loop left", inTrNext, trCurrent, trNewLeft, trNewRight, inSegment, this );
//						}
					}
				//} else {
					//	*** Case: 1B_1UN_CONT; next: CC_2UN
					// console.log( "only_one_trap_below: simple case, new seg continues down" );
					//			  +
					//		NL	 +  NR
					//			+
					//   ------+-------
					//	 	  +
					//		next

					// L/R for one side undefined, which one is not fixed
					//	but that one will be extended down and changed anyway
					// for the other side, vLow must lie at the opposite end
					//	thus both are set accordingly
				}
				// setAbove
				inTrNext.uL = trNewLeft;
				inTrNext.uR = trNewRight;
				// setBelow
				trNewLeft.dR = trNewRight.dL = inTrNext;
				trNewLeft.dL = trNewRight.dR = null;
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

				// setAbove
				trCurrent.dL.uL = trNewLeft;
				trCurrent.dR.uR = trNewRight;
				// setBelow; sequence of assignments essential, just in case: trCurrent == trNewLeft
				trNewLeft.dL = trCurrent.dL;
				trNewRight.dR = trCurrent.dR;
				trNewLeft.dR = trNewRight.dL = null;

				trNext = null;	      	// segment finished
			} else {
				// setAbove part 1
				trCurrent.dL.uL = trNewLeft;
				trCurrent.dR.uR = trNewRight;

				var goDownRight;
				// passes left or right of an already inserted NOT connected segment
				//	trCurrent.vLow: high-end of existing segment
				var compRes = scope.is_left_of( inSegment, trCurrent.vLow, true );
				if ( compRes > 0 ) {				// trCurrent.vLow is left of inSegment
					//	*** Case: 2B_NOCON_RIGHT; next: CC_2UN
					// console.log( "two_trap_below: (intersecting dR)" );
					//		 +
					//	  NL  +  NR
					//		   +
					//   ---*---+- - - -
					//		 \	 +
					//	 C.dL \	C.dR
					goDownRight = true;
				} else if ( compRes < 0 ) {			// trCurrent.vLow is right of inSegment
					//	*** Case: 2B_NOCON_LEFT; next: CC_2UN
					// console.log( "two_trap_below: (intersecting dL)" );
					//			  +
					//		NL	 +  NR
					//			+
					//    - - -+---*-------
					//	 	  +		\  C.dR
					//	 	 C.dL	 \
					goDownRight = false;
				} else {							// trCurrent.vLow lies ON inSegment
					var vLowSeg = trCurrent.dL.rseg;
					var directionIsUp = vLowSeg.upward;
					var otherPt = directionIsUp ? vLowSeg.vFrom : vLowSeg.vTo;
					compRes = scope.is_left_of( inSegment, otherPt, false );
					if ( compRes > 0 ) {				// otherPt is left of inSegment
						//	*** Case: 2B_TOUCH_RIGHT; next: CC_2UN
						// console.log( "two_trap_below: vLow ON new segment, touching from right" );
						//		 +
						//	  NL  +  NR
						//		   +
						//   -------*- - - -
						//		   / +
						//	 C.dL /	C.dR
						goDownRight = true;		// like intersecting dR
					} else if ( compRes < 0 ) {			// otherPt is right of inSegment
						//	*** Case: 2B_TOUCH_LEFT; next: CC_2UN
						// console.log( "two_trap_below: vLow ON new segment, touching from left" );
						//			  +
						//		NL	 +  NR
						//			+
						//    - - -*-------
						//	 	  +	\  C.dR
						//	  C.dL	 \
						goDownRight = false;	// like intersecting dL
					} else {							// otherPt lies ON inSegment
						vLowSeg = directionIsUp ? vLowSeg.snext : vLowSeg.sprev;		// other segment with trCurrent.vLow
						otherPt = directionIsUp ? vLowSeg.vTo : vLowSeg.vFrom;
						compRes = scope.is_left_of( inSegment, otherPt, false );
						if ( compRes > 0 ) {				// otherPt is left of inSegment
							//	*** Case: 2B_COLIN_RIGHT; next: CC_2UN
							// console.log( "two_trap_below: vLow ON new segment, touching from right" );
							//		  +
							//	  NL   +  NR
							//   -------*- - - -
							//	  C.dL 	\+  C.dR
							//			 \+
							goDownRight = true;		// like intersecting dR
					//	} else if ( compRes == 0 ) {		//	NOT POSSIBLE, since 3 points on a line is prevented during input of polychains
					//		goDownRight = true;		// like intersecting dR
						} else {							// otherPt is right of inSegment
							//	*** Case: 2B_COLIN_LEFT; next: CC_2UN
							// console.log( "two_trap_below: vLow ON new segment, touching from left" );
							//			   +
							//		NL	  +  NR
							//    - - - -*-------
							//	  C.dL	+/  C.dR
							//		   +/
							goDownRight = false;		// TODO: for test_add_segment_special_4 -> like intersecting dL
						}
					}
				}
				if ( goDownRight ) {
					trNext = trCurrent.dR;
					// setAbove part 2
					trCurrent.dR.uL = trNewLeft;
					// setBelow part 1
					trNewLeft.dL = trCurrent.dL;
					trNewRight.dR = null;	// L/R undefined, will be extended down and changed anyway
				} else {
					trNext = trCurrent.dL;
					// setAbove part 2
					trCurrent.dL.uR = trNewRight;
					// setBelow part 1
					trNewRight.dR = trCurrent.dR;
					trNewLeft.dL = null;	// L/R undefined, will be extended down and changed anyway
				}
				// setBelow part 2
				trNewLeft.dR = trNewRight.dL = trNext;
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

		//	Find the top-most and bottom-most intersecting trapezoids -> rootXXX
		this.segNodes( inSegment );

		var segLowVert , segLowNode, meetsLowAdjSeg;		// y-min vertex
		var segHighVert, segHighNode, meetsHighAdjSeg;		// y-max vertex

		if ( inSegment.upward ) {
			segLowVert	= inSegment.vFrom;
			segHighVert	= inSegment.vTo;
			segLowNode		= inSegment.rootFrom;
			segHighNode		= inSegment.rootTo;
			// was lower point already inserted earlier? => segments meet at their ends
			meetsLowAdjSeg	= inSegment.sprev.is_inserted;
			// was higher point already inserted earlier? => segments meet at their ends
			meetsHighAdjSeg	= inSegment.snext.is_inserted;
		} else {
			segLowVert	= inSegment.vTo;
			segHighVert	= inSegment.vFrom;
			segLowNode		= inSegment.rootTo;
			segHighNode		= inSegment.rootFrom;
			meetsLowAdjSeg	= inSegment.snext.is_inserted;
			meetsHighAdjSeg	= inSegment.sprev.is_inserted;
		}

		//	insert higher vertex into QueryStructure
		if ( !meetsHighAdjSeg ) {
			// higher vertex not yet inserted => split trapezoid horizontally
			var tmpNode = this.splitNodeAtPoint( segHighNode, segHighVert, false );
			// move segLowNode to new (lower) trapezoid, if it was the one which was just split
			if ( segHighNode == segLowNode )	segLowNode = tmpNode;
			segHighNode = tmpNode;
		}
		var trFirst = segHighNode.trap;		// top-most trapezoid for this segment

		// check for robustness		// TODO: prevent
		if ( !trFirst.uL && !trFirst.uR ) {
			console.log("ERR add_segment: missing trFirst.uX: ", trFirst );
			return;
		}
		if ( trFirst.vHigh != segHighVert ) {
			console.log("ERR add_segment: trFirstHigh != segHigh: ", trFirst );
			return;
		}

		//	insert lower vertex into QueryStructure
		if ( !meetsLowAdjSeg ) {
			// lower vertex not yet inserted => split trapezoid horizontally
			segLowNode = this.splitNodeAtPoint( segLowNode, segLowVert, true );
		}
		var trLast = segLowNode.trap;			// bottom-most trapezoid for this segment

		//
		// Thread the segment into the query "tree" from top to bottom.
		// All the trapezoids which are intersected by inSegment are "split" into two.
		// For each the SINK-QsNode is converted into an X-Node and
		//  new sinks for the new partial trapezoids are added.
		// In fact a real split only happens at the top and/or bottom end of the segment
		//	since at every y-line seperating two trapezoids is traverses it
		//	cuts off the "beam" from the y-vertex on one side, so that at that side
		//	the trapezoid from above can be extended down.
		//

		var trCurrent = trFirst;

		var trNewLeft, trNewRight, trPrevLeft, trPrevRight;

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
			// SINK-Node -> X-Node
			qs_trCurrent.seg = inSegment;
			qs_trCurrent.trap = null;
			//
			// successive trapezoids bordered by the same segments are merged
			//  by extending the trPrevRight or trPrevLeft down
			//  and redirecting the parent X-Node to the extended sink
			// !!! destroys tree structure since several nodes now point to the same SINK-Node !!!
			// TODO: maybe it's not a problem;
			//  merging of X-Nodes is no option, since they are used as "rootFrom/rootTo" !
			//
			if ( trPrevRight && ( trPrevRight.rseg == trCurrent.rseg ) ) {
				// console.log( "add_segment: extending right predecessor down!", trPrevRight );
				trNewLeft = trCurrent;
				trNewRight = trPrevRight;
				trNewRight.vLow = trCurrent.vLow;
//				trNewRight.dL = trCurrent.dL;
//				trNewRight.dR = trCurrent.dR;
				// redirect parent X-Node to extended sink
				qs_trCurrent.left = new PNLTRI.QsNode( trNewLeft );			// trCurrent -> left SINK-Node
				qs_trCurrent.right = trPrevRight.sink;						// deforms tree by multiple links to trPrevRight.sink
			} else if ( trPrevLeft && ( trPrevLeft.lseg == trCurrent.lseg ) ) {
				// console.log( "add_segment: extending left predecessor down!", trPrevLeft );
				trNewRight = trCurrent;
				trNewLeft = trPrevLeft;
				trNewLeft.vLow = trCurrent.vLow;
//				trNewLeft.dL = trCurrent.dL;
//				trNewLeft.dR = trCurrent.dR;
				// redirect parent X-Node to extended sink
				qs_trCurrent.left = trPrevLeft.sink;						// deforms tree by multiple links to trPrevLeft.sink
				qs_trCurrent.right = new PNLTRI.QsNode( trNewRight );		// trCurrent -> right SINK-Node
			} else {
				trNewLeft = trCurrent;
				trNewRight = this.cloneTrap(trCurrent);
				qs_trCurrent.left = new PNLTRI.QsNode( trNewLeft );			// trCurrent -> left SINK-Node
				qs_trCurrent.right = new PNLTRI.QsNode( trNewRight );		// new clone -> right SINK-Node
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
	// Checks segment orientation and marks those polygon chains for reversal
	//	where the polygon inside lies to their right (contour in CW, holes in CCW)
	assignDepths: function ( inPolyData ) {
		var thisDepth = [ this.trapArray[0] ];
		var nextDepth = [];

		var thisTrap, borderSeg, curDepth = 0;
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
				if ( ( borderSeg = thisTrap.lseg ) && ( borderSeg.trLeft.depth == -1 ) )
					nextDepth.push( borderSeg.trLeft );
				if ( borderSeg = thisTrap.rseg ) {
					if ( borderSeg.trRight.depth == -1 )
						nextDepth.push( borderSeg.trRight );
					if ( borderSeg.upward != expectedRsegUpward )
						inPolyData.set_PolyLeft_wrong( borderSeg.chainId );
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
			if ( ( ( thisTrap.depth % 2 ) == 1 ) && ( !thisTrap.monoDone ) &&
				 ( ( !thisTrap.uL && !thisTrap.uR ) || ( !thisTrap.dL && !thisTrap.dR ) )
			 	) {
				if ( thisTrap.lseg )		 return	thisTrap;		// condition for robustness
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


	// Returns one triangular trapezoid which lies inside the polygon.
	// All other inside trapezoids can be reached from this one using the neighbor links.

	find_first_inside: function () {
		return	 this.queryStructure.find_first_inside();
	},

	create_visibility_map: function () {
		var TR_UL = 0, TR_UM = 1, TR_ULR = 2, TR_UR = 3;
		var TR_DR = 4, TR_DM = 5, TR_DLR = 6, TR_DL = 7;
		
		var myQs = this.queryStructure;
		var myVertices = this.polyData.vertices;		// TODO: replace
		
		var myExternalNeighbors = new Array(myVertices.length);
		var myVisibleNeighbors = [];
		for ( var i=0; i<myVertices.length; i++ ) {
			myVisibleNeighbors.push( {		// CCW
					tr: new Array(TR_DL+1),
					vList: [],
				} );
		}
		for (var i=0,j=myQs.trapArray.length; i<j; i++) {
			var thisTrap = myQs.trapArray[i];
			var highPos = thisTrap.uL ?
						( thisTrap.uR ? TR_DM : TR_DL ) :
						( thisTrap.uR ? TR_DR : TR_DLR );
			var lowPos = thisTrap.dL ?
						( thisTrap.dR ? TR_UM : TR_UL ) :
						( thisTrap.dR ? TR_UR : TR_ULR );

			if ( ( thisTrap.depth % 2 ) == 1 ) {		// inside ?
				if ( ( highPos == TR_DM ) || ( lowPos == TR_UM ) ||
					 ( ( highPos == TR_DL ) && ( lowPos == TR_UR ) ) ||
					 ( ( highPos == TR_DR ) && ( lowPos == TR_UL ) ) ) {
					myVisibleNeighbors[thisTrap.vHigh.id].tr[highPos] = thisTrap.vLow;
					myVisibleNeighbors[thisTrap.vLow.id].tr[lowPos] = thisTrap.vHigh;
				}
			} else {
				if ( thisTrap.vHigh.id != null )	myExternalNeighbors[thisTrap.vHigh.id] = highPos;
				if ( thisTrap.vLow.id != null )		myExternalNeighbors[thisTrap.vLow.id] = lowPos;
			}
		}
		for ( i=0; i<myVisibleNeighbors.length; i++ ) {
			var otherVertIds = [];
			var thisVert = myVisibleNeighbors[i];
			
			var firstElem = myExternalNeighbors[i];
			if ( firstElem == null ) {		// eg. skipped vertices (zero length, co-linear
				// console.log( "ERR create_visibility_map: no external trapezoids for vertex "+i);
				continue;
			}
			var	j = firstElem;
			do {
				if ( j++ > TR_DL )			j = TR_UL;
				if ( thisVert.tr[j] )		thisVert.vList.push( thisVert.tr[j] );
			} while ( j != firstElem )
		}

		var result = [];
		for ( i=0; i<myVisibleNeighbors.length; i++ ) {
			result[i] = myVisibleNeighbors[i].vList.map( function (vertex) { return vertex.id } );
		}
		return	result;
	},

	/*
	 * Mathematics helper methods
	 */

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
	 * main method
	 */

	// Creates the trapezoidation of the polygon
	//  and assigns a depth to all trapezoids (odd: inside, even: outside).

	trapezoide_polygon: function () {							// <<<< public
		var randSegListArray = this.polyData.getSegments().concat();
//		console.log( "Polygon Chains: ", dumpSegmentList( randSegListArray ) );
		PNLTRI.Math.array_shuffle( randSegListArray );
		this.optimise_randomlist( randSegListArray );
//		console.log( "Random Segment Sequence: ", dumpRandomSequence( randSegListArray ) );

		var nbSegs = randSegListArray.length;
		var myQs = this.queryStructure;

		var current = 0, logstar = nbSegs;
		while ( current < nbSegs ) {
			// The CENTRAL mechanism for the near-linear performance:
			//	stratefies the loop through all segments into log* parts
			//	and computes new root-Nodes for the remaining segments in each
			//	partition.
			logstar = Math.log(logstar)/Math.LN2;		// == log2(logstar)
			var partEnd = ( logstar > 1 ) ? Math.floor( nbSegs / logstar ) : nbSegs;

			// Core: adds next partition of the segments
			for (; current < partEnd; current++ ) { myQs.add_segment( randSegListArray[current] ) }
//			console.log( nbSegs, current );

			// To speed up the segment insertion into the trapezoidation
			//	the endponts of those segments not yet inserted
			//	are repeatedly pre-located,
			// thus their final location-query can start at the top of the
			//	appropriate sub-tree instead of the root of the whole
			//	query structure.
			//
			for (var i = current; i < nbSegs; i++) { this.queryStructure.segNodes( randSegListArray[i] ) }
		}

		myQs.assignDepths( this.polyData );
		// cleanup to support garbage collection
		for (i = 0; i < nbSegs; i++) { randSegListArray[i].trLeft = randSegListArray[i].trRight = null; }
	},

};

