/**
 * @author jahting / http://www.ameco.tv/
 */


/*	fix random number generation */

var random_seed = 1;

var myRandom = function ( inSeed ) {
	if ( inSeed ) { random_seed = inSeed }
	var rand = Math.abs(Math.sin(random_seed++)) * 10000;
	return	rand - Math.floor(rand);
}
PNLTRI.Math.random = myRandom;


var	testData = new PolygonTestdata();
var perf_test_data;

var myTriangulator = new PNLTRI.Triangulator();


var suite = new Benchmark.Suite;

suite.add('tree_full', function() {
		myRandom( 52 );			// constant seed
		perf_test_data = testData.get_polygon_with_holes( 'tree_full' );
		myTriangulator.triangulate_polygon( perf_test_data );
		// free memory
		myTriangulator.clear_lastData();
		perf_test_data = null;
	}, { maxTime: 10 }
);

suite.add('squares_perftest_mid', function() {
		myRandom( 52 );			// constant seed
		perf_test_data = testData.get_polygon_with_holes( 'squares_perftest_mid' );
		myTriangulator.triangulate_polygon( perf_test_data );
		// free memory
		myTriangulator.clear_lastData();
		perf_test_data = null;
	}, { maxTime: 10 }
);

suite.add('squares_perftest_max', function() {
		// 80: 205; 88: 783;
		// 89: 134, 231, 362, 419, 440, 460, 500, 525, 658, 835, 848, 883, 977
		// 90: 52, 97, 515
		myRandom( 52 );			// constant seed
		perf_test_data = testData.get_polygon_with_holes( 'squares_perftest_max' );
		myTriangulator.triangulate_polygon( perf_test_data );
		// free memory
		myTriangulator.clear_lastData();
		perf_test_data = null;
	}, { maxTime: 10 }
);

// called after each run cycle
suite.on('cycle', function(event, bench) {
	console.log(String(event.target));
});

/*
// called when the benchmark completes running
suite.on('complete', function() {
	console.log('Fastest is ' + this.filter('fastest').pluck('name'));
	console.log( "Done" );
});
*/

suite.run({ 'async': false, 'queued': true });
