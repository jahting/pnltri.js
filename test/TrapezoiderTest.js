/**
 * @author jahting / http://www.ameco.tv/
 */


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

	/*    
	 *                0
	 *   -----------------------------------
	 *  		    /
	 *  	1	   /        3
	 *  		  /
	 *   -----------------------------------
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

	/*    
	 *                0
	 *   -----------------------------------
	 *  		  \
	 *  	1	   \        3
	 *  		    \
	 *   -----------------------------------
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

	/*    
	 *                0
	 *   -----------------------------------
	 *  		  \
	 *  	1	   \        3
	 *  		    \
	 *   -----------------------------------
	 *                2
	 */
	function test_trap_splitOffLower() {
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
		ok( base_segment.is_inserted, "trap_splitOffLower: Segment inserted" );
		//	check Trapezoid-Neighborhood
		myQs.check_trapezoid_neighbors(  0, null, null, 1, 3, "trap_splitOffLower: top" );
		myQs.check_trapezoid_neighbors(  1, 0, null, 2, null, "trap_splitOffLower: left" );
		myQs.check_trapezoid_neighbors(  2, 1, 3, null, null, "trap_splitOffLower: bottom" );
		myQs.check_trapezoid_neighbors(  3, null, 0, null, 2, "trap_splitOffLower: right" );
		// get existing Trapezoids
		var tr0 = myQs.getTrapByIdx(0);
		var tr1 = myQs.getTrapByIdx(1);
		var tr2 = myQs.getTrapByIdx(2);
		var tr3 = myQs.getTrapByIdx(3);
		//
		//	Test: split tr0
		var tr0org_vH = tr0.vHigh;		// save original values
		var tr0org_vL = tr0.vLow;
		var tr0org_dL = tr0.dL;
		var tr0org_dR = tr0.dR;
		var splitPt4 = { x: 2 , y: 5 };
		var tr0b = tr0.splitOffLower( splitPt4 );
		strictEqual( tr0.lseg, tr0b.lseg, "trap_splitOffLower: lseg unchanged" );
		strictEqual( tr0.rseg, tr0b.rseg, "trap_splitOffLower: rseg unchanged" );
		strictEqual( tr0.vHigh, tr0org_vH, "trap_splitOffLower: tr0.vHigh unchanged" );
		strictEqual( tr0.vLow, splitPt4, "trap_splitOffLower: tr0.vLow == splitPt4" );
		strictEqual( tr0b.vHigh, splitPt4, "trap_splitOffLower: tr0b.vHigh == splitPt4" );
		strictEqual( tr0b.vLow, tr0org_vL, "trap_splitOffLower: tr0b.vLow unchanged" );
		//
		strictEqual( tr0.sink, tr0b.sink, "trap_splitOffLower: sink equal" );
		ok( !tr0b.usave, "trap_splitOffLower: tr0b.usave null" );
		ok( !tr0b.uleft, "trap_splitOffLower: tr0b.uleft null" );
		//
		ok( !tr0.uL, "trap_splitOffLower: tr0.uL unchanged" );
		ok( !tr0.uR, "trap_splitOffLower: tr0.uR unchanged" );
		strictEqual( tr0.dL, tr0b, "trap_splitOffLower: tr0.dL == tr0b" );		// L/R undef -> default L
		ok( !tr0.dR, "trap_splitOffLower: tr0.dR null" );
		//
		strictEqual( tr0b.uL, tr0, "trap_splitOffLower: tr0b.uL == tr0" );		// L/R undef -> default L
		ok( !tr0b.uR, "trap_splitOffLower: tr0.uR null" );
		strictEqual( tr0b.dL, tr0org_dL, "trap_splitOffLower: tr0b.dL == tr0org_dL" );
		strictEqual( tr0b.dR, tr0org_dR, "trap_splitOffLower: tr0b.dR == tr0org_dR" );
		//
		ok( ( tr0org_dL.uL == tr0b ), "trap_splitOffLower: tr0org_dL.uL == tr0b" );
		ok( ( tr0org_dR.uR == tr0b ), "trap_splitOffLower: tr0org_dR.uR == tr0b" );
		//
		//	Test: split tr1
		var tr1org_uL = tr1.uL;		// save original values
		var tr1org_vH = tr1.vHigh;
		var tr1org_vL = tr1.vLow;
		var tr1org_dL = tr1.dL;
		var splitPt1 = { x: 2 , y: 2 };
		var tr1b = tr1.splitOffLower( splitPt1 );
		strictEqual( tr1.lseg, tr1b.lseg, "trap_splitOffLower: lseg unchanged" );
		strictEqual( tr1.rseg, tr1b.rseg, "trap_splitOffLower: rseg unchanged" );
		strictEqual( tr1.vHigh, tr1org_vH, "trap_splitOffLower: tr1.vHigh unchanged" );
		strictEqual( tr1.vLow, splitPt1, "trap_splitOffLower: tr1.vLow == splitPt1" );
		strictEqual( tr1b.vHigh, splitPt1, "trap_splitOffLower: tr1b.vHigh == splitPt1" );
		strictEqual( tr1b.vLow, tr1org_vL, "trap_splitOffLower: tr1b.vLow unchanged" );
		//
		strictEqual( tr1.sink, tr1b.sink, "trap_splitOffLower: sink equal" );
		ok( !tr1b.usave, "trap_splitOffLower: tr1b.usave null" );
		ok( !tr1b.uleft, "trap_splitOffLower: tr1b.uleft null" );
		//
		strictEqual( tr1.uL, tr1org_uL, "trap_splitOffLower: tr1.uL unchanged" );
		ok( !tr1.uR, "trap_splitOffLower: tr1.uR unchanged" );
		strictEqual( tr1.dL, tr1b, "trap_splitOffLower: tr1.dL == tr1b" );		// L/R undef -> default L
		ok( !tr1.dR, "trap_splitOffLower: tr1.dR null" );
		//
		strictEqual( tr1b.uL, tr1, "trap_splitOffLower: tr1b.uL == tr1" );		// L/R undef -> default L
		ok( !tr1b.uR, "trap_splitOffLower: tr1.uR null" );
		strictEqual( tr1b.dL, tr1org_dL, "trap_splitOffLower: tr1b.dL == tr1org_dL" );
		ok( !tr1b.dR, "trap_splitOffLower: tr1b.dR null" );
		//
		ok( ( tr1org_dL.uL == tr1b ), "trap_splitOffLower: tr1org_dL.uL == tr1b" );
		ok( ( tr1org_dL.uR == tr3 ), "trap_splitOffLower: tr1org_dL.uR == tr3" );
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
		//
		//	Test: split tr2
		var tr2org_uL = tr2.uL;		// save original values
		var tr2org_uR = tr2.uR;
		var tr2org_vH = tr2.vHigh;
		var tr2org_vL = tr2.vLow;
		var splitPt2 = { x: 0 , y: 0 };
		var tr2b = tr2.splitOffLower( splitPt2 );
		strictEqual( tr2.lseg, tr2b.lseg, "trap_splitOffLower: lseg unchanged" );
		strictEqual( tr2.rseg, tr2b.rseg, "trap_splitOffLower: rseg unchanged" );
		strictEqual( tr2.vHigh, tr2org_vH, "trap_splitOffLower: tr2.vHigh unchanged" );
		strictEqual( tr2.vLow, splitPt2, "trap_splitOffLower: tr2.vLow == splitPt2" );
		strictEqual( tr2b.vHigh, splitPt2, "trap_splitOffLower: tr2b.vHigh == splitPt2" );
		strictEqual( tr2b.vLow, tr2org_vL, "trap_splitOffLower: tr2b.vLow unchanged" );
		//
		strictEqual( tr2.sink, tr2b.sink, "trap_splitOffLower: sink equal" );
		ok( !tr2b.usave, "trap_splitOffLower: tr2b.usave null" );
		ok( !tr2b.uleft, "trap_splitOffLower: tr2b.uleft null" );
		//
		strictEqual( tr2.uL, tr2org_uL, "trap_splitOffLower: tr2.uL unchanged" );
		strictEqual( tr2.uR, tr2org_uR, "trap_splitOffLower: tr2.uR unchanged" );
		strictEqual( tr2.dL, tr2b, "trap_splitOffLower: tr2.dL == tr2b" );		// L/R undef -> default L
		ok( !tr2.dR, "trap_splitOffLower: tr2.dR null" );
		//
		strictEqual( tr2b.uL, tr2, "trap_splitOffLower: tr2b.uL == tr2" );		// L/R undef -> default L
		ok( !tr2b.uR, "trap_splitOffLower: tr2.uR null" );
		ok( !tr2b.dL, "trap_splitOffLower: tr2b.dL null" );
		ok( !tr2b.dR, "trap_splitOffLower: tr2b.dR null" );
		//
		//	Test: split tr3
		var tr3org_uR = tr3.uR;		// save original values
		var tr3org_vH = tr3.vHigh;
		var tr3org_vL = tr3.vLow;
		var tr3org_dR = tr3.dR;
		var splitPt3 = { x: 2 , y: 3 };
		var tr3b = tr3.splitOffLower( splitPt3 );
		strictEqual( tr3.lseg, tr3b.lseg, "trap_splitOffLower: lseg unchanged" );
		strictEqual( tr3.rseg, tr3b.rseg, "trap_splitOffLower: rseg unchanged" );
		strictEqual( tr3.vHigh, tr3org_vH, "trap_splitOffLower: tr3.vHigh unchanged" );
		strictEqual( tr3.vLow, splitPt3, "trap_splitOffLower: tr3.vLow == splitPt3" );
		strictEqual( tr3b.vHigh, splitPt3, "trap_splitOffLower: tr3b.vHigh == splitPt3" );
		strictEqual( tr3b.vLow, tr3org_vL, "trap_splitOffLower: tr3b.vLow unchanged" );
		//
		strictEqual( tr3.sink, tr3b.sink, "trap_splitOffLower: sink equal" );
		ok( !tr3b.usave, "trap_splitOffLower: tr3b.usave null" );
		ok( !tr3b.uleft, "trap_splitOffLower: tr3b.uleft null" );
		//
		ok( !tr3.uL, "trap_splitOffLower: tr3.uL unchanged" );
		strictEqual( tr3.uR, tr3org_uR, "trap_splitOffLower: tr3.uR unchanged" );
		strictEqual( tr3.dL, tr3b, "trap_splitOffLower: tr3.dL == tr3b" );		// L/R undef -> default L
		ok( !tr3.dR, "trap_splitOffLower: tr3.dR null" );
		//
		strictEqual( tr3b.uL, tr3, "trap_splitOffLower: tr3b.uL == tr3" );		// L/R undef -> default L
		ok( !tr3b.uR, "trap_splitOffLower: tr3.uR null" );
		ok( !tr3b.dL, "trap_splitOffLower: tr3b.dL null" );
		ok( ( tr3b.dR == tr3org_dR ), "trap_splitOffLower: tr3b.dR == tr3org_dR" );
		//
		ok( ( tr3org_dR.uL == tr1b ), "trap_splitOffLower: tr3org_dR.uL == tr1b" );
		ok( ( tr3org_dR.uR == tr3b ), "trap_splitOffLower: tr3org_dR.uR == tr3b" );
	}

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
		var tr1 = myQs.getTrapByIdx(1), qs_tr1 = tr1.sink;		// TODO
		ok( ( myQs.ptNode( downward_segment.vTo, downward_segment.vFrom, myQsRoot ) == qs_tr1 ), "splitNodeAtPoint1: Seg.vTo -> qs_tr1" );
		var tr3 = myQs.getTrapByIdx(2), qs_tr3 = tr3.sink;
		ok( ( myQs.ptNode( downward_segment.vFrom, downward_segment.vTo, myQsRoot ) == qs_tr3 ), "splitNodeAtPoint1: Seg.vFrom -> qs_tr3" );
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
		//
		// Main Test
		//
		//	insert higher point into QueryStructure
		var qs_tr5 = myQs.splitNodeAtPoint( qs_tr1, downward_segment.vTo, false );
		//
		equal( qs_tr1.yval.y, 25, "splitNodeAtPoint1: high: yval" );
		ok( !qs_tr1.trap, "splitNodeAtPoint1: high: no trapezoid" );
		ok( !qs_tr1.seg, "splitNodeAtPoint1: high: no segment" );
		strictEqual( qs_tr1.right.trap, tr1, "splitNodeAtPoint1: high.right -> OrigTrap(tr1)" );
		strictEqual( qs_tr1.right, tr1.sink, "splitNodeAtPoint1: high.right == sink(OrigTrap(tr1))" );
		strictEqual( qs_tr1.left, qs_tr5, "splitNodeAtPoint1: high.left -> NewTrap(tr5)" );
		strictEqual( qs_tr1.left.trap.uL, tr1, "splitNodeAtPoint1: high.left -> NewTrap(tr5) [uL==tr1]" );
		ok( ( qs_tr1.left.trap.dL == tr3 ), "splitNodeAtPoint1: high.left -> NewTrap(tr5) [dL==tr3]" );
		//
		//	insert lower point into QueryStructure
		var qs_trX = myQs.splitNodeAtPoint( qs_tr3, downward_segment.vFrom, true );
		//
		equal( qs_tr3.yval.y, 10, "splitNodeAtPoint1: low: yval" );
		ok( !qs_tr3.trap, "splitNodeAtPoint1: low: no trapezoid" );
		ok( !qs_tr3.seg, "splitNodeAtPoint1: low: no segment" );
		strictEqual( qs_tr3.right.trap, tr3, "splitNodeAtPoint1: low.right -> OrigTrap(tr3)" );
		strictEqual( qs_tr3.right, tr3.sink, "splitNodeAtPoint1: low.right == sink(OrigTrap(tr3))" );
		strictEqual( qs_tr3.left.trap.uL, tr3, "splitNodeAtPoint1: low.left -> NewTrap(tr6) [uL==tr3]" );
		ok( !qs_tr3.left.trap.dL, "splitNodeAtPoint1: low.left -> NewTrap(tr6) [dL==null]" );
		ok( !qs_tr3.left.trap.dR, "splitNodeAtPoint1: low.left -> NewTrap(tr6) [dR==null]" );
		//
		//
