/**
 * @author jahting / http://www.ameco.tv/
 */

/*	Base class extensions - for testing only */

PNLTRI.MonoSplitter.prototype.getQsRoot = function () {
		return	this.trapezoider.getQsRoot();
};
PNLTRI.MonoSplitter.prototype.alyTrap_check = function ( inTrap, inFromUp, inFromLeft ) {
	var inChain = 0;
	var trapQueue = this.alyTrap( inChain, inTrap, inFromUp, inFromLeft, true );
	if ( mockDoChecks ) {
		var paras;
		while ( paras = trapQueue.shift() ) { mock_check( paras ) }
	}
};
PNLTRI.MonoSplitter.prototype.mockSetup = function () {
	
	function mock_doSplit_check( inChain, inVertLow, inVertHigh, inLow2High ) {
		if ( mockDoChecks )		return	mock_check( [ inChain, inVertLow, inVertHigh, inLow2High ] );
		return	null;
	}

//		Dependency Injection of Mock-Checks
//	this.doSplit_ORG = this.doSplit;
	//
	this.doSplit = mock_doSplit_check;
	mock_check_off();
};
	
	// for splitting trapezoids
	//  on which segment lie the points defining the top and bottom y-line?
	PNLTRI.TRAP_TM_BM = 1 + 4*PNLTRI.TRAP_MIDDLE + PNLTRI.TRAP_MIDDLE;		// top-middle, bottom-middle
	PNLTRI.TRAP_TM_BL = 1 + 4*PNLTRI.TRAP_MIDDLE + PNLTRI.TRAP_LEFT;		// top-middle, bottom-left
	PNLTRI.TRAP_TM_BR = 1 + 4*PNLTRI.TRAP_MIDDLE + PNLTRI.TRAP_RIGHT;		// top-middle, bottom-right
	PNLTRI.TRAP_TM_BLR =1 + 4*PNLTRI.TRAP_MIDDLE + PNLTRI.TRAP_CUSP;		// top-middle, bottom-cusp
	PNLTRI.TRAP_TL_BM = 1 + 4*PNLTRI.TRAP_LEFT	 + PNLTRI.TRAP_MIDDLE;		// top-left, bottom-middle
	PNLTRI.TRAP_TL_BR = 1 + 4*PNLTRI.TRAP_LEFT	 + PNLTRI.TRAP_RIGHT;		// top-left, bottom-right
	PNLTRI.TRAP_TR_BM = 1 + 4*PNLTRI.TRAP_RIGHT  + PNLTRI.TRAP_MIDDLE;		// top-right, bottom-middle
	PNLTRI.TRAP_TR_BL = 1 + 4*PNLTRI.TRAP_RIGHT	 + PNLTRI.TRAP_LEFT;		// top-right, bottom-left
	PNLTRI.TRAP_TLR_BM =1 + 4*PNLTRI.TRAP_CUSP   + PNLTRI.TRAP_MIDDLE;		// top-cusp, bottom-middle
	
