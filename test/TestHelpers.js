/**
 * @author jahting / http://www.ameco.tv/
 */

/* =============================================================================
 *
 *	Helper for Mock-Tests
 *
 * ===========================================================================*/


// Helper functions
var	mockDoChecks = false;		// check data ? false: NOOP
var	mockExpectData = [];		// expected data
var	mockExpectResp = [];		// expected response
var	mockExpectIdx = 0;			// expected data index
function mock_check( inData ) {
	var expected = mockExpectData[mockExpectIdx];
	ok( expected, "still data expected, call: " + mockExpectIdx );
	equal( inData.length, expected.length, "data.length == expected, call: " + mockExpectIdx );
	for (var i=0; i<expected.length; i++) {
		ok( ( inData[i] == expected[i] ), "Call: "+mockExpectIdx+", Idx: "+i );
//		strictEqual( inData[i], expected[i], "Call: "+mockExpectIdx+", Idx: "+i );
//		console.log( "Call: "+mockExpectIdx+", Idx: "+i, inData[i], expected[i] );
	}
	return	mockExpectResp[mockExpectIdx++];
}
function mock_check_calls() {
	if ( mockDoChecks )		return	( mockExpectIdx == mockExpectData.length );
	return	true;
}

function mock_check_off() {
	mockDoChecks = false;
}
function mock_rewind() {
	mockExpectIdx = 0;
	mockDoChecks = true;
}
function mock_set_expected( inData, inResponse ) {
	mockExpectData = inData || [];
	mockExpectResp = inResponse || [];
	mock_rewind();
}


	

/* =============================================================================
 *
 *	Helper for Serialization -> output of data structures
 *		cutting of cyclical strucures
 *
 * ===========================================================================*/

var MAX_OBJECTS = 1000;

var	tempKeys = [];
	
var objIDs = [];
var tempIDflags = [];

function replaceObjByID( key, val ) {
	if ( val == null )		return;
	if ( key == "nodetype" ) {
		if ( val == PNLTRI.T_Y )		return	"T_Y";
		if ( val == PNLTRI.T_X )		return	"T_X";
		return	"T_SINK";
	}
//	if ( key == "trap" ) {		// shows only ID of Trapezoids
//		return	val.trapID;
//	}
	if ( typeof val == "object" ) {
		if ( objIDs.length >= MAX_OBJECTS ) { return null; }
		var isTempKey = ( tempKeys.indexOf(key) >= 0 );
		var objID = objIDs.indexOf(val);
		if ( objID >= 0 ) {
			if ( tempIDflags[objID] && ( !isTempKey ) ) {
				tempIDflags[objID] = false;
			} else {
				return	"serObjID: " + objID;
			}
		} else {
			objIDs.push(val);
			objID = objIDs.length - 1;
			if ( isTempKey ) {
				tempIDflags[objID] = true;
				return	"serObjID: " + objID;
			} else {
				tempIDflags[objID] = false;
			}
		}
		var newVal = { serObjID: objID };
		var value;
		for (var attr in val) {
			value = val[attr];
			if ( typeof value != "object" ) { newVal[attr] = value }
		}
		for (var attr in val) {
			value = val[attr];
			if ( typeof value == "object" ) { newVal[attr] = value }
		}
		return	newVal;
	}
	return	val
}

function showDataStructure( inObject, inTempKeys ) {
	tempKeys = inTempKeys || [ 'dL', 'dR', 'uL', 'uR', 'sprev', 'snext', 'mprev', 'mnext', 'rootFrom', 'rootTo' ];
	try {
		var output = JSON.stringify( inObject, replaceObjByID, '\t' );
		output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );
		
		var unreachable = JSON.stringify( tempIDflags, null, '\t' );
		unreachable = unreachable.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );
		
		var blob = new Blob( [ output + "\n\n>>> unreachable <<<:\n" + unreachable ], { type: 'application/json' } );		// application/json; text/plain
		var objectURL = URL.createObjectURL( blob );
		
		window.open( objectURL, '_blank' );
		window.focus();
	} catch(e) {
		console.log("Error: ", e);
	}
}


