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