function test_MonoSplitter() {
	
	// TODO: tests for cases: d0=null,d1=set; u0=null,u1=set !!!
	//   Start-Triangle: coming in from a non-existing direction !!!


	/* 4 Cases for "high points", mirror them for "low points"
	
	/*   L 
	 *							  /
	 *   -----*------------------/
	 *		   \      Trap		/
	 */

	/*    R
	 *		 \
	 *		  \--------------*------
	 *		   \    Trap	/
	 */

	/*    M
	 *		 \		  \ /		/
	 *		  \--------*-------/
	 *		   \     Trap	  /
	 */

	/*    LR
	 *   -------*-------
	 *		   / \
	 *		  /   \
	 *		 /Trap \
	 */

	/* 4 Cases for "high points" combined with 4 Cases for "low points"
	 *
	 *	TL_BL, TL_BLR: no diag			-- top-left & bottom-left, ....
	 *	TL_BR, TL_BM: diag
	 *
	 *	TR_BL, TR_BM: diag
	 *	TR_BR, TR_BLR: no diag
	 *
	 *	TM_BL, TM_BM, TM_BR, TM_BLR: diag
	 *  
	 *	TLR_BL, TLR_BR: no diag
	 *	TLR_BM: diag
	 *
	 *	TLR_BLR: not possible
	 */
	
	/**************************************************************************/
	 
	/*    
	 *						  /
	 *	------*--------------/
	 *		   \      		/
	 *			\    	   /
	 *	---------*--------/
	 *					 /
	 */
	function test_TL_BL() {
		var myPolygonData = new PNLTRI.PolygonData( [ [
			{ x:10, y:30 }, { x:15, y:10 },		// left segment
			{ x:25, y: 5 }, { x:35, y:35 },		// right segment
			] ] );
//		showDataStructure( myPolygonData.getVertices(), [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
		//
		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		var segListArray = myQs.getSegListArray();
		//
		myQs.add_segment_consistently( segListArray[0], "TL_BL_1" );
		myQs.add_segment_consistently( segListArray[2], "TL_BL_2" );
		equal( myQs.nbTrapezoids(), 7, "TL_BL: nb. of trapezoids == 7");
		myQs.update_trapezoids();
//		var myQsRoot = myQs.getRoot();
//		drawTrapezoids( myQsRoot, false, 1 );
		//
		var	myMono = new PNLTRI.MonoSplitter( myPolygonData );
		myMono.mockSetup();		// Mock Setup: Dependency Injection of Mock-Checks
		//
		// Main Test
		//
		var myTrap = myQs.getTrapByIdx(3);
//		drawTrapezoids( myTrap.sink, false, 1 );
			// from UP0
		mock_set_expected( [ [ myTrap.d0, true, false, 0 ] ] );
		myMono.alyTrap_check( myTrap, true, true );
		equal( myTrap.monoDiag, PNLTRI.TRAP_NOSPLIT, "TL_BL: from UP0, no diag");
		ok( mock_check_calls(), "TL_BL: from UP0, all calls received" );
			//	already visited !!
		mock_set_expected();
		myMono.alyTrap_check( myTrap, true, true );
		equal( myTrap.monoDiag, PNLTRI.TRAP_NOSPLIT, "TL_BL: 2.from UP0, no diag");
		ok( mock_check_calls(), "TL_BL: 2.from UP0, no calls received" );
			// from DN0
		myTrap.monoDiag = null;			// => not yet visited
		mock_set_expected( [ [ myTrap.u0, false, false, 0 ] ] );
		myMono.alyTrap_check( myTrap, false, true );
		equal( myTrap.monoDiag, PNLTRI.TRAP_NOSPLIT, "TL_BL: from DN0, no diag");
		ok( mock_check_calls(), "TL_BL: from DN0, all calls received" );
			// from UP1
		myTrap.setAbove( null, myTrap.u0 );		// exchange u0, u1
		myTrap.setBelow( null, myTrap.d0 );		// exchange d0, d1
		myTrap.monoDiag = null;			// => not yet visited
		mock_set_expected( [ [ myTrap.d1, true, false, 0 ] ] );
		myMono.alyTrap_check( myTrap, true, false );
		equal( myTrap.monoDiag, PNLTRI.TRAP_NOSPLIT, "TL_BL: from UP1, no diag");
		ok( mock_check_calls(), "TL_BL: from UP1, all calls received" );
			// from DN1
		myTrap.monoDiag = null;			// => not yet visited
		mock_set_expected( [ [ myTrap.u1, false, false, 0 ] ] );
		myMono.alyTrap_check( myTrap, false, false );
		equal( myTrap.monoDiag, PNLTRI.TRAP_NOSPLIT, "TL_BL: from DN1, no diag");
		ok( mock_check_calls(), "TL_BL: from DN1, all calls received" );
	}
	
	/*    
	 *	 \
	 *	  \--------------*----
	 *	   \      		/
	 *		\    	   /
	 *		 \--------*-------
	 *		  \
	 */
	function test_TR_BR() {
		var myPolygonData = new PNLTRI.PolygonData( [ [
			{ x:10, y:35 }, { x:15, y: 5 },		// left segment
			{ x:25, y:10 }, { x:35, y:30 },		// right segment
			] ] );
//		showDataStructure( myPolygonData.getVertices(), [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
		//
		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		var segListArray = myQs.getSegListArray();
		//
		myQs.add_segment_consistently( segListArray[0], "TR_BR_1" );
		myQs.add_segment_consistently( segListArray[2], "TR_BR_2" );
		equal( myQs.nbTrapezoids(), 7, "TR_BR: nb. of trapezoids == 7");
		myQs.update_trapezoids();
//		var myQsRoot = myQs.getRoot();
//		drawTrapezoids( myQsRoot, false, 1 );
		//
		var	myMono = new PNLTRI.MonoSplitter( myPolygonData );
		myMono.mockSetup();		// Mock Setup: Dependency Injection of Mock-Checks
		//
		// Main Test
		//
		var myTrap = myQs.getTrapByIdx(4);
//		drawTrapezoids( myTrap.sink, false, 1 );
			// from UP0
		mock_set_expected( [ [ myTrap.d0, true, true, 0 ] ] );
		myMono.alyTrap_check( myTrap, true, true );
		equal( myTrap.monoDiag, PNLTRI.TRAP_NOSPLIT, "TR_BR: from UP0, no diag");
		ok( mock_check_calls(), "TR_BR: from UP0, all calls received" );
			// from DN0
		myTrap.monoDiag = null;			// => not yet visited
		mock_set_expected( [ [ myTrap.u0, false, true, 0 ] ] );
		myMono.alyTrap_check( myTrap, false, true );
		equal( myTrap.monoDiag, PNLTRI.TRAP_NOSPLIT, "TR_BR: from DN0, no diag");
		ok( mock_check_calls(), "TR_BR: from DN0, all calls received" );
			// from UP1
		myTrap.setAbove( null, myTrap.u0 );		// exchange u0, u1
		myTrap.setBelow( null, myTrap.d0 );		// exchange d0, d1
		myTrap.monoDiag = null;			// => not yet visited
		mock_set_expected( [ [ myTrap.d1, true, true, 0 ] ] );
		myMono.alyTrap_check( myTrap, true, false );
		equal( myTrap.monoDiag, PNLTRI.TRAP_NOSPLIT, "TR_BR: from UP1, no diag");
		ok( mock_check_calls(), "TR_BR: from UP1, all calls received" );
			// from DN1
		myTrap.monoDiag = null;			// => not yet visited
		mock_set_expected( [ [ myTrap.u1, false, true, 0 ] ] );
		myMono.alyTrap_check( myTrap, false, false );
		equal( myTrap.monoDiag, PNLTRI.TRAP_NOSPLIT, "TR_BR: from DN1, no diag");
		ok( mock_check_calls(), "TR_BR: from DN1, all calls received" );
	}

	/*    
	 *				 /	
	 *	------*-----/
	 *		   \   /
	 *			\ /
	 *	---------*------------
	 *
	 */
	function test_TL_BLR() {
		var myPolygonData = new PNLTRI.PolygonData( [ [
			{ x:10, y:30 }, { x:15, y:10 },		// left segment
			{ x:35, y:35 },						// right segment
			] ] );
//		showDataStructure( myPolygonData.getVertices(), [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
		//
		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		var segListArray = myQs.getSegListArray();
		//
		myQs.add_segment_consistently( segListArray[0], "TL_BLR_1" );
		myQs.add_segment_consistently( segListArray[1], "TL_BLR_2" );
		equal( myQs.nbTrapezoids(), 6, "TL_BLR: nb. of trapezoids == 6");
		myQs.update_trapezoids();
//		drawTrapezoids( myQs.getRoot(), false, 1 );
		//
		var	myMono = new PNLTRI.MonoSplitter( myPolygonData );
		myMono.mockSetup();		// Mock Setup: Dependency Injection of Mock-Checks
		//
		// Main Test
		//
		var myTrap = myQs.getTrapByIdx(3);
//		drawTrapezoids( myTrap.sink, false, 1 );
			// from UP0
		mock_set_expected( [	[ myTrap.u0, false, false, 0 ] ] );
		myMono.alyTrap_check( myTrap, true, true );
		equal( myTrap.monoDiag, PNLTRI.TRAP_NOSPLIT, "TL_BLR: from UP0, no diag");
		ok( mock_check_calls(), "TL_BLR: from UP0, all calls received" );
			// from UP1
		myTrap.setAbove( null, myTrap.u0 );		// exchange u0, u1
		myTrap.monoDiag = null;					// => not yet visited
		mock_set_expected( [	[ myTrap.u1, false, false, 0 ] ] );
		myMono.alyTrap_check( myTrap, true, false );
		equal( myTrap.monoDiag, PNLTRI.TRAP_NOSPLIT, "TL_BLR: from UP1, no diag");
		ok( mock_check_calls(), "TL_BLR: from UP1, all calls received" );
	}

	/*    
	 *		 \
	 *	      \-----*-----
	 *		   \   /
	 *			\ /
	 *	---------*------------
	 *
	 */
	function test_TR_BLR() {
		var myPolygonData = new PNLTRI.PolygonData( [ [
			{ x:10, y:35 }, { x:15, y:10 },		// left segment
			{ x:35, y:30 },						// right segment
			] ] );
//		showDataStructure( myPolygonData.getVertices(), [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
		//
		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		var segListArray = myQs.getSegListArray();
		//
		myQs.add_segment_consistently( segListArray[0], "TR_BLR_1" );
		myQs.add_segment_consistently( segListArray[1], "TR_BLR_2" );
		equal( myQs.nbTrapezoids(), 6, "TR_BLR: nb. of trapezoids == 6");
		myQs.update_trapezoids();
//		drawTrapezoids( myQs.getRoot(), false, 1 );
		//
		var	myMono = new PNLTRI.MonoSplitter( myPolygonData );
		myMono.mockSetup();		// Mock Setup: Dependency Injection of Mock-Checks
		//
		// Main Test
		//
		var myTrap = myQs.getTrapByIdx(4);
//		drawTrapezoids( myTrap.sink, false, 1 );
			// from UP0
		mock_set_expected( [	[ myTrap.u0, false, true, 0 ] ] );
		myMono.alyTrap_check( myTrap, true, true );
		equal( myTrap.monoDiag, PNLTRI.TRAP_NOSPLIT, "TR_BLR: from UP0, no diag");
		ok( mock_check_calls(), "TR_BLR: from UP0, all calls received" );
			// from UP1
		myTrap.setAbove( null, myTrap.u0 );		// exchange u0, u1
		myTrap.monoDiag = null;					// => not yet visited
		mock_set_expected( [	[ myTrap.u1, false, true, 0 ] ] );
		myMono.alyTrap_check( myTrap, true, false );
		equal( myTrap.monoDiag, PNLTRI.TRAP_NOSPLIT, "TR_BLR: from UP1, no diag");
		ok( mock_check_calls(), "TR_BLR: from UP1, all calls received" );
	}
	
	/*    
	 *
	 *	--------*------
	 *		   / \
	 *		  /	  \
	 *	-----*-----\
	 *				\
	 */
	function test_TLR_BL() {
		var myPolygonData = new PNLTRI.PolygonData( [ [
			{ x:20, y:30 }, { x:15, y:15 },		// left segment
			{ x:35, y: 5 },						// right segment
			] ] );
//		showDataStructure( myPolygonData.getVertices(), [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
		//
		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		var segListArray = myQs.getSegListArray();
		//
		myQs.add_segment_consistently( segListArray[0], "TLR_BL_1" );
		myQs.add_segment_consistently( segListArray[2], "TLR_BL_2" );
		equal( myQs.nbTrapezoids(), 6, "TLR_BL: nb. of trapezoids == 6");
		myQs.update_trapezoids();
//		drawTrapezoids( myQs.getRoot(), false, 1 );
		//
		var	myMono = new PNLTRI.MonoSplitter( myPolygonData );
		myMono.mockSetup();		// Mock Setup: Dependency Injection of Mock-Checks
		//
		// Main Test
		//
		var myTrap = myQs.getTrapByIdx(3);
//		drawTrapezoids( myTrap.sink, false, 1 );
			// from DN0
		mock_set_expected( [	[ myTrap.d0, true, false, 0 ] ] );
		myMono.alyTrap_check( myTrap, false, true );
		equal( myTrap.monoDiag, PNLTRI.TRAP_NOSPLIT, "TLR_BL: from DN0, no diag");
		ok( mock_check_calls(), "TLR_BL: from DN0, all calls received" );
			// from DN1
		myTrap.setBelow( null, myTrap.d0 );		// exchange d0, d1
		myTrap.monoDiag = null;					// => not yet visited
		mock_set_expected( [	[ myTrap.d1, true, false, 0 ] ] );
		myMono.alyTrap_check( myTrap, false, false );
		equal( myTrap.monoDiag, PNLTRI.TRAP_NOSPLIT, "TLR_BL: from DN1, no diag");
		ok( mock_check_calls(), "TLR_BL: from DN1, all calls received" );
	}
	
	/*    
	 *
	 *	--------*------
	 *		   / \
	 *		  /	  \
	 *		 /-----*---
	 *		/
	 */
	function test_TLR_BR() {
		var myPolygonData = new PNLTRI.PolygonData( [ [
			{ x:20, y:30 }, { x:15, y:5 },		// left segment
			{ x:35, y:15 },						// right segment
			] ] );
//		showDataStructure( myPolygonData.getVertices(), [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
		//
		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		var segListArray = myQs.getSegListArray();
		//
		myQs.add_segment_consistently( segListArray[0], "TLR_BR_1" );
		myQs.add_segment_consistently( segListArray[2], "TLR_BR_2" );
		equal( myQs.nbTrapezoids(), 6, "TLR_BR: nb. of trapezoids == 6");
		myQs.update_trapezoids();
//		drawTrapezoids( myQs.getRoot(), false, 1 );
		//
		var	myMono = new PNLTRI.MonoSplitter( myPolygonData );
		myMono.mockSetup();		// Mock Setup: Dependency Injection of Mock-Checks
		//
		// Main Test
		//
		var myTrap = myQs.getTrapByIdx(3);
//		drawTrapezoids( myTrap.sink, false, 1 );
			// from DN0
		mock_set_expected( [	[ myTrap.d0, true, true, 0 ] ] );
		myMono.alyTrap_check( myTrap, false, true );
		equal( myTrap.monoDiag, PNLTRI.TRAP_NOSPLIT, "TLR_BR: from DN0, no diag");
		ok( mock_check_calls(), "TLR_BR: from DN0, all calls received" );
			// from DN1
		myTrap.setBelow( null, myTrap.d0 );		// exchange d0, d1
		myTrap.monoDiag = null;					// => not yet visited
		mock_set_expected( [	[ myTrap.d1, true, true, 0 ] ] );
		myMono.alyTrap_check( myTrap, false, false );
		equal( myTrap.monoDiag, PNLTRI.TRAP_NOSPLIT, "TLR_BR: from DN1, no diag");
		ok( mock_check_calls(), "TLR_BR: from DN1, all calls received" );
	}
	
	/*    
	 *							  /
	 *	------*------------------/
	 *		   \      			/
	 *			\    		   /
	 *			 \------------*----
	 *			  \
	 */
	function test_TL_BR() {
		var myPolygonData = new PNLTRI.PolygonData( [ [
			{ x:10, y:30 }, { x:15, y: 5 },		// left segment
			{ x:25, y:10 }, { x:35, y:35 },		// right segment
			] ] );
		var myVertices = myPolygonData.getVertices();
//		showDataStructure( myPolygonData.getVertices(), [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
		//
		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		var segListArray = myQs.getSegListArray();
		//
		myQs.add_segment_consistently( segListArray[0], "TL_BR_1" );
		myQs.add_segment_consistently( segListArray[2], "TL_BR_2" );
		equal( myQs.nbTrapezoids(), 7, "TL_BR: nb. of trapezoids == 7");
		myQs.update_trapezoids();
//		drawTrapezoids( myQs.getRoot(), false, 1 );
		//
		var	myMono = new PNLTRI.MonoSplitter( myPolygonData );
		myMono.mockSetup();		// Mock Setup: Dependency Injection of Mock-Checks
		//
		// Main Test
		//
		var myTrap = myQs.getTrapByIdx(3);
//		drawTrapezoids( myTrap.sink, false, 1 );
			// from UP0
		mock_set_expected( [	[ 0, myVertices[2], myVertices[0], false ],		// (10,30)->(25,10)
								[ myTrap.d0, true, true, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, true, true );
		equal( myTrap.monoDiag, PNLTRI.TRAP_TL_BR, "TL_BR: from UP0, diag: vHigh(left)->vLow(right)");
		ok( mock_check_calls(), "TL_BR: from UP0, all calls received" );
			// from UP1
		myTrap.setAbove( null, myTrap.u0 );		// exchange u0, u1
		myTrap.monoDiag = null;			// => not yet visited
		mock_rewind();				// same data as "from UP0" !!
		myMono.alyTrap_check( myTrap, true, false );
		equal( myTrap.monoDiag, PNLTRI.TRAP_TL_BR, "TL_BR: from UP1, diag: vHigh(left)->vLow(right)");
		ok( mock_check_calls(), "TL_BR: from UP1, all calls received" );
			// from DN0
		myTrap.monoDiag = null;			// => not yet visited
		mock_set_expected( [	[ 0, myVertices[2], myVertices[0], true ],		// (25,10)->(10,30)
								[ myTrap.u1, false, false, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, false, true );
		equal( myTrap.monoDiag, PNLTRI.TRAP_TL_BR, "TL_BR: from DN0, diag: vLow(right)->vHigh(left)");
		ok( mock_check_calls(), "TL_BR: from DN0, all calls received" );
			// from DN1
		myTrap.setBelow( null, myTrap.d0 );		// exchange d0, d1
		myTrap.monoDiag = null;			// => not yet visited
		mock_rewind();				// same data as "from DN0" !!
		myMono.alyTrap_check( myTrap, false, false );
		equal( myTrap.monoDiag, PNLTRI.TRAP_TL_BR, "TL_BR: from DN1, diag: vLow(right)->vHigh(left)");
		ok( mock_check_calls(), "TL_BR: from DN1, all calls received" );
	}
	
	/*    
	 *	 \
	 *	  \------------------*-----
	 *	   \      			/
	 *		\    		   /
	 *	-----*------------/
	 *					 /
	 */
	function test_TR_BL() {
		var myPolygonData = new PNLTRI.PolygonData( [ [
			{ x:10, y:35 }, { x:15, y:10 },		// left segment
			{ x:25, y: 5 }, { x:35, y:30 },		// right segment
			] ] );
		var myVertices = myPolygonData.getVertices();
//		showDataStructure( myPolygonData.getVertices(), [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
		//
		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		var segListArray = myQs.getSegListArray();
		//
		myQs.add_segment_consistently( segListArray[0], "TR_BL_1" );
		myQs.add_segment_consistently( segListArray[2], "TR_BL_2" );
		equal( myQs.nbTrapezoids(), 7, "TR_BL: nb. of trapezoids == 7");
		myQs.update_trapezoids();
//		drawTrapezoids( myQs.getRoot(), false, 1 );
		//
		var	myMono = new PNLTRI.MonoSplitter( myPolygonData );
		myMono.mockSetup();		// Mock Setup: Dependency Injection of Mock-Checks
		//
		// Main Test
		//
		var myTrap = myQs.getTrapByIdx(4);
//		drawTrapezoids( myTrap.sink, false, 1 );
			// from UP0
		mock_set_expected( [	[ 0, myVertices[1], myVertices[3], true ],		// (15,10)->(35,30)
								[ myTrap.d0, true, false, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, true, true );
		equal( myTrap.monoDiag, PNLTRI.TRAP_TR_BL, "TR_BL: from UP0, diag: vLow(left)->vHigh(right)");
		ok( mock_check_calls(), "TR_BL: from UP0, all calls received" );
			// from UP1
		myTrap.setAbove( null, myTrap.u0 );		// exchange u0, u1
		myTrap.monoDiag = null;			// => not yet visited
		mock_rewind();				// same data as "from UP0" !!
		myMono.alyTrap_check( myTrap, true, false );
		equal( myTrap.monoDiag, PNLTRI.TRAP_TR_BL, "TR_BL: from UP1, diag: vLow(left)->vHigh(right)");
		ok( mock_check_calls(), "TR_BL: from UP1, all calls received" );
			// from DN0
		myTrap.monoDiag = null;			// => not yet visited
		mock_set_expected( [	[ 0, myVertices[1], myVertices[3], false ],		// (35,30)->(15,10)
								[ myTrap.u1, false, true, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, false, true );
		equal( myTrap.monoDiag, PNLTRI.TRAP_TR_BL, "TR_BL: from DN0, diag: vHigh(right)->vLow(left)");
		ok( mock_check_calls(), "TR_BL: from DN0, all calls received" );
			// from DN1
		myTrap.setBelow( null, myTrap.d0 );		// exchange d0, d1
		myTrap.monoDiag = null;			// => not yet visited
		mock_rewind();				// same data as "from DN0" !!
		myMono.alyTrap_check( myTrap, false, false );
		equal( myTrap.monoDiag, PNLTRI.TRAP_TR_BL, "TR_BL: from DN1, diag: vHigh(right)->vLow(left)");
		ok( mock_check_calls(), "TR_BL: from DN1, all calls received" );
	}
	
	/*    
	 *		 					  /
	 *	------*------------------/
	 *		   \      			/
	 *			\    		   /
	 *			 \------*-----/
	 *			  \	   / \	 /
	 */
	function test_TL_BM() {
		var myPolygonData = new PNLTRI.PolygonData( [ [
			{ x:10, y:30 }, { x:15, y:10 },		// left segment
			{ x:20, y:15 },						// middle point
			{ x:25, y: 5 }, { x:35, y:35 },		// right segment
			] ] );
		var myVertices = myPolygonData.getVertices();
//		showDataStructure( myPolygonData.getVertices(), [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
		//
		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		var segListArray = myQs.getSegListArray();
		//
		myQs.add_segment_consistently( segListArray[0], "TL_BM_1" );
		myQs.add_segment_consistently( segListArray[3], "TL_BM_2" );
		myQs.add_segment_consistently( segListArray[1], "TL_BM_3" );
		myQs.add_segment_consistently( segListArray[2], "TL_BM_4" );
		equal( myQs.nbTrapezoids(), 10, "TL_BM: nb. of trapezoids == 10");
		myQs.update_trapezoids();
//		drawTrapezoids( myQs.getRoot(), false, 1 );
		//
		var	myMono = new PNLTRI.MonoSplitter( myPolygonData );
		myMono.mockSetup();		// Mock Setup: Dependency Injection of Mock-Checks
		//
		// Main Test
		//
		var myTrap = myQs.getTrapByIdx(3);
//		drawTrapezoids( myTrap.sink, false, 1 );
			// from UP0
		mock_set_expected( [	[ 0, myVertices[2], myVertices[0], false ],		// (10,30)->(20,15)
								[ myTrap.d1, true, false, 0 ],
								[ myTrap.u0, false, false, 0 ],
								[ myTrap.d0, true, true, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, true, true );
		equal( myTrap.monoDiag, PNLTRI.TRAP_TL_BM, "TL_BM: from UP0, diag: vHigh(left)->vLow(middle)");
		ok( mock_check_calls(), "TL_BM: from UP0, all calls received" );
			// from UP1
		myTrap.setAbove( null, myTrap.u0 );		// exchange u0, u1
		myTrap.monoDiag = null;			// => not yet visited
		mock_set_expected( [	[ 0, myVertices[2], myVertices[0], false ],		// (10,30)->(20,15)
								[ myTrap.d1, true, false, 0 ],
								[ myTrap.u1, false, false, 0 ],
								[ myTrap.d0, true, true, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, true, false );
		equal( myTrap.monoDiag, PNLTRI.TRAP_TL_BM, "TL_BM: from UP1, diag: vHigh(left)->vLow(middle)");
		ok( mock_check_calls(), "TL_BM: from UP1, all calls received" );
			// from DN-right
		myTrap.monoDiag = null;			// => not yet visited
		mock_rewind();				// same data as "from UP1" !!
		myMono.alyTrap_check( myTrap, false, false );
		equal( myTrap.monoDiag, PNLTRI.TRAP_TL_BM, "TL_BM: from DN-right, diag: vHigh(left)->vLow(middle)");
		ok( mock_check_calls(), "TL_BM: from DN-right, all calls received" );
			// from DN-left
		myTrap.monoDiag = null;			// => not yet visited
		mock_set_expected( [	[ 0, myVertices[2], myVertices[0], true ],		// (20,15)->(10,30)
								[ myTrap.d1, true, false, 7 ],
								[ myTrap.u1, false, false, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, false, true );
		equal( myTrap.monoDiag, PNLTRI.TRAP_TL_BM, "TL_BM: from DN-left, diag: vLow(middle)->vHigh(left)");
		ok( mock_check_calls(), "TL_BM: from DN-left, all calls received" );
	}
	
	/*    
	 *	 \
	 *	  \------------------*----
	 *	   \      			/
	 *		\    		   /
	 *		 \------*-----/
	 *		  \	   / \	 /
	 */
	function test_TR_BM() {
		var myPolygonData = new PNLTRI.PolygonData( [ [
			{ x:10, y:35 }, { x:15, y:10 },		// left segment
			{ x:20, y:15 },						// middle point
			{ x:25, y: 5 }, { x:35, y:30 },		// right segment
			] ] );
		var myVertices = myPolygonData.getVertices();
//		showDataStructure( myPolygonData.getVertices(), [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
		//
		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		var segListArray = myQs.getSegListArray();
		//
		myQs.add_segment_consistently( segListArray[0], "TR_BM_1" );
		myQs.add_segment_consistently( segListArray[3], "TR_BM_2" );
		myQs.add_segment_consistently( segListArray[1], "TR_BM_3" );
		myQs.add_segment_consistently( segListArray[2], "TR_BM_4" );
		equal( myQs.nbTrapezoids(), 10, "TR_BM: nb. of trapezoids == 10");
		myQs.update_trapezoids();
//		drawTrapezoids( myQs.getRoot(), false, 1 );
		//
		var	myMono = new PNLTRI.MonoSplitter( myPolygonData );
		myMono.mockSetup();		// Mock Setup: Dependency Injection of Mock-Checks
		//
		// Main Test
		//
		var myTrap = myQs.getTrapByIdx(4);
//		drawTrapezoids( myTrap.sink, false, 1 );
			// from UP0
		mock_set_expected( [	[ 0, myVertices[2], myVertices[4], true ],		// (20,15)->(35,30)
								[ myTrap.d0, true, true, 0 ],
								[ myTrap.u0, false, true, 0 ],
								[ myTrap.d1, true, false, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, true, true );
		equal( myTrap.monoDiag, PNLTRI.TRAP_TR_BM, "TR_BM: from UP0, diag: vLow(middle)->vHigh(right)");
		ok( mock_check_calls(), "TR_BM: from UP0, all calls received" );
			// from UP1
		myTrap.setAbove( null, myTrap.u0 );		// exchange u0, u1
		myTrap.monoDiag = null;			// => not yet visited
		mock_set_expected( [	[ 0, myVertices[2], myVertices[4], true ],		// (20,15)->(35,30)
								[ myTrap.d0, true, true, 0 ],
								[ myTrap.u1, false, true, 0 ],
								[ myTrap.d1, true, false, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, true, false );
		equal( myTrap.monoDiag, PNLTRI.TRAP_TR_BM, "TR_BM: from UP1, diag: vLow(middle)->vHigh(right)");
		ok( mock_check_calls(), "TR_BM: from UP1, all calls received" );
			// from DN-left
		myTrap.monoDiag = null;			// => not yet visited
		mock_rewind();				// same data as "from UP" !!
		myMono.alyTrap_check( myTrap, false, true );
		equal( myTrap.monoDiag, PNLTRI.TRAP_TR_BM, "TR_BM: from DN-left, diag: vLow(middle)->vHigh(right)");
		ok( mock_check_calls(), "TR_BM: from DN-left, all calls received" );
			// from DN-right
		myTrap.monoDiag = null;			// => not yet visited
		mock_set_expected( [	[ 0, myVertices[2], myVertices[4], false ],		// (35,30)->(20,15)
								[ myTrap.d0, true, true, 7 ],
								[ myTrap.u1, false, true, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, false, false );
		equal( myTrap.monoDiag, PNLTRI.TRAP_TR_BM, "TR_BM: from DN-right, diag: vHigh(right)->vLow(middle)");
		ok( mock_check_calls(), "TR_BM: from DN-right, all calls received" );
	}
	
	/*    
	 *	 \		  \ /		  /
	 *	  \--------*---------/
	 *	   \      			/
	 *		\    		   /
	 *	-----*------------/
	 *		  	   		 /
	 */
	function test_TM_BL() {
		var myPolygonData = new PNLTRI.PolygonData( [ [
			{ x:10, y:35 }, { x:15, y:10 },		// left segment
			{ x:25, y: 5 }, { x:35, y:30 },		// right segment
			{ x:20, y:25 },						// middle point
			] ] );
		var myVertices = myPolygonData.getVertices();
//		showDataStructure( myPolygonData.getVertices(), [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
		//
		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		var segListArray = myQs.getSegListArray();
		//
		myQs.add_segment_consistently( segListArray[4], "TM_BL_1" );
		myQs.add_segment_consistently( segListArray[3], "TM_BL_2" );
		myQs.add_segment_consistently( segListArray[0], "TM_BL_3" );
		myQs.add_segment_consistently( segListArray[2], "TM_BL_4" );
		equal( myQs.nbTrapezoids(), 10, "TM_BL: nb. of trapezoids == 10");
		myQs.update_trapezoids();
//		drawTrapezoids( myQs.getRoot(), false, 1 );
		//
		var	myMono = new PNLTRI.MonoSplitter( myPolygonData );
		myMono.mockSetup();		// Mock Setup: Dependency Injection of Mock-Checks
		//
		// Main Test
		//
		var myTrap = myQs.getTrapByIdx(2);
//		drawTrapezoids( myTrap.sink, false, 1 );
			// from UP-left
		mock_set_expected( [	[ 0, myVertices[1], myVertices[4], true ],		// (15,10)->(20,25)
								[ myTrap.u1, false, false, 7 ],
								[ myTrap.d0, true, false, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, true, true );
		equal( myTrap.monoDiag, PNLTRI.TRAP_TM_BL, "TM_BL: from UP-left, diag: vLow(left)->vHigh(middle)");
		ok( mock_check_calls(), "TM_BL: from UP-left, all calls received" );
			// from UP-right
		myTrap.monoDiag = null;			// => not yet visited
		mock_set_expected( [	[ 0, myVertices[1], myVertices[4], false ],		// (20,25)->(15,10)
								[ myTrap.u1, false, false, 0 ],
								[ myTrap.d0, true, false, 0 ],
								[ myTrap.u0, false, true, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, true, false );
		equal( myTrap.monoDiag, PNLTRI.TRAP_TM_BL, "TM_BL: from UP-right, diag: vHigh(middle)->vLow(left)");
		ok( mock_check_calls(), "TM_BL: from UP-right, all calls received" );
			// from DN0
		myTrap.monoDiag = null;			// => not yet visited
		mock_rewind();				// same data as "from UP-right" !!
		myMono.alyTrap_check( myTrap, false, true );
		equal( myTrap.monoDiag, PNLTRI.TRAP_TM_BL, "TM_BL: from DN0, diag: vHigh(middle)->vLow(left)");
		ok( mock_check_calls(), "TM_BL: from DN0, all calls received" );
			// from DN1
		myTrap.setBelow( null, myTrap.d0 );		// exchange d0, d1
		myTrap.monoDiag = null;			// => not yet visited
		mock_set_expected( [	[ 0, myVertices[1], myVertices[4], false ],		// (20,25)->(15,10)
								[ myTrap.u1, false, false, 0 ],
								[ myTrap.d1, true, false, 0 ],
								[ myTrap.u0, false, true, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, true, false );
		equal( myTrap.monoDiag, PNLTRI.TRAP_TM_BL, "TM_BL: from DN1, diag: vHigh(middle)->vLow(left)");
		ok( mock_check_calls(), "TM_BL: from DN1, all calls received" );
	}
	
	/*    
	 *	 \		  \ /		  /
	 *	  \--------*---------/
	 *	   \      			/
	 *		\    		   /
	 *		 \------------*-----
	 *		  \
	 */
	function test_TM_BR() {
		var myPolygonData = new PNLTRI.PolygonData( [ [
			{ x:10, y:35 }, { x:15, y: 5 },		// left segment
			{ x:25, y:10 }, { x:35, y:30 },		// right segment
			{ x:20, y:25 },						// middle point
			] ] );
		var myVertices = myPolygonData.getVertices();
//		showDataStructure( myPolygonData.getVertices(), [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
		//
		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		var segListArray = myQs.getSegListArray();
		//
		myQs.add_segment_consistently( segListArray[4], "TM_BR_1" );
		myQs.add_segment_consistently( segListArray[3], "TM_BR_2" );
		myQs.add_segment_consistently( segListArray[0], "TM_BR_3" );
		myQs.add_segment_consistently( segListArray[2], "TM_BR_4" );
		equal( myQs.nbTrapezoids(), 10, "TM_BR: nb. of trapezoids == 10");
		myQs.update_trapezoids();
//		drawTrapezoids( myQs.getRoot(), false, 1 );
		//
		var	myMono = new PNLTRI.MonoSplitter( myPolygonData );
		myMono.mockSetup();		// Mock Setup: Dependency Injection of Mock-Checks
		//
		// Main Test
		//
		var myTrap = myQs.getTrapByIdx(2);
//		drawTrapezoids( myTrap.sink, false, 1 );
			// from UP-right
		mock_set_expected( [	[ 0, myVertices[2], myVertices[4], false ],		// (20,25)->(25,10)
								[ myTrap.u0, false, true, 7 ],
								[ myTrap.d0, true, true, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, true, false );
		equal( myTrap.monoDiag, PNLTRI.TRAP_TM_BR, "TM_BR: from UP-right, diag: vHigh(middle)->vLow(right)");
		ok( mock_check_calls(), "TM_BR: from UP-right, all calls received" );
			// from UP-left
		myTrap.monoDiag = null;			// => not yet visited
		mock_set_expected( [	[ 0, myVertices[2], myVertices[4], true ],		// (25,10)->(20,25)
								[ myTrap.u0, false, true, 0 ],
								[ myTrap.d0, true, true, 0 ],
								[ myTrap.u1, false, false, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, true, true );
		equal( myTrap.monoDiag, PNLTRI.TRAP_TM_BR, "TM_BR: from UP-left, diag: vLow(right)->vHigh(middle)");
		ok( mock_check_calls(), "TM_BR: from UP-left, all calls received" );
			// from DN0
		myTrap.monoDiag = null;			// => not yet visited
		mock_rewind();				// same data as "from UP-left" !!
		myMono.alyTrap_check( myTrap, false, true );
		equal( myTrap.monoDiag, PNLTRI.TRAP_TM_BR, "TM_BR: from DN0, diag: vLow(right)->vHigh(middle)");
		ok( mock_check_calls(), "TM_BR: from DN0, all calls received" );
			// from DN1
		myTrap.setBelow( null, myTrap.d0 );		// exchange d0, d1
		myTrap.monoDiag = null;			// => not yet visited
		mock_set_expected( [	[ 0, myVertices[2], myVertices[4], true ],		// (25,10)->(20,25)
								[ myTrap.u0, false, true, 0 ],
								[ myTrap.d1, true, true, 0 ],
								[ myTrap.u1, false, false, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, false, false );
		equal( myTrap.monoDiag, PNLTRI.TRAP_TM_BR, "TM_BR: from DN1, diag: vLow(right)->vHigh(middle)");
		ok( mock_check_calls(), "TM_BR: from DN1, all calls received" );
	}
	
	/*    
	 *	 \		  \ /		  /
	 *	  \--------*---------/
	 *	   \      			/
	 *		\    		   /
	 *		 \-----*------/
	 *		  \	  /	\	 /
	 */
	function test_TM_BM() {
		var myPolygonData = new PNLTRI.PolygonData( [ [
			{ x:10, y:35 }, { x:15, y: 5 },		// left segment
			{ x:22, y:15 },						// bottom-middle point
			{ x:25, y:10 }, { x:35, y:30 },		// right segment
			{ x:20, y:25 },						// top-middle point
			] ] );
		var myVertices = myPolygonData.getVertices();
//		showDataStructure( myPolygonData.getVertices(), [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
		//
		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		var segListArray = myQs.getSegListArray();
		//
		myQs.add_segment_consistently( segListArray[4], "TM_BM_1" );
		myQs.add_segment_consistently( segListArray[3], "TM_BM_2" );
		myQs.add_segment_consistently( segListArray[0], "TM_BM_3" );
		myQs.add_segment_consistently( segListArray[2], "TM_BM_4" );
		myQs.add_segment_consistently( segListArray[5], "TM_BM_5" );
		myQs.add_segment_consistently( segListArray[1], "TM_BM_6" );
		equal( myQs.nbTrapezoids(), 13, "TM_BM: nb. of trapezoids == 13");
		myQs.update_trapezoids();
//		drawTrapezoids( myQs.getRoot(), false, 1 );
		//
		var	myMono = new PNLTRI.MonoSplitter( myPolygonData );
		myMono.mockSetup();		// Mock Setup: Dependency Injection of Mock-Checks
		//
		// Main Test
		//
		var myTrap = myQs.getTrapByIdx(2);
//		drawTrapezoids( myTrap.sink, false, 1 );
			// from UP-left
		mock_set_expected( [	[ 0, myVertices[2], myVertices[5], true ],		// (22,15)->(20,25)
								[ myTrap.u0, false, true, 0 ],
								[ myTrap.d0, true, true, 0 ],
								[ myTrap.u1, false, false, 7 ],
								[ myTrap.d1, true, false, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, true, true );
		equal( myTrap.monoDiag, PNLTRI.TRAP_TM_BM, "TM_BM: from UP-left, diag: vLow(middle)->vHigh(middle)");
		ok( mock_check_calls(), "TM_BM: from UP-left, all calls received" );
			// from DN-left
		myTrap.monoDiag = null;			// => not yet visited
		mock_rewind();			// same calls as for "from UP-left" !
		myMono.alyTrap_check( myTrap, false, true );
		equal( myTrap.monoDiag, PNLTRI.TRAP_TM_BM, "TM_BM: from DN-left, diag: vLow(middle)->vHigh(middle)");
		ok( mock_check_calls(), "TM_BM: from DN-left, all calls received" );
			// from UP-right
		myTrap.monoDiag = null;			// => not yet visited
//		mock_check_off();
		mock_set_expected( [	[ 0, myVertices[2], myVertices[5], false ],		// (20,25)->(22,15)
								[ myTrap.u0, false, true, 7 ],
								[ myTrap.d0, true, true, 7 ],
								[ myTrap.u1, false, false, 0 ],
								[ myTrap.d1, true, false, 0 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, true, false );
		equal( myTrap.monoDiag, PNLTRI.TRAP_TM_BM, "TM_BM: from UP-right, diag: vHigh(middle)->vLow(middle)");
		ok( mock_check_calls(), "TM_BM: from UP-right, all calls received" );
			// from DN-right
		myTrap.monoDiag = null;			// => not yet visited
		mock_rewind();			// same calls as for "from UP-right" !
		myMono.alyTrap_check( myTrap, false, false );
		equal( myTrap.monoDiag, PNLTRI.TRAP_TM_BM, "TM_BM: from DN-right, diag: vHigh(middle)->vLow(middle)");
		ok( mock_check_calls(), "TM_BM: from DN-right, all calls received" );
	}

	/*    
	 *	------*-------
	 *		 / \
	 *		/	\
	 *	   /--*--\
	 *	  /	 / \  \
	 */
	function test_TLR_BM() {
		var myPolygonData = new PNLTRI.PolygonData( [ [
			{ x:20, y:25 },		// top point
			{ x:15, y: 5 },		// left segment
			{ x:22, y:15 },		// bottom-middle point
			{ x:30, y:10 },		// right segment
			] ] );
		var myVertices = myPolygonData.getVertices();
//		showDataStructure( myPolygonData.getVertices(), [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
		//
		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		var segListArray = myQs.getSegListArray();
		//
		myQs.add_segment_consistently( segListArray[3], "TLR_BM_1" );
		myQs.add_segment_consistently( segListArray[0], "TLR_BM_2" );
		myQs.add_segment_consistently( segListArray[2], "TLR_BM_3" );
		myQs.add_segment_consistently( segListArray[1], "TLR_BM_4" );
		equal( myQs.nbTrapezoids(), 9, "TLR_BM: nb. of trapezoids == 9");
		myQs.update_trapezoids();
//		drawTrapezoids( myQs.getRoot(), false, 1 );
		//
		var	myMono = new PNLTRI.MonoSplitter( myPolygonData );
		myMono.mockSetup();		// Mock Setup: Dependency Injection of Mock-Checks
		//
		// Main Test
		//
		var myTrap = myQs.getTrapByIdx(5);
//		drawTrapezoids( myTrap.sink, false, 1 );
			// from DN-left
		mock_set_expected( [	[ 0, myVertices[2], myVertices[0], true ],		// (22,15)->(20,25)
								[ myTrap.d0, true, true, 0 ],
								[ myTrap.d1, true, false, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, false, true );
		equal( myTrap.monoDiag, PNLTRI.TRAP_TLR_BM, "TLR_BM: from DN-left, diag: vLow(middle)->vHigh");
		ok( mock_check_calls(), "TLR_BM: from DN-left, all calls received" );
			// from DN-right
		myTrap.monoDiag = null;			// => not yet visited
		mock_set_expected( [	[ 0, myVertices[2], myVertices[0], false ],		// (20,25)->(22,15)
								[ myTrap.d1, true, false, 0 ],
								[ myTrap.d0, true, true, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, false, false );
		equal( myTrap.monoDiag, PNLTRI.TRAP_TLR_BM, "TLR_BM: from DN-right, diag: vHigh->vLow(middle)");
		ok( mock_check_calls(), "TLR_BM: from DN-right, all calls received" );
	}
	
	/*    
	 *	   \  \ /  /
	 *		\--*--/
	 *		 \	 /
	 *		  \ /
	 *	  -----*------
	 */
	function test_TM_BLR() {
		var myPolygonData = new PNLTRI.PolygonData( [ [
			{ x:10, y:35 },		// left segment
			{ x:22, y:15 },		// bottom point
			{ x:35, y:30 },		// right segment
			{ x:20, y:25 },		// top-middle point
			] ] );
		var myVertices = myPolygonData.getVertices();
//		showDataStructure( myPolygonData.getVertices(), [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
		//
		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		var segListArray = myQs.getSegListArray();
		//
		myQs.add_segment_consistently( segListArray[3], "TM_BLR_1" );
		myQs.add_segment_consistently( segListArray[0], "TM_BLR_2" );
		myQs.add_segment_consistently( segListArray[2], "TM_BLR_3" );
		myQs.add_segment_consistently( segListArray[1], "TM_BLR_4" );
		equal( myQs.nbTrapezoids(), 9, "TM_BLR: nb. of trapezoids == 9");
		myQs.update_trapezoids();
//		drawTrapezoids( myQs.getRoot(), false, 1 );
		//
		var	myMono = new PNLTRI.MonoSplitter( myPolygonData );
		myMono.mockSetup();		// Mock Setup: Dependency Injection of Mock-Checks
		//
		// Main Test
		//
		var myTrap = myQs.getTrapByIdx(2);
//		drawTrapezoids( myTrap.sink, false, 1 );
			// from UP-left
		mock_set_expected( [	[ 0, myVertices[1], myVertices[3], true ],		// (22,15)->(20,25)
								[ myTrap.u0, false, true, 0 ],
								[ myTrap.u1, false, false, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, true, true );
		equal( myTrap.monoDiag, PNLTRI.TRAP_TM_BLR, "TM_BLR: from UP-left, diag: vLow->vHigh(middle)");
		ok( mock_check_calls(), "TM_BLR: from UP-left, all calls received" );
			// from UP-right
		myTrap.monoDiag = null;			// => not yet visited
		mock_set_expected( [	[ 0, myVertices[1], myVertices[3], false ],		// (20,25)->(22,15)
								[ myTrap.u1, false, false, 0 ],
								[ myTrap.u0, false, true, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, true, false );
		equal( myTrap.monoDiag, PNLTRI.TRAP_TM_BLR, "TM_BLR: from UP-right, diag: vHigh(middle)->vLow");
		ok( mock_check_calls(), "TM_BLR: from UP-right, all calls received" );
	}
	
	/**************************************************************************/
	
	function test_monotonate_trapezoids( inDataName, inExpectedMonoChains, inDebug ) {
		PNLTRI.Math.randomTestSetup();		// set specific random seed for repeatable testing
		// for random-error detection - default seed: 73
//		PNLTRI.Math.myRandom( 1 );		// 3: 1 missing; 4,8: 2 missing; 10,11: nur weniger Chains
//		PNLTRI.Math.random = PNLTRI.Math.myRandom;
//		PNLTRI.Math.random = Math.random;
		//
		var	testData = new PolygonTestdata();
		var myPolygonData = new PNLTRI.PolygonData( testData.get_polygon_with_holes( inDataName ) );
		//
		var	myMono = new PNLTRI.MonoSplitter( myPolygonData );
		//
		// Main Test
		//
		var nbMonoChains = myMono.monotonate_trapezoids();			// implicitly creates trapezoids
		equal( nbMonoChains, inExpectedMonoChains, "monotonate_trapezoids ("+inDataName+"): Number of MonoChainIndices" );
		if ( inDebug > 0 ) {
//			showDataStructure( myPolygonData.getVertices(), [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
//			showDataStructure( myPolygonData.getSegments(), [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
//			showDataStructure( myPolygonData.getMonoSubPolys(), [ 'sprev', 'snext', 'mprev', 'vertTo', 'segOut' ] );
			//
//			showDataStructure( myPolygonData.monotone_chains_2_polygons() );
			drawPolygonLayers( { "mono": myPolygonData.monotone_chains_2_polygons() }, inDebug );
			//
			var myQsRoot = myMono.getQsRoot();
//			showDataStructure( myQsRoot );
			drawTrapezoids( myQsRoot, false, inDebug );
		}
	}

		
	test( "Polygon Monotone Splitter", function() {
		// no diagonal
		test_TL_BL();		// top-left, bottom-left
		test_TR_BR();		// top-right, bottom-right
		test_TL_BLR();		// top-left, bottom-cusp
		test_TR_BLR();		// top-right, bottom-cusp
		test_TLR_BL();		// top-cusp, bottom-left
		test_TLR_BR();		// top-cusp, bottom-right
		// diagonal split
		test_TL_BR();		// top-left, bottom-right
		test_TR_BL();		// top-right, bottom-left
		test_TL_BM();		// top-left, bottom-middle
		test_TR_BM();		// top-right, bottom-middle
		test_TM_BL();		// top-middle, bottom-left
		test_TM_BR();		// top-middle, bottom-right
		test_TM_BM();		// top-middle, bottom-middle
		test_TLR_BM();		// top-cusp, bottom-middle
		test_TM_BLR();		// top-middle, bottom-cusp
		//
		test_monotonate_trapezoids( "article_poly", 12, 0 );			// 1.5; from article Sei91
		test_monotonate_trapezoids( "trap_2up_2down", 2, 0 );			// 4; trapezoid with 2 upper and 2 lower neighbors
		test_monotonate_trapezoids( "hole_short_path", 4, 0 );			// 0.8; shortest path to hole is outside polygon
		test_monotonate_trapezoids( "three_error#1", 18, 0 );			// 1; 1.Error, integrating into Three.js
		test_monotonate_trapezoids( "three_error#2", 12, 0 );			// 0.7; 2.Error, integrating into Three.js (letter "1")
		test_monotonate_trapezoids( "three_error#3", 28, 0 );			// 3000; 3.Error, integrating into Three.js (logbuffer)
		test_monotonate_trapezoids( "three_error#4", 32, 0 );			// 1; 4.Error, integrating into Three.js (USA Maine)
		test_monotonate_trapezoids( "three_error#4b", 32, 0 );			// 0.04; 4.Error, integrating into Three.js (USA Maine)
	});
}

