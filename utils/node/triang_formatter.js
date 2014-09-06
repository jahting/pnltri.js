
var TUPLE_SIZE = 2;

var sourceData = {
    'test array': [ [320.72342, 480], [338.90617, 465.96863], [347.99754, 480.61584], [329.8148, 510.41534], [339.91632, 480.11077], [334.86556, 478.09046] ]
};

function to_arr_of_N_tuples( inArrOfArrs ) {
	var resultStrLines = [];
	var resultStrTuple = [];
	for ( var idx = 0; idx < inArrOfArrs.length; idx++ ) {
		resultStrTuple.push( '[ ' + inArrOfArrs[idx].join(', ')+ ' ]' );
		if ( resultStrTuple.length == TUPLE_SIZE ) {
			resultStrLines.push( resultStrTuple.join(', ') );
			resultStrTuple = [];
		}
	}
	if ( resultStrTuple.length > 0 ) {
		resultStrLines.push( resultStrTuple.join(', ') );
	}
	return	'[ ' + resultStrLines.join(",\n") + ' ]';
}


for (var dataName in sourceData) {
    var data = sourceData[dataName];

    console.log( '' );
    console.log( '##### ' + dataName + ': as Tuple ' + TUPLE_SIZE + ' Array #####' );
    console.log( to_arr_of_N_tuples( data ) );

}

