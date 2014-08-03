/**
 * @author jahting / http://www.ameco.tv/
 */

/*	Base class extensions - for testing only */

PNLTRI.MonoSplitter.prototype.getQsRoot = function () {
	return	this.trapezoider.getQsRoot();
};

function test_MonoSplitter() {

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
		myMono.monotonate_trapezoids();
		equal( myPolygonData.nbMonoSubPolys(), inExpectedMonoChains, "monotonate_trapezoids ("+inDataName+"): Number of MonoChainIndices" );
		var checkResult;
		if ( checkResult = myPolygonData.check_normedMonoChains_consistency() )
			ok( false, "monotonate_trapezoids ("+inDataName+"): " + checkResult );
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

		test_monotonate_trapezoids( "article_poly", 12, 0 );			// 1.5; from article Sei91
		test_monotonate_trapezoids( "square_3triangholes", 2, 0 );		// 5; from	"Narkhede A. and Manocha D.", data_1
		test_monotonate_trapezoids( "trap_2up_2down", 2, 0 );			// 4; trapezoid with 2 upper and 2 lower neighbors
		test_monotonate_trapezoids( "pt_3_diag_max", 4, 0 );			// 4: vertex (6,6) with 3 additional diagonals (max)
		test_monotonate_trapezoids( "xy_bad_saw", 11, 0 );				// 2: very inconvenient contour in X- and Y-direction

		test_monotonate_trapezoids( "hole_short_path", 4, 0 );			// 0.8; shortest path to hole is outside polygon
		test_monotonate_trapezoids( "colinear#2", 8, 0 );				// 1; 4 touching co-linear lines & 4 touching colinear holes
		test_monotonate_trapezoids( "colinear#3", 14, 0 );				// 1; touching co-linear horizontal lines

		test_monotonate_trapezoids( "three_error#1", 18, 0 );			// 1; 1.Error, integrating into Three.js
		test_monotonate_trapezoids( "three_error#2", 12, 0 );			// 0.7; 2.Error, integrating into Three.js (letter "1")
		test_monotonate_trapezoids( "three_error#3", 28, 0 );			// 3000; 3.Error, integrating into Three.js (logbuffer)
		test_monotonate_trapezoids( "three_error#4", 32, 0 );			// 1; 4.Error, integrating into Three.js (USA Maine)
		test_monotonate_trapezoids( "three_error#4b", 32, 0 );			// 0.04; 4.Error, integrating into Three.js (USA Maine)
		test_monotonate_trapezoids( "hole_first", 7, 0 );				// 0.5; 5.Error, integrating into Three.js ("R")
		test_monotonate_trapezoids( "two_polygons#1", 14, 0 );			// 0.5; 6.Error, integrating into Three.js ("i")
		test_monotonate_trapezoids( "two_polygons#2", 2, 0 );			// 1; my#6: two trivial polygons
		test_monotonate_trapezoids( "polygons_inside_hole", 5, 0 );		// 0.7; my#7: square with unregular hole with two polygons inside
	});
}

