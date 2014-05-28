/**
 * @author jahting / http://www.ameco.tv/
 */

/*	TODO: Tests for appendVertexEntry, appendVertexOutsegEntry,
	createSegmentEntry, appendSegmentEntry,
	addVertexChain, addPolygonChain: second parameter, suppression of zero-length segments	*/


/*	Base class extensions - for testing only */
	
PNLTRI.PolygonData.prototype.getVertices = function () {
	return	this.vertices;
};
PNLTRI.PolygonData.prototype.getTriangleList = function () {
	return	this.triangles;
};
PNLTRI.PolygonData.prototype.nbSegments = function () {
	return	this.segments.length;
};
PNLTRI.PolygonData.prototype.allSegsInQueryStructure = function () {
	for ( var i=1, j=this.segments.length; i < j; i++ ) {
		if ( !this.segments[i].is_inserted )		return	false;
	}
	return	true;
};
PNLTRI.PolygonData.prototype.check_segments_consistency = function () {
	var bugList = [];
	for ( var i=1, j=this.segments.length; i < j; i++ ) {
		if ( this.segments[i].vFrom == null )		bugList.push( "SegNo#"+i+".vFrom: missing" );
		if ( this.segments[i].vTo == null )			bugList.push( "SegNo#"+i+".vTo: missing" );
		if ( this.segments[i].vFrom == this.segments[i].vTo )		bugList.push( "SegNo#"+i+": equal endpoints" );
		if ( this.segments[i].upward == null )		bugList.push( "SegNo#"+i+".upward: missing" );
/*		if ( compare_pts_yx( this.segments[i].vTo.pt, this.segments[i].vFrom.pt ) == 1 ) {		// upward
			if ( !this.segments[i].upward )			bugList.push( "SegNo#"+i+".upward: should be TRUE, from ("+this.segments[i].vFrom.pt.x+"/"+this.segments[i].vFrom.pt.y+"), to ("+this.segments[i].vTo.pt.x+"/"+this.segments[i].vTo.pt.y+")" );
		} else {
			if ( this.segments[i].upward )			bugList.push( "SegNo#"+i+".upward: should be FALSE, from ("+this.segments[i].vFrom.pt.x+"/"+this.segments[i].vFrom.pt.y+"), to ("+this.segments[i].vTo.pt.x+"/"+this.segments[i].vTo.pt.y+")" );
		}	*/
		if ( this.segments[i].sprev == null )		bugList.push( "SegNo#"+i+".sprev: missing" );
		if ( this.segments[i].snext == null )		bugList.push( "SegNo#"+i+".snext: missing" );
	}
	return	( bugList.length == 0 ) ? null : bugList;
};
PNLTRI.QueryStructure.prototype.addPolygonChain_consistently = function ( inRawPointList, inTestID ) {
	// integrated Unit-Test	!!
	var buglist = [];
	this.addPolygonChain( inRawPointList );
	if ( buglist = this.check_segments_consistency() )
		ok( !buglist, "addPolygonChain_consistently #"+inTestID+": " + buglist.join(", ") );
}
PNLTRI.PolygonData.prototype.replaceMonoChains = function ( inListIdxList, inMonoSubPolyStartsList ) {
	var i, startIdx;
	var j, jPrev, jNext;
	
	// replace monoChains
	this.segments = [];
	for (i=0; i<inListIdxList.length; i++) {
		startIdx = this.segments.length;
		for (j=0; j<inListIdxList[i].length; j++) {
			jPrev = ( j == 0 ) ? inListIdxList[i].length-1 : j-1;
			jNext = ( (j+1) == inListIdxList[i].length ) ? 0 : j+1;
			this.appendSegmentEntry( {	vFrom: this.vertices[ inListIdxList[i][j] ],
										mprev: startIdx + jPrev, mnext: startIdx + jNext } );
		}
	}
	for (i=0; i<this.segments.length; i++) {
		this.segments[i].mprev = this.segments[this.segments[i].mprev];	// replace index with link
		this.segments[i].mnext = this.segments[this.segments[i].mnext];	// replace index with link
	}
	
	// replace monoChainStarts
	this.monoSubPolyChains = [];
	for (i=0; i<inMonoSubPolyStartsList.length; i++) {
		this.monoSubPolyChains.push( this.segments[inMonoSubPolyStartsList[i]] );
	}
};
//	overrides standard version for testing !!
PNLTRI.PolygonData.prototype.getTriangles = function () {
	//	sorts triangles before returning them
	//	 for comparable test results !!
	
	function left0pad( inNumber, inDigits ) {
		var fullString = '000000000000000000000000000000000000000000' + inNumber;
		return	fullString.slice(fullString.length - inDigits);
	}
	
	var sortedList = [];
	var sortStrList = [];
	var	first, middle, last;
	var i;
	// rotate triangle IDs in each triangle to put smallest ID in [0]
	for (i=0; i<this.triangles.length; i++) {
		first = this.triangles[i][0];
		middle = this.triangles[i][1];
		last = this.triangles[i][2];
		if ( first < middle ) {
			if ( first < last ) {
				sortedList.push( [ first, middle, last,
									left0pad(first,10)+','+left0pad(middle,10)+','+left0pad(last,10) ] );
			} else {
				sortedList.push( [ last, first, middle,
									left0pad(last,10)+','+left0pad(first,10)+','+left0pad(middle,10) ] );
			}
		} else {	// middle < first
			if ( middle < last ) {
				sortedList.push( [ middle, last, first,
									left0pad(middle,10)+','+left0pad(last,10)+','+left0pad(first,10) ] );
			} else {
				sortedList.push( [ last, first, middle,
									left0pad(last,10)+','+left0pad(first,10)+','+left0pad(middle,10) ] );
			}
		}
	}
	// sort triangles: ATTENTION
	sortedList.sort( function (a, b) {
		return	( a[3] > b[3] )	? 1 : -1;
	} );
	// remove help-ID-string
	for (i=0; i<sortedList.length; i++) { sortedList[i].pop(); }
	//
	return	sortedList;
};
//
PNLTRI.PolygonData.prototype.checkMonoChainVertexIDs = function ( chainIdx, inVertIdxList ) {
	var monoChainStart = this.monoSubPolyChains[chainIdx];
	if ( !monoChainStart )	return	"checkMonoChainVertexIDs: monoSubPolyChains["+chainIdx+"] is empty!";

	var	resultStr = "checkMonoChainVertexIDs: monoSubPolyChains["+chainIdx+"] (expected,result): ";
	var	resultOk = true;

	var monoChainCur = monoChainStart;
	for (var i=0; i<inVertIdxList.length; i++) {
		if ( inVertIdxList[i] == monoChainCur.vFrom.id ) {
			resultStr += inVertIdxList[i] + ", ";
		} else {
			resultOk = false;
			resultStr += inVertIdxList[i] + "<>" + monoChainCur.vFrom.id + ", ";
		}
		monoChainCur = monoChainCur.mnext;
	}
	
	if ( monoChainCur != monoChainStart ) {
		resultOk = false;
		resultStr += "Length differs!";
	}
	
	if ( resultOk )		return	null;
	return	resultStr;
};
//	for display of the monotone polygons
PNLTRI.PolygonData.prototype.monotone_chains_2_polygons = function () {
	var monoChain, firstEntry;
	var polygon, polygons = [];
	for (var i=0; i<this.monoSubPolyChains.length; i++) {
		polygon = [];
		monoChain = firstEntry = this.monoSubPolyChains[i];
		do {
			polygon.push( monoChain.vFrom.pt );
			monoChain = monoChain.mnext;
		} while ( monoChain != firstEntry );	// monoChain not yet closed
		polygons.push( polygon );
	}
	return	polygons;
};
//	for display of the monotone polygons
PNLTRI.PolygonData.prototype.triangles_2_polygons = function ( inTriangles ) {
	var	triangles = inTriangles ?  inTriangles : this.triangles;
	var polygons = [];
	for (var i=0; i<triangles.length; i++) {
		polygons.push( [ this.vertices[ triangles[i][0] ].pt,
						 this.vertices[ triangles[i][1] ].pt,
						 this.vertices[ triangles[i][2] ].pt ] );
	}
	return	polygons;
};
//	for reducing the vertex and segment list to the used ones for finding errors
PNLTRI.PolygonData.prototype.map_segments_and_vertices = function ( inSegListArray, inIdxList ) {
	var i;
	var idxList = inIdxList;
	if ( !idxList ) {
		idxList = [];
		for (i=0; i<inSegListArray.length; i++) { idxList[i] = i }
	}
	var vertMap = [], vertIdMax = 0;
	var segment, from, to;
	var resStr = "<p/>Segments: ";
	for (i=0; i<idxList.length; i++) {
		segment = inSegListArray[idxList[i]];
		from = segment.vFrom;
		resStr += 'From: ID='+from.id+',{x:'+from.pt.x+',y:'+from.pt.y+'}, ';
		vertMap[from.id] = { pt: from.pt };
		if ( from.id > vertIdMax )		vertIdMax = from.id;
		to = segment.vTo;
		resStr += 'To: ID='+to.id+',{x:'+to.pt.x+',y:'+to.pt.y+"},<br/>";
		vertMap[to.id] = { pt: to.pt };
		if ( to.id > vertIdMax )		vertIdMax = to.id;
	}
	var j=0;
	var newVertStr = '<p/>Vertices:<br/>';
	resStr += '<p/>Vertex-Map: ';
	for (i=0; i<=vertIdMax; i++) {
		if ( vertMap[i] ) {
			vertMap[i].id=j;
			resStr += i+' -> '+j+', ';
			newVertStr += '{ x: '+vertMap[i].pt.x+', y: '+vertMap[i].pt.y+' },<br/>';
			j++;
		}
	}
	resStr += newVertStr;
	resStr += '<p/>new Segments: ';
	for (i=0; i<idxList.length; i++) {
		segment = inSegListArray[idxList[i]];
		from = segment.vFrom;
		resStr += vertMap[from.id].id+', ';
	}
	var info = document.createElement( 'div' );
	info.innerHTML = resStr;
	document.body.appendChild( info );
//	showDataStructure( vertMap );
};



