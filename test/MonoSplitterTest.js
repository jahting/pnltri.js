/**
 * @author jahting / http://www.ameco.tv/
 */

/*	Base class extensions - for testing only */

PNLTRI.MonoSplitter.prototype.getQsRoot = function () {
		return	this.trapezoider.getQsRoot();
};
PNLTRI.MonoSplitter.prototype.alyTrap_check = function ( inTrap, inFromUp, inFromLeft, inTestName ) {
	var inChain = 0;
	var trapQueue = this.alyTrap( inChain, inTrap, inFromUp, inFromLeft, true );
	if ( mockDoChecks ) {
		var paras;
		while ( paras = trapQueue.pop() ) { mock_check( paras ) }
		ok( mock_check_calls(), inTestName + ", all calls received" );
	}
	ok( inTrap.monoDiag, inTestName );
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
	
function test_MonoSplitter() {
	
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

	/*    LR, Cusp
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
		var segListArray = myPolygonData.getSegments();
		//
		myQs.add_segment_consistently( segListArray[0], "TL_BL_1" );
		myQs.add_segment_consistently( segListArray[2], "TL_BL_2" );
		equal( myQs.nbTrapezoids(), 7, "TL_BL: nb. of trapezoids == 7");
//		drawTrapezoids( myQs.getRoot(), false, 1 );
		//
		var	myMono = new PNLTRI.MonoSplitter( myPolygonData );
		myMono.mockSetup();		// Mock Setup: Dependency Injection of Mock-Checks
		//
		// Main Test
		//
		var myTrap = myQs.getTrapByIdx(3);
		ok( !myTrap.uL, "TL_BL: uL null" );
		ok( !myTrap.dL, "TL_BL: dL null" );
//		drawTrapezoids( myTrap.sink, false, 1 );
			// from uR
		mock_set_expected( [ [ myTrap.dR, true, false, 0 ] ] );
		myMono.alyTrap_check( myTrap, true, false, "TL_BL: from uR, no diag" );
			//	already visited !!
		mock_set_expected();
		myMono.alyTrap_check( myTrap, true, false, "TL_BL: 2.from uR, no diag" );
			// from dR
		myTrap.monoDiag = null;			// => not yet visited
		mock_set_expected( [ [ myTrap.uR, false, false, 0 ] ] );
		myMono.alyTrap_check( myTrap, false, false, "TL_BL: from dR, no diag" );
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
		var segListArray = myPolygonData.getSegments();
		//
		myQs.add_segment_consistently( segListArray[0], "TR_BR_1" );
		myQs.add_segment_consistently( segListArray[2], "TR_BR_2" );
		equal( myQs.nbTrapezoids(), 7, "TR_BR: nb. of trapezoids == 7");
		//
		var	myMono = new PNLTRI.MonoSplitter( myPolygonData );
		myMono.mockSetup();		// Mock Setup: Dependency Injection of Mock-Checks
		//
		// Main Test
		//
		var myTrap = myQs.getTrapByIdx(4);
		ok( !myTrap.uR, "TR_BR: uR null" );
		ok( !myTrap.dR, "TR_BR: dR null" );
//		drawTrapezoids( myTrap.sink, false, 1 );
			// from uL
		mock_set_expected( [ [ myTrap.dL, true, true, 0 ] ] );
		myMono.alyTrap_check( myTrap, true, true, "TR_BR: from uL, no diag" );
			// from dL
		myTrap.monoDiag = null;			// => not yet visited
		mock_set_expected( [ [ myTrap.uL, false, true, 0 ] ] );
		myMono.alyTrap_check( myTrap, false, true, "TR_BR: from dL, no diag" );
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
		var segListArray = myPolygonData.getSegments();
		//
		myQs.add_segment_consistently( segListArray[0], "TL_BLR_1" );
		myQs.add_segment_consistently( segListArray[1], "TL_BLR_2" );
		equal( myQs.nbTrapezoids(), 6, "TL_BLR: nb. of trapezoids == 6");
//		drawTrapezoids( myQs.getRoot(), false, 1 );
		//
		var	myMono = new PNLTRI.MonoSplitter( myPolygonData );
		myMono.mockSetup();		// Mock Setup: Dependency Injection of Mock-Checks
		//
		// Main Test
		//
		var myTrap = myQs.getTrapByIdx(3);
		ok( !myTrap.uL, "TL_BLR: uL null" );
		ok( !myTrap.dL, "TL_BLR: dL null" );
		ok( !myTrap.dR, "TL_BLR: dR null" );
//		drawTrapezoids( myTrap.sink, false, 1 );
			// from uR
		mock_set_expected( [ [ myTrap.uR, false, false, 0 ] ] );
		myMono.alyTrap_check( myTrap, true, false, "TL_BLR: from uR, no diag" );
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
		var segListArray = myPolygonData.getSegments();
		//
		myQs.add_segment_consistently( segListArray[0], "TR_BLR_1" );
		myQs.add_segment_consistently( segListArray[1], "TR_BLR_2" );
		equal( myQs.nbTrapezoids(), 6, "TR_BLR: nb. of trapezoids == 6");
//		drawTrapezoids( myQs.getRoot(), false, 1 );
		//
		var	myMono = new PNLTRI.MonoSplitter( myPolygonData );
		myMono.mockSetup();		// Mock Setup: Dependency Injection of Mock-Checks
		//
		// Main Test
		//
		var myTrap = myQs.getTrapByIdx(4);
		ok( !myTrap.uR, "TR_BLR: uR null" );
		ok( !myTrap.dL, "TR_BLR: dL null" );
		ok( !myTrap.dR, "TR_BLR: dR null" );
//		drawTrapezoids( myTrap.sink, false, 1 );
			// from uL
		mock_set_expected( [ [ myTrap.uL, false, true, 0 ] ] );
		myMono.alyTrap_check( myTrap, true, true, "TR_BLR: from uL, no diag" );
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
		var segListArray = myPolygonData.getSegments();
		//
		myQs.add_segment_consistently( segListArray[0], "TLR_BL_1" );
		myQs.add_segment_consistently( segListArray[2], "TLR_BL_2" );
		equal( myQs.nbTrapezoids(), 6, "TLR_BL: nb. of trapezoids == 6");
//		drawTrapezoids( myQs.getRoot(), false, 1 );
		//
		var	myMono = new PNLTRI.MonoSplitter( myPolygonData );
		myMono.mockSetup();		// Mock Setup: Dependency Injection of Mock-Checks
		//
		// Main Test
		//
		var myTrap = myQs.getTrapByIdx(3);
		ok( !myTrap.uL, "TLR_BL: uL null" );
		ok( !myTrap.uR, "TLR_BL: uR null" );
		ok( !myTrap.dL, "TLR_BL: dL null" );
//		drawTrapezoids( myTrap.sink, false, 1 );
			// from dR
		mock_set_expected( [ [ myTrap.dR, true, false, 0 ] ] );
		myMono.alyTrap_check( myTrap, false, false, "TLR_BL: from dR, no diag" );
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
		var segListArray = myPolygonData.getSegments();
		//
		myQs.add_segment_consistently( segListArray[0], "TLR_BR_1" );
		myQs.add_segment_consistently( segListArray[2], "TLR_BR_2" );
		equal( myQs.nbTrapezoids(), 6, "TLR_BR: nb. of trapezoids == 6");
//		drawTrapezoids( myQs.getRoot(), false, 1 );
		//
		var	myMono = new PNLTRI.MonoSplitter( myPolygonData );
		myMono.mockSetup();		// Mock Setup: Dependency Injection of Mock-Checks
		//
		// Main Test
		//
		var myTrap = myQs.getTrapByIdx(3);
		ok( !myTrap.uL, "TLR_BR: uL null" );
		ok( !myTrap.uR, "TLR_BR: uR null" );
		ok( !myTrap.dR, "TLR_BR: dR null" );
//		drawTrapezoids( myTrap.sink, false, 1 );
			// from dL
		mock_set_expected( [ [ myTrap.dL, true, true, 0 ] ] );
		myMono.alyTrap_check( myTrap, false, true, "TLR_BR: from dL, no diag" );
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
		var segListArray = myPolygonData.getSegments();
		//
		myQs.add_segment_consistently( segListArray[0], "TL_BR_1" );
		myQs.add_segment_consistently( segListArray[2], "TL_BR_2" );
		equal( myQs.nbTrapezoids(), 7, "TL_BR: nb. of trapezoids == 7");
//		drawTrapezoids( myQs.getRoot(), false, 1 );
		//
		var	myMono = new PNLTRI.MonoSplitter( myPolygonData );
		myMono.mockSetup();		// Mock Setup: Dependency Injection of Mock-Checks
		//
		// Main Test
		//
		var myTrap = myQs.getTrapByIdx(3);
		ok( !myTrap.uL, "TL_BR: uL null" );
		ok( !myTrap.dR, "TL_BR: dR null" );
//		drawTrapezoids( myTrap.sink, false, 1 );
			// from uR
		mock_set_expected( [	[ 0, myVertices[2], myVertices[0], false ],		// (10,30)->(25,10)
								[ myTrap.dL, true, true, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, true, false, "TL_BR: from uR, diag: vHigh(left)->vLow(right)" );
			// from dL
		myTrap.monoDiag = null;			// => not yet visited
		mock_set_expected( [	[ 0, myVertices[2], myVertices[0], true ],		// (25,10)->(10,30)
								[ myTrap.uR, false, false, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, false, true, "TL_BR: from dL, diag: vLow(right)->vHigh(left)" );
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
		var segListArray = myPolygonData.getSegments();
		//
		myQs.add_segment_consistently( segListArray[0], "TR_BL_1" );
		myQs.add_segment_consistently( segListArray[2], "TR_BL_2" );
		equal( myQs.nbTrapezoids(), 7, "TR_BL: nb. of trapezoids == 7");
//		drawTrapezoids( myQs.getRoot(), false, 1 );
		//
		var	myMono = new PNLTRI.MonoSplitter( myPolygonData );
		myMono.mockSetup();		// Mock Setup: Dependency Injection of Mock-Checks
		//
		// Main Test
		//
		var myTrap = myQs.getTrapByIdx(4);
		ok( !myTrap.uR, "TR_BL: uR null" );
		ok( !myTrap.dL, "TR_BL: dL null" );
//		drawTrapezoids( myTrap.sink, false, 1 );
			// from uL
		mock_set_expected( [	[ 0, myVertices[1], myVertices[3], true ],		// (15,10)->(35,30)
								[ myTrap.dR, true, false, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, true, true, "TR_BL: from uL, diag: vLow(left)->vHigh(right)" );
			// from dR
		myTrap.monoDiag = null;			// => not yet visited
		mock_set_expected( [	[ 0, myVertices[1], myVertices[3], false ],		// (35,30)->(15,10)
								[ myTrap.uL, false, true, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, false, false, "TR_BL: from dR, diag: vHigh(right)->vLow(left)" );
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
		var segListArray = myPolygonData.getSegments();
		//
		myQs.add_segment_consistently( segListArray[0], "TL_BM_1" );
		myQs.add_segment_consistently( segListArray[3], "TL_BM_2" );
		myQs.add_segment_consistently( segListArray[1], "TL_BM_3" );
		myQs.add_segment_consistently( segListArray[2], "TL_BM_4" );
		equal( myQs.nbTrapezoids(), 10, "TL_BM: nb. of trapezoids == 10");
//		drawTrapezoids( myQs.getRoot(), false, 1 );
		//
		var	myMono = new PNLTRI.MonoSplitter( myPolygonData );
		myMono.mockSetup();		// Mock Setup: Dependency Injection of Mock-Checks
		//
		// Main Test
		//
		var myTrap = myQs.getTrapByIdx(3);
		ok( !myTrap.uL, "TL_BM: uL null" );
//		drawTrapezoids( myTrap.sink, false, 1 );
			// from uR
		mock_set_expected( [	[ 0, myVertices[2], myVertices[0], false ],		// (10,30)->(20,15)
								[ myTrap.dR, true, false, 0 ],
								[ myTrap.dL, true, true, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, true, false, "TL_BM: from uR, diag: vHigh(left)->vLow(middle)" );
			// from dR
		myTrap.monoDiag = null;			// => not yet visited
		mock_set_expected( [	[ 0, myVertices[2], myVertices[0], false ],		// (10,30)->(20,15)
								[ myTrap.uR, false, false, 0 ],
								[ myTrap.dL, true, true, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, false, false, "TL_BM: from dR, diag: vHigh(left)->vLow(middle)" );
			// from dL
		myTrap.monoDiag = null;			// => not yet visited
		mock_set_expected( [	[ 0, myVertices[2], myVertices[0], true ],		// (20,15)->(10,30)
								[ myTrap.dR, true, false, 7 ],
								[ myTrap.uR, false, false, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, false, true, "TL_BM: from dL, diag: vLow(middle)->vHigh(left)" );
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
		var segListArray = myPolygonData.getSegments();
		//
		myQs.add_segment_consistently( segListArray[0], "TR_BM_1" );
		myQs.add_segment_consistently( segListArray[3], "TR_BM_2" );
		myQs.add_segment_consistently( segListArray[1], "TR_BM_3" );
		myQs.add_segment_consistently( segListArray[2], "TR_BM_4" );
		equal( myQs.nbTrapezoids(), 10, "TR_BM: nb. of trapezoids == 10");
//		drawTrapezoids( myQs.getRoot(), false, 1 );
		//
		var	myMono = new PNLTRI.MonoSplitter( myPolygonData );
		myMono.mockSetup();		// Mock Setup: Dependency Injection of Mock-Checks
		//
		// Main Test
		//
		var myTrap = myQs.getTrapByIdx(4);
		ok( !myTrap.uR, "TR_BM: uR null" );
//		drawTrapezoids( myTrap.sink, false, 1 );
			// from uL
		mock_set_expected( [	[ 0, myVertices[2], myVertices[4], true ],		// (20,15)->(35,30)
								[ myTrap.dL, true, true, 0 ],
								[ myTrap.dR, true, false, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, true, true, "TR_BM: from uL, diag: vLow(middle)->vHigh(right)" );
			// from dL
		myTrap.monoDiag = null;			// => not yet visited
		mock_set_expected( [	[ 0, myVertices[2], myVertices[4], true ],		// (20,15)->(35,30)
								[ myTrap.uL, false, true, 0 ],
								[ myTrap.dR, true, false, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, false, true, "TR_BM: from dL, diag: vLow(middle)->vHigh(right)" );
			// from dR
		myTrap.monoDiag = null;			// => not yet visited
		mock_set_expected( [	[ 0, myVertices[2], myVertices[4], false ],		// (35,30)->(20,15)
								[ myTrap.dL, true, true, 7 ],
								[ myTrap.uL, false, true, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, false, false, "TR_BM: from dR, diag: vHigh(right)->vLow(middle)" );
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
		var segListArray = myPolygonData.getSegments();
		//
		myQs.add_segment_consistently( segListArray[4], "TM_BL_1" );
		myQs.add_segment_consistently( segListArray[3], "TM_BL_2" );
		myQs.add_segment_consistently( segListArray[0], "TM_BL_3" );
		myQs.add_segment_consistently( segListArray[2], "TM_BL_4" );
		equal( myQs.nbTrapezoids(), 10, "TM_BL: nb. of trapezoids == 10");
//		drawTrapezoids( myQs.getRoot(), false, 1 );
		//
		var	myMono = new PNLTRI.MonoSplitter( myPolygonData );
		myMono.mockSetup();		// Mock Setup: Dependency Injection of Mock-Checks
		//
		// Main Test
		//
		var myTrap = myQs.getTrapByIdx(2);
		ok( !myTrap.dL, "TM_BL: dL null" );
//		drawTrapezoids( myTrap.sink, false, 1 );
			// from uL
		mock_set_expected( [	[ 0, myVertices[1], myVertices[4], true ],		// (15,10)->(20,25)
								[ myTrap.uR, false, false, 7 ],
								[ myTrap.dR, true, false, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, true, true, "TM_BL: from uL, diag: vLow(left)->vHigh(middle)" );
			// from uR
		myTrap.monoDiag = null;			// => not yet visited
		mock_set_expected( [	[ 0, myVertices[1], myVertices[4], false ],		// (20,25)->(15,10)
								[ myTrap.dR, true, false, 0 ],
								[ myTrap.uL, false, true, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, true, false, "TM_BL: from uR, diag: vHigh(middle)->vLow(left)" );
			// from dR
		myTrap.monoDiag = null;			// => not yet visited
		mock_set_expected( [	[ 0, myVertices[1], myVertices[4], false ],		// (20,25)->(15,10)
								[ myTrap.uR, false, false, 0 ],
								[ myTrap.uL, false, true, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, false, false, "TM_BL: from dR, diag: vHigh(middle)->vLow(left)" );
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
		var segListArray = myPolygonData.getSegments();
		//
		myQs.add_segment_consistently( segListArray[4], "TM_BR_1" );
		myQs.add_segment_consistently( segListArray[3], "TM_BR_2" );
		myQs.add_segment_consistently( segListArray[0], "TM_BR_3" );
		myQs.add_segment_consistently( segListArray[2], "TM_BR_4" );
		equal( myQs.nbTrapezoids(), 10, "TM_BR: nb. of trapezoids == 10");
//		drawTrapezoids( myQs.getRoot(), false, 1 );
		//
		var	myMono = new PNLTRI.MonoSplitter( myPolygonData );
		myMono.mockSetup();		// Mock Setup: Dependency Injection of Mock-Checks
		//
		// Main Test
		//
		var myTrap = myQs.getTrapByIdx(2);
		ok( !myTrap.dR, "TM_BR: dR null" );
//		drawTrapezoids( myTrap.sink, false, 1 );
			// from uR
		mock_set_expected( [	[ 0, myVertices[2], myVertices[4], false ],		// (20,25)->(25,10)
								[ myTrap.uL, false, true, 7 ],
								[ myTrap.dL, true, true, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, true, false, "TM_BR: from uR, diag: vHigh(middle)->vLow(right)" );
			// from uL
		myTrap.monoDiag = null;			// => not yet visited
		mock_set_expected( [	[ 0, myVertices[2], myVertices[4], true ],		// (25,10)->(20,25)
								[ myTrap.dL, true, true, 0 ],
								[ myTrap.uR, false, false, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, true, true, "TM_BR: from uL, diag: vLow(right)->vHigh(middle)" );
			// from dL
		myTrap.monoDiag = null;			// => not yet visited
		mock_set_expected( [	[ 0, myVertices[2], myVertices[4], true ],		// (25,10)->(20,25)
								[ myTrap.uL, false, true, 0 ],
								[ myTrap.uR, false, false, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, false, true, "TM_BR: from dL, diag: vLow(right)->vHigh(middle)" );
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
		var segListArray = myPolygonData.getSegments();
		//
		myQs.add_segment_consistently( segListArray[4], "TM_BM_1" );
		myQs.add_segment_consistently( segListArray[3], "TM_BM_2" );
		myQs.add_segment_consistently( segListArray[0], "TM_BM_3" );
		myQs.add_segment_consistently( segListArray[2], "TM_BM_4" );
		myQs.add_segment_consistently( segListArray[5], "TM_BM_5" );
		myQs.add_segment_consistently( segListArray[1], "TM_BM_6" );
		equal( myQs.nbTrapezoids(), 13, "TM_BM: nb. of trapezoids == 13");
//		drawTrapezoids( myQs.getRoot(), false, 1 );
		//
		var	myMono = new PNLTRI.MonoSplitter( myPolygonData );
		myMono.mockSetup();		// Mock Setup: Dependency Injection of Mock-Checks
		//
		// Main Test
		//
		var myTrap = myQs.getTrapByIdx(2);
//		drawTrapezoids( myTrap.sink, false, 1 );
			// from uL
		mock_set_expected( [	[ 0, myVertices[2], myVertices[5], true ],		// (22,15)->(20,25)
								[ myTrap.dL, true, true, 0 ],
								[ myTrap.uR, false, false, 7 ],
								[ myTrap.dR, true, false, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, true, true, "TM_BM: from uL, diag: vLow(middle)->vHigh(middle)" );
			// from dL
		myTrap.monoDiag = null;			// => not yet visited
		mock_set_expected( [	[ 0, myVertices[2], myVertices[5], true ],		// (22,15)->(20,25)
								[ myTrap.uL, false, true, 0 ],
								[ myTrap.dR, true, false, 7 ],
								[ myTrap.uR, false, false, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, false, true, "TM_BM: from dL, diag: vLow(middle)->vHigh(middle)" );
			// from uR
		myTrap.monoDiag = null;			// => not yet visited
//		mock_check_off();
		mock_set_expected( [	[ 0, myVertices[2], myVertices[5], false ],		// (20,25)->(22,15)
								[ myTrap.dR, true, false, 0 ],
								[ myTrap.uL, false, true, 7 ],
								[ myTrap.dL, true, true, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, true, false, "TM_BM: from uR, diag: vHigh(middle)->vLow(middle)" );
			// from dR
		myTrap.monoDiag = null;			// => not yet visited
		mock_set_expected( [	[ 0, myVertices[2], myVertices[5], false ],		// (20,25)->(22,15)
								[ myTrap.uR, false, false, 0 ],
								[ myTrap.dL, true, true, 7 ],
								[ myTrap.uL, false, true, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, false, false, "TM_BM: from dR, diag: vHigh(middle)->vLow(middle)" );
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
		var segListArray = myPolygonData.getSegments();
		//
		myQs.add_segment_consistently( segListArray[3], "TLR_BM_1" );
		myQs.add_segment_consistently( segListArray[0], "TLR_BM_2" );
		myQs.add_segment_consistently( segListArray[2], "TLR_BM_3" );
		myQs.add_segment_consistently( segListArray[1], "TLR_BM_4" );
		equal( myQs.nbTrapezoids(), 9, "TLR_BM: nb. of trapezoids == 9");
//		drawTrapezoids( myQs.getRoot(), false, 1 );
		//
		var	myMono = new PNLTRI.MonoSplitter( myPolygonData );
		myMono.mockSetup();		// Mock Setup: Dependency Injection of Mock-Checks
		//
		// Main Test
		//
		var myTrap = myQs.getTrapByIdx(5);
		ok( !myTrap.uL, "TLR_BM: uL null" );
		ok( !myTrap.uR, "TLR_BM: uR null" );
//		drawTrapezoids( myTrap.sink, false, 1 );
			// from dL
		mock_set_expected( [	[ 0, myVertices[2], myVertices[0], true ],		// (22,15)->(20,25)
								[ myTrap.dL, true, true, 0 ],
								[ myTrap.dR, true, false, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, false, true, "TLR_BM: from dL, diag: vLow(middle)->vHigh" );
			// from dR
		myTrap.monoDiag = null;			// => not yet visited
		mock_set_expected( [	[ 0, myVertices[2], myVertices[0], false ],		// (20,25)->(22,15)
								[ myTrap.dR, true, false, 0 ],
								[ myTrap.dL, true, true, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, false, false, "TLR_BM: from dR, diag: vHigh->vLow(middle)" );
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
		var segListArray = myPolygonData.getSegments();
		//
		myQs.add_segment_consistently( segListArray[3], "TM_BLR_1" );
		myQs.add_segment_consistently( segListArray[0], "TM_BLR_2" );
		myQs.add_segment_consistently( segListArray[2], "TM_BLR_3" );
		myQs.add_segment_consistently( segListArray[1], "TM_BLR_4" );
		equal( myQs.nbTrapezoids(), 9, "TM_BLR: nb. of trapezoids == 9");
//		drawTrapezoids( myQs.getRoot(), false, 1 );
		//
		var	myMono = new PNLTRI.MonoSplitter( myPolygonData );
		myMono.mockSetup();		// Mock Setup: Dependency Injection of Mock-Checks
		//
		// Main Test
		//
		var myTrap = myQs.getTrapByIdx(2);
		ok( !myTrap.dL, "TM_BLR: dL null" );
		ok( !myTrap.dR, "TM_BLR: dR null" );
//		drawTrapezoids( myTrap.sink, false, 1 );
			// from uL
		mock_set_expected( [	[ 0, myVertices[1], myVertices[3], true ],		// (22,15)->(20,25)
								[ myTrap.uL, false, true, 0 ],
								[ myTrap.uR, false, false, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, true, true, "TM_BLR: from uL, diag: vLow->vHigh(middle)" );
			// from uR
		myTrap.monoDiag = null;			// => not yet visited
		mock_set_expected( [	[ 0, myVertices[1], myVertices[3], false ],		// (20,25)->(22,15)
								[ myTrap.uR, false, false, 0 ],
								[ myTrap.uL, false, true, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, true, false, "TM_BLR: from uR, diag: vHigh(middle)->vLow" );
	}
	
	/**************************************************************************/

	/*    
	 *	 \
	 *	  \------------------*----
	 *	   \      			/
	 *		\    		   /
	 *		 \------*-----/
	 *		  \	   / \	 /
	 */
	 function test_TR_BM__c_CCW_h_CW() {
		var myPolygonData = new PNLTRI.PolygonData( [
				[	// contour: CCW
			{ x:10, y:35 },		// left segment
			{ x:20, y:10 },		// bottom point
			{ x:35, y:30 },		// right segment
				],
				[	// hole: CW
			{ x:20, y:25 },		// top point
			{ x:25, y:22 }, { x:18, y:20 },
				] ] );
		var myVertices = myPolygonData.getVertices();
//		showDataStructure( myPolygonData.getVertices(), [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
		//
		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		var segListArray = myPolygonData.getSegments();
		//
		myQs.add_segment_consistently( segListArray[5], "TR_BM_1" );
		myQs.add_segment_consistently( segListArray[1], "TR_BM_2" );
		myQs.add_segment_consistently( segListArray[3], "TR_BM_3" );
		myQs.add_segment_consistently( segListArray[0], "TR_BM_4" );
		myQs.add_segment_consistently( segListArray[2], "TR_BM_5" );
		myQs.add_segment_consistently( segListArray[4], "TR_BM_6" );
		equal( myQs.nbTrapezoids(), 13, "TR_BM__c_CCW_h_CW: nb. of trapezoids");
//		drawTrapezoids( myQs.getRoot(), false, 1 );
		//
		var	myMono = new PNLTRI.MonoSplitter( myPolygonData );
		myMono.mockSetup();		// Mock Setup: Dependency Injection of Mock-Checks
		//
		// Main Test
		//
		var myTrap = myQs.getTrapByIdx(4);
		ok( !myTrap.uR, "TR_BM__c_CCW_h_CW: uR null" );
//		drawTrapezoids( myTrap.sink, false, 1 );
			// from uL
		mock_set_expected( [	[ 0, myVertices[3], myVertices[2], true ],		// (20,25)->(35,30)
								[ myTrap.dL, true, true, 0 ],
								[ myTrap.dR, true, false, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, true, true, "TR_BM__c_CCW_h_CW: from uL, diag: vLow(middle)->vHigh(right)" );
			// from dL
		myTrap.monoDiag = null;			// => not yet visited
		mock_set_expected( [	[ 0, myVertices[3], myVertices[2], true ],		// (20,25)->(35,30)
								[ myTrap.uL, false, true, 0 ],
								[ myTrap.dR, true, false, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, false, true, "TR_BM__c_CCW_h_CW: from dL, diag: vLow(middle)->vHigh(right)" );
			// from dR
		myTrap.monoDiag = null;			// => not yet visited
		mock_set_expected( [	[ 0, myVertices[3], myVertices[2], false ],		// (35,30)->(20,25)
								[ myTrap.dL, true, true, 7 ],
								[ myTrap.uL, false, true, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, false, false, "TR_BM__c_CCW_h_CW: from dR, diag: vHigh(right)->vLow(middle)" );
	}
	
	 function test_TR_BM__c_CW_h_CCW() {
		var myPolygonData = new PNLTRI.PolygonData( [
				[	// contour: CW
			{ x:20, y:10 },		// left segment
			{ x:10, y:35 },		// top segment
			{ x:35, y:30 },		// right segment
				],
				[	// hole: CCW
			{ x:20, y:25 },		// top point
			{ x:18, y:20 }, { x:25, y:22 },
				] ] );
		var myVertices = myPolygonData.getVertices();
//		showDataStructure( myPolygonData.getVertices(), [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
		//
		var myQs = new PNLTRI.QueryStructure( myPolygonData );
		var segListArray = myPolygonData.getSegments();
		//
		myQs.add_segment_consistently( segListArray[3], "TR_BM_1" );
		myQs.add_segment_consistently( segListArray[2], "TR_BM_2" );
		myQs.add_segment_consistently( segListArray[5], "TR_BM_3" );
		myQs.add_segment_consistently( segListArray[0], "TR_BM_4" );
		myQs.add_segment_consistently( segListArray[1], "TR_BM_5" );
		myQs.add_segment_consistently( segListArray[4], "TR_BM_6" );
		equal( myQs.nbTrapezoids(), 13, "TR_BM__c_CW_h_CCW: nb. of trapezoids");
//		drawTrapezoids( myQs.getRoot(), false, 1 );
		//
		var	myMono = new PNLTRI.MonoSplitter( myPolygonData );
		myMono.mockSetup();		// Mock Setup: Dependency Injection of Mock-Checks
		//
		// Main Test
		//
		var myTrap = myQs.getTrapByIdx(4);
		ok( !myTrap.uR, "TR_BM__c_CW_h_CCW: uR null" );
//		drawTrapezoids( myTrap.sink, false, 1 );
			// from uL
		mock_set_expected( [	[ 0, myVertices[3], myVertices[2], true ],		// (20,25)->(35,30)
								[ myTrap.dL, true, true, 0 ],
								[ myTrap.dR, true, false, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, true, true, "TR_BM__c_CW_h_CCW: from uL, diag: vLow(middle)->vHigh(right)" );
			// from dL
		myTrap.monoDiag = null;			// => not yet visited
		mock_set_expected( [	[ 0, myVertices[3], myVertices[2], true ],		// (20,25)->(35,30)
								[ myTrap.uL, false, true, 0 ],
								[ myTrap.dR, true, false, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, false, true, "TR_BM__c_CW_h_CCW: from dL, diag: vLow(middle)->vHigh(right)" );
			// from dR
		myTrap.monoDiag = null;			// => not yet visited
		mock_set_expected( [	[ 0, myVertices[3], myVertices[2], false ],		// (35,30)->(20,25)
								[ myTrap.dL, true, true, 7 ],
								[ myTrap.uL, false, true, 7 ] ], [	7 ] );
		myMono.alyTrap_check( myTrap, false, false, "TR_BM__c_CW_h_CCW: from dR, diag: vHigh(right)->vLow(middle)" );
	}
	
	/**************************************************************************/

	var	testData = new PolygonTestdata();

	function test_monotonate_trapezoids( inDataName, inExpectedMonoChains, inDebug ) {
		PNLTRI.Math.randomTestSetup();		// set specific random seed for repeatable testing
		// for random-error detection - default seed: 73
//		PNLTRI.Math.myRandom( 1 );		// 3: 1 missing; 4,8: 2 missing; 10,11: nur weniger Chains
//		PNLTRI.Math.random = PNLTRI.Math.myRandom;
//		PNLTRI.Math.random = Math.random;
		//
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
		// contour: CCW; no hole
		//	no diagonal
		test_TL_BL();		// top-left, bottom-left
		test_TR_BR();		// top-right, bottom-right
		test_TL_BLR();		// top-left, bottom-cusp
		test_TR_BLR();		// top-right, bottom-cusp
		test_TLR_BL();		// top-cusp, bottom-left
		test_TLR_BR();		// top-cusp, bottom-right
		//	diagonal split
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
		// contour & hole
		//	diagonal split
		test_TR_BM__c_CCW_h_CW();	// top-right, bottom-middle; contour: CCW; hole: CW
		test_TR_BM__c_CW_h_CCW();	// top-right, bottom-middle; contour: CW; hole: CCW
		//
		//
		test_monotonate_trapezoids( "article_poly", 12, 0 );			// 1.5; from article Sei91
		test_monotonate_trapezoids( "trap_2up_2down", 2, 0 );			// 4; trapezoid with 2 upper and 2 lower neighbors
		test_monotonate_trapezoids( "hole_short_path", 4, 0 );			// 0.8; shortest path to hole is outside polygon
		test_monotonate_trapezoids( "three_error#1", 18, 0 );			// 1; 1.Error, integrating into Three.js
		test_monotonate_trapezoids( "three_error#2", 12, 0 );			// 0.7; 2.Error, integrating into Three.js (letter "1")
		test_monotonate_trapezoids( "three_error#3", 28, 0 );			// 3000; 3.Error, integrating into Three.js (logbuffer)
		test_monotonate_trapezoids( "three_error#4", 32, 0 );			// 1; 4.Error, integrating into Three.js (USA Maine)
		test_monotonate_trapezoids( "three_error#4b", 32, 0 );			// 0.04; 4.Error, integrating into Three.js (USA Maine)
		test_monotonate_trapezoids( "two_polygons#1", 14, 0 );			// 0.5; 6.Error, integrating into Three.js ("i")
		test_monotonate_trapezoids( "two_polygons#2", 2, 0 );			// 1; my#6: two trivial polygons
		test_monotonate_trapezoids( "polygons_inside_hole", 5, 0 );		// 0.7; my#7: square with unregular hole with two polygons inside
	});
}

