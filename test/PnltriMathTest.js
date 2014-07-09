/**
 * @author jahting / http://www.ameco.tv/
 */

/*	Base class extensions - for testing only */
	
PNLTRI.Math.random_seed = 1;

PNLTRI.Math.myRandom = function ( inSeed ) {
	if ( inSeed ) { this.random_seed = inSeed }
	var rand = Math.abs(Math.sin(this.random_seed++)) * 10000;
	return	rand - Math.floor(rand);
}


PNLTRI.Math.randomTestSetup = function () {
	this.myRandom( 73 );
	this.random = this.myRandom;
}


PNLTRI.Math.random_array_iterator = function ( inArray ) {

	var permute = this.array_shuffle( inArray );
	var next_elem = 0;

	return	function () {
		return	permute[next_elem++];
	}
}

// #############################################################################

function test_random_with_seed() {

	function equal_on_x_digits( inDaten, inExpected, inStellen ) {
		if (!inDaten)	return	false;
		var faktor = Math.pow(10, inStellen);
		for (var i=0; i < inDaten.length; i++) {
			if ( Math.round(inDaten[i] * faktor) != inExpected[i] )	{
				console.log( "expected: " + inExpected[i] + ", got: " + Math.round(inDaten[i] * faktor) );
				return	false;
			}
		}
		return	true;
	}

	function test_different_seeds() {
		// compare rounded results - on 10 digits
		if (! equal_on_x_digits(	[ PNLTRI.Math.myRandom( 5 ), PNLTRI.Math.myRandom( 27 ), PNLTRI.Math.myRandom( 19 ), PNLTRI.Math.myRandom( 11 ), PNLTRI.Math.myRandom( 14791 ) ],
									[ 2427466314, 7592840450, 7720966295, 9020655070, 7930649786 ], 10 ))	return	false;
		
		return	true;
	}
	
	function test_seed_sequence() {
		// compare rounded results - on 10 digits
		if (! equal_on_x_digits(	[ PNLTRI.Math.myRandom( 73 ), PNLTRI.Math.myRandom(), PNLTRI.Math.myRandom(), PNLTRI.Math.myRandom(), PNLTRI.Math.myRandom(), PNLTRI.Math.myRandom() ],
									[ 7195688731, 4626046825, 8163540943, 763689818, 2015858073, 7845598754 ], 10 ))	return	false;
		
		return	true;
	}
	
	test( "Pseudorandom with Seed", function() {
		ok( test_different_seeds(), "different seeds" );
		ok( test_seed_sequence(), "sequence for a seed" );
	});
}

// #############################################################################

function test_array_shuffle() {

	test( "Array Shuffle", function() {
		PNLTRI.Math.random = PNLTRI.Math.myRandom;
		var array_to_shuffle = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
		PNLTRI.Math.myRandom( 73 );
		deepEqual(	PNLTRI.Math.array_shuffle( array_to_shuffle.slice(0) ),
				[ 7, 6, 3, 4, 9, 10, 2, 1, 8, 5 ], "Shuffle(73)" );
		PNLTRI.Math.myRandom( 97 );
		deepEqual(	PNLTRI.Math.array_shuffle( array_to_shuffle.slice(0) ),
				[ 3, 4, 8, 10, 5, 7, 2, 6, 1, 9 ], "Shuffle(97)" );
	});
}
		
function compute_array_shuffle( inResultTarget ) {
	PNLTRI.Math.random = Math.random;
	var array_to_shuffle = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
	var result = PNLTRI.Math.array_shuffle( array_to_shuffle.slice(0) );
	var expectedStr = "really random";
	var resultStr;
	if ( result ) {
		resultStr	= "[ " + result.join(", ") + " ]";
	} else {
		resultStr	= "NO random Array!";
	}
	//
	if ( inResultTarget ) {
		inResultTarget.innerHTML = "expected: " + expectedStr + "<br/>result: " + resultStr;
	} else {
		alert( "Random-Array:\n" + "expected: " + expectedStr + "\nresult: " + resultStr );
	}
}