function test_PolygonData() {
	
	var	testData = new PolygonTestdata();

	function test_compare_pts_yx() {
		var myPolygonData = new PNLTRI.PolygonData();
		// A > B
		var result = myPolygonData.compare_pts_yx( { x:30, y:22 }, { x:20, y:20 } );
		equal( result,  1, "A>B, wg. Y" );
		var result = myPolygonData.compare_pts_yx( { x:30, y:20 }, { x:20, y:20 } );
		equal( result,  1, "A>B, wg. X" );
		// A < B
		var result = myPolygonData.compare_pts_yx( { x:20, y:20 }, { x:30, y:22 } );
		equal( result, -1, "A<B, wg. Y" );
		var result = myPolygonData.compare_pts_yx( { x:20, y:20 }, { x:30, y:20 } );
		equal( result, -1, "A<B, wg. X" );
		var result = myPolygonData.compare_pts_yx( { x:20, y:20 }, { x:20.000000000101, y:20 } );
		equal( result, -1, "A<B, wg. X, trotz EPS" );
		// A == B
		var result = myPolygonData.compare_pts_yx( { x:20, y:20 }, { x:20, y:20 } );
		equal( result,  0, "A==B" );
		var result = myPolygonData.compare_pts_yx( { x:20, y:20 }, { x:20, y:20 + PNLTRI.Math.EPSILON_P * 0.8 } );
		equal( result,  0, "A==B, trotz Y" );
		var result = myPolygonData.compare_pts_yx( { x:20, y:20 }, { x:20 + PNLTRI.Math.EPSILON_P * 0.8, y:20 } );
		equal( result,  0, "A==B, trotz X" );
	}

	function test_polygon_area() {
		var result;
		var myPolygonData = new PNLTRI.PolygonData();
		//	CCW: area > 0
		result = myPolygonData.polygon_area( [ { x:1, y:3 }, { x:4, y:1 }, { x:6, y:4 }, { x:3, y:6 } ] );
		equal( result,  13, "poly_area = 13" );
		//	CW: area < 0
		result = myPolygonData.polygon_area( [ { x:1, y:3 }, { x:4, y:1 }, { x:6, y:4 }, { x:3, y:6 } ].reverse() );
		equal( result, -13, "poly_area = -13" );
	}

	function test_addPolygonChain_errors() {
		var myPolygonData = new PNLTRI.PolygonData();
		//
		equal( myPolygonData.addPolygonChain( [] ), 0, "addPolygonChain_errors: empty polygon chain");
		equal( myPolygonData.addPolygonChain( [ { x:0.0, y:0.0 } ] ), 0, "addPolygonChain_errors: 1 vertex polygon chain");
		equal( myPolygonData.addPolygonChain( [ { x:0.0, y:0.0 }, { x:6.0, y:0.0 } ] ), 0, "addPolygonChain_errors: 2 vertex polygon chain");
		//
		equal( myPolygonData.addPolygonChain( [ { x:0.0, y:0.0 }, { x:6.0, y:0.0 }, { x:6.0, y:6.0 } ] ), 3, "addPolygonChain_errors: 3 vertex polygon chain");
		equal( myPolygonData.nbSegments(), 3, "addPolygonChain_errors: Number of generated Segments" );
	}

	function test_addPolygonChain_ok() {
		var myPolygonData = new PNLTRI.PolygonData();
		var	polyChains = testData.get_polygon_with_holes( "square_3triangholes" );
		//
		equal( myPolygonData.addPolygonChain( polyChains[0] ), 4, "addPolygonChain_ok: 4 vertex polygon contour");
		equal( myPolygonData.nbSegments(), 4, "addPolygonChain_ok: Number of Segments #1" );
		equal( myPolygonData.addPolygonChain( polyChains[1] ), 3, "addPolygonChain_ok: 3 vertex polygon hole#1");
		equal( myPolygonData.nbSegments(), 7, "addPolygonChain_ok: Number of Segments #2" );
		equal( myPolygonData.addPolygonChain( polyChains[2] ), 3, "addPolygonChain_ok: 3 vertex polygon hole#2");
		equal( myPolygonData.nbSegments(), 10, "addPolygonChain_ok: Number of Segments #3" );
		equal( myPolygonData.addPolygonChain( polyChains[3] ), 3, "addPolygonChain_ok: 3 vertex polygon hole#3");
		equal( myPolygonData.nbSegments(), 13, "addPolygonChain_ok: Number of Segments #3" );
		//
//		showDataStructure( myPolygonData.getSegments(), [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
		//
		var myVertices = myPolygonData.getVertices();
		var mySegArray = myPolygonData.getSegments();
		for (var i=0; i<mySegArray.length; i++) {
			strictEqual( mySegArray[i].vFrom, myVertices[i], "addPolygonChain_ok: segList["+i+"].vFrom == vertices["+i+"]" );
			strictEqual( mySegArray[i].vTo, mySegArray[i].snext.vFrom, "addPolygonChain_ok: segList["+i+"].vTo == segList["+i+"].snext.vFrom" );
		}
		
		// TODO: Test "upward"
	}

	function test_allSegsInQueryStructure() {
		var myPolygonData = new PNLTRI.PolygonData( testData.get_polygon_with_holes( "trap_2up_2down" ) );
		var mySegArray = myPolygonData.getSegments();
		//
		ok( !myPolygonData.allSegsInQueryStructure(), "allSegsInQueryStructure: not inserted" );
		for (var i=0; i<mySegArray.length-1; i++) { mySegArray[i].is_inserted = true }
		ok( !myPolygonData.allSegsInQueryStructure(), "allSegsInQueryStructure: incomplete inserted" );
		mySegArray[mySegArray.length-1].is_inserted = true;
		ok( myPolygonData.allSegsInQueryStructure(), "allSegsInQueryStructure: all inserted" );
		//
//		showDataStructure( myPolygonData.getSegments(), [ 'sprev', 'snext', 'mprev', 'mnext' ] );
	}


	function check_vertexChain_monoChainDoubleLinks( inTestName, inVertexStart, inMonoStart, inLength ) {
		var vertex, monoPrev, monoNext;
		var i;
		if ( vertex = inVertexStart ) {
			for (i=1; i<=inLength; i++) { vertex = vertex.outSegs[0].vertTo };
			ok( (inVertexStart == vertex), inTestName + ": vertices["+inVertexStart.id+"]: Vertex chain of length "+inLength );
		}
		//
		if ( monoPrev = inMonoStart ) {
			for (i=1; i<=inLength; i++) { monoPrev = monoPrev.mprev };
			ok( ( inMonoStart == monoPrev ), inTestName + ": monoChain["+inMonoStart.vFrom.id+"]: Prev chain of length "+inLength );
			monoNext = inMonoStart;
			for (i=1; i<=inLength; i++) { monoNext = monoNext.mnext };
			ok( ( inMonoStart == monoNext ), inTestName + ": monoChain["+inMonoStart.vFrom.id+"]: Next chain of length "+inLength );
		}
	}

	function test_vertices_monoChain() {
		var myPolygonData = new PNLTRI.PolygonData( testData.get_polygon_with_holes( "square_3triangholes" ) );
		myPolygonData.initMonoChains();
		equal( myPolygonData.nbSegments(), 13, "vertices_monoChain: Number of Segments #1" );
		//
		var myVertices = myPolygonData.getVertices();
		var myMonoChain = myPolygonData.getSegments();
		//
		equal( myVertices.length, 13, "vertices_monoChain: vertices.length == 13" );
		equal( myMonoChain.length, 13, "vertices_monoChain: monoChain.length == 13" );
		//
		check_vertexChain_monoChainDoubleLinks( "square_3triangholes", myVertices[ 0], myMonoChain[ 0], 4 );
		check_vertexChain_monoChainDoubleLinks( "square_3triangholes", myVertices[ 4], myMonoChain[ 4], 3 );
		check_vertexChain_monoChainDoubleLinks( "square_3triangholes", myVertices[ 7], myMonoChain[ 7], 3 );
		check_vertexChain_monoChainDoubleLinks( "square_3triangholes", myVertices[10], myMonoChain[10], 3 );
//		showDataStructure( myVertices, [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
//		showDataStructure( myMonoChain, [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
		//
		//
		var myPolygonData = new PNLTRI.PolygonData( testData.get_polygon_with_holes( "pt_3_diag_max" ) );
		myPolygonData.initMonoChains();
		equal( myPolygonData.nbSegments(), 7, "pt_3_diag_max: vertices_monoChain: Number of Segments #2" );
		//
		var myVertices = myPolygonData.getVertices();
		var myMonoChain = myPolygonData.getSegments();
		//
		equal( myVertices.length, 7, "pt_3_diag_max: vertices_monoChain: vertices.length == 7" );
		equal( myMonoChain.length, 7, "pt_3_diag_max: vertices_monoChain: monoChain.length == 7" );
		//
		check_vertexChain_monoChainDoubleLinks( "pt_3_diag_max", myVertices[0], myMonoChain[0], 7 );
//		showDataStructure( myVertices, [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
//		showDataStructure( myMonoChain, [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
		//
		//
		var myPolygonData = new PNLTRI.PolygonData( testData.get_polygon_with_holes( "trap_2up_2down" ) );
		myPolygonData.initMonoChains();
		equal( myPolygonData.nbSegments(), 6, "vertices_monoChain: Number of Segments #3" );
		equal( myPolygonData.getVertices().length, 6, "vertices_monoChain: vertices.length == 6" );
		equal( myPolygonData.getSegments().length, 6, "vertices_monoChain: monoChain.length == 6" );
		check_vertexChain_monoChainDoubleLinks( "trap_2up_2down", myPolygonData.getVertices()[0], myPolygonData.getSegments()[0], 6 );
//		showDataStructure( myPolygonData.getVertices(), [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
//		showDataStructure( myPolygonData.getSegments(), [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
	}

	
/*	function test_mapAngle() {
		var myPolygonData = new PNLTRI.PolygonData( testData.get_polygon_with_holes( "pt_3_diag_max" ) );
//		equal( vectorLength( { x:3, y:4 } ), 5, "vectorLength: 3,4" );
		//
//		equal( vectorLength( { x:0, y:6 } ), 6, "vectorLength: 0,6" );
//		equal( dotProd( { x:0, y:6 }, { x:-5.5, y:1 } ), 6, "dotProd: 0,6 -5.5,1" );
//		equal( crossProd( { x:0, y:6 }, { x:-5.5, y:1 } ), 33, "crossProd: 0,6 -5.5,1" );
		equal( myPolygonData.mapAngle( { x:6, y:0 }, { x:6, y:6 }, { x:0.5, y:1 } ), 0.8211145618000169, "mapAngle: 6,0 6,6 0.5,1" );
		//
//		equal( dotProd( { x:0.5, y:1 }, { x:5.5, y:-1 } ), 1.75, "dotProd: 0.5,1 5.5,-1" );
//		equal( crossProd( { x:0.5, y:1 }, { x:5.5, y:-1 } ), -6, "crossProd: 0.5,1 5.5,-1" );
		equal( myPolygonData.mapAngle( { x:0.5, y:1 }, { x:1, y:2 }, { x:6, y:0 } ), 3.28, "mapAngle: 0.5,1 1,2 6,0" );

		//
//		equal( crossProd( { x:1, y:-0.5 }, { x:4, y:0.5 } ), 2.5, "crossProd: 1,-0.5 4,0.5" );
		equal( myPolygonData.mapAngle( { x:1, y:2 }, { x:2, y:1.5 }, { x:5, y:2.5 } ), 0.16794970566215628, "mapAngle: 1,2 2,1.5 5,2.5" );
		//
//		equal( crossProd( { x:-2, y:0.5 }, { x:-4, y:-0.5 } ), 3, "crossProd: -2,0.5 -4,-0.5" );
		equal( myPolygonData.mapAngle( { x:5, y:2.5 }, { x:3, y:3 }, { x:1, y:2 } ), 0.0674319017259104, "mapAngle: 5,2.5 3,3 1,2" );

		//
//		equal( crossProd( { x:0, y:-1 }, { x:-4.5, y:0.5 } ), -4.5, "crossProd: 0,-1 -4.5,0.5" );
		equal( myPolygonData.mapAngle( { x:5, y:3.5 }, { x:5, y:2.5 }, { x:0.5, y:4 } ), 2.8895684739251535, "mapAngle: 5,3.5 5,2.5 0.5,4" );
		//
//		equal( crossProd( { x:0.5, y:1 }, { x:4.5, y:-0.5 } ), -4.75, "crossProd: 0.5,1 4.5,-0.5" );
		equal( myPolygonData.mapAngle( { x:0.5, y:4 }, { x:1, y:5 }, { x:5, y:3.5 } ), 3.3457053588273564, "mapAngle: 0.5,4 1,5 5,3.5" );

		//
//		equal( crossProd( { x:1, y:-0.5 }, { x:-1, y:1 } ), 0.5, "crossProd: 1,-0.5 -1,1" );
		equal( myPolygonData.mapAngle( { x:1, y:5 }, { x:2, y:4.5 }, { x:0, y:6 } ), 1.9486832980505138, "mapAngle: 1,5 2,4.5 0,6" );
		//
//		equal( crossProd( { x:0, y:-6 }, { x:1, y:-1 } ), 6, "crossProd: 0,-6 1,-1" );
		equal( myPolygonData.mapAngle( { x:0, y:6 }, { x:0, y:0 }, { x:1, y:5 } ), 0.29289321881345254, "mapAngle: 0,6 0,0 1,5" );
	}		*/

	
	function test_splitPolygonChain1() {			// from article, with holes
		var myPolygonData = new PNLTRI.PolygonData( testData.get_polygon_with_holes( "square_3triangholes" ) );
		myPolygonData.initMonoChains();
		//
		var myVertices = myPolygonData.getVertices();
		var myMonoChain = myPolygonData.getSegments();
		equal( myVertices.length, 13, "splitPolygonChain1: vertices.length start polygon == 13" );
		equal( myMonoChain.length, 13, "splitPolygonChain1: monoChain.length start polygon == 13" );
		var monoSubPolys = myPolygonData.getMonoSubPolys();
		//
		// Main Test
		//
		var mcur = 0, mnew;
		//
		mnew = myPolygonData.splitPolygonChain( mcur, myVertices[1], myVertices[4] );
		ok( ( monoSubPolys[mcur] == myMonoChain[4] ), "splitPolygonChain1 #1a segOutFromVert1" );
		ok( ( monoSubPolys[mnew] == myMonoChain[1] ), "splitPolygonChain1 #1b segOutFromVert0" );
//		showDataStructure( myMonoChain, [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
		//
		mnew = myPolygonData.splitPolygonChain( mcur, myVertices[5], myVertices[12] );
		ok( ( monoSubPolys[mcur] == myMonoChain[12] ), "splitPolygonChain1 #2a segOutFromVert1" );
		ok( ( monoSubPolys[mnew] == myMonoChain[5] ), "splitPolygonChain1 #2b segOutFromVert0" );
//		showDataStructure( myMonoChain, [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
		//
		mnew = myPolygonData.splitPolygonChain( mcur, myVertices[11], myVertices[7] );
		ok( ( monoSubPolys[mcur] == myMonoChain[7] ), "splitPolygonChain1 #3a segOutFromVert1" );
		ok( ( monoSubPolys[mnew] == myMonoChain[11] ), "splitPolygonChain1 #3b segOutFromVert0" );
//		showDataStructure( myMonoChain, [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
		//
		mnew = myPolygonData.splitPolygonChain( mcur, myVertices[8], myVertices[3] );
		ok( ( monoSubPolys[mcur] == myMonoChain[3] ), "splitPolygonChain1 #4a segOutFromVert1" );
		ok( ( monoSubPolys[mnew] == myMonoChain[8] ), "splitPolygonChain1 #4b segOutFromVert0" );
//		showDataStructure( myMonoChain, [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
//		showDataStructure( monoSubPolys[4], [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
		//
		equal( myMonoChain.length, 21, "splitPolygonChain1: monoChain.length incl. new Segs == 21" );
		equal( myVertices.length, 13, "splitPolygonChain1: vertices.length incl. new Segs unchanged" );
//		showDataStructure( myVertices, [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
		//
		var checkResult;
		if ( checkResult = myPolygonData.checkMonoChainVertexIDs( 0, [ 3, 0, 1, 4, 5, 12, 10, 11, 7, 8 ] ) )
			ok( false, "splitPolygonChain1: "+checkResult );
		if ( checkResult = myPolygonData.checkMonoChainVertexIDs( 1, [ 1, 2, 3, 8, 9, 7, 11, 12, 5, 6, 4 ] ) )
			ok( false, "splitPolygonChain1: "+checkResult );
		// all == chain#1
		if ( checkResult = myPolygonData.checkMonoChainVertexIDs( 2, [ 5, 6, 4, 1, 2, 3, 8, 9, 7, 11, 12 ] ) )
			ok( false, "splitPolygonChain1: "+checkResult );
		if ( checkResult = myPolygonData.checkMonoChainVertexIDs( 3, [ 11, 12, 5, 6, 4, 1, 2, 3, 8, 9, 7 ] ) )
			ok( false, "splitPolygonChain1: "+checkResult );
		if ( checkResult = myPolygonData.checkMonoChainVertexIDs( 4, [ 8, 9, 7, 11, 12, 5, 6, 4, 1, 2, 3 ] ) )
			ok( false, "splitPolygonChain1: "+checkResult );
//		drawPolygonLayers( { "mono": myPolygonData.monotone_chains_2_polygons() }, 6 );
	}

	function test_splitPolygonChain3() {
		var myPolygonData = new PNLTRI.PolygonData( testData.get_polygon_with_holes( "trap_2up_2down" ) );
		myPolygonData.initMonoChains();
		equal( myPolygonData.nbSegments(), 6, "splitPolygonChain3: Number of Segments #1" );
		//
		var myVertices = myPolygonData.getVertices();
		var myMonoChain = myPolygonData.getSegments();
		var monoSubPolys = myPolygonData.getMonoSubPolys();
		//
		equal( myVertices.length, 6, "splitPolygonChain3: vertices.length == 6" );
		equal( myMonoChain.length, 6, "splitPolygonChain3: monoChain.length == 6" );
		check_vertexChain_monoChainDoubleLinks( "trap_2up_2down#1", myVertices[0], myMonoChain[0], 6 );
//		showDataStructure( myVertices, [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
//		showDataStructure( myMonoChain, [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
		//
		//	Main Test
		//
														
		var mcur = 0;
		var mnew = myPolygonData.splitPolygonChain( mcur, myVertices[4], myVertices[1] );		// (4,6) -> (3,3)
		equal( mnew, 1, "splitPolygonChain3: new monoChain#1" );
		var segPolyOrg = monoSubPolys[0];
		var segPolyNew = monoSubPolys[1];
		//
		equal( myVertices.length, 6, "splitPolygonChain3: vertices.length == 6" );
		equal( myMonoChain.length, 8, "splitPolygonChain3: monoChain 2 segments added" );
		check_vertexChain_monoChainDoubleLinks( "trap_2up_2down#2", myVertices[0], null, 6 );
		//
		var monoPrev, monoNext;
		monoPrev = segPolyOrg;
		monoNext = segPolyOrg;
		var i;
		for (i=0; i<4; i++) {
			ok( (monoPrev != segPolyNew), "splitPolygonChain3: Mono Prev-Chains#1 disjunct" );
			ok( (monoNext != segPolyNew), "splitPolygonChain3: Mono Next-Chains#1 disjunct" );
			if ( monoNext.vFrom == myVertices[4] ) {
				ok( (monoNext.mnext.vFrom == myVertices[1]), "splitPolygonChain3: MonoChainOrg v[4]->v[1] #1" );
				ok( (monoNext.mnext.mprev.vFrom == myVertices[4]), "splitPolygonChain3: MonoChainOrg v[4]->v[1] #2" );
			}
			monoPrev = monoPrev.mprev;
			monoNext = monoNext.mnext;
		}
		ok( (monoPrev = segPolyOrg), "splitPolygonChain3: Mono Prev-Chains#1 length 4" );
		ok( (monoNext = segPolyOrg), "splitPolygonChain3: Mono Next-Chains#1 length 4" );
		//
		monoPrev = segPolyNew;
		monoNext = segPolyNew;
		for (i=0; i<4; i++) {
			ok( (monoPrev != segPolyOrg), "splitPolygonChain3: Mono Prev-Chains#2 disjunct" );
			ok( (monoNext != segPolyOrg), "splitPolygonChain3: Mono Next-Chains#2 disjunct" );
			if ( monoNext.vFrom == myVertices[1] ) {
				ok( (monoNext.mnext.vFrom == myVertices[4]), "splitPolygonChain3: MonoChainNew v[1]->v[4] #1" );
				ok( (monoNext.mnext.mprev.vFrom == myVertices[1]), "splitPolygonChain3: MonoChainNew v[1]->v[4] #2" );
			}
			monoPrev = monoPrev.mprev;
			monoNext = monoNext.mnext;
		}
		ok( (monoPrev = segPolyNew), "splitPolygonChain3: Mono Prev-Chains#2 length 4" );
		ok( (monoNext = segPolyNew), "splitPolygonChain3: Mono Next-Chains#2 length 4" );
//		showDataStructure( myVertices, [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
//		showDataStructure( myMonoChain, [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
	}

	function test_splitPolygonChain4() {			// simple, max-diag-point
		var myPolygonData = new PNLTRI.PolygonData( testData.get_polygon_with_holes( "pt_3_diag_max" ) );
		myPolygonData.initMonoChains();
		//
		var myVertices = myPolygonData.getVertices();
		var myMonoChain = myPolygonData.getSegments();
		equal( myVertices.length, 7, "splitPolygonChain4: vertices.length start polygon == 7" );
		equal( myMonoChain.length, 7, "splitPolygonChain4: monoChain.length start polygon == 7" );
		var monoSubPolys = myPolygonData.getMonoSubPolys();
		//
		// Main Test
		//
		var mcur = 0, mnew;
		//
		mnew = myPolygonData.splitPolygonChain( mcur, myVertices[6], myVertices[2] );
		ok( ( monoSubPolys[mcur] == myMonoChain[2] ), "splitPolygonChain4 #1a segOutFromVert1" );
		ok( ( monoSubPolys[mnew] == myMonoChain[6] ), "splitPolygonChain4 #1b segOutFromVert0" );
//		showDataStructure( myMonoChain, [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
		//
		mnew = myPolygonData.splitPolygonChain( mcur, myVertices[2], myVertices[4] );
		ok( ( monoSubPolys[mcur] == myMonoChain[4] ), "splitPolygonChain4 #2a segOutFromVert1" );
		ok( ( monoSubPolys[mnew] == myMonoChain[2] ), "splitPolygonChain4 #2b segOutFromVert0" );
//		showDataStructure( myMonoChain, [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
		//
		mcur = 1;
		mnew = myPolygonData.splitPolygonChain( mcur, myVertices[0], myVertices[2] );
		ok( ( monoSubPolys[mcur] == myMonoChain[8] ), "splitPolygonChain4 #3a segOutFromVert1" );
		ok( ( monoSubPolys[mnew] == myMonoChain[0] ), "splitPolygonChain4 #3b segOutFromVert0" );
//		showDataStructure( myMonoChain, [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
//		showDataStructure( monoSubPolys[2], [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
		//
		equal( myMonoChain.length, 13, "splitPolygonChain4: monoChain.length incl. neuw Segs == 13" );
		equal( myVertices.length, 7, "splitPolygonChain4: vertices.length incl. new Segs unchanged" );
//		showDataStructure( myVertices, [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
		//
		var checkResult;
		if ( checkResult = myPolygonData.checkMonoChainVertexIDs( 0, [ 4, 5, 6, 2 ] ) )
			ok( false, "splitPolygonChain4: "+checkResult );
		if ( checkResult = myPolygonData.checkMonoChainVertexIDs( 1, [ 2, 6, 0 ] ) )
			ok( false, "splitPolygonChain4: "+checkResult );
		if ( checkResult = myPolygonData.checkMonoChainVertexIDs( 2, [ 2, 3, 4 ] ) )
			ok( false, "splitPolygonChain4: "+checkResult );
		if ( checkResult = myPolygonData.checkMonoChainVertexIDs( 3, [ 0, 1, 2 ] ) )
			ok( false, "splitPolygonChain4: "+checkResult );
//		drawPolygonLayers( { "mono": myPolygonData.monotone_chains_2_polygons() }, 4 );
	}
	
	function test_unique_monotone_chains_max() {
		var myPolygonData, polyChains, myMonoChain;
		var sollMonoStartIdxs, uniqueMonoChainsMax;
		var i;
		//
		//		1st Test
		//
		myPolygonData = new PNLTRI.PolygonData( testData.get_polygon_with_holes( "pt_3_diag_max" ) );
		myPolygonData.replaceMonoChains( [	[ 0, 1, 2 ], [ 0, 2, 6 ], [ 2, 4, 5, 6 ], [ 2, 3, 4 ] ],
									 [ 0, 5, 7, 10 ] );
		//
		// Main Test
		//
		myMonoChain = myPolygonData.getSegments();
		sollMonoStartIdxs = [ 2, 5, 8, 10 ].map( function (val) { return myMonoChain[val] } );
		//
		uniqueMonoChainsMax = myPolygonData.unique_monotone_chains_max();
		deepEqual( uniqueMonoChainsMax, sollMonoStartIdxs, "test_unique_monotone_chains: pt_3_diag_max" );
		//
		//		2nd Test
		//
		myPolygonData = new PNLTRI.PolygonData( testData.get_polygon_with_holes( "square_3triangholes" ) );
		myPolygonData.replaceMonoChains( [
					[ 8, 3, 0, 1, 4, 5, 12, 10, 11, 7 ],	// -> vertices
					[ 1, 2, 3, 8, 9, 7, 11, 12, 5, 6, 4 ],
					// [ 5, 6, 4, 1, 2, 3, 8, 9, 7, 11, 12 ],		// == poly1
					// [ 11, 12, 5, 6, 4, 1, 2, 3, 8, 9, 7 ],		// == poly1
					// [ 8, 9, 7, 11, 12, 5, 6, 4, 1, 2, 3 ],		// == poly1
					], [ 0, 10, 18, 16, 13 ] );
		//
		// Main Test
		//
		myMonoChain = myPolygonData.getSegments();
		sollMonoStartIdxs = [ 1, 11 ].map( function (val) { return myMonoChain[val] } );
		//
		uniqueMonoChainsMax = myPolygonData.unique_monotone_chains_max();
		deepEqual( uniqueMonoChainsMax, sollMonoStartIdxs, "test_unique_monotone_chains: square_3triangholes" );
	}
	
	
	test( "Polygon Data", function() {
		test_compare_pts_yx();
		test_polygon_area();
			
		test_addPolygonChain_errors();
		test_addPolygonChain_ok();

		test_allSegsInQueryStructure();
		
		test_vertices_monoChain();
//		test_appendVertexOutsegEntry();
		// test_mapAngle();
		test_splitPolygonChain1();
		test_splitPolygonChain3();
		test_splitPolygonChain4();
		test_unique_monotone_chains_max();

//		test_triangList();

//		test_replaceMonoChains();
	});
}


function compute_PolygonData( inResultTarget ) {
	var	testData = new PolygonTestdata();

	var expectedStr = 'Polygon (contour + 1 hole) & Area: 13';
	var polygons = testData.get_polygon_with_holes("hole_short_path");
	var resultStr = testData.polygons_to_str( polygons, true );

	var myPolygonData = new PNLTRI.PolygonData();
	var area = myPolygonData.polygon_area( [ { x:1, y:3 }, { x:4, y:1 }, { x:6, y:4 }, { x:3, y:6 } ] );
	resultStr += '<p/>Area [&gt;0: CCW]: ' + area;

	if ( inResultTarget ) {
		inResultTarget.innerHTML = "expected: " + expectedStr + "<br/>result: " + resultStr;
	} else {
		alert( "Segment-Liste:\n" + "expected: " + expectedStr + "\nresult: " + resultStr );
	}
}

