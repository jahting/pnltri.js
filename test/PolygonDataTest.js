/**
 * @author jahting / http://www.ameco.tv/
 */

/*	TODO: Tests for appendVertexEntry, get_out_segment_next_right_of,
	createSegmentEntry, appendSegmentEntry,
	addVertexChain, addPolygonChain: suppression of zero-length segments	*/


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
	for ( var i=0, j=this.segments.length; i < j; i++ ) {
		if ( this.segments[i].chainId == null )		bugList.push( "SegNo#"+i+".chainId: missing" );
		if ( this.segments[i].vFrom == null )		bugList.push( "SegNo#"+i+".vFrom: missing" );
		if ( this.segments[i].vTo == null )			bugList.push( "SegNo#"+i+".vTo: missing" );
		if ( this.segments[i].vFrom == this.segments[i].vTo )		bugList.push( "SegNo#"+i+": equal endpoints" );
		if ( this.segments[i].upward == null )		bugList.push( "SegNo#"+i+".upward: missing" );
/*		if ( PNLTRI.Math.compare_pts_yx( this.segments[i].vTo, this.segments[i].vFrom ) == 1 ) {		// upward
			if ( !this.segments[i].upward )			bugList.push( "SegNo#"+i+".upward: should be TRUE, from ("+this.segments[i].vFrom.x+"/"+this.segments[i].vFrom.y+"), to ("+this.segments[i].vTo.x+"/"+this.segments[i].vTo.y+")" );
		} else {
			if ( this.segments[i].upward )			bugList.push( "SegNo#"+i+".upward: should be FALSE, from ("+this.segments[i].vFrom.x+"/"+this.segments[i].vFrom.y+"), to ("+this.segments[i].vTo.x+"/"+this.segments[i].vTo.y+")" );
		}	*/
		if ( this.segments[i].sprev == null )		bugList.push( "SegNo#"+i+".sprev: missing" );
		if ( this.segments[i].snext == null )		bugList.push( "SegNo#"+i+".snext: missing" );
	}
	return	( bugList.length == 0 ) ? null : bugList;
};
PNLTRI.PolygonData.prototype.addPolygonChain_consistently = function ( inRawPointList, inTestID ) {
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
			this.createMonoSegment( {	vFrom: this.vertices[ inListIdxList[i][j] ],
										vTo: this.vertices[ inListIdxList[i][jNext] ],
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
PNLTRI.PolygonData.prototype.monotone_chain_2_polygon = function ( inMonoChain ) {
	var monoChain, firstEntry;
	var polygon = [];
	monoChain = firstEntry = inMonoChain;
	do {
		polygon.push( monoChain.vFrom );
		monoChain = monoChain.mnext;
	} while ( monoChain != firstEntry );	// monoChain not yet closed
	return	polygon;
};
PNLTRI.PolygonData.prototype.monotone_chains_2_polygons = function () {
	var monoChain, firstEntry;
	var polygon, polygons = [];
	for (var i=0; i<this.monoSubPolyChains.length; i++) {
		polygons.push( this.monotone_chain_2_polygon( this.monoSubPolyChains[i] ) );
	}
	return	polygons;
};
//	for display of the triangles
PNLTRI.PolygonData.prototype.triangles_2_polygons = function ( inTriangles ) {
	var	triangles = inTriangles ?  inTriangles : this.triangles;
	var polygons = [];
	for (var i=0; i<triangles.length; i++) {
		polygons.push( [ this.vertices[ triangles[i][0] ],
						 this.vertices[ triangles[i][1] ],
						 this.vertices[ triangles[i][2] ] ] );
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
		resStr += 'From: ID='+from.id+',{x:'+from.x+',y:'+from.y+'}, ';
		vertMap[from.id] = from;
		if ( from.id > vertIdMax )		vertIdMax = from.id;
		to = segment.vTo;
		resStr += 'To: ID='+to.id+',{x:'+to.x+',y:'+to.y+"},<br/>";
		vertMap[to.id] = to;
		if ( to.id > vertIdMax )		vertIdMax = to.id;
	}
	var j=0;
	var newVertStr = '<p/>Vertices:<br/>';
	resStr += '<p/>Vertex-Map: ';
	for (i=0; i<=vertIdMax; i++) {
		if ( vertMap[i] ) {
			vertMap[i].id=j;
			resStr += i+' -> '+j+', ';
			newVertStr += '{ x: '+vertMap[i].x+', y: '+vertMap[i].y+' },<br/>';
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
// calculates the area of a polygon: remainder from checking for winding order of polygon chains
PNLTRI.PolygonData.prototype.polygon_area = function ( inContour ) {
	var cLen = inContour.length;
	var dblArea = 0.0;
	for( var p = cLen - 1, q = 0; q < cLen; p = q++ ) {
		dblArea += inContour[ p ].x * inContour[ q ].y - inContour[ q ].x * inContour[ p ].y;
	}
	return dblArea * 0.5;
};


function test_PolygonData() {
	
	var	testData = new PolygonTestdata();

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

	function test_isClockWise() {
		var myPolygonData = new PNLTRI.PolygonData( [ { x:1, y:3 }, { x:3, y:6 }, { x:6, y:4 }, { x:4, y:1 } ] );
		ok( myPolygonData.isClockWise( myPolygonData.getFirstSegment() ), "poly_area: CW" );
		//
		var myPolygonData = new PNLTRI.PolygonData( [ { x:1, y:3 }, { x:4, y:1 }, { x:6, y:4 }, { x:3, y:6 } ] );
		ok( !myPolygonData.isClockWise( myPolygonData.getFirstSegment() ), "poly_area: CCW" );
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
		equal( myPolygonData.nbPolyChains(), 1, "addPolygonChain_errors: Number of Polygon Chains" );
	}

	function test_addPolygonChain_ok() {
		var myPolygonData = new PNLTRI.PolygonData();
		var	polyChains = testData.get_polygon_with_holes( "square_3triangholes" );
		//
		equal( myPolygonData.addPolygonChain( polyChains[0] ), 4, "addPolygonChain_ok: 4 vertex polygon contour");
		equal( myPolygonData.nbSegments(), 4, "addPolygonChain_ok: Number of Segments #1" );
		equal( myPolygonData.nbPolyChains(), 1, "addPolygonChain_ok: Number of Polygon Chains #1" );
		equal( myPolygonData.addPolygonChain( polyChains[1] ), 3, "addPolygonChain_ok: 3 vertex polygon hole#1");
		equal( myPolygonData.nbSegments(), 7, "addPolygonChain_ok: Number of Segments #2" );
		equal( myPolygonData.nbPolyChains(), 2, "addPolygonChain_ok: Number of Polygon Chains #2" );
		equal( myPolygonData.addPolygonChain( polyChains[2] ), 3, "addPolygonChain_ok: 3 vertex polygon hole#2");
		equal( myPolygonData.nbSegments(), 10, "addPolygonChain_ok: Number of Segments #3" );
		equal( myPolygonData.nbPolyChains(), 3, "addPolygonChain_ok: Number of Polygon Chains #3" );
		equal( myPolygonData.addPolygonChain( polyChains[3] ), 3, "addPolygonChain_ok: 3 vertex polygon hole#3");
		equal( myPolygonData.nbSegments(), 13, "addPolygonChain_ok: Number of Segments #3" );
		equal( myPolygonData.nbPolyChains(), 4, "addPolygonChain_ok: Number of Polygon Chains #4" );
		//
//		showDataStructure( myPolygonData.getSegments(), [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
		//
		var myVertices = myPolygonData.getVertices();
		var mySegArray = myPolygonData.getSegments();
		for (var i=0; i<mySegArray.length; i++) {
			if ( i < 4 ) {
				equal( mySegArray[i].chainId, 0, "addPolygonChain_ok: ChainID Seg#"+i );
			} else if ( i < 7 ) {
				equal( mySegArray[i].chainId, 1, "addPolygonChain_ok: ChainID Seg#"+i );
			} else if ( i < 10 ) {
				equal( mySegArray[i].chainId, 2, "addPolygonChain_ok: ChainID Seg#"+i );
			} else {
				equal( mySegArray[i].chainId, 3, "addPolygonChain_ok: ChainID Seg#"+i );
			}
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
		equal( myPolygonData.nbSegments(), 13, "vertices_monoChain (square_3triangholes): Number of Segments #1" );
		var myVertices = myPolygonData.getVertices();
		equal( myVertices.length, 13, "vertices_monoChain (square_3triangholes): vertices.length == 13" );
		//
		myPolygonData.initMonoChains();
		var myMonoChain = myPolygonData.getSegments();
		equal( myMonoChain.length, 13, "vertices_monoChain (square_3triangholes): monoChain.length == 13" );
		//
		check_vertexChain_monoChainDoubleLinks( "vertices_monoChain (square_3triangholes)", myVertices[ 0], myMonoChain[ 0], 4 );
		check_vertexChain_monoChainDoubleLinks( "vertices_monoChain (square_3triangholes)", myVertices[ 4], myMonoChain[ 4], 3 );
		check_vertexChain_monoChainDoubleLinks( "vertices_monoChain (square_3triangholes)", myVertices[ 7], myMonoChain[ 7], 3 );
		check_vertexChain_monoChainDoubleLinks( "vertices_monoChain (square_3triangholes)", myVertices[10], myMonoChain[10], 3 );
//		showDataStructure( myVertices, [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
//		showDataStructure( myMonoChain, [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
		//
		//
		var myPolygonData = new PNLTRI.PolygonData( testData.get_polygon_with_holes( "pt_3_diag_max" ) );
		equal( myPolygonData.nbSegments(), 7, "vertices_monoChain (pt_3_diag_max): Number of Segments #2" );
		var myVertices = myPolygonData.getVertices();
		equal( myVertices.length, 7, "vertices_monoChain (pt_3_diag_max): vertices.length == 7" );
		//
		myPolygonData.initMonoChains();
		var myMonoChain = myPolygonData.getSegments();
		equal( myMonoChain.length, 7, "vertices_monoChain (pt_3_diag_max): monoChain.length == 7" );
		//
		check_vertexChain_monoChainDoubleLinks( "vertices_monoChain (pt_3_diag_max)", myVertices[0], myMonoChain[0], 7 );
//		showDataStructure( myVertices, [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
//		showDataStructure( myMonoChain, [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
		//
		//
		var myPolygonData = new PNLTRI.PolygonData( testData.get_polygon_with_holes( "trap_2up_2down" ) );
		equal( myPolygonData.nbSegments(), 6, "vertices_monoChain (trap_2up_2down): Number of Segments #3" );
		var myVertices = myPolygonData.getVertices();
		equal( myVertices.length, 6, "vertices_monoChain (trap_2up_2down): vertices.length == 6" );
		//
		myPolygonData.initMonoChains();
		var myMonoChain = myPolygonData.getSegments();
		equal( myMonoChain.length, 6, "vertices_monoChain (trap_2up_2down): monoChain.length == 6" );
		//
		check_vertexChain_monoChainDoubleLinks( "vertices_monoChain (trap_2up_2down)", myVertices[0], myMonoChain[0], 6 );
//		showDataStructure( myPolygonData.getVertices(), [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
//		showDataStructure( myPolygonData.getSegments(), [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
	}

	
	function test_splitPolygonChain1() {			// from article, with holes
		var myPolygonData = new PNLTRI.PolygonData( testData.get_polygon_with_holes( "square_3triangholes" ) );
		var myVertices = myPolygonData.getVertices();
		equal( myVertices.length, 13, "splitPolygonChain1: vertices.length start polygon == 13" );
		//
		myPolygonData.initMonoChains();
		var myMonoChain = myPolygonData.getSegments();
		equal( myMonoChain.length, 13, "splitPolygonChain1: monoChain.length start polygon == 13" );
		var monoSubPolys = myPolygonData.getMonoSubPolys();
		//
		// Main Test
		//
		var mnew, mcur = myPolygonData.newMonoChain( myMonoChain[0] );
		//
		mnew = myPolygonData.splitPolygonChain( mcur, myVertices[1], myVertices[4], true );
		ok( ( monoSubPolys[mcur].mprev == myMonoChain[0] ), "splitPolygonChain1 #1_mcur newSegLow2High: prev(vertLow)" );
		ok( ( monoSubPolys[mcur].mnext == myMonoChain[4] ), "splitPolygonChain1 #1_mcur newSegLow2High: next(vertHigh)" );
		ok( ( monoSubPolys[mnew].mprev == myMonoChain[6] ), "splitPolygonChain1 #1_mnew newSegHigh2Low: prev(vertHigh)" );
		ok( ( monoSubPolys[mnew].mnext == myMonoChain[1] ), "splitPolygonChain1 #1_mnew newSegHigh2Low: next(vertLow)" );
//		showDataStructure( myMonoChain, [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
		//
		mnew = myPolygonData.splitPolygonChain( mcur, myVertices[5], myVertices[12], true );
		ok( ( monoSubPolys[mcur].mprev == myMonoChain[ 4] ), "splitPolygonChain1 #2_mcur newSegLow2High: prev(vertLow)" );
		ok( ( monoSubPolys[mcur].mnext == myMonoChain[12] ), "splitPolygonChain1 #2_mcur newSegLow2High: next(vertHigh)" );
		ok( ( monoSubPolys[mnew].mprev == myMonoChain[11] ), "splitPolygonChain1 #2_mnew newSegHigh2Low: prev(vertHigh)" );
		ok( ( monoSubPolys[mnew].mnext == myMonoChain[ 5] ), "splitPolygonChain1 #2_mnew newSegHigh2Low: next(vertLow)" );
//		showDataStructure( myMonoChain, [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
		//
		mnew = myPolygonData.splitPolygonChain( mcur, myVertices[11], myVertices[7], true );
		ok( ( monoSubPolys[mcur].mprev == myMonoChain[10] ), "splitPolygonChain1 #3_mcur newSegLow2High: prev(vertLow)" );
		ok( ( monoSubPolys[mcur].mnext == myMonoChain[ 7] ), "splitPolygonChain1 #3_mcur newSegLow2High: next(vertHigh)" );
		ok( ( monoSubPolys[mnew].mprev == myMonoChain[ 9] ), "splitPolygonChain1 #3_mnew newSegHigh2Low: prev(vertHigh)" );
		ok( ( monoSubPolys[mnew].mnext == myMonoChain[11] ), "splitPolygonChain1 #3_mnew newSegHigh2Low: next(vertLow)" );
//		showDataStructure( myMonoChain, [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
		//
		mnew = myPolygonData.splitPolygonChain( mcur, myVertices[8], myVertices[3], true );
		ok( ( monoSubPolys[mcur].mprev == myMonoChain[7] ), "splitPolygonChain1 #4_mcur newSegLow2High: prev(vertLow)" );
		ok( ( monoSubPolys[mcur].mnext == myMonoChain[3] ), "splitPolygonChain1 #4_mcur newSegLow2High: next(vertHigh)" );
		ok( ( monoSubPolys[mnew].mprev == myMonoChain[2] ), "splitPolygonChain1 #4_mnew newSegHigh2Low: prev(vertHigh)" );
		ok( ( monoSubPolys[mnew].mnext == myMonoChain[8] ), "splitPolygonChain1 #4_mnew newSegHigh2Low: next(vertLow)" );
//		showDataStructure( myMonoChain, [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
//		showDataStructure( monoSubPolys[4], [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
		//
		equal( myMonoChain.length, 21, "splitPolygonChain1: monoChain.length incl. new Segs == 21" );
		equal( myVertices.length, 13, "splitPolygonChain1: vertices.length incl. new Segs unchanged" );
//		showDataStructure( myVertices, [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
		//
		var checkResult;
		if ( checkResult = myPolygonData.checkMonoChainVertexIDs( 0, [ 8, 3, 0, 1, 4, 5, 12, 10, 11, 7 ] ) )
			ok( false, "splitPolygonChain1: "+checkResult );
		if ( checkResult = myPolygonData.checkMonoChainVertexIDs( 1, [ 4, 1, 2, 3, 8, 9, 7, 11, 12, 5, 6 ] ) )
			ok( false, "splitPolygonChain1: "+checkResult );
		// all == chain#1
		if ( checkResult = myPolygonData.checkMonoChainVertexIDs( 2, [ 12, 5, 6, 4, 1, 2, 3, 8, 9, 7, 11 ] ) )
			ok( false, "splitPolygonChain1: "+checkResult );
		if ( checkResult = myPolygonData.checkMonoChainVertexIDs( 3, [ 7, 11, 12, 5, 6, 4, 1, 2, 3, 8, 9 ] ) )
			ok( false, "splitPolygonChain1: "+checkResult );
		if ( checkResult = myPolygonData.checkMonoChainVertexIDs( 4, [ 3, 8, 9, 7, 11, 12, 5, 6, 4, 1, 2 ] ) )
			ok( false, "splitPolygonChain1: "+checkResult );
//		drawPolygonLayers( { "mono": myPolygonData.monotone_chains_2_polygons() }, 6 );
	}

	function test_splitPolygonChain2() {
		var myPolygonData = new PNLTRI.PolygonData( testData.get_polygon_with_holes( "trap_2up_2down" ) );
		equal( myPolygonData.nbSegments(), 6, "splitPolygonChain2: Number of Segments #1" );
		var myVertices = myPolygonData.getVertices();
		equal( myVertices.length, 6, "splitPolygonChain2: vertices.length == 6" );
		//
		myPolygonData.initMonoChains();
		var myMonoChain = myPolygonData.getSegments();
		equal( myMonoChain.length, 6, "splitPolygonChain2: monoChain.length == 6" );
		var monoSubPolys = myPolygonData.getMonoSubPolys();
		//
		check_vertexChain_monoChainDoubleLinks( "splitPolygonChain2: Chains#1", myVertices[0], myMonoChain[0], 6 );
//		showDataStructure( myVertices, [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
//		showDataStructure( myMonoChain, [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
		//
		//	Main Test
		//
		var mcur = myPolygonData.newMonoChain( myMonoChain[0] );
		//
		var mnew = myPolygonData.splitPolygonChain( mcur, myVertices[4], myVertices[1], true );		// (4,6) -> (3,3)
		equal( mnew, 1, "splitPolygonChain2: new monoChain#1" );
		var segPolyOrg = monoSubPolys[0];
		var segPolyNew = monoSubPolys[1];
		//
		equal( myVertices.length, 6, "splitPolygonChain2: vertices.length == 6" );
		equal( myMonoChain.length, 8, "splitPolygonChain2: monoChain 2 segments added" );
		check_vertexChain_monoChainDoubleLinks( "splitPolygonChain2: Chains#2", myVertices[0], null, 6 );
		//
		var monoPrev, monoNext;
		monoPrev = segPolyOrg;
		monoNext = segPolyOrg;
		var i;
		for (i=0; i<4; i++) {
			ok( (monoPrev != segPolyNew), "splitPolygonChain2: Mono Prev-Chains#1 disjunct" );
			ok( (monoNext != segPolyNew), "splitPolygonChain2: Mono Next-Chains#1 disjunct" );
			if ( monoNext.vFrom == myVertices[4] ) {
				ok( (monoNext.mnext.vFrom == myVertices[1]), "splitPolygonChain2: MonoChainOrg v[4]->v[1] #1" );
				ok( (monoNext.mnext.mprev.vFrom == myVertices[4]), "splitPolygonChain2: MonoChainOrg v[4]->v[1] #2" );
			}
			monoPrev = monoPrev.mprev;
			monoNext = monoNext.mnext;
		}
		ok( (monoPrev = segPolyOrg), "splitPolygonChain2: Mono Prev-Chains#1 length 4" );
		ok( (monoNext = segPolyOrg), "splitPolygonChain2: Mono Next-Chains#1 length 4" );
		//
		monoPrev = segPolyNew;
		monoNext = segPolyNew;
		for (i=0; i<4; i++) {
			ok( (monoPrev != segPolyOrg), "splitPolygonChain2: Mono Prev-Chains#2 disjunct" );
			ok( (monoNext != segPolyOrg), "splitPolygonChain2: Mono Next-Chains#2 disjunct" );
			if ( monoNext.vFrom == myVertices[1] ) {
				ok( (monoNext.mnext.vFrom == myVertices[4]), "splitPolygonChain2: MonoChainNew v[1]->v[4] #1" );
				ok( (monoNext.mnext.mprev.vFrom == myVertices[1]), "splitPolygonChain2: MonoChainNew v[1]->v[4] #2" );
			}
			monoPrev = monoPrev.mprev;
			monoNext = monoNext.mnext;
		}
		ok( (monoPrev = segPolyNew), "splitPolygonChain2: Mono Prev-Chains#2 length 4" );
		ok( (monoNext = segPolyNew), "splitPolygonChain2: Mono Next-Chains#2 length 4" );
//		showDataStructure( myVertices, [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
//		showDataStructure( myMonoChain, [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
	}

	function test_splitPolygonChain3() {			// simple, max-diag-point
		var myPolygonData = new PNLTRI.PolygonData( testData.get_polygon_with_holes( "pt_3_diag_max" ) );
		var myVertices = myPolygonData.getVertices();
		equal( myVertices.length, 7, "splitPolygonChain3: vertices.length start polygon == 7" );
		//
		myPolygonData.initMonoChains();
		var myMonoChain = myPolygonData.getSegments();
		equal( myMonoChain.length, 7, "splitPolygonChain3: monoChain.length start polygon == 7" );
		var monoSubPolys = myPolygonData.getMonoSubPolys();
		//
		// Main Test
		//
		var mnew, mcur = myPolygonData.newMonoChain( myMonoChain[0] );
		//
		mnew = myPolygonData.splitPolygonChain( mcur, myVertices[6], myVertices[2], true );
		ok( ( monoSubPolys[mcur].mprev == myMonoChain[5] ), "splitPolygonChain3 #1_mcur newSegLow2High: prev(vertLow)" );
		ok( ( monoSubPolys[mcur].mnext == myMonoChain[2] ), "splitPolygonChain3 #1_mcur newSegLow2High: next(vertHigh)" );
		ok( ( monoSubPolys[mnew].mprev == myMonoChain[1] ), "splitPolygonChain3 #1_mnew newSegHigh2Low: prev(vertHigh)" );
		ok( ( monoSubPolys[mnew].mnext == myMonoChain[6] ), "splitPolygonChain3 #1_mnew newSegHigh2Low: next(vertLow)" );
//		showDataStructure( myMonoChain, [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
		//
		mnew = myPolygonData.splitPolygonChain( mcur, myVertices[2], myVertices[4], true );
		ok( ( monoSubPolys[mcur].mprev == myMonoChain[7] ), "splitPolygonChain3 #2_mcur newSegLow2High: prev(vertLow)" );
		ok( ( monoSubPolys[mcur].mnext == myMonoChain[4] ), "splitPolygonChain3 #2_mcur newSegLow2High: next(vertHigh)" );
		ok( ( monoSubPolys[mnew].mprev == myMonoChain[3] ), "splitPolygonChain3 #2_mnew newSegHigh2Low: prev(vertHigh)" );
		ok( ( monoSubPolys[mnew].mnext == myMonoChain[2] ), "splitPolygonChain3 #2_mnew newSegHigh2Low: next(vertLow)" );
//		showDataStructure( myMonoChain, [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
		//
		mcur = 1;
		mnew = myPolygonData.splitPolygonChain( mcur, myVertices[0], myVertices[2], true );
		ok( ( monoSubPolys[mcur].mprev == myMonoChain[6] ), "splitPolygonChain3 #3_mcur newSegLow2High: prev(vertLow)" );
		ok( ( monoSubPolys[mcur].mnext == myMonoChain[8] ), "splitPolygonChain3 #3_mcur newSegLow2High: next(vertHigh)" );
		ok( ( monoSubPolys[mnew].mprev == myMonoChain[1] ), "splitPolygonChain3 #3_mnew newSegHigh2Low: prev(vertHigh)" );
		ok( ( monoSubPolys[mnew].mnext == myMonoChain[0] ), "splitPolygonChain3 #3_mnew newSegHigh2Low: next(vertLow)" );
//		showDataStructure( myMonoChain, [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
//		showDataStructure( monoSubPolys[2], [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
		//
		equal( myMonoChain.length, 13, "splitPolygonChain3: monoChain.length incl. new Segs == 13" );
		equal( myVertices.length, 7, "splitPolygonChain3: vertices.length incl. new Segs unchanged" );
//		showDataStructure( myVertices, [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
		//
		var checkResult;
		if ( checkResult = myPolygonData.checkMonoChainVertexIDs( 0, [ 2, 4, 5, 6 ] ) )
			ok( false, "splitPolygonChain3: "+checkResult );
		if ( checkResult = myPolygonData.checkMonoChainVertexIDs( 1, [ 0, 2, 6 ] ) )
			ok( false, "splitPolygonChain3: "+checkResult );
		if ( checkResult = myPolygonData.checkMonoChainVertexIDs( 2, [ 4, 2, 3 ] ) )
			ok( false, "splitPolygonChain3: "+checkResult );
		if ( checkResult = myPolygonData.checkMonoChainVertexIDs( 3, [ 2, 0, 1 ] ) )
			ok( false, "splitPolygonChain3: "+checkResult );
//		drawPolygonLayers( { "mono": myPolygonData.monotone_chains_2_polygons() }, 4 );
	}
	
	function test_splitPolygonChain4_CCW() {			// correct winding order: contour: CCW, hole: CW
		var myPolygonData = new PNLTRI.PolygonData( testData.get_polygon_with_holes( "hole_short_path" ) );
		var myVertices = myPolygonData.getVertices();
		equal( myVertices.length, 10, "splitPolygonChain4_CCW: vertices.length start polygon" );
		//
		// make sure the monochains get the right winding order
		//	this results in a shift of indices by +1 in each chain:
		//	the segment connecting vertex[2] with vertex[3] is now
		//	segment[3] instead of segment[2] !
		myPolygonData.set_PolyLeft_wrong(0);		// => Contour will get reversed to CCW
		myPolygonData.set_PolyLeft_wrong(1);		// => Hole will get reversed to CW
		//
		myPolygonData.initMonoChains();
		var myMonoChain = myPolygonData.getSegments();
		equal( myMonoChain.length, 10, "splitPolygonChain4_CCW: monoChain.length start polygon" );
		var monoSubPolys = myPolygonData.getMonoSubPolys();
		//
		// Main Test
		//
		var mnew, mcur = myPolygonData.newMonoChain( myMonoChain[0] );
		//
		mnew = myPolygonData.splitPolygonChain( mcur, myVertices[5], myVertices[2], true );
		ok( ( monoSubPolys[mcur].mprev == myMonoChain[0] ), "splitPolygonChain4_CCW #1_mcur newSegLow2High: prev(vertLow)" );
		ok( ( monoSubPolys[mcur].mnext == myMonoChain[2] ), "splitPolygonChain4_CCW #1_mcur newSegLow2High: next(vertHigh)" );
		ok( ( monoSubPolys[mnew].mprev == myMonoChain[3] ), "splitPolygonChain4_CCW #1_mnew newSegHigh2Low: prev(vertHigh)" );
		ok( ( monoSubPolys[mnew].mnext == myMonoChain[5] ), "splitPolygonChain4_CCW #1_mnew newSegHigh2Low: next(vertLow)" );
//		showDataStructure( myMonoChain, [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
		//
		mcur = mnew;
		mnew = myPolygonData.splitPolygonChain( mcur, myVertices[3], myVertices[5], false );
		ok( ( monoSubPolys[mcur].mprev == myMonoChain[11] ), "splitPolygonChain4_CCW #2_mcur newSegHigh2Low: prev(vertHigh)" );
		ok( ( monoSubPolys[mcur].mnext == myMonoChain[ 3] ), "splitPolygonChain4_CCW #2_mcur newSegHigh2Low: next(vertLow)" );
		ok( ( monoSubPolys[mnew].mprev == myMonoChain[ 4] ), "splitPolygonChain4_CCW #2_mnew newSegLow2High: prev(vertLow)" );
		ok( ( monoSubPolys[mnew].mnext == myMonoChain[ 5] ), "splitPolygonChain4_CCW #2_mnew newSegLow2High: next(vertHigh)" );
//		showDataStructure( myMonoChain, [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
		//
		mcur = mnew;
		mnew = myPolygonData.splitPolygonChain( mcur, myVertices[6], myVertices[3], true );
		ok( ( monoSubPolys[mcur].mprev == myMonoChain[ 7] ), "splitPolygonChain4_CCW #3_mcur newSegLow2High: prev(vertLow)" );
		ok( ( monoSubPolys[mcur].mnext == myMonoChain[12] ), "splitPolygonChain4_CCW #3_mcur newSegLow2High: next(vertHigh)" );
		ok( ( monoSubPolys[mnew].mprev == myMonoChain[ 4] ), "splitPolygonChain4_CCW #3_mnew newSegHigh2Low: prev(vertHigh)" );
		ok( ( monoSubPolys[mnew].mnext == myMonoChain[ 6] ), "splitPolygonChain4_CCW #3_mnew newSegHigh2Low: next(vertLow)" );
//		showDataStructure( myMonoChain, [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
		//
		mnew = myPolygonData.splitPolygonChain( mcur, myVertices[4], myVertices[8], true );
		ok( ( monoSubPolys[mcur].mprev == myMonoChain[5] ), "splitPolygonChain4_CCW #4_mcur newSegLow2High: prev(vertLow)" );
		ok( ( monoSubPolys[mcur].mnext == myMonoChain[8] ), "splitPolygonChain4_CCW #4_mcur newSegLow2High: next(vertHigh)" );
		ok( ( monoSubPolys[mnew].mprev == myMonoChain[9] ), "splitPolygonChain4_CCW #4_mnew newSegHigh2Low: prev(vertHigh)" );
		ok( ( monoSubPolys[mnew].mnext == myMonoChain[4] ), "splitPolygonChain4_CCW #4_mnew newSegHigh2Low: next(vertLow)" );
//		showDataStructure( myMonoChain, [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
//		showDataStructure( monoSubPolys[mcur], [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
//		showDataStructure( monoSubPolys[mnew], [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
		//
		equal( myMonoChain.length, 18, "splitPolygonChain4_CCW: monoChain.length incl. new Segs" );
		equal( myVertices.length, 10, "splitPolygonChain4_CCW: vertices.length incl. new Segs unchanged" );
//		showDataStructure( myVertices, [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
		//
		var checkResult;
		if ( checkResult = myPolygonData.checkMonoChainVertexIDs( 0, [ 5, 2, 1, 0 ] ) )
			ok( false, "splitPolygonChain4_CCW: "+checkResult );
		if ( checkResult = myPolygonData.checkMonoChainVertexIDs( 1, [ 5, 3, 2 ] ) )
			ok( false, "splitPolygonChain4_CCW: "+checkResult );
		if ( checkResult = myPolygonData.checkMonoChainVertexIDs( 2, [ 4, 8, 7, 6, 3, 5 ] ) )
			ok( false, "splitPolygonChain4_CCW: "+checkResult );
		if ( checkResult = myPolygonData.checkMonoChainVertexIDs( 3, [ 3, 6, 9, 8, 4 ] ) )
			ok( false, "splitPolygonChain4_CCW: "+checkResult );
		if ( checkResult = myPolygonData.checkMonoChainVertexIDs( 4, [ 8, 4, 3, 6, 9 ] ) )		// redundant to #3
			ok( false, "splitPolygonChain4_CCW: "+checkResult );
//		drawPolygonLayers( { "mono": myPolygonData.monotone_chains_2_polygons() }, 0.8 );
	}
	
	function test_splitPolygonChain4_CW() {			// wrong winding order: contour: CW, hole: CCW
		var myPolygonData = new PNLTRI.PolygonData( testData.get_polygon_with_holes( "hole_short_path" ) );
		var myVertices = myPolygonData.getVertices();
		equal( myVertices.length, 10, "splitPolygonChain4_CW: vertices.length start polygon" );
		//
		myPolygonData.initMonoChains();
		var myMonoChain = myPolygonData.getSegments();
		equal( myMonoChain.length, 10, "splitPolygonChain4_CW: monoChain.length start polygon" );
		var monoSubPolys = myPolygonData.getMonoSubPolys();
		//
		// Main Test
		//
		var mnew, mcur = myPolygonData.newMonoChain( myMonoChain[0] );
		//
		mnew = myPolygonData.splitPolygonChain( mcur, myVertices[5], myVertices[2], false );
		ok( ( monoSubPolys[mcur].mprev == myMonoChain[1] ), "splitPolygonChain4_CW #1_mcur newSegHigh2Low: prev(vertHigh)" );
		ok( ( monoSubPolys[mcur].mnext == myMonoChain[5] ), "splitPolygonChain4_CW #1_mcur newSegHigh2Low: next(vertLow)" );
		ok( ( monoSubPolys[mnew].mprev == myMonoChain[4] ), "splitPolygonChain4_CW #1_mnew newSegLow2High: prev(vertLow)" );
		ok( ( monoSubPolys[mnew].mnext == myMonoChain[2] ), "splitPolygonChain4_CW #1_mnew newSegLow2High: next(vertHigh)" );
//		showDataStructure( myMonoChain, [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
		//
		mcur = mnew;
		mnew = myPolygonData.splitPolygonChain( mcur, myVertices[3], myVertices[5], true );
		ok( ( monoSubPolys[mcur].mprev == myMonoChain[ 2] ), "splitPolygonChain4_CW #2_mcur newSegLow2High: prev(vertLow)" );
		ok( ( monoSubPolys[mcur].mnext == myMonoChain[ 5] ), "splitPolygonChain4_CW #2_mcur newSegLow2High: next(vertHigh) wrong should be [10]" );
		ok( ( monoSubPolys[mnew].mprev == myMonoChain[11] ), "splitPolygonChain4_CW #2_mnew newSegHigh2Low: prev(vertHigh) wrong should be [ 4]" );
		ok( ( monoSubPolys[mnew].mnext == myMonoChain[ 3] ), "splitPolygonChain4_CW #2_mnew newSegHigh2Low: next(vertLow)" );
//		showDataStructure( myMonoChain, [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
//		showDataStructure( monoSubPolys[mcur], [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
//		showDataStructure( monoSubPolys[mnew], [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
		//
		equal( myMonoChain.length, 14, "splitPolygonChain4_CW: monoChain.length incl. new Segs - wrong should be 18" );
		equal( myVertices.length, 10, "splitPolygonChain4_CW: vertices.length incl. new Segs unchanged" );
//		showDataStructure( myVertices, [ 'sprev', 'snext', 'vertTo', 'segOut' ] );
		//
		var checkResult;
		if ( checkResult = myPolygonData.checkMonoChainVertexIDs( 0, [ 2, 5, 3, 4, 5, 2, 3, 5, 0, 1 ] ) )	// wrong mono chains
			ok( false, "splitPolygonChain4_CW: "+checkResult );
		if ( checkResult = myPolygonData.checkMonoChainVertexIDs( 1, [ 3, 5, 0, 1, 2, 5, 3, 4, 5, 2 ] ) )
			ok( false, "splitPolygonChain4_CW: "+checkResult );
		if ( checkResult = myPolygonData.checkMonoChainVertexIDs( 2, [ 5, 3, 4, 5, 2, 3, 5, 0, 1, 2 ] ) )
			ok( false, "splitPolygonChain4_CW: "+checkResult );
//		drawPolygonLayers( { "mono": myPolygonData.monotone_chains_2_polygons() }, 0.8 );
	}
	

	function test_unique_monotone_chains_max() {
		var myPolygonData, polyChains, myMonoChain;
		var expectedMonoStartIdxs, uniqueMonoChainsMax;
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
		expectedMonoStartIdxs = [ 2, 5, 8, 10 ].map( function (val) { return myMonoChain[val] } );
		//
		uniqueMonoChainsMax = myPolygonData.unique_monotone_chains_max();
		deepEqual( uniqueMonoChainsMax, expectedMonoStartIdxs, "test_unique_monotone_chains: pt_3_diag_max" );
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
		expectedMonoStartIdxs = [ 1, 11 ].map( function (val) { return myMonoChain[val] } );
		//
		uniqueMonoChainsMax = myPolygonData.unique_monotone_chains_max();
		deepEqual( uniqueMonoChainsMax, expectedMonoStartIdxs, "test_unique_monotone_chains: square_3triangholes" );
	}
	
	
	test( "Polygon Data", function() {
		test_polygon_area();
			
		test_addPolygonChain_errors();
		test_addPolygonChain_ok();

		test_allSegsInQueryStructure();
		
		test_vertices_monoChain();
		// test_mapAngle();
		test_splitPolygonChain1();
		test_splitPolygonChain2();
		test_splitPolygonChain3();
		test_splitPolygonChain4_CCW();
		test_splitPolygonChain4_CW();
		test_unique_monotone_chains_max();
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