function test_array_shuffle_iterator() {

	test( "Array Shuffle Iterator", function() {
		PNLTRI.Math.random = PNLTRI.Math.myRandom;
		var iterator, next, result,
			array_to_shuffle = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
		PNLTRI.Math.myRandom( 73 );
		iterator = PNLTRI.Math.random_array_iterator( array_to_shuffle.slice(0) );
		result = [];
		while ( next = iterator() ) { result.push( next ) }
		deepEqual(	result, [ 7, 6, 3, 4, 9, 10, 2, 1, 8, 5 ], "Shuffle(73)" );
		PNLTRI.Math.myRandom( 97 );
		iterator = PNLTRI.Math.random_array_iterator( array_to_shuffle.slice(0) );
		result = [];
		while ( next = iterator() ) { result.push( next ) }
		deepEqual(	result, [ 3, 4, 8, 10, 5, 7, 2, 6, 1, 9 ], "Shuffle(97)" );
	});
}		

function compute_array_shuffle_iterator( inResultTarget ) {
	PNLTRI.Math.random = Math.random;
	var array_to_shuffle = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
	var iterator = PNLTRI.Math.random_array_iterator( array_to_shuffle.slice(0) );
	var result = [];
	for (var i=0; i < 5; i++ ) { result.push( iterator() ) }
	var expectedStr = "really random";
	var resultStr;
	if ( result ) {
		resultStr	= "[ " + result.join(", ") + " ]";
	} else {
		resultStr	= "NO random Array!";
	}
	//
	if ( inResultTarget ) {
		inResultTarget.innerHTML = "expected: " + expectedStr + "<br/>result: " + resultStr;
	} else {
		alert( "Random-Array:\n" + "expected: " + expectedStr + "\nresult: " + resultStr );
	}
}


// #############################################################################


