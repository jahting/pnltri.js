/**
 * For testing whether the node module for pnltri works properly.
 *
 * To test the node module:
 *  1. First build it, but don't submit them to npm, see README.md for instructions
 *  2. Run "node example.js"
 *  3. You should see a list of triangle vertex indices, like this (order may change):
 *		[ 0, 1, 11 ], [ 0, 11, 10 ], [ 10, 7, 4 ], [ 0, 10, 4 ], [ 4, 5, 3 ], [ 0, 4, 3 ],
 *		[ 3, 5, 8 ], [ 7, 10, 12 ], [ 12, 11, 1 ], [ 7, 12, 1 ], [ 7, 1, 2 ], [ 8, 7, 2 ],
 *		[ 3, 8, 2 ], [ 5, 6, 8 ], [ 6, 4, 9 ], [ 9, 4, 7 ], [ 8, 6, 9 ]
 *
 * @author jahting / http://www.ameco.tv
 */

var pnltri = function () {
		
	var PNLTRI = require('pnltri');
	
	// define polygon with holes
	var example_data = [
		// Contour
		[ { x:0.0, y:0.0 },	{ x:30.0, y:0.0 }, { x:30.0, y:40.0 }, { x:0.0, y:40.0 } ],
		// Holes
		[ { x: 2.5, y:26.0 },	{ x: 5.0, y:31.0 }, { x:10.0, y:28.5 } ],
		[ { x:27.5, y:25.0 },	{ x:25.0, y:30.0 }, { x:20.0, y:27.5 } ],
		[ { x:15.0, y:20.0 },	{ x:12.5, y:10.0 }, { x:18.0, y:10.0 } ],
						];
	
	// triangulate the polygon with holes
	var myTriangulator = new PNLTRI.Triangulator();
	var triangList = myTriangulator.triangulate_polygon( example_data );
	
	// output the result
	var resultStr = ( triangList ) ?
			triangList.map( function(tri) { return "[ "+tri.join(", ")+" ]" } ).join(", ") :
			'NO Triangle-List!';
	console.log( resultStr );

};

pnltri();
