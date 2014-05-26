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

// for traverse-direction
PNLTRI.FRUP = 1;
PNLTRI.FRDN = 2;

// for splitting trapezoids
//  on which segment lie the points defining the top and bottom y-line?
PNLTRI.TRAP_NOSPLIT = -1;	// no diagonal
PNLTRI.TRAP_TL_BR = 1;		// top-left, bottom-right
PNLTRI.TRAP_TR_BL = 2;		// top-right, bottom-left
PNLTRI.TRAP_TL_BM = 3;		// top-left, bottom-middle
PNLTRI.TRAP_TR_BM = 4;		// top-right, bottom-middle
PNLTRI.TRAP_TM_BL = 5;		// top-middle, bottom-left
PNLTRI.TRAP_TM_BR = 6;		// top-middle, bottom-right
PNLTRI.TRAP_TM_BM = 7;		// top-middle, bottom-middle
PNLTRI.TRAP_TLR_BM = 8;		// top-cusp, bottom-middle
PNLTRI.TRAP_TM_BLR = 9;		// top-middle, bottom-cusp


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
				
		// Generate the uni-y-monotone sub-polygons from
		//	the trapezoidation of the polygon.
		//	!!  for the start triangle trapezoid it doesn't matter
		//	!!	from where we claim to enter it
		this.polyData.initMonoChains();
		this.alyTrap( 0, this.startTrap, null, PNLTRI.FRUP );

		// return number of UNIQUE sub-polygons created
		return	this.polyData.normalize_monotone_chains();
	},

	
	// Splits the current polygon (index: inCurrPoly) into two sub-polygons
	//	using the diagonal (inVert0, inVert1)
	// returns an index to the new sub-polygon
	//
	// ! this is a separate method only to allow easy MOCKING !

	doSplit: function ( inCurrPoly, inVert0, inVert1 ) {
	 	return this.polyData.splitPolygonChain( inCurrPoly, inVert0, inVert1 );
	},

	// Recursively analyses all the trapezoids for possible splitting diagonals
	//	Inside of the polygon holds:
	//		rseg: always goes upwards
	//		lseg: always goes downwards
	//	This is preserved during the splitting.
		
	alyTrap: function ( mcur, thisTrap, fromTrap, inDirection ) {

		var mnew, v0, v1;
		
		if ( !thisTrap || thisTrap.monoDiag ) 		return;
		
		if ( !thisTrap.lseg || !thisTrap.rseg ) {
			console.log("ERR alyTrap: lseg/rseg missing", thisTrap);
			thisTrap.monoDiag = PNLTRI.TRAP_NOSPLIT;
			return;
		}
		
		// first degenerate cases: triangle trapezoids
		if ( !thisTrap.u0 && !thisTrap.u1 ) {
			// nothing above
			// could be start triangle -> visit ALL neighbors, no optimization !
			if ( thisTrap.d0 && thisTrap.d1 ) {
				// triangle (cusp up), two neighbors below
				v0 = thisTrap.d1.lseg.vFrom;
				v1 = thisTrap.lseg.vFrom;
				thisTrap.monoDiag = PNLTRI.TRAP_TLR_BM;
				if ( fromTrap == thisTrap.d1 ) {
					// TLR_BM(from DN-right)
					// console.log( "triangle (cusp up), two neighbors below; from right(d1)" );
					mnew = this.doSplit(mcur, v1, v0);
					this.alyTrap(mcur, thisTrap.d1, thisTrap, PNLTRI.FRUP);
					this.alyTrap(mnew, thisTrap.d0, thisTrap, PNLTRI.FRUP);
				} else {
					// TLR_BM(from DN-left)
					// console.log( "triangle (cusp up), two neighbors below; from left(d0)" );
					mnew = this.doSplit(mcur, v0, v1);
					this.alyTrap(mcur, thisTrap.d0, thisTrap, PNLTRI.FRUP);
					this.alyTrap(mnew, thisTrap.d1, thisTrap, PNLTRI.FRUP);
				}
			} else {
				// only one neighbor below => no diagonal
				// TLR_BL, TLR_BR
				// console.log( "triangle (cusp up), one neighbor below; no split possible" );
				thisTrap.monoDiag = PNLTRI.TRAP_NOSPLIT;
				this.alyTrap( mcur, thisTrap.d0, thisTrap, PNLTRI.FRUP );
				this.alyTrap( mcur, thisTrap.d1, thisTrap, PNLTRI.FRUP );
			}
		} else if ( !thisTrap.d0 && !thisTrap.d1 ) {
			// nothing below, and at least one above
			// could be start triangle -> visit ALL neighbors, no optimization !
			if ( thisTrap.u0 && thisTrap.u1 ) {
				// triangle (cusp down), two neighbors above
				// could be start triangle -> go to ALL neighbors, not optimization
				v0 = thisTrap.rseg.vFrom;
				v1 = thisTrap.u0.rseg.vFrom;
				thisTrap.monoDiag = PNLTRI.TRAP_TM_BLR;
				if ( fromTrap == thisTrap.u1 ) {
					// TM_BLR(from UP-right)
					// console.log( "triangle (cusp down), two neighbors above; from right(u1)" );
					mnew = this.doSplit(mcur, v1, v0);
					this.alyTrap(mcur, thisTrap.u1, thisTrap, PNLTRI.FRDN);
					this.alyTrap(mnew, thisTrap.u0, thisTrap, PNLTRI.FRDN);
				} else {
					// TM_BLR(from UP-left)
					// console.log( "triangle (cusp down), two neighbors above; from left(u0)" );
					mnew = this.doSplit(mcur, v0, v1);
					this.alyTrap(mcur, thisTrap.u0, thisTrap, PNLTRI.FRDN);
					this.alyTrap(mnew, thisTrap.u1, thisTrap, PNLTRI.FRDN);
				}
			} else {
				// only one neighbor above => no diagonal
				// TL_BLR, TR_BLR
				// console.log( "triangle (cusp down), one neighbor above; no split possible" );
				thisTrap.monoDiag = PNLTRI.TRAP_NOSPLIT;
				this.alyTrap( mcur, thisTrap.u0, thisTrap, PNLTRI.FRDN );
				this.alyTrap( mcur, thisTrap.u1, thisTrap, PNLTRI.FRDN );
			}
		// second: real trapezoids
		} else if ( thisTrap.u0 && thisTrap.u1 ) {
			// 2 trapezoids above, and at least one below
			if ( thisTrap.d0 && thisTrap.d1 ) {
				//	2 trapezoids above, and 2 below:
				//	downward cusp above + upward cusp below
				v0 = thisTrap.d1.lseg.vFrom;
				v1 = thisTrap.u0.rseg.vFrom;
				thisTrap.monoDiag = PNLTRI.TRAP_TM_BM;
				if ( ( ( inDirection == PNLTRI.FRDN ) && ( thisTrap.d1 == fromTrap ) ) ||
					 ( ( inDirection == PNLTRI.FRUP ) && ( thisTrap.u1 == fromTrap ) ) ) {
					// TM_BM(from UP-right, DN-right)
					// console.log( "2 trapezoids above, and 2 below; from right above(u1) or below(d1)" );
					mnew = this.doSplit(mcur, v1, v0);
					this.alyTrap(mcur, thisTrap.u1, thisTrap, PNLTRI.FRDN);
					this.alyTrap(mcur, thisTrap.d1, thisTrap, PNLTRI.FRUP);
					this.alyTrap(mnew, thisTrap.u0, thisTrap, PNLTRI.FRDN);
					this.alyTrap(mnew, thisTrap.d0, thisTrap, PNLTRI.FRUP);
				} else {
					// TM_BM(from UP-left, DN-left)
					// console.log( "2 trapezoids above, and 2 below; from left above(u0) or below(d0)" );
					mnew = this.doSplit(mcur, v0, v1);
					this.alyTrap(mcur, thisTrap.u0, thisTrap, PNLTRI.FRDN);
					this.alyTrap(mcur, thisTrap.d0, thisTrap, PNLTRI.FRUP);
					this.alyTrap(mnew, thisTrap.u1, thisTrap, PNLTRI.FRDN);
					this.alyTrap(mnew, thisTrap.d1, thisTrap, PNLTRI.FRUP);
				}
			} else {
				// 2 trapezoids above, and 1 below: only downward cusp above
				if ( thisTrap.loPt == thisTrap.lseg.vTo.pt ) {
					// 2 trapezoids above, and 1 below, loPt to the left
					v0 = thisTrap.u0.rseg.vFrom;
					v1 = thisTrap.lseg.snext.vFrom;
					thisTrap.monoDiag = PNLTRI.TRAP_TM_BL;
					if ( ( inDirection == PNLTRI.FRUP ) && ( thisTrap.u0 == fromTrap ) ) {
						// TM_BL(from UP-left)
						// console.log( "2 trapezoids above, and 1 below, loPt to the left; from left above(u0)" );
						mnew = this.doSplit(mcur, v1, v0);
						this.alyTrap(mnew, thisTrap.d0, thisTrap, PNLTRI.FRUP);
						this.alyTrap(mnew, thisTrap.u1, thisTrap, PNLTRI.FRDN);
						this.alyTrap(mnew, thisTrap.d1, thisTrap, PNLTRI.FRUP);
					} else {
						// TM_BL(from UP-right, DN)
						// console.log( "2 trapezoids above, and 1 below, loPt to the left; from right above(u1) or below(d0)" );		// TODO, beides denkbar?
						mnew = this.doSplit(mcur, v0, v1);
						this.alyTrap(mcur, thisTrap.u1, thisTrap, PNLTRI.FRDN);
						this.alyTrap(mcur, thisTrap.d0, thisTrap, PNLTRI.FRUP);
						this.alyTrap(mcur, thisTrap.d1, thisTrap, PNLTRI.FRUP);
						this.alyTrap(mnew, thisTrap.u0, thisTrap, PNLTRI.FRDN);
					}
				} else {
					// 2 trapezoids above, and 1 below, loPt to the right
					v0 = thisTrap.rseg.vFrom;
					v1 = thisTrap.u0.rseg.vFrom;	
					thisTrap.monoDiag = PNLTRI.TRAP_TM_BR;
					if ( ( inDirection == PNLTRI.FRUP ) && (thisTrap.u1 == fromTrap) ) {
						// TM_BR(from UP-right)
						// console.log( "2 trapezoids above, and 1 below, loPt to the right; from right above(u1)" );
						mnew = this.doSplit(mcur, v1, v0);
						this.alyTrap(mnew, thisTrap.d1, thisTrap, PNLTRI.FRUP);
						this.alyTrap(mnew, thisTrap.d0, thisTrap, PNLTRI.FRUP);
						this.alyTrap(mnew, thisTrap.u0, thisTrap, PNLTRI.FRDN);
					} else {
						// TM_BR(from UP-left, DN)
						// console.log( "2 trapezoids above, and 1 below, loPt to the right; from left above(u0) or below(d0)" );		// TODO, beides denkbar?
						mnew = this.doSplit(mcur, v0, v1);
						this.alyTrap(mcur, thisTrap.u0, thisTrap, PNLTRI.FRDN);
						this.alyTrap(mcur, thisTrap.d0, thisTrap, PNLTRI.FRUP);
						this.alyTrap(mcur, thisTrap.d1, thisTrap, PNLTRI.FRUP);
						this.alyTrap(mnew, thisTrap.u1, thisTrap, PNLTRI.FRDN);
					}
				}
			}
		} else if ( thisTrap.d0 && thisTrap.d1 ) {
			// 1 trapezoid above, 2 below
			if ( thisTrap.hiPt == thisTrap.lseg.vFrom.pt ) {
				// 1 trapezoid above, 2 below, hiPt to the left
				v0 = thisTrap.d1.lseg.vFrom;		// left seg of the right neighbor below: low of diag
				v1 = thisTrap.lseg.vFrom;		// hiPt
				thisTrap.monoDiag = PNLTRI.TRAP_TL_BM;
				if ( !( ( inDirection == PNLTRI.FRDN ) && ( thisTrap.d0 == fromTrap ) ) ) {
					// TL_BM(from UP, DN-right)
					// console.log( "1 trapezoid above, 2 below, diag: hiPt(left)->loPt(middle)" );
					mnew = this.doSplit( mcur, v1, v0 );
					this.alyTrap( mcur, thisTrap.u1, thisTrap, PNLTRI.FRDN );
					this.alyTrap( mcur, thisTrap.d1, thisTrap, PNLTRI.FRUP );
					this.alyTrap( mcur, thisTrap.u0, thisTrap, PNLTRI.FRDN );
					this.alyTrap( mnew, thisTrap.d0, thisTrap, PNLTRI.FRUP );
				} else {
					// TL_BM(from DN-left)
					// console.log( "1 trapezoid above, 2 below, from down left; diag: loPt(middle)->hiPt(left)" );
					mnew = this.doSplit( mcur, v0, v1 );
					this.alyTrap( mnew, thisTrap.u0, thisTrap, PNLTRI.FRDN );
					this.alyTrap( mnew, thisTrap.u1, thisTrap, PNLTRI.FRDN );
					this.alyTrap( mnew, thisTrap.d1, thisTrap, PNLTRI.FRUP );	      
				}
			} else {
				// 1 trapezoid above, 2 below, hiPt to the right
				v0 = thisTrap.d1.lseg.vFrom;
				v1 = thisTrap.rseg.snext.vFrom;
				thisTrap.monoDiag = PNLTRI.TRAP_TR_BM;	    
				if ( ( inDirection == PNLTRI.FRDN ) && ( thisTrap.d1 == fromTrap ) ) {
					// TR_BM(from DN-right)
					// console.log( "1 trapezoid above, 2 below, hiPt to the right; from right below(d1)" );
					mnew = this.doSplit(mcur, v1, v0);
					this.alyTrap(mnew, thisTrap.u1, thisTrap, PNLTRI.FRDN);
					this.alyTrap(mnew, thisTrap.u0, thisTrap, PNLTRI.FRDN);
					this.alyTrap(mnew, thisTrap.d0, thisTrap, PNLTRI.FRUP);
				} else {
					// TR_BM(from UP, DN-left)
					// console.log( "1 trapezoid above, 2 below, hiPt to the right; from left below(d0) or above(u0)" );
					mnew = this.doSplit(mcur, v0, v1);
					this.alyTrap(mcur, thisTrap.u0, thisTrap, PNLTRI.FRDN);
					this.alyTrap(mcur, thisTrap.d0, thisTrap, PNLTRI.FRUP);
					this.alyTrap(mcur, thisTrap.u1, thisTrap, PNLTRI.FRDN);
					this.alyTrap(mnew, thisTrap.d1, thisTrap, PNLTRI.FRUP);
				}
			}
		} else {
			// 1 trapezoid above, 1 below
			if ( ( thisTrap.hiPt == thisTrap.lseg.vFrom.pt ) &&
				 ( thisTrap.loPt == thisTrap.rseg.vFrom.pt ) ) {
				v0 = thisTrap.rseg.vFrom;
				v1 = thisTrap.lseg.vFrom;
				thisTrap.monoDiag = PNLTRI.TRAP_TL_BR;
				if ( inDirection == PNLTRI.FRUP ) {
					// TL_BR(from UP)
					// console.log( "1 trapezoid above, 1 below; diag: hiPt.left->loPt.right (in from above)" );
					mnew = this.doSplit( mcur, v1, v0 );
					this.alyTrap( mnew, thisTrap.d1, thisTrap, PNLTRI.FRUP );
					this.alyTrap( mnew, thisTrap.d0, thisTrap, PNLTRI.FRUP );
				} else {
					// TL_BR(from DN)
					// console.log( "1 trapezoid above, 1 below; diag: loPt.right->hiPt.left (in from below)" );
					mnew = this.doSplit( mcur, v0, v1 );
					this.alyTrap( mnew, thisTrap.u0, thisTrap, PNLTRI.FRDN );
					this.alyTrap( mnew, thisTrap.u1, thisTrap, PNLTRI.FRDN );
				}
			} else if (	(thisTrap.hiPt == thisTrap.rseg.vTo.pt) &&
						(thisTrap.loPt == thisTrap.lseg.vTo.pt) ) {
				v0 = thisTrap.rseg.snext.vFrom;
				v1 = thisTrap.lseg.snext.vFrom;
				thisTrap.monoDiag = PNLTRI.TRAP_TR_BL;
				if ( inDirection == PNLTRI.FRUP ) {
					// TR_BL(from UP)
					// console.log( "1 trapezoid above, 1 below; diag: loPt.left->hiPt.right (in from above)" );
					mnew = this.doSplit(mcur, v1, v0);
					this.alyTrap(mnew, thisTrap.d1, thisTrap, PNLTRI.FRUP);
					this.alyTrap(mnew, thisTrap.d0, thisTrap, PNLTRI.FRUP);
				} else {
					// TR_BL(from DN)
					// console.log( "1 trapezoid above, 1 below; diag: hiPt.right->loPt.left (in from below)" );
					mnew = this.doSplit(mcur, v0, v1);
					this.alyTrap(mnew, thisTrap.u0, thisTrap, PNLTRI.FRDN);
					this.alyTrap(mnew, thisTrap.u1, thisTrap, PNLTRI.FRDN);
				}
			} else {
				// TL_BL, TR_BR
				// console.log( "1 trapezoid above, 1 below; no split possible" );
				thisTrap.monoDiag = PNLTRI.TRAP_NOSPLIT;
				if ( inDirection == PNLTRI.FRUP ) {
					this.alyTrap( mcur, thisTrap.d0, thisTrap, PNLTRI.FRUP );
					this.alyTrap( mcur, thisTrap.d1, thisTrap, PNLTRI.FRUP );
				} else {
					this.alyTrap( mcur, thisTrap.u0, thisTrap, PNLTRI.FRDN );
					this.alyTrap( mcur, thisTrap.u1, thisTrap, PNLTRI.FRDN );
				}
			}
		}	// end else: 1 trapezoid above, 1 below
	},

	
};