//		showDataStructure( myQsRoot );
	}

	function test_splitNodeAtPoint2() {
		// going UPwards
		var	base_segment = { vFrom: { x: 20, y: 20 }, vTo: { x: 30, y: 40 }, upward: true }
		// inside of tr3, connected !!
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
		var tr3 = myQs.getTrapByIdx(2), qs_tr3 = tr3.sink;		// TODO
		strictEqual( myQs.ptNode( downward_segment.vTo, downward_segment.vFrom, myQsRoot ), qs_tr3, "SplitN#2: Seg.vTo -> qs_tr3" );
		strictEqual( myQs.ptNode( downward_segment.vFrom, downward_segment.vTo, myQsRoot ), qs_tr3, "SplitN#2: Seg.vFrom -> qs_tr3" );
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
		//
		// Main Test
		//
		//	insert higher point into QueryStructure
		var qs_tr5 = myQs.splitNodeAtPoint( qs_tr3, downward_segment.vTo, false );
		//		TODO: Tests
/*		equal( qs_tr1.yval.y, 25, "SplitN#2: high: yval" );
		ok( !qs_tr1.trap, "SplitN#2: high: no trapezoid" );
		ok( !qs_tr1.seg, "SplitN#2: high: no segment" );
		strictEqual( qs_tr1.right.trap, tr1, "SplitN#2: high.right -> OrigTrap(tr1)" );
		strictEqual( qs_tr1.right, tr1.sink, "SplitN#2: high.right == sink(OrigTrap(tr1))" );
		strictEqual( qs_tr1.left, qs_tr5, "SplitN#2: high.left -> NewTrap(tr5)" );
		strictEqual( qs_tr1.left.trap.uL, tr1, "SplitN#2: high.left -> NewTrap(tr5) [uL==tr1]" );
		ok( ( qs_tr1.left.trap.dL == tr3 ), "SplitN#2: high.left -> NewTrap(tr5) [dL==tr3]" );			*/
		//
		//	insert lower point into QueryStructure
		var qs_trX = myQs.splitNodeAtPoint( qs_tr3, downward_segment.vFrom, true );
		//		TODO: Tests
/*		equal( qs_tr3.yval.y, 10, "SplitN#2: low: yval" );
		ok( !qs_tr3.trap, "SplitN#2: low: no trapezoid" );
		ok( !qs_tr3.seg, "SplitN#2: low: no segment" );
		strictEqual( qs_tr3.right.trap, tr3, "SplitN#2: low.right -> OrigTrap(tr3)" );
		strictEqual( qs_tr3.right, tr3.sink, "SplitN#2: low.right == sink(OrigTrap(tr3))" );
		strictEqual( qs_tr3.left.trap.uL, tr3, "SplitN#2: low.left -> NewTrap(tr6) [uL==tr3]" );
		ok( !qs_tr3.left.trap.dL, "SplitN#2: low.left -> NewTrap(tr6) [dL==null]" );
		ok( !qs_tr3.left.trap.dR, "SplitN#2: low.left -> NewTrap(tr6) [dR==null]" );		*/
		//
		//
//		showDataStructure( myQsRoot );
	}

	
	function test_ptNode() {
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
		//
		var qs_tr4 = myQsRoot.right;			// tr4 = myQsRoot.right.trap;			// TODO
		var qs3 = myQsRoot.left;		// Y-Node
		var qs_tr3 = qs3.left;					// tr3 = qs3.left.trap;
		var qs5 = qs3.right;			// X-Node: base_segment
		var qs_tr1 = qs5.left;					// tr1 = qs5.left.trap;
		var qs_tr2 = qs5.right;					// tr2 = qs5.right.trap;
		//	SINK-Node
		ok( ( myQs.ptNode( { x: 2, y: 5 }, { x: 3, y: 6 }, qs3.left ) == qs_tr3 ), "ptNode A: Sink direct -> qs_tr3" );
		//	Y-Node
		ok( ( myQs.ptNode( { x: 2, y: 5 }, { x: 3, y:  6 }, myQsRoot ) == qs_tr4 ), "ptNode A: Y-Node(root), above -> qs_tr4" );
		ok( ( myQs.ptNode( { x: 2, y: 0 }, { x: 4, y: -1 }, qs3 ) == qs_tr3 ), "ptNode A: Y-Node(qs3), below -> qs_tr3" );
		//		Y-Node: 1.end point hit
		ok( ( myQs.ptNode( firstPoint, { x: 4, y: 0 }, qs3 ) == qs_tr3 ), "ptNode A: Y-Node(qs3), =vFrom, below -> qs_tr3" );
		//		Y-Node: 2.end point hit
		ok( ( myQs.ptNode( secondPoint, { x: 0, y: 5 }, myQsRoot ) == qs_tr4 ), "ptNode A: Y-Node(root), =vTo, above -> qs_tr4" );
		//	X-Node
		ok( ( myQs.ptNode( { x: 2, y: 3 }, { x: 3, y: 6 }, qs5 ) == qs_tr1 ), "ptNode A: X-Node(qs5) -> qs_tr1" );
		ok( ( myQs.ptNode( { x: 2, y: 2 }, { x: 3, y: 6 }, qs5 ) == qs_tr2 ), "ptNode A: X-Node(qs5) -> qs_tr2" );
		//		X-Node: 1.end point hit - not horizontal
		ok( ( myQs.ptNode( firstPoint, { x: 0, y: 0 }, qs5 ) == qs_tr1 ), "ptNode A: X-Node(qs5), =vFrom -> qs_tr1" );
		ok( ( myQs.ptNode( firstPoint, { x: 2, y: 2 }, qs5 ) == qs_tr2 ), "ptNode A: X-Node(qs5), =vFrom -> qs_tr2" );
		//		X-Node: 2.end point hit - not horizontal
		ok( ( myQs.ptNode( secondPoint, { x: 3, y: 5 }, qs5 ) == qs_tr1 ), "ptNode A: X-Node(qs5), =vTo -> qs_tr1" );
		ok( ( myQs.ptNode( secondPoint, { x: 4, y: 5 }, qs5 ) == qs_tr2 ), "ptNode A: X-Node(qs5), =vTo -> qs_tr2" );
		//		X-Node: 1.end point hit - horizontal
		ok( ( myQs.ptNode( firstPoint, { x: 0, y: 1 }, qs5 ) == qs_tr1 ), "ptNode A: X-Node(qs5), =vFrom, horiz -> qs_tr1" );
		ok( ( myQs.ptNode( firstPoint, { x: 2, y: 1 }, qs5 ) == qs_tr2 ), "ptNode A: X-Node(qs5), =vFrom, horiz -> qs_tr2" );
		//		X-Node: 2.end point hit - horizontal
		ok( ( myQs.ptNode( secondPoint, { x: 2.5, y: 4 }, qs5 ) == qs_tr1 ), "ptNode A: X-Node(qs5), =vTo, horiz -> qs_tr1" );
		ok( ( myQs.ptNode( secondPoint, { x: 4, y: 4 }, qs5 ) == qs_tr2 ), "ptNode A: X-Node(qs5), =vTo, horiz -> qs_tr2" );
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
		//
		qs_tr4 = myQsRoot.right;					// TODO
		qs3 = myQsRoot.left;		// Y-Node
		qs_tr3 = qs3.left;
		qs5 = qs3.right;			// X-Node: base_segment
		qs_tr1 = qs5.left;
		qs_tr2 = qs5.right;
		//	SINK-Node
		ok( ( myQs.ptNode( { x: 2, y: 5 }, { x: 3, y: 6 }, qs3.left ) == qs_tr3 ), "ptNode B: Sink direct -> qs_tr3" );
		//	Y-Node
		ok( ( myQs.ptNode( { x: 2, y: 5 }, { x: 3, y:  6 }, myQsRoot ) == qs_tr4 ), "ptNode B: Y-Node(root), above -> qs_tr4" );
		ok( ( myQs.ptNode( { x: 2, y: 0 }, { x: 4, y: -1 }, qs3 ) == qs_tr3 ), "ptNode B: Y-Node(qs3), below -> qs_tr3" );
		//		Y-Node: 1.end point hit
		ok( ( myQs.ptNode( firstPoint, { x: 0, y: 5 }, myQsRoot ) == qs_tr4 ), "ptNode B: Y-Node(root), =vFrom, above -> qs_tr4" );
		//		Y-Node: 2.end point hit
		ok( ( myQs.ptNode( secondPoint, { x: 4, y: 0 }, qs3 ) == qs_tr3 ), "ptNode B: Y-Node(qs3), =vTo, below -> qs_tr3" );
		//	X-Node
		ok( ( myQs.ptNode( { x: 2, y: 2 }, { x: 3, y: 6 }, qs5 ) == qs_tr1 ), "ptNode B: X-Node(qs5) -> qs_tr1" );
		ok( ( myQs.ptNode( { x: 2, y: 3 }, { x: 3, y: 6 }, qs5 ) == qs_tr2 ), "ptNode B: X-Node(qs5) -> qs_tr2" );
		//		X-Node: 1.end point hit - not horizontal
		ok( ( myQs.ptNode( firstPoint, { x: 0, y: 5 }, qs5 ) == qs_tr1 ), "ptNode B: X-Node(qs5), =vFrom -> qs_tr1" );
		ok( ( myQs.ptNode( firstPoint, { x: 0, y: 6 }, qs5 ) == qs_tr2 ), "ptNode B: X-Node(qs5), =vFrom -> qs_tr2" );
		//		X-Node: 2.end point hit - not horizontal
		ok( ( myQs.ptNode( secondPoint, { x: 4, y: -1 }, qs5 ) == qs_tr1 ), "ptNode B: X-Node(qs5), =vTo -> qs_tr1" );
		ok( ( myQs.ptNode( secondPoint, { x: 4, y:  0 }, qs5 ) == qs_tr2 ), "ptNode B: X-Node(qs5), =vTo -> qs_tr2" );
		//		X-Node: 1.end point hit - horizontal
		ok( ( myQs.ptNode( firstPoint, { x: 0, y: 4 }, qs5 ) == qs_tr1 ), "ptNode B: X-Node(qs5), =vFrom, horiz -> qs_tr1" );
		ok( ( myQs.ptNode( firstPoint, { x: 2, y: 4 }, qs5 ) == qs_tr2 ), "ptNode B: X-Node(qs5), =vFrom, horiz -> qs_tr2" );
		//		X-Node: 2.end point hit - horizontal
		ok( ( myQs.ptNode( secondPoint, { x: 2, y: 1 }, qs5 ) == qs_tr1 ), "ptNode B: X-Node(qs5), =vTo, horiz -> qs_tr1" );
		ok( ( myQs.ptNode( secondPoint, { x: 4, y: 1 }, qs5 ) == qs_tr2 ), "ptNode B: X-Node(qs5), =vTo, horiz -> qs_tr2" );
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
	

	/*    
	 *					4
	 *   -----------------------------------		y=40
	 *					 		    /
	 *				1			   /
	 *							  /
	 *   ------------------------/		2			y=25
	 *		   \      	7		/
	 *     5	\    		   /
	 *   		 \--------------------------		y=20
	 *  		  \
	 *  	3	   \        8
	 *  		    \
	 *   -----------------------------------		y=10
	 *					6
	 */
	function test_add_segment_1() {
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
		ok( base_segment.is_inserted, "Add#1: Base Segment inserted" );
		equal( myQs.nbTrapezoids(), 4, "Add#1: Number of Trapezoids in Array (4)" );
		// precheck of correct Trapezoids
		var tr1 = myQs.getTrapByIdx(1), qs_tr1 = tr1.sink;			// TODO
		var tr3 = myQs.getTrapByIdx(2), qs_tr3 = tr3.sink;
		ok( ( myQs.ptNode( downward_segment.vFrom, downward_segment.vTo, myQsRoot ) == qs_tr3 ), "Add#1: Seg.vFrom -> qs_tr3" );
		ok( ( myQs.ptNode( downward_segment.vTo, downward_segment.vFrom, myQsRoot ) == qs_tr1 ), "Add#1: Seg.vTo -> qs_tr1" );
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
		//
		// Main Test
		//
		myQs.add_segment( downward_segment );
		ok( downward_segment.is_inserted, "Add#1: 2.Segment inserted" );
		equal( myQs.nbTrapezoids(), 7, "Add#1: Number of Trapezoids in Array (7)" );
		//	upper point inserted -> test_splitNodeAtPoint();		TODO Tests
/*		var tr5 = myQs.getTrapByIdx(4), qs_tr5 = tr5.sink;
		equal( qs_tr1.yval.y, 25, "Add#1: high: yval" );
		ok( !qs_tr1.trap, "Add#1: high: no trapezoid" );
		ok( !qs_tr1.seg, "Add#1: high: no segment" );
		strictEqual( qs_tr1.seg, downward_segment, "Add#1: high.seg == downward_segment" );
		strictEqual( qs_tr1.right.trap, tr1, "Add#1: high.right -> OrigTrap(tr1)" );
		strictEqual( qs_tr1.right, tr1.sink, "Add#1: high.right == sink(OrigTrap(tr1))" );
		strictEqual( qs_tr1.left, qs_tr5, "Add#1: high.left -> NewTrap(tr5)" );
		strictEqual( qs_tr1.left.trap.uL, tr1, "Add#1: high.left -> NewTrap(tr5) [uL==tr1]" );
		strictEqual( qs_tr1.left.trap.dL, tr3, "Add#1: high.left -> NewTrap(tr5) [dL==tr3]" );		*/
		//	lower point inserted -> test_splitNodeAtPoint();		TODO Tests
/*		var tr6 = myQs.getTrapByIdx(5), qs_tr6 = tr6.sink;
		equal( qs_tr3.yval.y, 10, "Add#1: low: yval" );
		ok( !qs_tr3.trap, "Add#1: low: no trapezoid" );
		ok( !qs_tr3.seg, "Add#1: low: no segment" );
		strictEqual( qs_tr3.seg, downward_segment, "Add#1: low.seg == downward_segment" );
		strictEqual( qs_tr3.right.trap, tr3, "Add#1: low.right -> OrigTrap(tr3)" );
		strictEqual( qs_tr3.right, tr3.sink, "Add#1: low.right == sink(OrigTrap(tr3))" );
		strictEqual( qs_tr3.left, qs_tr6, "Add#1: low.left -> NewTrap(tr6)" );
		strictEqual( qs_tr3.left.trap.uL, tr3, "Add#1: low.left -> NewTrap(tr6) [uL==tr3]" );
		ok( !qs_tr3.left.trap.dL, "Add#1: low.left -> NewTrap(tr6) [dL==null]" );
		ok( !qs_tr3.left.trap.dR, "Add#1: low.left -> NewTrap(tr6) [dR==null]" );		*/
		//
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
	}

	function test_add_segment_2() {
		// going UPwards
		var	base_segment = { vFrom: { x: 20, y: 20 }, vTo: { x: 30, y: 40 }, upward: true }
		// start in tr4
		var	downward_segment = { vFrom: { x: 15, y: 10 }, vTo: { x: 10, y: 45 }, upward: true }
		// segment chain
		base_segment.snext = downward_segment.sprev = { vFrom: base_segment.vTo, vTo: downward_segment.vFrom, upward: false,
														sprev: base_segment, snext: downward_segment };
		base_segment.sprev = downward_segment.snext = { vFrom: downward_segment.vTo, vTo: base_segment.vFrom, upward: false,
														sprev: downward_segment, snext: base_segment };
		//
		var myQs = new PNLTRI.QueryStructure();
		var myQsRoot = myQs.setup_segments( base_segment );
		ok( base_segment.is_inserted, "Add#2: Base Segment inserted" );
		equal( myQs.nbTrapezoids(), 4, "Add#2: Number of Trapezoids in Array (4)" );
		// precheck of correct Trapezoids
		var tr3 = myQs.getTrapByIdx(2), qs_tr3 = tr3.sink;		// TODO
		var tr4 = myQs.getTrapByIdx(0), qs_tr4 = tr4.sink;
		ok( ( myQs.ptNode( downward_segment.vFrom, downward_segment.vTo, myQsRoot ) == qs_tr3 ), "Add#2: Seg.vFrom -> qs_tr3" );
		ok( ( myQs.ptNode( downward_segment.vTo, downward_segment.vFrom, myQsRoot ) == qs_tr4 ), "Add#2: Seg.vTo -> qs_tr4" );
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
		//
		// Main Test
		//
		myQs.add_segment( downward_segment );
		ok( downward_segment.is_inserted, "Add#2: 2.Segment inserted" );
		equal( myQs.nbTrapezoids(), 7, "Add#2: Number of Trapezoids in Array (7)" );
		//
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
	}

	function test_add_segment_3() {
		// going UPwards
		var	base_segment = { vFrom: { x: 20, y: 20 }, vTo: { x: 30, y: 40 }, upward: true }
		// inside of tr2
		var	downward_segment = { vFrom: { x: 35, y: 35 }, vTo: { x: 25, y: 25 }, upward: false }
		// segment chain
		base_segment.snext = downward_segment.sprev = { vFrom: base_segment.vTo, vTo: downward_segment.vFrom, upward: false,
														sprev: base_segment, snext: downward_segment };
		base_segment.sprev = downward_segment.snext = { vFrom: downward_segment.vTo, vTo: base_segment.vFrom, upward: false,
														sprev: downward_segment, snext: base_segment };
		//
		var myQs = new PNLTRI.QueryStructure();
		var myQsRoot = myQs.setup_segments( base_segment );
		ok( base_segment.is_inserted, "Add#3: Base Segment inserted" );
		equal( myQs.nbTrapezoids(), 4, "Add#3: Number of Trapezoids in Array (4)" );
		// precheck of correct Trapezoids
		var tr2 = myQs.getTrapByIdx(3), qs_tr2 = tr2.sink;			// TODO
		ok( ( myQs.ptNode( downward_segment.vFrom, downward_segment.vTo, myQsRoot ) == qs_tr2 ), "Add#3: Seg.vFrom -> qs_tr2" );
		ok( ( myQs.ptNode( downward_segment.vTo, downward_segment.vFrom, myQsRoot ) == qs_tr2 ), "Add#3: Seg.vTo -> qs_tr2" );
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
		//
		// Main Test
		//
		myQs.add_segment( downward_segment );
		ok( downward_segment.is_inserted, "Add#3: 2.Segment inserted" );
		equal( myQs.nbTrapezoids(), 7, "Add#3: Number of Trapezoids in Array (7)" );
		//
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
	}

	function test_add_segment_4() {
		// going UPwards
		var	base_segment = { vFrom: { x: 20, y: 20 }, vTo: { x: 30, y: 40 }, upward: true }
		// inside of tr3
		var	downward_segment = { vFrom: { x: 5, y: 15 }, vTo: { x: 35, y: 5 }, upward: false }
		// segment chain
		base_segment.snext = downward_segment.sprev = { vFrom: base_segment.vTo, vTo: downward_segment.vFrom, upward: false,
														sprev: base_segment, snext: downward_segment };
		base_segment.sprev = downward_segment.snext = { vFrom: downward_segment.vTo, vTo: base_segment.vFrom, upward: true,
														sprev: downward_segment, snext: base_segment };
		//
		var myQs = new PNLTRI.QueryStructure();
		var myQsRoot = myQs.setup_segments( base_segment );
		ok( base_segment.is_inserted, "Add#4: Base Segment inserted" );
		equal( myQs.nbTrapezoids(), 4, "Add#4: Number of Trapezoids in Array (4)" );
		// precheck of correct Trapezoids
		var tr3 = myQs.getTrapByIdx(2), qs_tr3 = tr3.sink;			// TODO
		strictEqual( myQs.ptNode( downward_segment.vFrom, downward_segment.vTo, myQsRoot ), qs_tr3, "Add#4: Seg.vFrom -> qs_tr3" );
		strictEqual( myQs.ptNode( downward_segment.vTo, downward_segment.vFrom, myQsRoot ), qs_tr3, "Add#4: Seg.vTo -> qs_tr3" );
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
		//
		// Main Test
		//
		myQs.add_segment( downward_segment );
		ok( downward_segment.is_inserted, "Add#4: 2.Segment inserted" );
		equal( myQs.nbTrapezoids(), 7, "Add#4: Number of Trapezoids in Array (7)" );
		//
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
	}

	
	function test_add_segment_spezial_1() {
		
		var myPolygonData = new PNLTRI.PolygonData( [ [
				{ x:1, y:1 }, { x:4, y:3 }, { x:6, y:2 }, { x:7, y:5 },
				{ x:5, y:6 }, { x:2, y:4 }, { x:1, y:7 }, 
			] ] );
		var segListArray = myPolygonData.getSegments();
//		showDataStructure( myPolygonData.getVertices(), [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
//		showDataStructure( myPolygonData.getSegments(), [ 'sprev', 'snext', 'mprev', 'mnext' ] );
		//
		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		var myQsRoot = myQs.getRoot();
		//
		myQs.add_segment_consistently( segListArray[0], 'Spec_1 #1' );
		myQs.add_segment_consistently( segListArray[2], 'Spec_1 #2' );
		myQs.add_segment_consistently( segListArray[4], 'Spec_1 #3' );
		// complex case concerning "only_one_trap_below"
		myQs.add_segment_consistently( segListArray[6], 'Spec_1 Main' );
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot, false, 5 );
	}

	function test_add_segment_spezial_2() {
		
		var myPolygonData = new PNLTRI.PolygonData( [ [
			{ x:1, y:1 }, { x:5, y:5.1 }, { x:6, y:8 }, { x:4, y:6 },
			{ x:2, y:3 }, { x:1, y:5 },
			] ] );
		var segListArray = myPolygonData.getSegments();
//		showDataStructure( myPolygonData.getVertices(), [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
//		showDataStructure( myPolygonData.getSegments(), [ 'sprev', 'snext', 'mprev', 'mnext' ] );
		//
		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		var myQsRoot = myQs.getRoot();
		//
		myQs.add_segment_consistently( segListArray[0], 'Spec_2 #1' );
		myQs.add_segment_consistently( segListArray[1], 'Spec_2 #2' );
		myQs.add_segment_consistently( segListArray[5], 'Spec_2 #3' );
		// complex case: extending first on the left then right
		myQs.add_segment_consistently( segListArray[3], 'Spec_2 Main' );
		//
		myQs.add_segment_consistently( segListArray[2], 'Spec_2 #4' );
		myQs.add_segment_consistently( segListArray[4], 'Spec_2 #5' );
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot, false, 5 );
	}

	function test_add_segment_spezial_3() {
		
		var myPolygonData = new PNLTRI.PolygonData( [ [
			{ x: 19.3395, y: 7.15 }, { x: 19.228, y: 7.150000000000001 },
			{ x: 5.03, y: 6.9715 }, { x: 5.17, y: 6.046 },
			] ] );
		var segListArray = myPolygonData.getSegments();
//		showDataStructure( myPolygonData.getVertices(), [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
//		showDataStructure( myPolygonData.getSegments(), [ 'sprev', 'snext', 'mprev', 'mnext' ] );
		//
		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		var myQsRoot = myQs.getRoot();
		//
		myQs.add_segment_consistently( segListArray[2], 'Spec_3 #1' );
		// complex case: 3.Segment goes upwards and downwards => always use EPSILON
		myQs.add_segment_consistently( segListArray[0], 'Spec_3 Main' );
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot, false, 2 );
	}

	function test_add_segment_spezial_4() {			// TODO: test all mirrored cases !!!
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
//		showDataStructure( myPolygonData.getVertices(), [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
//		showDataStructure( myPolygonData.getSegments(), [ 'sprev', 'snext', 'mprev', 'mnext' ] );
		//
		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		var myQsRoot = myQs.getRoot();
		var segListArray = myPolygonData.getSegments().concat();
		//
		myQs.add_segment_consistently( segListArray[0], 'Spec_4a #1' );
		myQs.add_segment_consistently( segListArray[1], 'Spec_4a #2' );
		myQs.check_trapezoid_neighbors(  0, null, null, 1, 3, "Spec_4a #2, n#0" );
		myQs.check_trapezoid_neighbors(  1, 0, null, 4, null, "Spec_4a #2, n#1" );
		myQs.check_trapezoid_neighbors(  2, 4, 3, null, null, "Spec_4a #2, n#2" );
		myQs.check_trapezoid_neighbors(  3, null, 0, null, 2, "Spec_4a #2, n#3" );
		myQs.check_trapezoid_neighbors(  4, 1, 5, 2, null, "Spec_4a #2, n#4" );
		myQs.check_trapezoid_neighbors(  5, null, null, null, 4, "Spec_4a #2, n#5" );
		// complex case: goes back on same x-line
		myQs.add_segment_consistently( segListArray[2], 'Spec_4a Main' );
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot, false, 10 );
		//
		//	Test B
		myPolygonData = new PNLTRI.PolygonData( testPolygon );
		myQs = new PNLTRI.QueryStructure( myPolygonData );
		myQsRoot = myQs.getRoot();
		segListArray = myPolygonData.getSegments().concat();
		//
		myQs.add_segment_consistently( segListArray[2], 'Spec_4b #1' );
		myQs.add_segment_consistently( segListArray[1], 'Spec_4b #2' );
		myQs.check_trapezoid_neighbors(  0, null, null, 1, 3, "Spec_4b #2, n#0" );
		myQs.check_trapezoid_neighbors(  1, 0, null, 2, null, "Spec_4b #2, n#1" );
		myQs.check_trapezoid_neighbors(  2, 1, 5, null, null, "Spec_4b #2, n#2" );
		myQs.check_trapezoid_neighbors(  3, null, 0, 4, 5, "Spec_4b #2, n#3" );
		myQs.check_trapezoid_neighbors(  4, 3, null, null, null, "Spec_4b #2, n#4" );
		myQs.check_trapezoid_neighbors(  5, null, 3, null, 2, "Spec_4b #2, n#5" );
		// complex case: attaching to the middle point of to co-linear segments
		myQs.add_segment_consistently( segListArray[0], 'Spec_4b Main' );
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot, false, 10 );
	}
	
	function test_add_segment_spezial_5() {

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
		var myQsRoot = myQs.getRoot();
		//
		myQs.add_segment_consistently( segListArray[0], 'Spec_5 #1' );
		myQs.add_segment_consistently( segListArray[1], 'Spec_5 #2' );
		// complex case: EPSILON > rounding effect on coordinates
		myQs.add_segment_consistently( segListArray[3], 'Spec_5 Main' );
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot, false, 0.4 );
	}

	function test_add_segment_spezial_6() {

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

	
	function test_add_segment_5ccw() {
		// CCW-Ordering (Shapes)
		var	segment_top = { vFrom: { x: 30, y: 40 }, vTo: { x: 20, y: 20 }, upward: false }
		var	segment_left = { vFrom: segment_top.vTo, vTo: { x: 10, y: 15 }, upward: false }
		var	segment_right = { vFrom: { x: 60, y: 22 }, vTo: segment_top.vFrom, upward: true }
		var	segment_bottom = { vFrom: segment_left.vTo, vTo: segment_right.vFrom, upward: true }
		//
		segment_top.snext = segment_left; segment_top.sprev = segment_right;
		segment_left.snext = segment_bottom; segment_left.sprev = segment_top;
		segment_right.snext = segment_top; segment_right.sprev = segment_bottom;
		segment_bottom.snext = segment_right; segment_bottom.sprev = segment_left;
		//
		var myQs = new PNLTRI.QueryStructure();
		var myQsRoot = myQs.setup_segments( segment_top );
		ok( segment_top.is_inserted, "Add#5ccw: segment_top inserted" );
		equal( myQs.nbTrapezoids(), 4, "Add#5ccw: Number of Trapezoids in Array (4)" );
		// precheck of correct Trapezoids
		var tr3 = myQs.getTrapByIdx(2), qs_tr3 = tr3.sink;			// TODO
		ok( ( myQs.ptNode( segment_left.vFrom, segment_left.vTo, myQsRoot ) == qs_tr3 ), "Add#5ccw: Seg.vFrom -> qs_tr3" );
		ok( ( myQs.ptNode( segment_left.vTo, segment_left.vFrom, myQsRoot ) == qs_tr3 ), "Add#5ccw: Seg.vTo -> qs_tr3" );
		var tr2 = myQs.getTrapByIdx(3), qs_tr2 = tr2.sink;
		ok( ( myQs.ptNode( segment_right.vFrom, segment_right.vTo, myQsRoot ) == qs_tr2 ), "Add#5ccw: Seg.vFrom -> qs_tr2" );
		ok( ( myQs.ptNode( segment_right.vTo, segment_right.vFrom, myQsRoot ) == qs_tr2 ), "Add#5ccw: Seg.vTo -> qs_tr2" );
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
		//
		// Main Test
		//
		myQs.add_segment( segment_left );
		ok( segment_left.is_inserted, "Add#5ccw: segment_left inserted" );
		equal( myQs.nbTrapezoids(), 6, "Add#5ccw: Number of Trapezoids in Array (6)" );
		myQs.add_segment( segment_right );
		ok( segment_right.is_inserted, "Add#5ccw: segment_right inserted" );
		equal( myQs.nbTrapezoids(), 8, "Add#5ccw: Number of Trapezoids in Array (8)" );
		myQs.add_segment( segment_bottom );
		ok( segment_bottom.is_inserted, "Add#5ccw: segment_bottom inserted" );
		equal( myQs.nbTrapezoids(), 9, "Add#5ccw: Number of Trapezoids in Array (9)" );
		//
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
	}

	function test_add_segment_5cw() {
		// CW-Ordering (Holes)
		var	segment_top = { vFrom: { x: 20, y: 20 }, vTo: { x: 30, y: 40 }, upward: true }
		var	segment_left = { vFrom: { x: 10, y: 15 }, vTo: segment_top.vFrom, upward: true }
		var	segment_right = { vFrom: segment_top.vTo, vTo: { x: 60, y: 22 }, upward: false }
		var	segment_bottom = { vFrom: segment_right.vTo, vTo: segment_left.vFrom, upward: false }
		//
		segment_top.sprev = segment_left; segment_top.snext = segment_right;
		segment_right.sprev = segment_top; segment_right.snext = segment_bottom;
		segment_bottom.sprev = segment_right; segment_bottom.snext = segment_left;
		segment_left.sprev = segment_bottom; segment_left.snext = segment_top;
		//
		var myQs = new PNLTRI.QueryStructure();
		var myQsRoot = myQs.setup_segments( segment_left );
		ok( segment_left.is_inserted, "Add#5cw: segment_left inserted" );
		equal( myQs.nbTrapezoids(), 4, "Add#5cw: Number of Trapezoids in Array (4)" );
		//
		// Main Test
		//
		myQs.add_segment( segment_bottom );
		ok( segment_bottom.is_inserted, "Add#5cw: segment_bottom inserted" );
		equal( myQs.nbTrapezoids(), 6, "Add#5cw: Number of Trapezoids in Array (6)" );
		myQs.add_segment( segment_right );
		ok( segment_right.is_inserted, "Add#5cw: segment_right inserted" );
		equal( myQs.nbTrapezoids(), 8, "Add#5cw: Number of Trapezoids in Array (8)" );
		myQs.add_segment( segment_top );
		ok( segment_top.is_inserted, "Add#5cw: segment_top inserted" );
		equal( myQs.nbTrapezoids(), 9, "Add#5cw: Number of Trapezoids in Array (9)" );
		//
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
	}

	function test_add_segment_6nonmono() {
		// CCW-Ordering (Shapes)
		var	segment_nosetop = { vFrom: { x: 30, y: 45 }, vTo: { x: 15, y: 30 }, upward: false }
		var	segment_nosebot = { vFrom: segment_nosetop.vTo, vTo: { x: 28, y: 33 }, upward: true }
		var	segment_lefttop = { vFrom: segment_nosebot.vTo, vTo: { x: 20, y: 20 }, upward: false }
		var	segment_leftbot = { vFrom: segment_lefttop.vTo, vTo: { x: 10, y: 10 }, upward: false }
		var	segment_indetop = { vFrom: { x: 26, y: 36 }, vTo: segment_nosetop.vFrom, upward: true }
		var	segment_indebot = { vFrom: { x: 35, y: 40 }, vTo: segment_indetop.vFrom, upward: false }
		var	segment_right = { vFrom: { x: 60, y: 22 }, vTo: segment_indebot.vFrom, upward: true }
		var	segment_bottom = { vFrom: segment_leftbot.vTo, vTo: segment_right.vFrom, upward: true }
		//
		segment_nosetop.snext = segment_nosebot; segment_nosetop.sprev = segment_indetop;
		segment_nosebot.snext = segment_lefttop; segment_nosebot.sprev = segment_nosetop;
		segment_lefttop.snext = segment_leftbot; segment_lefttop.sprev = segment_nosebot;
		segment_leftbot.snext = segment_bottom; segment_leftbot.sprev = segment_lefttop;
		segment_indetop.snext = segment_nosetop; segment_indetop.sprev = segment_indebot;
		segment_indebot.snext = segment_indetop; segment_indebot.sprev = segment_right;
		segment_right.snext = segment_indebot; segment_right.sprev = segment_bottom;
		segment_bottom.snext = segment_right; segment_bottom.sprev = segment_leftbot;
		//
		var myQs = new PNLTRI.QueryStructure();
		var myQsRoot = myQs.setup_segments( segment_lefttop );
		ok( segment_lefttop.is_inserted, "Add#6: segment_lefttop inserted" );
		equal( myQs.nbTrapezoids(), 4, "Add#6: Number of Trapezoids in Array (4)" );
		//
		// Main Test
		//
		myQs.add_segment( segment_bottom );
		ok( segment_bottom.is_inserted, "Add#6: segment_bottom inserted" );
		equal( myQs.nbTrapezoids(), 7, "Add#6: Number of Trapezoids in Array (7)" );
		myQs.add_segment( segment_nosebot );
		ok( segment_nosebot.is_inserted, "Add#6: segment_nosebot inserted" );
		equal( myQs.nbTrapezoids(), 9, "Add#6: Number of Trapezoids in Array (9)" );
		myQs.add_segment( segment_indebot );
		ok( segment_indebot.is_inserted, "Add#6: segment_indebot inserted" );
		equal( myQs.nbTrapezoids(), 12, "Add#6: Number of Trapezoids in Array (12)" );
		myQs.add_segment( segment_right );
		ok( segment_right.is_inserted, "Add#6: segment_right inserted" );
		equal( myQs.nbTrapezoids(), 13, "Add#6: Number of Trapezoids in Array (13)" );
		myQs.add_segment( segment_nosetop );
		ok( segment_nosetop.is_inserted, "Add#6: segment_nosetop inserted" );
		equal( myQs.nbTrapezoids(), 15, "Add#6: Number of Trapezoids in Array (15)" );
		myQs.add_segment( segment_leftbot );
		ok( segment_leftbot.is_inserted, "Add#6: segment_leftbot inserted" );
		equal( myQs.nbTrapezoids(), 16, "Add#6: Number of Trapezoids in Array (16)" );
		myQs.add_segment( segment_indetop );
		ok( segment_indetop.is_inserted, "Add#6: segment_indetop inserted" );
		equal( myQs.nbTrapezoids(), 17, "Add#6: Number of Trapezoids in Array (17)" );
		//
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
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
		test_trap_splitOffLower();
		test_splitNodeAtPoint1();
		test_splitNodeAtPoint2();
		test_ptNode();
		//
		test_assign_depths();
		//
		// 2 unconnected segments
		test_add_segment_1();
		test_add_segment_2();
		test_add_segment_3();
		test_add_segment_4();
		// special segment constellations
		test_add_segment_spezial_1();
		test_add_segment_spezial_2();
		test_add_segment_spezial_3();
		test_add_segment_spezial_4();
		test_add_segment_spezial_5();
		test_add_segment_spezial_6();
		// polygons
		test_add_segment_5ccw();
		test_add_segment_5cw();
		test_add_segment_6nonmono();
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
}


function test_Trapezoider() {

	var	testData = new PolygonTestdata();

	
	function test_math_logstar_n() {
		var trap = new PNLTRI.Trapezoider();
		//
		equal( trap.math_logstar_n(13), 2, "log*(13)" );
		equal( trap.math_logstar_n(100), 3, "log*(100)" );
		equal( trap.math_logstar_n(10000), 3, "log*(10000)" );
		equal( trap.math_logstar_n(100000), 4, "log*(100000)" );
		equal( trap.math_logstar_n(10000000000), 4, "log*(10000000000)" );
	}

	function test_math_NH() {
		var trap = new PNLTRI.Trapezoider();
		//
		// minimal number of segments
		equal( trap.math_NH(3,0), 0, "math_NH: 3, 0" );
		equal( trap.math_NH(3,1), 1, "math_NH: 3, 1" );
		equal( trap.math_NH(3,2), 4, "math_NH: 3, 2" );		// too big
		//
		equal( trap.math_NH(13,0), 0, "math_NH: 13, 0" );
		equal( trap.math_NH(13,1), 3, "math_NH: 13, 1" );
		equal( trap.math_NH(13,2), 6, "math_NH: 13, 2" );
		equal( trap.math_NH(13,3), 14, "math_NH: 13, 3" );		// too big
		//
		equal( trap.math_NH(100000,0), 0, "math_NH: 100000, 0" );
		equal( trap.math_NH(100000,1), 6020, "math_NH: 100000, 1" );
		equal( trap.math_NH(100000,2), 24667, "math_NH: 100000, 2" );
		equal( trap.math_NH(100000,3), 49521, "math_NH: 100000, 3" );
		equal( trap.math_NH(100000,4), 98631, "math_NH: 100000, 4" );
		equal( trap.math_NH(100000,5), 5030158, "math_NH: 100000, 5" );		// too big
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
		test_math_logstar_n();
		test_math_NH();
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