function test_PnlTri_Math() {

	function test_compare_pts_yx() {
		// A > B
		var result = PNLTRI.Math.compare_pts_yx( { x:30, y:22 }, { x:20, y:20 } );
		equal( result,  1, "A>B, wg. Y" );
		var result = PNLTRI.Math.compare_pts_yx( { x:30, y:20 }, { x:20, y:20 } );
		equal( result,  1, "A>B, wg. X" );
		// A < B
		var result = PNLTRI.Math.compare_pts_yx( { x:20, y:20 }, { x:30, y:22 } );
		equal( result, -1, "A<B, wg. Y" );
		var result = PNLTRI.Math.compare_pts_yx( { x:20, y:20 }, { x:30, y:20 } );
		equal( result, -1, "A<B, wg. X" );
		var result = PNLTRI.Math.compare_pts_yx( { x:20, y:20 }, { x:20.000000000101, y:20 } );
		equal( result, -1, "A<B, wg. X, trotz EPS" );
		// A == B
		var result = PNLTRI.Math.compare_pts_yx( { x:20, y:20 }, { x:20, y:20 } );
		equal( result,  0, "A==B" );
		var result = PNLTRI.Math.compare_pts_yx( { x:20, y:20 }, { x:20, y:20 + PNLTRI.Math.EPSILON_P * 0.8 } );
		equal( result,  0, "A==B, trotz Y" );
		var result = PNLTRI.Math.compare_pts_yx( { x:20, y:20 }, { x:20 + PNLTRI.Math.EPSILON_P * 0.8, y:20 } );
		equal( result,  0, "A==B, trotz X" );
		// complex 3-way comparisons - Assumption: all Y are equal because of EPS
		//  if Error: EPS with Lexicographic ordering leads to wrong result !!
		var coordLow	= { x: 101, y: 100.40000000000002 };
		var coordHigh = { x: 104, y: 100.39999999999998 };
		var coordMiddle	= { x: 102, y: 100.4 };
		var result = PNLTRI.Math.compare_pts_yx( coordHigh, coordMiddle );
		equal( result, 1, "High > Middle" );
		var result = PNLTRI.Math.compare_pts_yx( coordHigh, coordLow );
		equal( result, 1, "High > Low" );
		var result = PNLTRI.Math.compare_pts_yx( coordMiddle, coordLow );
		equal( result, 1, "Middle > Low" );
	}

	function test_mapAngle() {
		equal( PNLTRI.Math.vectorLength( { x:3, y:4 } ), 5, "vectorLength: 3,4" );
		//
		equal( PNLTRI.Math.vectorLength( { x:0, y:6 } ), 6, "vectorLength: 0,6" );
		equal( PNLTRI.Math.dotProd( { x:0, y:6 }, { x:-5.5, y:1 } ), 6, "dotProd: 0,6 -5.5,1" );
		equal( PNLTRI.Math.crossProd( { x:0, y:6 }, { x:-5.5, y:1 } ), 33, "crossProd: 0,6 -5.5,1" );
		equal( PNLTRI.Math.mapAngle( { x:6, y:0 }, { x:6, y:6 }, { x:0.5, y:1 } ), 0.8211145618000169, "mapAngle: 6,0 6,6 0.5,1" );
		//
		equal( PNLTRI.Math.dotProd( { x:0.5, y:1 }, { x:5.5, y:-1 } ), 1.75, "dotProd: 0.5,1 5.5,-1" );
		equal( PNLTRI.Math.crossProd( { x:0.5, y:1 }, { x:5.5, y:-1 } ), -6, "crossProd: 0.5,1 5.5,-1" );
		equal( PNLTRI.Math.mapAngle( { x:0.5, y:1 }, { x:1, y:2 }, { x:6, y:0 } ), 3.28, "mapAngle: 0.5,1 1,2 6,0" );
	
		//
		equal( PNLTRI.Math.crossProd( { x:1, y:-0.5 }, { x:4, y:0.5 } ), 2.5, "crossProd: 1,-0.5 4,0.5" );
		equal( PNLTRI.Math.mapAngle( { x:1, y:2 }, { x:2, y:1.5 }, { x:5, y:2.5 } ), 0.16794970566215628, "mapAngle: 1,2 2,1.5 5,2.5" );
		//
		equal( PNLTRI.Math.crossProd( { x:-2, y:0.5 }, { x:-4, y:-0.5 } ), 3, "crossProd: -2,0.5 -4,-0.5" );
		equal( PNLTRI.Math.mapAngle( { x:5, y:2.5 }, { x:3, y:3 }, { x:1, y:2 } ), 0.0674319017259104, "mapAngle: 5,2.5 3,3 1,2" );
	
		//
		equal( PNLTRI.Math.crossProd( { x:0, y:-1 }, { x:-4.5, y:0.5 } ), -4.5, "crossProd: 0,-1 -4.5,0.5" );
		equal( PNLTRI.Math.mapAngle( { x:5, y:3.5 }, { x:5, y:2.5 }, { x:0.5, y:4 } ), 2.8895684739251535, "mapAngle: 5,3.5 5,2.5 0.5,4" );
		//
		equal( PNLTRI.Math.crossProd( { x:0.5, y:1 }, { x:4.5, y:-0.5 } ), -4.75, "crossProd: 0.5,1 4.5,-0.5" );
		equal( PNLTRI.Math.mapAngle( { x:0.5, y:4 }, { x:1, y:5 }, { x:5, y:3.5 } ), 3.3457053588273564, "mapAngle: 0.5,4 1,5 5,3.5" );
	
		//
		equal( PNLTRI.Math.crossProd( { x:1, y:-0.5 }, { x:-1, y:1 } ), 0.5, "crossProd: 1,-0.5 -1,1" );
		equal( PNLTRI.Math.mapAngle( { x:1, y:5 }, { x:2, y:4.5 }, { x:0, y:6 } ), 1.9486832980505138, "mapAngle: 1,5 2,4.5 0,6" );
		//
		equal( PNLTRI.Math.crossProd( { x:0, y:-6 }, { x:1, y:-1 } ), 6, "crossProd: 0,-6 1,-1" );
		equal( PNLTRI.Math.mapAngle( { x:0, y:6 }, { x:0, y:0 }, { x:1, y:5 } ), 0.29289321881345254, "mapAngle: 0,6 0,0 1,5" );
	}

	test( "PnlTri.Math", function() {
		test_compare_pts_yx();
		test_mapAngle();
	});
}

