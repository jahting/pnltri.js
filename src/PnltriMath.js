/**
 * @author jahting / http://www.ameco.tv/
 */

PNLTRI.Math = {

	log2: function ( inNum ) {
		// return	Math.log2(inNum);			// not everywhere defined !!
		return	Math.log(inNum)/Math.LN2;
	},

	random: Math.random,		// function to use for random number generation

	// generate random ordering in place:
	//	Fisher-Yates shuffle
	array_shuffle: function( inoutArray ) {
		for (var i = inoutArray.length - 1; i > 0; i-- ) {
			var j = Math.floor( PNLTRI.Math.random() * (i+1) );
			var tmp = inoutArray[i];
			inoutArray[i] = inoutArray[j];
			inoutArray[j] = tmp;
		}
		return	inoutArray;
	},

	ptsCrossProd: function ( inPtVertex, inPtFrom, inPtTo ) {
		// two vectors: ( inPtVertex -> inPtFrom ), ( inPtVertex -> inPtTo )
		return	( inPtFrom.x - inPtVertex.x ) * ( inPtTo.y - inPtVertex.y ) -
				( inPtFrom.y - inPtVertex.y ) * ( inPtTo.x - inPtVertex.x );
		// <=> crossProd( inPtFrom-inPtVertex, inPtTo-inPtVertex )
		// == 0: colinear (angle == 0 or 180 deg == PI rad)
		// > 0:  v lies left of u
		// < 0:  v lies right of u
	},

}

// maximal absolute allowed value for x and y coordinates
	PNLTRI.Math.INFINITY = 1<<30;

// precision of floating point arithmetic
//	PNLTRI.Math.EPSILON_P = 0.000000000000001;	three_error#1: Error
	PNLTRI.Math.EPSILON_P = 0.00000000000001;
	PNLTRI.Math.EPSILON_N = -PNLTRI.Math.EPSILON_P;


