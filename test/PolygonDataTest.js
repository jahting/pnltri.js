/**
 * @author jahting / http://www.ameco.tv/
 */

/*	TODO: Tests for appendVertexEntry,
	createSegmentEntry, appendSegmentEntry,
	addVertexChain, addPolygonChain: suppression of zero-length segments	*/


/*	Base class extensions - for testing only */

PNLTRI.PolygonData.prototype.getVertices = function () {
	return	this.vertices;
};
PNLTRI.PolygonData.prototype.nbSegments = function () {
	return	this.segments.length;
};
PNLTRI.PolygonData.prototype.nbMonoSubPolys = function () {
	return	this.monoSubPolyChains.length;
};
PNLTRI.PolygonData.prototype.getTriangleList = function () {
	return	this.triangles;
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
PNLTRI.PolygonData.prototype.copyMonoChainsFromSegments = function () {
	var newMono;
	for (var i = 0; i < this.segments.length; i++) {
		newMono = this.segments[i];
		newMono.mprev = newMono.sprev;		// doubly linked list for monotone chains (sub-polygons)
		newMono.mnext = newMono.snext;
	}
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
PNLTRI.PolygonData.prototype.check_normedMonoChains_consistency = function () {
	// assumes, that monoSubPolyChains already point to the ymax point of each monochain
	var	resultStr = "check_normedMonoChains_consistency: ";
	var	resultOk = true;

	var myMonoChains = this.getMonoSubPolys();
	for (var mIdx=0; mIdx<myMonoChains.length; mIdx++) {
		var monoPosmax = myMonoChains[mIdx];
		var prevMono = monoPosmax.mprev;
		var nextMono = monoPosmax.mnext;
		// goes the chain down the mnext links to prevMono ?
		var isNextChain = ( PNLTRI.Math.compare_pts_yx( nextMono.vFrom, prevMono.vFrom ) == 1 );
		var monoPosmin = isNextChain ? prevMono : nextMono;
		if ( PNLTRI.Math.compare_pts_yx( monoPosmax.vFrom, monoPosmin.vFrom ) != 1 ) {
			resultOk = false;
			resultStr += monoPosmax.vFrom.id + " (monoPosmax) <= " + monoPosmin.vFrom.id + " (monoPosmin), ";
		}
		//
		var count = this.nbSegments() + 2;		// recognize infinite loops
		prevMono = monoPosmax;
		nextMono = monoPosmax;
		do {
			if ( count-- < 0 ) {
				resultOk = false; resultStr += "loop too long";
				break;
			}
			nextMono = isNextChain ? nextMono.mnext : nextMono.mprev;
			if ( PNLTRI.Math.compare_pts_yx( prevMono.vFrom, nextMono.vFrom ) != 1 ) {
				resultOk = false;
				resultStr += prevMono.vFrom.id + " <= " + nextMono.vFrom.id + ", ";
			}
			prevMono = nextMono;
		} while ( nextMono != monoPosmin );
	}

	if ( resultOk )		return	null;
	return	resultStr;
};
//	for output of polygons as vertex index lists
PNLTRI.PolygonData.prototype.polygons_2_vertexIndexLists = function ( inPolygons ) {
	var polygons_str = '[ ';
	for (var i=0; i<inPolygons.length; i++) {
		var polygon_str = '[ ';
		for (var j=0; j<inPolygons[i].length; j++) {
			polygon_str += inPolygons[i][j].id + ', ';
		}
		polygons_str += polygon_str + '], ';
	}
	return	polygons_str + ']';
};
//	for output of monotone chain starts as vertex index list
PNLTRI.PolygonData.prototype.monoChainStarts_2_vertexIndexLists = function () {
	var monoChain_starts_str = '[ ';
	var myMonoChains = this.getMonoSubPolys();
	for ( var i = 0; i < myMonoChains.length; i++ ) {
		monoChain_starts_str += myMonoChains[i].vFrom.id + ', ';
	}
	return	monoChain_starts_str + ']';
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
	var polygons = [];
	var myMonoChains = this.getMonoSubPolys();
	for ( var i = 0; i < myMonoChains.length; i++) {
		polygons.push( this.monotone_chain_2_polygon( myMonoChains[i] ) );
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

	function test_addPolygonChain_zero_length() {
		var testPolygon, myPolygonData;
		var myVertices, mySegArray;

		// middle point double
		testPolygon = [ { x: 10, y: 30 }, { x: 20, y: 10 }, { x: 20, y: 10 }, { x: 30, y: 40 } ];
		myPolygonData = new PNLTRI.PolygonData();
		//
		myPolygonData.addPolygonChain_consistently( testPolygon, "addPolygonChain_zero_length #1");
		equal( myPolygonData.getVertices().length, 4, "addPolygonChain_zero_length: Number of Vertices #1" );
		equal( myPolygonData.nbSegments(), 3, "addPolygonChain_zero_length: Number of Segments #1" );
		equal( myPolygonData.nbPolyChains(), 1, "addPolygonChain_zero_length: Number of Polygon Chains #1" );
		//
		myVertices = myPolygonData.getVertices();
		mySegArray = myPolygonData.getSegments();
		strictEqual( mySegArray[0].vFrom, myVertices[0], "addPolygonChain_zero_length #1: Seg#0.vFrom" );
		strictEqual( mySegArray[0].vTo, myVertices[1], "addPolygonChain_zero_length #1: Seg#0.vTo" );
		strictEqual( mySegArray[1].vFrom, myVertices[1], "addPolygonChain_zero_length #1: Seg#1.vFrom" );
		strictEqual( mySegArray[1].vTo, myVertices[3], "addPolygonChain_zero_length #1: Seg#1.vTo" );
		strictEqual( mySegArray[2].vFrom, myVertices[3], "addPolygonChain_zero_length #1: Seg#2.vFrom" );
		strictEqual( mySegArray[2].vTo, myVertices[0], "addPolygonChain_zero_length #1: Seg#2.vTo" );
		//
		// end point double
		testPolygon = [ { x: 10, y: 30 }, { x: 20, y: 10 }, { x: 30, y: 40 }, { x: 30, y: 40 } ];
		myPolygonData = new PNLTRI.PolygonData();
		//
		myPolygonData.addPolygonChain_consistently( testPolygon, "addPolygonChain_zero_length #2");
		equal( myPolygonData.getVertices().length, 4, "addPolygonChain_zero_length: Number of Vertices #2" );
		equal( myPolygonData.nbSegments(), 3, "addPolygonChain_zero_length: Number of Segments #2" );
		equal( myPolygonData.nbPolyChains(), 1, "addPolygonChain_zero_length: Number of Polygon Chains #2" );
		//
		myVertices = myPolygonData.getVertices();
		mySegArray = myPolygonData.getSegments();
		strictEqual( mySegArray[0].vFrom, myVertices[0], "addPolygonChain_zero_length #2: Seg#0.vFrom" );
		strictEqual( mySegArray[0].vTo, myVertices[1], "addPolygonChain_zero_length #2: Seg#0.vTo" );
		strictEqual( mySegArray[1].vFrom, myVertices[1], "addPolygonChain_zero_length #2: Seg#1.vFrom" );
		strictEqual( mySegArray[1].vTo, myVertices[2], "addPolygonChain_zero_length #2: Seg#1.vTo" );
		strictEqual( mySegArray[2].vFrom, myVertices[2], "addPolygonChain_zero_length #2: Seg#2.vFrom" );
		strictEqual( mySegArray[2].vTo, myVertices[0], "addPolygonChain_zero_length #2: Seg#2.vTo" );
		//
		testPolygon = [ { x: 10, y: 30 }, { x: 10, y: 30 }, { x: 20, y: 10 }, { x: 30, y: 40 } ];
		myPolygonData = new PNLTRI.PolygonData();
		//
		// first point double
		myPolygonData.addPolygonChain_consistently( testPolygon, "addPolygonChain_zero_length #3");
		equal( myPolygonData.getVertices().length, 4, "addPolygonChain_zero_length: Number of Vertices #3" );
		equal( myPolygonData.nbSegments(), 3, "addPolygonChain_zero_length: Number of Segments #3" );
		equal( myPolygonData.nbPolyChains(), 1, "addPolygonChain_zero_length: Number of Polygon Chains #3" );
		//
		myVertices = myPolygonData.getVertices();
		mySegArray = myPolygonData.getSegments();
		strictEqual( mySegArray[0].vFrom, myVertices[0], "addPolygonChain_zero_length #3: Seg#0.vFrom" );
		strictEqual( mySegArray[0].vTo, myVertices[2], "addPolygonChain_zero_length #3: Seg#0.vTo" );
		strictEqual( mySegArray[1].vFrom, myVertices[2], "addPolygonChain_zero_length #3: Seg#1.vFrom" );
		strictEqual( mySegArray[1].vTo, myVertices[3], "addPolygonChain_zero_length #3: Seg#1.vTo" );
		strictEqual( mySegArray[2].vFrom, myVertices[3], "addPolygonChain_zero_length #3: Seg#2.vFrom" );
		strictEqual( mySegArray[2].vTo, myVertices[0], "addPolygonChain_zero_length #3: Seg#2.vTo" );
		//
//		showDataStructure( myPolygonData.getVertices(), [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
//		showDataStructure( myPolygonData.getSegments(), [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
	}

	function test_addPolygonChain_colinear_real() {
		var testPolygon, myPolygonData;
		var myVertices, mySegArray;

		// co-linear: 3 points on a line -> skip middle point
		testPolygon = [ { x: 10, y: 30 }, { x: 20, y: 10 }, { x: 25, y: 25 }, { x: 30, y: 40 } ];
		myPolygonData = new PNLTRI.PolygonData();
		//
		myPolygonData.addPolygonChain_consistently( testPolygon, "addPolygonChain_colinear_real #1");
		equal( myPolygonData.getVertices().length, 4, "addPolygonChain_colinear_real: Number of Vertices #1" );
		equal( myPolygonData.nbSegments(), 3, "addPolygonChain_colinear_real: Number of Segments #1" );
		equal( myPolygonData.nbPolyChains(), 1, "addPolygonChain_colinear_real: Number of Polygon Chains #1" );
		//
		myVertices = myPolygonData.getVertices();
		mySegArray = myPolygonData.getSegments();
		strictEqual( mySegArray[0].vFrom, myVertices[0], "addPolygonChain_colinear_real #1: Seg#0.vFrom" );
		strictEqual( mySegArray[0].vTo, myVertices[1], "addPolygonChain_colinear_real #1: Seg#0.vTo" );
		strictEqual( mySegArray[1].vFrom, myVertices[1], "addPolygonChain_colinear_real #1: Seg#1.vFrom" );
		strictEqual( mySegArray[1].vTo, myVertices[3], "addPolygonChain_colinear_real #1: Seg#1.vTo" );
		strictEqual( mySegArray[2].vFrom, myVertices[3], "addPolygonChain_colinear_real #1: Seg#2.vFrom" );
		strictEqual( mySegArray[2].vTo, myVertices[0], "addPolygonChain_colinear_real #1: Seg#2.vTo" );
		//
		// co-linear: 3 points on a line: end point -> skip end point
		testPolygon = [ { x: 10, y: 30 }, { x: 20, y: 10 }, { x: 30, y: 40 }, { x: 20, y: 35 } ];
		myPolygonData = new PNLTRI.PolygonData();
		//
		myPolygonData.addPolygonChain_consistently( testPolygon, "addPolygonChain_colinear_real #2");
		equal( myPolygonData.getVertices().length, 4, "addPolygonChain_colinear_real: Number of Vertices #2" );
		equal( myPolygonData.nbSegments(), 3, "addPolygonChain_colinear_real: Number of Segments #2" );
		equal( myPolygonData.nbPolyChains(), 1, "addPolygonChain_colinear_real: Number of Polygon Chains #2" );
		//
		myVertices = myPolygonData.getVertices();
		mySegArray = myPolygonData.getSegments();
		strictEqual( mySegArray[0].vFrom, myVertices[0], "addPolygonChain_colinear_real #2: Seg#0.vFrom" );
		strictEqual( mySegArray[0].vTo, myVertices[1], "addPolygonChain_colinear_real #2: Seg#0.vTo" );
		strictEqual( mySegArray[1].vFrom, myVertices[1], "addPolygonChain_colinear_real #2: Seg#1.vFrom" );
		strictEqual( mySegArray[1].vTo, myVertices[2], "addPolygonChain_colinear_real #2: Seg#1.vTo" );
		strictEqual( mySegArray[2].vFrom, myVertices[2], "addPolygonChain_colinear_real #2: Seg#2.vFrom" );
		strictEqual( mySegArray[2].vTo, myVertices[0], "addPolygonChain_colinear_real #2: Seg#2.vTo" );
		//
		// co-linear: 3 points on a line: first point -> skip first point
		testPolygon = [ { x: 20, y: 35 }, { x: 10, y: 30 }, { x: 20, y: 10 }, { x: 30, y: 40 } ];
		myPolygonData = new PNLTRI.PolygonData();
		//
		myPolygonData.addPolygonChain_consistently( testPolygon, "addPolygonChain_colinear_real #3");
		equal( myPolygonData.getVertices().length, 4, "addPolygonChain_colinear_real: Number of Vertices #3" );
		equal( myPolygonData.nbSegments(), 3, "addPolygonChain_colinear_real: Number of Segments #3" );
		equal( myPolygonData.nbPolyChains(), 1, "addPolygonChain_colinear_real: Number of Polygon Chains #3" );
		//
		myVertices = myPolygonData.getVertices();
		mySegArray = myPolygonData.getSegments();
		strictEqual( mySegArray[0].vFrom, myVertices[1], "addPolygonChain_colinear_real #3: Seg#0.vFrom" );
		strictEqual( mySegArray[0].vTo, myVertices[2], "addPolygonChain_colinear_real #3: Seg#0.vTo" );
		strictEqual( mySegArray[1].vFrom, myVertices[2], "addPolygonChain_colinear_real #3: Seg#1.vFrom" );
		strictEqual( mySegArray[1].vTo, myVertices[3], "addPolygonChain_colinear_real #3: Seg#1.vTo" );
		strictEqual( mySegArray[2].vFrom, myVertices[3], "addPolygonChain_colinear_real #3: Seg#2.vFrom" );
		strictEqual( mySegArray[2].vTo, myVertices[1], "addPolygonChain_colinear_real #3: Seg#2.vTo" );
		//
		// co-linear: 5 points on a line -> skip intermediate points
		testPolygon = [ { x: 10, y: 30 }, { x: 20, y: 10 }, { x: 22.5, y: 17.5 }, { x: 25, y: 25 }, { x: 27.5, y: 32.5 }, { x: 30, y: 40 } ];
		myPolygonData = new PNLTRI.PolygonData();
		//
		myPolygonData.addPolygonChain_consistently( testPolygon, "addPolygonChain_colinear_real #4");
		equal( myPolygonData.getVertices().length, 6, "addPolygonChain_colinear_real: Number of Vertices #4" );
		equal( myPolygonData.nbSegments(), 3, "addPolygonChain_colinear_real: Number of Segments #4" );
		equal( myPolygonData.nbPolyChains(), 1, "addPolygonChain_colinear_real: Number of Polygon Chains #4" );
		//
		myVertices = myPolygonData.getVertices();
		mySegArray = myPolygonData.getSegments();
		strictEqual( mySegArray[0].vFrom, myVertices[0], "addPolygonChain_colinear_real #4: Seg#0.vFrom" );
		strictEqual( mySegArray[0].vTo, myVertices[1], "addPolygonChain_colinear_real #4: Seg#0.vTo" );
		strictEqual( mySegArray[1].vFrom, myVertices[1], "addPolygonChain_colinear_real #4: Seg#1.vFrom" );
		strictEqual( mySegArray[1].vTo, myVertices[5], "addPolygonChain_colinear_real #4: Seg#1.vTo" );
		strictEqual( mySegArray[2].vFrom, myVertices[5], "addPolygonChain_colinear_real #4: Seg#2.vFrom" );
		strictEqual( mySegArray[2].vTo, myVertices[0], "addPolygonChain_colinear_real #4: Seg#2.vTo" );
		//
		// co-linear: 5 points on a line over end/start -> skip intermediate points
		testPolygon = [ { x: 15, y: 32.5 }, { x: 10, y: 30 }, { x: 20, y: 10 }, { x: 30, y: 40 }, { x: 25, y: 37.5 }, { x: 20, y: 35 } ];
		myPolygonData = new PNLTRI.PolygonData();
		//
		myPolygonData.addPolygonChain_consistently( testPolygon, "addPolygonChain_colinear_real #5");
		equal( myPolygonData.getVertices().length, 6, "addPolygonChain_colinear_real: Number of Vertices #5" );
		equal( myPolygonData.nbSegments(), 3, "addPolygonChain_colinear_real: Number of Segments #5" );
		equal( myPolygonData.nbPolyChains(), 1, "addPolygonChain_colinear_real: Number of Polygon Chains #5" );
		//
		myVertices = myPolygonData.getVertices();
		mySegArray = myPolygonData.getSegments();
		strictEqual( mySegArray[0].vFrom, myVertices[1], "addPolygonChain_colinear_real #5: Seg#0.vFrom" );
		strictEqual( mySegArray[0].vTo, myVertices[2], "addPolygonChain_colinear_real #5: Seg#0.vTo" );
		strictEqual( mySegArray[1].vFrom, myVertices[2], "addPolygonChain_colinear_real #5: Seg#1.vFrom" );
		strictEqual( mySegArray[1].vTo, myVertices[3], "addPolygonChain_colinear_real #5: Seg#1.vTo" );
		strictEqual( mySegArray[2].vFrom, myVertices[3], "addPolygonChain_colinear_real #5: Seg#2.vFrom" );
		strictEqual( mySegArray[2].vTo, myVertices[1], "addPolygonChain_colinear_real #5: Seg#2.vTo" );

		// co-linear (horizontal UPwards): 3 points on a line -> skip middle point
		testPolygon = [ { x: 10, y: 30 }, { x: 20, y: 10 }, { x: 25, y: 10 }, { x: 30, y: 10 } ];
		myPolygonData = new PNLTRI.PolygonData();
		//
		myPolygonData.addPolygonChain_consistently( testPolygon, "addPolygonChain_colinear_real #6");
		equal( myPolygonData.getVertices().length, 4, "addPolygonChain_colinear_real: Number of Vertices #6" );
		equal( myPolygonData.nbSegments(), 3, "addPolygonChain_colinear_real: Number of Segments #6" );
		equal( myPolygonData.nbPolyChains(), 1, "addPolygonChain_colinear_real: Number of Polygon Chains #6" );
		//
		myVertices = myPolygonData.getVertices();
		mySegArray = myPolygonData.getSegments();
		strictEqual( mySegArray[0].vFrom, myVertices[0], "addPolygonChain_colinear_real #6: Seg#0.vFrom" );
		strictEqual( mySegArray[0].vTo, myVertices[1], "addPolygonChain_colinear_real #6: Seg#0.vTo" );
		strictEqual( mySegArray[1].vFrom, myVertices[1], "addPolygonChain_colinear_real #6: Seg#1.vFrom" );
		strictEqual( mySegArray[1].vTo, myVertices[3], "addPolygonChain_colinear_real #6: Seg#1.vTo" );
		strictEqual( mySegArray[2].vFrom, myVertices[3], "addPolygonChain_colinear_real #6: Seg#2.vFrom" );
		strictEqual( mySegArray[2].vTo, myVertices[0], "addPolygonChain_colinear_real #6: Seg#2.vTo" );

		// co-linear (horizontal DOWNwards): 3 points on a line -> skip middle point
		testPolygon = [ { x: 10, y: 30 }, { x: 30, y: 10 }, { x: 25, y: 10 }, { x: 20, y: 10 } ];
		myPolygonData = new PNLTRI.PolygonData();
		//
		myPolygonData.addPolygonChain_consistently( testPolygon, "addPolygonChain_colinear_real #7");
		equal( myPolygonData.getVertices().length, 4, "addPolygonChain_colinear_real: Number of Vertices #7" );
		equal( myPolygonData.nbSegments(), 3, "addPolygonChain_colinear_real: Number of Segments #7" );
		equal( myPolygonData.nbPolyChains(), 1, "addPolygonChain_colinear_real: Number of Polygon Chains #7" );
		//
		myVertices = myPolygonData.getVertices();
		mySegArray = myPolygonData.getSegments();
		strictEqual( mySegArray[0].vFrom, myVertices[0], "addPolygonChain_colinear_real #7: Seg#0.vFrom" );
		strictEqual( mySegArray[0].vTo, myVertices[1], "addPolygonChain_colinear_real #7: Seg#0.vTo" );
		strictEqual( mySegArray[1].vFrom, myVertices[1], "addPolygonChain_colinear_real #7: Seg#1.vFrom" );
		strictEqual( mySegArray[1].vTo, myVertices[3], "addPolygonChain_colinear_real #7: Seg#1.vTo" );
		strictEqual( mySegArray[2].vFrom, myVertices[3], "addPolygonChain_colinear_real #7: Seg#2.vFrom" );
		strictEqual( mySegArray[2].vTo, myVertices[0], "addPolygonChain_colinear_real #7: Seg#2.vTo" );
		//
//		showDataStructure( myPolygonData.getVertices(), [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
//		showDataStructure( myPolygonData.getSegments(), [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
	}

	function test_addPolygonChain_colinear_false() {
		// co-linear: 3 points on a line, with reversal -> DONT skip middle point
		var testPolygon, myPolygonData;
		var myVertices, mySegArray;

		// UPwards
		testPolygon = [ { x: 10, y: 30 }, { x: 25, y: 25 }, { x: 20, y: 10 }, { x: 30, y: 40 } ];
		myPolygonData = new PNLTRI.PolygonData();
		//
		myPolygonData.addPolygonChain_consistently( testPolygon, "addPolygonChain_colinear_false #1");
		equal( myPolygonData.getVertices().length, 4, "addPolygonChain_colinear_false: Number of Vertices #1" );
		equal( myPolygonData.nbSegments(), 4, "addPolygonChain_colinear_false: Number of Segments #1" );
		equal( myPolygonData.nbPolyChains(), 1, "addPolygonChain_colinear_false: Number of Polygon Chains #1" );
		//
		// DOWNwards
		testPolygon = [ { x: 10, y: 30 }, { x: 20, y: 10 }, { x: 20, y: 35 }, { x: 30, y: 40 } ];
		myPolygonData = new PNLTRI.PolygonData();
		//
		myPolygonData.addPolygonChain_consistently( testPolygon, "addPolygonChain_colinear_false #2");
		equal( myPolygonData.getVertices().length, 4, "addPolygonChain_colinear_false: Number of Vertices #2" );
		equal( myPolygonData.nbSegments(), 4, "addPolygonChain_colinear_false: Number of Segments #2" );
		equal( myPolygonData.nbPolyChains(), 1, "addPolygonChain_colinear_false: Number of Polygon Chains #2" );
		//
		// horizontal UPwards
		testPolygon = [ { x: 10, y: 30 }, { x: 25, y: 10 }, { x: 20, y: 10 }, { x: 30, y: 10 } ];
		myPolygonData = new PNLTRI.PolygonData();
		//
		myPolygonData.addPolygonChain_consistently( testPolygon, "addPolygonChain_colinear_false #3");
		equal( myPolygonData.getVertices().length, 4, "addPolygonChain_colinear_false: Number of Vertices #3" );
		equal( myPolygonData.nbSegments(), 4, "addPolygonChain_colinear_false: Number of Segments #3" );
		equal( myPolygonData.nbPolyChains(), 1, "addPolygonChain_colinear_false: Number of Polygon Chains #3" );
		//
		// horizontal DOWNwards
		testPolygon = [ { x: 10, y: 30 }, { x: 25, y: 10 }, { x: 30, y: 10 }, { x: 20, y: 10 } ];
		myPolygonData = new PNLTRI.PolygonData();
		//
		myPolygonData.addPolygonChain_consistently( testPolygon, "addPolygonChain_colinear_false #4");
		equal( myPolygonData.getVertices().length, 4, "addPolygonChain_colinear_false: Number of Vertices #4" );
		equal( myPolygonData.nbSegments(), 4, "addPolygonChain_colinear_false: Number of Segments #4" );
		equal( myPolygonData.nbPolyChains(), 1, "addPolygonChain_colinear_false: Number of Polygon Chains #4" );
		//
//		showDataStructure( myPolygonData.getVertices(), [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
//		showDataStructure( myPolygonData.getSegments(), [ 'sprev', 'snext', 'mprev', 'mnext', 'vertTo', 'segOut' ] );
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


	function test_unique_monotone_chains_max() {

		function equal_monotone_chains( inMonoStartIdxs, inExpectedMonoStartIdxs, inTestName ) {
			if ( inMonoStartIdxs.length == inExpectedMonoStartIdxs.length ) {
				for (var i = 0; i < inExpectedMonoStartIdxs.length; i++ ) {
					ok( inMonoStartIdxs[i] == inExpectedMonoStartIdxs[i], inTestName + ": monoChainMax#"+i );
				}
			} else {
				equal( inMonoStartIdxs.length, inExpectedMonoStartIdxs.length, inTestName + ": nb unique monoChains" );
			}
		}

		var myPolygonData, polyChains, myMonoChain;
		var expectedMonoStartIdxs, uniqueMonoChainsMax;
		var i;
		//
		//		Test A
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
		equal_monotone_chains( uniqueMonoChainsMax, expectedMonoStartIdxs, "test_unique_monotone_chains_max (pt_3_diag_max)" );
		//
		//		Test B
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
		equal_monotone_chains( uniqueMonoChainsMax, expectedMonoStartIdxs, "test_unique_monotone_chains_max (square_3triangholes)" );
		//
		//		Test C:		buggy monoChains (double points)
		//
		myPolygonData = new PNLTRI.PolygonData( testData.get_polygon_with_holes( "colinear#2" ) );
		myPolygonData.replaceMonoChains( [
					[ 8, 12, 13, 19, 17, 12, 8, 11, 12, 17, 18, 19, 13, 0, 6, 7, ],
					[ 16, 3, 4, 5, 6, 0, 1, 2, 14, 15, ],
					[ 9, 21, 22, 20, 10, 11, 8, ],
					[ 10, 20, 21, 9, ],
					[ 14, 2, 3, 16, ] ],
					[ 0, 16, 2, 9, 6, 26, 33, 35, 37, 39 ] );
		//
		// Main Test
		//
		myMonoChain = myPolygonData.getSegments();
		expectedMonoStartIdxs = [ 15, 20, 32, 33, 38 ].map( function (val) { return myMonoChain[val] } );
		//
		uniqueMonoChainsMax = myPolygonData.unique_monotone_chains_max();
		equal_monotone_chains( uniqueMonoChainsMax, expectedMonoStartIdxs, "test_unique_monotone_chains_max (colinear#2)" );
	}


	test( "Polygon Data", function() {
		test_polygon_area();

		test_addPolygonChain_errors();
		test_addPolygonChain_ok();
		test_addPolygonChain_zero_length();
		test_addPolygonChain_colinear_real();
		test_addPolygonChain_colinear_false();

		test_allSegsInQueryStructure();

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

