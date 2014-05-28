/**
 * @author jahting / http://www.ameco.tv/
 */

function test_Triangulator() {
	
	var	testData = new PolygonTestdata();

	function test_triangulate_polygon( inDataName, inExpectedMonoChains, inDebug ) {
		var example_data = testData.get_polygon_with_holes( inDataName );
		var	sollTriangList = testData.get_triangles( inDataName );
		//
		var myPolygonData = new PNLTRI.PolygonData( example_data );
		var	myMono = new PNLTRI.MonoSplitter( myPolygonData );			// implicitly creates trapezoids
		var	myTriangulator = new PNLTRI.MonoTriangulator( myPolygonData );
		//
		// Main Test
		//
		equal( myMono.monotonate_trapezoids(), inExpectedMonoChains, "triangulate_polygon ("+inDataName+"): Number of MonoChains" );
		if ( inDebug > 0 ) {
//			showDataStructure( myPolygonData.getVertices(), [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
//			showDataStructure( myPolygonData.getSegments(), [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
//			showDataStructure( myPolygonData.getMonoSubPolys(), [ 'sprev', 'snext', 'mprev', 'vertTo', 'segOut' ] );
			//
			drawPolygonLayers( { "mono": myPolygonData.monotone_chains_2_polygons() }, inDebug );
		}
		//
		myTriangulator.triangulate_all_polygons();
		var triangList = myPolygonData.getTriangles();
		equal( triangList.length, sollTriangList.length, "triangulate_polygon ("+inDataName+"): Number of Triangles" );
		deepEqual(	triangList, sollTriangList, "triangulate_polygon ("+inDataName+"): Triangle list" );
		if ( inDebug > 0 ) {
			drawPolygonLayers( { "poly": example_data, "triang": myPolygonData.triangles_2_polygons() }, inDebug );
			//
			var myQsRoot = myMono.getQsRoot();
//			showDataStructure( myQsRoot );
			drawTrapezoids( myQsRoot, false, inDebug );
		}
	}

	
	function test_triangulate_polygon2( inDataName ) {
		var polygonChains = testData.get_polygon_with_holes( inDataName );
		var	sollTriangList = testData.get_triangles( inDataName );
		//
		var myTriangulator = new PNLTRI.Triangulator();
		var triangList = myTriangulator.triangulate_polygon( polygonChains );
		//
		// Main Test
		//
		equal( triangList.length, sollTriangList.length, "triangulate_polygon2 ("+inDataName+"): Number of Triangles" );
		deepEqual(	triangList, sollTriangList, "triangulate_polygon2 ("+inDataName+"): Triangle list" );
		//
//		var myPolygonData = new PNLTRI.PolygonData( polygonChains );
//		drawPolygonLayers( { "poly": polygonChains, "triang": myPolygonData.triangles_2_polygons( triangList ) }, 1.5 );
	}

	
	test( "Triangulator for Simple Polygons with Holes", function() {
		test_triangulate_polygon( "article_poly", 12, 0 );				// 1.5; from article [Sei91]
		test_triangulate_polygon( "square_3triangholes", 2, 0 );		// 5; from	"Narkhede A. and Manocha D.", data_1
		test_triangulate_polygon( "trap_2up_2down", 2, 0 );				// 4; trapezoid with 2 upper and 2 lower neighbors
		test_triangulate_polygon( "pt_3_diag_max", 4, 0 );				// 4; vertex (6,6) with 3 additional diagonals (max)
		test_triangulate_polygon( "many_ears", 11, 0 );					// 2; from slides3.pdf
		test_triangulate_polygon( "y_monotone", 13, 0 );				// 2; from slides3.pdf
		test_triangulate_polygon( "for_sweep1", 9, 0 );					// 2; from slides3.pdf
		test_triangulate_polygon( "for_sweep2", 8, 0 );				// 2; from slides3.pdf
		test_triangulate_polygon( "for_sweep3", 19, 0 );				// 2; from slides3.pdf
		test_triangulate_polygon( "xy_bad_saw", 11, 0 );				// 2; from handout6.pdf
		//
		test_triangulate_polygon( "hole_short_path", 4, 0 );			// 0.8; shortest path to hole is outside polygon
		test_triangulate_polygon( "star_eight", 8, 0 );					// 10; symmetric 8-pointed star
		test_triangulate_polygon( "unregular_hole", 6, 0 );				// 10; unregular hole
		test_triangulate_polygon( "with_unregular_hole", 2, 0 );		// 0.7; square with unregular hole
		test_triangulate_polygon( "with_unreg_and_star_hole", 9, 0 );	// 0.7; square with unregular and star hole
		test_triangulate_polygon( "tree_error#1", 4, 0 );				// 1; from	Triangulation Error of Tree (TODO: Source)
		test_triangulate_polygon( "tree_full", 183, 0 );				// 0.22; from	Triangulation Error of Tree (TODO: Source)
		//
		test_triangulate_polygon( "three_error#1", 18, 0 );				// 1; 1.Error, integrating into Three.js (letter "t")
		test_triangulate_polygon( "three_error#2", 12, 0 );				// 0.7; 2.Error, integrating into Three.js (letter "1")
		test_triangulate_polygon( "three_error#3", 28, 0 );				// 3000; 3.Error, integrating into Three.js (logbuffer)
		test_triangulate_polygon( "three_error#4", 32, 0 );				// 1; 4.Error, integrating into Three.js (USA Maine)
		//
		test_triangulate_polygon( "squares_perftest_min", 14, 0 );		// 1: 3x3 squares in square, performance test
//		test_triangulate_polygon( "squares_perftest_mid", 422, 1 );		// 1: 15x15 squares in square, performance test
//		test_triangulate_polygon( "squares_perftest_max", 3122, 1 );	// 1: 40x40 squares in square, performance test
		//
		//
		test_triangulate_polygon2( "article_poly" );					// from article [Sei91]
	});
}