/* =============================================================================
 *
 *	Helper for Drawing Trapezoid Structure -> Canvas 2D
 *
 * ===========================================================================*/
 
 function drawTrapezoids( inQsRoot, inNotUnbounded, inScale ) {
 	 
	// GLOBALS ======================================================

	var	CAN_RAND = 100;
	var	MAX_HEIGHT = 50;
	var factor, max_width;
	
	var canvas, context;
	
	var scale = inScale ? inScale : 1;

	//

	function setupCanvas() {
		canvas = document.createElement( 'canvas' );
		canvas.width = window.innerWidth - CAN_RAND;
		canvas.height = window.innerHeight - CAN_RAND;
		document.body.appendChild( canvas );
		context = canvas.getContext( '2d' );
	}

	//

	function setupWorld() {
		factor = ( window.innerHeight - CAN_RAND ) / MAX_HEIGHT;
		max_width = ( window.innerWidth - CAN_RAND ) / factor / scale;
		context.fillStyle = "yellow";
        context.fillRect(0, 0, canvas.width, canvas.height);
	}
	
	//

	function myMoveTo( inX, inY ) {
		context.moveTo( inX * scale * factor, ( MAX_HEIGHT - inY * scale ) * factor );
	}
	function myLineTo( inX, inY ) {
		context.lineTo( inX * scale * factor, ( MAX_HEIGHT - inY * scale ) * factor );
	}
	function myFillText( inText, inX, inY ) {
		var yKoord = ( MAX_HEIGHT - inY * scale ) * factor + 7;
		if ( yKoord < 0 ) yKoord = 20;
		else if ( yKoord >= canvas.height ) yKoord = canvas.height - 3;
		context.fillText( inText, inX * scale * factor - 10, yKoord );
	}
	

	function	xCoord_of_segment_at_Y( inSegment, inCrossYPt ) {
		if ( inSegment.vTo.y == inSegment.vFrom.y )		return inCrossYPt.x;
		return	inSegment.vFrom.x + (inSegment.vTo.x - inSegment.vFrom.x) *
					( inCrossYPt.y - inSegment.vFrom.y ) / ( inSegment.vTo.y - inSegment.vFrom.y );
	}
	
	var addLines = [];
	
	function drawAddLines() {
		if ( addLines.length == 0 )	return;
//		alert( "Number of additional lines: " + addLines.length );
		
		context.strokeStyle = 'red';
		context.lineWidth = 2;
		
		for (var i=0; i<addLines.length; i++) {
			context.beginPath();
			myMoveTo( addLines[i].vFrom.x, addLines[i].vFrom.y );
			myLineTo( addLines[i].vTo.x, addLines[i].vTo.y );
			context.stroke();
		}
	}
	
	function drawTrapezoid( inTrapezoid ) {
		if ( inNotUnbounded ) {
			if ( !inTrapezoid.lseg || !inTrapezoid.rseg )	return;
		}
		
		context.strokeStyle = 'black';
		context.fillStyle = "magenta"; 
		context.font = 'bold 20px sans-serif'; 
		
		var highLineLeft	= { x: 0, y: inTrapezoid.vHigh.y };
		var highLineRight	= { x: max_width, y: inTrapezoid.vHigh.y };
		
		var lowLineLeft		= { x: 0, y: inTrapezoid.vLow.y };
		var lowLineRight	= { x: max_width, y: inTrapezoid.vLow.y };
		
		// lseg
		if ( inTrapezoid.lseg ) {
			context.beginPath();
			myMoveTo( inTrapezoid.lseg.vFrom.x, inTrapezoid.lseg.vFrom.y );
			myLineTo( inTrapezoid.lseg.vTo.x, inTrapezoid.lseg.vTo.y );
			context.lineWidth = 3;
			context.stroke();
			highLineLeft.x = xCoord_of_segment_at_Y( inTrapezoid.lseg, inTrapezoid.vHigh );
			lowLineLeft.x = xCoord_of_segment_at_Y( inTrapezoid.lseg, inTrapezoid.vLow );
		}
		// rseg
		if ( inTrapezoid.rseg ) {
			context.beginPath();
			myMoveTo( inTrapezoid.rseg.vFrom.x, inTrapezoid.rseg.vFrom.y );
			myLineTo( inTrapezoid.rseg.vTo.x, inTrapezoid.rseg.vTo.y );
			context.lineWidth = 3;
			context.stroke();
			highLineRight.x = xCoord_of_segment_at_Y( inTrapezoid.rseg, inTrapezoid.vHigh );
			lowLineRight.x = xCoord_of_segment_at_Y( inTrapezoid.rseg, inTrapezoid.vLow );
		}
		
		// vHigh
		context.beginPath();
		myMoveTo( highLineLeft.x, highLineLeft.y );
		myLineTo( highLineRight.x, highLineRight.y );
		context.lineWidth = 1;
		context.stroke();
		// vLow
		context.beginPath();
		myMoveTo( lowLineLeft.x, lowLineLeft.y );
		myLineTo( lowLineRight.x, lowLineRight.y );
		context.lineWidth = 1;
		context.stroke();

		// middle coordinate
			myFillText( inTrapezoid.trapID, (highLineRight.x + highLineLeft.x + lowLineRight.x + lowLineLeft.x)/4,
											(lowLineLeft.y + highLineLeft.y)/2 );
//		if ( ( highLineRight.x - highLineLeft.x ) < ( lowLineRight.x - lowLineLeft.x ) ) {
//			myFillText( inTrapezoid.trapID, (highLineRight.x + highLineLeft.x)/2, (lowLineLeft.y + highLineLeft.y)/2 );
//		} else {
//			myFillText( inTrapezoid.trapID, (lowLineRight.x + lowLineLeft.x)/2, (lowLineLeft.y + highLineLeft.y)/2 );
//		}
		
		if ( inTrapezoid.uL && inTrapezoid.uR ) {
			// two upper neighbors
			addLines.push( { vFrom: inTrapezoid.vHigh, vTo: inTrapezoid.vLow } );
		} else if ( inTrapezoid.dL && inTrapezoid.dR ) {
			// two lower neighbors
			addLines.push( { vFrom: inTrapezoid.vHigh, vTo: inTrapezoid.vLow } );
		}
	}

	function drawQueryStruct( inQsNode ) {
		if ( !inQsNode )	return;
		if ( inQsNode.nodetype == PNLTRI.T_SINK ) {
			drawTrapezoid( inQsNode.trap );
		}
		drawQueryStruct( inQsNode.right );
		drawQueryStruct( inQsNode.left );
	}

	// SETUP ========================================================

	setupCanvas();
	setupWorld();
	
	drawQueryStruct( inQsRoot );
	drawAddLines();
}

