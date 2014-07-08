/**
 * @author jahting / http://www.ameco.tv/
 */

function test_Triangulator() {
	
	var	testData = new PolygonTestdata();

	function test_triangulate_polygon_details( inDataName, inExpectedMonoChains, inDebug ) {
		var example_data = testData.get_polygon_with_holes( inDataName );
		var	expectedTriangList = testData.get_triangles( inDataName );
		//
		var myPolygonData = new PNLTRI.PolygonData( example_data );
		var	myMono = new PNLTRI.MonoSplitter( myPolygonData );			// implicitly creates trapezoids
		//
		// Main Test
		//
		equal( myMono.monotonate_trapezoids(), inExpectedMonoChains, "triangulate_polygon_details ("+inDataName+"): Number of MonoChains" );
		if ( inDebug > 0 ) {
//			showDataStructure( myPolygonData.getVertices(), [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
//			showDataStructure( myPolygonData.getSegments(), [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
//			showDataStructure( myPolygonData.getMonoSubPolys(), [ 'sprev', 'snext', 'mprev', 'vertTo', 'segOut' ] );
			//
			drawPolygonLayers( { "mono": myPolygonData.monotone_chains_2_polygons() }, inDebug );
		}
		//
		var	myTriangulator = new PNLTRI.MonoTriangulator( myPolygonData );
		myTriangulator.triangulate_all_polygons();
		var triangList = myPolygonData.getTriangles();		// sorted results !!
		equal( triangList.length, expectedTriangList.length, "triangulate_polygon_details ("+inDataName+"): Number of Triangles" );
		deepEqual(	triangList, expectedTriangList, "triangulate_polygon_details ("+inDataName+"): Triangle list" );
		if ( inDebug > 0 ) {
			drawPolygonLayers( { "poly": example_data, "triang": myPolygonData.triangles_2_polygons() }, inDebug );
			//
			var myQsRoot = myMono.getQsRoot();
//			showDataStructure( myQsRoot );
			drawTrapezoids( myQsRoot, false, inDebug );
		}
	}

	
	function test_triangulate_polygon( inDataName, inForceTrapezoidation, inBasicAlgorithm, inPolyLeftArr, inDebug ) {
		var polygonChains = testData.get_polygon_with_holes( inDataName );
		var	expectedTriangList = testData.get_triangles( inDataName, inBasicAlgorithm );
		//
		var myTriangulator = new PNLTRI.Triangulator();
		var triangList = myTriangulator.triangulate_polygon( polygonChains, inForceTrapezoidation );		// sorted results !!
		//
		// Main Test
		//
		equal( triangList.length, expectedTriangList.length, "triangulate_polygon ("+inDataName+"): Number of Triangles" );
		deepEqual(	triangList, expectedTriangList, "triangulate_polygon ("+inDataName+"): Triangle list" );
		//
		deepEqual( myTriangulator.get_PolyLeftArr(), inPolyLeftArr, "triangulate_polygon ("+inDataName+"): PolyLeftArr OK?" );
		//
		if ( inDebug > 0 ) {
			var myPolygonData = new PNLTRI.PolygonData( polygonChains );
			drawPolygonLayers( { "poly": polygonChains, "triang": myPolygonData.triangles_2_polygons( triangList ) }, inDebug );
		}
	}

	
	test( "Triangulator for Simple Polygons with Holes", function() {
		test_triangulate_polygon_details( "article_poly", 12, 0 );				// 1.5; from article [Sei91]
		test_triangulate_polygon_details( "square_3triangholes", 2, 0 );		// 5; from	"Narkhede A. and Manocha D.", data_1
		test_triangulate_polygon_details( "trap_2up_2down", 2, 0 );				// 4; trapezoid with 2 upper and 2 lower neighbors
		test_triangulate_polygon_details( "pt_3_diag_max", 4, 0 );				// 4; vertex (6,6) with 3 additional diagonals (max)
		test_triangulate_polygon_details( "many_ears", 11, 0 );					// 2; from slides3.pdf
		test_triangulate_polygon_details( "y_monotone", 13, 0 );				// 2.5; from slides3.pdf
		test_triangulate_polygon_details( "for_sweep1", 9, 0 );					// 2; from slides3.pdf
		test_triangulate_polygon_details( "for_sweep2", 8, 0 );					// 2; from slides3.pdf
		test_triangulate_polygon_details( "for_sweep3", 19, 0 );				// 2; from slides3.pdf
		test_triangulate_polygon_details( "xy_bad_saw", 11, 0 );				// 2; from handout6.pdf
		//
		test_triangulate_polygon_details( "hole_short_path", 4, 0 );			// 0.8; shortest path to hole is outside polygon
		test_triangulate_polygon_details( "star_eight", 8, 0 );					// 10; symmetric 8-pointed star
		test_triangulate_polygon_details( "unregular_hole", 6, 0 );				// 10; unregular hole
		test_triangulate_polygon_details( "with_unregular_hole", 2, 0 );		// 0.7; square with unregular hole
		test_triangulate_polygon_details( "with_unreg_and_star_hole", 9, 0 );	// 0.7; square with unregular and star hole
		test_triangulate_polygon_details( "tree_error#1", 4, 0 );				// 1; from	Triangulation Error of Tree (TODO: Source)
		test_triangulate_polygon_details( "tree_full", 183, 0 );				// 0.22; from	Triangulation Error of Tree (TODO: Source)
		//
		test_triangulate_polygon_details( "three_error#1", 18, 0 );				// 1; 1.Error, integrating into Three.js (letter "t")
		test_triangulate_polygon_details( "three_error#2", 12, 0 );				// 0.7; 2.Error, integrating into Three.js (letter "1")
		test_triangulate_polygon_details( "three_error#3", 28, 0 );				// 3000; 3.Error, integrating into Three.js (logbuffer)
		test_triangulate_polygon_details( "three_error#4", 32, 0 );				// 1; 4.Error, integrating into Three.js (USA Maine)
		test_triangulate_polygon_details( "three_error#4b", 32, 0 );			// 0.04; 4.Error, integrating into Three.js (USA Maine)
		test_triangulate_polygon_details( "hole_first", 7, 0 );					// 0.5; 5.Error, integrating into Three.js ("R")
		test_triangulate_polygon_details( "two_polygons#1", 14, 0 );			// 0.5; 6.Error, integrating into Three.js ("i")
		test_triangulate_polygon_details( "two_polygons#2", 2, 0 );				// 1; my#6: two trivial polygons
		test_triangulate_polygon_details( "polygons_inside_hole", 5, 0 );		// 0.7; my#7: square with unregular hole with two polygons inside
		//
		test_triangulate_polygon_details( "squares_perftest_min", 14, 0 );		// 1: 3x3 squares in square, performance test
//		test_triangulate_polygon_details( "squares_perftest_mid", 422, 1 );		// 1: 15x15 squares in square, performance test
//		test_triangulate_polygon_details( "squares_perftest_max", 3122, 1 );	// 1: 40x40 squares in square, performance test
		//
		//
		test_triangulate_polygon( "article_poly", false, true, [ true ], 0 );				// 1.5; autom. switches to EarClipTriangulator
		test_triangulate_polygon( "article_poly", true, false, [ true ], 0 );				// 1.5; forced not to switch to EarClipTriangulator
		test_triangulate_polygon( "square_3triangholes", false, false, [ true, true, true, true ], 0 );		// 5; holes => uses Trapezoidation in any case
		test_triangulate_polygon( "square_3triangholes", true, false, [ true, true, true, true ], 0 );		// 5; holes => uses Trapezoidation in any case
		test_triangulate_polygon( "three_error#1", false, true, [ false ], 0 );				// 1; autom. switches to EarClipTriangulator
		test_triangulate_polygon( "three_error#1", true, false, [ false ], 0 );				// 1; forced not to switch to EarClipTriangulator
		test_triangulate_polygon( "hole_short_path", false, false, [ false, false ], 0 );	// 0.8; holes => uses Trapezoidation in any case
		test_triangulate_polygon( "hole_short_path", true, false, [ false, false ], 0 );	// 0.8; holes => uses Trapezoidation in any case
	});
}

