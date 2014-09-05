
var sourceData = {
    'test array': [ [ [325, 437], [320, 423], [329, 413], [332, 423] ],
				    [ [320.72342, 480], [338.90617, 465.96863], [347.99754, 480.61584], [329.8148, 510.41534], [339.91632, 480.11077], [334.86556, 478.09046] ] ],
    'test object': [ [ { x:325, y:437 }, { x:320, y:423 }, { x:329, y:413 }, { x:332, y:423 } ],
					 [ { x:320.72342, y:480 }, { x:338.90617, y:465.96863 }, { x:347.99754, y:480.61584 }, { x:329.8148, y:510.41534 }, { x:339.91632, y:480.11077 }, { x:334.86556, y:478.09046 } ] ],
};

function to_arr_of_idxs_x_y( inArrOfArrsOfXY, inAsObjXY ) {
	var COORDS_PER_LINE = inAsObjXY ? 4 : 5;
	var resultStrsPolys = [];
	for ( var pIdx = 0; pIdx < inArrOfArrsOfXY.length; pIdx++ ) {
		var resultStrsPolyLines = [];
		var resultStrsPolyCoords = [];
		var x, y;
		var isObj = ( ( typeof inArrOfArrsOfXY[pIdx][0].x ) === 'number' );
		for ( var cIdx = 0; cIdx < inArrOfArrsOfXY[pIdx].length; cIdx++ ) {
			if ( isObj ) {
				x = inArrOfArrsOfXY[pIdx][cIdx].x;
				y = inArrOfArrsOfXY[pIdx][cIdx].y;
			} else {
				x = inArrOfArrsOfXY[pIdx][cIdx][0];
				y = inArrOfArrsOfXY[pIdx][cIdx][1];
			}
			if ( inAsObjXY )	resultStrsPolyCoords.push( '{ x:' + x + ', y:' + y + ' }' )
			else 				resultStrsPolyCoords.push( '[ ' + x + ', ' + y + ' ]' );
			if ( resultStrsPolyCoords.length == COORDS_PER_LINE ) {
				resultStrsPolyLines.push( resultStrsPolyCoords.join(', ') );
				resultStrsPolyCoords = [];
			}
		}
		if ( resultStrsPolyCoords.length > 0 ) {
			resultStrsPolyLines.push( resultStrsPolyCoords.join(', ') );
		}
		resultStrsPolys.push( '[ ' + resultStrsPolyLines.join(",\n") + ' ]' );
	}
	return	'[ ' + resultStrsPolys.join(",\n") + ' ]';
}


for (var dataName in sourceData) {
    var data = sourceData[dataName];

    console.log( '' );
    console.log( '##### ' + dataName + ': as Object #####' );
    console.log( to_arr_of_idxs_x_y( data, true ) );
    
    console.log( '##### ' + dataName + ': as Array #####' );
    console.log( to_arr_of_idxs_x_y( data, false ) );

}

