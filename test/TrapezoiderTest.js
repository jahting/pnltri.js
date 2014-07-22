/**
 * @author jahting / http://www.ameco.tv/
 */


function test_Trapezoid() {

	function test_new_Trapezoid() {
		//
		//	empty trapezoid
		var myTrap = new PNLTRI.Trapezoid();
		equal( myTrap.vHigh.x, Number.POSITIVE_INFINITY, "new_Trapezoid: high.x = POSITIVE_INFINITY" );
		equal( myTrap.vHigh.y, Number.POSITIVE_INFINITY, "new_Trapezoid: high.y = POSITIVE_INFINITY" );
		equal( myTrap.vLow.x, Number.NEGATIVE_INFINITY, "new_Trapezoid: low.x = NEGATIVE_INFINITY" );
		equal( myTrap.vLow.y, Number.NEGATIVE_INFINITY, "new_Trapezoid: low.y = NEGATIVE_INFINITY" );
		equal( myTrap.lseg, null, "new_Trapezoid: no left segment" );
		equal( myTrap.rseg, null, "new_Trapezoid: no right segment" );
		equal( myTrap.uL, null, "new_Trapezoid: no upper left neighbor" );
		equal( myTrap.uR, null, "new_Trapezoid: no upper right neighbor" );
		equal( myTrap.dL, null, "new_Trapezoid: no lower left neighbor" );
		equal( myTrap.dR, null, "new_Trapezoid: no lower right neighbor" );
		equal( myTrap.sink, null, "new_Trapezoid: no QueryStructure node attached" );
		equal( myTrap.usave, null, "new_Trapezoid: usave == null" );
		equal( myTrap.uleft, null, "new_Trapezoid: uleft == null" );
		equal( myTrap.depth, -1, "new_Trapezoid: depth not yet assigned" );
		equal( myTrap.monoDone, false, "new_Trapezoid: not yet monotonized" );
		//
		//	filled trapezoid
		var highPt = { x: 1, y: 4 };
		var lowPt = { x: 3, y: 1 };
		var leftSeg = { vFrom: highPt, vTo: { x: 2, y: 0 }, upward: false };
		var rightSeg = { vFrom: lowPt, vTo: { x: 2, y: 5 }, upward: true };
		//
		myTrap = new PNLTRI.Trapezoid( highPt, lowPt, leftSeg, rightSeg );
		equal( myTrap.vHigh, highPt, "new_Trapezoid: high point" );
		equal( myTrap.vLow, lowPt, "new_Trapezoid: low point" );
		equal( myTrap.lseg, leftSeg, "new_Trapezoid: left segment" );
		equal( myTrap.rseg, rightSeg, "new_Trapezoid: right segment" );
		equal( myTrap.uL, null, "new_Trapezoid: no upper left neighbor" );
		equal( myTrap.uR, null, "new_Trapezoid: no upper right neighbor" );
		equal( myTrap.dL, null, "new_Trapezoid: no lower left neighbor" );
		equal( myTrap.dR, null, "new_Trapezoid: no lower right neighbor" );
		equal( myTrap.sink, null, "new_Trapezoid: no QueryStructure node attached" );
		equal( myTrap.usave, null, "new_Trapezoid: usave == null" );
		equal( myTrap.uleft, null, "new_Trapezoid: uleft == null" );
		equal( myTrap.depth, -1, "new_Trapezoid: depth not yet assigned" );
		equal( myTrap.monoDone, false, "new_Trapezoid: not yet monotonized" );
	}

	function test_clone() {
		//
		//	empty trapezoid
		var myTrap = new PNLTRI.Trapezoid().clone();
		equal( myTrap.vHigh.x, Number.POSITIVE_INFINITY, "clone_Trapezoid: high.x = POSITIVE_INFINITY" );
		equal( myTrap.vHigh.y, Number.POSITIVE_INFINITY, "clone_Trapezoid: high.y = POSITIVE_INFINITY" );
		equal( myTrap.vLow.x, Number.NEGATIVE_INFINITY, "clone_Trapezoid: low.x = NEGATIVE_INFINITY" );
		equal( myTrap.vLow.y, Number.NEGATIVE_INFINITY, "clone_Trapezoid: low.y = NEGATIVE_INFINITY" );
		equal( myTrap.lseg, null, "clone_Trapezoid: no left segment" );
		equal( myTrap.rseg, null, "clone_Trapezoid: no right segment" );
		equal( myTrap.uL, null, "clone_Trapezoid: no upper left neighbor" );
		equal( myTrap.uR, null, "clone_Trapezoid: no upper right neighbor" );
		equal( myTrap.dL, null, "clone_Trapezoid: no lower left neighbor" );
		equal( myTrap.dR, null, "clone_Trapezoid: no lower right neighbor" );
		equal( myTrap.sink, null, "clone_Trapezoid: no QueryStructure node attached" );
		equal( myTrap.usave, null, "clone_Trapezoid: usave == null" );
		equal( myTrap.uleft, null, "clone_Trapezoid: uleft == null" );
		equal( myTrap.depth, -1, "clone_Trapezoid: depth not yet assigned" );
		equal( myTrap.monoDone, false, "clone_Trapezoid: not yet monotonized" );
		//
		//	filled trapezoid
		var highPt = { x: 1, y: 4 };
		var lowPt = { x: 3, y: 1 };
		var leftSeg = { vFrom: highPt, vTo: { x: 2, y: 0 }, upward: false };
		var rightSeg = { vFrom: lowPt, vTo: { x: 2, y: 5 }, upward: true };
		var upperLeft = new PNLTRI.Trapezoid( highPt );
		var upperRight = new PNLTRI.Trapezoid( null, lowPt );
		var lowerLeft = new PNLTRI.Trapezoid( null, null, leftSeg );
		var lowerRight = new PNLTRI.Trapezoid( null, null, null, rightSeg );
		var dummySink = { trap: myTrap };
		//
		myTrap = new PNLTRI.Trapezoid( highPt, lowPt, leftSeg, rightSeg );
		myTrap.uL = upperLeft;
		myTrap.uR = upperRight;
		myTrap.dL = lowerLeft;
		myTrap.dR = lowerRight;
		myTrap.sink = dummySink;
		//
		var myTrap2 = myTrap.clone();
		equal( myTrap2.vHigh, highPt, "clone_Trapezoid: high point" );
		equal( myTrap2.vLow, lowPt, "clone_Trapezoid: low point" );
		equal( myTrap2.lseg, leftSeg, "clone_Trapezoid: left segment" );
		equal( myTrap2.rseg, rightSeg, "clone_Trapezoid: right segment" );
		equal( myTrap2.uL, upperLeft, "clone_Trapezoid: upper left neighbor" );
		equal( myTrap2.uR, upperRight, "clone_Trapezoid: upper right neighbor" );
		equal( myTrap2.dL, lowerLeft, "clone_Trapezoid: lower left neighbor" );
		equal( myTrap2.dR, lowerRight, "clone_Trapezoid: lower right neighbor" );
		equal( myTrap2.sink, dummySink, "clone_Trapezoid: dummy QueryStructure node attached" );
		equal( myTrap2.usave, null, "clone_Trapezoid: usave == null" );
		equal( myTrap2.uleft, null, "clone_Trapezoid: uleft == null" );
		equal( myTrap2.depth, -1, "clone_Trapezoid: depth not yet assigned" );
		equal( myTrap2.monoDone, false, "clone_Trapezoid: not yet monotonized" );
	}

	function test_splitOffLower() {
		//
		//	empty trapezoid
		var myTrap = new PNLTRI.Trapezoid();
		var splitPt = { x: 2, y: 3 };
		var myLower = myTrap.splitOffLower( splitPt );
		equal( myTrap.vHigh.x, Number.POSITIVE_INFINITY, "splitOffLower: high.x = POSITIVE_INFINITY" );
		equal( myTrap.vHigh.y, Number.POSITIVE_INFINITY, "splitOffLower: high.y = POSITIVE_INFINITY" );
		equal( myTrap.vLow, splitPt, "splitOffLower: low = splitPt" );
		equal( myTrap.lseg, null, "splitOffLower: no left segment" );
		equal( myTrap.rseg, null, "splitOffLower: no right segment" );
		equal( myTrap.uL, null, "splitOffLower: no upper left neighbor" );
		equal( myTrap.uR, null, "splitOffLower: no upper right neighbor" );
		equal( myTrap.dL, myLower, "splitOffLower: new lower left neighbor" );
		equal( myTrap.dR, null, "splitOffLower: no lower right neighbor" );
		equal( myTrap.sink, null, "splitOffLower: no QueryStructure node attached" );
		equal( myTrap.usave, null, "splitOffLower: usave == null" );
		equal( myTrap.uleft, null, "splitOffLower: uleft == null" );
		equal( myTrap.depth, -1, "splitOffLower: depth not yet assigned" );
		equal( myTrap.monoDone, false, "splitOffLower: not yet monotonized" );
		//
		equal( myLower.vHigh, splitPt, "splitOffLower: high = splitPt" );
		equal( myLower.vLow.x, Number.NEGATIVE_INFINITY, "splitOffLower: low.x = NEGATIVE_INFINITY" );
		equal( myLower.vLow.y, Number.NEGATIVE_INFINITY, "splitOffLower: low.y = NEGATIVE_INFINITY" );
		equal( myLower.lseg, null, "splitOffLower: no left segment" );
		equal( myLower.rseg, null, "splitOffLower: no right segment" );
		equal( myLower.uL, myTrap, "splitOffLower: new upper left neighbor" );
		equal( myLower.uR, null, "splitOffLower: no upper right neighbor" );
		equal( myLower.dL, null, "splitOffLower: no lower left neighbor" );
		equal( myLower.dR, null, "splitOffLower: no lower right neighbor" );
		equal( myLower.sink, null, "splitOffLower: no QueryStructure node attached" );
		equal( myLower.usave, null, "splitOffLower: usave == null" );
		equal( myLower.uleft, null, "splitOffLower: uleft == null" );
		equal( myLower.depth, -1, "splitOffLower: depth not yet assigned" );
		equal( myLower.monoDone, false, "splitOffLower: not yet monotonized" );
		//
		//	filled trapezoid
		var highPt = { x: 1, y: 4 };
		var lowPt = { x: 3, y: 1 };
		var leftSeg = { vFrom: highPt, vTo: { x: 2, y: 0 }, upward: false };
		var rightSeg = { vFrom: lowPt, vTo: { x: 2, y: 5 }, upward: true };
		var upperLeft = new PNLTRI.Trapezoid( highPt );
		var upperRight = new PNLTRI.Trapezoid( null, lowPt );
		var lowerLeft = new PNLTRI.Trapezoid( null, null, leftSeg );
		var lowerLeftUR = new PNLTRI.Trapezoid( null, null, rightSeg );
		var lowerRight = new PNLTRI.Trapezoid( null, null, null, rightSeg );
		var lowerRightUL = new PNLTRI.Trapezoid( null, null, null, leftSeg );
		var dummySink = { trap: myTrap };
		//
		myTrap = new PNLTRI.Trapezoid( highPt, lowPt, leftSeg, rightSeg );
		myTrap.uL = upperLeft; upperLeft.dL = myTrap;
		myTrap.uR = upperRight; upperRight.dR = myTrap;
		myTrap.dL = lowerLeft; lowerLeft.uL = myTrap; lowerLeft.uR = lowerLeftUR;
		myTrap.dR = lowerRight; lowerRight.uR = myTrap; lowerRight.uL = lowerRightUL;
		myTrap.sink = dummySink;
		//
		myLower = myTrap.splitOffLower( splitPt );
		equal( myTrap.vHigh, highPt, "splitOffLower: high point" );
		equal( myTrap.vLow, splitPt, "splitOffLower: low = split point" );
		equal( myTrap.lseg, leftSeg, "splitOffLower: left segment" );
		equal( myTrap.rseg, rightSeg, "splitOffLower: right segment" );
		equal( myTrap.uL, upperLeft, "splitOffLower: upper left neighbor unchanged" );
		equal( myTrap.uR, upperRight, "splitOffLower: upper right neighbor unchanged" );
		equal( myTrap.dL, myLower, "splitOffLower: new lower left neighbor" );
		equal( myTrap.dR, null, "splitOffLower: no lower right neighbor" );
		equal( myTrap.sink, dummySink, "splitOffLower: dummy QueryStructure node attached" );
		equal( myTrap.usave, null, "splitOffLower: usave == null" );
		equal( myTrap.uleft, null, "splitOffLower: uleft == null" );
		equal( myTrap.depth, -1, "splitOffLower: depth not yet assigned" );
		equal( myTrap.monoDone, false, "splitOffLower: not yet monotonized" );
		//
		equal( myLower.vHigh, splitPt, "splitOffLower: high = split point" );
		equal( myLower.vLow, lowPt, "splitOffLower: low point" );
		equal( myLower.lseg, leftSeg, "splitOffLower: left segment" );
		equal( myLower.rseg, rightSeg, "splitOffLower: right segment" );
		equal( myLower.uL, myTrap, "splitOffLower: new upper left neighbor" );
		equal( myLower.uR, null, "splitOffLower: no upper right neighbor" );
		equal( myLower.dL, lowerLeft, "splitOffLower: lower left neighbor unchanged" );
		equal( myLower.dR, lowerRight, "splitOffLower: lower right neighbor unchanged" );
		equal( myLower.sink, dummySink, "splitOffLower: dummy QueryStructure node attached" );
		equal( myLower.usave, null, "splitOffLower: usave == null" );
		equal( myLower.uleft, null, "splitOffLower: uleft == null" );
		equal( myLower.depth, -1, "splitOffLower: depth not yet assigned" );
		equal( myLower.monoDone, false, "splitOffLower: not yet monotonized" );
		//
		equal( upperLeft.dL, myTrap, "splitOffLower: upperLeft.dL unchanged" );
		equal( upperRight.dR, myTrap, "splitOffLower: upperRight.dR unchanged" );
		equal( lowerLeft.uL, myLower, "splitOffLower: lowerLeft.uL -> new lower" );
		equal( lowerLeft.uR, lowerLeftUR, "splitOffLower: lowerLeft.uR unchanged" );
		equal( lowerRight.uL, lowerRightUL, "splitOffLower: lowerRight.uL unchanged" );
		equal( lowerRight.uR, myLower, "splitOffLower: lowerRight.uR -> new lower" );
	}


	test( "Trapezoid", function() {
		test_new_Trapezoid();
		test_clone();
		test_splitOffLower();
	});
}


/*==============================================================================
 *
 *============================================================================*/


/*	Base class extensions - for testing only */

PNLTRI.QueryStructure.prototype.setup_segments = function ( inSeg ) {
	var myQsRoot = this.getRoot();
	var currSeg = inSeg;
	do {
		currSeg.rootFrom = currSeg.rootTo = myQsRoot;
		currSeg.is_inserted = false;
		currSeg = currSeg.snext;
	} while ( currSeg != inSeg );

	this.add_segment( inSeg );
	return	this.root;
};
PNLTRI.QueryStructure.prototype.nbTrapezoids = function () {
	return	this.trapArray.length;
};
PNLTRI.QueryStructure.prototype.getTrapByIdx = function ( inIdx ) {
	return	this.trapArray[inIdx];
};
// Check depth of the trapezoids
PNLTRI.QueryStructure.prototype.minDepth = function () {
	var myMinDepth = 1000;
	for (var i=0,j=this.trapArray.length; i<j; i++) {
		if ( this.trapArray[i].depth < myMinDepth ) {
			myMinDepth = this.trapArray[i].depth;
		}
	}
	return	myMinDepth;
};
PNLTRI.QueryStructure.prototype.maxDepth = function () {
	var myMaxDepth = -2;
	for (var i=0,j=this.trapArray.length; i<j; i++) {
		if ( this.trapArray[i].depth > myMaxDepth ) {
			myMaxDepth = this.trapArray[i].depth;
		}
	}
	return	myMaxDepth;
};
// check all trapezoids for link consistency
PNLTRI.QueryStructure.prototype.check_trapezoids_link_consistency = function () {

	var bugList = [];

	var currTrap;
	for (var i=0, j=this.trapArray.length; i<j; i++) {
		currTrap = this.trapArray[i];
		if ( currTrap.uL ) {
			if ( currTrap.uL == currTrap )		{ bugList.push( "ID#"+currTrap.trapID+".uL: self-link" ); };
			if ( currTrap.uL == currTrap.uR )	{ bugList.push( "ID#"+currTrap.trapID+".uL == uR" ); };
			if ( currTrap.uL == currTrap.dL )	{ bugList.push( "ID#"+currTrap.trapID+".uL == dL" ); };
			if ( currTrap.uL == currTrap.dR )	{ bugList.push( "ID#"+currTrap.trapID+".uL == dR" ); };
			if ( ( currTrap.uL.dL != currTrap ) &&
				 ( currTrap.uL.dR != currTrap ) )	{
				bugList.push( "ID#"+currTrap.trapID+".uL: reverse dN-Link missing in ID#" + currTrap.uL.trapID );
			}
		}
		if ( currTrap.uR ) {
			if ( currTrap.uR == currTrap )		{ bugList.push( "ID#"+currTrap.trapID+".uR: self-link" ); };
			if ( currTrap.uR == currTrap.dL )	{ bugList.push( "ID#"+currTrap.trapID+".uR == dL" ); };
			if ( currTrap.uR == currTrap.dR )	{ bugList.push( "ID#"+currTrap.trapID+".uR == dR" ); };
			if ( ( currTrap.uR.dL != currTrap ) &&
				 ( currTrap.uR.dR != currTrap ) )	{
				bugList.push( "ID#"+currTrap.trapID+".uR: reverse dN-Link missing in ID#" + currTrap.uR.trapID );
			}
		}
		if ( currTrap.dL ) {
			if ( currTrap.dL == currTrap )		{ bugList.push( "ID#"+currTrap.trapID+".dL: self-link" ); };
			if ( currTrap.dL == currTrap.dR )	{ bugList.push( "ID#"+currTrap.trapID+".dL == dR" ); };
			if ( ( currTrap.dL.uL != currTrap ) &&
				 ( currTrap.dL.uR != currTrap ) )	{
				bugList.push( "ID#"+currTrap.trapID+".dL: reverse uN-Link missing in ID#" + currTrap.dL.trapID );
			}
		}
		if ( currTrap.dR ) {
			if ( currTrap.dR == currTrap )		{ bugList.push( "ID#"+currTrap.trapID+".dR: self-link" ); };
			if ( ( currTrap.dR.uL != currTrap ) &&
				 ( currTrap.dR.uR != currTrap ) )	{
				bugList.push( "ID#"+currTrap.trapID+".dR: reverse uN-Link missing in ID#" + currTrap.dR.trapID );
			}
		}
	}

	return	( bugList.length == 0 ) ? null : bugList;
};
PNLTRI.QueryStructure.prototype.add_segment_consistently = function ( inSegment, inTestID ) {
	// integrated Unit-Test	!!
	this.add_segment( inSegment );
	var buglist, bugStr = ( ( inSegment.is_inserted ) ? '' : 'NOT inserted; ' );
	if ( buglist = this.check_trapezoids_link_consistency() )	bugStr += buglist.join(", ");
	if ( bugStr.length > 0 ) {
		ok( false, "add_segment_consistently #"+inTestID+": " + bugStr );
	}
}
// check if trapezoid has specific neighbors
PNLTRI.QueryStructure.prototype.check_trapezoid_neighbors = function ( inTrapId, inChkUL, inChkUR, inChkDL, inChkDR, inTestName ) {
	var trapezoid = this.getTrapByIdx(inTrapId);
	if ( trapezoid ) {
		var uL_ID = trapezoid.uL ? trapezoid.uL.trapID : null;
		var uR_ID = trapezoid.uR ? trapezoid.uR.trapID : null;
		var dL_ID = trapezoid.dL ? trapezoid.dL.trapID : null;
		var dR_ID = trapezoid.dR ? trapezoid.dR.trapID : null;
		//
		equal( uL_ID, inChkUL, inTestName + ": uL == " + inChkUL );
		equal( uR_ID, inChkUR, inTestName + ": uR == " + inChkUR );
		equal( dL_ID, inChkDL, inTestName + ": dL == " + inChkDL );
		equal( dR_ID, inChkDR, inTestName + ": dR == " + inChkDR );
	} else {
		ok( trapezoid, inTestName + ": trapezoid exists" );
	}
}

