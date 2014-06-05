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

// for splitting trapezoids
PNLTRI.TRAP_NOSPLIT = -1;	// no diagonal

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
		this.startTrap = this.trapezoider.trapezoide_polygon();
		//	precompute additional fields (temporary)
		this.trapezoider.update_trapezoids();
				
		// Generate the uni-y-monotone sub-polygons from
		//	the trapezoidation of the polygon.
		//	!!  for the start triangle trapezoid it doesn't matter
		//	!!	from where we claim to enter it
		this.polyData.initMonoChains();
		this.alyTrap( 0, this.startTrap, null, null, null );

		// return number of UNIQUE sub-polygons created
		return	this.polyData.normalize_monotone_chains();
	},

	
	// Splits the current polygon (index: inCurrPoly) into two sub-polygons
	//	using the diagonal (inVertLow, inVertHigh) either from low to high or high to low
	// returns an index to the new sub-polygon
	//
	//	!! public for Mock-Tests only !!

	doSplit: function ( inChain, inVertLow, inVertHigh, inLow2High ) {
		if ( inLow2High ) {
			return this.polyData.splitPolygonChain( inChain, inVertLow, inVertHigh );
		} else {
			return this.polyData.splitPolygonChain( inChain, inVertHigh, inVertLow );
		}
	},

	// In a loop analyses all connected trapezoids for possible splitting diagonals
	//	Inside of the polygon holds:
	//		rseg: always goes upwards
	//		lseg: always goes downwards
	//	This is preserved during the splitting.
		
	alyTrap: function ( inChain, inTrap, inDirection, inFromLeft, inOneStep ) {
		var trapQueue = [], trapQItem = [];
		
		function trapList_addItems( inNewItems ) {
			for (var i=inNewItems.length-1; i>=0; i--) {
				trapQueue.unshift( inNewItems[i] );
			}
		}
		
		function trapList_getItem() {
			return	trapQueue.shift();
		}
		
		if ( inDirection == null ) {
			inFromLeft = true;
			if ( inTrap.u0 )		inDirection = true;
			else if ( inTrap.d0 )	inDirection = false;
			else {
				inFromLeft = false;
				if ( inTrap.u1 )	inDirection = true;
				else				inDirection = false;
			}
		}
		trapList_addItems( [ [ inTrap, inDirection, inFromLeft, inChain ] ] );
		
		while ( trapQItem = trapList_getItem() ) {
			var thisTrap;
			if ( ( thisTrap = trapQItem[0] ) && !thisTrap.monoDiag ) {
			
				if ( !thisTrap.lseg || !thisTrap.rseg ) {
					console.log("ERR alyTrap: lseg/rseg missing", thisTrap);
					thisTrap.monoDiag = PNLTRI.TRAP_NOSPLIT;
					return	trapQueue;
				}
				
				var fromUp = trapQItem[1];
				var fromLeft = trapQItem[2];
				var curChain = trapQItem[3], newChain;
				
				
				var vHigh = thisTrap.hiVert;
				var vLow = thisTrap.loVert;

				var dblOnUp = null;
				var dblSideL, dblSideR;
				if ( thisTrap.topLoc == PNLTRI.TRAP_MIDDLE ) {
					dblOnUp = true;			// double-Side is UP-side
					dblSideL = thisTrap.u0;
					dblSideR = thisTrap.u1;
				}
				if ( thisTrap.botLoc == PNLTRI.TRAP_MIDDLE ) {
					dblOnUp = false;		// double-Side is DN-side
					dblSideL = thisTrap.d0;
					dblSideR = thisTrap.d1;
				}
				var sglSide, sglLeft;

				thisTrap.monoDiag = 1 + 4*thisTrap.topLoc + thisTrap.botLoc;
				
				if ( dblOnUp != null ) {
					// TM|BM: 2 neighbors on at least one side
					
					// first, degenerate case: triangle trapezoid
					if ( ( thisTrap.topLoc == PNLTRI.TRAP_CUSP ) || ( thisTrap.botLoc == PNLTRI.TRAP_CUSP ) ) {
						// TLR_BM, TM_BLR
						// console.log( "triangle (cusp), 2 neighbors on in-side; from " + ( fromLeft ? "left(u0/d0)" : "right(u1/d1)" ) );
						//	could be start triangle -> visit ALL neighbors, no optimization !
						newChain = this.doSplit( curChain, vLow, vHigh, fromLeft );
						trapList_addItems(  [ [ ( fromLeft ? dblSideL : dblSideR ), !fromUp, fromLeft, curChain ],
											  [ ( fromLeft ? dblSideR : dblSideL ), !fromUp, !fromLeft, newChain ] ] );
					// second: trapezoid with 4 (max) neighbors
					} else if ( ( thisTrap.topLoc == PNLTRI.TRAP_MIDDLE ) && ( thisTrap.botLoc == PNLTRI.TRAP_MIDDLE ) ) {
						// TM_BM
						// console.log( "2 trapezoids above & 2 below; from " + ( fromLeft ? "left(u0/d0)" : "right(u1/d1)" ) );
						newChain = this.doSplit( curChain, vLow, vHigh, fromLeft );
						if ( !fromLeft ) {
							var tmp = newChain;
							newChain = curChain;
							curChain = tmp;
						}
						trapList_addItems(  [ [ thisTrap.u0, false, true, curChain ],
											  [ thisTrap.d0, true, true, curChain ],
											  [ thisTrap.u1, false, false, newChain ],
											  [ thisTrap.d1, true, false, newChain ] ] );
					// third: one side with two neighbors
					} else {
						// 2 trapezoids on one side (extern cusp) & 1 on the other side
						if ( dblOnUp ) {
							// 2 trapezoids above, 1 below, sglLeft: loVert to the left?
							sglSide = thisTrap.d0 ? thisTrap.d0 : thisTrap.d1;
							sglLeft = ( thisTrap.botLoc == PNLTRI.TRAP_LEFT );
						} else {
							// 1 trapezoid above, 2 below, sglLeft: hiVert to the left?
							sglSide = thisTrap.u0 ? thisTrap.u0 : thisTrap.u1;
							sglLeft = ( thisTrap.topLoc == PNLTRI.TRAP_LEFT );
						}
						if ( ( fromUp == dblOnUp ) && ( fromLeft == sglLeft ) ) {
							// TM_BL(from UP-left), TL_BM(from DN-left), TM_BR(from UP-right), TR_BM(from DN-right)
							// console.log( "2 neighbors on in-side, 1 on the other with y-point on same l/r-side where we come in." );
							curChain = this.doSplit( curChain, vLow, vHigh, sglLeft );
						} else {
							// TM_BL(from UP-right, DN), TL_BM(from UP, DN-right), TM_BR(from UP-left, DN), TR_BM(from UP, DN-left)
							// console.log( "2 neighbors on one and 1 on the other side, coming from single-side or on double-side not from the l/r-side with the y-point on single-side" );
							newChain = this.doSplit( curChain, vLow, vHigh, !sglLeft );
							trapList_addItems(  [ [ ( sglLeft ? dblSideL : dblSideR ), !dblOnUp, sglLeft, newChain ] ] );
						}
						trapList_addItems(	[ [ ( sglLeft ? dblSideR : dblSideL ), !dblOnUp, !sglLeft, curChain ],
											  [ sglSide, dblOnUp, !sglLeft, curChain ] ] );
					}
				} else {	// ( dblOnUp == null )
					// at most 1 neighbor on any side
					var toUp;
					// first, degenerate case: triangle trapezoid
					if ( ( thisTrap.topLoc == PNLTRI.TRAP_CUSP ) || ( thisTrap.botLoc == PNLTRI.TRAP_CUSP ) ) {
						// triangle (cusp): only one neighbor on in-side, nothing on the other side => no diagonal
						//	could be start triangle -> visit neighbor in any case !
						
						// TLR_BL, TLR_BR; TL_BLR, TR_BLR
						// console.log( "triangle (cusp), one neighbor on in-side; no split possible" );
						thisTrap.monoDiag = PNLTRI.TRAP_NOSPLIT;
						toUp = fromUp;		// going back
					// fourth: both sides with one neighbor
					} else {
						// 1 trapezoid above, 1 below
						if ( thisTrap.topLoc == thisTrap.botLoc ) {		// same side => no diag
							// TL_BL, TR_BR
							// console.log( "1 trapezoid above, 1 below; no split possible" );
							thisTrap.monoDiag = PNLTRI.TRAP_NOSPLIT;
						} else {
							if ( thisTrap.topLoc == PNLTRI.TRAP_LEFT ) {		// && botLoc == RIGHT
								// TL_BR, !fromLeft !!
								// console.log( "1 trapezoid above, 1 below; " + ( fromUp ? "hiVert(left)->loVert(right) (in from above)" : "loVert(right)->hiVert(left) (in from below)" ) );
								curChain = this.doSplit( curChain, vLow, vHigh, !fromUp );
							} else {				// topLoc == RIGHT && botLoc == LEFT
								// TR_BL, fromLeft !!
								// console.log( "1 trapezoid above, 1 below; " + ( fromUp ? "loVert(left)->hiVert(right) (in from above)" : "hiVert(right)->loVert(left) (in from below)" ) );
								curChain = this.doSplit( curChain, vLow, vHigh, fromUp );
							}
						}
						toUp = !fromUp;		// going to other side
					}
					if ( toUp ) {
						sglSide = thisTrap.u0 ? thisTrap.u0 : thisTrap.u1;
						sglLeft = ( thisTrap.topLoc == PNLTRI.TRAP_LEFT );
					} else {
						sglSide = thisTrap.d0 ? thisTrap.d0 : thisTrap.d1;
						sglLeft = ( thisTrap.botLoc == PNLTRI.TRAP_LEFT );
					}
					trapList_addItems(	[ [ sglSide, !toUp, !sglLeft, curChain ] ] );
				}	// end ( dblOnUp == null )
				
			}

			if ( inOneStep )	return trapQueue;
		}
		return	[];
	},

};

