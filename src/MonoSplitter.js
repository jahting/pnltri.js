/**
 * @author jahting / http://www.ameco.tv/
 *
 *	Algorithm to split a polygon into uni-y-monotone sub-polygons
 *
 *	1) creates a trapezoidation of the main polygon according to Seidel's
 *	   algorithm [Sei91]
 *	2) traverses the trapezoids and uses diagonals as additional segments
 *		to split the main polygon into uni-y-monotone sub-polygons
 */

/** @constructor */
PNLTRI.MonoSplitter = function ( inPolygonData ) {

	this.polyData = inPolygonData;

	this.trapezoider = null;

	// trianglular trapezoid inside the polygon,
	//	from which the monotonization is started
	this.startTrap	= null;

};


PNLTRI.MonoSplitter.prototype = {

	constructor: PNLTRI.MonoSplitter,


	monotonate_trapezoids: function () {					// <<<<<<<<<< public

		// Trapezoidation
		this.trapezoider = new PNLTRI.Trapezoider( this.polyData );
		//	=> one triangular trapezoid which lies inside the polygon
		this.trapezoider.trapezoide_polygon();
		this.startTrap = this.trapezoider.find_first_inside();

		this.create_mono_chains();
//		this.create_mono_chains_OLD();

		// return number of UNIQUE sub-polygons created
		return	this.polyData.normalize_monotone_chains();
	},


	create_mono_chains_OLD: function () {
		// Generate the uni-y-monotone sub-polygons from
		//	the trapezoidation of the polygon.
		this.polyData.initMonoChains();

		var curStart = this.startTrap;
		while (curStart) {
			this.alyTrap(	this.polyData.newMonoChain( curStart.lseg ),
							curStart, null, null, null );
			curStart = this.trapezoider.find_first_inside();
		};
	},


	create_mono_chains: function () {					// private
		var vMap = this.trapezoider.create_visibility_map();
		var myVertices = this.polyData.vertices;		// getVertices();
//		for ( var i=0; i<myVertices.length; i++ ) { myVertices[i].vMap = vMap[i] }

		var i, j, k;
		
		// create segments for diagonals
		var myOutSegs = [];
		for ( i=0; i<myVertices.length; i++ ) {
			var vertFrom = myVertices[i];
			var vertOutSegs = [];
			for ( j=0; j<vMap[i].length; j++ ) {
				var vertTo = myVertices[vMap[i][j]];
//				var newSeg = this.polyData.appendSegmentEntry( {
				vertOutSegs.push( { vFrom: vertFrom, vTo: vertTo, marked: false,
									mprev: null, mnext: null } );
			}
			myOutSegs.push( vertOutSegs );
		}
		
		// link new diagonals together
		var myLastRevSegs = [];
		for ( i=0; i<myVertices.length; i++ ) {
			var fromVertex = myVertices[i];
			for ( j=0; j<myOutSegs[i].length; j++ ) {
				var thisSeg = myOutSegs[i][j];
				if ( myLastRevSegs[i] ) {
					thisSeg.mprev = myLastRevSegs[i];
					myLastRevSegs[i].mnext = thisSeg;
				}
				var revSegs = myOutSegs[thisSeg.vTo.id];
				for ( k=0; k<revSegs.length; k++ ) {
					if ( revSegs[k].vTo == fromVertex )	myLastRevSegs[i] = revSegs[k];
				}
			}
		}

		// Generate the uni-y-monotone sub-polygons from
		//	the trapezoidation of the polygon.
		var mySegments = this.polyData.getSegments();
		var newMono, newMonoTo;
		// populate links for monoChains and vertex.outSegs
		for ( i = 0, j = mySegments.length ; i < j; i++) {
			newMono = mySegments[i];
			if ( this.polyData.PolyLeftArr[newMono.chainId] ) {
				// preserve winding order
				newMono.mprev = newMono.sprev;		// doubly linked list for monotone chains (sub-polygons)
				newMono.mnext = newMono.snext;
				// initial out-going monoChain segment of the vertex (max: 4)
				newMonoTo = newMono.vTo;
//				newMono.vFrom.outSegs.push( {	segOut: newMono,			// -> MonoChainSegment
//												vertTo: newMono.vTo } );	// next vertex: other end of outgoing monoChain segment
			} else {
				// reverse winding order
				newMono = newMono.snext;
				newMono.mprev = newMono.snext;
				newMono.mnext = newMono.sprev;
				newMonoTo = mySegments[i].vFrom;
//				newMono.vFrom.outSegs.push( {	segOut: newMono,
//												vertTo: mySegments[i].vFrom } );
			}
			var toOutSegs = myOutSegs[newMonoTo.id];
			if ( toOutSegs.length > 0 ) {
				toOutSegs[0].mprev = newMono;
				newMono.mnext = toOutSegs[0];
			}
			var fromRevSeg = myLastRevSegs[newMono.vFrom.id];
			if ( fromRevSeg ) {
				fromRevSeg.mnext = newMono;
				newMono.mprev = fromRevSeg;
			}
		}

		for ( i = 0; i < myOutSegs.length; i++ ) {
			for ( j = 0; j < myOutSegs[i].length; j++ ) {
				this.polyData.appendSegmentEntry( myOutSegs[i][j] );
			}
		}

		for ( i = 0, j = mySegments.length; i < j; i++) {
			this.polyData.newMonoChain( mySegments[i] );
		}

	},


	// Splits the current polygon (index: inCurrPoly) into two sub-polygons
	//	using the diagonal (inVertLow, inVertHigh) either from low to high or high to low
	// returns an index to the new sub-polygon
	//
	//	!! public for Mock-Tests only !!

	doSplit: function ( inChain, inVertLow, inVertHigh, inChainLiesToTheLeft ) {				// private
		return this.polyData.splitPolygonChain( inChain, inVertLow, inVertHigh, inChainLiesToTheLeft );
	},

	// In a loop analyses all connected trapezoids for possible splitting diagonals
	//	Inside of the polygon holds:
	//		rseg: always goes upwards
	//		lseg: always goes downwards
	//	This is preserved during the splitting.

	alyTrap: function ( inChain, inTrap, inFromUp, inFromLeft, inOneStep ) {		// private

		var trapQueue = [];
		var thisTrap, fromUp, fromLeft, curChain, newChain;

		function trapList_addItem( inTrap, inFromUp, inFromLeft, inChain ) {
			if ( inTrap )	trapQueue.push( [ inTrap, inFromUp, inFromLeft, inChain ] );
		}

		function trapList_getItem() {
			var trapQItem;
			if ( trapQItem = trapQueue.pop() ) {
				thisTrap = trapQItem[0];
				fromUp	 = trapQItem[1];
				fromLeft = trapQItem[2];
				curChain = trapQItem[3];
				return	true;
			} else	return	false;
		}

		//
		// main function body
		//

		if ( inFromUp == null ) {
			inFromLeft = true;
			if ( inTrap.uL )		inFromUp = true;
			else if ( inTrap.dL )	inFromUp = false;
			else {
				inFromLeft = false;
				if ( inTrap.uR )	inFromUp = true;
				else				inFromUp = false;
			}
		}
		trapList_addItem( inTrap, inFromUp, inFromLeft, inChain );

		while ( trapList_getItem() ) {
			if ( thisTrap.monoDone )	continue;
			thisTrap.monoDone = true;

			if ( !thisTrap.lseg || !thisTrap.rseg ) {
				console.log("ERR alyTrap: lseg/rseg missing", thisTrap);
				return	trapQueue;
			}

			// mirror neighbors into norm-position
			var neighIn, neighSameUD, neighSameLR, neighAcross;
			if ( fromUp ) {
				if ( fromLeft ) {
					neighIn = thisTrap.uL;
					neighSameUD = thisTrap.uR;
					neighSameLR = thisTrap.dL;
					neighAcross = thisTrap.dR;
				} else {
					neighIn = thisTrap.uR;
					neighSameUD = thisTrap.uL;
					neighSameLR = thisTrap.dR;
					neighAcross = thisTrap.dL;
				}
			} else {
				if ( fromLeft ) {
					neighIn = thisTrap.dL;
					neighSameUD = thisTrap.dR;
					neighSameLR = thisTrap.uL;
					neighAcross = thisTrap.uR;
				} else {
					neighIn = thisTrap.dR;
					neighSameUD = thisTrap.dL;
					neighSameLR = thisTrap.uR;
					neighAcross = thisTrap.uL;
				}
			}

			if ( neighSameUD || neighAcross ) {
				// TM|BM: TM_BM, TM_BL, TL_BM, TM_BR, TR_BM, TLR_BM, TM_BLR; TL_BR, TR_BL
				// console.log( "2 neighbors on at least one side or 1 neighbor on each with vHigh and vLow on different L/R-sides => split" );
				newChain = this.doSplit( curChain, thisTrap.vLow, thisTrap.vHigh, fromLeft );
			// } else {
				// TL_BL, TR_BR; degenerate cases (triangle trapezoid): TLR_BL, TLR_BR; TL_BLR, TR_BLR
				// console.log( "1 neighbor on in-Side, 1 on same L/R-side or none on the other => no split possible" );
			}

			trapList_addItem( neighAcross,  fromUp, !fromLeft, newChain );
			trapList_addItem( neighSameUD, !fromUp, !fromLeft, newChain );
			trapList_addItem( neighSameLR,  fromUp,  fromLeft, curChain );

			if ( !neighSameLR && !neighAcross ) {
				// TLR_BL, TLR_BR; TL_BLR, TR_BLR,    TLR_BM, TM_BLR
				// console.log( "degenerate case: triangle (cusp), 1 or 2 neighbors on in-side, nothing on the other side" );
				//	could be start triangle -> visit IN-neighbor in any case !
				trapList_addItem( neighIn, !fromUp, fromLeft, curChain );
			}

			if ( inOneStep )	return trapQueue;
		}
/*		// temporarily monoChains can contain the same point twice
		//	usually when merging separate polygon chains (e.g. contour and hole)
		// but in the end no monoChain may contain a vertex twice (could not be monotone)
		var checkResult;
		if ( checkResult = this.polyData.check_monoChains_noDoublePts() ) {
			console.log("alyTrap: " + checkResult );
		}		*/

		return	[];
	},

};