// #############################################################################

function test_QueryStructure() {

	/* TODO: Tests for PNLTRI.QueryStructure.cloneTrap, trLeft, trRight */

	function test_is_left_of() {
		var	myQs = new PNLTRI.QueryStructure();
		// going UPwards
		var	segment = { vFrom: { x: 10, y: 10 }, vTo: { x: 17, y: 13 }, upward: true };
		//	y equal
		ok( myQs.is_left_of(segment, { x: 0, y: 10 } ) > 0,  "is_left_of:  0, 10 (yes)" );
		ok( myQs.is_left_of(segment, { x: 0, y: 13 } ) > 0,  "is_left_of:  0, 13 (yes)" );
		ok( myQs.is_left_of(segment, { x: 20, y: 10 } ) < 0, "is_left_of: 20, 10 (no)" );
		ok( myQs.is_left_of(segment, { x: 20, y: 13 } ) < 0, "is_left_of: 20, 13 (no)" );
		//
		ok( myQs.is_left_of(segment, { x: 0, y: 10 }, true ) > 0,  "is_left_of:  0, 10 (yes, between Y)" );
		ok( myQs.is_left_of(segment, { x: 0, y: 13 }, true ) > 0,  "is_left_of:  0, 13 (yes, between Y)" );
		ok( myQs.is_left_of(segment, { x: 20, y: 10 }, true ) < 0, "is_left_of: 20, 10 (no, between Y)" );
		ok( myQs.is_left_of(segment, { x: 20, y: 13 }, true ) < 0, "is_left_of: 20, 13 (no, between Y)" );
		//	on the line
		ok( myQs.is_left_of(segment, { x: 13.5, y: 11.5 } ) == 0,  "is_left_of:  13.5, 11.5 (co-linear)" );
		ok( myQs.is_left_of(segment, { x: 13.5, y: 11.5 }, true ) == 0,  "is_left_of:  13.5, 11.5 (co-linear, between Y)" );
		ok( myQs.is_left_of(segment, { x:  3, y:  7 } ) == 0, "is_left_of:  3,  7 (co-linear)" );
		ok( myQs.is_left_of(segment, { x: 24, y: 16 } ) == 0, "is_left_of: 24, 16 (co-linear)" );
		//	general case
		//		< x0
		ok( myQs.is_left_of(segment, { x: 0, y:  0 } ) < 0, "is_left_of: 0,  0 (no)" );
		ok( myQs.is_left_of(segment, { x: 4, y:  8 } ) > 0, "is_left_of: 4,  8 (yes)" );
		ok( myQs.is_left_of(segment, { x: 7, y: 11 } ) > 0, "is_left_of: 7, 11 (yes)" );
		ok( myQs.is_left_of(segment, { x: 7, y: 11 }, true ) > 0, "is_left_of: 7, 11 (yes, between Y)" );
		ok( myQs.is_left_of(segment, { x: 6, y: 15 } ) > 0, "is_left_of: 6, 15 (yes)" );
		//		x0 <  < x1
		ok( myQs.is_left_of(segment, { x: 12, y:  8 } ) < 0, "is_left_of: 12,  8 (no)" );
		ok( myQs.is_left_of(segment, { x: 15, y: 12 } ) < 0, "is_left_of: 15, 12 (no)" );
		ok( myQs.is_left_of(segment, { x: 15, y: 12 }, true ) < 0, "is_left_of: 15, 12 (no, between Y)" );
		ok( myQs.is_left_of(segment, { x: 12, y: 11 } ) > 0, "is_left_of: 12, 11 (yes)" );
		ok( myQs.is_left_of(segment, { x: 12, y: 11 }, true ) > 0, "is_left_of: 12, 11 (yes, between Y)" );
		ok( myQs.is_left_of(segment, { x: 14, y: 15 } ) > 0, "is_left_of: 14, 15 (yes)" );
		//		> x1
		ok( myQs.is_left_of(segment, { x: 25, y:  8 } ) < 0, "is_left_of: 12,  8 (no)" );
		ok( myQs.is_left_of(segment, { x: 23, y: 12 } ) < 0, "is_left_of: 15, 12 (no)" );
		ok( myQs.is_left_of(segment, { x: 23, y: 12 }, true ) < 0, "is_left_of: 15, 12 (no, between Y)" );
		ok( myQs.is_left_of(segment, { x: 20, y: 14 } ) < 0, "is_left_of: 12, 11 (no)" );
		ok( myQs.is_left_of(segment, { x: 21, y: 15 } ) > 0, "is_left_of: 21, 15 (yes)" );
		//
		// going DOWNwards
		var	segment = { vFrom: { x: 17, y: 13 }, vTo: { x: 10, y: 10 }, upward: false };
		//	y equal
		ok( myQs.is_left_of(segment, { x: 0, y: 10 } ) > 0,  "is_left_of:  0, 10 (yes)" );
		ok( myQs.is_left_of(segment, { x: 0, y: 13 } ) > 0,  "is_left_of:  0, 13 (yes)" );
		ok( myQs.is_left_of(segment, { x: 20, y: 10 } ) < 0, "is_left_of: 20, 10 (no)" );
		ok( myQs.is_left_of(segment, { x: 20, y: 13 } ) < 0, "is_left_of: 20, 13 (no)" );
		//
		ok( myQs.is_left_of(segment, { x: 0, y: 10 }, true ) > 0,  "is_left_of:  0, 10 (yes, between Y)" );
		ok( myQs.is_left_of(segment, { x: 0, y: 13 }, true ) > 0,  "is_left_of:  0, 13 (yes, between Y)" );
		ok( myQs.is_left_of(segment, { x: 20, y: 10 }, true ) < 0, "is_left_of: 20, 10 (no, between Y)" );
		ok( myQs.is_left_of(segment, { x: 20, y: 13 }, true ) < 0, "is_left_of: 20, 13 (no, between Y)" );
		//	on the line
		ok( myQs.is_left_of(segment, { x: 13.5, y: 11.5 } ) == 0,  "is_left_of:  13.5, 11.5 (co-linear)" );
		ok( myQs.is_left_of(segment, { x: 13.5, y: 11.5 }, true ) == 0,  "is_left_of:  13.5, 11.5 (co-linear, between Y)" );
		ok( myQs.is_left_of(segment, { x:  3, y:  7 } ) == 0, "is_left_of:  3,  7 (co-linear)" );
		ok( myQs.is_left_of(segment, { x: 24, y: 16 } ) == 0, "is_left_of: 24, 16 (co-linear)" );
		//	general case
		//		< x0
		ok( myQs.is_left_of(segment, { x: 0, y:  0 } ) < 0, "is_left_of: 0,  0 (no)" );
		ok( myQs.is_left_of(segment, { x: 4, y:  8 } ) > 0, "is_left_of: 4,  8 (yes)" );
		ok( myQs.is_left_of(segment, { x: 7, y: 11 } ) > 0, "is_left_of: 7, 11 (yes)" );
		ok( myQs.is_left_of(segment, { x: 7, y: 11 }, true ) > 0, "is_left_of: 7, 11 (yes, between Y)" );
		ok( myQs.is_left_of(segment, { x: 6, y: 15 } ) > 0, "is_left_of: 6, 15 (yes)" );
		//		x0 <  < x1
		ok( myQs.is_left_of(segment, { x: 12, y:  8 } ) < 0, "is_left_of: 12,  8 (no)" );
		ok( myQs.is_left_of(segment, { x: 15, y: 12 } ) < 0, "is_left_of: 15, 12 (no)" );
		ok( myQs.is_left_of(segment, { x: 15, y: 12 }, true ) < 0, "is_left_of: 15, 12 (no, between Y)" );
		ok( myQs.is_left_of(segment, { x: 12, y: 11 } ) > 0, "is_left_of: 12, 11 (yes)" );
		ok( myQs.is_left_of(segment, { x: 12, y: 11 }, true ) > 0, "is_left_of: 12, 11 (yes, between Y)" );
		ok( myQs.is_left_of(segment, { x: 14, y: 15 } ) > 0, "is_left_of: 14, 15 (yes)" );
		//		> x1
		ok( myQs.is_left_of(segment, { x: 25, y:  8 } ) < 0, "is_left_of: 12,  8 (no)" );
		ok( myQs.is_left_of(segment, { x: 23, y: 12 } ) < 0, "is_left_of: 15, 12 (no)" );
		ok( myQs.is_left_of(segment, { x: 23, y: 12 }, true ) < 0, "is_left_of: 15, 12 (no, between Y)" );
		ok( myQs.is_left_of(segment, { x: 20, y: 14 } ) < 0, "is_left_of: 12, 11 (no)" );
		ok( myQs.is_left_of(segment, { x: 21, y: 15 } ) > 0, "is_left_of: 21, 15 (yes)" );
	}

	/*                0
	 *   ------------*----------------------
	 *  		    /
	 *  	1	   /        3
	 *  		  /
	 *   --------*--------------------------
	 *                2
	 */
	function test_init_query_structure_up() {
		// going UPwards
		var	base_segment = { vFrom:	{ x: 1, y: 1 }, vTo: { x: 3, y: 4 }, upward: true };
		// segment chain
		var thirdVertex = { x: 2, y: 4 };
		base_segment.snext = { vFrom: base_segment.vTo, vTo: thirdVertex, upward: false };
		base_segment.sprev = { vFrom: thirdVertex, vTo: base_segment.vFrom, upward: false };
		base_segment.snext.sprev = base_segment.sprev.snext = base_segment;
		base_segment.snext.snext = base_segment.sprev;
		base_segment.sprev.sprev = base_segment.snext;
		//
		var myQs = new PNLTRI.QueryStructure();
		var myQsRoot = myQs.setup_segments( base_segment );
//		showDataStructure( myQsRoot );
		ok( base_segment.is_inserted, "init_query_structure_up: Segment inserted" );
		// segMax(vTo): root-Node
		equal( myQsRoot.yval, base_segment.vTo, "init_query_structure_up: root: yval = vTo" );
		ok( !myQsRoot.trap, "init_query_structure_up: root: no trapezoid" );
		ok( !myQsRoot.seg, "init_query_structure_up: root: no segment" );
		// top(tr0): above root
		var tr0, qsNode2 = myQsRoot.right;
		ok( ( tr0 = qsNode2.trap ), "init_query_structure_up: root.above: has trapezoid" );
		ok( !qsNode2.yval, "init_query_structure_up: root.above: no horizontal line" );
		ok( !qsNode2.seg, "init_query_structure_up: root.above: no segment" );
			// tr0
		equal( tr0.sink, qsNode2, "init_query_structure_up: root.above->tr.sink: this qsNode" );
		equal( tr0.vHigh.y, Number.POSITIVE_INFINITY, "init_query_structure_up: root.above->tr.vHigh.y: +INFINITY" );
		equal( tr0.vLow, base_segment.vTo, "init_query_structure_up: root.above->tr.vLow: vTo" );
		// segMin(vFrom): below root
		var qsNode3 = myQsRoot.left;
		equal( qsNode3.yval, base_segment.vFrom, "init_query_structure_up: root.below: yval = vFrom" );
		ok( !qsNode3.trap, "init_query_structure_up: root.below: no trapezoid" );
		ok( !qsNode3.seg, "init_query_structure_up: root.below: no segment" );
		//
		// bottom(tr2): below segMin(qsNode3)
		var tr2, qsNode4 = qsNode3.left;
		ok( ( tr2 = qsNode4.trap ), "init_query_structure_up: segMin.below: has trapezoid" );
		ok( !qsNode4.yval, "init_query_structure_up: segMin.below: no horizontal line" );
		ok( !qsNode4.seg, "init_query_structure_up: segMin.below: no segment" );
			// tr2
		equal( tr2.sink, qsNode4, "init_query_structure_up: segMin.below->tr.sink: this qsNode" );
		equal( tr2.vLow.y, Number.NEGATIVE_INFINITY, "init_query_structure_up: segMin.below->tr.vLow.y: -INFINITY" );
		equal( tr2.vHigh, base_segment.vFrom, "init_query_structure_up: segMin.below->tr.vHigh: vFrom" );
		//
		// Segment - below segMax, above segMin
		var qsNode5 = qsNode3.right;
		equal( qsNode5.seg, base_segment, "init_query_structure_up: segment.seg -> inSegment" );
		ok( !qsNode5.trap, "init_query_structure_up: segment: no trapezoid" );
		ok( !qsNode5.yval, "init_query_structure_up: segment: no horizontal line" );
		//
		// left(tr1): segment.left(qsNode5)
		var tr1, qsNode6 = qsNode5.left;
		ok( ( tr1 = qsNode6.trap ), "init_query_structure_up: segment.left: has trapezoid" );
		ok( !qsNode6.yval, "init_query_structure_up: segment.left: no horizontal line" );
		ok( !qsNode6.seg, "init_query_structure_up: segment.left: no segment" );
			// tr1
		equal( tr1.sink, qsNode6, "init_query_structure_up: segment.left->tr.sink: this qsNode" );
		equal( tr1.rseg, base_segment, "init_query_structure_up: segment.left->tr.rseg: inSegment" );
		equal( tr1.vHigh, base_segment.vTo, "init_query_structure_up: segment.left->tr.vHigh: vTo" );
		equal( tr1.vLow, base_segment.vFrom, "init_query_structure_up: segment.left->tr.vLow: vFrom" );
		//
		// right(tr3): segment.right(qsNode5)
		var tr3, qsNode7 = qsNode5.right;
		ok( ( tr3 = qsNode7.trap ), "init_query_structure_up: segment.right: has trapezoid" );
		ok( !qsNode7.yval, "init_query_structure_up: segment.right: no horizontal line" );
		ok( !qsNode7.seg, "init_query_structure_up: segment.right: no segment" );
			// tr3
		equal( tr3.sink, qsNode7, "init_query_structure_up: segment.right->tr.sink: this qsNode" );
		equal( tr3.lseg, base_segment, "init_query_structure_up: segment.right->tr.lseg: inSegment" );
		equal( tr3.vHigh, base_segment.vTo, "init_query_structure_up: segment.right->tr.vHigh: vTo" );
		equal( tr3.vLow, base_segment.vFrom, "init_query_structure_up: segment.right->tr.vLow: vFrom" );
		//
		//	Trapezoid-Neighborhood
		myQs.check_trapezoid_neighbors(  0, null, null, 1, 3, "init_query_structure_up: top" );
		myQs.check_trapezoid_neighbors(  1, 0, null, 2, null, "init_query_structure_up: left" );
		myQs.check_trapezoid_neighbors(  2, 1, 3, null, null, "init_query_structure_up: bottom" );
		myQs.check_trapezoid_neighbors(  3, null, 0, null, 2, "init_query_structure_up: right" );
		//
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
	}

	/*                0
	 *   --------*--------------------------
	 *  		  \
	 *  	1	   \        3
	 *  		    \
	 *   ------------*----------------------
	 *                2
	 */
	function test_init_query_structure_down() {
		// going DOWNwards
		var	base_segment = { vFrom: { x: 1, y: 4 }, vTo: { x: 3, y: 1 }, upward: false };
		// segment chain
		var thirdVertex = { x: 3, y: 3 };
		base_segment.snext = { vFrom: base_segment.vTo, vTo: thirdVertex, upward: true };
		base_segment.sprev = { vFrom: thirdVertex, vTo: base_segment.vFrom, upward: true };
		base_segment.snext.sprev = base_segment.sprev.snext = base_segment;
		base_segment.snext.snext = base_segment.sprev;
		base_segment.sprev.sprev = base_segment.snext;
		//
		var myQs = new PNLTRI.QueryStructure();
		var myQsRoot = myQs.setup_segments( base_segment );
		ok( base_segment.is_inserted, "init_query_structure_down: Segment inserted" );
		// segMax(vFrom): root-Node
		equal( myQsRoot.yval, base_segment.vFrom, "init_query_structure_down: root: yval = vFrom" );
		// top(tr0): above root
		var tr0 = myQsRoot.right.trap;
		equal( tr0.vLow, base_segment.vFrom, "init_query_structure_down: root.above->tr.vLow: vFrom" );
		// segMin(vTo): below root
		var qsNode3 = myQsRoot.left;
		equal( qsNode3.yval, base_segment.vTo, "init_query_structure_down: root.below: yval = vTo" );
		//
		// bottom(tr2): below segMin(qsNode3)
		var tr2 = qsNode3.left.trap;
		equal( tr2.vHigh, base_segment.vTo, "init_query_structure_down: segMin.below->tr.vHigh: vTo" );
		//
		// Segment - below segMax, above segMin
		var qsNode5 = qsNode3.right;
		//
		// left(tr1): segment.left(qsNode5)
		var tr1 = qsNode5.left.trap;
		equal( tr1.vHigh, base_segment.vFrom, "init_query_structure_down: segment.left->tr.vHigh: vFrom" );
		equal( tr1.vLow, base_segment.vTo, "init_query_structure_down: segment.left->tr.vLow: vTo" );
		//
		// right(tr3): segment.right(qsNode5)
		var tr3 = qsNode5.right.trap;
		equal( tr3.vHigh, base_segment.vFrom, "init_query_structure_down: segment.right->tr.vHigh: vFrom" );
		equal( tr3.vLow, base_segment.vTo, "init_query_structure_down: segment.right->tr.vLow: vTo" );
		//
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
	}

	/*                0
	 *   -------------*---------------------
	 *  		     /
	 *  	   1    /        3
	 *   ----*-----/
	 *     4	  /
	 *   --------*--------------------------
	 *  				2
	 *   ------*----------------------------
	 *              5
	 */
	function test_splitNodeAtPoint1() {
		// going UPwards
		var	base_segment = { vFrom: { x: 20, y: 20 }, vTo: { x: 30, y: 40 }, upward: true }
		// going DOWNwards - with exchanged coordinates
		var	downward_segment = { vFrom: { x: 15, y: 10 }, vTo: { x: 10, y: 25 }, upward: true }
		// segment chain
		base_segment.snext = downward_segment.sprev = { vFrom: base_segment.vTo, vTo: downward_segment.vFrom, upward: false,
														sprev: base_segment, snext: downward_segment };
		base_segment.sprev = downward_segment.snext = { vFrom: downward_segment.vTo, vTo: base_segment.vFrom, upward: false,
														sprev: downward_segment, snext: base_segment };
		//
		var myQs = new PNLTRI.QueryStructure();
		var myQsRoot = myQs.setup_segments( base_segment );
		//
		// precheck of correct Trapezoids
		var tr1 = myQs.getTrapByIdx(1), qs_tr1 = tr1.sink;
		var tr2 = myQs.getTrapByIdx(2), qs_tr2 = tr2.sink;
		myQs.segNodes( downward_segment );
		ok( ( downward_segment.rootFrom == qs_tr2 ), "splitNodeAtPoint1: Seg.vFrom -> qs_tr2" );
		ok( ( downward_segment.rootTo == qs_tr1 ), "splitNodeAtPoint1: Seg.vTo -> qs_tr1" );
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
		//
		// Main Test
		//
		//	insert higher point into QueryStructure
		var qs_tr4 = myQs.splitNodeAtPoint( qs_tr1, downward_segment.vTo, false );
		//
		equal( qs_tr1.yval, downward_segment.vTo, "splitNodeAtPoint1: high.yval == splitPt" );
		ok( !qs_tr1.trap, "splitNodeAtPoint1: high: no trapezoid" );
		ok( !qs_tr1.seg, "splitNodeAtPoint1: high: no segment" );
		strictEqual( qs_tr1.right.trap, tr1, "splitNodeAtPoint1: high.right -> OrigTrap(tr1)" );
		strictEqual( qs_tr1.right, tr1.sink, "splitNodeAtPoint1: high.right == sink(OrigTrap(tr1))" );
		strictEqual( qs_tr1.left, qs_tr4, "splitNodeAtPoint1: high.left -> NewTrap(tr4)" );
		strictEqual( qs_tr1.left, qs_tr4.trap.sink, "splitNodeAtPoint1: high.left == sink(NewTrap(tr4))" );
		myQs.check_trapezoid_neighbors(  1, 0, null, 4, null, "splitNodeAtPoint1: OrigTrap(tr1) neighbors" );
		myQs.check_trapezoid_neighbors(  2, 4, 3, null, null, "splitNodeAtPoint1: tr2 neighbors" );
		myQs.check_trapezoid_neighbors(  4, 1, null, 2, null, "splitNodeAtPoint1: NewTrap(tr4) neighbors" );
		//
		//	insert lower point into QueryStructure
		var qs_tr5 = myQs.splitNodeAtPoint( qs_tr2, downward_segment.vFrom, false );
		//
		equal( qs_tr2.yval, downward_segment.vFrom, "splitNodeAtPoint1: low.yval == splitPt" );
		ok( !qs_tr2.trap, "splitNodeAtPoint1: low: no trapezoid" );
		ok( !qs_tr2.seg, "splitNodeAtPoint1: low: no segment" );
		strictEqual( qs_tr2.right.trap, tr2, "splitNodeAtPoint1: low.right -> OrigTrap(tr2)" );
		strictEqual( qs_tr2.right, tr2.sink, "splitNodeAtPoint1: low.right == sink(OrigTrap(tr2))" );
		strictEqual( qs_tr2.left, qs_tr5, "splitNodeAtPoint1: low.left -> NewTrap(tr5)" );
		strictEqual( qs_tr2.left, qs_tr5.trap.sink, "splitNodeAtPoint1: low.left == sink(NewTrap(tr5))" );
		myQs.check_trapezoid_neighbors(  2, 4, 3, 5, null, "splitNodeAtPoint1: OrigTrap(tr2) neighbors" );
		myQs.check_trapezoid_neighbors(  5, 2, null, null, null, "splitNodeAtPoint1: NewTrap(tr5) neighbors" );
		//
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
	}

	/*                0
	 *   -------------*---------------------
	 *  		     /
	 *  	 1		/        3
	 *  		   /
	 *  		  /
	 *   --------*--------------------------
	 *  				2
	 *   ---*-------------------------------
	 *              4
	 */
	function test_splitNodeAtPoint2() {
		// going UPwards
		var	base_segment = { vFrom: { x: 20, y: 20 }, vTo: { x: 30, y: 40 }, upward: true }
		// inside of tr2, connected !!
		var	downward_segment = { vFrom: { x: 5, y: 15 }, vTo: base_segment.vFrom, upward: true }
		// segment chain
		var third_segment = { vFrom: base_segment.vTo, vTo: downward_segment.vFrom, upward: false,
							  sprev: base_segment, snext: downward_segment };
		base_segment.sprev = downward_segment;
		downward_segment.snext = base_segment;
		base_segment.snext = downward_segment.sprev = third_segment;
		//
		var myQs = new PNLTRI.QueryStructure();
		var myQsRoot = myQs.setup_segments( base_segment );
		//
		// precheck of correct Trapezoids
		var tr2 = myQs.getTrapByIdx(2), qs_tr2 = tr2.sink;
		myQs.segNodes( downward_segment );
		ok( ( downward_segment.rootFrom == qs_tr2 ), "splitNodeAtPoint2: Seg.vFrom -> qs_tr2" );
		ok( ( downward_segment.rootTo == qs_tr2 ), "splitNodeAtPoint2: Seg.vTo -> qs_tr2" );
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
		//
		// Main Test
		//
		//	insert higher point into QueryStructure
		var qs_tr2b = myQs.splitNodeAtPoint( qs_tr2, downward_segment.vTo, false );
		equal( qs_tr2b, qs_tr2, "splitNodeAtPoint2: high: no split really happened, point already inserted" );
		//
		//	insert lower point into QueryStructure
		var qs_tr4 = myQs.splitNodeAtPoint( qs_tr2, downward_segment.vFrom, false );
		//
		equal( qs_tr2.yval, downward_segment.vFrom, "splitNodeAtPoint2: low.yval == splitPt" );
		ok( !qs_tr2.trap, "splitNodeAtPoint2: low: no trapezoid" );
		ok( !qs_tr2.seg, "splitNodeAtPoint2: low: no segment" );
		strictEqual( qs_tr2.right.trap, tr2, "splitNodeAtPoint2: low.right -> OrigTrap(tr2)" );
		strictEqual( qs_tr2.right, tr2.sink, "splitNodeAtPoint2: low.right == sink(OrigTrap(tr2))" );
		strictEqual( qs_tr2.left, qs_tr4, "splitNodeAtPoint2: low.left -> NewTrap(tr4)" );
		strictEqual( qs_tr2.left, qs_tr4.trap.sink, "splitNodeAtPoint2: low.left == sink(NewTrap(tr4))" );
		myQs.check_trapezoid_neighbors(  2, 1, 3, 4, null, "splitNodeAtPoint2: OrigTrap(tr2) neighbors" );
		myQs.check_trapezoid_neighbors(  4, 2, null, null, null, "splitNodeAtPoint2: NewTrap(tr4) neighbors" );
		//
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
	}


	function test_ptNode() {
		//
		//					0
		//   ------------*----------------------	myQsRoot
		//  		    /
		//  	1	 qsLR        3
		//  		  /
		//   --------*--------------------------	qsL
		//                2
		//
		// point objects
		var	firstPoint = { x: 1, y: 1 };
		var	secondPoint = { x: 3, y: 4 };
		var	thirdPoint = { x: 2, y: 4 };
		// going UPwards
		var	base_segment = { vFrom: firstPoint,
							  vTo: secondPoint,
							  upward: true,
							  }
		// segment chain
		var thirdVertex = thirdPoint;
		base_segment.snext = { vFrom: base_segment.vTo, vTo: thirdVertex, upward: false };
		base_segment.sprev = { vFrom: thirdVertex, vTo: base_segment.vFrom, upward: false };
		base_segment.snext.sprev = base_segment.sprev.snext = base_segment;
		base_segment.snext.snext = base_segment.sprev;
		base_segment.sprev.sprev = base_segment.snext;
		//
		var myQs = new PNLTRI.QueryStructure();
		var myQsRoot = myQs.setup_segments( base_segment );		// Y-Node
//		showDataStructure( myQsRoot );
		//
		var qs_tr0 = myQsRoot.right;			// myQsRoot.right.trap: tr0;
		var qsL = myQsRoot.left;		// Y-Node
		var qs_tr2 = qsL.left;					// qsL.left.trap: tr2;
		var qsLR = qsL.right;			// X-Node: base_segment
		var qs_tr1 = qsLR.left;					// qsLR.left.trap: tr1;
		var qs_tr3 = qsLR.right;				// qsLR.right.trap: tr3;
		//	SINK-Node
		ok( ( myQs.ptNode( { vFrom: { x: 2, y: 5 }, vTo: { x: 3, y: 6 }, rootFrom: qsL.left }, true ) == qs_tr2 ), "ptNode A: Sink direct -> qs_tr2" );
		//	Y-Node
		ok( ( myQs.ptNode( { vFrom: { x: 2, y: 5 }, vTo: { x: 3, y:  6 }, rootFrom: myQsRoot }, true ) == qs_tr0 ), "ptNode A: Y-Node(root), above -> qs_tr0" );
		ok( ( myQs.ptNode( { vFrom: { x: 2, y: 0 }, vTo: { x: 4, y: -1 }, rootFrom: qsL }, true ) == qs_tr2 ), "ptNode A: Y-Node(qsL), below -> qs_tr2" );
		//		Y-Node: 1.end point hit
		ok( ( myQs.ptNode( { vFrom: firstPoint, vTo: { x: 4, y: 0 }, rootFrom: qsL }, true ) == qs_tr2 ), "ptNode A: Y-Node(qsL), =vFrom, below -> qs_tr2" );
		//		Y-Node: 2.end point hit
		ok( ( myQs.ptNode( { vFrom: secondPoint, vTo: { x: 0, y: 5 }, rootFrom: myQsRoot }, true ) == qs_tr0 ), "ptNode A: Y-Node(root), =vTo, above -> qs_tr0" );
		//	X-Node
		ok( ( myQs.ptNode( { vFrom: { x: 2, y: 3 }, vTo: { x: 3, y: 6 }, rootFrom: qsLR }, true ) == qs_tr1 ), "ptNode A: X-Node(qsLR) -> qs_tr1" );
		ok( ( myQs.ptNode( { vFrom: { x: 2, y: 2 }, vTo: { x: 3, y: 6 }, rootFrom: qsLR }, true ) == qs_tr3 ), "ptNode A: X-Node(qsLR) -> qs_tr3" );
		//		X-Node: 1.end point hit - not horizontal
		ok( ( myQs.ptNode( { vFrom: firstPoint, vTo: { x: 0, y: 0 }, rootFrom: qsLR }, true ) == qs_tr1 ), "ptNode A: X-Node(qsLR), =vFrom -> qs_tr1" );
		ok( ( myQs.ptNode( { vFrom: { x: 2, y: 2 }, vTo: firstPoint, rootTo: qsLR }, false ) == qs_tr3 ), "ptNode A: X-Node(qsLR), =vFrom -> qs_tr3" );
		//		X-Node: 2.end point hit - not horizontal
		ok( ( myQs.ptNode( { vFrom: secondPoint, vTo: { x: 3, y: 5 }, rootFrom: qsLR }, true ) == qs_tr1 ), "ptNode A: X-Node(qsLR), =vTo -> qs_tr1" );
		ok( ( myQs.ptNode( { vFrom: { x: 4, y: 5 }, vTo: secondPoint, rootTo: qsLR }, false ) == qs_tr3 ), "ptNode A: X-Node(qsLR), =vTo -> qs_tr3" );
		//		X-Node: 1.end point hit - horizontal
		ok( ( myQs.ptNode( { vFrom: firstPoint, vTo: { x: 0, y: 1 }, rootFrom: qsLR }, true ) == qs_tr1 ), "ptNode A: X-Node(qsLR), =vFrom, horiz -> qs_tr1" );
		ok( ( myQs.ptNode( { vFrom: firstPoint, vTo: { x: 2, y: 1 }, rootFrom: qsLR }, true ) == qs_tr3 ), "ptNode A: X-Node(qsLR), =vFrom, horiz -> qs_tr3" );
		//		X-Node: 2.end point hit - horizontal
		ok( ( myQs.ptNode( { vFrom: secondPoint, vTo: { x: 2.5, y: 4 }, rootFrom: qsLR }, true ) == qs_tr1 ), "ptNode A: X-Node(qsLR), =vTo, horiz -> qs_tr1" );
		ok( ( myQs.ptNode( { vFrom: secondPoint, vTo: { x: 4, y: 4 }, rootFrom: qsLR }, true ) == qs_tr3 ), "ptNode A: X-Node(qsLR), =vTo, horiz -> qs_tr3" );
		//
		//                0
		//   --------*--------------------------	myQsRoot
		//  		  \
		//  	1	  qsLR       3
		//  		    \
		//   ------------*----------------------	qsL
		//                2
		//
		// point objects
		firstPoint = { x: 1, y: 4 };
		secondPoint = { x: 3, y: 1 };
		thirdPoint = { x: 3, y: 3 };
		// DOWNward segment
		base_segment = { vFrom: firstPoint,
						  vTo: secondPoint,
						  }
		// segment chain
		thirdVertex = thirdPoint;
		base_segment.snext = { vFrom: base_segment.vTo, vTo: thirdVertex };
		base_segment.sprev = { vFrom: thirdVertex, vTo: base_segment.vFrom };
		base_segment.snext.sprev = base_segment.sprev.snext = base_segment;
		base_segment.snext.snext = base_segment.sprev;
		base_segment.sprev.sprev = base_segment.snext;
		//
		myQs = new PNLTRI.QueryStructure();
		myQsRoot = myQs.setup_segments( base_segment );		// Y-Node
//		showDataStructure( myQsRoot );
		//
		qs_tr0 = myQsRoot.right;			// myQsRoot.right.trap: tr0;
		qsL = myQsRoot.left;		// Y-Node
		qs_tr2 = qsL.left;					// qsL.left.trap: tr2;
		qsLR = qsL.right;			// X-Node: base_segment
		qs_tr1 = qsLR.left;					// qsLR.left.trap: tr1;
		qs_tr3 = qsLR.right;				// qsLR.right.trap: tr3;
		//	SINK-Node
		ok( ( myQs.ptNode( { vFrom: { x: 2, y: 5 }, vTo: { x: 3, y: 6 }, rootFrom: qsL.left }, true ) == qs_tr2 ), "ptNode B: Sink direct -> qs_tr2" );
		//	Y-Node
		ok( ( myQs.ptNode( { vFrom: { x: 2, y: 5 }, vTo: { x: 3, y:  6 }, rootFrom: myQsRoot }, true ) == qs_tr0 ), "ptNode B: Y-Node(root), above -> qs_tr0" );
		ok( ( myQs.ptNode( { vFrom: { x: 2, y: 0 }, vTo: { x: 4, y: -1 }, rootFrom: qsL }, true ) == qs_tr2 ), "ptNode B: Y-Node(qsL), below -> qs_tr2" );
		//		Y-Node: 1.end point hit
		ok( ( myQs.ptNode( { vFrom: firstPoint, vTo: { x: 0, y: 5 }, rootFrom: myQsRoot }, true ) == qs_tr0 ), "ptNode B: Y-Node(root), =vFrom, above -> qs_tr0" );
		//		Y-Node: 2.end point hit
		ok( ( myQs.ptNode( { vFrom: secondPoint, vTo: { x: 4, y: 0 }, rootFrom: qsL }, true ) == qs_tr2 ), "ptNode B: Y-Node(qsL), =vTo, below -> qs_tr2" );
		//	X-Node
		ok( ( myQs.ptNode( { vFrom: { x: 2, y: 2 }, vTo: { x: 3, y: 6 }, rootFrom: qsLR }, true ) == qs_tr1 ), "ptNode B: X-Node(qsLR) -> qs_tr1" );
		ok( ( myQs.ptNode( { vFrom: { x: 2, y: 3 }, vTo: { x: 3, y: 6 }, rootFrom: qsLR }, true ) == qs_tr3 ), "ptNode B: X-Node(qsLR) -> qs_tr3" );
		//		X-Node: 1.end point hit - not horizontal
		ok( ( myQs.ptNode( { vFrom: firstPoint, vTo: { x: 0, y: 5 }, rootFrom: qsLR }, true ) == qs_tr1 ), "ptNode B: X-Node(qsLR), =vFrom -> qs_tr1" );
		ok( ( myQs.ptNode( { vFrom: firstPoint, vTo: { x: 0, y: 6 }, rootFrom: qsLR }, true ) == qs_tr3 ), "ptNode B: X-Node(qsLR), =vFrom -> qs_tr3" );
		//		X-Node: 2.end point hit - not horizontal
		ok( ( myQs.ptNode( { vFrom: secondPoint, vTo: { x: 4, y: -1 }, rootFrom: qsLR }, true ) == qs_tr1 ), "ptNode B: X-Node(qsLR), =vTo -> qs_tr1" );
		ok( ( myQs.ptNode( { vFrom: secondPoint, vTo: { x: 4, y:  0 }, rootFrom: qsLR }, true ) == qs_tr3 ), "ptNode B: X-Node(qsLR), =vTo -> qs_tr3" );
		//		X-Node: 1.end point hit - horizontal
		ok( ( myQs.ptNode( { vFrom: firstPoint, vTo: { x: 0, y: 4 }, rootFrom: qsLR }, true ) == qs_tr1 ), "ptNode B: X-Node(qsLR), =vFrom, horiz -> qs_tr1" );
		ok( ( myQs.ptNode( { vFrom: firstPoint, vTo: { x: 2, y: 4 }, rootFrom: qsLR }, true ) == qs_tr3 ), "ptNode B: X-Node(qsLR), =vFrom, horiz -> qs_tr3" );
		//		X-Node: 2.end point hit - horizontal
		ok( ( myQs.ptNode( { vFrom: secondPoint, vTo: { x: 2, y: 1 }, rootFrom: qsLR }, true ) == qs_tr1 ), "ptNode B: X-Node(qsLR), =vTo, horiz -> qs_tr1" );
		ok( ( myQs.ptNode( { vFrom: secondPoint, vTo: { x: 4, y: 1 }, rootFrom: qsLR }, true ) == qs_tr3 ), "ptNode B: X-Node(qsLR), =vTo, horiz -> qs_tr3" );
	}

	//
	//	Cases of endpoints touching other segments
	//	The touched segment is already inserted, now the endpoint of another segment,
	//	 which lies ON the first segment shall be located with ptNode()
	//	This is the opposite case to "test_add_segment_touching_N"
	//

		// TODO: test all mirrored cases !!!
		//	if going back co-linear direction
		//	should be checked with the preceding segment
		// ATTENTION: this needs to be looped since the
		//	preceeding segment can also be co-linear ...

	function test_ptNode_touching() {

		var testPolygon = [ { x: 10, y: 30 }, { x: 20, y: 10 }, { x: 30, y: 40 } ];
		var myPolygonData = new PNLTRI.PolygonData( [ testPolygon ] );
		var segListArray = myPolygonData.getSegments();

		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		var myQsRoot = myQs.getRoot();

		myQs.add_segment( segListArray[1] );		// touch line; touch point: 25,25
		var qs_tr1 = myQs.getTrapByIdx(1).sink;
		var qs_tr3 = myQs.getTrapByIdx(3).sink;
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot, false );

		var testSegment;
		//	DOWNward segments
		myQs.segNodes( testSegment = { vFrom: { x: 25, y: 25 }, vTo: { x: 15, y: 15 }, rootFrom: myQsRoot, rootTo: myQsRoot } );
		ok( ( testSegment.rootFrom == qs_tr1 ), "ptNode_touching: down, left -> qs_tr1" );
		ok( ( testSegment.rootTo == qs_tr1 ), "ptNode_touching: down reverse, left -> qs_tr1" );
		myQs.segNodes( testSegment = { vFrom: { x: 25, y: 25 }, vTo: { x: 35, y: 15 }, rootFrom: myQsRoot, rootTo: myQsRoot } );
		ok( ( testSegment.rootFrom == qs_tr3 ), "ptNode_touching: down, right -> qs_tr3" );
		ok( ( testSegment.rootTo == qs_tr3 ), "ptNode_touching: down reverse, right -> qs_tr3" );

		//	UPward segments
		myQs.segNodes( testSegment = { vFrom: { x: 25, y: 25 }, vTo: { x: 15, y: 35 }, rootFrom: myQsRoot, rootTo: myQsRoot } );
		ok( ( testSegment.rootFrom == qs_tr1 ), "ptNode_touching: up, left -> qs_tr1" );
		ok( ( testSegment.rootTo == qs_tr1 ), "ptNode_touching: up reverse, left -> qs_tr1" );
		myQs.segNodes( testSegment = { vFrom: { x: 25, y: 25 }, vTo: { x: 35, y: 35 }, rootFrom: myQsRoot, rootTo: myQsRoot } );
		ok( ( testSegment.rootFrom == qs_tr3 ), "ptNode_touching: up, right -> qs_tr3" );
		ok( ( testSegment.rootTo == qs_tr3 ), "ptNode_touching: up reverse, right -> qs_tr3" );
	}

	function test_ptNode_colinear_1() {		// TODO: with vertical lines

		// fully left side, CCW
		//
		//					0
		//   ------------*--------------	myQsRoot
		//  		  + /
		//  	1	  +/        3
		//  		++/
		//  		 /
		//   -------*-------------------	qsL
		//                2
		//
		var testPolygon = [ { x: 5, y: 14 }, { x: 10, y: 10 }, { x: 40, y: 40 },
							{ x: 35, y: 37 }, { x: 30, y: 30 }, { x: 20, y: 20 } ];
		var myPolygonData = new PNLTRI.PolygonData( [ testPolygon ] );
		var segListArray = myPolygonData.getSegments();

		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		var myQsRoot = myQs.getRoot();

		myQs.add_segment( segListArray[1] );		// touch line, 2nd touch line: segListArray[4]
		var qs_tr1 = myQs.getTrapByIdx(1).sink;
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot, false );

		//	prev(co-linear) segment
		myQs.segNodes( segListArray[3] );
		ok( ( segListArray[3].rootFrom == qs_tr1 ), "ptNode_colinear#1 A: prev, left -> qs_tr1" );
		ok( ( segListArray[3].rootTo == qs_tr1 ), "ptNode_colinear#1 A: prev reverse, left -> qs_tr1" );
		//	co-linear segment
		myQs.segNodes( segListArray[4] );
		ok( ( segListArray[4].rootFrom == qs_tr1 ), "ptNode_colinear#1 A: co-lin, left -> qs_tr1" );
		ok( ( segListArray[4].rootTo == qs_tr1 ), "ptNode_colinear#1 A: co-lin reverse, left -> qs_tr1" );
		//	next(co-linear) segment
		myQs.segNodes( segListArray[5] );
		ok( ( segListArray[5].rootFrom == qs_tr1 ), "ptNode_colinear#1 A: next, left -> qs_tr1" );
		ok( ( segListArray[5].rootTo == qs_tr1 ), "ptNode_colinear#1 A: next reverse, left -> qs_tr1" );

		//
		// horizontal lines
		var testPolygon = [ { x: 15, y: 15 }, { x: 10, y: 10 }, { x: 40, y: 10 },
							{ x: 35, y: 20 }, { x: 30, y: 10 }, { x: 20, y: 10 } ];
		var myPolygonData = new PNLTRI.PolygonData( [ testPolygon ] );
		var segListArray = myPolygonData.getSegments();

		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		var myQsRoot = myQs.getRoot();

		myQs.add_segment( segListArray[1] );		// touch line, 2nd touch line: segListArray[4]
		var qs_tr0 = myQs.getTrapByIdx(0).sink;
		var qs_tr1 = myQs.getTrapByIdx(1).sink;
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot, false );

		//	prev(prev(co-linear)) segment
		myQs.segNodes( segListArray[2] );
		ok( ( segListArray[2].rootFrom == qs_tr0 ), "ptNode_colinear#1 B: prev-prev, left -> qs_tr0" );
		ok( ( segListArray[2].rootTo == qs_tr0 ), "ptNode_colinear#1 B: prev-prev reverse, left -> qs_tr0" );
		//	prev(co-linear) segment
		myQs.segNodes( segListArray[3] );
		ok( ( segListArray[3].rootFrom == qs_tr0 ), "ptNode_colinear#1 B: prev, left -> qs_tr1" );
		ok( ( segListArray[3].rootTo == qs_tr1 ), "ptNode_colinear#1 B: prev reverse, left -> qs_tr1" );
		//	co-linear segment
		myQs.segNodes( segListArray[4] );
		ok( ( segListArray[4].rootFrom == qs_tr1 ), "ptNode_colinear#1 B: co-lin, left -> qs_tr1" );
		ok( ( segListArray[4].rootTo == qs_tr1 ), "ptNode_colinear#1 B: co-lin reverse, left -> qs_tr1" );
		//	next(co-linear) segment
		myQs.segNodes( segListArray[5] );
		ok( ( segListArray[5].rootFrom == qs_tr1 ), "ptNode_colinear#1 B: next, left -> qs_tr1" );
		ok( ( segListArray[5].rootTo == qs_tr0 ), "ptNode_colinear#1 B: next reverse, left -> qs_tr1" );
		//	next(next(co-linear)) segment
		myQs.segNodes( segListArray[0] );
		ok( ( segListArray[0].rootFrom == qs_tr0 ), "ptNode_colinear#1 B: next-next, left -> qs_tr0" );
		ok( ( segListArray[0].rootTo == qs_tr1 ), "ptNode_colinear#1 B: next-next reverse, left -> qs_tr1" );


		// fully right side, CW
		//
		//					0
		//   ------------*--------------	myQsRoot
		//  			/
		//  	1	   /++      3
		//  		  /+
		//  	   ´ / +
		//   -------*-------------------	qsL
		//                2
		//
		var testPolygon = [ { x: 25, y: 14 }, { x: 10, y: 10 }, { x: 40, y: 40 },
							{ x: 45, y: 37 }, { x: 30, y: 30 }, { x: 20, y: 20 } ];
		var myPolygonData = new PNLTRI.PolygonData( [ testPolygon ] );
		var segListArray = myPolygonData.getSegments();

		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		var myQsRoot = myQs.getRoot();

		myQs.add_segment( segListArray[1] );		// touch line, 2nd touch line: segListArray[4]
		var qs_tr3 = myQs.getTrapByIdx(3).sink;
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot, false );

		//	prev(co-linear) segment
		myQs.segNodes( segListArray[3] );
		ok( ( segListArray[3].rootFrom == qs_tr3 ), "ptNode_colinear#1 C: prev, right -> qs_tr3" );
		ok( ( segListArray[3].rootTo == qs_tr3 ), "ptNode_colinear#1 C: prev reverse, right -> qs_tr3" );
		//	co-linear segment
		myQs.segNodes( segListArray[4] );
		ok( ( segListArray[4].rootFrom == qs_tr3 ), "ptNode_colinear#1 C: co-lin, right -> qs_tr3" );
		ok( ( segListArray[4].rootTo == qs_tr3 ), "ptNode_colinear#1 C: co-lin reverse, right -> qs_tr3" );
		//	next(co-linear) segment
		myQs.segNodes( segListArray[5] );
		ok( ( segListArray[5].rootFrom == qs_tr3 ), "ptNode_colinear#1 C: next, right -> qs_tr3" );
		ok( ( segListArray[5].rootTo == qs_tr3 ), "ptNode_colinear#1 C: next reverse, right -> qs_tr3" );

		//
		// horizontal lines
		var testPolygon = [ { x: 15, y: 30 }, { x: 10, y: 40 }, { x: 40, y: 40 },
							{ x: 35, y: 35 }, { x: 30, y: 40 }, { x: 20, y: 40 } ];
		var myPolygonData = new PNLTRI.PolygonData( [ testPolygon ] );
		var segListArray = myPolygonData.getSegments();

		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		var myQsRoot = myQs.getRoot();

		myQs.add_segment( segListArray[1] );		// touch line, 2nd touch line: segListArray[4]
		var qs_tr2 = myQs.getTrapByIdx(2).sink;
		var qs_tr3 = myQs.getTrapByIdx(3).sink;
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot, false );

		//	prev(prev(co-linear)) segment
		myQs.segNodes( segListArray[2] );
		ok( ( segListArray[2].rootFrom == qs_tr3 ), "ptNode_colinear#1 D: prev-prev, right -> qs_tr3" );
		ok( ( segListArray[2].rootTo == qs_tr2 ), "ptNode_colinear#1 D: prev-prev reverse, right -> qs_tr2" );
		//	prev(co-linear) segment
		myQs.segNodes( segListArray[3] );
		ok( ( segListArray[3].rootFrom == qs_tr2 ), "ptNode_colinear#1 D: prev, right -> qs_tr2" );
		ok( ( segListArray[3].rootTo == qs_tr3 ), "ptNode_colinear#1 D: prev reverse, right -> qs_tr3" );
		//	co-linear segment
		myQs.segNodes( segListArray[4] );
		ok( ( segListArray[4].rootFrom == qs_tr3 ), "ptNode_colinear#1 D: co-lin, right -> qs_tr3" );
		ok( ( segListArray[4].rootTo == qs_tr3 ), "ptNode_colinear#1 D: co-lin reverse, right -> qs_tr3" );
		//	next(co-linear) segment
		myQs.segNodes( segListArray[5] );
		ok( ( segListArray[5].rootFrom == qs_tr3 ), "ptNode_colinear#1 D: next, right -> qs_tr3" );
		ok( ( segListArray[5].rootTo == qs_tr2 ), "ptNode_colinear#1 D: next reverse, right -> qs_tr2" );
		//	next(next(co-linear)) segment
		myQs.segNodes( segListArray[0] );
		ok( ( segListArray[0].rootFrom == qs_tr2 ), "ptNode_colinear#1 D: next-next, right -> qs_tr2" );
		ok( ( segListArray[0].rootTo == qs_tr2 ), "ptNode_colinear#1 D: next-next reverse, right -> qs_tr2" );
	}

	function test_ptNode_colinear_2() {

		// overlapping left low, right high, CCW
		//
		//					0
		//   -----------*---------------	myQsRoot
		//  		 + /
		//  	1	 +/        3
		//   	    +*-------------------	qsL
		//         +__     2
		//
		var testPolygon = [ { x: 25, y: 14 }, { x: 20, y: 20 }, { x: 40, y: 40 },
							{ x: 35, y: 37 }, { x: 30, y: 30 }, { x: 10, y: 10 } ];
		var myPolygonData = new PNLTRI.PolygonData( [ testPolygon ] );
		var segListArray = myPolygonData.getSegments();

		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		var myQsRoot = myQs.getRoot();

		myQs.add_segment( segListArray[1] );		// touch line, 2nd touch line: segListArray[4]
		var qs_tr1 = myQs.getTrapByIdx(1).sink;
		var qs_tr2 = myQs.getTrapByIdx(2).sink;
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot, false );

		//	prev(co-linear) segment
		myQs.segNodes( segListArray[3] );
		ok( ( segListArray[3].rootFrom == qs_tr1 ), "ptNode_colinear#2 A: prev, left -> qs_tr1" );
		ok( ( segListArray[3].rootTo == qs_tr1 ), "ptNode_colinear#2 A: prev reverse, left -> qs_tr1" );
		//	co-linear segment
		myQs.segNodes( segListArray[4] );
		ok( ( segListArray[4].rootFrom == qs_tr1 ), "ptNode_colinear#2 A: co-lin, left -> qs_tr1" );
		ok( ( segListArray[4].rootTo == qs_tr2 ), "ptNode_colinear#2 A: co-lin reverse, left -> qs_tr2" );
		//	next(co-linear) segment
		myQs.segNodes( segListArray[5] );
		ok( ( segListArray[5].rootFrom == qs_tr2 ), "ptNode_colinear#2 A: next, left -> qs_tr2" );
		ok( ( segListArray[5].rootTo == qs_tr2 ), "ptNode_colinear#2 A: next reverse, left -> qs_tr2" );

		//
		// other sequence
		var myPolygonData = new PNLTRI.PolygonData( [ testPolygon ] );
		var segListArray = myPolygonData.getSegments();

		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		var myQsRoot = myQs.getRoot();

		myQs.add_segment( segListArray[4] );		// touch line, 2nd touch line: segListArray[1]
		var qs_tr0 = myQs.getTrapByIdx(0).sink;
		var qs_tr3 = myQs.getTrapByIdx(3).sink;
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot, false );

		//	prev(co-linear) segment
		myQs.segNodes( segListArray[0] );
		ok( ( segListArray[0].rootFrom == qs_tr3 ), "ptNode_colinear#2 B: prev, right -> qs_tr3" );
		ok( ( segListArray[0].rootTo == qs_tr3 ), "ptNode_colinear#2 B: prev reverse, right -> qs_tr3" );
		//	co-linear segment
		myQs.segNodes( segListArray[1] );
		ok( ( segListArray[1].rootFrom == qs_tr3 ), "ptNode_colinear#2 B: co-lin, right -> qs_tr3" );
		ok( ( segListArray[1].rootTo == qs_tr0 ), "ptNode_colinear#1 B: co-lin reverse, right -> qs_tr0" );
		//	next(co-linear) segment
		myQs.segNodes( segListArray[2] );
		ok( ( segListArray[2].rootFrom == qs_tr0 ), "ptNode_colinear#2 B: next, right -> qs_tr0" );
		ok( ( segListArray[2].rootTo == qs_tr0 ), "ptNode_colinear#1 B: next reverse, right -> qs_tr0" );


		// overlapping right low, left high, CW
		//
		//					0
		//   ------------*--------------	myQsRoot
		//  			/
		//  	1	   /++       3
		//   ---------*+					qsL
		// 			  +     2
		//			+
		var testPolygon = [ { x:  5, y: 14 }, { x: 20, y: 20 }, { x: 40, y: 40 },
							{ x: 45, y: 37 }, { x: 30, y: 30 }, { x: 10, y: 10 } ];
		var myPolygonData = new PNLTRI.PolygonData( [ testPolygon ] );
		var segListArray = myPolygonData.getSegments();

		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		var myQsRoot = myQs.getRoot();

		myQs.add_segment( segListArray[1] );		// touch line, 2nd touch line: segListArray[4]
		var qs_tr2 = myQs.getTrapByIdx(2).sink;
		var qs_tr3 = myQs.getTrapByIdx(3).sink;
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot, false );

		//	prev(co-linear) segment
		myQs.segNodes( segListArray[3] );
		ok( ( segListArray[3].rootFrom == qs_tr3 ), "ptNode_colinear#2 C: prev, right -> qs_tr3" );
		ok( ( segListArray[3].rootTo == qs_tr3 ), "ptNode_colinear#2 C: prev reverse, right -> qs_tr3" );
		//	co-linear segment
		myQs.segNodes( segListArray[4] );
		ok( ( segListArray[4].rootFrom == qs_tr3 ), "ptNode_colinear#2 C: co-lin, right -> qs_tr3" );
		ok( ( segListArray[4].rootTo == qs_tr2 ), "ptNode_colinear#1 C: co-lin reverse, right -> qs_tr2" );
		//	next(co-linear) segment
		myQs.segNodes( segListArray[5] );
		ok( ( segListArray[5].rootFrom == qs_tr2 ), "ptNode_colinear#2 C: next, right -> qs_tr2" );
		ok( ( segListArray[5].rootTo == qs_tr2 ), "ptNode_colinear#1 C: next reverse, right -> qs_tr2" );

		//
		// other sequence
		var myPolygonData = new PNLTRI.PolygonData( [ testPolygon ] );
		var segListArray = myPolygonData.getSegments();

		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		var myQsRoot = myQs.getRoot();

		myQs.add_segment( segListArray[4] );		// touch line, 2nd touch line: segListArray[1]
		var qs_tr0 = myQs.getTrapByIdx(0).sink;
		var qs_tr1 = myQs.getTrapByIdx(1).sink;
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot, false );

		//	prev(co-linear) segment
		myQs.segNodes( segListArray[0] );
		ok( ( segListArray[0].rootFrom == qs_tr1 ), "ptNode_colinear#2 D: prev, left -> qs_tr1" );
		ok( ( segListArray[0].rootTo == qs_tr1 ), "ptNode_colinear#2 D: prev reverse, left -> qs_tr1" );
		//	co-linear segment
		myQs.segNodes( segListArray[1] );
		ok( ( segListArray[1].rootFrom == qs_tr1 ), "ptNode_colinear#2 D: co-lin, left -> qs_tr1" );
		ok( ( segListArray[1].rootTo == qs_tr0 ), "ptNode_colinear#1 D: co-lin reverse, left -> qs_tr0" );
		//	next(co-linear) segment
		myQs.segNodes( segListArray[2] );
		ok( ( segListArray[2].rootFrom == qs_tr0 ), "ptNode_colinear#2 D: next, left -> qs_tr0" );
		ok( ( segListArray[2].rootTo == qs_tr0 ), "ptNode_colinear#1 D: next reverse, left -> qs_tr0" );
	}

	/**************************************************************************/


	function test_assign_depths() {
		var testPolygon = [ { x: 5, y: 5 }, { x: 45, y: 20 }, { x: 15, y: 40 } ];

		var myPolygonData = new PNLTRI.PolygonData( [ testPolygon ] );
		var segListArray = myPolygonData.getSegments();
		//
		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		var myQsRoot = myQs.getRoot();
		//
		myQs.add_segment_consistently( segListArray[0], 'assign_depths #0' );
		myQs.add_segment_consistently( segListArray[1], 'assign_depths #1' );
		myQs.add_segment_consistently( segListArray[2], 'assign_depths #2' );
		ok( myPolygonData.allSegsInQueryStructure(), "assign_depths: all segments inserted" );
		//
		//	Main test: standard case
		//
		equal( myQs.minDepth(), -1, "assign_depths: Min depth: -1" );
		equal( myQs.maxDepth(), -1, "assign_depths: Max depth: -1" );
		myQs.assignDepths(myPolygonData);			// marks outside trapezoids
		equal( myQs.minDepth(), 0, "assign_depths: Min depth: 0" );
		equal( myQs.maxDepth(), 1, "assign_depths: Max depth: 1" );
		//
		var startTrap = myQs.find_first_inside();
		equal( startTrap.trapID, 1, "assign_depths: Start-Trap-ID" );
		equal( startTrap.depth, 1, "assign_depths: Max depth of startTrap == 1" );
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot, false, 1 );
		//
		//
		var myPolygonData = new PNLTRI.PolygonData( [ testPolygon ] );
		var segListArray = myPolygonData.getSegments();
		//
		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		var myQsRoot = myQs.getRoot();
		//	not closed !!
		myQs.add_segment_consistently( segListArray[0], 'assign_depths #0' );
		myQs.add_segment_consistently( segListArray[1], 'assign_depths #1' );
		//
		//	Main test: all outside
		//
		myQs.assignDepths(myPolygonData);			// marks all trapezoids as outside
		equal( myQs.minDepth(), 0, "assign_depths: Min depth: 0" );
		equal( myQs.maxDepth(), 0, "assign_depths: Max depth: 0" );
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot, false, 1 );
	}


	/**************************************************************************/


	/*					0
	 *   --------------------------*--------		y=40	myQsRoot
	 *				1			 qsLR
	 *   ------*-----------------/		3			y=25	qsLRL
	 *			\      	6		/
	 *   		 \-------------*------------		y=20	qsL
	 *  	4	qsLRLL		2
	 *   ----------*------------------------		y=10	qsLL
	 *					5
	 */
	function test_add_segment_basic_1() {
		var	base_segment = { vFrom: { x: 30, y: 40 }, vTo: { x: 20, y: 20 }, upward: false }
		var	other_segment = { vFrom: { x: 15, y: 10 }, vTo: { x: 10, y: 25 }, upward: true }
		// segment chain
		base_segment.snext = other_segment.sprev = { vFrom: base_segment.vTo, vTo: other_segment.vFrom, upward: false,
														sprev: base_segment, snext: other_segment };
		base_segment.sprev = other_segment.snext = { vFrom: other_segment.vTo, vTo: base_segment.vFrom, upward: true,
														sprev: other_segment, snext: base_segment };
		//
		var myQs = new PNLTRI.QueryStructure();
		var myQsRoot = myQs.setup_segments( base_segment );
		ok( base_segment.is_inserted, "Add#1: Base Segment inserted" );
		equal( myQs.nbTrapezoids(), 4, "Add#1: Number of Trapezoids in Array (4)" );
		// precheck of correct Trapezoids
		var qs_tr1 = myQs.getTrapByIdx(1).sink;
		var qs_tr2 = myQs.getTrapByIdx(2).sink;
		myQs.segNodes( other_segment );
		ok( ( other_segment.rootFrom == qs_tr2 ), "Add#1: Seg.vFrom -> qs_tr2" );
		ok( ( other_segment.rootTo == qs_tr1 ), "Add#1: Seg.vTo -> qs_tr1" );
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
		//
		// Main Test
		//
		myQs.add_segment( other_segment );
		ok( other_segment.is_inserted, "Add#1: 2.Segment inserted" );
		equal( myQs.nbTrapezoids(), 7, "Add#1: Number of Trapezoids in Array (7)" );
		//
		myQs.check_trapezoid_neighbors(  0, null, null, 1, 3, "Add#1: neighbors trap0" );
		myQs.check_trapezoid_neighbors(  1, 0, null, 4, 6, "Add#1: neighbors trap1" );
		myQs.check_trapezoid_neighbors(  2, 6, 3, null, 5, "Add#1: neighbors trap2" );
		myQs.check_trapezoid_neighbors(  3, null, 0, null, 2, "Add#1: neighbors trap3" );
		myQs.check_trapezoid_neighbors(  4, 1, null, 5, null, "Add#1: neighbors trap4" );
		myQs.check_trapezoid_neighbors(  5, 4, 2, null, null, "Add#1: neighbors trap5" );
		myQs.check_trapezoid_neighbors(  6, null, 1, 2, null, "Add#1: neighbors trap6" );
		//
		ok( ( myQsRoot.right.trap == myQs.getTrapByIdx(0) ), "Add#1: trap0 == root.right" );
		ok( ( myQsRoot.left.right.right.trap == myQs.getTrapByIdx(3) ), "Add#1: trap3 == root.left.right.right" );
		ok( ( myQsRoot.left.right.left.right.trap == myQs.getTrapByIdx(1) ), "Add#1: trap1 == root.left.right.left.right" );
		ok( ( myQsRoot.left.right.left.left.right.trap == myQs.getTrapByIdx(6) ), "Add#1: trap6 == root.left.right.left.left.right" );
		ok( ( myQsRoot.left.right.left.left.left.trap == myQs.getTrapByIdx(4) ), "Add#1: trap4 == root.left.right.left.left.left" );
		ok( ( myQsRoot.left.left.right.right.trap == myQs.getTrapByIdx(2) ), "Add#1: trap2 == root.left.left.right.right" );
		ok( ( myQsRoot.left.left.right.left.trap == myQs.getTrapByIdx(4) ), "Add#1: trap4 == root.left.left.right.left" );
		ok( ( myQsRoot.left.left.left.trap == myQs.getTrapByIdx(5) ), "Add#1: trap5 == root.left.left.left" );
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
	}

	/*					0
	 *  -----*-------------------------		y=45	qsR
	 *		  \			6
	 *  	   \------------*----------		y=40	myQsRoot
	 *	   4	\     1	  qsLR	  3
	 *  		 \--------*------------		y=20	qsL
	 *  		qsLLR      2
	 *  -----------*-------------------		y=10	qsLL
	 *					5
	 */
	function test_add_segment_basic_2() {
		var	base_segment = { vFrom: { x: 20, y: 20 }, vTo: { x: 30, y: 40 }, upward: true }
		// start in tr0, end in tr2
		var	other_segment = { vFrom: { x: 10, y: 45 }, vTo: { x: 15, y: 10 }, upward: false }
		// segment chain
		base_segment.snext = other_segment.sprev = { vFrom: base_segment.vTo, vTo: other_segment.vFrom, upward: true,
														sprev: base_segment, snext: other_segment };
		base_segment.sprev = other_segment.snext = { vFrom: other_segment.vTo, vTo: base_segment.vFrom, upward: false,
														sprev: other_segment, snext: base_segment };
		//
		var myQs = new PNLTRI.QueryStructure();
		var myQsRoot = myQs.setup_segments( base_segment );
		ok( base_segment.is_inserted, "Add#2: Base Segment inserted" );
		// precheck of correct Trapezoids
		var qs_tr0 = myQs.getTrapByIdx(0).sink;
		var qs_tr2 = myQs.getTrapByIdx(2).sink;
		myQs.segNodes( other_segment );
		ok( ( other_segment.rootFrom == qs_tr0 ), "Add#2: Seg.vFrom -> qs_tr0" );
		ok( ( other_segment.rootTo == qs_tr2 ), "Add#2: Seg.vTo -> qs_tr2" );
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
		//
		// Main Test
		//
		myQs.add_segment( other_segment );
		ok( other_segment.is_inserted, "Add#2: 2.Segment inserted" );
		equal( myQs.nbTrapezoids(), 7, "Add#2: Number of Trapezoids in Array (7)" );
		//
		myQs.check_trapezoid_neighbors(  0, null, null, 4, 6, "Add#2: neighbors trap0" );
		myQs.check_trapezoid_neighbors(  1, 6, null, 2, null, "Add#2: neighbors trap1" );
		myQs.check_trapezoid_neighbors(  2, 1, 3, null, 5, "Add#2: neighbors trap2" );
		myQs.check_trapezoid_neighbors(  3, null, 6, null, 2, "Add#2: neighbors trap3" );
		myQs.check_trapezoid_neighbors(  4, 0, null, 5, null, "Add#2: neighbors trap4" );
		myQs.check_trapezoid_neighbors(  5, 4, 2, null, null, "Add#2: neighbors trap5" );
		myQs.check_trapezoid_neighbors(  6, null, 0, 1, 3, "Add#2: neighbors trap6" );
		//
		ok( ( myQsRoot.right.right.trap == myQs.getTrapByIdx(0) ), "Add#2: trap0 == root.right.right" );
		ok( ( myQsRoot.right.left.left.trap == myQs.getTrapByIdx(4) ), "Add#2: trap4 == root.right.left.left" );
		ok( ( myQsRoot.right.left.right.trap == myQs.getTrapByIdx(6) ), "Add#2: trap6 == root.right.left.right" );
		ok( ( myQsRoot.left.right.right.trap == myQs.getTrapByIdx(3) ), "Add#2: trap3 == root.left.right.right" );
		ok( ( myQsRoot.left.right.left.right.trap == myQs.getTrapByIdx(1) ), "Add#2: trap1 == root.left.right.left.right" );
		ok( ( myQsRoot.left.right.left.left.trap == myQs.getTrapByIdx(4) ), "Add#2: trap4 == root.left.right.left.left" );
		ok( ( myQsRoot.left.left.right.right.trap == myQs.getTrapByIdx(2) ), "Add#2: trap2 == root.left.left.right.right" );
		ok( ( myQsRoot.left.left.right.left.trap == myQs.getTrapByIdx(4) ), "Add#2: trap4 == root.left.left.right.left" );
		ok( ( myQsRoot.left.left.left.trap == myQs.getTrapByIdx(5) ), "Add#2: trap5 == root.left.left.left" );
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
	}

	/*					0
	 *  ----------*--------------------		y=40	myQsRoot
	 *			 /		3
	 *  	    /-----------*----------		y=35	qsLRR
	 *	   1  qsLR    4	 qsLRRLR	6
	 *  	  /-----------*------------		y=25	qsLRRL
	 *  	 /		     5
	 *  ----*--------------------------		y=20	qsL
	 *					2
	 */
	function test_add_segment_basic_3() {
		var	base_segment = { vFrom: { x: 30, y: 40 }, vTo: { x: 20, y: 20 }, upward: false }
		// inside of tr3
		var	other_segment = { vFrom: { x: 25, y: 25 }, vTo: { x: 35, y: 35 }, upward: true }
		// segment chain
		base_segment.snext = other_segment.sprev = { vFrom: base_segment.vTo, vTo: other_segment.vFrom, upward: false,
														sprev: base_segment, snext: other_segment };
		base_segment.sprev = other_segment.snext = { vFrom: other_segment.vTo, vTo: base_segment.vFrom, upward: false,
														sprev: other_segment, snext: base_segment };
		//
		var myQs = new PNLTRI.QueryStructure();
		var myQsRoot = myQs.setup_segments( base_segment );
		ok( base_segment.is_inserted, "Add#3: Base Segment inserted" );
		// precheck of correct Trapezoids
		var qs_tr3 = myQs.getTrapByIdx(3).sink;
		myQs.segNodes( other_segment );
		ok( ( other_segment.rootFrom == qs_tr3 ), "Add#3: Seg.vFrom -> qs_tr3" );
		ok( ( other_segment.rootTo == qs_tr3 ), "Add#3: Seg.vTo -> qs_tr3" );
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
		//
		// Main Test
		//
		myQs.add_segment( other_segment );
		ok( other_segment.is_inserted, "Add#3: 2.Segment inserted" );
		equal( myQs.nbTrapezoids(), 7, "Add#3: Number of Trapezoids in Array (7)" );
		//
		myQs.check_trapezoid_neighbors(  0, null, null, 1, 3, "Add#3: neighbors trap0" );
		myQs.check_trapezoid_neighbors(  1, 0, null, 2, null, "Add#3: neighbors trap1" );
		myQs.check_trapezoid_neighbors(  2, 1, 5, null, null, "Add#3: neighbors trap2" );
		myQs.check_trapezoid_neighbors(  3, null, 0, 4, 6, "Add#3: neighbors trap3" );
		myQs.check_trapezoid_neighbors(  4, 3, null, 5, null, "Add#3: neighbors trap4" );
		myQs.check_trapezoid_neighbors(  5, 4, 6, null, 2, "Add#3: neighbors trap5" );
		myQs.check_trapezoid_neighbors(  6, null, 3, null, 5, "Add#3: neighbors trap6" );
		//
		ok( ( myQsRoot.right.trap == myQs.getTrapByIdx(0) ), "Add#3: trap0 == root.right" );
		ok( ( myQsRoot.left.right.right.right.trap == myQs.getTrapByIdx(3) ), "Add#3: trap3 == root.left.right.right.right" );
		ok( ( myQsRoot.left.right.right.left.right.right.trap == myQs.getTrapByIdx(6) ), "Add#3: trap6 == root.left.right.right.left.right.right" );
		ok( ( myQsRoot.left.right.right.left.right.left.trap == myQs.getTrapByIdx(4) ), "Add#3: trap4 == root.left.right.right.left.right.left" );
		ok( ( myQsRoot.left.right.right.left.left.trap == myQs.getTrapByIdx(5) ), "Add#3: trap5 == root.left.right.right.left.left" );
		ok( ( myQsRoot.left.right.left.trap == myQs.getTrapByIdx(1) ), "Add#3: trap1 == root.left.right.left" );
		ok( ( myQsRoot.left.left.trap == myQs.getTrapByIdx(2) ), "Add#3: trap2 == root.left.left" );
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
	}

	/*					0
	 *  ----------*--------------------		y=40	myQsRoot
	 *		1	qsLR	3
	 *	--------*----------------------		y=20	qsL
	 *	         	2
	 *  ------*------------------------		y=15	qsLL
	 *    4  qsLLLR		6
	 *  --------*----------------------		y= 5	qsLLL
	 *					5
	 */
	function test_add_segment_basic_4() {
		var	base_segment = { vFrom: { x: 30, y: 40 }, vTo: { x: 20, y: 20 }, upward: false }
		// inside of tr2
		var	other_segment = { vFrom: { x: 5, y: 15 }, vTo: { x: 35, y: 5 }, upward: false }
		// segment chain
		base_segment.snext = other_segment.sprev = { vFrom: base_segment.vTo, vTo: other_segment.vFrom, upward: false,
														sprev: base_segment, snext: other_segment };
		base_segment.sprev = other_segment.snext = { vFrom: other_segment.vTo, vTo: base_segment.vFrom, upward: true,
														sprev: other_segment, snext: base_segment };
		//
		var myQs = new PNLTRI.QueryStructure();
		var myQsRoot = myQs.setup_segments( base_segment );
		ok( base_segment.is_inserted, "Add#4: Base Segment inserted" );
		// precheck of correct Trapezoids
		var qs_tr2 = myQs.getTrapByIdx(2).sink;
		myQs.segNodes( other_segment );
		ok( ( other_segment.rootFrom == qs_tr2 ), "Add#4: Seg.vFrom -> qs_tr2" );
		ok( ( other_segment.rootTo == qs_tr2 ), "Add#4: Seg.vTo -> qs_tr2" );
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
		//
		// Main Test
		//
		myQs.add_segment( other_segment );
		ok( other_segment.is_inserted, "Add#4: 2.Segment inserted" );
		equal( myQs.nbTrapezoids(), 7, "Add#4: Number of Trapezoids in Array (7)" );
		//
		myQs.check_trapezoid_neighbors(  0, null, null, 1, 3, "Add#4: neighbors trap0" );
		myQs.check_trapezoid_neighbors(  1, 0, null, 2, null, "Add#4: neighbors trap1" );
		myQs.check_trapezoid_neighbors(  2, 1, 3, 4, 6, "Add#4: neighbors trap2" );
		myQs.check_trapezoid_neighbors(  3, null, 0, null, 2, "Add#4: neighbors trap3" );
		myQs.check_trapezoid_neighbors(  4, 2, null, 5, null, "Add#4: neighbors trap4" );
		myQs.check_trapezoid_neighbors(  5, 4, 6, null, null, "Add#4: neighbors trap5" );
		myQs.check_trapezoid_neighbors(  6, null, 2, null, 5, "Add#4: neighbors trap6" );
		//
		ok( ( myQsRoot.right.trap == myQs.getTrapByIdx(0) ), "Add#4: trap0 == root.right" );
		ok( ( myQsRoot.left.right.right.trap == myQs.getTrapByIdx(3) ), "Add#4: trap3 == root.left.right.right" );
		ok( ( myQsRoot.left.right.left.trap == myQs.getTrapByIdx(1) ), "Add#4: trap1 == root.left.right.left" );
		ok( ( myQsRoot.left.left.right.trap == myQs.getTrapByIdx(2) ), "Add#4: trap2 == root.left.left.right" );
		ok( ( myQsRoot.left.left.left.right.right.trap == myQs.getTrapByIdx(6) ), "Add#4: trap6 == root.left.left.left.right.right" );
		ok( ( myQsRoot.left.left.left.right.left.trap == myQs.getTrapByIdx(4) ), "Add#4: trap4 == root.left.left.left.right.left" );
		ok( ( myQsRoot.left.left.left.left.trap == myQs.getTrapByIdx(5) ), "Add#4: trap5 == root.left.left.left.left" );
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
	}


	//
	//	Cases of segments touching other endpoints
	//	A segment endpoint is already inserted, now another segment,
	//	 which includes the endpoint as well shall be added on the correct side
	//	These cases are handled in two_trap_below()
	//	This is the opposite case to "test_ptNode_touching"
	//

		// TODO: test all mirrored cases !!!
		//	if going back co-linear direction
		//	should be checked with the preceding segment
		// ATTENTION: this needs to be looped since the
		//	preceeding segment can also be co-linear ...

	/*				0
	 *  -----------*-----------		y=40
	 *			 / |
	 *	--------*--|				y=30
	 *			 \ |
	 *	----------*|				y=25
	 *			 / |
	 * 	--------*--|				y=15
	 *			 \ |
	 *  -----------*-----------		y=10
	 *
	 */
	function test_add_segment_touching_1() {

		//	Test A
		var testPolygon = [
			{ x: 25, y: 25 },											// touch point
			{ x: 15, y: 15 }, { x: 20, y: 10 }, { x: 30, y: 40 },		// touch line (right of point)
			{ x: 10, y: 30 },
			];
		var myPolygonData = new PNLTRI.PolygonData( [ testPolygon ] );
		var segListArray = myPolygonData.getSegments();

		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		var myQsRoot = myQs.getRoot();

		myQs.add_segment_consistently( segListArray[0], 'Touch#1 A #1' );
		myQs.add_segment_consistently( segListArray[2], 'Touch#1 A #2' );

		myQs.check_trapezoid_neighbors(  0, null, null, 4, 6, "Touch#1 A: neighbors trap0" );
		myQs.check_trapezoid_neighbors(  1, 4, null, 2, null, "Touch#1 A: neighbors trap1" );
		myQs.check_trapezoid_neighbors(  2, 1, 3, 5, null, "Touch#1 A: neighbors trap2" );
		myQs.check_trapezoid_neighbors(  3, null, 4, null, 2, "Touch#1 A: neighbors trap3" );
		myQs.check_trapezoid_neighbors(  4, 0, null, 1, 3, "Touch#1 A: neighbors trap4" );
		myQs.check_trapezoid_neighbors(  5, 2, 6, null, null, "Touch#1 A: neighbors trap5" );
		myQs.check_trapezoid_neighbors(  6, null, 0, null, 5, "Touch#1 A: neighbors trap6" );
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot, false );

		//	Test B
		var testPolygon = [
			{ x: 25, y: 25 },											// touch point
			{ x: 40, y: 15 }, { x: 20, y: 10 }, { x: 30, y: 40 },		// touch line (left of point)
			{ x: 35, y: 30 },
			];
		var myPolygonData = new PNLTRI.PolygonData( [ testPolygon ] );
		var segListArray = myPolygonData.getSegments();

		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		var myQsRoot = myQs.getRoot();

		myQs.add_segment_consistently( segListArray[0], 'Touch#1 B #1' );
		myQs.add_segment_consistently( segListArray[2], 'Touch#1 B #2' );

		myQs.check_trapezoid_neighbors(  0, null, null, 4, 6, "Touch#1 B: neighbors trap0" );
		myQs.check_trapezoid_neighbors(  1, 6, null, 2, null, "Touch#1 B: neighbors trap1" );
		myQs.check_trapezoid_neighbors(  2, 1, 3, null, 5, "Touch#1 B: neighbors trap2" );
		myQs.check_trapezoid_neighbors(  3, null, 6, null, 2, "Touch#1 B: neighbors trap3" );
		myQs.check_trapezoid_neighbors(  4, 0, null, 5, null, "Touch#1 B: neighbors trap4" );
		myQs.check_trapezoid_neighbors(  5, 4, 2, null, null, "Touch#1 B: neighbors trap5" );
		myQs.check_trapezoid_neighbors(  6, null, 0, 1, 3, "Touch#1 B: neighbors trap6" );
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot, false );
	}


	//
	//	Complete Polygons
	//

	/*					0
	 *  -----------*-----------		y=40	myQsRoot
	 *			  /|
	 *		  qsLR |
	 *		1	/3 qsLRR
	 *	-------*---|		6		y=20	qsL
	 *		2	\5 qsLLRR
	 * 		 qsLLR |
	 *			  \|
	 *  -----------*-----------		y=10	qsLL
	 *					4
	 */
	function test_add_segment_polygon_1() {

		var myPolygonData = new PNLTRI.PolygonData( [ [
				{ x: 30, y: 40 }, { x: 20, y: 20 }, { x: 25, y:10 },
			] ] );
		var segListArray = myPolygonData.getSegments();

		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		var myQsRoot = myQs.getRoot();

		myQs.add_segment_consistently( segListArray[0], 'Poly#1 #1' );
		myQs.add_segment_consistently( segListArray[1], 'Poly#1 #2' );
		myQs.add_segment_consistently( segListArray[2], 'Poly#1 #3' );
		equal( myQs.nbTrapezoids(), 7, "Poly#1: Number of Trapezoids" );

		myQs.check_trapezoid_neighbors(  0, null, null, 1, 6, "Poly#1: neighbors trap0" );
		myQs.check_trapezoid_neighbors(  1, 0, null, 2, null, "Poly#1: neighbors trap1" );
		myQs.check_trapezoid_neighbors(  2, 1, null, 4, null, "Poly#1: neighbors trap2" );
		myQs.check_trapezoid_neighbors(  3, null, null, null, 5, "Poly#1: neighbors trap3" );
		myQs.check_trapezoid_neighbors(  4, 2, 6, null, null, "Poly#1: neighbors trap4" );
		myQs.check_trapezoid_neighbors(  5, null, 3, null, null, "Poly#1: neighbors trap5" );
		myQs.check_trapezoid_neighbors(  6, null, 0, null, 4, "Poly#1: neighbors trap6" );

		ok( ( myQsRoot.right.trap == myQs.getTrapByIdx(0) ), "Poly#1: trap0 == root.right" );
		ok(   myQsRoot.left.yval, "Poly#1: root.left: Y-Node" );
		ok(   myQsRoot.left.right.seg, "Poly#1: root.left.right: X-Node" );
		ok(   myQsRoot.left.right.right.seg, "Poly#1: root.left.right.right: X-Node" );
		ok( ( myQsRoot.left.right.right.right.trap == myQs.getTrapByIdx(6) ), "Poly#1: trap6 == root.left.right.right.right" );
		ok( ( myQsRoot.left.right.right.left.trap == myQs.getTrapByIdx(3) ), "Poly#1: trap3 == root.left.right.right.left" );
		ok( ( myQsRoot.left.right.left.trap == myQs.getTrapByIdx(1) ), "Poly#1: trap1 == root.left.right.left" );
		ok(   myQsRoot.left.left.yval, "Poly#1: root.left.left: Y-Node" );
		ok(   myQsRoot.left.left.right.seg, "Poly#1: root.left.left.right: X-Node" );
		ok(   myQsRoot.left.left.right.right.seg, "Poly#1: root.left.left.right.right: X-Node" );
		ok( ( myQsRoot.left.left.right.right.right.trap == myQs.getTrapByIdx(6) ), "Poly#1: trap6 == root.left.left.right.right.right" );
		ok( ( myQsRoot.left.left.right.right.left.trap == myQs.getTrapByIdx(5) ), "Poly#1: trap5 == root.left.left.right.right.left" );
		ok( ( myQsRoot.left.left.right.left.trap == myQs.getTrapByIdx(2) ), "Poly#1: trap2 == root.left.left.right.left" );
		ok( ( myQsRoot.left.left.left.trap == myQs.getTrapByIdx(4) ), "Poly#1: trap4 == root.left.left.left" );

//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
	}


	function test_add_segment_polygon_2ccw() {
		// CCW-Ordering (Shapes)
		var myPolygonData = new PNLTRI.PolygonData( [ [
				{ x: 30, y: 40 }, { x: 20, y: 20 }, { x: 10, y: 15 }, { x: 60, y: 22 }
			] ] );
		var segListArray = myPolygonData.getSegments();

		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		//
		// Main Test
		//
		myQs.add_segment_consistently( segListArray[0], 'Poly#2ccw #1' );
		myQs.add_segment_consistently( segListArray[1], 'Poly#2ccw #2' );
		myQs.add_segment_consistently( segListArray[3], 'Poly#2ccw #3' );
		myQs.add_segment_consistently( segListArray[2], 'Poly#2ccw #4' );
		equal( myQs.nbTrapezoids(), 9, "Poly#2ccw: Number of Trapezoids" );

		myQs.check_trapezoid_neighbors(  0, null, null, 1, 7, "Poly#2ccw: neighbors trap0" );
		myQs.check_trapezoid_neighbors(  1, 0, null, 2, null, "Poly#2ccw: neighbors trap1" );
		myQs.check_trapezoid_neighbors(  2, 1, null, 4, null, "Poly#2ccw: neighbors trap2" );
		myQs.check_trapezoid_neighbors(  3, null, null, 6, null, "Poly#2ccw: neighbors trap3" );
		myQs.check_trapezoid_neighbors(  4, 2, 8, null, null, "Poly#2ccw: neighbors trap4" );
		myQs.check_trapezoid_neighbors(  5, null, 6, null, null, "Poly#2ccw: neighbors trap5" );
		myQs.check_trapezoid_neighbors(  6, 3, null, null, 5, "Poly#2ccw: neighbors trap6" );
		myQs.check_trapezoid_neighbors(  7, null, 0, null, 8, "Poly#2ccw: neighbors trap7" );
		myQs.check_trapezoid_neighbors(  8, null, 7, null, 4, "Poly#2ccw: neighbors trap8" );

//		var myQsRoot = myQs.getRoot();
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
	}


	function test_add_segment_polygon_2cw() {
		// CW-Ordering (Holes)
		var myPolygonData = new PNLTRI.PolygonData( [ [
				{ x: 10, y: 15 }, { x: 20, y: 20 }, { x: 30, y: 40 }, { x: 60, y: 22 }
				// segment_left, segment_top, segment_right, segment_bottom
			] ] );
		var segListArray = myPolygonData.getSegments();

		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		//
		// Main Test
		//
		myQs.add_segment_consistently( segListArray[0], 'Poly#2cw #1' );
		myQs.add_segment_consistently( segListArray[3], 'Poly#2cw #2' );
		myQs.add_segment_consistently( segListArray[2], 'Poly#2cw #3' );
		myQs.add_segment_consistently( segListArray[1], 'Poly#2cw #4' );
		equal( myQs.nbTrapezoids(), 9, "Poly#2cw: Number of Trapezoids" );

		myQs.check_trapezoid_neighbors(  0, null, null, 6, 7, "Poly#2cw: neighbors trap0" );
		myQs.check_trapezoid_neighbors(  1, 6, null, 2, null, "Poly#2cw: neighbors trap1" );
		myQs.check_trapezoid_neighbors(  2, 1, 5, null, null, "Poly#2cw: neighbors trap2" );
		myQs.check_trapezoid_neighbors(  3, null, 4, null, null, "Poly#2cw: neighbors trap3" );
		myQs.check_trapezoid_neighbors(  4, 8, null, null, 3, "Poly#2cw: neighbors trap4" );
		myQs.check_trapezoid_neighbors(  5, null, 7, null, 2, "Poly#2cw: neighbors trap5" );
		myQs.check_trapezoid_neighbors(  6, 0, null, 1, null, "Poly#2cw: neighbors trap6" );
		myQs.check_trapezoid_neighbors(  7, null, 0, null, 5, "Poly#2cw: neighbors trap7" );
		myQs.check_trapezoid_neighbors(  8, null, null, 4, null, "Poly#2cw: neighbors trap8" );

//		var myQsRoot = myQs.getRoot();
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
	}


	function test_add_segment_polygon_3nonmono() {
		// CCW-Ordering (Shapes)
		var myPolygonData = new PNLTRI.PolygonData( [ [
				{ x: 28, y: 33 }, { x: 20, y: 20 }, { x: 10, y: 10 }, { x: 60, y: 22 }, { x: 35, y: 40 }, { x: 26, y: 36 },
				{ x: 30, y: 45 }, { x: 15, y: 30 }, 
				// segment_lefttop, segment_leftbot, segment_bottom, segment_right, segment_indebot, segment_indetop,
				// segment_nosetop, segment_nosebot
			] ] );
		var segListArray = myPolygonData.getSegments();

		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		//
		// Main Test
		//
		myQs.add_segment_consistently( segListArray[0], 'Poly#3nonmono #1' );
		myQs.add_segment_consistently( segListArray[2], 'Poly#3nonmono #2' );
		myQs.add_segment_consistently( segListArray[7], 'Poly#3nonmono #3' );
		myQs.add_segment_consistently( segListArray[4], 'Poly#3nonmono #4' );
		myQs.add_segment_consistently( segListArray[3], 'Poly#3nonmono #5' );
		myQs.add_segment_consistently( segListArray[6], 'Poly#3nonmono #6' );
		myQs.add_segment_consistently( segListArray[1], 'Poly#3nonmono #7' );
		myQs.add_segment_consistently( segListArray[5], 'Poly#3nonmono #8' );
		equal( myQs.nbTrapezoids(), 17, "Poly#3nonmono: Number of Trapezoids" );

		myQs.check_trapezoid_neighbors(  0, null, null, 13, 16, "Poly#3nonmono: neighbors trap0" );
		myQs.check_trapezoid_neighbors(  1, 10, null, null, null, "Poly#3nonmono: neighbors trap1" );
		myQs.check_trapezoid_neighbors(  2, 7, null, 5, null, "Poly#3nonmono: neighbors trap2" );
		myQs.check_trapezoid_neighbors(  3, null, 10, 4, null, "Poly#3nonmono: neighbors trap3" );
		myQs.check_trapezoid_neighbors(  4, 3, null, null, 15, "Poly#3nonmono: neighbors trap4" );
		myQs.check_trapezoid_neighbors(  5, 2, 6, null, null, "Poly#3nonmono: neighbors trap5" );
		myQs.check_trapezoid_neighbors(  6, null, 12, null, 5, "Poly#3nonmono: neighbors trap6" );
		myQs.check_trapezoid_neighbors(  7, 13, 8, 2, null, "Poly#3nonmono: neighbors trap7" );
		myQs.check_trapezoid_neighbors(  8, null, null, null, 7, "Poly#3nonmono: neighbors trap8" );
		myQs.check_trapezoid_neighbors(  9, 16, null, null, null, "Poly#3nonmono: neighbors trap9" );
		myQs.check_trapezoid_neighbors( 10, 14, 11, 1, 3, "Poly#3nonmono: neighbors trap10" );
		myQs.check_trapezoid_neighbors( 11, null, null, null, 10, "Poly#3nonmono: neighbors trap11" );
		myQs.check_trapezoid_neighbors( 12, null, 16, null, 6, "Poly#3nonmono: neighbors trap12" );
		myQs.check_trapezoid_neighbors( 13, 0, null, 7, null, "Poly#3nonmono: neighbors trap13" );
		myQs.check_trapezoid_neighbors( 14, null, null, 10, null, "Poly#3nonmono: neighbors trap14" );
		myQs.check_trapezoid_neighbors( 15, null, 4, null, null, "Poly#3nonmono: neighbors trap15" );
		myQs.check_trapezoid_neighbors( 16, null, 0, 9, 12, "Poly#3nonmono: neighbors trap16" );

//		var myQsRoot = myQs.getRoot();
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
	}


	//
	//	Complex special cases, extracted from ERRORs
	//	 during trapezoidation of real world examples
	//

	function test_add_segment_special_1() {

		var myPolygonData = new PNLTRI.PolygonData( [ [
				{ x:1, y:1 }, { x:4, y:3 }, { x:6, y:2 }, { x:7, y:5 },
				{ x:5, y:6 }, { x:2, y:4 }, { x:1, y:7 },
			] ] );
		var segListArray = myPolygonData.getSegments();
//		showDataStructure( myPolygonData.getVertices(), [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
//		showDataStructure( myPolygonData.getSegments(), [ 'sprev', 'snext', 'mprev', 'mnext' ] );

		var myQs = new PNLTRI.QueryStructure( myPolygonData );

		myQs.add_segment_consistently( segListArray[0], 'Spec_1 #1' );
		myQs.add_segment_consistently( segListArray[2], 'Spec_1 #2' );
		myQs.add_segment_consistently( segListArray[4], 'Spec_1 #3' );
		// complex case concerning "only_one_trap_below"
		myQs.add_segment_consistently( segListArray[6], 'Spec_1 Main' );
		equal( myQs.nbTrapezoids(), 12, "Spec_1: Number of Trapezoids" );

		myQs.check_trapezoid_neighbors(  0, null, null, 10, 11, "Spec_1: neighbors trap0" );
		myQs.check_trapezoid_neighbors(  1, 8, null, null, null, "Spec_1: neighbors trap1" );
		myQs.check_trapezoid_neighbors(  2, 10, 5, null, null, "Spec_1: neighbors trap2" );
		myQs.check_trapezoid_neighbors(  3, null, 8, 5, null, "Spec_1: neighbors trap3" );
		myQs.check_trapezoid_neighbors(  4, 9, null, null, 8, "Spec_1: neighbors trap4" );
		myQs.check_trapezoid_neighbors(  5, 3, 6, null, 2, "Spec_1: neighbors trap5" );
		myQs.check_trapezoid_neighbors(  6, null, 9, null, 5, "Spec_1: neighbors trap6" );
		myQs.check_trapezoid_neighbors(  7, 11, null, 8, null, "Spec_1: neighbors trap7" );
		myQs.check_trapezoid_neighbors(  8, 7, 4, 1, 3, "Spec_1: neighbors trap8" );
		myQs.check_trapezoid_neighbors(  9, null, 11, 4, 6, "Spec_1: neighbors trap9" );
		myQs.check_trapezoid_neighbors( 10, 0, null, 2, null, "Spec_1: neighbors trap10" );
		myQs.check_trapezoid_neighbors( 11, null, 0, 7, 9, "Spec_1: neighbors trap11" );

//		var myQsRoot = myQs.getRoot();
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot, false, 5 );
	}

	function test_add_segment_special_2() {

		var myPolygonData = new PNLTRI.PolygonData( [ [
			{ x:1, y:1 }, { x:5, y:5.1 }, { x:6, y:8 }, { x:4, y:6 },
			{ x:2, y:3 }, { x:1, y:5 },
			] ] );
		var segListArray = myPolygonData.getSegments();
//		showDataStructure( myPolygonData.getVertices(), [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
//		showDataStructure( myPolygonData.getSegments(), [ 'sprev', 'snext', 'mprev', 'mnext' ] );
		//
		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		//
		myQs.add_segment_consistently( segListArray[0], 'Spec_2 #1' );
		myQs.add_segment_consistently( segListArray[1], 'Spec_2 #2' );
		myQs.add_segment_consistently( segListArray[5], 'Spec_2 #3' );
		// complex case: extending first on the left then right
		myQs.add_segment_consistently( segListArray[3], 'Spec_2 Main' );
		//
		myQs.add_segment_consistently( segListArray[2], 'Spec_2 #4' );
		myQs.add_segment_consistently( segListArray[4], 'Spec_2 #5' );
		equal( myQs.nbTrapezoids(), 13, "Spec_2: Number of Trapezoids" );
		//
//		var myQsRoot = myQs.getRoot();
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot, false, 5 );
	}

	function test_add_segment_special_3() {

		var myPolygonData = new PNLTRI.PolygonData( [ [
			{ x: 19.3395, y: 7.15 }, { x: 19.228, y: 7.150000000000001 },
			{ x: 5.03, y: 6.9715 }, { x: 5.17, y: 6.046 },
			] ] );
		var segListArray = myPolygonData.getSegments();
//		showDataStructure( myPolygonData.getVertices(), [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
//		showDataStructure( myPolygonData.getSegments(), [ 'sprev', 'snext', 'mprev', 'mnext' ] );
		//
		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		//
		myQs.add_segment_consistently( segListArray[2], 'Spec_3 #1' );
		// complex case: 3.Segment goes upwards and downwards => always use EPSILON
		myQs.add_segment_consistently( segListArray[0], 'Spec_3 Main' );
		equal( myQs.nbTrapezoids(), 7, "Spec_3: Number of Trapezoids" );

		myQs.check_trapezoid_neighbors(  0, null, null, 4, 6, "Spec_3: neighbors trap0" );
		myQs.check_trapezoid_neighbors(  1, 5, null, 2, null, "Spec_3: neighbors trap1" );
		myQs.check_trapezoid_neighbors(  2, 1, 3, null, null, "Spec_3: neighbors trap2" );
		myQs.check_trapezoid_neighbors(  3, null, 5, null, 2, "Spec_3: neighbors trap3" );
		myQs.check_trapezoid_neighbors(  4, 0, null, 5, null, "Spec_3: neighbors trap4" );
		myQs.check_trapezoid_neighbors(  5, 4, 6, 1, 3, "Spec_3: neighbors trap5" );
		myQs.check_trapezoid_neighbors(  6, null, 0, null, 5, "Spec_3: neighbors trap6" );

//		var myQsRoot = myQs.getRoot();
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot, false, 2 );
	}

	function test_add_segment_special_4() {			// TODO: test all mirrored cases !!!
													//	if going back co-linear direction
													//	should be checked with the preceding segment
													// ATTENTION: this needs to be looped since the
													//	preceeding segment can also be co-linear ...

		var testPolygon = [ [
			{ x: 2, y: 1 },
			{ x: 1, y: 3 }, { x: 1, y: 2 }, { x: 1, y: 4 },		// goes back on same x-line
			{ x: 0, y: 0 },
			] ];
		//
		//	Test A
		var myPolygonData = new PNLTRI.PolygonData( testPolygon );
		var segListArray = myPolygonData.getSegments();
//		showDataStructure( myPolygonData.getVertices(), [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
//		showDataStructure( myPolygonData.getSegments(), [ 'sprev', 'snext', 'mprev', 'mnext' ] );

		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		var myQsRoot = myQs.getRoot();

		myQs.add_segment_consistently( segListArray[0], 'Spec_4a #1' );
		myQs.add_segment_consistently( segListArray[1], 'Spec_4a #2' );
		myQs.check_trapezoid_neighbors(  0, null, null, 1, 3, "Spec_4a #2, trap0" );
		myQs.check_trapezoid_neighbors(  1, 0, null, 4, null, "Spec_4a #2, trap1" );
		myQs.check_trapezoid_neighbors(  2, 4, 3, null, null, "Spec_4a #2, trap2" );
		myQs.check_trapezoid_neighbors(  3, null, 0, null, 2, "Spec_4a #2, trap3" );
		myQs.check_trapezoid_neighbors(  4, 1, 5, 2, null, "Spec_4a #2, trap4" );
		myQs.check_trapezoid_neighbors(  5, null, null, null, 4, "Spec_4a #2, trap5" );
		// complex case: goes back on same x-line
		myQs.add_segment_consistently( segListArray[2], 'Spec_4a Main' );
		equal( myQs.nbTrapezoids(), 8, "Spec_4a: Number of Trapezoids" );

//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot, false, 10 );
		//
		//	Test B
		myPolygonData = new PNLTRI.PolygonData( testPolygon );
		segListArray = myPolygonData.getSegments();

		myQs = new PNLTRI.QueryStructure( myPolygonData );
		myQsRoot = myQs.getRoot();

		myQs.add_segment_consistently( segListArray[2], 'Spec_4b #1' );
		myQs.add_segment_consistently( segListArray[1], 'Spec_4b #2' );
		myQs.check_trapezoid_neighbors(  0, null, null, 1, 3, "Spec_4b #2, trap0" );
		myQs.check_trapezoid_neighbors(  1, 0, null, 2, null, "Spec_4b #2, trap1" );
		myQs.check_trapezoid_neighbors(  2, 1, 5, null, null, "Spec_4b #2, trap2" );
		myQs.check_trapezoid_neighbors(  3, null, 0, 4, 5, "Spec_4b #2, trap3" );
		myQs.check_trapezoid_neighbors(  4, 3, null, null, null, "Spec_4b #2, trap4" );
		myQs.check_trapezoid_neighbors(  5, null, 3, null, 2, "Spec_4b #2, trap5" );
		// complex case: attaching to the middle point of two co-linear segments
		myQs.add_segment_consistently( segListArray[0], 'Spec_4b Main' );
		equal( myQs.nbTrapezoids(), 8, "Spec_4b: Number of Trapezoids" );
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot, false, 10 );
	}

	function test_add_segment_special_5() {

		var myPolygonData = new PNLTRI.PolygonData( [ [
			{ x: 105, y: 100.4 },
			{ x: 104, y: 100.39999999999998 },
			{ x: 103, y: 100.40000000000003 },
			{ x: 102, y: 100.4 },
			{ x: 101, y: 100.40000000000002 },
			] ] );
		var segListArray = myPolygonData.getSegments();
//		showDataStructure( myPolygonData.getVertices(), [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
//		showDataStructure( myPolygonData.getSegments(), [ 'sprev', 'snext', 'mprev', 'mnext' ] );
		//
		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		//
		myQs.add_segment_consistently( segListArray[0], 'Spec_5 #1' );
		myQs.add_segment_consistently( segListArray[1], 'Spec_5 #2' );
		// complex case: EPSILON > rounding effect on coordinates
		myQs.add_segment_consistently( segListArray[3], 'Spec_5 Main' );
		equal( myQs.nbTrapezoids(), 9, "Spec_5: Number of Trapezoids" );

		myQs.check_trapezoid_neighbors(  0, null, null, 1, 3, "Spec_5: neighbors trap0" );
		myQs.check_trapezoid_neighbors(  1, 0, null, 2, null, "Spec_5: neighbors trap1" );
		myQs.check_trapezoid_neighbors(  2, 1, null, 4, null, "Spec_5: neighbors trap2" );
		myQs.check_trapezoid_neighbors(  3, null, 0, null, 5, "Spec_5: neighbors trap3" );
		myQs.check_trapezoid_neighbors(  4, 2, 5, 6, 8, "Spec_5: neighbors trap4" );
		myQs.check_trapezoid_neighbors(  5, null, 3, null, 4, "Spec_5: neighbors trap5" );
		myQs.check_trapezoid_neighbors(  6, 4, null, 7, null, "Spec_5: neighbors trap6" );
		myQs.check_trapezoid_neighbors(  7, 6, 8, null, null, "Spec_5: neighbors trap7" );
		myQs.check_trapezoid_neighbors(  8, null, 4, null, 7, "Spec_5: neighbors trap8" );

//		var myQsRoot = myQs.getRoot();
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot, false, 0.4 );
	}

	function test_add_segment_special_6() {

		var myPolygonData = new PNLTRI.PolygonData( [ [
			{ x:43, y:31 }, { x:41, y:29 },
			{ x:42, y:40 }, { x:36, y:24 },
			{ x:34, y:16 }, { x:23, y:34 },
			{ x: 8, y:32 }, { x: 1, y:28 },
			{ x:14, y:38 }, { x:10, y: 6 },
			{ x:63, y:26 }, { x:58, y:18 },
			] ] );
		var segListArray = myPolygonData.getSegments().concat();
//		showDataStructure( myPolygonData.getVertices(), [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
//		showDataStructure( myPolygonData.getSegments(), [ 'sprev', 'snext', 'mprev', 'mnext' ] );
		//
		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		var myQsRoot = myQs.getRoot();
		//
		myQs.add_segment_consistently( segListArray[ 0], 'Spec_6 #1' );
		myQs.add_segment_consistently( segListArray[10], 'Spec_6 #2' );
		myQs.add_segment_consistently( segListArray[ 6], 'Spec_6 #3' );
		myQs.add_segment_consistently( segListArray[ 8], 'Spec_6 #4' );
		myQs.add_segment_consistently( segListArray[ 2], 'Spec_6 #5' );
		// endless loop, if in only_one_trap_below.1B_1UN_END inTrNext.uL and trNewLeft is not set
		myQs.add_segment_consistently( segListArray[ 4], 'Spec_6 Main' );
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot, false, 1 );
	}


	// temporary method to test polygons-chains before adding them
	//  to the PolygonTestdata
	function test_add_segment_NEW() {

//		var	testData = new PolygonTestdata();
//		var myPolygonData = new PNLTRI.PolygonData( testData.get_polygon_with_holes( "three_error#3" ) );

		var myPolygonData = new PNLTRI.PolygonData( [ [
			{ x: 16.5, y: 30 }, { x: 10, y: 23.5 }, { x: 15, y: 20 },
			{ x: 10, y: 16.5 }, { x: 22.5, y: 10 }, { x: 30, y: 16.5 },
			{ x: 25, y: 20 }, { x: 30, y: 23.5 },
			] ] );
		console.log("add_segment_NEW: Number of Segments: ", myPolygonData.nbSegments() );
//		showDataStructure( myPolygonData.getVertices(), [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
//		showDataStructure( myPolygonData.getSegments(), [ 'sprev', 'snext', 'mprev', 'mnext' ] );
		//
		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		var myQsRoot = myQs.getRoot();
		var segListArray = myPolygonData.getSegments().concat();
		//
/*		PNLTRI.Math.myRandom( 1 );			// set specific random seed for finding random errors
		PNLTRI.Math.random = PNLTRI.Math.myRandom;	*/
/*		PNLTRI.Math.randomTestSetup();		// set specific random seed for repeatable testing
		PNLTRI.Math.array_shuffle( segListArray );
//		showDataStructure( segListArray, [ 'sprev', 'snext', 'mprev', 'mnext' ] );		*/
/*		var idxList = [ 27, 60, 32, 40, 64, 44, 57, 45, 30, 85, 22, 29, ];
//		myPolygonData.map_segments_and_vertices( segListArray, idxList );
		segListArray = idxList.map( function (val) { return segListArray[val] } );		*/
		//
		for (var i=0; i<segListArray.length; i++) {
			myQs.add_segment_consistently( segListArray[i], 'New#'+i );
/*			var info = document.createElement( 'div' );
			info.innerHTML = i;
			document.body.appendChild( info );
			drawTrapezoids( myQsRoot, false, 1 );		*/
		}
		ok( myPolygonData.allSegsInQueryStructure(), "add_segment_NEW: all segments inserted" );
		console.log("add_segment_NEW: Number of Trapezoids: ", myQs.nbTrapezoids() );
		myQs.assignDepths(myPolygonData);			// marks outside trapezoids
		equal( myQs.minDepth(), -1, "add_segment_NEW: Min depth == -1 (closed polygon)" );
		//
//		showDataStructure( myQsRoot );
		drawTrapezoids( myQsRoot, false, 1 );
	}


	test( "QueryStructure", function() {
		test_is_left_of();
		//
		test_init_query_structure_up();
		test_init_query_structure_down();
		test_splitNodeAtPoint1();
		test_splitNodeAtPoint2();
		//
		test_ptNode();
		test_ptNode_touching();
		test_ptNode_colinear_1();
		test_ptNode_colinear_2();
		//
		test_assign_depths();
		//
		// 2 unconnected segments
		test_add_segment_basic_1();
		test_add_segment_basic_2();
		test_add_segment_basic_3();
		test_add_segment_basic_4();
		// touching segments
		test_add_segment_touching_1();
//		test_add_segment_touching_2();
		// polygons
		test_add_segment_polygon_1();
		test_add_segment_polygon_2ccw();
		test_add_segment_polygon_2cw();
		test_add_segment_polygon_3nonmono();
		// special segment constellations
		test_add_segment_special_1();
		test_add_segment_special_2();
		test_add_segment_special_3();
		test_add_segment_special_4();
		test_add_segment_special_5();
		test_add_segment_special_6();
		// for testing new polygons
//		test_add_segment_NEW();
//		test_add_segment_Error();
	});
}


