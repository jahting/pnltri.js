/**
 * @author jahting / http://www.ameco.tv/
 */


/* TODO: Tests for PNLTRI.Trapezoid.replaceAbove */


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
// Assign a depth to the trapezoids; 0: outside, -1: other;  // future: 1: main polygon, 2: holes
PNLTRI.QueryStructure.prototype.assignDepth = function ( inTrap, inDepth ) {
	if (! inTrap)				return;
	if (inTrap.depth != -1)		return;
	inTrap.depth = inDepth;
	this.assignDepth( inTrap.uL, inDepth );
	this.assignDepth( inTrap.uR, inDepth );
	this.assignDepth( inTrap.dL, inDepth );
	this.assignDepth( inTrap.dR, inDepth );
};
PNLTRI.QueryStructure.prototype.assignDepths = function () {
	this.assignDepth( this.trapArray[0], 0 );
};
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
	return	this.trapArray[0].depth;
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
// check all trapezoids for consistent l/r-segment orientation
PNLTRI.QueryStructure.prototype.check_trapezoids_segment_orientation = function () {
	// if the polygon chains have the correct orientation
	//	(contour: CCW, holes: CW), then all trapezoids lseg/rseg have opposing
	//	directions, assumed, the missing outer segments have CW orientation !
	
	var bugList = [];
	
	var currTrap, rightDir, leftDir;
	for (var i=0; i<this.trapArray.length; i++) {
		currTrap = this.trapArray[i];
		rightDir = ( currTrap.rseg ) ? currTrap.rseg.upward : false;
		leftDir = ( currTrap.lseg ) ? currTrap.lseg.upward : true;
		if ( rightDir == leftDir )		bugList.push( "ID#"+currTrap.trapID );
	}
	
	return	( bugList.length == 0 ) ? null : bugList;
};
// check if trapezoid has specific neighbors
PNLTRI.QueryStructure.prototype.check_trapezoid_neighbors = function ( inTrapId, inSollUL, inSollUR, inSollDL, inSollDR, inTestName ) {
	var trapezoid = this.getTrapByIdx(inTrapId);
	if ( trapezoid ) {
		var uL_ID = trapezoid.uL ? trapezoid.uL.trapID : null;
		var uR_ID = trapezoid.uR ? trapezoid.uR.trapID : null;
		var dL_ID = trapezoid.dL ? trapezoid.dL.trapID : null;
		var dR_ID = trapezoid.dR ? trapezoid.dR.trapID : null;
		//
		equal( uL_ID, inSollUL, inTestName + ": uL == " + inSollUL );
		equal( uR_ID, inSollUR, inTestName + ": uR == " + inSollUR );
		equal( dL_ID, inSollDL, inTestName + ": dL == " + inSollDL );
		equal( dR_ID, inSollDR, inTestName + ": dR == " + inSollDR );
	} else {
		ok( trapezoid, inTestName + ": trapezoid exists" );
	}
}

// #############################################################################