/* =============================================================================
 *
 *	Helper for drawing (several) layers of polygons -> Canvas 2D
 *
 * ===========================================================================*/
 
function drawPolygonLayers( inPolygonLayers, inScale, inXoff, inYoff ) {
 	 
	// GLOBALS ======================================================

	var	CAN_RAND = 100;
	var	MAX_HEIGHT = 50;
	var factor, max_width;
	
	var canvas, context;

	var scale = inScale ? inScale : 1;
	var xOffset = inXoff ? inXoff : 0;
	var yOffset = inYoff ? inYoff : 0;
	var type;

	//

	function setupCanvas() {
		canvas = document.createElement( 'canvas' );
		canvas.width = window.innerWidth - CAN_RAND;
		canvas.height = window.innerHeight - CAN_RAND;
		document.body.appendChild( canvas );
		context = canvas.getContext( '2d' );
	}

	//

	function setupWorld() {
		factor = ( window.innerHeight - CAN_RAND ) / MAX_HEIGHT;
		max_width = ( window.innerWidth - CAN_RAND ) / factor;
		context.fillStyle = "yellow";
        context.fillRect(0, 0, canvas.width, canvas.height);
	}
	
	//

	function myMoveTo( inX, inY ) {
		context.moveTo( inX * scale * factor, ( MAX_HEIGHT - inY * scale ) * factor );
	}
	function myLineTo( inX, inY ) {
		context.lineTo( inX * scale * factor, ( MAX_HEIGHT - inY * scale ) * factor );
	}

	//

	function setContextStyle( inType ) {
		switch ( inType ) {
			case "poly": 	context.strokeStyle = 'black';
							context.lineWidth = 3;
							break;
			case "mono": 	context.strokeStyle = 'blue';
							context.lineWidth = 2;
							break;
			case "triang": 	context.strokeStyle = 'red';
							context.lineWidth = 1;
							break;
			default:		context.strokeStyle = 'black';
							context.lineWidth = 1;
		}
	}

	//
	
	function drawPolygon( inPolygon ) {
		if ( inPolygon.length == 0 )	return;
		//
		context.beginPath();
		myMoveTo( inPolygon[0].x - xOffset, inPolygon[0].y - yOffset );
		for (var i=1; i<inPolygon.length; i++) {
			myLineTo( inPolygon[i].x - xOffset, inPolygon[i].y - yOffset );
		}
		myLineTo( inPolygon[0].x - xOffset, inPolygon[0].y - yOffset );
		context.stroke();
	}
	
	// SETUP ========================================================

	setupCanvas();
	setupWorld();
	
	for ( type in inPolygonLayers ) {
		for (var i=0; i<inPolygonLayers[type].length; i++) {
			setContextStyle( type );
			drawPolygon( inPolygonLayers[type][i] );
		}
	}

}

/* =============================================================================
 *
 *	Helper for dumping segment list (several polygon chains) -> String
 *
 * ===========================================================================*/

// polygon chains -> String
function dumpSegmentList( inSegListArray, inHtmlBreaks ) {
	var lineBreak = inHtmlBreaks ? " <br/>\n" : " \n";
	
	var dumpStr = '', maxVertId = -1;
	var actSeg, firstSeg;
	while ( maxVertId < inSegListArray.length-1 ) {
		maxVertId++;
		var count = inSegListArray.length + 1;		// to prevent endless loop
	
		actSeg = firstSeg = inSegListArray[maxVertId];
		dumpStr += "[";
		do {
			dumpStr += " { x:" + actSeg.vFrom.x + ", y:" + actSeg.vFrom.y + " },";
			if ( actSeg.vFrom.id > maxVertId ) maxVertId = actSeg.vFrom.id;
			actSeg = actSeg.snext;
			count--;
		} while ( ( actSeg != firstSeg ) && ( count > 0 ) );
		
		dumpStr += " ]," + lineBreak;
	}
	return	dumpStr;
}

// random segment sequence -> String
function dumpRandomSequence( inSegListArray ) {
	var logList = inSegListArray.map( function (val) { return val.vFrom.id } );
	return	logList.join(", ");
}