/*==============================================================================
 *
 *============================================================================*/


/*	Base class extensions - for testing only */

PNLTRI.Trapezoider.prototype.getQsRoot = function () {
	return	this.queryStructure.getRoot();
};
PNLTRI.Trapezoider.prototype.nbTrapezoids = function () {
	return	this.queryStructure.nbTrapezoids();
};
PNLTRI.Trapezoider.prototype.minDepth = function () {
	return	this.queryStructure.minDepth();
};
PNLTRI.Trapezoider.prototype.maxDepth = function () {
	return	this.queryStructure.maxDepth();
};
PNLTRI.Trapezoider.prototype.check_trapezoid_neighbors = function ( inTrapId, inChkU0, inChkU1, inChkD0, inChkD1, inTestName ) {
	return	this.queryStructure.check_trapezoid_neighbors( inTrapId, inChkU0, inChkU1, inChkD0, inChkD1, inTestName );
};
//
//	The CENTRAL method for the near-linear performance	!!!
//	Was inlined into trapezoide_polygon for performance.
//
PNLTRI.Trapezoider.prototype.math_logstar_stops = function ( inNbSegs ) {
	var logStarSections = [ 0 ];

	var idx, logstar;
	for ( idx = 1, logstar = inNbSegs; logstar > 1; idx++ ) {
		logstar = Math.log(logstar)/Math.LN2;		// == log2(logstar)
		logStarSections[idx] = ( logstar > 1 ) ? Math.floor( inNbSegs / logstar ) : inNbSegs;
	}

//	console.log( "GesamtListe: ", logStarSections.join(", ") );
	return	logStarSections;
};


