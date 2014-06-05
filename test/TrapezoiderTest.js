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
	return	this.trapezoids.length;
};
PNLTRI.QueryStructure.prototype.getTrapByIdx = function ( inIdx ) {
	return	this.trapezoids[inIdx];
};
// Assign a depth to the trapezoids; 0: outside, -1: other;  // future: 1: main polygon, 2: holes
PNLTRI.QueryStructure.prototype.assignDepth = function ( inTrap, inDepth ) {
	if (! inTrap)				return;
	if (inTrap.depth != -1)		return;
	inTrap.depth = inDepth;
	this.assignDepth( inTrap.u0, inDepth );
	this.assignDepth( inTrap.u1, inDepth );
	this.assignDepth( inTrap.d0, inDepth );
	this.assignDepth( inTrap.d1, inDepth );
};
PNLTRI.QueryStructure.prototype.assignDepths = function () {
	this.assignDepth( this.trapezoids[0], 0 );
};
PNLTRI.QueryStructure.prototype.minDepth = function () {
	var myMinDepth = 1000;
	for (var i=0,j=this.trapezoids.length; i<j; i++) {
		if ( this.trapezoids[i].depth < myMinDepth ) {
			myMinDepth = this.trapezoids[i].depth;
		}
	}
	return	myMinDepth;
};
PNLTRI.QueryStructure.prototype.maxDepth = function () {
	return	this.trapezoids[0].depth;
};
// check all trapezoids for link consistency
PNLTRI.QueryStructure.prototype.check_trapezoids_link_consistency = function () {

	var bugList = [];
	
	var currTrap;
	for (var i=0, j=this.trapezoids.length; i<j; i++) {
		currTrap = this.trapezoids[i];
		if ( currTrap.u0 ) {
			if ( currTrap.u0 == currTrap )		{ bugList.push( "ID#"+currTrap.trapID+".u0: self-link" ); };
			if ( currTrap.u0 == currTrap.u1 )	{ bugList.push( "ID#"+currTrap.trapID+".u0 == u1" ); };
			if ( currTrap.u0 == currTrap.d0 )	{ bugList.push( "ID#"+currTrap.trapID+".u0 == d0" ); };
			if ( currTrap.u0 == currTrap.d1 )	{ bugList.push( "ID#"+currTrap.trapID+".u0 == d1" ); };
			if ( ( currTrap.u0.d0 != currTrap ) &&
				 ( currTrap.u0.d1 != currTrap ) )	{
				bugList.push( "ID#"+currTrap.trapID+".u0: reverse dN-Link missing in ID#" + currTrap.u0.trapID );
			}
		}
		if ( currTrap.u1 ) {
			if ( currTrap.u1 == currTrap )		{ bugList.push( "ID#"+currTrap.trapID+".u1: self-link" ); };
			if ( currTrap.u1 == currTrap.d0 )	{ bugList.push( "ID#"+currTrap.trapID+".u1 == d0" ); };
			if ( currTrap.u1 == currTrap.d1 )	{ bugList.push( "ID#"+currTrap.trapID+".u1 == d1" ); };
			if ( ( currTrap.u1.d0 != currTrap ) &&
				 ( currTrap.u1.d1 != currTrap ) )	{
				bugList.push( "ID#"+currTrap.trapID+".u1: reverse dN-Link missing in ID#" + currTrap.u1.trapID );
			}
		}
		if ( currTrap.d0 ) {
			if ( currTrap.d0 == currTrap )		{ bugList.push( "ID#"+currTrap.trapID+".d0: self-link" ); };
			if ( currTrap.d0 == currTrap.d1 )	{ bugList.push( "ID#"+currTrap.trapID+".d0 == d1" ); };
			if ( ( currTrap.d0.u0 != currTrap ) &&
				 ( currTrap.d0.u1 != currTrap ) )	{
				bugList.push( "ID#"+currTrap.trapID+".d0: reverse uN-Link missing in ID#" + currTrap.d0.trapID );
			}
		}
		if ( currTrap.d1 ) {
			if ( currTrap.d1 == currTrap )		{ bugList.push( "ID#"+currTrap.trapID+".d1: self-link" ); };
			if ( ( currTrap.d1.u0 != currTrap ) &&
				 ( currTrap.d1.u1 != currTrap ) )	{
				bugList.push( "ID#"+currTrap.trapID+".d1: reverse uN-Link missing in ID#" + currTrap.d1.trapID );
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
	for (var i=0; i<this.trapezoids.length; i++) {
		currTrap = this.trapezoids[i];
		rightDir = ( currTrap.rseg ) ? currTrap.rseg.upward : false;
		leftDir = ( currTrap.lseg ) ? currTrap.lseg.upward : true;
		if ( rightDir == leftDir )		bugList.push( "ID#"+currTrap.trapID );
	}
	
	return	( bugList.length == 0 ) ? null : bugList;
};
// check if trapezoid has specific neighbors
PNLTRI.QueryStructure.prototype.check_trapezoid_neighbors = function ( inTrapId, inSollU0, inSollU1, inSollD0, inSollD1, inTestName ) {
	var trapezoid = this.getTrapByIdx(inTrapId);
	if ( trapezoid ) {
		var u0ID = trapezoid.u0 ? trapezoid.u0.trapID : null;
		var u1ID = trapezoid.u1 ? trapezoid.u1.trapID : null;
		var d0ID = trapezoid.d0 ? trapezoid.d0.trapID : null;
		var d1ID = trapezoid.d1 ? trapezoid.d1.trapID : null;
		//
		equal( u0ID, inSollU0, inTestName + ": u0 == " + inSollU0 );
		equal( u1ID, inSollU1, inTestName + ": u1 == " + inSollU1 );
		equal( d0ID, inSollD0, inTestName + ": d0 == " + inSollD0 );
		equal( d1ID, inSollD1, inTestName + ": d1 == " + inSollD1 );
	} else {
		ok( trapezoid, inTestName + ": trapezoid exists" );
	}
}



// #############################################################################

function test_QueryStructure() {
	
	/* TODO: Tests for PNLTRI.QueryStructure.cloneTrap */

	function test_inside_polygon() {
		var	qs = new PNLTRI.QueryStructure();
		var myTrap;
		myTrap = {};
		ok( !qs.inside_polygon( myTrap ), "inside_polygon: Trap empty!" );
		myTrap = { lseg: {} };
		ok( !qs.inside_polygon( myTrap ), "inside_polygon: Trap no rseg!" );
		myTrap = { rseg: {} };
		ok( !qs.inside_polygon( myTrap ), "inside_polygon: Trap no lseg!" );
		myTrap = { lseg: {}, rseg: {}, u0: {}, d0: {} };
		ok( !qs.inside_polygon( myTrap ), "inside_polygon: Trap no triangle!" );
		myTrap = { lseg: {}, rseg: { vFrom: { pt: { x:0, y:10 }}, vTo: { pt: { x:10, y:0 }}, upward: false } };
		ok( !qs.inside_polygon( myTrap ), "inside_polygon: Trap rseg going downwards!" );
		myTrap = { lseg: {}, rseg: { vFrom: { pt: { x:10, y:0 }}, vTo: { pt: { x:0, y:10 }}, upward: true } };
		ok( qs.inside_polygon( myTrap ), "inside_polygon: Trap rseg going upwards!" );
	}

	function test_is_left_of() {
		var	qs = new PNLTRI.QueryStructure();
		// going UPwards
		var	segment = { vFrom: { pt: { x: 10, y: 10 }}, vTo: { pt: { x: 17, y: 13 }}, upward: true };
		//	y equal
		ok( qs.is_left_of(segment, { x: 0, y: 10 } ) > 0,  "is_left_of:  0, 10 (yes)" );
		ok( qs.is_left_of(segment, { x: 0, y: 13 } ) > 0,  "is_left_of:  0, 13 (yes)" );
		ok( qs.is_left_of(segment, { x: 20, y: 10 } ) < 0, "is_left_of: 20, 10 (no)" );
		ok( qs.is_left_of(segment, { x: 20, y: 13 } ) < 0, "is_left_of: 20, 13 (no)" );
		//
		ok( qs.is_left_of(segment, { x: 0, y: 10 }, true ) > 0,  "is_left_of:  0, 10 (yes, between Y)" );
		ok( qs.is_left_of(segment, { x: 0, y: 13 }, true ) > 0,  "is_left_of:  0, 13 (yes, between Y)" );
		ok( qs.is_left_of(segment, { x: 20, y: 10 }, true ) < 0, "is_left_of: 20, 10 (no, between Y)" );
		ok( qs.is_left_of(segment, { x: 20, y: 13 }, true ) < 0, "is_left_of: 20, 13 (no, between Y)" );
		//	on the line
		ok( qs.is_left_of(segment, { x: 13.5, y: 11.5 } ) == 0,  "is_left_of:  13.5, 11.5 (co-linear)" );
		ok( qs.is_left_of(segment, { x: 13.5, y: 11.5 }, true ) == 0,  "is_left_of:  13.5, 11.5 (co-linear, between Y)" );
		ok( qs.is_left_of(segment, { x:  3, y:  7 } ) == 0, "is_left_of:  3,  7 (co-linear)" );
		ok( qs.is_left_of(segment, { x: 24, y: 16 } ) == 0, "is_left_of: 24, 16 (co-linear)" );
		//	general case
		//		< x0
		ok( qs.is_left_of(segment, { x: 0, y:  0 } ) < 0, "is_left_of: 0,  0 (no)" );
		ok( qs.is_left_of(segment, { x: 4, y:  8 } ) > 0, "is_left_of: 4,  8 (yes)" );
		ok( qs.is_left_of(segment, { x: 7, y: 11 } ) > 0, "is_left_of: 7, 11 (yes)" );
		ok( qs.is_left_of(segment, { x: 7, y: 11 }, true ) > 0, "is_left_of: 7, 11 (yes, between Y)" );
		ok( qs.is_left_of(segment, { x: 6, y: 15 } ) > 0, "is_left_of: 6, 15 (yes)" );
		//		x0 <  < x1
		ok( qs.is_left_of(segment, { x: 12, y:  8 } ) < 0, "is_left_of: 12,  8 (no)" );
		ok( qs.is_left_of(segment, { x: 15, y: 12 } ) < 0, "is_left_of: 15, 12 (no)" );
		ok( qs.is_left_of(segment, { x: 15, y: 12 }, true ) < 0, "is_left_of: 15, 12 (no, between Y)" );
		ok( qs.is_left_of(segment, { x: 12, y: 11 } ) > 0, "is_left_of: 12, 11 (yes)" );
		ok( qs.is_left_of(segment, { x: 12, y: 11 }, true ) > 0, "is_left_of: 12, 11 (yes, between Y)" );
		ok( qs.is_left_of(segment, { x: 14, y: 15 } ) > 0, "is_left_of: 14, 15 (yes)" );
		//		> x1
		ok( qs.is_left_of(segment, { x: 25, y:  8 } ) < 0, "is_left_of: 12,  8 (no)" );
		ok( qs.is_left_of(segment, { x: 23, y: 12 } ) < 0, "is_left_of: 15, 12 (no)" );
		ok( qs.is_left_of(segment, { x: 23, y: 12 }, true ) < 0, "is_left_of: 15, 12 (no, between Y)" );
		ok( qs.is_left_of(segment, { x: 20, y: 14 } ) < 0, "is_left_of: 12, 11 (no)" );
		ok( qs.is_left_of(segment, { x: 21, y: 15 } ) > 0, "is_left_of: 21, 15 (yes)" );
		//
		// going DOWNwards
		var	segment = { vFrom: { pt: { x: 17, y: 13 }}, vTo: { pt: { x: 10, y: 10 }}, upward: false };
		//	y equal
		ok( qs.is_left_of(segment, { x: 0, y: 10 } ) > 0,  "is_left_of:  0, 10 (yes)" );
		ok( qs.is_left_of(segment, { x: 0, y: 13 } ) > 0,  "is_left_of:  0, 13 (yes)" );
		ok( qs.is_left_of(segment, { x: 20, y: 10 } ) < 0, "is_left_of: 20, 10 (no)" );
		ok( qs.is_left_of(segment, { x: 20, y: 13 } ) < 0, "is_left_of: 20, 13 (no)" );
		//
		ok( qs.is_left_of(segment, { x: 0, y: 10 }, true ) > 0,  "is_left_of:  0, 10 (yes, between Y)" );
		ok( qs.is_left_of(segment, { x: 0, y: 13 }, true ) > 0,  "is_left_of:  0, 13 (yes, between Y)" );
		ok( qs.is_left_of(segment, { x: 20, y: 10 }, true ) < 0, "is_left_of: 20, 10 (no, between Y)" );
		ok( qs.is_left_of(segment, { x: 20, y: 13 }, true ) < 0, "is_left_of: 20, 13 (no, between Y)" );
		//	on the line
		ok( qs.is_left_of(segment, { x: 13.5, y: 11.5 } ) == 0,  "is_left_of:  13.5, 11.5 (co-linear)" );
		ok( qs.is_left_of(segment, { x: 13.5, y: 11.5 }, true ) == 0,  "is_left_of:  13.5, 11.5 (co-linear, between Y)" );
		ok( qs.is_left_of(segment, { x:  3, y:  7 } ) == 0, "is_left_of:  3,  7 (co-linear)" );
		ok( qs.is_left_of(segment, { x: 24, y: 16 } ) == 0, "is_left_of: 24, 16 (co-linear)" );
		//	general case
		//		< x0
		ok( qs.is_left_of(segment, { x: 0, y:  0 } ) < 0, "is_left_of: 0,  0 (no)" );
		ok( qs.is_left_of(segment, { x: 4, y:  8 } ) > 0, "is_left_of: 4,  8 (yes)" );
		ok( qs.is_left_of(segment, { x: 7, y: 11 } ) > 0, "is_left_of: 7, 11 (yes)" );
		ok( qs.is_left_of(segment, { x: 7, y: 11 }, true ) > 0, "is_left_of: 7, 11 (yes, between Y)" );
		ok( qs.is_left_of(segment, { x: 6, y: 15 } ) > 0, "is_left_of: 6, 15 (yes)" );
		//		x0 <  < x1
		ok( qs.is_left_of(segment, { x: 12, y:  8 } ) < 0, "is_left_of: 12,  8 (no)" );
		ok( qs.is_left_of(segment, { x: 15, y: 12 } ) < 0, "is_left_of: 15, 12 (no)" );
		ok( qs.is_left_of(segment, { x: 15, y: 12 }, true ) < 0, "is_left_of: 15, 12 (no, between Y)" );
		ok( qs.is_left_of(segment, { x: 12, y: 11 } ) > 0, "is_left_of: 12, 11 (yes)" );
		ok( qs.is_left_of(segment, { x: 12, y: 11 }, true ) > 0, "is_left_of: 12, 11 (yes, between Y)" );
		ok( qs.is_left_of(segment, { x: 14, y: 15 } ) > 0, "is_left_of: 14, 15 (yes)" );
		//		> x1
		ok( qs.is_left_of(segment, { x: 25, y:  8 } ) < 0, "is_left_of: 12,  8 (no)" );
		ok( qs.is_left_of(segment, { x: 23, y: 12 } ) < 0, "is_left_of: 15, 12 (no)" );
		ok( qs.is_left_of(segment, { x: 23, y: 12 }, true ) < 0, "is_left_of: 15, 12 (no, between Y)" );
		ok( qs.is_left_of(segment, { x: 20, y: 14 } ) < 0, "is_left_of: 12, 11 (no)" );
		ok( qs.is_left_of(segment, { x: 21, y: 15 } ) > 0, "is_left_of: 21, 15 (yes)" );
	}

	/*    
	 *                4
	 *   -----------------------------------
	 *  		    /
	 *  	1	   /        2
	 *  		  /
	 *   -----------------------------------
	 *                3
	 */
	function test_init_query_structure_up() {
		// going UPwards
		var	base_segment = { vFrom: { pt: { x: 1, y: 1 }},
							  vTo: { pt: { x: 3, y: 4 }},
							  upward: true
							  }
		// segment chain
		var thirdVertex = { pt: { x: 2, y: 4 } };
		base_segment.snext = { vFrom: base_segment.vTo, vTo: thirdVertex, upward: false };
		base_segment.sprev = { vFrom: thirdVertex, vTo: base_segment.vFrom, upward: false };
		base_segment.snext.sprev = base_segment.sprev.snext = base_segment;
		base_segment.snext.snext = base_segment.sprev;
		base_segment.sprev.sprev = base_segment.snext;
		//
		var qs = new PNLTRI.QueryStructure();
		var myQsRoot = qs.setup_segments( base_segment );
//		showDataStructure( myQsRoot );
		ok( base_segment.is_inserted, "init_query_structure_up: Segment inserted" );
		// segMax(vTo): root-Node
		equal( myQsRoot.nodetype, PNLTRI.T_Y, "init_query_structure_up: root: Y-Node" );
		equal( myQsRoot.yval, base_segment.vTo.pt, "init_query_structure_up: root: yval = vTo.pt" );
		// top(tr4): above root
		var qs2 = myQsRoot.right;
		equal( qs2.nodetype, PNLTRI.T_SINK, "init_query_structure_up: root.above: SINK (top: tr4)" );
			// tr4
		var tr4 = qs2.trap;
		equal( tr4.sink, qs2, "init_query_structure_up: root.above->tr.sink: this qs" );
		equal( tr4.hiPt.y, Number.POSITIVE_INFINITY, "init_query_structure_up: root.above->tr.hiPt.y: +INFINITY" );
		equal( tr4.loPt, base_segment.vTo.pt, "init_query_structure_up: root.above->tr.loPt: vTo.pt" );
		// segMin(vFrom): below root
		var qs3 = myQsRoot.left;
		equal( qs3.nodetype, PNLTRI.T_Y, "init_query_structure_up: root.below: Y-Node" );
		equal( qs3.yval, base_segment.vFrom.pt, "init_query_structure_up: root.below: yval = vFrom.pt" );
		//
		// bottom(tr3): below segMin(qs3)
		var qs4 = qs3.left;
		equal( qs4.nodetype, PNLTRI.T_SINK, "init_query_structure_up: segMin.below: SINK (bottom: tr3)" );
			// tr3
		var tr3 = qs4.trap;
		equal( tr3.sink, qs4, "init_query_structure_up: segMin.below->tr.sink: this qs" );
		equal( tr3.loPt.y, Number.NEGATIVE_INFINITY, "init_query_structure_up: segMin.below->tr.loPt.y: -INFINITY" );
		equal( tr3.hiPt, base_segment.vFrom.pt, "init_query_structure_up: segMin.below->tr.hiPt: vFrom.pt" );
		//
		// Segment - below segMax, above segMin
		var qs5 = qs3.right;
		equal( qs5.nodetype, PNLTRI.T_X, "init_query_structure_up: segment: X-Node" );
		equal( qs5.seg, base_segment, "init_query_structure_up: segment.seg -> inSegment" );
		//
		// left(tr1): segment.left(qs5)
		var qs6 = qs5.left;
		equal( qs6.nodetype, PNLTRI.T_SINK, "init_query_structure_up: segment.left: SINK (left: tr1)" );
			// tr1
		var tr1 = qs6.trap;
		equal( tr1.sink, qs6, "init_query_structure_up: segment.left->tr.sink: this qs" );
		equal( tr1.rseg, base_segment, "init_query_structure_up: segment.left->tr.rseg: inSegment" );
		equal( tr1.hiPt, base_segment.vTo.pt, "init_query_structure_up: segment.left->tr.hiPt: vTo.pt" );
		equal( tr1.loPt, base_segment.vFrom.pt, "init_query_structure_up: segment.left->tr.loPt: vFrom.pt" );
		//
		// right(tr2): segment.right(qs5)
		var qs7 = qs5.right;
		equal( qs7.nodetype, PNLTRI.T_SINK, "init_query_structure_up: segment.right: SINK (right: tr2)" );
			// tr2
		var tr2 = qs7.trap;
		equal( tr2.sink, qs7, "init_query_structure_up: segment.right->tr.sink: this qs" );
		equal( tr2.lseg, base_segment, "init_query_structure_up: segment.right->tr.lseg: inSegment" );
		equal( tr2.hiPt, base_segment.vTo.pt, "init_query_structure_up: segment.right->tr.hiPt: vTo.pt" );
		equal( tr2.loPt, base_segment.vFrom.pt, "init_query_structure_up: segment.right->tr.loPt: vFrom.pt" );
		//
		//	Trapezoid-Nachbarschaft
		equal( tr1.u0, tr4, "init_query_structure_up: left.up: top(tr4)" );
		equal( tr1.d0, tr3, "init_query_structure_up: left.down: bottom(tr3)" );
		equal( tr2.u0, tr4, "init_query_structure_up: right.up: top(tr4)" );
		equal( tr2.d0, tr3, "init_query_structure_up: right.down: bottom(tr3)" );
		equal( tr3.u0, tr1, "init_query_structure_up: bottom.up#1: left(tr1)" );
		equal( tr3.u1, tr2, "init_query_structure_up: bottom.up#2: right(tr2)" );
		equal( tr4.d0, tr1, "init_query_structure_up: top.down#1: left(tr1)" );
		equal( tr4.d1, tr2, "init_query_structure_up: top.down#2: right(tr2)" );
		//
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
	}

	/*    
	 *                4
	 *   -----------------------------------
	 *  		  \
	 *  	1	   \        2
	 *  		    \
	 *   -----------------------------------
	 *                3
	 */
	function test_init_query_structure_down() {
		// going DOWNwards
		var	base_segment = { vFrom: { pt: { x: 1, y: 4 }},
							  vTo: { pt: { x: 3, y: 1 }},
							  upward: false
							  }
		// segment chain
		var thirdVertex = { pt: { x: 3, y: 3 }};
		base_segment.snext = { vFrom: base_segment.vTo, vTo: thirdVertex, upward: true };
		base_segment.sprev = { vFrom: thirdVertex, vTo: base_segment.vFrom, upward: true };
		base_segment.snext.sprev = base_segment.sprev.snext = base_segment;
		base_segment.snext.snext = base_segment.sprev;
		base_segment.sprev.sprev = base_segment.snext;
		//
		var qs = new PNLTRI.QueryStructure();
		var myQsRoot = qs.setup_segments( base_segment );
		ok( base_segment.is_inserted, "init_query_structure_down: Segment inserted" );
		// segMax(vFrom): root-Node
		equal( myQsRoot.yval, base_segment.vFrom.pt, "init_query_structure_down: root: yval = vFrom.pt" );
		// top(tr4): above root
		var tr4 = myQsRoot.right.trap;
		equal( tr4.loPt, base_segment.vFrom.pt, "init_query_structure_down: root.above->tr.loPt: vFrom.pt" );
		// segMin(vTo): below root
		var qs3 = myQsRoot.left;
		equal( qs3.yval, base_segment.vTo.pt, "init_query_structure_down: root.below: yval = vTo.pt" );
		//
		// bottom(tr3): below segMin(qs3)
		var tr3 = qs3.left.trap;
		equal( tr3.hiPt, base_segment.vTo.pt, "init_query_structure_down: segMin.below->tr.hiPt: vTo.pt" );
		//
		// Segment - below segMax, above segMin
		var qs5 = qs3.right;
		//
		// left(tr1): segment.left(qs5)
		var tr1 = qs5.left.trap;
		equal( tr1.hiPt, base_segment.vFrom.pt, "init_query_structure_down: segment.left->tr.hiPt: vFrom.pt" );
		equal( tr1.loPt, base_segment.vTo.pt, "init_query_structure_down: segment.left->tr.loPt: vTo.pt" );
		//
		// right(tr2): segment.right(qs5)
		var tr2 = qs5.right.trap;
		equal( tr2.hiPt, base_segment.vFrom.pt, "init_query_structure_down: segment.right->tr.hiPt: vFrom.pt" );
		equal( tr2.loPt, base_segment.vTo.pt, "init_query_structure_down: segment.right->tr.loPt: vTo.pt" );
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
		var	base_segment = { vFrom: { pt: { x: 1, y: 4 }},
							  vTo: { pt: { x: 3, y: 1 }},
							  upward: false
							  }
		// segment chain
		var thirdVertex = { pt: { x: 3, y: 3 }};
		base_segment.snext = { vFrom: base_segment.vTo, vTo: thirdVertex, upward: true };
		base_segment.sprev = { vFrom: thirdVertex, vTo: base_segment.vFrom, upward: true };
		base_segment.snext.sprev = base_segment.sprev.snext = base_segment;
		base_segment.snext.snext = base_segment.sprev;
		base_segment.sprev.sprev = base_segment.snext;
		//
		var qs = new PNLTRI.QueryStructure();
		var myQsRoot = qs.setup_segments( base_segment );
		ok( base_segment.is_inserted, "trap_setAbove: Segment inserted" );
		// get existing Trapezoids
		var tr0 = qs.getTrapByIdx(0);
		var tr1 = qs.getTrapByIdx(1);
		var tr2 = qs.getTrapByIdx(2);
		var tr3 = qs.getTrapByIdx(3);
		// test exchangeability
		ok( ( tr2.u0 == tr1 ), "trap_setAbove: tr2.u0 -> tr1" );
		ok( ( tr2.u1 == tr3 ), "trap_setAbove: tr2.u1 -> tr3" );
		tr2.setAbove( tr2.u1, tr2.u0 );
		ok( ( tr2.u0 == tr3 ), "trap_setAbove: tr2.u0 -> tr3" );
		ok( ( tr2.u1 == tr1 ), "trap_setAbove: tr2.u1 -> tr1" );
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
		var	base_segment = { vFrom: { pt: { x: 1, y: 4 }},
							  vTo: { pt: { x: 3, y: 1 }},
							  upward: false
							  }
		// segment chain
		var thirdVertex = { pt: { x: 3, y: 3 }};
		base_segment.snext = { vFrom: base_segment.vTo, vTo: thirdVertex, upward: true };
		base_segment.sprev = { vFrom: thirdVertex, vTo: base_segment.vFrom, upward: true };
		base_segment.snext.sprev = base_segment.sprev.snext = base_segment;
		base_segment.snext.snext = base_segment.sprev;
		base_segment.sprev.sprev = base_segment.snext;
		//
		var qs = new PNLTRI.QueryStructure();
		var myQsRoot = qs.setup_segments( base_segment );
		ok( base_segment.is_inserted, "trap_splitOffLower: Segment inserted" );
		// get existing Trapezoids
		var tr4 = qs.getTrapByIdx(0);		// TODO
		var tr1 = qs.getTrapByIdx(1);
		var tr2 = qs.getTrapByIdx(3);
		var tr3 = qs.getTrapByIdx(2);
		//
		//	Test: split tr1
		var tr1u0 = tr1.u0;
		var tr1hi = tr1.hiPt;
		var tr1lo = tr1.loPt;
		var tr1d0 = tr1.d0;
		ok( ( tr1d0 == tr3 ), "trap_splitOffLower: tr1.d0 == tr3" );
		var splitPt1 = { x: 2 , y: 2 };
		var tr1b = tr1.splitOffLower( splitPt1 );
		strictEqual( tr1.lseg, tr1b.lseg, "trap_splitOffLower: lseg unchanged" );
		strictEqual( tr1.rseg, tr1b.rseg, "trap_splitOffLower: rseg unchanged" );
		strictEqual( tr1.hiPt, tr1hi, "trap_splitOffLower: tr1.hiPt unchanged" );
		strictEqual( tr1.loPt, splitPt1, "trap_splitOffLower: tr1.loPt == splitPt1" );
		strictEqual( tr1b.hiPt, splitPt1, "trap_splitOffLower: tr1b.hiPt == splitPt1" );
		strictEqual( tr1b.loPt, tr1lo, "trap_splitOffLower: tr1b.loPt unchanged" );
		//
		strictEqual( tr1.sink, tr1b.sink, "trap_splitOffLower: sink equal" );
		strictEqual( tr1.usave, tr1b.usave, "trap_splitOffLower: usave equal" );
		strictEqual( tr1.uside, tr1b.uside, "trap_splitOffLower: uside equal" );
		//
		strictEqual( tr1.u0, tr1u0, "trap_splitOffLower: tr1.u0 unchanged" );
		ok( !tr1.u1, "trap_splitOffLower: tr1.u1 unchanged" );
		strictEqual( tr1.d0, tr1b, "trap_splitOffLower: tr1.d0 == tr1b" );
		ok( !tr1.d1, "trap_splitOffLower: tr1.d1 null" );
		//
		strictEqual( tr1b.u0, tr1, "trap_splitOffLower: tr1b.u0 == tr1" );
		ok( !tr1b.u1, "trap_splitOffLower: tr1.u1 null" );
		strictEqual( tr1b.d0, tr1d0, "trap_splitOffLower: tr1b.d0 == tr1d0" );
		ok( !tr1b.d1, "trap_splitOffLower: tr1b.d1 null" );
		//
		strictEqual( tr1d0.u0, tr1b, "trap_splitOffLower: tr1d0.u0 == tr1b" );
		ok( ( tr1d0.u1 == tr2 ), "trap_splitOffLower: tr1d0.u1 == tr2" );
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
		//
		//	Test: split tr2
		var tr2u0 = tr2.u0;
		var tr2hi = tr2.hiPt;
		var tr2lo = tr2.loPt;
		var tr2d0 = tr2.d0;
		strictEqual( tr2d0, tr3, "trap_splitOffLower: tr2.d0 == tr3" );
		var splitPt2 = { x: 2 , y: 3 };
		var tr2b = tr2.splitOffLower( splitPt2 );
		strictEqual( tr2.lseg, tr2b.lseg, "trap_splitOffLower: lseg unchanged" );
		strictEqual( tr2.rseg, tr2b.rseg, "trap_splitOffLower: rseg unchanged" );
		strictEqual( tr2.hiPt, tr2hi, "trap_splitOffLower: tr2.hiPt unchanged" );
		strictEqual( tr2.loPt, splitPt2, "trap_splitOffLower: tr2.loPt == splitPt2" );
		strictEqual( tr2b.hiPt, splitPt2, "trap_splitOffLower: tr2b.hiPt == splitPt2" );
		strictEqual( tr2b.loPt, tr2lo, "trap_splitOffLower: tr2b.loPt unchanged" );
		//
		strictEqual( tr2.sink, tr2b.sink, "trap_splitOffLower: sink equal" );
		strictEqual( tr2.usave, tr2b.usave, "trap_splitOffLower: usave equal" );
		strictEqual( tr2.uside, tr2b.uside, "trap_splitOffLower: uside equal" );
		//
		strictEqual( tr2.u0, tr2u0, "trap_splitOffLower: tr2.u0 unchanged" );
		ok( !tr2.u1, "trap_splitOffLower: tr2.u1 unchanged" );
		strictEqual( tr2.d0, tr2b, "trap_splitOffLower: tr2.d0 == tr2b" );
		ok( !tr2.d1, "trap_splitOffLower: tr2.d1 null" );
		//
		strictEqual( tr2b.u0, tr2, "trap_splitOffLower: tr2b.u0 == tr2" );
		ok( !tr2b.u1, "trap_splitOffLower: tr2.u1 null" );
		strictEqual( tr2b.d0, tr2d0, "trap_splitOffLower: tr2b.d0 == tr2d0" );
		ok( !tr2b.d1, "trap_splitOffLower: tr2b.d1 null" );
		//
		ok( ( tr2d0.u0 == tr1b ), "trap_splitOffLower: tr2d0.u0 == tr1b" );
		ok( ( tr2d0.u1 == tr2b ), "trap_splitOffLower: tr2d0.u1 == tr2b" );
		//
		//	Test: split tr3
		var tr3u0 = tr3.u0;
		var tr3u1 = tr3.u1;
		var tr3hi = tr3.hiPt;
		var tr3lo = tr3.loPt;
		ok( !tr3.d0, "trap_splitOffLower: tr3.d0 undefined" );
		ok( !tr3.d1, "trap_splitOffLower: tr3.d1 undefined" );
		var splitPt3 = { x: 0 , y: 0 };
		var tr3b = tr3.splitOffLower( splitPt3 );
		strictEqual( tr3.lseg, tr3b.lseg, "trap_splitOffLower: lseg unchanged" );
		strictEqual( tr3.rseg, tr3b.rseg, "trap_splitOffLower: rseg unchanged" );
		strictEqual( tr3.hiPt, tr3hi, "trap_splitOffLower: tr3.hiPt unchanged" );
		strictEqual( tr3.loPt, splitPt3, "trap_splitOffLower: tr3.loPt == splitPt3" );
		strictEqual( tr3b.hiPt, splitPt3, "trap_splitOffLower: tr3b.hiPt == splitPt3" );
		strictEqual( tr3b.loPt, tr3lo, "trap_splitOffLower: tr3b.loPt unchanged" );
		//
		strictEqual( tr3.sink, tr3b.sink, "trap_splitOffLower: sink equal" );
		strictEqual( tr3.usave, tr3b.usave, "trap_splitOffLower: usave equal" );
		strictEqual( tr3.uside, tr3b.uside, "trap_splitOffLower: uside equal" );
		//
		strictEqual( tr3.u0, tr3u0, "trap_splitOffLower: tr3.u0 unchanged" );
		strictEqual( tr3.u1, tr3u1, "trap_splitOffLower: tr3.u1 unchanged" );
		strictEqual( tr3.d0, tr3b, "trap_splitOffLower: tr3.d0 == tr3b" );
		ok( !tr3.d1, "trap_splitOffLower: tr3.d1 null" );
		//
		strictEqual( tr3b.u0, tr3, "trap_splitOffLower: tr3b.u0 == tr3" );
		ok( !tr3b.u1, "trap_splitOffLower: tr3.u1 null" );
		ok( !tr3b.d0, "trap_splitOffLower: tr3b.d0 null" );
		ok( !tr3b.d1, "trap_splitOffLower: tr3b.d1 null" );
		//
		//	Test: split tr4
		var tr4hi = tr4.hiPt;
		var tr4lo = tr4.loPt;
		var tr4d0 = tr4.d0;
		var tr4d1 = tr4.d1;
		ok( !tr4.u0, "trap_splitOffLower: tr4.u0 undefined" );
		ok( !tr4.u1, "trap_splitOffLower: tr4.u1 undefined" );
		var splitPt4 = { x: 2 , y: 5 };
		var tr4b = tr4.splitOffLower( splitPt4 );
		strictEqual( tr4.lseg, tr4b.lseg, "trap_splitOffLower: lseg unchanged" );
		strictEqual( tr4.rseg, tr4b.rseg, "trap_splitOffLower: rseg unchanged" );
		strictEqual( tr4.hiPt, tr4hi, "trap_splitOffLower: tr4.hiPt unchanged" );
		strictEqual( tr4.loPt, splitPt4, "trap_splitOffLower: tr4.loPt == splitPt4" );
		strictEqual( tr4b.hiPt, splitPt4, "trap_splitOffLower: tr4b.hiPt == splitPt4" );
		strictEqual( tr4b.loPt, tr4lo, "trap_splitOffLower: tr4b.loPt unchanged" );
		//
		strictEqual( tr4.sink, tr4b.sink, "trap_splitOffLower: sink equal" );
		strictEqual( tr4.usave, tr4b.usave, "trap_splitOffLower: usave equal" );
		strictEqual( tr4.uside, tr4b.uside, "trap_splitOffLower: uside equal" );
		//
		ok( !tr4.u0, "trap_splitOffLower: tr4.u0 unchanged" );
		ok( !tr4.u1, "trap_splitOffLower: tr4.u1 unchanged" );
		strictEqual( tr4.d0, tr4b, "trap_splitOffLower: tr4.d0 == tr4b" );
		ok( !tr4.d1, "trap_splitOffLower: tr4.d1 null" );
		//
		strictEqual( tr4b.u0, tr4, "trap_splitOffLower: tr4b.u0 == tr4" );
		ok( !tr4b.u1, "trap_splitOffLower: tr4.u1 null" );
		strictEqual( tr4b.d0, tr4d0, "trap_splitOffLower: tr4b.d0 == tr4d0" );
		strictEqual( tr4b.d1, tr4d1, "trap_splitOffLower: tr4b.d1 == tr4d1" );
		//
		ok( ( tr4d0.u0 == tr4b ), "trap_splitOffLower: tr4d0.u0 == tr4b" );
		ok( ( tr4d1.u0 == tr4b ), "trap_splitOffLower: tr4d1.u1 == tr4b" );
	}

	function test_splitNodeAtPoint1() {
		// going UPwards
		var	base_segment = { vFrom: { pt: { x: 20, y: 20 }}, vTo: { pt: { x: 30, y: 40 }}, upward: true }
		// going DOWNwards - with exchanged coordinates
		var	downward_segment = { vFrom: { pt: { x: 15, y: 10 }}, vTo: { pt: { x: 10, y: 25 }}, upward: true }
		// segment chain
		base_segment.snext = downward_segment.sprev = { vFrom: base_segment.vTo, vTo: downward_segment.vFrom, upward: false,
														sprev: base_segment, snext: downward_segment };
		base_segment.sprev = downward_segment.snext = { vFrom: downward_segment.vTo, vTo: base_segment.vFrom, upward: false,
														sprev: downward_segment, snext: base_segment };
		//
		var qs = new PNLTRI.QueryStructure();
		var myQsRoot = qs.setup_segments( base_segment );
		//
		// precheck of correct Trapezoids
		var tr1 = qs.getTrapByIdx(1), qs_tr1 = tr1.sink;		// TODO
		ok( ( qs.ptNode( downward_segment.vTo.pt, downward_segment.vFrom.pt, myQsRoot ) == qs_tr1 ), "splitNodeAtPoint1: Seg.vTo.pt -> qs_tr1" );
		var tr3 = qs.getTrapByIdx(2), qs_tr3 = tr3.sink;
		ok( ( qs.ptNode( downward_segment.vFrom.pt, downward_segment.vTo.pt, myQsRoot ) == qs_tr3 ), "splitNodeAtPoint1: Seg.vFrom.pt -> qs_tr3" );
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
		//
		// Main Test
		//
		//	insert higher point into QueryStructure
		var qs_tr5 = qs.splitNodeAtPoint( qs_tr1, downward_segment.vTo.pt, false );
		//
		equal( qs_tr1.nodetype, PNLTRI.T_Y, "splitNodeAtPoint1: nodetype(tr1) -> T_Y" );
		equal( qs_tr1.yval.y, 25, "splitNodeAtPoint1: yval = 25" );
		strictEqual( qs_tr1.right.trap, tr1, "splitNodeAtPoint1: right -> OrigTrap(tr1)" );
		strictEqual( qs_tr1.right, tr1.sink, "splitNodeAtPoint1: right == sink(OrigTrap(tr1))" );
		strictEqual( qs_tr1.left, qs_tr5, "splitNodeAtPoint1: left -> NewTrap(tr5)" );
		strictEqual( qs_tr1.left.trap.u0, tr1, "splitNodeAtPoint1: left -> NewTrap(tr5) [u0==tr1]" );
		ok( ( qs_tr1.left.trap.d0 == tr3 ), "splitNodeAtPoint1: left -> NewTrap(tr5) [d0==tr3]" );
		//
		//	insert lower point into QueryStructure
		var qs_trX = qs.splitNodeAtPoint( qs_tr3, downward_segment.vFrom.pt, true );
		//
		equal( qs_tr3.nodetype, PNLTRI.T_Y, "splitNodeAtPoint1: nodetype(tr3) -> T_Y" );
		equal( qs_tr3.yval.y, 10, "splitNodeAtPoint1: yval = 10" );
		strictEqual( qs_tr3.right.trap, tr3, "splitNodeAtPoint1: right -> OrigTrap(tr3)" );
		strictEqual( qs_tr3.right, tr3.sink, "splitNodeAtPoint1: right == sink(OrigTrap(tr3))" );
		strictEqual( qs_tr3.left.trap.u0, tr3, "splitNodeAtPoint1: left -> NewTrap(tr6) [u0==tr3]" );
		ok( !qs_tr3.left.trap.d0, "splitNodeAtPoint1: left -> NewTrap(tr6) [d0==null]" );
		ok( !qs_tr3.left.trap.d1, "splitNodeAtPoint1: left -> NewTrap(tr6) [d1==null]" );
		//
		//
//		showDataStructure( myQsRoot );
	}

	function test_splitNodeAtPoint2() {
		// going UPwards
		var	base_segment = { vFrom: { pt: { x: 20, y: 20 }}, vTo: { pt: { x: 30, y: 40 }}, upward: true }
		// inside of tr3, connected !!
		var	downward_segment = { vFrom: { pt: { x: 5, y: 15 }}, vTo: base_segment.vFrom, upward: true }
		// segment chain
		var third_segment = { vFrom: base_segment.vTo, vTo: downward_segment.vFrom, upward: false,
							  sprev: base_segment, snext: downward_segment };
		base_segment.sprev = downward_segment;
		downward_segment.snext = base_segment;
		base_segment.snext = downward_segment.sprev = third_segment;
		//
		var qs = new PNLTRI.QueryStructure();
		var myQsRoot = qs.setup_segments( base_segment );
		//
		// precheck of correct Trapezoids
		var tr3 = qs.getTrapByIdx(2), qs_tr3 = tr3.sink;		// TODO
		strictEqual( qs.ptNode( downward_segment.vTo.pt, downward_segment.vFrom.pt, myQsRoot ), qs_tr3, "SplitN#2: Seg.vTo.pt -> qs_tr3" );
		strictEqual( qs.ptNode( downward_segment.vFrom.pt, downward_segment.vTo.pt, myQsRoot ), qs_tr3, "SplitN#2: Seg.vFrom.pt -> qs_tr3" );
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
		//
		// Main Test
		//
		//	insert higher point into QueryStructure
		var qs_tr5 = qs.splitNodeAtPoint( qs_tr3, downward_segment.vTo.pt, false );
		//		TODO: Tests
/*		equal( qs_tr1.nodetype, PNLTRI.T_Y, "SplitN#2: nodetype(tr1) -> T_Y" );
		equal( qs_tr1.yval.y, 25, "SplitN#2: yval = 25" );
		strictEqual( qs_tr1.right.trap, tr1, "SplitN#2: right -> OrigTrap(tr1)" );
		strictEqual( qs_tr1.right, tr1.sink, "SplitN#2: right == sink(OrigTrap(tr1))" );
		strictEqual( qs_tr1.left, qs_tr5, "SplitN#2: left -> NewTrap(tr5)" );
		strictEqual( qs_tr1.left.trap.u0, tr1, "SplitN#2: left -> NewTrap(tr5) [u0==tr1]" );
		strictEqual( qs_tr1.left.trap.d0, tr3, "SplitN#2: left -> NewTrap(tr5) [d0==tr3]" );		*/
		//
		//	insert lower point into QueryStructure
		var qs_trX = qs.splitNodeAtPoint( qs_tr3, downward_segment.vFrom.pt, true );
		//		TODO: Tests
/*		equal( qs_tr3.nodetype, PNLTRI.T_Y, "SplitN#2: nodetype(tr3) -> T_Y" );
		equal( qs_tr3.yval.y, 10, "SplitN#2: yval = 10" );
		strictEqual( qs_tr3.right.trap, tr3, "SplitN#2: right -> OrigTrap(tr3)" );
		strictEqual( qs_tr3.right, tr3.sink, "SplitN#2: right == sink(OrigTrap(tr3))" );
		strictEqual( qs_tr3.left.trap.u0, tr3, "SplitN#2: left -> NewTrap(tr6) [u0==tr3]" );
		ok( !qs_tr3.left.trap.d0, "SplitN#2: left -> NewTrap(tr6) [d0==null]" );
		ok( !qs_tr3.left.trap.d1, "SplitN#2: left -> NewTrap(tr6) [d1==null]" );			*/
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
		var	base_segment = { vFrom: { pt: firstPoint },
							  vTo: { pt: secondPoint },
							  upward: true,
							  }
		// segment chain
		var thirdVertex = { pt: thirdPoint };
		base_segment.snext = { vFrom: base_segment.vTo, vTo: thirdVertex, upward: false };
		base_segment.sprev = { vFrom: thirdVertex, vTo: base_segment.vFrom, upward: false };
		base_segment.snext.sprev = base_segment.sprev.snext = base_segment;
		base_segment.snext.snext = base_segment.sprev;
		base_segment.sprev.sprev = base_segment.snext;
		//
		var qs = new PNLTRI.QueryStructure();
		var myQsRoot = qs.setup_segments( base_segment );		// T_Y
		//
		var qs_tr4 = myQsRoot.right;			// tr4 = myQsRoot.right.trap;			// TODO
		var qs3 = myQsRoot.left;		// T_Y
		var qs_tr3 = qs3.left;					// tr3 = qs3.left.trap;
		var qs5 = qs3.right;			// T_X: base_segment
		var qs_tr1 = qs5.left;					// tr1 = qs5.left.trap;
		var qs_tr2 = qs5.right;					// tr2 = qs5.right.trap;
		//	T_SINK
		ok( ( qs.ptNode( { x: 2, y: 5 }, { x: 3, y: 6 }, qs3.left ) == qs_tr3 ), "ptNode A: Sink direct -> qs_tr3" );
		//	T_Y
		ok( ( qs.ptNode( { x: 2, y: 5 }, { x: 3, y:  6 }, myQsRoot ) == qs_tr4 ), "ptNode A: T_Y(root), above -> qs_tr4" );
		ok( ( qs.ptNode( { x: 2, y: 0 }, { x: 4, y: -1 }, qs3 ) == qs_tr3 ), "ptNode A: T_Y(qs3), below -> qs_tr3" );
		//		T_Y: 1.end point hit
		ok( ( qs.ptNode( firstPoint, { x: 4, y: 0 }, qs3 ) == qs_tr3 ), "ptNode A: T_Y(qs3), =vFrom, below -> qs_tr3" );
		//		T_Y: 2.end point hit
		ok( ( qs.ptNode( secondPoint, { x: 0, y: 5 }, myQsRoot ) == qs_tr4 ), "ptNode A: T_Y(root), =vTo, above -> qs_tr4" );
		//	T_X
		ok( ( qs.ptNode( { x: 2, y: 3 }, { x: 3, y: 6 }, qs5 ) == qs_tr1 ), "ptNode A: T_X(qs5) -> qs_tr1" );
		ok( ( qs.ptNode( { x: 2, y: 2 }, { x: 3, y: 6 }, qs5 ) == qs_tr2 ), "ptNode A: T_X(qs5) -> qs_tr2" );
		//		T_X: 1.end point hit - not horizontal
		ok( ( qs.ptNode( firstPoint, { x: 0, y: 0 }, qs5 ) == qs_tr1 ), "ptNode A: T_X(qs5), =vFrom -> qs_tr1" );
		ok( ( qs.ptNode( firstPoint, { x: 2, y: 2 }, qs5 ) == qs_tr2 ), "ptNode A: T_X(qs5), =vFrom -> qs_tr2" );
		//		T_X: 2.end point hit - not horizontal
		ok( ( qs.ptNode( secondPoint, { x: 3, y: 5 }, qs5 ) == qs_tr1 ), "ptNode A: T_X(qs5), =vTo -> qs_tr1" );
		ok( ( qs.ptNode( secondPoint, { x: 4, y: 5 }, qs5 ) == qs_tr2 ), "ptNode A: T_X(qs5), =vTo -> qs_tr2" );
		//		T_X: 1.end point hit - horizontal
		ok( ( qs.ptNode( firstPoint, { x: 0, y: 1 }, qs5 ) == qs_tr1 ), "ptNode A: T_X(qs5), =vFrom, horiz -> qs_tr1" );
		ok( ( qs.ptNode( firstPoint, { x: 2, y: 1 }, qs5 ) == qs_tr2 ), "ptNode A: T_X(qs5), =vFrom, horiz -> qs_tr2" );
		//		T_X: 2.end point hit - horizontal
		ok( ( qs.ptNode( secondPoint, { x: 2.5, y: 4 }, qs5 ) == qs_tr1 ), "ptNode A: T_X(qs5), =vTo, horiz -> qs_tr1" );
		ok( ( qs.ptNode( secondPoint, { x: 4, y: 4 }, qs5 ) == qs_tr2 ), "ptNode A: T_X(qs5), =vTo, horiz -> qs_tr2" );
		//
		// point objects
		firstPoint = { x: 1, y: 4 };
		secondPoint = { x: 3, y: 1 };
		thirdPoint = { x: 3, y: 3 };
		// DOWNward segment
		base_segment = { vFrom: { pt: firstPoint },
						  vTo: { pt: secondPoint },
						  }
		// segment chain
		thirdVertex = { pt: thirdPoint };
		base_segment.snext = { vFrom: base_segment.vTo, vTo: thirdVertex };
		base_segment.sprev = { vFrom: thirdVertex, vTo: base_segment.vFrom };
		base_segment.snext.sprev = base_segment.sprev.snext = base_segment;
		base_segment.snext.snext = base_segment.sprev;
		base_segment.sprev.sprev = base_segment.snext;
		//
		qs = new PNLTRI.QueryStructure();
		myQsRoot = qs.setup_segments( base_segment );		// T_Y
		//
		qs_tr4 = myQsRoot.right;					// TODO
		qs3 = myQsRoot.left;		// T_Y
		qs_tr3 = qs3.left;
		qs5 = qs3.right;			// T_X: base_segment
		qs_tr1 = qs5.left;
		qs_tr2 = qs5.right;
		//	T_SINK
		ok( ( qs.ptNode( { x: 2, y: 5 }, { x: 3, y: 6 }, qs3.left ) == qs_tr3 ), "ptNode B: Sink direct -> qs_tr3" );
		//	T_Y
		ok( ( qs.ptNode( { x: 2, y: 5 }, { x: 3, y:  6 }, myQsRoot ) == qs_tr4 ), "ptNode B: T_Y(root), above -> qs_tr4" );
		ok( ( qs.ptNode( { x: 2, y: 0 }, { x: 4, y: -1 }, qs3 ) == qs_tr3 ), "ptNode B: T_Y(qs3), below -> qs_tr3" );
		//		T_Y: 1.end point hit
		ok( ( qs.ptNode( firstPoint, { x: 0, y: 5 }, myQsRoot ) == qs_tr4 ), "ptNode B: T_Y(root), =vFrom, above -> qs_tr4" );
		//		T_Y: 2.end point hit
		ok( ( qs.ptNode( secondPoint, { x: 4, y: 0 }, qs3 ) == qs_tr3 ), "ptNode B: T_Y(qs3), =vTo, below -> qs_tr3" );
		//	T_X
		ok( ( qs.ptNode( { x: 2, y: 2 }, { x: 3, y: 6 }, qs5 ) == qs_tr1 ), "ptNode B: T_X(qs5) -> qs_tr1" );
		ok( ( qs.ptNode( { x: 2, y: 3 }, { x: 3, y: 6 }, qs5 ) == qs_tr2 ), "ptNode B: T_X(qs5) -> qs_tr2" );
		//		T_X: 1.end point hit - not horizontal
		ok( ( qs.ptNode( firstPoint, { x: 0, y: 5 }, qs5 ) == qs_tr1 ), "ptNode B: T_X(qs5), =vFrom -> qs_tr1" );
		ok( ( qs.ptNode( firstPoint, { x: 0, y: 6 }, qs5 ) == qs_tr2 ), "ptNode B: T_X(qs5), =vFrom -> qs_tr2" );
		//		T_X: 2.end point hit - not horizontal
		ok( ( qs.ptNode( secondPoint, { x: 4, y: -1 }, qs5 ) == qs_tr1 ), "ptNode B: T_X(qs5), =vTo -> qs_tr1" );
		ok( ( qs.ptNode( secondPoint, { x: 4, y:  0 }, qs5 ) == qs_tr2 ), "ptNode B: T_X(qs5), =vTo -> qs_tr2" );
		//		T_X: 1.end point hit - horizontal
		ok( ( qs.ptNode( firstPoint, { x: 0, y: 4 }, qs5 ) == qs_tr1 ), "ptNode B: T_X(qs5), =vFrom, horiz -> qs_tr1" );
		ok( ( qs.ptNode( firstPoint, { x: 2, y: 4 }, qs5 ) == qs_tr2 ), "ptNode B: T_X(qs5), =vFrom, horiz -> qs_tr2" );
		//		T_X: 2.end point hit - horizontal
		ok( ( qs.ptNode( secondPoint, { x: 2, y: 1 }, qs5 ) == qs_tr1 ), "ptNode B: T_X(qs5), =vTo, horiz -> qs_tr1" );
		ok( ( qs.ptNode( secondPoint, { x: 4, y: 1 }, qs5 ) == qs_tr2 ), "ptNode B: T_X(qs5), =vTo, horiz -> qs_tr2" );
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

	
	
	/*    
	 *						0
	 *   --------------*------------	y=40
	 *				  / \
	 *				 /	 \		7
	 *				/  3  \
	 *      1	   /-------*--------	y=25
	 *		  	  /    6  /
	 *  		 /    	 /
	 *   -------*-------/				y=20
	 *  		 \	5  /
	 *  	2	  \   /    		8
	 *  		   \ /
	 *   -----------*----------------	y=10
	 *						4
	 */
	function test_update_trapezoids() {
		PNLTRI.Math.randomTestSetup();		// set specific random seed for repeatable testing
		//
		var myPolygonData = new PNLTRI.PolygonData( [ [
			{ x: 20, y: 40 }, { x: 40, y: 25 }, { x: 25, y: 10 }, { x: 10, y: 20},
			] ] );
//		showDataStructure( myPolygonData.getVertices(), [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
//		showDataStructure( myPolygonData.getSegments(), [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
		var myTrapezoider = new PNLTRI.Trapezoider( myPolygonData );
		var startTrap = myTrapezoider.trapezoide_polygon();
		equal( startTrap.trapID, 3, "update_trapezoids: Start-Trap-ID" );
		equal( myTrapezoider.nbTrapezoids(), 9, "update_trapezoids: Number of generated Trapezoids" );
		//
		// Main Test
		//
		var myQs = myTrapezoider.queryStructure;			// TODO
		myQs.update_trapezoids();
		//
		var trap = myQs.getTrapByIdx(0);
		ok( !trap.topLoc, "update_trapezoids: Trap#0 topLoc" );
		equal( trap.botLoc, PNLTRI.TRAP_MIDDLE, "update_trapezoids: Trap#0 botLoc" );
		//
		trap = myQs.getTrapByIdx(1);
		equal( trap.topLoc, PNLTRI.TRAP_RIGHT, "update_trapezoids: Trap#1 topLoc" );
		equal( trap.botLoc, PNLTRI.TRAP_RIGHT, "update_trapezoids: Trap#1 botLoc" );
		//
		trap = myQs.getTrapByIdx(2);
		equal( trap.topLoc, PNLTRI.TRAP_RIGHT, "update_trapezoids: Trap#2 topLoc" );
		equal( trap.botLoc, PNLTRI.TRAP_RIGHT, "update_trapezoids: Trap#2 botLoc" );
		//
		trap = myQs.getTrapByIdx(3);
		equal( trap.topLoc, PNLTRI.TRAP_CUSP, "update_trapezoids: Trap#3 topLoc" );
		equal( trap.botLoc, PNLTRI.TRAP_RIGHT, "update_trapezoids: Trap#3 botLoc" );
		//
		trap = myQs.getTrapByIdx(4);
		equal( trap.topLoc, PNLTRI.TRAP_MIDDLE, "update_trapezoids: Trap#4 topLoc" );
		ok( !trap.botLoc, "update_trapezoids: Trap#4 botLoc" );
		//
		trap = myQs.getTrapByIdx(5);
		equal( trap.topLoc, PNLTRI.TRAP_LEFT, "update_trapezoids: Trap#5 topLoc" );
		equal( trap.botLoc, PNLTRI.TRAP_CUSP, "update_trapezoids: Trap#5 botLoc" );
		//
		trap = myQs.getTrapByIdx(6);
		equal( trap.topLoc, PNLTRI.TRAP_RIGHT, "update_trapezoids: Trap#6 topLoc" );
		equal( trap.botLoc, PNLTRI.TRAP_LEFT, "update_trapezoids: Trap#6 botLoc" );
		//
		trap = myQs.getTrapByIdx(7);
		equal( trap.topLoc, PNLTRI.TRAP_LEFT, "update_trapezoids: Trap#7 topLoc" );
		equal( trap.botLoc, PNLTRI.TRAP_LEFT, "update_trapezoids: Trap#7 botLoc" );
		//
		trap = myQs.getTrapByIdx(8);
		equal( trap.topLoc, PNLTRI.TRAP_LEFT, "update_trapezoids: Trap#8 topLoc" );
		equal( trap.botLoc, PNLTRI.TRAP_LEFT, "update_trapezoids: Trap#8 botLoc" );
		//
//		var myQsRoot = myTrapezoider.getQsRoot();
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
		var	base_segment = { vFrom: { pt: { x: 20, y: 20 }}, vTo: { pt: { x: 30, y: 40 }}, upward: true }
		// going DOWNwards - with exchanged coordinates
		var	downward_segment = { vFrom: { pt: { x: 15, y: 10 }}, vTo: { pt: { x: 10, y: 25 }}, upward: true }
		// segment chain
		base_segment.snext = downward_segment.sprev = { vFrom: base_segment.vTo, vTo: downward_segment.vFrom, upward: false,
														sprev: base_segment, snext: downward_segment };
		base_segment.sprev = downward_segment.snext = { vFrom: downward_segment.vTo, vTo: base_segment.vFrom, upward: false,
														sprev: downward_segment, snext: base_segment };
		//
		var qs = new PNLTRI.QueryStructure();
		var myQsRoot = qs.setup_segments( base_segment );
		ok( base_segment.is_inserted, "Add#1: Base Segment inserted" );
		equal( qs.nbTrapezoids(), 4, "Add#1: Number of Trapezoids in Array (4)" );
		// precheck of correct Trapezoids
		var tr1 = qs.getTrapByIdx(1), qs_tr1 = tr1.sink;			// TODO
		var tr3 = qs.getTrapByIdx(2), qs_tr3 = tr3.sink;
		ok( ( qs.ptNode( downward_segment.vFrom.pt, downward_segment.vTo.pt, myQsRoot ) == qs_tr3 ), "Add#1: Seg.vFrom.pt -> qs_tr3" );
		ok( ( qs.ptNode( downward_segment.vTo.pt, downward_segment.vFrom.pt, myQsRoot ) == qs_tr1 ), "Add#1: Seg.vTo.pt -> qs_tr1" );
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
		//
		// Main Test
		//
		qs.add_segment( downward_segment );
		ok( downward_segment.is_inserted, "Add#1: 2.Segment inserted" );
		equal( qs.nbTrapezoids(), 7, "Add#1: Number of Trapezoids in Array (7)" );
		//	upper point inserted -> test_splitNodeAtPoint();		TODO Tests
/*		var tr5 = qs.getTrapByIdx(4), qs_tr5 = tr5.sink;
		equal( qs_tr1.nodetype, PNLTRI.T_Y, "Add#1: nodetype(tr1) -> T_Y" );
		equal( qs_tr1.yval.y, 25, "Add#1: yval = 25" );
		strictEqual( qs_tr1.seg, downward_segment, "Add#1: seg == downward_segment" );
		strictEqual( qs_tr1.right.trap, tr1, "Add#1: right -> OrigTrap(tr1)" );
		strictEqual( qs_tr1.right, tr1.sink, "Add#1: right == sink(OrigTrap(tr1))" );
		strictEqual( qs_tr1.left, qs_tr5, "Add#1: left -> NewTrap(tr5)" );
		strictEqual( qs_tr1.left.trap.u0, tr1, "Add#1: left -> NewTrap(tr5) [u0==tr1]" );
		strictEqual( qs_tr1.left.trap.d0, tr3, "Add#1: left -> NewTrap(tr5) [d0==tr3]" );		*/
		//	lower point inserted -> test_splitNodeAtPoint();		TODO Tests
/*		var tr6 = qs.getTrapByIdx(5), qs_tr6 = tr6.sink;
		equal( qs_tr3.nodetype, PNLTRI.T_Y, "Add#1: nodetype(tr3) -> T_Y" );
		equal( qs_tr3.yval.y, 10, "Add#1: yval = 10" );
		strictEqual( qs_tr3.seg, downward_segment, "Add#1: seg == downward_segment" );
		strictEqual( qs_tr3.right.trap, tr3, "Add#1: right -> OrigTrap(tr3)" );
		strictEqual( qs_tr3.right, tr3.sink, "Add#1: right == sink(OrigTrap(tr3))" );
		strictEqual( qs_tr3.left, qs_tr6, "Add#1: left -> NewTrap(tr6)" );
		strictEqual( qs_tr3.left.trap.u0, tr3, "Add#1: left -> NewTrap(tr6) [u0==tr3]" );
		ok( !qs_tr3.left.trap.d0, "Add#1: left -> NewTrap(tr6) [d0==null]" );
		ok( !qs_tr3.left.trap.d1, "Add#1: left -> NewTrap(tr6) [d1==null]" );		*/
		//
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
	}

	function test_add_segment_2() {
		// going UPwards
		var	base_segment = { vFrom: { pt: { x: 20, y: 20 }}, vTo: { pt: { x: 30, y: 40 }}, upward: true }
		// start in tr4
		var	downward_segment = { vFrom: { pt: { x: 15, y: 10 }}, vTo: { pt: { x: 10, y: 45 }}, upward: true }
		// segment chain
		base_segment.snext = downward_segment.sprev = { vFrom: base_segment.vTo, vTo: downward_segment.vFrom, upward: false,
														sprev: base_segment, snext: downward_segment };
		base_segment.sprev = downward_segment.snext = { vFrom: downward_segment.vTo, vTo: base_segment.vFrom, upward: false,
														sprev: downward_segment, snext: base_segment };
		//
		var qs = new PNLTRI.QueryStructure();
		var myQsRoot = qs.setup_segments( base_segment );
		ok( base_segment.is_inserted, "Add#2: Base Segment inserted" );
		equal( qs.nbTrapezoids(), 4, "Add#2: Number of Trapezoids in Array (4)" );
		// precheck of correct Trapezoids
		var tr3 = qs.getTrapByIdx(2), qs_tr3 = tr3.sink;		// TODO
		var tr4 = qs.getTrapByIdx(0), qs_tr4 = tr4.sink;
		ok( ( qs.ptNode( downward_segment.vFrom.pt, downward_segment.vTo.pt, myQsRoot ) == qs_tr3 ), "Add#2: Seg.vFrom.pt -> qs_tr3" );
		ok( ( qs.ptNode( downward_segment.vTo.pt, downward_segment.vFrom.pt, myQsRoot ) == qs_tr4 ), "Add#2: Seg.vTo.pt -> qs_tr4" );
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
		//
		// Main Test
		//
		qs.add_segment( downward_segment );
		ok( downward_segment.is_inserted, "Add#2: 2.Segment inserted" );
		equal( qs.nbTrapezoids(), 7, "Add#2: Number of Trapezoids in Array (7)" );
		//
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
	}

	function test_add_segment_3() {
		// going UPwards
		var	base_segment = { vFrom: { pt: { x: 20, y: 20 }}, vTo: { pt: { x: 30, y: 40 }}, upward: true }
		// inside of tr2
		var	downward_segment = { vFrom: { pt: { x: 35, y: 35 }}, vTo: { pt: { x: 25, y: 25 }}, upward: false }
		// segment chain
		base_segment.snext = downward_segment.sprev = { vFrom: base_segment.vTo, vTo: downward_segment.vFrom, upward: false,
														sprev: base_segment, snext: downward_segment };
		base_segment.sprev = downward_segment.snext = { vFrom: downward_segment.vTo, vTo: base_segment.vFrom, upward: false,
														sprev: downward_segment, snext: base_segment };
		//
		var qs = new PNLTRI.QueryStructure();
		var myQsRoot = qs.setup_segments( base_segment );
		ok( base_segment.is_inserted, "Add#3: Base Segment inserted" );
		equal( qs.nbTrapezoids(), 4, "Add#3: Number of Trapezoids in Array (4)" );
		// precheck of correct Trapezoids
		var tr2 = qs.getTrapByIdx(3), qs_tr2 = tr2.sink;			// TODO
		ok( ( qs.ptNode( downward_segment.vFrom.pt, downward_segment.vTo.pt, myQsRoot ) == qs_tr2 ), "Add#3: Seg.vFrom.pt -> qs_tr2" );
		ok( ( qs.ptNode( downward_segment.vTo.pt, downward_segment.vFrom.pt, myQsRoot ) == qs_tr2 ), "Add#3: Seg.vTo.pt -> qs_tr2" );
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
		//
		// Main Test
		//
		qs.add_segment( downward_segment );
		ok( downward_segment.is_inserted, "Add#3: 2.Segment inserted" );
		equal( qs.nbTrapezoids(), 7, "Add#3: Number of Trapezoids in Array (7)" );
		//
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
	}

	function test_add_segment_4() {
		// going UPwards
		var	base_segment = { vFrom: { pt: { x: 20, y: 20 }}, vTo: { pt: { x: 30, y: 40 }}, upward: true }
		// inside of tr3
		var	downward_segment = { vFrom: { pt: { x: 5, y: 15 }}, vTo: { pt: { x: 35, y: 5 }}, upward: false }
		// segment chain
		base_segment.snext = downward_segment.sprev = { vFrom: base_segment.vTo, vTo: downward_segment.vFrom, upward: false,
														sprev: base_segment, snext: downward_segment };
		base_segment.sprev = downward_segment.snext = { vFrom: downward_segment.vTo, vTo: base_segment.vFrom, upward: true,
														sprev: downward_segment, snext: base_segment };
		//
		var qs = new PNLTRI.QueryStructure();
		var myQsRoot = qs.setup_segments( base_segment );
		ok( base_segment.is_inserted, "Add#4: Base Segment inserted" );
		equal( qs.nbTrapezoids(), 4, "Add#4: Number of Trapezoids in Array (4)" );
		// precheck of correct Trapezoids
		var tr3 = qs.getTrapByIdx(2), qs_tr3 = tr3.sink;			// TODO
		strictEqual( qs.ptNode( downward_segment.vFrom.pt, downward_segment.vTo.pt, myQsRoot ), qs_tr3, "Add#4: Seg.vFrom.pt -> qs_tr3" );
		strictEqual( qs.ptNode( downward_segment.vTo.pt, downward_segment.vFrom.pt, myQsRoot ), qs_tr3, "Add#4: Seg.vTo.pt -> qs_tr3" );
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
		//
		// Main Test
		//
		qs.add_segment( downward_segment );
		ok( downward_segment.is_inserted, "Add#4: 2.Segment inserted" );
		equal( qs.nbTrapezoids(), 7, "Add#4: Number of Trapezoids in Array (7)" );
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
		myQs.check_trapezoid_neighbors(  3, 0, null, 2, null, "Spec_4a #2, n#3" );
		myQs.check_trapezoid_neighbors(  4, 1, 5, 2, null, "Spec_4a #2, n#4" );
		myQs.check_trapezoid_neighbors(  5, null, null, 4, null, "Spec_4a #2, n#5" );
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
		myQs.check_trapezoid_neighbors(  3, 0, null, 4, 5, "Spec_4b #2, n#3" );
		myQs.check_trapezoid_neighbors(  4, 3, null, null, null, "Spec_4b #2, n#4" );
		myQs.check_trapezoid_neighbors(  5, 3, null, 2, null, "Spec_4b #2, n#5" );
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
		var	segment_top = { vFrom: { pt: { x: 30, y: 40 }}, vTo: { pt: { x: 20, y: 20 }}, upward: false }
		var	segment_left = { vFrom: segment_top.vTo, vTo: { pt: { x: 10, y: 15 }}, upward: false }
		var	segment_right = { vFrom: { pt: { x: 60, y: 22 }}, vTo: segment_top.vFrom, upward: true }
		var	segment_bottom = { vFrom: segment_left.vTo, vTo: segment_right.vFrom, upward: true }
		//
		segment_top.snext = segment_left; segment_top.sprev = segment_right;
		segment_left.snext = segment_bottom; segment_left.sprev = segment_top;
		segment_right.snext = segment_top; segment_right.sprev = segment_bottom;
		segment_bottom.snext = segment_right; segment_bottom.sprev = segment_left;
		//
		var qs = new PNLTRI.QueryStructure();
		var myQsRoot = qs.setup_segments( segment_top );
		ok( segment_top.is_inserted, "Add#5ccw: segment_top inserted" );
		equal( qs.nbTrapezoids(), 4, "Add#5ccw: Number of Trapezoids in Array (4)" );
		// precheck of correct Trapezoids
		var tr3 = qs.getTrapByIdx(2), qs_tr3 = tr3.sink;			// TODO
		ok( ( qs.ptNode( segment_left.vFrom.pt, segment_left.vTo.pt, myQsRoot ) == qs_tr3 ), "Add#5ccw: Seg.vFrom.pt -> qs_tr3" );
		ok( ( qs.ptNode( segment_left.vTo.pt, segment_left.vFrom.pt, myQsRoot ) == qs_tr3 ), "Add#5ccw: Seg.vTo.pt -> qs_tr3" );
		var tr2 = qs.getTrapByIdx(3), qs_tr2 = tr2.sink;
		ok( ( qs.ptNode( segment_right.vFrom.pt, segment_right.vTo.pt, myQsRoot ) == qs_tr2 ), "Add#5ccw: Seg.vFrom.pt -> qs_tr2" );
		ok( ( qs.ptNode( segment_right.vTo.pt, segment_right.vFrom.pt, myQsRoot ) == qs_tr2 ), "Add#5ccw: Seg.vTo.pt -> qs_tr2" );
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
		//
		// Main Test
		//
		qs.add_segment( segment_left );
		ok( segment_left.is_inserted, "Add#5ccw: segment_left inserted" );
		equal( qs.nbTrapezoids(), 6, "Add#5ccw: Number of Trapezoids in Array (6)" );
		qs.add_segment( segment_right );
		ok( segment_right.is_inserted, "Add#5ccw: segment_right inserted" );
		equal( qs.nbTrapezoids(), 8, "Add#5ccw: Number of Trapezoids in Array (8)" );
		qs.add_segment( segment_bottom );
		ok( segment_bottom.is_inserted, "Add#5ccw: segment_bottom inserted" );
		equal( qs.nbTrapezoids(), 9, "Add#5ccw: Number of Trapezoids in Array (9)" );
		//
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
	}

	function test_add_segment_5cw() {
		// CW-Ordering (Holes)
		var	segment_top = { vFrom: { pt: { x: 20, y: 20 }}, vTo: { pt: { x: 30, y: 40 }}, upward: true }
		var	segment_left = { vFrom: { pt: { x: 10, y: 15 }}, vTo: segment_top.vFrom, upward: true }
		var	segment_right = { vFrom: segment_top.vTo, vTo: { pt: { x: 60, y: 22 }}, upward: false }
		var	segment_bottom = { vFrom: segment_right.vTo, vTo: segment_left.vFrom, upward: false }
		//
		segment_top.sprev = segment_left; segment_top.snext = segment_right;
		segment_right.sprev = segment_top; segment_right.snext = segment_bottom;
		segment_bottom.sprev = segment_right; segment_bottom.snext = segment_left;
		segment_left.sprev = segment_bottom; segment_left.snext = segment_top;
		//
		var qs = new PNLTRI.QueryStructure();
		var myQsRoot = qs.setup_segments( segment_left );
		ok( segment_left.is_inserted, "Add#5cw: segment_left inserted" );
		equal( qs.nbTrapezoids(), 4, "Add#5cw: Number of Trapezoids in Array (4)" );
		//
		// Main Test
		//
		qs.add_segment( segment_bottom );
		ok( segment_bottom.is_inserted, "Add#5cw: segment_bottom inserted" );
		equal( qs.nbTrapezoids(), 6, "Add#5cw: Number of Trapezoids in Array (6)" );
		qs.add_segment( segment_right );
		ok( segment_right.is_inserted, "Add#5cw: segment_right inserted" );
		equal( qs.nbTrapezoids(), 8, "Add#5cw: Number of Trapezoids in Array (8)" );
		qs.add_segment( segment_top );
		ok( segment_top.is_inserted, "Add#5cw: segment_top inserted" );
		equal( qs.nbTrapezoids(), 9, "Add#5cw: Number of Trapezoids in Array (9)" );
		//
		//
//		showDataStructure( myQsRoot );
//		drawTrapezoids( myQsRoot );
	}

	function test_add_segment_6nonmono() {
		// CCW-Ordering (Shapes)
		var	segment_nosetop = { vFrom: { pt: { x: 30, y: 45 }}, vTo: { pt: { x: 15, y: 30 }}, upward: false }
		var	segment_nosebot = { vFrom: segment_nosetop.vTo, vTo: { pt: { x: 28, y: 33 }}, upward: true }
		var	segment_lefttop = { vFrom: segment_nosebot.vTo, vTo: { pt: { x: 20, y: 20 }}, upward: false }
		var	segment_leftbot = { vFrom: segment_lefttop.vTo, vTo: { pt: { x: 10, y: 10 }}, upward: false }
		var	segment_indetop = { vFrom: { pt: { x: 26, y: 36 }}, vTo: segment_nosetop.vFrom, upward: true }
		var	segment_indebot = { vFrom: { pt: { x: 35, y: 40 }}, vTo: segment_indetop.vFrom, upward: false }
		var	segment_right = { vFrom: { pt: { x: 60, y: 22 }}, vTo: segment_indebot.vFrom, upward: true }
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
		var qs = new PNLTRI.QueryStructure();
		var myQsRoot = qs.setup_segments( segment_lefttop );
		ok( segment_lefttop.is_inserted, "Add#6: segment_lefttop inserted" );
		equal( qs.nbTrapezoids(), 4, "Add#6: Number of Trapezoids in Array (4)" );
		//
		// Main Test
		//
		qs.add_segment( segment_bottom );
		ok( segment_bottom.is_inserted, "Add#6: segment_bottom inserted" );
		equal( qs.nbTrapezoids(), 7, "Add#6: Number of Trapezoids in Array (7)" );
		qs.add_segment( segment_nosebot );
		ok( segment_nosebot.is_inserted, "Add#6: segment_nosebot inserted" );
		equal( qs.nbTrapezoids(), 9, "Add#6: Number of Trapezoids in Array (9)" );
		qs.add_segment( segment_indebot );
		ok( segment_indebot.is_inserted, "Add#6: segment_indebot inserted" );
		equal( qs.nbTrapezoids(), 12, "Add#6: Number of Trapezoids in Array (12)" );
		qs.add_segment( segment_right );
		ok( segment_right.is_inserted, "Add#6: segment_right inserted" );
		equal( qs.nbTrapezoids(), 13, "Add#6: Number of Trapezoids in Array (13)" );
		qs.add_segment( segment_nosetop );
		ok( segment_nosetop.is_inserted, "Add#6: segment_nosetop inserted" );
		equal( qs.nbTrapezoids(), 15, "Add#6: Number of Trapezoids in Array (15)" );
		qs.add_segment( segment_leftbot );
		ok( segment_leftbot.is_inserted, "Add#6: segment_leftbot inserted" );
		equal( qs.nbTrapezoids(), 16, "Add#6: Number of Trapezoids in Array (16)" );
		qs.add_segment( segment_indetop );
		ok( segment_indetop.is_inserted, "Add#6: segment_indetop inserted" );
		equal( qs.nbTrapezoids(), 17, "Add#6: Number of Trapezoids in Array (17)" );
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
		test_update_trapezoids();
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
		var trap = new PNLTRI.Trapezoider( myPolygonData );
		trap.trapezoide_polygon();
		ok( myPolygonData.allSegsInQueryStructure(), "trapezoid_polygon2: all segments inserted" );
		equal( trap.nbTrapezoids(), 41, "trapezoid_polygon2: Number of generated Trapezoids" );
		//
		trap.check_trapezoid_neighbors(  0, null, null, 13, 36, "trapezoid_polygon2 #0" );
		trap.check_trapezoid_neighbors(  1, 7, null, null, null, "trapezoid_polygon2 #1" );
		trap.check_trapezoid_neighbors(  2, 25, 3, 8, null, "trapezoid_polygon2 #2" );
		trap.check_trapezoid_neighbors(  3, null, null, 2, null, "trapezoid_polygon2 #3" );
		trap.check_trapezoid_neighbors(  4, 30, null, 29, null, "trapezoid_polygon2 #4" );
		trap.check_trapezoid_neighbors(  5, 37, null, 16, 24, "trapezoid_polygon2 #5" );
		trap.check_trapezoid_neighbors(  6, 40, null, 27, null, "trapezoid_polygon2 #6" );
		trap.check_trapezoid_neighbors(  7, 29, null, 1, 38, "trapezoid_polygon2 #7" );
		trap.check_trapezoid_neighbors(  8, 2, 17, null, null, "trapezoid_polygon2 #8" );
		trap.check_trapezoid_neighbors(  9, null, null, 21, null, "trapezoid_polygon2 #9" );
		trap.check_trapezoid_neighbors( 10, 36, null, null, null, "trapezoid_polygon2 #10" );
		trap.check_trapezoid_neighbors( 11, 39, null, 30, null, "trapezoid_polygon2 #11" );
		trap.check_trapezoid_neighbors( 12, 36, null, 40, null, "trapezoid_polygon2 #12" );
		trap.check_trapezoid_neighbors( 13, 0, null, 14, null, "trapezoid_polygon2 #13" );
		trap.check_trapezoid_neighbors( 14, 13, null, 19, null, "trapezoid_polygon2 #14" );
		trap.check_trapezoid_neighbors( 15, null, null, 20, null, "trapezoid_polygon2 #15" );
		trap.check_trapezoid_neighbors( 16, 5, null, 22, null, "trapezoid_polygon2 #16" );
		trap.check_trapezoid_neighbors( 17, 21, 23, 8, null, "trapezoid_polygon2 #17" );
		trap.check_trapezoid_neighbors( 18, null, null, 23, null, "trapezoid_polygon2 #18" );
		trap.check_trapezoid_neighbors( 19, 14, null, 25, 34, "trapezoid_polygon2 #19" );
		trap.check_trapezoid_neighbors( 20, 15, null, 31, null, "trapezoid_polygon2 #20" );
		trap.check_trapezoid_neighbors( 21, 9, null, 17, null, "trapezoid_polygon2 #21" );
		trap.check_trapezoid_neighbors( 22, 16, null, null, null, "trapezoid_polygon2 #22" );
		trap.check_trapezoid_neighbors( 23, 18, 27, 17, null, "trapezoid_polygon2 #23" );
		trap.check_trapezoid_neighbors( 24, 5, null, null, null, "trapezoid_polygon2 #24" );
		trap.check_trapezoid_neighbors( 25, 19, null, 2, null, "trapezoid_polygon2 #25" );
		trap.check_trapezoid_neighbors( 26, null, null, 33, null, "trapezoid_polygon2 #26" );
		trap.check_trapezoid_neighbors( 27, 6, null, 23, null, "trapezoid_polygon2 #27" );
		trap.check_trapezoid_neighbors( 28, 34, null, 35, null, "trapezoid_polygon2 #28" );
		trap.check_trapezoid_neighbors( 29, 33, 4, 7, 37, "trapezoid_polygon2 #29" );
		trap.check_trapezoid_neighbors( 30, 11, null, 4, null, "trapezoid_polygon2 #30" );
		trap.check_trapezoid_neighbors( 31, 20, 32, 39, null, "trapezoid_polygon2 #31" );
		trap.check_trapezoid_neighbors( 32, null, null, 31, null, "trapezoid_polygon2 #32" );
		trap.check_trapezoid_neighbors( 33, 26, null, 29, null, "trapezoid_polygon2 #33" );
		trap.check_trapezoid_neighbors( 34, 19, null, 28, null, "trapezoid_polygon2 #34" );
		trap.check_trapezoid_neighbors( 35, 28, null, null, null, "trapezoid_polygon2 #35" );
		trap.check_trapezoid_neighbors( 36, 0, null, 10, 12, "trapezoid_polygon2 #36" );
		trap.check_trapezoid_neighbors( 37, 29, null, 5, null, "trapezoid_polygon2 #37" );
		trap.check_trapezoid_neighbors( 38, 7, null, null, null, "trapezoid_polygon2 #38" );
		trap.check_trapezoid_neighbors( 39, 31, null, 11, null, "trapezoid_polygon2 #39" );
		trap.check_trapezoid_neighbors( 40, 12, null, 6, null, "trapezoid_polygon2 #40" );
		//
		//
//		var myQsRoot = qs.getRoot();
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

