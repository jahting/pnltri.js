/**
 * @author jahting / http://www.ameco.tv/
 */

PNLTRI.Math = {

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


	vectorLength: function (v0) {
		return	Math.sqrt( v0.x * v0.x + v0.y * v0.y );
	},
	dotProd: function (v0, v1) {
		// DOT: cos(theta) * len(v0) * len(v1)
		return	( v0.x * v1.x + v0.y * v1.y );
	},
	crossProd: function (v0, v1) {
		// CROSS_SINE: sin(theta) * len(v0) * len(v1)
		return	( v0.x * v1.y - v1.x * v0.y );
		// == 0: colinear (theta == 0 or 180 deg == PI rad)
		// > 0:  v1 lies left of v0, CCW angle from v0 to v1 is convex ( < 180 deg )
		// < 0:  v1 lies right of v0, CW angle from v0 to v1 is convex ( < 180 deg )
	},
	
	// monotone mapping of the CCW angle between the two vectors:
	//	inPtVertex->inPtFrom and inPtVertex->inPtTo
	//  from 0..360 degrees onto the range of 0..4
	//		0..90 -> 0..1, 90..180 -> 1..2, ...
	// result-curve (looking like an upward stair/wave) is:
	//	  0 to 180 deg: 1 - cos(theta)
	//  180 to 360 deg: 2 + cos(theta)    (same shape as for 0-180 but pushed up)

	mapAngle: function ( inPtVertex, inPtFrom, inPtTo ) {
	
		var v0 = {	x: inPtFrom.x - inPtVertex.x,			// Vector inPtVertex->inPtFrom
					y: inPtFrom.y - inPtVertex.y }
		var v1 = {	x: inPtTo.x - inPtVertex.x,				// Vector inPtVertex->inPtTo
					y: inPtTo.y - inPtVertex.y }
		var cosine = PNLTRI.Math.dotProd(v0, v1) / PNLTRI.Math.vectorLength(v0) / PNLTRI.Math.vectorLength(v1);
																		// CCW angle from inPtVertex->inPtFrom
		if ( PNLTRI.Math.crossProd(v0, v1) >= 0 )	return 1-cosine;	// to inPtTo <= 180 deg. (convex, to the left)
		else										return 3+cosine;	// to inPtTo > 180 deg. (concave, to the right)
	},


	//	like compare (<=>)
	//		yA > yB resp. xA > xB: 1, equal: 0, otherwise: -1
	compare_pts_yx: function ( inPtA, inPtB ) {
		var deltaY = inPtA.y - inPtB.y;
		if ( deltaY < PNLTRI.Math.EPSILON_N ) {
			return -1;
		} else if ( deltaY > PNLTRI.Math.EPSILON_P ) {
			return 1;
		} else {
			var deltaX = inPtA.x - inPtB.x;
			if ( deltaX < PNLTRI.Math.EPSILON_N ) {
				return -1;
			} else if ( deltaX > PNLTRI.Math.EPSILON_P ) {
				return  1;
			} else {
				return  0;
			}
		}
	},


}

// precision of floating point arithmetic
//	PNLTRI.Math.EPSILON_P = Math.pow(2,-32);	// ~ 0.0000000001
	PNLTRI.Math.EPSILON_P = Math.pow(2,-43);	// ~ 0.0000000000001
	PNLTRI.Math.EPSILON_N = -PNLTRI.Math.EPSILON_P;

//	Problem with EPSILON-compares:
//	- especially when there is a x-coordinate ordering on equal y-coordinates
//		=> either NO EPSILON-compares on y-coordinates, since almost equal y
//			can have very different x - so they are not nearly close
//		or EPSILON must be bigger: Solution so far.