function test_Trapezoider() {

	var	testData = new PolygonTestdata();


	function test_math_logstar_stops() {
		var trap = new PNLTRI.Trapezoider();
		//
		deepEqual( trap.math_logstar_stops(      6 ), [ 0, 2, 4, 6 ], "math_logstar_stops: 6" );
		deepEqual( trap.math_logstar_stops(     16 ), [ 0, 4, 8, 16 ], "math_logstar_stops: 16" );
		deepEqual( trap.math_logstar_stops(     17 ), [ 0, 4, 8, 16, 17 ], "math_logstar_stops: 17" );
		deepEqual( trap.math_logstar_stops(    314 ), [ 0, 37, 102, 195, 314 ], "math_logstar_stops: 314" );
		deepEqual( trap.math_logstar_stops(   6404 ), [ 0, 506, 1749, 3420, 6404 ], "math_logstar_stops: 6404" );
		deepEqual( trap.math_logstar_stops( 100000 ), [ 0, 6020, 24667, 49521, 98631, 100000 ], "math_logstar_stops: 100000" );
		//
		// "0, 2, 4, 7", "0, 2, 5, 8", "0, 3, 5, 10", "0, 3, 6, 12", "0, 3, 6, 13", "0, 3, 7, 15"
		// "0, 4, 8, 17, 18", "0, 4, 9, 17, 19", "0, 4, 9, 18, 20", "0, 4, 9, 19, 21"
		// "0, 5, 11, 22, 26", "0, 5, 12, 23, 28", "0, 6, 13, 25, 31", "0, 7, 16, 30, 39"
		// "0, 7, 16, 31, 40", "0, 8, 20, 38, 51", "0, 13, 33, 63, 91", "0, 14, 34, 64, 92"
		// "0, 15, 37, 70, 102", "0, 92, 274, 525, 904"
	}


	function test_optimise_randomlist() {
		PNLTRI.Math.randomTestSetup();		// set specific random seed for repeatable testing
		//
		var myPolygonData = new PNLTRI.PolygonData( testData.get_polygon_with_holes( "square_3triangholes" ) );
		var myTrapezoider = new PNLTRI.Trapezoider( myPolygonData );
		//
		// Main Test
		//
		var myQs = myTrapezoider.queryStructure;				// TODO
		var randSegListArray = myPolygonData.getSegments().concat();
		PNLTRI.Math.array_shuffle( randSegListArray );				// "10, 4, 3, 11, 8, 5, 12, 1, 7, 2, 0, 9, 6"
//		console.log( "Old Random Segment Sequence: ", dumpRandomSequence( randSegListArray ) );
		myTrapezoider.optimise_randomlist( randSegListArray );		// "10, 4, 3, 8, 11, 5, 12, 1, 7, 2, 0, 9, 6"
//		console.log( "New Random Segment Sequence: ", dumpRandomSequence( randSegListArray ) );
		var expectedSequence = [10, 4, 3, 8, 11, 5, 12, 1, 7, 2, 0, 9, 6];
		equal( randSegListArray.length, expectedSequence.length, "optimise_randomlist: new sequence length" );
		var	expectedSequenceOK = true;
		for (var i=0; i<expectedSequence.length; i++) {
			expectedSequenceOK &= ( randSegListArray[i].vFrom.id == expectedSequence[i] );
		}
		ok( expectedSequenceOK, "optimise_randomlist: new sequence elements" );
	}


	function test_trapezoide_polygon_structure() {
		PNLTRI.Math.randomTestSetup();		// set specific random seed for repeatable testing
		//
		var inPolygonChainList = testData.get_polygon_with_holes("article_poly");		// from article [Sei91]
		//
		var myPolygonData = new PNLTRI.PolygonData( inPolygonChainList );
//		showDataStructure( myPolygonData.getVertices(), [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
		//
		var myTrapezoider = new PNLTRI.Trapezoider( myPolygonData );
		myTrapezoider.trapezoide_polygon();
		ok( myPolygonData.allSegsInQueryStructure(), "trapezoide_polygon_structure: all segments inserted" );
		equal( myTrapezoider.nbTrapezoids(), 41, "trapezoide_polygon_structure: Number of generated Trapezoids" );
		//
		myTrapezoider.check_trapezoid_neighbors(  0, null, null, 13, 36, "trapezoide_polygon_structure #0" );
		myTrapezoider.check_trapezoid_neighbors(  1, 7, null, null, null, "trapezoide_polygon_structure #1" );
		myTrapezoider.check_trapezoid_neighbors(  2, 25, 3, 8, null, "trapezoide_polygon_structure #2" );
		myTrapezoider.check_trapezoid_neighbors(  3, null, null, null, 2, "trapezoide_polygon_structure #3" );
		myTrapezoider.check_trapezoid_neighbors(  4, 30, null, null, 29, "trapezoide_polygon_structure #4" );
		myTrapezoider.check_trapezoid_neighbors(  5, 37, null, 16, 24, "trapezoide_polygon_structure #5" );
		myTrapezoider.check_trapezoid_neighbors(  6, null, 40, null, 27, "trapezoide_polygon_structure #6" );
		myTrapezoider.check_trapezoid_neighbors(  7, 29, null, 1, 38, "trapezoide_polygon_structure #7" );
		myTrapezoider.check_trapezoid_neighbors(  8, 2, 17, null, null, "trapezoide_polygon_structure #8" );
		myTrapezoider.check_trapezoid_neighbors(  9, null, null, 21, null, "trapezoide_polygon_structure #9" );
		myTrapezoider.check_trapezoid_neighbors( 10, 36, null, null, null, "trapezoide_polygon_structure #10" );
		myTrapezoider.check_trapezoid_neighbors( 11, 39, null, null, 30, "trapezoide_polygon_structure #11" );
		myTrapezoider.check_trapezoid_neighbors( 12, null, 36, null, 40, "trapezoide_polygon_structure #12" );
		myTrapezoider.check_trapezoid_neighbors( 13, 0, null, 14, null, "trapezoide_polygon_structure #13" );
		myTrapezoider.check_trapezoid_neighbors( 14, 13, null, 19, null, "trapezoide_polygon_structure #14" );
		myTrapezoider.check_trapezoid_neighbors( 15, null, null, null, 20, "trapezoide_polygon_structure #15" );
		myTrapezoider.check_trapezoid_neighbors( 16, 5, null, null, 22, "trapezoide_polygon_structure #16" );
		myTrapezoider.check_trapezoid_neighbors( 17, 21, 23, null, 8, "trapezoide_polygon_structure #17" );
		myTrapezoider.check_trapezoid_neighbors( 18, null, null, 23, null, "trapezoide_polygon_structure #18" );
		myTrapezoider.check_trapezoid_neighbors( 19, 14, null, 25, 34, "trapezoide_polygon_structure #19" );
		myTrapezoider.check_trapezoid_neighbors( 20, null, 15, 31, null, "trapezoide_polygon_structure #20" );
		myTrapezoider.check_trapezoid_neighbors( 21, 9, null, 17, null, "trapezoide_polygon_structure #21" );
		myTrapezoider.check_trapezoid_neighbors( 22, null, 16, null, null, "trapezoide_polygon_structure #22" );
		myTrapezoider.check_trapezoid_neighbors( 23, 18, 27, null, 17, "trapezoide_polygon_structure #23" );
		myTrapezoider.check_trapezoid_neighbors( 24, null, 5, null, null, "trapezoide_polygon_structure #24" );
		myTrapezoider.check_trapezoid_neighbors( 25, 19, null, 2, null, "trapezoide_polygon_structure #25" );
		myTrapezoider.check_trapezoid_neighbors( 26, null, null, 33, null, "trapezoide_polygon_structure #26" );
		myTrapezoider.check_trapezoid_neighbors( 27, null, 6, null, 23, "trapezoide_polygon_structure #27" );
		myTrapezoider.check_trapezoid_neighbors( 28, 34, null, null, 35, "trapezoide_polygon_structure #28" );
		myTrapezoider.check_trapezoid_neighbors( 29, 33, 4, 7, 37, "trapezoide_polygon_structure #29" );
		myTrapezoider.check_trapezoid_neighbors( 30, null, 11, 4, null, "trapezoide_polygon_structure #30" );
		myTrapezoider.check_trapezoid_neighbors( 31, 20, 32, null, 39, "trapezoide_polygon_structure #31" );
		myTrapezoider.check_trapezoid_neighbors( 32, null, null, null, 31, "trapezoide_polygon_structure #32" );
		myTrapezoider.check_trapezoid_neighbors( 33, 26, null, 29, null, "trapezoide_polygon_structure #33" );
		myTrapezoider.check_trapezoid_neighbors( 34, null, 19, 28, null, "trapezoide_polygon_structure #34" );
		myTrapezoider.check_trapezoid_neighbors( 35, null, 28, null, null, "trapezoide_polygon_structure #35" );
		myTrapezoider.check_trapezoid_neighbors( 36, null, 0, 10, 12, "trapezoide_polygon_structure #36" );
		myTrapezoider.check_trapezoid_neighbors( 37, null, 29, 5, null, "trapezoide_polygon_structure #37" );
		myTrapezoider.check_trapezoid_neighbors( 38, null, 7, null, null, "trapezoide_polygon_structure #38" );
		myTrapezoider.check_trapezoid_neighbors( 39, null, 31, 11, null, "trapezoide_polygon_structure #39" );
		myTrapezoider.check_trapezoid_neighbors( 40, null, 12, null, 6, "trapezoide_polygon_structure #40" );
		//
		//
//		var myQsRoot = myTrapezoider.getQsRoot();
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot, false, 1.5 );
	}


	function test_trapezoide_polygon( inDataName,	inExpectedSegs, inExpectedTraps, inExpectedStartTrap,
													inExpectedMaxDepth, inPolyLeftArr, inDebug ) {
		PNLTRI.Math.randomTestSetup();		// set specific random seed for repeatable testing
		//
		var myPolygonData = new PNLTRI.PolygonData( testData.get_polygon_with_holes( inDataName ) );
		equal( myPolygonData.nbSegments(), inExpectedSegs, "trapezoide_polygon ("+inDataName+"): originalSize" );
		if ( inDebug > 0 ) {
//			showDataStructure( myPolygonData.getSegments(), [ 'sprev', 'snext', 'mprev', 'mnext' ] );
		}
		//
		// Main Test
		//
		var myTrapezoider = new PNLTRI.Trapezoider( myPolygonData );
		myTrapezoider.trapezoide_polygon();
		var buglist = [];
		//
		ok( myPolygonData.allSegsInQueryStructure(), "trapezoide_polygon ("+inDataName+"): all segments inserted" );
		equal( myTrapezoider.nbTrapezoids(), inExpectedTraps, "trapezoide_polygon ("+inDataName+"): Number of generated Trapezoids" );
		equal( myTrapezoider.minDepth(), 0, "trapezoide_polygon ("+inDataName+"): depths assigned to all" );
		equal( myTrapezoider.maxDepth(), inExpectedMaxDepth, "trapezoide_polygon ("+inDataName+"): Max depth" );
		//
		if ( buglist = myPolygonData.check_segments_consistency() )
			ok( !buglist, "trapezoide_polygon ("+inDataName+") segment consistency: " + buglist.join(", ") );
		//
		if ( inPolyLeftArr ) {
			deepEqual( myPolygonData.get_PolyLeftArr(), inPolyLeftArr, "trapezoide_polygon ("+inDataName+"): PolyLeftArr OK?" );
		}
		//
		var startTrap = myTrapezoider.find_first_inside();
		if ( startTrap ) {
			equal( startTrap.trapID, inExpectedStartTrap, "trapezoide_polygon ("+inDataName+"): Start-Trap-ID" );
		} else {
			ok( false, "trapezoide_polygon ("+inDataName+"): Start-Trap found" );
		}
		//
		if ( inDebug > 0 ) {
			drawTrapezoids( startTrap.sink, false, inDebug );
			var myQsRoot = myTrapezoider.getQsRoot();
//			showDataStructure( myQsRoot );
//			drawTrapezoids( myQsRoot, true, inDebug );
			drawTrapezoids( myQsRoot, false, inDebug );
		}
	}


	test( "Trapezoider for (Simple) Polygons", function() {
		test_math_logstar_stops();
		test_optimise_randomlist();
		//
		test_trapezoide_polygon_structure();	// detailed trapezoid structure
		//
		test_trapezoide_polygon( "article_poly", 20, 41, 1, 1, [ true ], 0 );		// 1.5: from article [Sei91]
		test_trapezoide_polygon( "square_3triangholes", 13, 27, 19, 2, [ true, true, true, true ], 0 );	// 5; from	"Narkhede A. and Manocha D.", data_1
		test_trapezoide_polygon( "trap_2up_2down", 6, 13, 3, 1, [ true ], 0 );		// 4: trapezoid with 2 upper and 2 lower neighbors
		test_trapezoide_polygon( "pt_3_diag_max", 7, 15, 10, 1, [ true ], 0 );		// 4: vertex (6,6) with 3 additional diagonals (max)
		test_trapezoide_polygon( "xy_bad_saw", 39, 79, 14, 1, [ true ], 0 );		// 2: very inconvenient contour in X- and Y-direction
		//
		test_trapezoide_polygon( "hole_short_path", 10, 21, 6, 2, [ false, false ], 0 );	// 0.8; shortest path to hole is outside polygon
		//
		test_trapezoide_polygon( "three_error#1", 92, 185, 27, 1, [ false ], 0 );		// 1; 1.Error, integrating into Three.js (letter "t")
		test_trapezoide_polygon( "three_error#2", 51, 103, 5, 1, [ false ], 0 );		// 0.7; 2.Error, integrating into Three.js (letter "1")
		test_trapezoide_polygon( "three_error#3", 91, 183, 41, 1, [ false ], 0 );		// 3000; 3.Error, integrating into Three.js (logbuffer)
		test_trapezoide_polygon( "three_error#4", 102, 205, 15, 1, [ true ], 0 );		// 1; 4.Error, integrating into Three.js (USA Maine)
		test_trapezoide_polygon( "three_error#4b", 102, 205, 6, 1, [ false ], 0 );		// 0.04; 4.Error, integrating into Three.js (USA Maine)
		test_trapezoide_polygon( "hole_first", 19, 39, 13, 2, [ false, false ], 0 );	// 0.5; 5.Error, integrating into Three.js ("R")
		test_trapezoide_polygon( "two_polygons#1", 20, 41, 3, 1, [ true, false ], 0 );	// 0.5; 6.Error, integrating into Three.js ("i")
		test_trapezoide_polygon( "two_polygons#2", 6, 13, 3, 1, [ true, false ], 0 );	// 1; my#6: two trivial polygons
		test_trapezoide_polygon( "polygons_inside_hole", 19, 39, 7, 3, [ true, true, true, false ], 0 );	// 0.7; my#7: square with unregular hole with two polygons inside
		//
//		console.perform();
		test_trapezoide_polygon( "squares_perftest_mid", 904, 1809, 399, 2, null, 0 );	// 1: 15x15 Squares in Squares Performance Test
//		console.performEnd();
	});
}



function compute_Trapezoider( inResultTarget ) {
		var myPolygonData = new PNLTRI.PolygonData( [ [
			{ x:10, y:35 }, { x:15, y: 5 },	{ x:22, y:15 },
			{ x:25, y:10 }, { x:35, y:30 },	{ x:20, y:25 },
			] ] );
		//
		var myTrapezoider = new PNLTRI.Trapezoider( myPolygonData );
		myTrapezoider.trapezoide_polygon();
		//
		var myQsRoot = myTrapezoider.getQsRoot();
//		showDataStructure( myQsRoot );
		drawTrapezoids( myQsRoot, false, 1 );
}