function test_QueryStructure() {
	
	/* TODO: Tests for PNLTRI.QueryStructure.cloneTrap */

	function test_inside_polygon() {
		var	myQs = new PNLTRI.QueryStructure();
		var myTrap;
		myTrap = {};
		ok( !myQs.inside_polygon( myTrap ), "inside_polygon: Trap empty!" );
		myTrap = { lseg: {} };
		ok( !myQs.inside_polygon( myTrap ), "inside_polygon: Trap no rseg!" );
		myTrap = { rseg: {} };
		ok( !myQs.inside_polygon( myTrap ), "inside_polygon: Trap no lseg!" );
		myTrap = { lseg: {}, rseg: {}, uL: {}, dL: {} };
		ok( !myQs.inside_polygon( myTrap ), "inside_polygon: Trap no triangle!" );
		myTrap = { lseg: {}, rseg: { vFrom: { x:0, y:10 }, vTo: { x:10, y:0 }, upward: false } };
		ok( !myQs.inside_polygon( myTrap ), "inside_polygon: Trap rseg going downwards!" );
		myTrap = { lseg: {}, rseg: { vFrom: { x:10, y:0 }, vTo: { x:0, y:10 }, upward: true } };
		ok( myQs.inside_polygon( myTrap ), "inside_polygon: Trap rseg going upwards!" );
	}

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
		equal( myQsRoot.nodetype, PNLTRI.T_Y, "init_query_structure_up: root: Y-Node" );
		equal( myQsRoot.yval, base_segment.vTo, "init_query_structure_up: root: yval = vTo" );
		// top(tr0): above root
		var qsNode2 = myQsRoot.right;
		equal( qsNode2.nodetype, PNLTRI.T_SINK, "init_query_structure_up: root.above: SINK (top: tr0)" );
			// tr0
		var tr0 = qsNode2.trap;
		equal( tr0.sink, qsNode2, "init_query_structure_up: root.above->tr.sink: this qsNode" );
		equal( tr0.vHigh.y, Number.POSITIVE_INFINITY, "init_query_structure_up: root.above->tr.vHigh.y: +INFINITY" );
		equal( tr0.vLow, base_segment.vTo, "init_query_structure_up: root.above->tr.vLow: vTo" );
		// segMin(vFrom): below root
		var qsNode3 = myQsRoot.left;
		equal( qsNode3.nodetype, PNLTRI.T_Y, "init_query_structure_up: root.below: Y-Node" );
		equal( qsNode3.yval, base_segment.vFrom, "init_query_structure_up: root.below: yval = vFrom" );
		//
		// bottom(tr2): below segMin(qsNode3)
		var qsNode4 = qsNode3.left;
		equal( qsNode4.nodetype, PNLTRI.T_SINK, "init_query_structure_up: segMin.below: SINK (bottom: tr2)" );
			// tr2
		var tr2 = qsNode4.trap;
		equal( tr2.sink, qsNode4, "init_query_structure_up: segMin.below->tr.sink: this qsNode" );
		equal( tr2.vLow.y, Number.NEGATIVE_INFINITY, "init_query_structure_up: segMin.below->tr.vLow.y: -INFINITY" );
		equal( tr2.vHigh, base_segment.vFrom, "init_query_structure_up: segMin.below->tr.vHigh: vFrom" );
		//
		// Segment - below segMax, above segMin
		var qsNode5 = qsNode3.right;
		equal( qsNode5.nodetype, PNLTRI.T_X, "init_query_structure_up: segment: X-Node" );
		equal( qsNode5.seg, base_segment, "init_query_structure_up: segment.seg -> inSegment" );
		//
		// left(tr1): segment.left(qsNode5)
		var qsNode6 = qsNode5.left;
		equal( qsNode6.nodetype, PNLTRI.T_SINK, "init_query_structure_up: segment.left: SINK (left: tr1)" );
			// tr1
		var tr1 = qsNode6.trap;
		equal( tr1.sink, qsNode6, "init_query_structure_up: segment.left->tr.sink: this qsNode" );
		equal( tr1.rseg, base_segment, "init_query_structure_up: segment.left->tr.rseg: inSegment" );
		equal( tr1.vHigh, base_segment.vTo, "init_query_structure_up: segment.left->tr.vHigh: vTo" );
		equal( tr1.vLow, base_segment.vFrom, "init_query_structure_up: segment.left->tr.vLow: vFrom" );
		//
		// right(tr3): segment.right(qsNode5)
		var qsNode7 = qsNode5.right;
		equal( qsNode7.nodetype, PNLTRI.T_SINK, "init_query_structure_up: segment.right: SINK (right: tr3)" );
			// tr3
		var tr3 = qsNode7.trap;
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
	function test_trap_setAbove() {
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
		ok( base_segment.is_inserted, "trap_setAbove: Segment inserted" );
		// get existing Trapezoids
		var tr0 = myQs.getTrapByIdx(0);
		var tr1 = myQs.getTrapByIdx(1);
		var tr2 = myQs.getTrapByIdx(2);
		var tr3 = myQs.getTrapByIdx(3);
		// test exchangeability
		ok( ( tr2.uL == tr1 ), "trap_setAbove: tr2.uL -> tr1" );
		ok( ( tr2.uR == tr3 ), "trap_setAbove: tr2.uR -> tr3" );
		tr2.setAbove( tr2.uR, tr2.uL );
		ok( ( tr2.uL == tr3 ), "trap_setAbove: tr2.uL -> tr3" );
		ok( ( tr2.uR == tr1 ), "trap_setAbove: tr2.uR -> tr1" );
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
		ok( !tr0b.uside, "trap_splitOffLower: tr0b.uside null" );
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
		ok( !tr1b.uside, "trap_splitOffLower: tr1b.uside null" );
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
		ok( !tr2b.uside, "trap_splitOffLower: tr2b.uside null" );
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
		ok( !tr3b.uside, "trap_splitOffLower: tr3b.uside null" );
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
		equal( qs_tr1.nodetype, PNLTRI.T_Y, "splitNodeAtPoint1: nodetype(tr1) -> T_Y" );
		equal( qs_tr1.yval.y, 25, "splitNodeAtPoint1: yval = 25" );
		strictEqual( qs_tr1.right.trap, tr1, "splitNodeAtPoint1: right -> OrigTrap(tr1)" );
		strictEqual( qs_tr1.right, tr1.sink, "splitNodeAtPoint1: right == sink(OrigTrap(tr1))" );
		strictEqual( qs_tr1.left, qs_tr5, "splitNodeAtPoint1: left -> NewTrap(tr5)" );
		strictEqual( qs_tr1.left.trap.uL, tr1, "splitNodeAtPoint1: left -> NewTrap(tr5) [uL==tr1]" );
		ok( ( qs_tr1.left.trap.dL == tr3 ), "splitNodeAtPoint1: left -> NewTrap(tr5) [dL==tr3]" );
		//
		//	insert lower point into QueryStructure
		var qs_trX = myQs.splitNodeAtPoint( qs_tr3, downward_segment.vFrom, true );
		//
		equal( qs_tr3.nodetype, PNLTRI.T_Y, "splitNodeAtPoint1: nodetype(tr3) -> T_Y" );
		equal( qs_tr3.yval.y, 10, "splitNodeAtPoint1: yval = 10" );
		strictEqual( qs_tr3.right.trap, tr3, "splitNodeAtPoint1: right -> OrigTrap(tr3)" );
		strictEqual( qs_tr3.right, tr3.sink, "splitNodeAtPoint1: right == sink(OrigTrap(tr3))" );
		strictEqual( qs_tr3.left.trap.uL, tr3, "splitNodeAtPoint1: left -> NewTrap(tr6) [uL==tr3]" );
		ok( !qs_tr3.left.trap.dL, "splitNodeAtPoint1: left -> NewTrap(tr6) [dL==null]" );
		ok( !qs_tr3.left.trap.dR, "splitNodeAtPoint1: left -> NewTrap(tr6) [dR==null]" );
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
/*		equal( qs_tr1.nodetype, PNLTRI.T_Y, "SplitN#2: nodetype(tr1) -> T_Y" );
		equal( qs_tr1.yval.y, 25, "SplitN#2: yval = 25" );
		strictEqual( qs_tr1.right.trap, tr1, "SplitN#2: right -> OrigTrap(tr1)" );
		strictEqual( qs_tr1.right, tr1.sink, "SplitN#2: right == sink(OrigTrap(tr1))" );
		strictEqual( qs_tr1.left, qs_tr5, "SplitN#2: left -> NewTrap(tr5)" );
		strictEqual( qs_tr1.left.trap.uL, tr1, "SplitN#2: left -> NewTrap(tr5) [uL==tr1]" );
		strictEqual( qs_tr1.left.trap.dL, tr3, "SplitN#2: left -> NewTrap(tr5) [dL==tr3]" );		*/
		//
		//	insert lower point into QueryStructure
		var qs_trX = myQs.splitNodeAtPoint( qs_tr3, downward_segment.vFrom, true );
		//		TODO: Tests
/*		equal( qs_tr3.nodetype, PNLTRI.T_Y, "SplitN#2: nodetype(tr3) -> T_Y" );
		equal( qs_tr3.yval.y, 10, "SplitN#2: yval = 10" );
		strictEqual( qs_tr3.right.trap, tr3, "SplitN#2: right -> OrigTrap(tr3)" );
		strictEqual( qs_tr3.right, tr3.sink, "SplitN#2: right == sink(OrigTrap(tr3))" );
		strictEqual( qs_tr3.left.trap.uL, tr3, "SplitN#2: left -> NewTrap(tr6) [uL==tr3]" );
		ok( !qs_tr3.left.trap.dL, "SplitN#2: left -> NewTrap(tr6) [dL==null]" );
		ok( !qs_tr3.left.trap.dR, "SplitN#2: left -> NewTrap(tr6) [dR==null]" );			*/
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
		var myQsRoot = myQs.setup_segments( base_segment );		// T_Y
		//
		var qs_tr4 = myQsRoot.right;			// tr4 = myQsRoot.right.trap;			// TODO
		var qs3 = myQsRoot.left;		// T_Y
		var qs_tr3 = qs3.left;					// tr3 = qs3.left.trap;
		var qs5 = qs3.right;			// T_X: base_segment
		var qs_tr1 = qs5.left;					// tr1 = qs5.left.trap;
		var qs_tr2 = qs5.right;					// tr2 = qs5.right.trap;
		//	T_SINK
		ok( ( myQs.ptNode( { x: 2, y: 5 }, { x: 3, y: 6 }, qs3.left ) == qs_tr3 ), "ptNode A: Sink direct -> qs_tr3" );
		//	T_Y
		ok( ( myQs.ptNode( { x: 2, y: 5 }, { x: 3, y:  6 }, myQsRoot ) == qs_tr4 ), "ptNode A: T_Y(root), above -> qs_tr4" );
		ok( ( myQs.ptNode( { x: 2, y: 0 }, { x: 4, y: -1 }, qs3 ) == qs_tr3 ), "ptNode A: T_Y(qs3), below -> qs_tr3" );
		//		T_Y: 1.end point hit
		ok( ( myQs.ptNode( firstPoint, { x: 4, y: 0 }, qs3 ) == qs_tr3 ), "ptNode A: T_Y(qs3), =vFrom, below -> qs_tr3" );
		//		T_Y: 2.end point hit
		ok( ( myQs.ptNode( secondPoint, { x: 0, y: 5 }, myQsRoot ) == qs_tr4 ), "ptNode A: T_Y(root), =vTo, above -> qs_tr4" );
		//	T_X
		ok( ( myQs.ptNode( { x: 2, y: 3 }, { x: 3, y: 6 }, qs5 ) == qs_tr1 ), "ptNode A: T_X(qs5) -> qs_tr1" );
		ok( ( myQs.ptNode( { x: 2, y: 2 }, { x: 3, y: 6 }, qs5 ) == qs_tr2 ), "ptNode A: T_X(qs5) -> qs_tr2" );
		//		T_X: 1.end point hit - not horizontal
		ok( ( myQs.ptNode( firstPoint, { x: 0, y: 0 }, qs5 ) == qs_tr1 ), "ptNode A: T_X(qs5), =vFrom -> qs_tr1" );
		ok( ( myQs.ptNode( firstPoint, { x: 2, y: 2 }, qs5 ) == qs_tr2 ), "ptNode A: T_X(qs5), =vFrom -> qs_tr2" );
		//		T_X: 2.end point hit - not horizontal
		ok( ( myQs.ptNode( secondPoint, { x: 3, y: 5 }, qs5 ) == qs_tr1 ), "ptNode A: T_X(qs5), =vTo -> qs_tr1" );
		ok( ( myQs.ptNode( secondPoint, { x: 4, y: 5 }, qs5 ) == qs_tr2 ), "ptNode A: T_X(qs5), =vTo -> qs_tr2" );
		//		T_X: 1.end point hit - horizontal
		ok( ( myQs.ptNode( firstPoint, { x: 0, y: 1 }, qs5 ) == qs_tr1 ), "ptNode A: T_X(qs5), =vFrom, horiz -> qs_tr1" );
		ok( ( myQs.ptNode( firstPoint, { x: 2, y: 1 }, qs5 ) == qs_tr2 ), "ptNode A: T_X(qs5), =vFrom, horiz -> qs_tr2" );
		//		T_X: 2.end point hit - horizontal
		ok( ( myQs.ptNode( secondPoint, { x: 2.5, y: 4 }, qs5 ) == qs_tr1 ), "ptNode A: T_X(qs5), =vTo, horiz -> qs_tr1" );
		ok( ( myQs.ptNode( secondPoint, { x: 4, y: 4 }, qs5 ) == qs_tr2 ), "ptNode A: T_X(qs5), =vTo, horiz -> qs_tr2" );
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
		myQsRoot = myQs.setup_segments( base_segment );		// T_Y
		//
		qs_tr4 = myQsRoot.right;					// TODO
		qs3 = myQsRoot.left;		// T_Y
		qs_tr3 = qs3.left;
		qs5 = qs3.right;			// T_X: base_segment
		qs_tr1 = qs5.left;
		qs_tr2 = qs5.right;
		//	T_SINK
		ok( ( myQs.ptNode( { x: 2, y: 5 }, { x: 3, y: 6 }, qs3.left ) == qs_tr3 ), "ptNode B: Sink direct -> qs_tr3" );
		//	T_Y
		ok( ( myQs.ptNode( { x: 2, y: 5 }, { x: 3, y:  6 }, myQsRoot ) == qs_tr4 ), "ptNode B: T_Y(root), above -> qs_tr4" );
		ok( ( myQs.ptNode( { x: 2, y: 0 }, { x: 4, y: -1 }, qs3 ) == qs_tr3 ), "ptNode B: T_Y(qs3), below -> qs_tr3" );
		//		T_Y: 1.end point hit
		ok( ( myQs.ptNode( firstPoint, { x: 0, y: 5 }, myQsRoot ) == qs_tr4 ), "ptNode B: T_Y(root), =vFrom, above -> qs_tr4" );
		//		T_Y: 2.end point hit
		ok( ( myQs.ptNode( secondPoint, { x: 4, y: 0 }, qs3 ) == qs_tr3 ), "ptNode B: T_Y(qs3), =vTo, below -> qs_tr3" );
		//	T_X
		ok( ( myQs.ptNode( { x: 2, y: 2 }, { x: 3, y: 6 }, qs5 ) == qs_tr1 ), "ptNode B: T_X(qs5) -> qs_tr1" );
		ok( ( myQs.ptNode( { x: 2, y: 3 }, { x: 3, y: 6 }, qs5 ) == qs_tr2 ), "ptNode B: T_X(qs5) -> qs_tr2" );
		//		T_X: 1.end point hit - not horizontal
		ok( ( myQs.ptNode( firstPoint, { x: 0, y: 5 }, qs5 ) == qs_tr1 ), "ptNode B: T_X(qs5), =vFrom -> qs_tr1" );
		ok( ( myQs.ptNode( firstPoint, { x: 0, y: 6 }, qs5 ) == qs_tr2 ), "ptNode B: T_X(qs5), =vFrom -> qs_tr2" );
		//		T_X: 2.end point hit - not horizontal
		ok( ( myQs.ptNode( secondPoint, { x: 4, y: -1 }, qs5 ) == qs_tr1 ), "ptNode B: T_X(qs5), =vTo -> qs_tr1" );
		ok( ( myQs.ptNode( secondPoint, { x: 4, y:  0 }, qs5 ) == qs_tr2 ), "ptNode B: T_X(qs5), =vTo -> qs_tr2" );
		//		T_X: 1.end point hit - horizontal
		ok( ( myQs.ptNode( firstPoint, { x: 0, y: 4 }, qs5 ) == qs_tr1 ), "ptNode B: T_X(qs5), =vFrom, horiz -> qs_tr1" );
		ok( ( myQs.ptNode( firstPoint, { x: 2, y: 4 }, qs5 ) == qs_tr2 ), "ptNode B: T_X(qs5), =vFrom, horiz -> qs_tr2" );
		//		T_X: 2.end point hit - horizontal
		ok( ( myQs.ptNode( secondPoint, { x: 2, y: 1 }, qs5 ) == qs_tr1 ), "ptNode B: T_X(qs5), =vTo, horiz -> qs_tr1" );
		ok( ( myQs.ptNode( secondPoint, { x: 4, y: 1 }, qs5 ) == qs_tr2 ), "ptNode B: T_X(qs5), =vTo, horiz -> qs_tr2" );
	}

	
	/**************************************************************************/
	

	function test_assign_depths() {
		var testPolygon = [ { x: 5, y: 5 }, { x: 15, y: 40 }, { x: 45, y: 20 } ];

		var myPolygonData = new PNLTRI.PolygonData( [ testPolygon ] );
		//
		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		var myQsRoot = myQs.getRoot();
		var segListArray = myQs.getSegListArray();
		//
		myQs.add_segment_consistently( segListArray[0], 'assign_depths #0' );
		myQs.add_segment_consistently( segListArray[1], 'assign_depths #1' );
		myQs.add_segment_consistently( segListArray[2], 'assign_depths #2' );
		ok( myPolygonData.allSegsInQueryStructure(), "assign_depths: all segments inserted" );
		//
		var startTrap = myQs.find_first_inside();
		equal( startTrap.trapID, 2, "assign_depths: Start-Trap-ID" );
		//
		//	Main test: standard case
		//
		equal( myQs.minDepth(), -1, "assign_depths: Min depth: -1" );
		equal( myQs.maxDepth(), -1, "assign_depths: Max depth: -1" );
		myQs.assignDepths();			// marks outside trapezoids
		equal( myQs.minDepth(), -1, "assign_depths: Min depth: -1" );
		equal( myQs.maxDepth(), 0, "assign_depths: Max depth: 0" );
		//
		equal( startTrap.depth, -1, "assign_depths: Max depth of startTrap == -1" );		// still unasigned
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot, false, 1 );
		//
		//
		var myQs = new PNLTRI.QueryStructure( new PNLTRI.PolygonData( [ testPolygon ] ) );
		var myQsRoot = myQs.getRoot();
		var segListArray = myQs.getSegListArray();
		//	not closed !!
		myQs.add_segment_consistently( segListArray[0], 'assign_depths #0' );
		myQs.add_segment_consistently( segListArray[1], 'assign_depths #1' );
		//
		//	Main test: all outside
		//
		myQs.assignDepths();			// marks outside trapezoids
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
		equal( qs_tr1.nodetype, PNLTRI.T_Y, "Add#1: nodetype(tr1) -> T_Y" );
		equal( qs_tr1.yval.y, 25, "Add#1: yval = 25" );
		strictEqual( qs_tr1.seg, downward_segment, "Add#1: seg == downward_segment" );
		strictEqual( qs_tr1.right.trap, tr1, "Add#1: right -> OrigTrap(tr1)" );
		strictEqual( qs_tr1.right, tr1.sink, "Add#1: right == sink(OrigTrap(tr1))" );
		strictEqual( qs_tr1.left, qs_tr5, "Add#1: left -> NewTrap(tr5)" );
		strictEqual( qs_tr1.left.trap.uL, tr1, "Add#1: left -> NewTrap(tr5) [uL==tr1]" );
		strictEqual( qs_tr1.left.trap.dL, tr3, "Add#1: left -> NewTrap(tr5) [dL==tr3]" );		*/
		//	lower point inserted -> test_splitNodeAtPoint();		TODO Tests
/*		var tr6 = myQs.getTrapByIdx(5), qs_tr6 = tr6.sink;
		equal( qs_tr3.nodetype, PNLTRI.T_Y, "Add#1: nodetype(tr3) -> T_Y" );
		equal( qs_tr3.yval.y, 10, "Add#1: yval = 10" );
		strictEqual( qs_tr3.seg, downward_segment, "Add#1: seg == downward_segment" );
		strictEqual( qs_tr3.right.trap, tr3, "Add#1: right -> OrigTrap(tr3)" );
		strictEqual( qs_tr3.right, tr3.sink, "Add#1: right == sink(OrigTrap(tr3))" );
		strictEqual( qs_tr3.left, qs_tr6, "Add#1: left -> NewTrap(tr6)" );
		strictEqual( qs_tr3.left.trap.uL, tr3, "Add#1: left -> NewTrap(tr6) [uL==tr3]" );
		ok( !qs_tr3.left.trap.dL, "Add#1: left -> NewTrap(tr6) [dL==null]" );
		ok( !qs_tr3.left.trap.dR, "Add#1: left -> NewTrap(tr6) [dR==null]" );		*/
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
//		showDataStructure( myPolygonData.getVertices(), [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
//		showDataStructure( myPolygonData.getSegments(), [ 'sprev', 'snext', 'mprev', 'mnext' ] );
		//
		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		var myQsRoot = myQs.getRoot();
		var segListArray = myQs.getSegListArray();
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
//		showDataStructure( myPolygonData.getVertices(), [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
//		showDataStructure( myPolygonData.getSegments(), [ 'sprev', 'snext', 'mprev', 'mnext' ] );
		//
		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		var myQsRoot = myQs.getRoot();
		var segListArray = myQs.getSegListArray();
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
//		showDataStructure( myPolygonData.getVertices(), [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
//		showDataStructure( myPolygonData.getSegments(), [ 'sprev', 'snext', 'mprev', 'mnext' ] );
		//
		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		var myQsRoot = myQs.getRoot();
		var segListArray = myQs.getSegListArray();
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
		var segListArray = myQs.getSegListArray().concat();
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
		segListArray = myQs.getSegListArray().concat();
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
//		showDataStructure( myPolygonData.getVertices(), [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
//		showDataStructure( myPolygonData.getSegments(), [ 'sprev', 'snext', 'mprev', 'mnext' ] );
		//
		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		var myQsRoot = myQs.getRoot();
		var segListArray = myQs.getSegListArray();
		//
		myQs.add_segment_consistently( segListArray[0], 'Spec_5 #1' );
		myQs.add_segment_consistently( segListArray[1], 'Spec_5 #2' );
		// complex case: EPSILON > rounding effect on coordinates
		myQs.add_segment_consistently( segListArray[3], 'Spec_5 Main' );
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot, false, 0.4 );
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
		var segListArray = myQs.getSegListArray().concat();
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
		myQs.assignDepths();			// marks outside trapezoids
		equal( myQs.minDepth(), -1, "add_segment_Error: Min depth == -1 (closed polygon)" );		
		//
