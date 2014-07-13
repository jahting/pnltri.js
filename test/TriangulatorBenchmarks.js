/**
 * @author jahting / http://www.ameco.tv/
 */

var	testData = new PolygonTestdata();
var perf_test_data;

var myTriangulator = new PNLTRI.Triangulator();


var suite = new Benchmark.Suite;

suite.add('tree_full', function() {
		perf_test_data = testData.get_polygon_with_holes( 'tree_full' );
		myTriangulator.triangulate_polygon( perf_test_data );
		// free memory
		myTriangulator.clear_lastData();
		perf_test_data = null;
	}, { maxTime: 10 }
);

suite.add('squares_perftest_mid', function() {
		perf_test_data = testData.get_polygon_with_holes( 'squares_perftest_mid' );
		myTriangulator.triangulate_polygon( perf_test_data );
		// free memory
		myTriangulator.clear_lastData();
		perf_test_data = null;
	}, { maxTime: 10 }
);

suite.add('squares_perftest_max', function() {
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
