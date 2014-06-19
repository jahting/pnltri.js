/**
 * @author jahting / http://www.ameco.tv/
 */

function test_BasicTriangulator() {

	function test_triangulate_polygon_no_holes_basic() {

		var myPolygonData, myTriangulator, myMonoChain, triangList;
		
		// Helper function
		function initSeglistMonoChain( inPtList ) {
			myPolygonData = new PNLTRI.PolygonData( [ inPtList ] );
			myTriangulator = new PNLTRI.BasicTriangulator( myPolygonData );
			//
			myMonoChain = myPolygonData.getSegments();
			triangList = myPolygonData.getTriangleList();		// unsorted results !!
		}

		var myVertices;
		//
		// CCW Triangle
		myVertices = [ { x:8,y:14 }, { x:9,y:20 }, { x:6,y:18 } ];
		initSeglistMonoChain( myVertices );
		ok( myTriangulator.triangulate_polygon_no_holes(), "triangulate_polygon_no_holes_basic, CCW Triangle A: OK");
		equal( triangList.length, 1, "triangulate_polygon_no_holes_basic, CCW Triangle A: number" );
		deepEqual(	triangList[0], [ 2, 0, 1 ], "triangulate_polygon_no_holes_basic, CCW Triangle A: vertices" );
		//
		myVertices = [ { x:9,y:20 }, { x:6,y:18 }, { x:8,y:14 } ];		// shifted by one vertex
		initSeglistMonoChain( myVertices );
		ok( myTriangulator.triangulate_polygon_no_holes(), "triangulate_polygon_no_holes_basic, CCW Triangle B: OK");
		equal( triangList.length, 1, "triangulate_polygon_no_holes_basic, CCW Triangle B: number" );
		deepEqual(	triangList[0], [ 2, 0, 1 ], "triangulate_polygon_no_holes_basic, CCW Triangle B: vertices" );
		//
		// CW Triangle
		myVertices = [ { x:8,y:14 }, { x:6,y:18 }, { x:9,y:20 } ];
		initSeglistMonoChain( myVertices );
		ok( myTriangulator.triangulate_polygon_no_holes(), "triangulate_polygon_no_holes_basic, CW Triangle A: OK");
		equal( triangList.length, 1, "triangulate_polygon_no_holes_basic, CW Triangle A: number" );
		deepEqual(	triangList[0], [ 1, 0, 2 ], "triangulate_polygon_no_holes_basic, CW Triangle A: vertices" );
		//
		myVertices = [ { x:9,y:20 }, { x:8,y:14 }, { x:6,y:18 } ];
		initSeglistMonoChain( myVertices );
		ok( myTriangulator.triangulate_polygon_no_holes(), "triangulate_polygon_no_holes_basic, CW Triangle B: OK");
		equal( triangList.length, 1, "triangulate_polygon_no_holes_basic, CW Triangle B: number" );
		deepEqual(	triangList[0], [ 1, 0, 2 ], "triangulate_polygon_no_holes_basic, CW Triangle B: vertices" );
		//
		// 4-Vert: RightHandSide is the single segment chain
		myVertices = [ { x: 8,y:14 }, { x:11,y:23 }, { x: 9,y:20 }, { x: 6,y:18 } ];		// 9,20: concave angle
		initSeglistMonoChain( myVertices );
		ok( myTriangulator.triangulate_polygon_no_holes(), "triangulate_polygon_no_holes_basic, RHS 4-vert A: OK");
		equal( triangList.length, 2, "triangulate_polygon_no_holes_basic, RHS 4-vert A: number" );
		deepEqual(	triangList, [ [ 0, 1, 2 ], [ 0, 2, 3 ] ], "triangulate_polygon_no_holes_basic, RHS 4-vert A: vertices" );
		//
		myVertices = [ { x:11,y:23 }, { x: 9,y:20 }, { x: 6,y:18 }, { x: 8,y:14 } ];		// 9,20: concave angle
		initSeglistMonoChain( myVertices );
		ok( myTriangulator.triangulate_polygon_no_holes(), "triangulate_polygon_no_holes_basic, RHS 4-vert B: OK");
		equal( triangList.length, 2, "triangulate_polygon_no_holes_basic, RHS 4-vert B: number" );
		deepEqual(	triangList, [ [ 3, 0, 1 ], [ 3, 1, 2 ] ], "triangulate_polygon_no_holes_basic, RHS 4-vert B: vertices" );
		//
		// 4-Vert: LeftHandSide is the single segment chain
		myVertices = [ { x:1,y: 3 }, { x:6,y:18 },{ x:3,y:19 }, { x:1,y:22 } ];				// 3,19: concave angle
		initSeglistMonoChain( myVertices );
		ok( myTriangulator.triangulate_polygon_no_holes(), "triangulate_polygon_no_holes_basic, LHS 4-vert A: OK");
		equal( triangList.length, 2, "triangulate_polygon_no_holes_basic, LHS 4-vert A: number" );
		deepEqual(	triangList, [ [ 0, 1, 2 ], [ 0, 2, 3 ] ], "triangulate_polygon_no_holes_basic, LHS 4-vert A: vertices" );
		//
		myVertices = [ { x:1,y:22 }, { x:1,y: 3 }, { x:6,y:18 },{ x:3,y:19 } ];				// 3,19: concave angle
		initSeglistMonoChain( myVertices );
		ok( myTriangulator.triangulate_polygon_no_holes(), "triangulate_polygon_no_holes_basic, LHS 4-vert B: OK");
		equal( triangList.length, 2, "triangulate_polygon_no_holes_basic, LHS 4-vert B: number" );
		deepEqual(	triangList, [ [ 3, 0, 1 ], [ 3, 1, 2 ] ], "triangulate_polygon_no_holes_basic, LHS 4-vert B: vertices" );
		//
		// n-Vert: RightHandSide is the single segment chain
		myVertices = [ { x:9,y:20 }, { x:6,y:18 }, { x:8,y:14 }, { x:17,y:28 }, { x:14,y:25 }, { x:11,y:23 } ];		// 9,20 & 14,25: concave angle
		initSeglistMonoChain( myVertices );
		ok( myTriangulator.triangulate_polygon_no_holes(), "triangulate_polygon_no_holes_basic, RHS n-vert A: OK");
		equal( triangList.length, 4, "triangulate_polygon_no_holes_basic, RHS n-vert A: number" );
		deepEqual(	triangList, [ [ 0, 1, 2 ], [ 2, 3, 4 ], [ 2, 4, 5 ], [ 2, 5, 0 ] ], "triangulate_polygon_no_holes_basic, RHS n-vert A: vertices" );
		//
		myVertices = [ { x:17,y:28 }, { x:14,y:25 }, { x:11,y:23 }, { x:9,y:20 }, { x:6,y:18 }, { x:8,y:14 } ];		// 9,20 & 14,25: concave angle
		initSeglistMonoChain( myVertices );
		ok( myTriangulator.triangulate_polygon_no_holes(), "triangulate_polygon_no_holes_basic, RHS n-vert B: OK");
		equal( triangList.length, 4, "triangulate_polygon_no_holes_basic, RHS n-vert B: number" );
		deepEqual(	triangList, [ [ 5, 0, 1 ], [ 5, 1, 2 ], [ 5, 2, 3 ], [ 5, 3, 4 ] ], "triangulate_polygon_no_holes_basic, RHS n-vert B: vertices" );
		//
		// n-Vert: LeftHandSide is the single segment chain
		myVertices = [ { x:3,y: 7 }, { x:8,y:14 }, { x:6,y:18 }, { x:3,y:19 }, { x:1,y:22 }, { x:1,y: 3 } ];		// 3,7 & 3,19: concave angle
		initSeglistMonoChain( myVertices );
		ok( myTriangulator.triangulate_polygon_no_holes(), "triangulate_polygon_no_holes_basic, LHS n-vert A: OK");
		equal( triangList.length, 4, "triangulate_polygon_no_holes_basic, LHS n-vert A: number" );
		deepEqual(	triangList, [ [ 0, 1, 2 ], [ 0, 2, 3 ], [ 0, 3, 4 ], [ 0, 4, 5 ] ], "triangulate_polygon_no_holes_basic, LHS n-vert A: vertices" );
		//
		myVertices = [ { x:1,y:22 }, { x:1,y: 3 }, { x:3,y: 7 }, { x:8,y:14 }, { x:6,y:18 }, { x:3,y:19 } ];		// 3,7 & 3,19: concave angle
		initSeglistMonoChain( myVertices );
		ok( myTriangulator.triangulate_polygon_no_holes(), "triangulate_polygon_no_holes_basic, LHS n-vert B: OK");
		equal( triangList.length, 4, "triangulate_polygon_no_holes_basic, LHS n-vert B: number" );
		deepEqual(	triangList, [ [ 5, 0, 1 ], [ 5, 1, 2 ], [ 5, 2, 3 ], [ 5, 3, 4 ] ], "triangulate_polygon_no_holes_basic, LHS n-vert B: vertices" );
//		drawPolygonLayers( { "poly": [ myVertices ], "triang": myPolygonData.triangles_2_polygons() } );
		//
		//	ERROR Cases
		//
		// line intersections
		myVertices = [ { x:6, y:3 }, { x:1, y:1 }, { x:3, y:1 }, { x:3, y:3 } ];
		initSeglistMonoChain( myVertices );
		ok( !myTriangulator.triangulate_polygon_no_holes(), "triangulate_polygon_no_holes_basic, self intersection: NOT OK");
		equal( triangList.length, 1, "triangulate_polygon_no_holes_basic, self intersection: number" );
		deepEqual(	triangList, [ [ 1, 0, 3 ] ], "triangulate_polygon_no_holes_basic, self intersection: vertices" );
//		drawPolygonLayers( { "poly": [ myVertices ], "triang": myPolygonData.triangles_2_polygons() }, 10 );
	}

	function test_triangulate_polygon_no_holes_full( inDataName, inDebug, inXoff, inYoff ) {
		var	testData = new PolygonTestdata();
		var polygonChains = testData.get_polygon_with_holes( inDataName );
		var	sollTriangList = testData.get_triangles( inDataName, true );
		//
		// Main Test
		//
		var myPolygonData = new PNLTRI.PolygonData( polygonChains );
		var myTriangulator = new PNLTRI.BasicTriangulator( myPolygonData );
		ok( myTriangulator.triangulate_polygon_no_holes(), "triangulate_polygon_no_holes_full ("+inDataName+"): OK");
		//
		var triangList = myPolygonData.getTriangles();		// sorted results !!
		equal( triangList.length, sollTriangList.length, "triangulate_polygon_no_holes_full ("+inDataName+"): Number of Triangles" );
		deepEqual(	triangList, sollTriangList, "triangulate_polygon_no_holes_full ("+inDataName+"): Triangle list" );
		//
		if ( inDebug > 0 ) {
			drawPolygonLayers( { "poly": polygonChains, "triang": myPolygonData.triangles_2_polygons( triangList ) }, inDebug, inXoff, inYoff );
		}
	}

	
	test( "Basic Triangulator for Polygons without Holes", function() {
		test_triangulate_polygon_no_holes_basic();
		//
		test_triangulate_polygon_no_holes_full( "article_poly", 0 );			// 1.5; from article [Sei91]
		test_triangulate_polygon_no_holes_full( "trap_2up_2down", 0 );			// 4; trapezoid with 2 upper and 2 lower neighbors
		test_triangulate_polygon_no_holes_full( "pt_3_diag_max", 0 );			// 4; vertex (6,6) with 3 additional diagonals (max)
		test_triangulate_polygon_no_holes_full( "many_ears", 0 );				// 2; from slides3.pdf
		test_triangulate_polygon_no_holes_full( "y_monotone", 0 );				// 2.5; from slides3.pdf
		test_triangulate_polygon_no_holes_full( "for_sweep1", 0 );				// 2; from slides3.pdf
		test_triangulate_polygon_no_holes_full( "for_sweep2", 0 );				// 2; from slides3.pdf
		test_triangulate_polygon_no_holes_full( "for_sweep3", 0 );				// 2; from slides3.pdf
		test_triangulate_polygon_no_holes_full( "xy_bad_saw", 0 );				// 2; from handout6.pdf
		//
		test_triangulate_polygon_no_holes_full( "star_eight", 0 );				// 10; symmetric 8-pointed star
		test_triangulate_polygon_no_holes_full( "unregular_hole", 0 );			// 10; unregular hole
		//
		test_triangulate_polygon_no_holes_full( "three_error#1", 0 );			// 1; 1.Error, integrating into Three.js (letter "t")
		test_triangulate_polygon_no_holes_full( "three_error#2", 0 );			// 0.7; 2.Error, integrating into Three.js (letter "1")
		test_triangulate_polygon_no_holes_full( "three_error#3", 0, 0.01, -0.007 );		// 3000; 3.Error, integrating into Three.js (logbuffer)
		test_triangulate_polygon_no_holes_full( "three_error#4", 0 );			// 1; 4.Error, integrating into Three.js (USA Maine)
		test_triangulate_polygon_no_holes_full( "three_error#4b", 0, 850, 35 );	// 0.4; 4.Error, integrating into Three.js (USA Maine)
	});
}