//		showDataStructure( myQsRoot );
		drawTrapezoids( myQsRoot, false, 1 );
	}

	
	test( "QueryStructure", function() {
		test_inside_polygon();
		test_is_left_of();
		//
		test_init_query_structure_up();
		test_init_query_structure_down();
		test_trap_setAbove();
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
PNLTRI.Trapezoider.prototype.check_trapezoids_segment_orientation = function () {
	return	this.queryStructure.check_trapezoids_segment_orientation();
};
PNLTRI.Trapezoider.prototype.check_trapezoid_neighbors = function ( inTrapId, inSollU0, inSollU1, inSollD0, inSollD1, inTestName ) {
	return	this.queryStructure.check_trapezoid_neighbors( inTrapId, inSollU0, inSollU1, inSollD0, inSollD1, inTestName );
}
// log the random segment sequence
PNLTRI.Trapezoider.prototype.random_sequence_log = function ( inSegListArray ) {
	var logList = inSegListArray.map( function (val) { return val.vFrom.id } );
	console.log( "Random Segment Sequence: ", logList.join(", ") );
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
		equal( trap.math_NH(13,0), 1, "math_NH: 13, 0" );
		equal( trap.math_NH(13,1), 4, "math_NH: 13, 1" );
		equal( trap.math_NH(13,2), 7, "math_NH: 13, 2" );
		//
		equal( trap.math_NH(100000,0), 1, "math_NH: 100000, 0" );
		equal( trap.math_NH(100000,1), 6021, "math_NH: 100000, 1" );
		equal( trap.math_NH(100000,2), 24668, "math_NH: 100000, 2" );
		equal( trap.math_NH(100000,3), 49522, "math_NH: 100000, 3" );
		equal( trap.math_NH(100000,4), 98632, "math_NH: 100000, 4" );
		equal( trap.math_NH(100000,5), 5030159, "math_NH: 100000, 5" );
	}


	function test_trapezoide_polygon( inDataName, inExpectedSegs, inExpectedTraps, inExpectedStartTrap, inDebug ) {
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
		var startTrap = myTrapezoider.trapezoide_polygon();
		var buglist = [];
		//
		ok( myPolygonData.allSegsInQueryStructure(), "trapezoide_polygon ("+inDataName+"): all segments inserted" );
		if ( buglist = myPolygonData.check_segments_consistency() )
			ok( !buglist, "trapezoide_polygon ("+inDataName+") segment consistency: " + buglist.join(", ") );
		equal( myTrapezoider.nbTrapezoids(), inExpectedTraps, "trapezoide_polygon ("+inDataName+"): Number of generated Trapezoids" );
		if ( buglist = myTrapezoider.check_trapezoids_segment_orientation() )
			ok( !buglist, "trapezoide_polygon ("+inDataName+") trapezoid segment consistency: " + buglist.join(", ") );
		equal( startTrap.trapID, inExpectedStartTrap, "trapezoide_polygon ("+inDataName+"): Start-Trap-ID" );
		//
		if ( inDebug > 0 ) {
			drawTrapezoids( startTrap.sink, false, inDebug );
			var myQsRoot = myTrapezoider.getQsRoot();
//			showDataStructure( myQsRoot );
//			drawTrapezoids( myQsRoot, true, inDebug );
			drawTrapezoids( myQsRoot, false, inDebug );
		}
	}


	function test_trapezoide_polygon2() {
		PNLTRI.Math.randomTestSetup();		// set specific random seed for repeatable testing
		//
		var inPolygonChainList = testData.get_polygon_with_holes("article_poly");		// from article [Sei91]
		//
		var myPolygonData = new PNLTRI.PolygonData( inPolygonChainList );
//		showDataStructure( myPolygonData.getVertices(), [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
		//
		var myTrapezoider = new PNLTRI.Trapezoider( myPolygonData );
		myTrapezoider.trapezoide_polygon();
		ok( myPolygonData.allSegsInQueryStructure(), "trapezoid_polygon2: all segments inserted" );
		equal( myTrapezoider.nbTrapezoids(), 41, "trapezoid_polygon2: Number of generated Trapezoids" );
		//
		myTrapezoider.check_trapezoid_neighbors(  0, null, null, 13, 36, "trapezoid_polygon2 #0" );
		myTrapezoider.check_trapezoid_neighbors(  1, 7, null, null, null, "trapezoid_polygon2 #1" );
		myTrapezoider.check_trapezoid_neighbors(  2, 25, 3, 8, null, "trapezoid_polygon2 #2" );
//		myTrapezoider.check_trapezoid_neighbors(  3, null, null, 2, null, "trapezoid_polygon2 #3" );
//		myTrapezoider.check_trapezoid_neighbors(  4, 30, null, 29, null, "trapezoid_polygon2 #4" );
		myTrapezoider.check_trapezoid_neighbors(  3, null, null, null, 2, "trapezoid_polygon2 #3" );
		myTrapezoider.check_trapezoid_neighbors(  4, 30, null, null, 29, "trapezoid_polygon2 #4" );
		myTrapezoider.check_trapezoid_neighbors(  5, 37, null, 16, 24, "trapezoid_polygon2 #5" );
//		myTrapezoider.check_trapezoid_neighbors(  6, 40, null, 27, null, "trapezoid_polygon2 #6" );
		myTrapezoider.check_trapezoid_neighbors(  6, null, 40, null, 27, "trapezoid_polygon2 #6" );
		myTrapezoider.check_trapezoid_neighbors(  7, 29, null, 1, 38, "trapezoid_polygon2 #7" );
		myTrapezoider.check_trapezoid_neighbors(  8, 2, 17, null, null, "trapezoid_polygon2 #8" );
		myTrapezoider.check_trapezoid_neighbors(  9, null, null, 21, null, "trapezoid_polygon2 #9" );
		myTrapezoider.check_trapezoid_neighbors( 10, 36, null, null, null, "trapezoid_polygon2 #10" );
//		myTrapezoider.check_trapezoid_neighbors( 11, 39, null, 30, null, "trapezoid_polygon2 #11" );
//		myTrapezoider.check_trapezoid_neighbors( 12, 36, null, 40, null, "trapezoid_polygon2 #12" );
		myTrapezoider.check_trapezoid_neighbors( 11, 39, null, null, 30, "trapezoid_polygon2 #11" );
		myTrapezoider.check_trapezoid_neighbors( 12, null, 36, null, 40, "trapezoid_polygon2 #12" );
		myTrapezoider.check_trapezoid_neighbors( 13, 0, null, 14, null, "trapezoid_polygon2 #13" );
		myTrapezoider.check_trapezoid_neighbors( 14, 13, null, 19, null, "trapezoid_polygon2 #14" );
//		myTrapezoider.check_trapezoid_neighbors( 15, null, null, 20, null, "trapezoid_polygon2 #15" );
//		myTrapezoider.check_trapezoid_neighbors( 16, 5, null, 22, null, "trapezoid_polygon2 #16" );
//		myTrapezoider.check_trapezoid_neighbors( 17, 21, 23, 8, null, "trapezoid_polygon2 #17" );
		myTrapezoider.check_trapezoid_neighbors( 15, null, null, null, 20, "trapezoid_polygon2 #15" );
		myTrapezoider.check_trapezoid_neighbors( 16, 5, null, null, 22, "trapezoid_polygon2 #16" );
		myTrapezoider.check_trapezoid_neighbors( 17, 21, 23, null, 8, "trapezoid_polygon2 #17" );
		myTrapezoider.check_trapezoid_neighbors( 18, null, null, 23, null, "trapezoid_polygon2 #18" );
		myTrapezoider.check_trapezoid_neighbors( 19, 14, null, 25, 34, "trapezoid_polygon2 #19" );
//		myTrapezoider.check_trapezoid_neighbors( 20, 15, null, 31, null, "trapezoid_polygon2 #20" );
		myTrapezoider.check_trapezoid_neighbors( 20, null, 15, 31, null, "trapezoid_polygon2 #20" );
		myTrapezoider.check_trapezoid_neighbors( 21, 9, null, 17, null, "trapezoid_polygon2 #21" );
//		myTrapezoider.check_trapezoid_neighbors( 22, 16, null, null, null, "trapezoid_polygon2 #22" );
//		myTrapezoider.check_trapezoid_neighbors( 23, 18, 27, 17, null, "trapezoid_polygon2 #23" );
//		myTrapezoider.check_trapezoid_neighbors( 24, 5, null, null, null, "trapezoid_polygon2 #24" );
		myTrapezoider.check_trapezoid_neighbors( 22, null, 16, null, null, "trapezoid_polygon2 #22" );
		myTrapezoider.check_trapezoid_neighbors( 23, 18, 27, null, 17, "trapezoid_polygon2 #23" );
		myTrapezoider.check_trapezoid_neighbors( 24, null, 5, null, null, "trapezoid_polygon2 #24" );
		myTrapezoider.check_trapezoid_neighbors( 25, 19, null, 2, null, "trapezoid_polygon2 #25" );
		myTrapezoider.check_trapezoid_neighbors( 26, null, null, 33, null, "trapezoid_polygon2 #26" );
//		myTrapezoider.check_trapezoid_neighbors( 27, 6, null, 23, null, "trapezoid_polygon2 #27" );
//		myTrapezoider.check_trapezoid_neighbors( 28, 34, null, 35, null, "trapezoid_polygon2 #28" );
		myTrapezoider.check_trapezoid_neighbors( 27, null, 6, null, 23, "trapezoid_polygon2 #27" );
		myTrapezoider.check_trapezoid_neighbors( 28, 34, null, null, 35, "trapezoid_polygon2 #28" );
		myTrapezoider.check_trapezoid_neighbors( 29, 33, 4, 7, 37, "trapezoid_polygon2 #29" );
//		myTrapezoider.check_trapezoid_neighbors( 30, 11, null, 4, null, "trapezoid_polygon2 #30" );
//		myTrapezoider.check_trapezoid_neighbors( 31, 20, 32, 39, null, "trapezoid_polygon2 #31" );
//		myTrapezoider.check_trapezoid_neighbors( 32, null, null, 31, null, "trapezoid_polygon2 #32" );
		myTrapezoider.check_trapezoid_neighbors( 30, null, 11, 4, null, "trapezoid_polygon2 #30" );
		myTrapezoider.check_trapezoid_neighbors( 31, 20, 32, null, 39, "trapezoid_polygon2 #31" );
		myTrapezoider.check_trapezoid_neighbors( 32, null, null, null, 31, "trapezoid_polygon2 #32" );
		myTrapezoider.check_trapezoid_neighbors( 33, 26, null, 29, null, "trapezoid_polygon2 #33" );
//		myTrapezoider.check_trapezoid_neighbors( 34, 19, null, 28, null, "trapezoid_polygon2 #34" );
//		myTrapezoider.check_trapezoid_neighbors( 35, 28, null, null, null, "trapezoid_polygon2 #35" );
//		myTrapezoider.check_trapezoid_neighbors( 36, 0, null, 10, 12, "trapezoid_polygon2 #36" );
//		myTrapezoider.check_trapezoid_neighbors( 37, 29, null, 5, null, "trapezoid_polygon2 #37" );
//		myTrapezoider.check_trapezoid_neighbors( 38, 7, null, null, null, "trapezoid_polygon2 #38" );
//		myTrapezoider.check_trapezoid_neighbors( 39, 31, null, 11, null, "trapezoid_polygon2 #39" );
//		myTrapezoider.check_trapezoid_neighbors( 40, 12, null, 6, null, "trapezoid_polygon2 #40" );
		myTrapezoider.check_trapezoid_neighbors( 34, null, 19, 28, null, "trapezoid_polygon2 #34" );
		myTrapezoider.check_trapezoid_neighbors( 35, null, 28, null, null, "trapezoid_polygon2 #35" );
		myTrapezoider.check_trapezoid_neighbors( 36, null, 0, 10, 12, "trapezoid_polygon2 #36" );
		myTrapezoider.check_trapezoid_neighbors( 37, null, 29, 5, null, "trapezoid_polygon2 #37" );
		myTrapezoider.check_trapezoid_neighbors( 38, null, 7, null, null, "trapezoid_polygon2 #38" );
		myTrapezoider.check_trapezoid_neighbors( 39, null, 31, 11, null, "trapezoid_polygon2 #39" );
		myTrapezoider.check_trapezoid_neighbors( 40, null, 12, null, 6, "trapezoid_polygon2 #40" );
		//
		//
//		var myQsRoot = myTrapezoider.getQsRoot();
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot, false, 1.5 );
	}

	
	test( "Trapezoider for (Simple) Polygons", function() {
		test_math_logstar_n();
		test_math_NH();
		//
		test_trapezoide_polygon( "article_poly", 20, 41, 1, 0 );			// 1.5: from article [Sei91]
		test_trapezoide_polygon( "square_3triangholes", 13, 27, 19, 0 );	// 5; from	"Narkhede A. and Manocha D.", data_1
		test_trapezoide_polygon( "trap_2up_2down", 6, 13, 3, 0 );			// 4: trapezoid with 2 upper and 2 lower neighbors
		test_trapezoide_polygon( "pt_3_diag_max", 7, 15, 10, 0 );			// 4: vertex (6,6) with 3 additional diagonals (max)
		test_trapezoide_polygon( "xy_bad_saw", 39, 79, 14, 0 );				// 2: very inconvenient contour in X- and Y-direction
		//
		test_trapezoide_polygon( "three_error#1", 92, 185, 36, 0 );			// 1; 1.Error, integrating into Three.js (letter "t")
		test_trapezoide_polygon( "three_error#2", 51, 103, 28, 0 );			// 0.7; 2.Error, integrating into Three.js (letter "1")
		test_trapezoide_polygon( "three_error#3", 91, 183, 22, 0 );			// 3000; 3.Error, integrating into Three.js (logbuffer)
		test_trapezoide_polygon( "three_error#4", 102, 205, 15, 0 );		// 1; 4.Error, integrating into Three.js (USA Maine)
		test_trapezoide_polygon( "three_error#4b", 102, 205, 15, 0 );		// 0.04; 4.Error, integrating into Three.js (USA Maine)
		//
//		console.perform();
//		test_trapezoide_polygon( "squares_perftest_mid", 904, 1809, 505, 1 );	// 1: 15x15 Squares in Squares Performance Test
//		console.performEnd();
		// complete trapezoid structure
		test_trapezoide_polygon2();
	});
}


function compute_Trapezoider( inResultTarget ) {
		var myPolygonData = new PNLTRI.PolygonData( [ [
			{ x:10, y:35 }, { x:15, y: 5 },	{ x:22, y:15 },
			{ x:25, y:10 }, { x:35, y:30 },	{ x:20, y:25 },
			] ] );
		//
		var myTrapezoider = new PNLTRI.Trapezoider( myPolygonData );
		var startTrap = myTrapezoider.trapezoide_polygon();
		//
		var myQsRoot = myTrapezoider.getQsRoot();
//		drawTrapezoids( startTrap.sink, false, 1 );
//		showDataStructure( myQsRoot );
		drawTrapezoids( myQsRoot, false, 1 );
}

