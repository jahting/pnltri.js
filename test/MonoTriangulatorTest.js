/**
 * @author jahting / http://www.ameco.tv/
 */

function test_MonoTriangulator() {

	var	testData = new PolygonTestdata();


	/***************************************************************************
	 *	Tests
	 **************************************************************************/

	function test_triangulate_all_polygons( inDataName, inDrawScale ) {
		var baseData = testData.get_polygon_with_holes( inDataName );
		var expectedTriangList	= testData.get_triangles( inDataName );
		//
		var myPolygonData = new PNLTRI.PolygonData( baseData );
		var	myMonoTriang = new PNLTRI.MonoTriangulator( myPolygonData );
		//
		//	skips trapezoidation and monotone splitting of polygone
		//	instead sets the monotone chains directly
		//
		var test_data = {
			"square_3triangholes": {
				testMonoPolygonsIdx: [
					[ 8, 3, 0, 1, 4, 5, 12, 10, 11, 7 ],	// -> vertices
					[ 1, 2, 3, 8, 9, 7, 11, 12, 5, 6, 4 ],
					],
				testMonoStartIdxs: [ 1, 11 ],				// -> monoChain
			},
			"pt_3_diag_max": {
				testMonoPolygonsIdx:	[ [ 0, 1, 2 ], [ 0, 2, 6 ], [ 2, 4, 5, 6 ], [ 2, 3, 4 ] ],
				testMonoStartIdxs: [ 2, 5, 8, 10 ],
			},
		};
		//
		var testMonoPolygonsIdx		= test_data[inDataName].testMonoPolygonsIdx;
		var testMonoStartIdxs		= test_data[inDataName].testMonoStartIdxs;
		myPolygonData.replaceMonoChains( testMonoPolygonsIdx, testMonoStartIdxs );
		//
//		drawPolygonLayers( { "poly": baseData, "mono": myPolygonData.monotone_chains_2_polygons(),
//							 "triang": myPolygonData.triangles_2_polygons( expectedTriangList ) }, inDrawScale );
//		showDataStructure( myPolygonData.getSegments(), [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
		//
		myMonoTriang.triangulate_all_polygons();
		//
		var triangList = myPolygonData.getTriangles();
		equal( triangList.length, expectedTriangList.length, "Triangulation: Number of triangles ("+inDataName+")" );
		deepEqual( triangList, expectedTriangList, "Triangulation: Triangle list ("+inDataName+")" );
		//
//		drawPolygonLayers( { "poly": baseData, "triang": myPolygonData.triangles_2_polygons() }, inDrawScale );
	}


	function test_triangulate_monotone_polygon() {

		var myPolygonData, myMonoTriang, myMonoChain, triangList;

		// Helper function
		function initSeglistMonoChain( inPtList ) {
			myPolygonData = new PNLTRI.PolygonData( [ inPtList ] );
			myPolygonData.copyMonoChainsFromSegments();
			myMonoTriang = new PNLTRI.MonoTriangulator( myPolygonData );
			//
			myMonoChain = myPolygonData.getSegments();
			triangList = myPolygonData.getTriangleList();		// unsorted results !!
		}

		var myVertices;
		//
		// Triangle: RightHandSide is the single segment chain
		myVertices = [ { x:8,y:14 }, { x:9,y:20 }, { x:6,y:18 } ];
		initSeglistMonoChain( myVertices );
		myMonoTriang.triangulate_monotone_polygon( myMonoChain[1] );
		equal( triangList.length, 1, "RHS Triangle: number" );
		deepEqual(	triangList[0], [ 2, 0, 1 ], "RHS Triangle (changed to LHS): Triangle, CCW: start at posmax" );
		//
		// Triangle: LeftHandSide is the single segment chain
		myVertices = [ { x:1,y: 3 }, { x:4,y: 7 }, { x:8,y:14 } ];
		initSeglistMonoChain( myVertices );
		myMonoTriang.triangulate_monotone_polygon( myMonoChain[2] );
		equal( triangList.length, 1, "LHS Triangle: number" );
		deepEqual(	triangList[0], [ 0, 1, 2 ], "LHS Triangle: Triangle, CCW: start at posmax.mnext, that is posmin" );
		//
		//
		// 4-Vert: RightHandSide is the single segment chain
		myVertices = [ { x: 8,y:14 }, { x:11,y:23 }, { x: 9,y:20 }, { x: 6,y:18 } ];		// 9,20: concave angle
		initSeglistMonoChain( myVertices );
		myMonoTriang.triangulate_monotone_polygon( myMonoChain[1] );
		equal( triangList.length, 2, "RHS 4-vert: number" );
		deepEqual(	triangList, [	[ 2, 3, 0 ], [ 2, 0, 1 ],
									], "RHS 4-vert: Triangles (changed to LHS), CCW: start at posmax" );
		//
		// 4-Vert: LeftHandSide is the single segment chain
		myVertices = [ { x:1,y: 3 }, { x:6,y:18 },{ x:3,y:19 }, { x:1,y:22 } ];			// 3,19: concave angle
		initSeglistMonoChain( myVertices );
		myMonoTriang.triangulate_monotone_polygon( myMonoChain[3] );
		equal( triangList.length, 2, "LHS 4-vert: number" );
		deepEqual(	triangList, [	[ 0, 1, 2 ], [ 0, 2, 3 ],
									], "LHS 4-vert: Triangles, CCW: start at posmax.mnext, that is posmin" );
		//
		//
		// n-Vert: RightHandSide is the single segment chain
		myVertices = [ { x:9,y:20 }, { x:6,y:18 }, { x:8,y:14 }, { x:17,y:28 }, { x:14,y:25 }, { x:11,y:23 } ];		// 9,20 & 14,25: concave angle
		initSeglistMonoChain( myVertices );
		myMonoTriang.triangulate_monotone_polygon( myMonoChain[3] );
		equal( triangList.length, 4, "RHS n-vert: number" );
		deepEqual(	triangList, [	[ 4, 5, 0 ], [ 0, 1, 2 ], [ 4, 0, 2 ], [ 4, 2, 3 ],
									], "RHS n-vert: Triangles (changed to LHS), CCW: start at posmax" );
//		drawPolygonLayers( { "poly": [ myVertices ], "triang": myPolygonData.triangles_2_polygons() } );
		//
		// n-Vert: LeftHandSide is the single segment chain
		myVertices = [ { x:3,y: 7 }, { x:8,y:14 }, { x:6,y:18 }, { x:3,y:19 }, { x:1,y:22 }, { x:1,y: 3 } ];		// 3,7 & 3,19: concave angle
		initSeglistMonoChain( myVertices );
		myMonoTriang.triangulate_monotone_polygon( myMonoChain[4] );
		equal( triangList.length, 4, "LHS n-vert: number" );
		deepEqual(	triangList, [	[ 0, 1, 2 ], [ 5, 0, 2 ], [ 5, 2, 3 ], [ 5, 3, 4 ],
									], "LHS n-vert: Triangles, CCW: start at posmax.mnext, that is posmin" );
//		drawPolygonLayers( { "poly": [ myVertices ], "triang": myPolygonData.triangles_2_polygons() } );
		//
		// 2-Vert MonoChain: Robustness, Error Case
		myVertices = [ { x:8,y:14 }, { x:9,y:20 }, { x:6,y:18 } ];
		initSeglistMonoChain( myVertices );
		// shortens MonoChain to length 2
		myMonoChain[1].mnext.mnext = myMonoChain[1];
		myMonoChain[1].mnext.mprev = myMonoChain[1];
		myMonoChain[1].mprev = myMonoChain[1].mnext;
		myMonoTriang.triangulate_monotone_polygon( myMonoChain[1] );
		equal( triangList.length, 0, "No Triangle from 2 vertices" );
		//
		// 1-Vert MonoChain: Robustness, Error Case
		myVertices = [ { x:8,y:14 }, { x:9,y:20 }, { x:6,y:18 } ];
		initSeglistMonoChain( myVertices );
		// shortens MonoChain to length 1
		myMonoChain[1].mnext = myMonoChain[1];
		myMonoChain[1].mprev = myMonoChain[1];
//		showDataStructure( myMonoChain, [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
		myMonoTriang.triangulate_monotone_polygon( myMonoChain[1] );
		equal( triangList.length, 0, "No Triangle from 1 vertex" );
	}

	function test_triangulate_monotone_polygon_colinear() {

		var myPolygonData, myMonoTriang, myMonoChain, triangList;

		// Helper function
		function initSeglistMonoChain( inPtList ) {
			myPolygonData = new PNLTRI.PolygonData( [ inPtList ] );
			myPolygonData.copyMonoChainsFromSegments();
			myMonoTriang = new PNLTRI.MonoTriangulator( myPolygonData );
			//
			myMonoChain = myPolygonData.getSegments();
			triangList = myPolygonData.getTriangleList();		// unsorted results !!
		}

		var myVertices;
		//
		// co-linear reversal
		// reversal high, right triang low
		myVertices = [ { x:30,y:30 }, { x:10,y:10 }, { x:28,y:23 }, { x:20,y:20 } ];
		initSeglistMonoChain( myVertices );
		myMonoTriang.triangulate_monotone_polygon( myMonoChain[0] );
		equal( triangList.length, 2, "LHS, co-linear reversal high: number" );
		deepEqual(	triangList, [ [ 1, 2, 3 ], [ 1, 3, 0 ] ], "LHS, co-linear reversal high: Triangles" );
//		drawPolygonLayers( { "poly": [ myVertices ], "triang": myPolygonData.triangles_2_polygons() } );
		//
		// reversal high, left triang low
		myVertices = [ { x:30,y:30 }, { x:20,y:20 }, { x:8,y:22 }, { x:10,y:10 } ];
		initSeglistMonoChain( myVertices );
		myMonoTriang.triangulate_monotone_polygon( myMonoChain[0] );
		equal( triangList.length, 2, "RHS, co-linear reversal high: number" );
		deepEqual(	triangList, [ [ 1, 2, 3 ], [ 1, 3, 0 ] ], "RHS, co-linear reversal high: Triangles" );
//		drawPolygonLayers( { "poly": [ myVertices ], "triang": myPolygonData.triangles_2_polygons() } );
		//
		// reversal low, right triang high
		myVertices = [ { x:40,y:40 }, { x:20,y:20 }, { x:30,y:30 }, { x:41,y:29 } ];
		initSeglistMonoChain( myVertices );
		myMonoTriang.triangulate_monotone_polygon( myMonoChain[0] );
		equal( triangList.length, 2, "LHS, co-linear reversal low: number" );			// TODO: Error
		deepEqual(	triangList, [ [ 2, 3, 0 ], [ 1, 2, 0 ] ], "LHS, co-linear reversal low: Triangles" );
//		drawPolygonLayers( { "poly": [ myVertices ], "triang": myPolygonData.triangles_2_polygons() } );
		//
		// reversal low, left triang high
		myVertices = [ { x:40,y:40 }, { x:23,y:28 }, { x:30,y:30 }, { x:20,y:20 } ];
		initSeglistMonoChain( myVertices );
		myMonoTriang.triangulate_monotone_polygon( myMonoChain[0] );
		equal( triangList.length, 2, "RHS, co-linear reversal low: number" );
		deepEqual(	triangList, [ [ 2, 3, 0 ], [ 1, 2, 0 ] ], "RHS, co-linear reversal low: Triangles" );
//		drawPolygonLayers( { "poly": [ myVertices ], "triang": myPolygonData.triangles_2_polygons() } );
	}


	test( "Triangulator for uni-Y-monotone Polygons", function() {
		test_triangulate_all_polygons( "square_3triangholes", 5 );
		test_triangulate_all_polygons( "pt_3_diag_max", 4 );
		test_triangulate_monotone_polygon();
		test_triangulate_monotone_polygon_colinear();
	});
}

