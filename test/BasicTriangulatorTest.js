/**
 * @author jahting / http://www.ameco.tv/
 */

function test_BasicTriangulator() {

	function test_triangulate_single_polygon() {

		var myPolygonData, myTriangulator, myMonoChain, triangList;
		
		// Helper function
		function initSeglistMonoChain( inPtList ) {
			myPolygonData = new PNLTRI.PolygonData( [ inPtList ] );
			myTriangulator = new PNLTRI.BasicTriangulator( myPolygonData );
			//
			myMonoChain = myPolygonData.getSegments();
			triangList = myPolygonData.getTriangleList();
		}

		var myVertices;
		//
		// CCW Triangle
		myVertices = [ { x:8,y:14 }, { x:9,y:20 }, { x:6,y:18 } ];
		initSeglistMonoChain( myVertices );
		var result = myTriangulator.triangulate_single_polygon( myVertices );		// myMonoChain[1]
		equal( triangList.length, 1, "CCW Triangle: number" );
		deepEqual(	triangList[0], [ 2, 0, 1 ], "CCW Triangle: vertices" );
		//
		// CW Triangle
		myVertices = [ { x:8,y:14 }, { x:6,y:18 }, { x:9,y:20 } ];
		initSeglistMonoChain( myVertices );
		var result = myTriangulator.triangulate_single_polygon( myVertices );		// myMonoChain[2]
		equal( triangList.length, 1, "CW Triangle: number" );
		deepEqual(	triangList[0], [ 0, 2, 1 ], "CW Triangle: vertices" );
		//
		// 4-Vert: RightHandSide is the single segment chain
		myVertices = [ { x: 8,y:14 }, { x:11,y:23 }, { x: 9,y:20 }, { x: 6,y:18 } ];		// 9,20: concave angle
		initSeglistMonoChain( myVertices );
		var result = myTriangulator.triangulate_single_polygon( myVertices );		// myMonoChain[1]
		equal( triangList.length, 2, "RHS 4-vert: number" );
		deepEqual(	triangList, [ [ 0, 1, 2 ], [ 2, 3, 0 ] ], "RHS 4-vert: vertices" );
		//
		// 4-Vert: LeftHandSide is the single segment chain
		myVertices = [ { x:1,y: 3 }, { x:6,y:18 },{ x:3,y:19 }, { x:1,y:22 } ];				// 3,19: concave angle
		initSeglistMonoChain( myVertices );
		var result = myTriangulator.triangulate_single_polygon( myVertices );		// myMonoChain[3]
		equal( triangList.length, 2, "LHS 4-vert: number" );
		deepEqual(	triangList, [ [ 0, 1, 2 ], [ 2, 3, 0 ] ], "LHS 4-vert: vertices" );
		//
		// n-Vert: RightHandSide is the single segment chain
		myVertices = [ { x:9,y:20 }, { x:6,y:18 }, { x:8,y:14 }, { x:17,y:28 }, { x:14,y:25 }, { x:11,y:23 } ];		// 9,20 & 14,25: concave angle
		initSeglistMonoChain( myVertices );
		var result = myTriangulator.triangulate_single_polygon( myVertices );		// myMonoChain[3]
		equal( triangList.length, 4, "RHS n-vert: number" );
		deepEqual(	triangList, [ [ 0, 1, 2 ], [ 2, 3, 4 ], [ 4, 5, 0 ], [ 0, 2, 4 ] ], "RHS n-vert: vertices" );
		//
		// n-Vert: LeftHandSide is the single segment chain
		myVertices = [ { x:3,y: 7 }, { x:8,y:14 }, { x:6,y:18 }, { x:3,y:19 }, { x:1,y:22 }, { x:1,y: 3 } ];		// 3,7 & 3,19: concave angle
		initSeglistMonoChain( myVertices );
		var result = myTriangulator.triangulate_single_polygon( myVertices );		// myMonoChain[4]
		equal( triangList.length, 4, "LHS n-vert: number" );
		deepEqual(	triangList, [ [ 0, 1, 2 ], [ 3, 4, 5 ], [ 5, 0, 2 ], [ 2, 3, 5 ] ], "LHS n-vert: vertices" );
//		drawPolygonLayers( { "poly": [ myVertices ], "triang": myPolygonData.triangles_2_polygons() } );
	}

	
	test( "Basic Triangulator for Polygons without Holes", function() {
		test_triangulate_single_polygon();
	});
}

